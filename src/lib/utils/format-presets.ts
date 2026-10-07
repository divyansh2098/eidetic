// Format presets configuration — maps human-readable labels to aspect ratios and dimensions
// PRD §3.2.2

import { type AspectRatio, type FormatPreset } from "@/types/database";

export interface FormatPresetConfig {
  key: FormatPreset;
  label: string;
  aspectRatio: AspectRatio;
  width: number;
  height: number;
  description: string;
}

export const FORMAT_PRESETS: FormatPresetConfig[] = [
  {
    key: "instagram_post",
    label: "Instagram Post",
    aspectRatio: "1:1",
    width: 1080,
    height: 1080,
    description: "Feed posts, product showcases",
  },
  {
    key: "instagram_story",
    label: "Instagram Story",
    aspectRatio: "9:16",
    width: 1080,
    height: 1920,
    description: "Stories, reels, TikTok",
  },
  {
    key: "facebook_post",
    label: "Facebook Post",
    aspectRatio: "16:9",
    width: 1200,
    height: 630,
    description: "Feed posts, event covers",
  },
  {
    key: "linkedin_post",
    label: "LinkedIn Post",
    aspectRatio: "16:9",
    width: 1200,
    height: 627,
    description: "Professional content",
  },
  {
    key: "youtube_thumbnail",
    label: "YouTube Thumbnail",
    aspectRatio: "16:9",
    width: 1280,
    height: 720,
    description: "Video thumbnails",
  },
  {
    key: "poster_flyer",
    label: "Poster / Flyer",
    aspectRatio: "3:4",
    width: 2480,
    height: 3508,
    description: "Print-ready flyers, brochures",
  },
  {
    key: "business_card",
    label: "Business Card",
    aspectRatio: "16:9",
    width: 1050,
    height: 600,
    description: "Print-ready cards",
  },
  {
    key: "wide_banner",
    label: "Wide Banner",
    aspectRatio: "2:1",
    width: 1200,
    height: 600,
    description: "Email headers, website hero",
  },
  {
    key: "custom",
    label: "Custom",
    aspectRatio: "1:1",
    width: 1080,
    height: 1080,
    description: "Enter any width:height ratio",
  },
];

export function getPresetByKey(key: FormatPreset): FormatPresetConfig {
  return FORMAT_PRESETS.find((p) => p.key === key) ?? FORMAT_PRESETS[0];
}

export function getPresetByLabel(label: string): FormatPresetConfig | undefined {
  return FORMAT_PRESETS.find(
    (p) => p.label.toLowerCase() === label.toLowerCase()
  );
}

/**
 * Parse a custom aspect ratio string like "5:3" into width/height.
 * Returns null if invalid.
 */
export function parseCustomRatio(ratio: string): { width: number; height: number } | null {
  const match = ratio.match(/^(\d+):(\d+)$/);
  if (!match) return null;
  const w = parseInt(match[1], 10);
  const h = parseInt(match[2], 10);
  if (w <= 0 || h <= 0) return null;
  // Scale to a reasonable base dimension
  const baseSize = 1080;
  const scale = w >= h ? baseSize / w : baseSize / h;
  return {
    width: Math.round(w * scale),
    height: Math.round(h * scale),
  };
}
