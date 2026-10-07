// AI provider configuration — TAD §5.3
// Switching from Gemini (dev) to OpenAI (prod) is an env var change.

export const aiConfig = {
  orchestrator: {
    provider: (process.env.ORCHESTRATOR_PROVIDER || "gemini") as "gemini" | "openai",
    model: process.env.ORCHESTRATOR_MODEL || "gemini-2.0-flash",
  },
  imageGenerator: {
    provider: (process.env.IMAGE_PROVIDER || "gemini") as "gemini" | "openai" | "stability",
    model: process.env.IMAGE_MODEL || "gemini-3.1-flash-lite-image",
    quality: (process.env.IMAGE_QUALITY || "medium") as "low" | "medium" | "high",
  },
} as const;
