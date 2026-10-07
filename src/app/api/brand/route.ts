import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase/server";
import { resolveOrCreateTenant } from "@/lib/supabase/tenant";
import { isUUID, generateUUID } from "@/lib/utils/uuid";
import { BrandProfile } from "@/types/database";

function mapDbRowToBrandProfile(row: any): BrandProfile {
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
    tone_of_voice: Array.isArray(row.tone_of_voice)
      ? row.tone_of_voice
      : ["professional", "bold"],
    target_audience: row.target_audience || "Modern consumers",
    guidelines_doc_url: null,
    sample_asset_urls: [],
    social_handles: {},
    auto_include_logo: Boolean(row.always_include_logo),
    logo_position: row.visual_rules || "bottom-right",
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ brands: [], tenantId: null }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const tenantId = await resolveOrCreateTenant(adminClient, user);

    const { data: brandRows, error: brandError } = await adminClient
      .from("brand_profiles")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (brandError) {
      throw brandError;
    }

    const brands = (brandRows || []).map(mapDbRowToBrandProfile);
    return NextResponse.json({ brands, tenantId });
  } catch (err: any) {
    console.error("GET /api/brand error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch brand profiles", brands: [] },
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
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const tenantId = await resolveOrCreateTenant(adminClient, user);

    const body = await req.json();
    const brandId = isUUID(body.id) ? body.id : generateUUID();

    const tones = Array.isArray(body.tone_of_voice)
      ? body.tone_of_voice
      : typeof body.tone_of_voice === "string"
      ? body.tone_of_voice.split(",").map((s: string) => s.trim())
      : ["professional", "bold"];

    const brandPayload = {
      id: brandId,
      tenant_id: tenantId,
      name: (body.brand_name || body.name || "My Brand").trim(),
      tagline: body.tagline ? String(body.tagline).trim() : null,
      description: (body.brand_description || body.description || "Brand visual profile").trim(),
      logo_url: body.logo_url || null,
      always_include_logo: Boolean(body.auto_include_logo),
      color_palette: {
        primary: body.primary_colour || "#10B981",
        secondaries: Array.isArray(body.secondary_colours)
          ? body.secondary_colours
          : ["#064E3B", "#34D399"],
      },
      typography: {
        family: body.typography || "Inter",
      },
      tone_of_voice: tones,
      target_audience: (body.target_audience || "Modern consumers").trim(),
      visual_rules: body.logo_position || "bottom-right",
      is_default: true,
    };

    const { data: savedRow, error: saveError } = await adminClient
      .from("brand_profiles")
      .upsert(brandPayload)
      .select()
      .single();

    if (saveError) {
      console.error("Supabase upsert brand_profiles failed:", saveError);
      return NextResponse.json(
        { error: `Database error: ${saveError.message}` },
        { status: 500 }
      );
    }

    const savedProfile = mapDbRowToBrandProfile(savedRow);
    return NextResponse.json({ brand: savedProfile, tenantId });
  } catch (err: any) {
    console.error("POST /api/brand error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save brand profile" },
      { status: 500 }
    );
  }
}
