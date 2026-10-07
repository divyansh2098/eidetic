import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/ai/prompt-builder";
import { getPresetByKey } from "@/lib/utils/format-presets";
import { getOrchestratorProvider, getImageProvider } from "@/lib/ai/providers";
import { FormatPreset, BrandProfile, AspectRatio, Asset } from "@/types/database";
import { uploadAssetImage, saveAsset } from "@/lib/supabase/service";
import { isUUID, generateUUID } from "@/lib/utils/uuid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt,
      brandProfile,
      formatPreset = "instagram_post",
      customRatio,
      sessionId,
      messageId,
    }: {
      prompt: string;
      brandProfile: BrandProfile;
      formatPreset: FormatPreset;
      customRatio?: string;
      sessionId?: string;
      messageId?: string;
    } = body;

    if (!prompt || !brandProfile) {
      return NextResponse.json({ error: "Missing prompt or brandProfile" }, { status: 400 });
    }

    const presetConfig = getPresetByKey(formatPreset);
    const targetAspectRatio: AspectRatio =
      formatPreset === "custom" && customRatio
        ? "custom"
        : (presetConfig.aspectRatio as AspectRatio);

    // 1. Build the 5-layer system prompt
    const systemPromptSnapshot = buildSystemPrompt(brandProfile, presetConfig, {
      customAspectRatio: customRatio,
    });

    // 2. Run Orchestration (synthesize brand DNA + user request into concrete prompt)
    const orchestrator = getOrchestratorProvider();
    const orchestrated = await orchestrator.orchestrate({
      userMessage: prompt,
      brandProfile,
      conversationHistory: [],
      systemPrompt: systemPromptSnapshot,
      outputConstraints: {
        aspectRatio: targetAspectRatio,
        formatPreset: presetConfig.label,
        width: presetConfig.width,
        height: presetConfig.height,
        includeLogoInstructions: brandProfile.auto_include_logo,
        logoPosition: brandProfile.logo_position,
      },
    });

    // Chat display response for image generation should only have the image, not the prompt
    const chatDisplayResponse = "";

    // 3. Image Generation Toggle (defaults to active with Gemini)
    const SKIP_IMAGE_GENERATION = process.env.SKIP_IMAGE_GENERATION === "true";

    if (SKIP_IMAGE_GENERATION) {
      return NextResponse.json({
        success: true,
        chatResponse: chatDisplayResponse,
        imagePrompt: orchestrated.imagePrompt,
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
          prompt_sent: orchestrated.imagePrompt,
          system_prompt_snapshot: systemPromptSnapshot,
        },
      });
    }

    // 4. Generate Graphic via Selected Provider (No SVG fallback)
    const imageGenerator = getImageProvider();
    let generationResult;
    try {
      generationResult = await imageGenerator.generate({
        prompt: orchestrated.imagePrompt,
        aspectRatio: targetAspectRatio,
        width: presetConfig.width,
        height: presetConfig.height,
        quality: "medium",
        brandProfile,
        formatPreset,
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
        promptUsed: orchestrated.imagePrompt || prompt,
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
        prompt_sent: orchestrated.imagePrompt,
        storage_path: storagePath,
        system_prompt_snapshot: systemPromptSnapshot,
      },
    });
  } catch (error: any) {
    console.error("API /api/generate error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate graphic" }, { status: 500 });
  }
}
