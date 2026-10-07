import { generateUUID } from "@/lib/utils/uuid";

export async function resolveOrCreateTenant(adminClient: any, user: any): Promise<string> {
  // 1. Check if user already exists in public.users
  const { data: userRow } = await adminClient
    .from("users")
    .select("tenant_id")
    .eq("id", user.id)
    .maybeSingle();

  if (userRow?.tenant_id) {
    // Verify the tenant actually exists in public.tenants
    const { data: tenantRow } = await adminClient
      .from("tenants")
      .select("id")
      .eq("id", userRow.tenant_id)
      .maybeSingle();

    if (tenantRow?.id) {
      return tenantRow.id;
    }
  }

  // 2. Provision new tenant & user record
  const newTenantId = generateUUID();
  const tenantName =
    user.user_metadata?.brand_name ||
    user.email?.split("@")[0] ||
    "Workspace";
  const tenantSlug = `${tenantName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${newTenantId.slice(0, 8)}`;

  const { error: tenantErr } = await adminClient.from("tenants").insert({
    id: newTenantId,
    name: tenantName,
    slug: tenantSlug,
    plan: "free",
  });

  if (tenantErr) {
    throw new Error(`Failed to create tenant: ${tenantErr.message}`);
  }

  const { error: userErr } = await adminClient.from("users").upsert({
    id: user.id,
    tenant_id: newTenantId,
    email: user.email || "",
    role: "owner",
  });

  if (userErr) {
    throw new Error(`Failed to link user to tenant: ${userErr.message}`);
  }

  return newTenantId;
}
