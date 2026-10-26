// AI Provider types and interfaces — TAD §5.2
// Every AI provider (Gemini, OpenAI, Stability, etc.) implements these interfaces.
// Switching providers is a config change, not a code change.

import { type AspectRatio, type BrandProfile, type Message, type PosterSpec, type Attachment } from "@/types/database";

// ─── Reference Images & Multimodal Parts ────────────────────────

export interface ReferenceImageInput {
  storagePath?: string;
  signedUrl?: string;
  dataBase64?: string;
  mimeType: string;
  label?: string;
  role?: "logo" | "base_photo" | "supplementary" | "style_reference";
}

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
  referenceImages?: ReferenceImageInput[];
  posterSpec?: PosterSpec;
}

export interface ImageGenerationResponse {
  image: Buffer;
  format: "png" | "jpg" | "webp" | "svg" | "svg+xml";
  metadata: {
    provider: string;
    model: string;
    inferenceTimeMs: number;
    estimatedCostUsd: number;
    finishReason?: string;
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
  currentSpec?: PosterSpec | null;
  attachments?: Attachment[];
  referenceImages?: ReferenceImageInput[];
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
  updatedSpec?: PosterSpec;
}

export interface OrchestratorProvider {
  readonly name: string;
  orchestrate(req: OrchestratorRequest): Promise<OrchestratorResponse>;
}
