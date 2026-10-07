// Database types generated from Supabase schema (TAD §4.1)

export type AspectRatio = "1:1" | "9:16" | "16:9" | "3:4" | "2:1" | "custom";

export type FormatPreset =
  | "instagram_post"
  | "instagram_story"
  | "facebook_post"
  | "linkedin_post"
  | "youtube_thumbnail"
  | "poster_flyer"
  | "business_card"
  | "wide_banner"
  | "custom";

export type ToneOfVoice =
  | "playful"
  | "professional"
  | "bold"
  | "minimalist"
  | "warm"
  | "casual"
  | "elegant"
  | "friendly";

export type LogoPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center-watermark";

export type MessageRole = "user" | "assistant" | "system";

export type PlanTier = "free" | "pro" | "business";

// ─── Table Types ────────────────────────────────────────────────

export interface Tenant {
  id: string;
  email: string;
  active_brand_profile_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrandProfile {
  id: string;
  tenant_id: string;
  brand_name: string;
  logo_url: string | null;
  primary_colour: string;
  secondary_colours: string[];
  typography: string | null;
  brand_description: string;
  industry: string;
  tone_of_voice: ToneOfVoice[];
  target_audience: string | null;
  guidelines_doc_url: string | null;
  sample_asset_urls: string[];
  social_handles: Record<string, string>;
  auto_include_logo: boolean;
  logo_position: LogoPosition;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  tenant_id: string;
  brand_profile_id: string;
  title: string;
  format_preset: FormatPreset;
  aspect_ratio: AspectRatio;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  tenant_id: string;
  brand_profile_id: string;
  role: MessageRole;
  content: string;
  image_url: string | null;
  asset_id: string | null;
  metadata: MessageMetadata | null;
  created_at: string;
}

export interface MessageMetadata {
  provider?: string;
  model?: string;
  inference_time_ms?: number;
  estimated_cost_usd?: number;
  prompt_sent?: string;
  format_preset?: FormatPreset;
  aspect_ratio?: AspectRatio;
  storage_path?: string | null;
  error?: string;
  [key: string]: any;
}

export interface Asset {
  id: string;
  tenant_id: string;
  brand_profile_id: string;
  message_id: string | null;
  storage_path: string;
  public_url: string;
  format: "png" | "jpg" | "webp";
  width: number;
  height: number;
  aspect_ratio: AspectRatio;
  format_preset: FormatPreset;
  canva_design_id: string | null;
  canva_edit_url: string | null;
  canva_pushed_at: string | null;
  created_at: string;
}

export interface CanvaConnection {
  id: string;
  tenant_id: string;
  brand_profile_id: string;
  access_token_encrypted: string;
  refresh_token_encrypted: string;
  token_expires_at: string;
  canva_user_id: string;
  connected_at: string;
}

export interface UsageCounter {
  id: string;
  tenant_id: string;
  brand_profile_id: string;
  generations_this_period: number;
  period_start: string;
  period_end: string;
  generation_limit: number;
  plan_tier: PlanTier;
}
