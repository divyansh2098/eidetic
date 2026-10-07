-- Eidetic Migration 004: Automatic Tenant & User Provisioning Trigger
-- Ensures that when an authenticated user signs up or signs in, their tenant and public.users row exist

-- 1. Create or replace the trigger function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_tenant_id uuid := uuid_generate_v4();
  tenant_name text;
  tenant_slug text;
begin
  tenant_name := coalesce(new.raw_user_meta_data->>'brand_name', split_part(new.email, '@', 1), 'Workspace');
  tenant_slug := lower(regexp_replace(tenant_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(new_tenant_id::text, 1, 8);

  -- 1. Create default tenant for new user
  insert into public.tenants (id, name, slug, plan, monthly_generation_limit, current_month_generations)
  values (new_tenant_id, tenant_name, tenant_slug, 'free', 20, 0)
  on conflict (id) do nothing;

  -- 2. Create public.users entry linking to auth.users and tenant
  insert into public.users (id, tenant_id, email, role, full_name, avatar_url)
  values (
    new.id,
    new_tenant_id,
    new.email,
    'owner',
    coalesce(new.raw_user_meta_data->>'full_name', tenant_name),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = now();

  return new;
end;
$$;

-- 2. Execute trigger on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
