// Provider Factory — TAD §5.3
// Creates the correct provider based on config. Switching is an env var change.

import { aiConfig } from "@/lib/ai/config";
import type { ImageGeneratorProvider, OrchestratorProvider } from "@/lib/ai/types";
import { GeminiImageProvider, GeminiOrchestratorProvider } from "@/lib/ai/providers/gemini";
import { OpenAIImageProvider, OpenAIOrchestratorProvider } from "@/lib/ai/providers/openai";

let imageProviderInstance: ImageGeneratorProvider | null = null;
let orchestratorProviderInstance: OrchestratorProvider | null = null;

export function getImageProvider(): ImageGeneratorProvider {
  if (imageProviderInstance) return imageProviderInstance;

  switch (aiConfig.imageGenerator.provider) {
    case "gemini":
      imageProviderInstance = new GeminiImageProvider(aiConfig.imageGenerator.model);
      break;
    case "openai":
      imageProviderInstance = new OpenAIImageProvider();
      break;
    default:
      imageProviderInstance = new GeminiImageProvider();
      break;
  }

  return imageProviderInstance;
}

export function getOrchestratorProvider(): OrchestratorProvider {
  if (orchestratorProviderInstance) return orchestratorProviderInstance;

  switch (aiConfig.orchestrator.provider) {
    case "openai":
      orchestratorProviderInstance = new OpenAIOrchestratorProvider();
      break;
    case "gemini":
      orchestratorProviderInstance = new GeminiOrchestratorProvider(aiConfig.orchestrator.model);
      break;
    default:
      orchestratorProviderInstance = new GeminiOrchestratorProvider();
      break;
  }

  return orchestratorProviderInstance;
}
