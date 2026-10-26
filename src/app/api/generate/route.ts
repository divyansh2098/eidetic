import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/ai/prompt-builder";
import { getPresetByKey } from "@/lib/utils/format-presets";
import { getOrchestratorProvider, getImageProvider } from "@/lib/ai/providers";
import { FormatPreset, BrandProfile, AspectRatio, Asset } from "@/types/database";
import { ReferenceImageInput } from "@/lib/ai/types";
import { uploadAssetImage, saveAsset } from "@/lib/supabase/service";
import { isUUID, generateUUID } from "@/lib/utils/uuid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = (body.prompt || body.userPrompt || "").trim();
    const brandProfile: BrandProfile = body.brandProfile;
    const formatPreset: FormatPreset = body.formatPreset || "instagram_post";
    const customRatio: string | undefined = body.customRatio || body.customAspectRatio;
    const sessionId: string | undefined = body.sessionId || body.conversationId;
    const messageId: string | undefined = body.messageId;
    const attachments: Array<{ data: string; mimeType?: string; name?: string }> = body.attachments || [];

    if (!prompt && (!attachments || attachments.length === 0)) {
      return NextResponse.json({ error: "Missing prompt or attachments" }, { status: 400 });
    }

    if (!brandProfile) {
      return NextResponse.json({ error: "Missing brandProfile" }, { status: 400 });
    }

    const presetConfig = getPresetByKey(formatPreset);
    const targetAspectRatio: AspectRatio =
      formatPreset === "custom" && customRatio
        ? "custom"
        : (presetConfig.aspectRatio as AspectRatio);

    // Build reference images array for multimodal pipeline
    const referenceImages: ReferenceImageInput[] = attachments.map((att, idx) => ({
      dataBase64: (att.data || "").replace(/^data:[^;]+;base64,/, ""),
      mimeType: att.mimeType || "image/png",
      label: att.name || `Reference Image ${idx + 1}`,
      role: "supplementary",
    }));

    if (brandProfile.auto_include_logo && brandProfile.logo_url) {
      try {
        let base64Data = "";
        let mime = "image/png";

        if (brandProfile.logo_url.startsWith("data:")) {
          base64Data = brandProfile.logo_url.replace(/^data:[^;]+;base64,/, "");
          mime = brandProfile.logo_url.split(";")[0].replace("data:", "") || "image/png";
        } else if (brandProfile.logo_url.startsWith("http://") || brandProfile.logo_url.startsWith("https://")) {
          const logoRes = await fetch(brandProfile.logo_url);
          if (logoRes.ok) {
            const arrayBuf = await logoRes.arrayBuffer();
            base64Data = Buffer.from(arrayBuf).toString("base64");
            mime = logoRes.headers.get("content-type") || "image/png";
          }
        }

        if (base64Data) {
          referenceImages.unshift({
            dataBase64: base64Data,
            mimeType: mime,
            label: `${brandProfile.brand_name} Official Logo`,
            role: "logo",
          });
        }
      } catch (logoErr) {
        console.warn("[/api/generate] Failed to fetch or encode brand logo image:", logoErr);
      }
    }

    // 1. Build the 5-layer system prompt
    const systemPromptSnapshot = buildSystemPrompt(brandProfile, presetConfig, {
      customAspectRatio: customRatio,
    });

    // 2. Run Orchestration (synthesize brand DNA + user request into concrete prompt)
    const orchestrator = getOrchestratorProvider();
    const orchestrated = await orchestrator.orchestrate({
      userMessage: prompt || "Generate an on-brand graphic incorporating the attached reference image(s).",
      brandProfile,
      conversationHistory: [],
      systemPrompt: systemPromptSnapshot,
      referenceImages,
      outputConstraints: {
        aspectRatio: targetAspectRatio,
        formatPreset: presetConfig.label,
        width: presetConfig.width,
        height: presetConfig.height,
        includeLogoInstructions: brandProfile.auto_include_logo,
        logoPosition: brandProfile.logo_position,
      },
    });

    // 3. Guarantee that the brand logo and placement directive are strictly included in final prompt
    const logoPositionText = (brandProfile.logo_position || "bottom-right").replace(/-/g, " ");
    let finalImagePrompt = orchestrated.imagePrompt;

    if (brandProfile.auto_include_logo) {
      const logoDirective = `Prominently feature the official company logo for ${brandProfile.brand_name} cleanly positioned in the ${logoPositionText} corner of the composition.`;
      if (!finalImagePrompt.toLowerCase().includes("logo")) {
        finalImagePrompt = `${finalImagePrompt.trim()} ${logoDirective}`;
      }
    }

    // Chat display response for image generation should only have the image, not the prompt
    const chatDisplayResponse = "";

    // Image Generation Toggle (defaults to active with Gemini)
    const SKIP_IMAGE_GENERATION = process.env.SKIP_IMAGE_GENERATION === "true";

    if (SKIP_IMAGE_GENERATION) {
      return NextResponse.json({
        success: true,
        chatResponse: chatDisplayResponse,
        imagePrompt: finalImagePrompt,
        imageUrl: null,
        storagePath: null,
        assetId: null,
        systemPromptSnapshot,
        metadata: {
          provider: orchestrator.name || "gemini",
          model: "prompt-preview",
          inference_time_ms: 0,
          estimated_cost_usd: 0,
          format_preset: formatPreset,
          aspect_ratio: targetAspectRatio,
          prompt_sent: finalImagePrompt,
          system_prompt_snapshot: systemPromptSnapshot,
        },
      });
    }

    // 4. Generate Graphic via Selected Provider (No SVG fallback)
    const imageGenerator = getImageProvider();
    console.log(`\n================== [IMAGE GENERATION PROMPT] ==================\n${finalImagePrompt}\nLogo Placed: ${brandProfile.auto_include_logo ? logoPositionText : "Disabled"}\n===============================================================\n`);
    let generationResult;
    try {
      generationResult = await imageGenerator.generate({
        prompt: finalImagePrompt,
        aspectRatio: targetAspectRatio,
        width: presetConfig.width,
        height: presetConfig.height,
        quality: "medium",
        brandProfile,
        formatPreset,
        referenceImages,
      });
    } catch (imageErr: any) {
      console.error("[/api/generate] Graphic generation failed:", imageErr);
      const errorMessage = imageErr.message || "Failed to generate image.";
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          chatResponse: chatDisplayResponse,
          systemPromptSnapshot,
        },
        { status: 502 }
      );
    }

    // 5. Encode image buffer as base64 data URI
    const mimeType = `image/${generationResult.format || "png"}`;
    const fileExt = generationResult.format || "png";
    const base64Image = `data:${mimeType};base64,${generationResult.image.toString("base64")}`;

    // 6. Upload to Storage Pipeline (Supabase brand-assets bucket)
    const assetId = generateUUID();
    const safeTenantId = isUUID(brandProfile.tenant_id) ? brandProfile.tenant_id : generateUUID();
    const safeBrandId = isUUID(brandProfile.id) ? brandProfile.id : generateUUID();
    const safeMessageId = messageId && isUUID(messageId) ? messageId : null;
    const safeSessionId = sessionId && isUUID(sessionId) ? sessionId : null;

    let imageUrl = base64Image;
    let storagePath: string | null = null;

    try {
      const uploadResult = await uploadAssetImage(
        generationResult.image,
        safeTenantId,
        `${assetId}.${fileExt}`,
        mimeType
      );

      if (uploadResult?.publicUrl) {
        imageUrl = uploadResult.publicUrl;
        storagePath = uploadResult.storagePath;
      }
    } catch (uploadError) {
      console.warn("Storage upload pipeline fallback to base64:", uploadError);
    }

    // 7. Atomically persist Asset to Database (generated_assets table)
    const finalStoragePath = storagePath || `tenants/${safeTenantId}/${assetId}.${fileExt}`;

    const newAssetRecord: Asset = {
      id: assetId,
      tenant_id: safeTenantId,
      brand_profile_id: safeBrandId,
      message_id: safeMessageId,
      storage_path: finalStoragePath,
      public_url: imageUrl,
      format: (fileExt as "png" | "jpg" | "webp") || "png",
      width: presetConfig.width,
      height: presetConfig.height,
      aspect_ratio: targetAspectRatio,
      format_preset: formatPreset,
      canva_design_id: null,
      canva_edit_url: null,
      canva_pushed_at: null,
      created_at: new Date().toISOString(),
    };

    try {
      await saveAsset(newAssetRecord, {
        promptUsed: finalImagePrompt || prompt,
        systemPromptSnapshot,
        modelProvider: generationResult.metadata.provider,
        modelName: generationResult.metadata.model,
        costEstimate: generationResult.metadata.estimatedCostUsd,
        sessionId: safeSessionId || undefined,
      });
    } catch (dbError) {
      console.warn("Server-side saveAsset to DB warning:", dbError);
    }

    return NextResponse.json({
      success: true,
      chatResponse: chatDisplayResponse,
      imageUrl,
      storagePath,
      assetId,
      format: fileExt,
      systemPromptSnapshot,
      metadata: {
        provider: generationResult.metadata.provider,
        model: generationResult.metadata.model,
        inference_time_ms: generationResult.metadata.inferenceTimeMs,
        estimated_cost_usd: generationResult.metadata.estimatedCostUsd,
        format_preset: formatPreset,
        aspect_ratio: targetAspectRatio,
        prompt_sent: finalImagePrompt,
        storage_path: storagePath,
        system_prompt_snapshot: systemPromptSnapshot,
      },
    });
  } catch (error: any) {
    console.error("API /api/generate error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate graphic" }, { status: 500 });
  }
}
