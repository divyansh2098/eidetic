// Supabase Data Service Layer — TAD §4 & §7
// Bridges client/server components to Supabase with resilient offline/demo fallback

import { createClient } from "./client";
import { BrandProfile, Asset, Message, MessageRole, Conversation, Tenant } from "@/types/database";
import { isUUID, generateUUID } from "@/lib/utils/uuid";

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  return Boolean(
    url &&
    key &&
    !url.includes("mock.supabase.co") &&
    key !== "mock-anon-key" &&
    key !== "mock-service-role-key"
  );
}

export async function getDbClient() {
  if (typeof window !== "undefined") {
    return createClient();
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const secretKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_KEY ||
    "";
  const key = secretKey || anonKey;
  const { createClient: createSupabaseJsClient } = await import("@supabase/supabase-js");
  return createSupabaseJsClient(url, key, { auth: { persistSession: false } });
}

// ─── Current User & Tenant Resolution ────────────────────────────

export async function getCurrentUserAndTenant(): Promise<{
  user: any | null;
  tenantId: string | null;
}> {
  if (!isSupabaseConfigured()) {
    if (typeof window !== "undefined") {
      let localTenantId = localStorage.getItem("eidetic_tenant_id");
      if (!localTenantId) {
        localTenantId = generateUUID();
        localStorage.setItem("eidetic_tenant_id", localTenantId);
      }
      return { user: null, tenantId: localTenantId };
    }
    return { user: null, tenantId: null };
  }

  try {
    const supabase = await getDbClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { user: null, tenantId: null };

    // In browser, query /api/brand to ensure tenant provisioning
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/brand");
        if (res.ok) {
          const json = await res.json();
          if (json.tenantId) {
            return { user, tenantId: json.tenantId };
          }
        }
      } catch (err) {
        console.warn("API tenant lookup failed:", err);
      }
    }

    // Direct DB lookup fallback
    const { data: userRow } = await supabase
      .from("users")
      .select("tenant_id")
      .eq("id", user.id)
      .maybeSingle();

    if (userRow?.tenant_id) {
      return { user, tenantId: userRow.tenant_id };
    }

    return { user, tenantId: null };
  } catch (err) {
    console.warn("Failed to get current user/tenant:", err);
    return { user: null, tenantId: null };
  }
}

// ─── Brand Profiles ─────────────────────────────────────────────

export async function getBrandProfiles(tenantId?: string): Promise<BrandProfile[]> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/brand");
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.brands)) {
          return json.brands;
        }
      }
    } catch (err) {
      console.warn("fetch /api/brand failed:", err);
    }
  }

  if (!isSupabaseConfigured()) {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("eidetic_brands");
        if (saved) {
          const parsed: BrandProfile[] = JSON.parse(saved);
          return tenantId ? parsed.filter((b) => b.tenant_id === tenantId) : parsed;
        }
      } catch (e) {
        console.warn("localStorage read failed:", e);
      }
    }
    return [];
  }

  try {
    const supabase = await getDbClient();
    let query = supabase.from("brand_profiles").select("*");
    if (tenantId && isUUID(tenantId)) {
      query = query.eq("tenant_id", tenantId);
    }
    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map(mapDbToBrandProfile);
    }
  } catch (err) {
    console.warn("Supabase getBrandProfiles query failed:", err);
  }

  return [];
}

export async function saveBrandProfile(brand: BrandProfile): Promise<BrandProfile> {
  const safeBrand: BrandProfile = {
    ...brand,
    id: isUUID(brand.id) ? brand.id : generateUUID(),
  };

  // Browser client uses server-side API route for secure tenant provisioning & RLS execution
  if (typeof window !== "undefined") {
    const res = await fetch("/api/brand", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(safeBrand),
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || `Failed to save brand (status ${res.status})`);
    }

    if (result.brand) {
      return result.brand;
    }
  }

  if (!isSupabaseConfigured()) {
    return safeBrand;
  }

  try {
    const supabase = await getDbClient();
    const tones = Array.isArray(safeBrand.tone_of_voice)
      ? safeBrand.tone_of_voice
      : ["professional", "bold"];

    const { data, error } = await supabase
      .from("brand_profiles")
      .upsert({
        id: safeBrand.id,
        tenant_id: safeBrand.tenant_id,
        name: safeBrand.brand_name,
        description: safeBrand.brand_description,
        logo_url: safeBrand.logo_url,
        always_include_logo: safeBrand.auto_include_logo,
        color_palette: {
          primary: safeBrand.primary_colour,
          secondaries: safeBrand.secondary_colours,
        },
        typography: {
          family: safeBrand.typography,
        },
        tone_of_voice: tones,
        target_audience: safeBrand.target_audience,
        visual_rules: safeBrand.logo_position,
      })
      .select()
      .single();

    if (error) throw error;
    return mapDbToBrandProfile(data);
  } catch (err) {
    console.warn("Supabase saveBrandProfile fallback failed:", err);
    throw err;
  }
}

// ─── Assets ─────────────────────────────────────────────────────

export async function getAssets(tenantId?: string): Promise<Asset[]> {
  if (!isSupabaseConfigured()) {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("eidetic_assets");
        if (saved) {
          const parsed: Asset[] = JSON.parse(saved);
          return tenantId ? parsed.filter((a) => a.tenant_id === tenantId) : parsed;
        }
      } catch (e) {
        console.warn("localStorage assets read failed:", e);
      }
    }
    return [];
  }

  try {
    const supabase = await getDbClient();
    let query = supabase.from("generated_assets").select("*");
    if (tenantId && isUUID(tenantId)) {
      query = query.eq("tenant_id", tenantId);
    }
    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map(mapDbToAsset);
    }
  } catch (err) {
    console.warn("Supabase getAssets failed:", err);
  }

  return [];
}

export async function saveAsset(
  asset: Asset,
  options?: {
    promptUsed?: string;
    systemPromptSnapshot?: string;
    modelProvider?: string;
    modelName?: string;
    costEstimate?: number;
    sessionId?: string;
  }
): Promise<Asset> {
  const safeId = isUUID(asset.id) ? asset.id : generateUUID();
  const safeTenantId = isUUID(asset.tenant_id) ? asset.tenant_id : generateUUID();
  const safeBrandId = isUUID(asset.brand_profile_id) ? asset.brand_profile_id : generateUUID();
  const safeMessageId = isUUID(asset.message_id) ? asset.message_id : null;

  const sanitizedAsset: Asset = {
    ...asset,
    id: safeId,
    tenant_id: safeTenantId,
    brand_profile_id: safeBrandId,
    message_id: safeMessageId,
  };

  if (!isSupabaseConfigured()) {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("eidetic_assets");
        const existing: Asset[] = saved ? JSON.parse(saved) : [];
        const updated = [sanitizedAsset, ...existing.filter((a) => a.id !== sanitizedAsset.id)];
        localStorage.setItem("eidetic_assets", JSON.stringify(updated));
      } catch (e) {
        console.warn("localStorage save asset failed:", e);
      }
    }
    return sanitizedAsset;
  }

  try {
    const supabase = await getDbClient();

    const { data, error } = await supabase
      .from("generated_assets")
      .upsert(
        {
          id: sanitizedAsset.id,
          tenant_id: sanitizedAsset.tenant_id,
          brand_profile_id: sanitizedAsset.brand_profile_id,
          session_id: options?.sessionId && isUUID(options.sessionId) ? options.sessionId : null,
          message_id: sanitizedAsset.message_id,
          image_url: sanitizedAsset.public_url,
          storage_path: sanitizedAsset.storage_path || `${sanitizedAsset.tenant_id}/${sanitizedAsset.id}.png`,
          prompt_used: options?.promptUsed || "Generated branded graphic",
          system_prompt_snapshot: options?.systemPromptSnapshot || "Generated via Eidetic",
          aspect_ratio: sanitizedAsset.aspect_ratio,
          format_preset: sanitizedAsset.format_preset,
          width: sanitizedAsset.width,
          height: sanitizedAsset.height,
          model_provider: options?.modelProvider || "eidetic",
          model_name: options?.modelName || "brand-engine",
          cost_estimate: options?.costEstimate || 0.00000,
          canva_design_url: sanitizedAsset.canva_edit_url,
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (error) throw error;
    return mapDbToAsset(data);
  } catch (err) {
    console.warn("Supabase saveAsset failed, saving locally:", err);
    return sanitizedAsset;
  }
}

// ─── Chat Sessions & Messages ────────────────────────────────────

export async function getChatSessions(
  tenantId?: string,
  brandProfileId?: string
): Promise<Conversation[]> {
  if (typeof window !== "undefined") {
    try {
      const url = brandProfileId
        ? `/api/chat?brandId=${encodeURIComponent(brandProfileId)}`
        : "/api/chat";
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.sessions)) {
          return json.sessions;
        }
      }
    } catch (err) {
      console.warn("fetch /api/chat failed:", err);
    }
  }

  if (!isSupabaseConfigured()) {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("eidetic_conversations");
        if (saved) {
          const parsed: Conversation[] = JSON.parse(saved);
          return brandProfileId
            ? parsed.filter((c) => c.brand_profile_id === brandProfileId)
            : parsed;
        }
      } catch (e) {
        console.warn("localStorage read conversations failed:", e);
      }
    }
    return [];
  }

  try {
    const supabase = await getDbClient();
    let query = supabase.from("chat_sessions").select("*");

    if (tenantId && isUUID(tenantId)) {
      query = query.eq("tenant_id", tenantId);
    }

    if (brandProfileId && isUUID(brandProfileId)) {
      query = query.eq("brand_profile_id", brandProfileId);
    }

    const { data, error } = await query.order("updated_at", { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map(mapDbToConversation);
    }
  } catch (err) {
    console.warn("Supabase getChatSessions query failed:", err);
  }

  return [];
}

export async function saveChatSession(session: Conversation): Promise<Conversation> {
  const safeSession: Conversation = {
    ...session,
    id: isUUID(session.id) ? session.id : generateUUID(),
    tenant_id: isUUID(session.tenant_id) ? session.tenant_id : generateUUID(),
    brand_profile_id: isUUID(session.brand_profile_id) ? session.brand_profile_id : generateUUID(),
    updated_at: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_session",
          session: safeSession,
        }),
      });

      const result = await res.json();
      if (res.ok && result.session) {
        return result.session;
      }
      if (!res.ok) {
        console.warn("saveChatSession API error:", result.error);
      }
    } catch (e) {
      console.warn("saveChatSession fetch failed:", e);
    }
  }

  if (!isSupabaseConfigured()) {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("eidetic_conversations");
        const existing: Conversation[] = saved ? JSON.parse(saved) : [];
        const updated = [safeSession, ...existing.filter((c) => c.id !== safeSession.id)];
        localStorage.setItem("eidetic_conversations", JSON.stringify(updated));
      } catch (e) {
        console.warn("localStorage save conversation failed:", e);
      }
    }
    return safeSession;
  }

  try {
    const supabase = await getDbClient();

    const { data, error } = await supabase
      .from("chat_sessions")
      .upsert(
        {
          id: safeSession.id,
          tenant_id: safeSession.tenant_id,
          brand_profile_id: safeSession.brand_profile_id,
          title: safeSession.title,
          created_at: safeSession.created_at || new Date().toISOString(),
          updated_at: safeSession.updated_at,
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (error) throw error;
    return mapDbToConversation(data);
  } catch (err) {
    console.warn("Supabase saveChatSession failed, saving locally:", err);
    return safeSession;
  }
}

export async function deleteChatSession(sessionId: string): Promise<boolean> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_session",
          sessionId,
        }),
      });
      if (res.ok) {
        return true;
      }
    } catch (e) {
      console.warn("deleteChatSession fetch failed:", e);
    }
  }

  if (!isSupabaseConfigured()) {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("eidetic_conversations");
        if (saved) {
          const existing: Conversation[] = JSON.parse(saved);
          localStorage.setItem(
            "eidetic_conversations",
            JSON.stringify(existing.filter((c) => c.id !== sessionId))
          );
        }
        localStorage.removeItem(`eidetic_messages_${sessionId}`);
      } catch (e) {
        console.warn("localStorage delete conversation failed:", e);
      }
    }
    return true;
  }

  try {
    const supabase = await getDbClient();
    const { error } = await supabase.from("chat_sessions").delete().eq("id", sessionId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn("Supabase deleteChatSession failed:", err);
    return false;
  }
}

export async function getMessages(sessionId: string): Promise<Message[]> {
  if (!sessionId) return [];

  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/chat?sessionId=${encodeURIComponent(sessionId)}`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.messages)) {
          return json.messages;
        }
      }
    } catch (err) {
      console.warn("fetch /api/chat messages failed:", err);
    }
  }

  if (!isSupabaseConfigured()) {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(`eidetic_messages_${sessionId}`);
        if (saved) {
          const parsed: Message[] = JSON.parse(saved);
          return parsed;
        }
      } catch (e) {
        console.warn("localStorage read messages failed:", e);
      }
    }
    return [];
  }

  try {
    const supabase = await getDbClient();
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map(mapDbToMessage);
    }
  } catch (err) {
    console.warn("Supabase getMessages failed:", err);
  }

  return [];
}

export async function saveMessage(message: Message): Promise<Message> {
  const safeMessage: Message = {
    ...message,
    id: isUUID(message.id) ? message.id : generateUUID(),
    conversation_id: isUUID(message.conversation_id) ? message.conversation_id : generateUUID(),
    tenant_id: isUUID(message.tenant_id) ? message.tenant_id : generateUUID(),
    brand_profile_id: isUUID(message.brand_profile_id) ? message.brand_profile_id : generateUUID(),
    created_at: message.created_at || new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_message",
          message: safeMessage,
        }),
      });

      const result = await res.json();
      if (res.ok && result.message) {
        return result.message;
      }
      if (!res.ok) {
        console.warn("saveMessage API error:", result.error);
      }
    } catch (e) {
      console.warn("saveMessage fetch failed:", e);
    }
  }

  if (!isSupabaseConfigured()) {
    if (typeof window !== "undefined") {
      try {
        const cacheKey = `eidetic_messages_${safeMessage.conversation_id}`;
        const saved = localStorage.getItem(cacheKey);
        const existing: Message[] = saved ? JSON.parse(saved) : [];
        const updated = [...existing.filter((m) => m.id !== safeMessage.id), safeMessage];
        localStorage.setItem(cacheKey, JSON.stringify(updated));

        // Touch updated_at for conversation in local storage
        const convSaved = localStorage.getItem("eidetic_conversations");
        if (convSaved) {
          const convs: Conversation[] = JSON.parse(convSaved);
          const updatedConvs = convs.map((c) =>
            c.id === safeMessage.conversation_id ? { ...c, updated_at: new Date().toISOString() } : c
          );
          localStorage.setItem("eidetic_conversations", JSON.stringify(updatedConvs));
        }
      } catch (e) {
        console.warn("localStorage save message failed:", e);
      }
    }
    return safeMessage;
  }

  try {
    const supabase = await getDbClient();

    const { data, error } = await supabase
      .from("messages")
      .upsert(
        {
          id: safeMessage.id,
          session_id: safeMessage.conversation_id,
          tenant_id: safeMessage.tenant_id,
          sender: safeMessage.role,
          content: safeMessage.content,
          format_preset: safeMessage.metadata?.format_preset || null,
          aspect_ratio: safeMessage.metadata?.aspect_ratio || null,
          custom_dimensions: {
            image_url: safeMessage.image_url || null,
            asset_id: safeMessage.asset_id && isUUID(safeMessage.asset_id) ? safeMessage.asset_id : null,
            brand_profile_id: safeMessage.brand_profile_id,
            metadata: safeMessage.metadata || {},
          },
          created_at: safeMessage.created_at,
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (error) throw error;

    // Touch chat_sessions.updated_at
    await supabase
      .from("chat_sessions")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", safeMessage.conversation_id);

    return mapDbToMessage(data);
  } catch (err) {
    console.warn("Supabase saveMessage failed, saving locally:", err);
    return safeMessage;
  }
}

// ─── Storage Helpers ────────────────────────────────────────────

export async function uploadAssetImage(
  file: Blob | Buffer | Uint8Array,
  tenantId: string,
  fileName: string,
  contentType?: string
): Promise<{ publicUrl: string; storagePath: string } | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = await getDbClient();

    const safeTenantId = isUUID(tenantId) ? tenantId : generateUUID();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `tenants/${safeTenantId}/${Date.now()}-${sanitizedFileName}`;

    let resolvedContentType = contentType;
    if (!resolvedContentType) {
      if (typeof Blob !== "undefined" && file instanceof Blob && file.type) {
        resolvedContentType = file.type;
      } else if (fileName.endsWith(".svg")) {
        resolvedContentType = "image/svg+xml";
      } else if (fileName.endsWith(".webp")) {
        resolvedContentType = "image/webp";
      } else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
        resolvedContentType = "image/jpeg";
      } else {
        resolvedContentType = "image/png";
      }
    }

    const { error: uploadError } = await supabase.storage
      .from("brand-assets")
      .upload(storagePath, file, { contentType: resolvedContentType, upsert: true });

    if (uploadError) {
      console.warn("Supabase storage upload error:", uploadError.message || uploadError);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("brand-assets")
      .getPublicUrl(storagePath);

    return {
      publicUrl: urlData.publicUrl,
      storagePath,
    };
  } catch (err) {
    console.warn("Supabase storage upload failed:", err);
    return null;
  }
}

// ─── DB Mapping Helpers ─────────────────────────────────────────

function mapDbToBrandProfile(row: any): BrandProfile {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    brand_name: row.name,
    logo_url: row.logo_url || null,
    primary_colour: row.color_palette?.primary || "#10B981",
    secondary_colours: row.color_palette?.secondaries || ["#064E3B", "#34D399"],
    typography: row.typography?.family || "Inter",
    brand_description: row.description || "",
    industry: "Specialty Industry",
    tone_of_voice: row.tone_of_voice || ["professional", "bold"],
    target_audience: row.target_audience || "Digital Consumers",
    guidelines_doc_url: null,
    sample_asset_urls: [],
    social_handles: {},
    auto_include_logo: Boolean(row.always_include_logo),
    logo_position: row.visual_rules || "bottom-right",
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapDbToAsset(row: any): Asset {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    brand_profile_id: row.brand_profile_id,
    message_id: row.message_id || null,
    storage_path: row.storage_path,
    public_url: row.image_url,
    format: "png",
    width: row.width || 1080,
    height: row.height || 1080,
    aspect_ratio: row.aspect_ratio || "1:1",
    format_preset: row.format_preset || "instagram_post",
    canva_design_id: null,
    canva_edit_url: row.canva_design_url || null,
    canva_pushed_at: null,
    created_at: row.created_at,
  };
}

function mapDbToConversation(row: any): Conversation {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    brand_profile_id: row.brand_profile_id,
    title: row.title || "New Graphic Session",
    format_preset: row.format_preset || "instagram_post",
    aspect_ratio: row.aspect_ratio || "1:1",
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapDbToMessage(row: any): Message {
  const custom = row.custom_dimensions || {};
  return {
    id: row.id,
    conversation_id: row.session_id,
    tenant_id: row.tenant_id,
    brand_profile_id: row.brand_profile_id || custom.brand_profile_id || null,
    role: (row.sender || "assistant") as MessageRole,
    content: row.content,
    image_url: row.image_url || custom.image_url || null,
    asset_id: row.asset_id || custom.asset_id || null,
    metadata: row.metadata || custom.metadata || {
      format_preset: row.format_preset,
      aspect_ratio: row.aspect_ratio,
    },
    created_at: row.created_at,
  };
}
