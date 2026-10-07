// AI Provider types and interfaces — TAD §5.2
// Every AI provider (Gemini, OpenAI, Stability, etc.) implements these interfaces.
// Switching providers is a config change, not a code change.

import { type AspectRatio, type BrandProfile, type Message } from "@/types/database";

// ─── Image Generator ────────────────────────────────────────────

export interface ImageGenerationRequest {
  prompt: string;
  aspectRatio: AspectRatio;
  width: number;
  height: number;
  quality: "low" | "medium" | "high";
  style?: string;
  brandProfile?: BrandProfile;
  formatPreset?: string;
}

export interface ImageGenerationResponse {
  image: Buffer;
  format: "png" | "jpg" | "webp" | "svg" | "svg+xml";
  metadata: {
    provider: string;
    model: string;
    inferenceTimeMs: number;
    estimatedCostUsd: number;
  };
}

export interface ImageGeneratorProvider {
  readonly name: string;
  generate(req: ImageGenerationRequest): Promise<ImageGenerationResponse>;
}

// ─── Orchestrator ───────────────────────────────────────────────

export interface TextOverlay {
  text: string;
  position: "top" | "center" | "bottom";
  style: "heading" | "body" | "tagline";
}

export interface OrchestratorRequest {
  userMessage: string;
  brandProfile: BrandProfile;
  conversationHistory: Pick<Message, "role" | "content">[];
  systemPrompt?: string;
  outputConstraints: {
    aspectRatio: AspectRatio;
    formatPreset: string;
    width: number;
    height: number;
    includeLogoInstructions: boolean;
    logoPosition?: string;
  };
}

export interface OrchestratorResponse {
  imagePrompt: string;
  textOverlays?: TextOverlay[];
  layoutHints?: string;
  chatResponse: string;
}

export interface OrchestratorProvider {
  readonly name: string;
  orchestrate(req: OrchestratorRequest): Promise<OrchestratorResponse>;
}
