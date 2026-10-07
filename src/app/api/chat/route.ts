import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase/server";
import { resolveOrCreateTenant } from "@/lib/supabase/tenant";
import { isUUID, generateUUID } from "@/lib/utils/uuid";
import { Conversation, Message, MessageRole } from "@/types/database";

function mapDbRowToConversation(row: any): Conversation {
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

function mapDbRowToMessage(row: any): Message {
  const custom = row.custom_dimensions || {};
  return {
    id: row.id,
    conversation_id: row.session_id,
    tenant_id: row.tenant_id,
    brand_profile_id: row.brand_profile_id || custom.brand_profile_id || null,
    role: (row.sender || "assistant") as MessageRole,
    content: row.content || "",
    image_url: row.image_url || custom.image_url || null,
    asset_id: row.asset_id || custom.asset_id || null,
    metadata: row.metadata || custom.metadata || {
      format_preset: row.format_preset,
      aspect_ratio: row.aspect_ratio,
    },
    created_at: row.created_at,
  };
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ sessions: [], messages: [] }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const tenantId = await resolveOrCreateTenant(adminClient, user);

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    const brandId = searchParams.get("brandId");

    // If sessionId provided, return messages for that session
    if (sessionId && isUUID(sessionId)) {
      const { data: messageRows, error: msgError } = await adminClient
        .from("messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (msgError) throw msgError;

      const messages = (messageRows || []).map(mapDbRowToMessage);
      return NextResponse.json({ messages });
    }

    // Otherwise return chat sessions for the brand/tenant
    let query = adminClient
      .from("chat_sessions")
      .select("*")
      .eq("tenant_id", tenantId);

    if (brandId && isUUID(brandId)) {
      query = query.eq("brand_profile_id", brandId);
    }

    const { data: sessionRows, error: sessError } = await query.order("updated_at", {
      ascending: false,
    });

    if (sessError) throw sessError;

    const sessions = (sessionRows || []).map(mapDbRowToConversation);
    return NextResponse.json({ sessions });
  } catch (err: any) {
    console.error("GET /api/chat error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load chat data", sessions: [], messages: [] },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const tenantId = await resolveOrCreateTenant(adminClient, user);
    const body = await req.json();
    const { action } = body;

    // ── 1. Save or Update Session ───────────────────────────────────
    if (action === "save_session" || (!action && body.title)) {
      const sessionData = body.session || body;
      const sessionId = isUUID(sessionData.id) ? sessionData.id : generateUUID();
      const brandId = isUUID(sessionData.brand_profile_id) ? sessionData.brand_profile_id : null;

      if (!brandId) {
        return NextResponse.json({ error: "Missing or invalid brand_profile_id" }, { status: 400 });
      }

      // Conforms strictly to public.chat_sessions in 001_initial_schema.sql
      const { data: savedRow, error: saveError } = await adminClient
        .from("chat_sessions")
        .upsert(
          {
            id: sessionId,
            tenant_id: tenantId,
            brand_profile_id: brandId,
            title: (sessionData.title || "New Graphic Session").trim(),
            created_by: user.id,
            created_at: sessionData.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        )
        .select()
        .single();

      if (saveError) {
        console.error("Supabase upsert chat_sessions error:", saveError);
        return NextResponse.json({ error: `Database error: ${saveError.message}` }, { status: 500 });
      }

      return NextResponse.json({ session: mapDbRowToConversation(savedRow) });
    }

    // ── 2. Save Message ─────────────────────────────────────────────
    if (action === "save_message" || (!action && body.content !== undefined)) {
      const msg = body.message || body;
      const messageId = isUUID(msg.id) ? msg.id : generateUUID();
      const sessionId = isUUID(msg.conversation_id || msg.session_id)
        ? (msg.conversation_id || msg.session_id)
        : null;
      const brandId = isUUID(msg.brand_profile_id) ? msg.brand_profile_id : null;

      if (!sessionId) {
        return NextResponse.json({ error: "Missing valid conversation_id/session_id" }, { status: 400 });
      }

      // Ensure session exists first to avoid foreign key failure
      const { data: existingSession } = await adminClient
        .from("chat_sessions")
        .select("id")
        .eq("id", sessionId)
        .maybeSingle();

      if (!existingSession && brandId) {
        await adminClient.from("chat_sessions").insert({
          id: sessionId,
          tenant_id: tenantId,
          brand_profile_id: brandId,
          title: "New Graphic Session",
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      // Conforms strictly to public.messages in 001_initial_schema.sql
      // Storing image_url, asset_id, brand_profile_id in custom_dimensions jsonb
      const { data: savedMsgRow, error: msgError } = await adminClient
        .from("messages")
        .upsert(
          {
            id: messageId,
            session_id: sessionId,
            tenant_id: tenantId,
            sender: msg.role || msg.sender || "assistant",
            content: msg.content || "",
            format_preset: msg.metadata?.format_preset || msg.format_preset || null,
            aspect_ratio: msg.metadata?.aspect_ratio || msg.aspect_ratio || null,
            custom_dimensions: {
              image_url: msg.image_url || null,
              asset_id: msg.asset_id && isUUID(msg.asset_id) ? msg.asset_id : null,
              brand_profile_id: brandId,
              metadata: msg.metadata || {},
            },
            created_at: msg.created_at || new Date().toISOString(),
          },
          { onConflict: "id" }
        )
        .select()
        .single();

      if (msgError) {
        console.error("Supabase upsert messages error:", msgError);
        return NextResponse.json({ error: `Database error: ${msgError.message}` }, { status: 500 });
      }

      // Touch session updated_at
      await adminClient
        .from("chat_sessions")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", sessionId);

      return NextResponse.json({ message: mapDbRowToMessage(savedMsgRow) });
    }

    // ── 3. Delete Session ───────────────────────────────────────────
    if (action === "delete_session") {
      const sessionId = body.sessionId || body.id;
      if (!sessionId || !isUUID(sessionId)) {
        return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
      }

      const { error: delError } = await adminClient
        .from("chat_sessions")
        .delete()
        .eq("id", sessionId)
        .eq("tenant_id", tenantId);

      if (delError) {
        console.error("Supabase delete chat_sessions error:", delError);
        return NextResponse.json({ error: delError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, deletedId: sessionId });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    console.error("POST /api/chat error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process chat operation" },
      { status: 500 }
    );
  }
}
