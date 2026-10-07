// System Prompt Builder — TAD §3.3 / PRD §3.3.1
// Assembles the 5-layer system prompt dynamically per tenant and conversation.

import type { BrandProfile } from "@/types/database";
import type { FormatPresetConfig } from "@/lib/utils/format-presets";

/**
 * Build the complete system prompt for the orchestrator LLM.
 * This is the critical differentiator — it's what makes every output "on-brand".
 */
export function buildSystemPrompt(
  brandProfile: BrandProfile,
  formatPreset: FormatPresetConfig,
  options?: {
    customAspectRatio?: string;
  }
): string {
  return [
    buildLayer1_PlatformInstructions(),
    buildLayer2_BrandIdentity(brandProfile),
    buildLayer3_OutputConstraints(brandProfile, formatPreset, options),
  ].join("\n\n---\n\n");
}

// ─── LAYER 1: Platform Instructions ────────────────────────────

function buildLayer1_PlatformInstructions(): string {
  return `## Your Role
You are Eidetic, an AI graphic design assistant specialising in creating on-brand visual content. Your job is to generate a detailed, structured image generation prompt based on the user's request and the brand identity provided below.

## Rules
1. ALWAYS respect the brand's colour palette, typography, and tone of voice — even if the user's request is vague.
2. Generate a SINGLE, detailed image generation prompt that can be passed to an image generation model.
3. Include specific colour hex codes from the brand palette in your prompt.
4. Describe the layout, composition, and visual hierarchy clearly.
5. If the user asks for text on the image, specify the exact text content, size hierarchy, and placement.
6. NEVER generate offensive, misleading, or trademark-infringing content.
7. Keep your chat response concise — explain what you created and offer to refine.

## Output Format
Respond with a JSON object containing:
- "imagePrompt": A detailed prompt for the image generation model (string)
- "chatResponse": A brief, friendly message to show the user (string)
- "textOverlays": Any text elements to include on the image (array of {text, position, style})`;
}

// ─── LAYER 2: Brand Identity Context ───────────────────────────

function buildLayer2_BrandIdentity(profile: BrandProfile): string {
  const sections: string[] = [
    `## Brand Identity`,
    `- **Brand Name:** ${profile.brand_name}`,
    `- **Description:** ${profile.brand_description}`,
    `- **Industry:** ${profile.industry}`,
    `- **Primary Colour:** ${profile.primary_colour}`,
  ];

  if (profile.secondary_colours.length > 0) {
    sections.push(`- **Secondary Colours:** ${profile.secondary_colours.join(", ")}`);
  }

  if (profile.typography) {
    sections.push(`- **Typography:** ${profile.typography}`);
  }

  if (profile.tone_of_voice.length > 0) {
    sections.push(`- **Tone of Voice:** ${profile.tone_of_voice.join(", ")}`);
  }

  if (profile.target_audience) {
    sections.push(`- **Target Audience:** ${profile.target_audience}`);
  }

  sections.push(
    "",
    "Use these brand elements consistently in every graphic you generate. The colours, tone, and style should be unmistakably this brand."
  );

  return sections.join("\n");
}

// ─── LAYER 3: Output Constraints ───────────────────────────────

function buildLayer3_OutputConstraints(
  profile: BrandProfile,
  formatPreset: FormatPresetConfig,
  options?: { customAspectRatio?: string }
): string {
  const aspectRatio = options?.customAspectRatio ?? formatPreset.aspectRatio;

  const sections: string[] = [
    `## Output Constraints`,
    `- **Format:** ${formatPreset.label}`,
    `- **Aspect Ratio:** ${aspectRatio}`,
    `- **Dimensions:** ${formatPreset.width} × ${formatPreset.height}px`,
    `- **Resolution:** High quality, suitable for digital and print use`,
  ];

  if (profile.auto_include_logo) {
    sections.push(
      `- **Logo:** Include the brand logo at the ${profile.logo_position.replace("-", " ")} of the image`
    );
  }

  sections.push(
    "",
    "Generate the image at the specified aspect ratio. Ensure all text is legible and properly spaced."
  );

  return sections.join("\n");
}
