// Gemini Image & Orchestrator Provider — TAD §5.2
// Uses official Google GenAI JS SDK (@google/genai) with unified API key management

import { GoogleGenAI } from "@google/genai";
import type {
  ImageGeneratorProvider,
  ImageGenerationRequest,
  ImageGenerationResponse,
  OrchestratorProvider,
  OrchestratorRequest,
  OrchestratorResponse,
} from "@/lib/ai/types";

export function getGeminiApiKey(): string | undefined {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    (process.env.ORCHESTRATOR_PROVIDER?.startsWith("AQ") || process.env.ORCHESTRATOR_PROVIDER?.startsWith("AIza")
      ? process.env.ORCHESTRATOR_PROVIDER
      : undefined) ||
    (process.env.IMAGE_GENERATOR_PROVIDER?.startsWith("AQ") || process.env.IMAGE_GENERATOR_PROVIDER?.startsWith("AIza")
      ? process.env.IMAGE_GENERATOR_PROVIDER
      : undefined)
  );
}

export class GeminiImageProvider implements ImageGeneratorProvider {
  readonly name = "gemini";
  private ai: GoogleGenAI | null = null;
  private apiKey: string | undefined;
  private model: string;

  constructor(model: string = "gemini-3.1-flash-lite-image") {
    this.apiKey = getGeminiApiKey();
    if (this.apiKey) {
      this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    }
    this.model = model;
  }

  async generate(req: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const startTime = Date.now();
    const targetModel = this.model || "gemini-3.1-flash-lite-image";

    if (!this.ai) {
      throw new Error("Gemini API key is not configured. Please set GEMINI_API_KEY in your environment.");
    }

    let apiRatio = "1:1";
    if (req.aspectRatio === "9:16") apiRatio = "9:16";
    else if (req.aspectRatio === "16:9") apiRatio = "16:9";
    else if (req.aspectRatio === "3:4") apiRatio = "3:4";
    else if (req.aspectRatio === "2:1") apiRatio = "16:9";

    let lastError: any = null;

    // 1. Primary: Use GoogleGenAI JS Client with ai.interactions.create
    try {
      const interaction = await (this.ai as any).interactions?.create({
        model: targetModel,
        input: req.prompt,
      });

      const generatedImage = interaction?.output_image || interaction?.outputs?.[0]?.image;
      if (generatedImage?.data) {
        return {
          image: Buffer.from(generatedImage.data, "base64"),
          format: "png",
          metadata: {
            provider: "gemini",
            model: targetModel,
            inferenceTimeMs: Date.now() - startTime,
            estimatedCostUsd: 0.0002,
          },
        };
      }
    } catch (interactionErr: any) {
      lastError = interactionErr;
      console.warn(`[GoogleGenAI] ai.interactions.create call skipped or failed:`, interactionErr);
    }

    // 2. Next: Use GoogleGenAI JS Client with ai.models.generateImages
    try {
      const response = await this.ai.models.generateImages({
        model: targetModel,
        prompt: req.prompt,
        config: {
          numberOfImages: 1,
          aspectRatio: apiRatio as any,
          outputMimeType: "image/png",
        },
      });

      const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
      if (imageBytes) {
        return {
          image: Buffer.from(imageBytes, "base64"),
          format: "png",
          metadata: {
            provider: "gemini",
            model: targetModel,
            inferenceTimeMs: Date.now() - startTime,
            estimatedCostUsd: 0.0002,
          },
        };
      }
    } catch (genImagesErr: any) {
      lastError = genImagesErr;
      console.warn(`[GoogleGenAI] ai.models.generateImages call skipped or failed:`, genImagesErr);
    }

    // 3. Next: Use GoogleGenAI JS Client with ai.models.generateContent (responseModalities: ["IMAGE"])
    try {
      const response = await this.ai.models.generateContent({
        model: targetModel,
        contents: req.prompt,
        config: {
          responseModalities: ["IMAGE"] as any,
        },
      });

      const candidate = response.candidates?.[0];
      for (const part of candidate?.content?.parts || []) {
        if ((part as any)?.inlineData?.data) {
          const base64Data = (part as any).inlineData.data;
          const mimeType = (part as any).inlineData.mimeType || "image/png";
          return {
            image: Buffer.from(base64Data, "base64"),
            format: mimeType.includes("webp") ? "webp" : "png",
            metadata: {
              provider: "gemini",
              model: targetModel,
              inferenceTimeMs: Date.now() - startTime,
              estimatedCostUsd: 0.0002,
            },
          };
        }
      }
    } catch (genContentErr: any) {
      lastError = genContentErr;
      console.warn(`[GoogleGenAI] ai.models.generateContent call skipped or failed:`, genContentErr);
    }

    // 4. Fallback: Imagen 3 via GoogleGenAI JS Client
    try {
      const response = await this.ai.models.generateImages({
        model: "imagen-3.0-generate-002",
        prompt: req.prompt,
        config: {
          numberOfImages: 1,
          aspectRatio: apiRatio as any,
          outputMimeType: "image/png",
        },
      });

      const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
      if (imageBytes) {
        return {
          image: Buffer.from(imageBytes, "base64"),
          format: "png",
          metadata: {
            provider: "gemini",
            model: "imagen-3.0-generate-002",
            inferenceTimeMs: Date.now() - startTime,
            estimatedCostUsd: 0.03,
          },
        };
      }
    } catch (imagenErr: any) {
      lastError = imagenErr;
      console.warn(`[GoogleGenAI] Imagen 3 fallback call failed:`, imagenErr);
    }

    // Extract cleanest error message
    const rawMsg =
      lastError?.message ||
      lastError?.error?.message ||
      (typeof lastError === "string" ? lastError : null) ||
      "Image generation model did not return any image data.";

    throw new Error(`Gemini Image Generation Failed: ${rawMsg}`);
  }
}

export class GeminiOrchestratorProvider implements OrchestratorProvider {
  readonly name = "gemini";
  private ai: GoogleGenAI | null = null;
  private model: string;

  constructor(model: string = "gemini-2.5-flash") {
    const apiKey = getGeminiApiKey();
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    }
    this.model = model;
  }

  async orchestrate(req: OrchestratorRequest): Promise<OrchestratorResponse> {
    if (this.ai) {
      try {
        const prompt = req.systemPrompt
          ? `${req.systemPrompt}

## Current User Request:
"${req.userMessage}"

Respond strictly in valid JSON with:
{
  "imagePrompt": "Detailed photographic/graphic prompt with color palette, composition, and visual parameters",
  "chatResponse": "Concise natural explanation of design choices to display to the user",
  "layoutHints": "Composition and negative space guidelines"
}`
          : `You are Eidetic's Brand Graphic Orchestrator.
Brand: ${req.brandProfile.brand_name} (${req.brandProfile.brand_description})
Primary colour: ${req.brandProfile.primary_colour}
Tone: ${req.brandProfile.tone_of_voice.join(", ")}
Target output format: ${req.outputConstraints.formatPreset} (${req.outputConstraints.aspectRatio})
User request: "${req.userMessage}"

Respond in JSON with:
{
  "imagePrompt": "Detailed photographic/graphic prompt with color palette and composition",
  "chatResponse": "Concise natural explanation of the design choices",
  "layoutHints": "Composition and negative space guidelines"
}`;

        const response = await this.ai.models.generateContent({
          model: this.model,
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });

        const text = response.text || "";
        const parsed = JSON.parse(text);
        return {
          imagePrompt: parsed.imagePrompt || req.userMessage,
          chatResponse:
            parsed.chatResponse ||
            `I've prepared a ${req.outputConstraints.formatPreset} aligned with ${req.brandProfile.brand_name}'s aesthetic.`,
          layoutHints: parsed.layoutHints,
        };
      } catch (err) {
        console.warn("[GoogleGenAI Orchestrator] API call failed or key not set, using smart template:", err);
      }
    }

    // High quality deterministic fallback when in dev mode
    return {
      imagePrompt: `A high-end, premium brand graphic for ${req.brandProfile.brand_name}. Concept: ${req.userMessage}. Palette featuring primary ${req.brandProfile.primary_colour} and secondary tones. Aspect ratio ${req.outputConstraints.aspectRatio}, clean typography, sleek lighting, studio quality rendering.`,
      chatResponse: `Here is a custom graphic for ${req.brandProfile.brand_name} formatted for ${req.outputConstraints.formatPreset} (${req.outputConstraints.aspectRatio}). The aesthetic adheres to your ${req.brandProfile.tone_of_voice.join(", ")} tone guidelines.`,
      layoutHints: "Centered hero subject with clean negative space for copy and bottom-right logo placement.",
    };
  }
}
