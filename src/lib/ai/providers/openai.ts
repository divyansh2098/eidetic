// OpenAI Image Provider — TAD §5.2
// Production image generation provider with resilient fallback

import OpenAI from "openai";
import type {
  ImageGeneratorProvider,
  ImageGenerationRequest,
  ImageGenerationResponse,
  OrchestratorProvider,
  OrchestratorRequest,
  OrchestratorResponse,
} from "@/lib/ai/types";

function getOpenAIKey(): string | undefined {
  return (
    process.env.OPENAI_API_KEY ||
    (process.env.IMAGE_GENERATOR_PROVIDER?.startsWith("sk-")
      ? process.env.IMAGE_GENERATOR_PROVIDER
      : undefined) ||
    (process.env.ORCHESTRATOR_PROVIDER?.startsWith("sk-")
      ? process.env.ORCHESTRATOR_PROVIDER
      : undefined)
  );
}

export class OpenAIImageProvider implements ImageGeneratorProvider {
  readonly name = "openai";
  private client: OpenAI | null = null;

  constructor() {
    const apiKey = getOpenAIKey();
    if (apiKey) {
      this.client = new OpenAI({ apiKey });
    }
  }

  async generate(req: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const startTime = Date.now();

    if (!this.client) {
      throw new Error("OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment.");
    }

    try {
      const response = await this.client.images.generate({
        model: "gpt-image-1",
        prompt: req.prompt,
        n: 1,
      });

      const imageData = response.data?.[0]?.b64_json;
      if (imageData) {
        return {
          image: Buffer.from(imageData, "base64"),
          format: "png",
          metadata: {
            provider: "openai",
            model: "gpt-image-1",
            inferenceTimeMs: Date.now() - startTime,
            estimatedCostUsd: this.estimateCost(req.quality),
          },
        };
      }

      const imageUrl = response.data?.[0]?.url;
      if (imageUrl) {
        const fetched = await fetch(imageUrl);
        const arrayBuffer = await fetched.arrayBuffer();
        return {
          image: Buffer.from(arrayBuffer),
          format: "png",
          metadata: {
            provider: "openai",
            model: "gpt-image-1",
            inferenceTimeMs: Date.now() - startTime,
            estimatedCostUsd: this.estimateCost(req.quality),
          },
        };
      }

      throw new Error("No image data returned from OpenAI API.");
    } catch (err: any) {
      console.error("[OpenAI Provider] Image generation failed:", err);
      throw new Error(`OpenAI Image Generation Failed: ${err.message || String(err)}`);
    }
  }

  private estimateCost(quality: string): number {
    switch (quality) {
      case "low":
        return 0.011;
      case "medium":
        return 0.042;
      case "high":
        return 0.167;
      default:
        return 0.042;
    }
  }
}

export class OpenAIOrchestratorProvider implements OrchestratorProvider {
  readonly name = "openai";
  private client: OpenAI | null = null;
  private model: string;

  constructor(model: string = "gpt-4o-mini") {
    this.model = model;
    const apiKey = getOpenAIKey();
    if (apiKey) {
      this.client = new OpenAI({ apiKey });
    }
  }

  async orchestrate(req: OrchestratorRequest): Promise<OrchestratorResponse> {
    if (this.client) {
      try {
        const response = await this.client.chat.completions.create({
          model: this.model,
          messages: [
            {
              role: "system",
              content: `You are Eidetic AI, an expert brand graphic design orchestrator. Produce visual generation prompt adhering strictly to brand colors (${req.brandProfile.primary_colour}), typography, and tone. Return clean JSON with "chatResponse" and "imagePrompt".`,
            },
            {
              role: "user",
              content: req.userMessage,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
        });

        const content = response.choices[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          return {
            chatResponse:
              parsed.chatResponse ||
              `Generated graphic for ${req.brandProfile.brand_name} formatted for ${req.outputConstraints.formatPreset}.`,
            imagePrompt: parsed.imagePrompt || req.userMessage,
          };
        }
      } catch (err: any) {
        console.warn("[OpenAI Orchestrator] API failed, falling back to local orchestrator:", err.message);
      }
    }

    return {
      chatResponse: `Here is a custom graphic for ${req.brandProfile.brand_name} formatted for ${req.outputConstraints.formatPreset} (${req.outputConstraints.aspectRatio}). The aesthetic adheres to your ${req.brandProfile.tone_of_voice.join(", ")} tone guidelines.`,
      imagePrompt: `${req.userMessage}, featuring ${req.brandProfile.brand_name} visual identity with primary color ${req.brandProfile.primary_colour}, minimalist Scandinavian industrial aesthetic, high quality commercial design`,
    };
  }
}
