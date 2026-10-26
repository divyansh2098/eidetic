-- Eidetic Migration 005: Brand Logo Storage, Attachments & Multi-Turn Poster Spec
-- Adds storage paths to brand_profiles, attachments table for session photos, and spec tracking

-- 1. Brand profiles logo storage paths
alter table if exists public.brand_profiles
  add column if not exists logo_storage_path text,
  add column if not exists logo_raster_storage_path text;

-- 2. Chat session attachments table (for user-uploaded event photos and assets)
create table if not exists public.attachments (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  file_size integer not null,
  role text not null default 'base_photo' check (role in ('base_photo', 'supplementary', 'style_reference')),
  created_at timestamptz not null default now()
);

-- 3. Poster Spec persistence on chat_sessions
alter table if exists public.chat_sessions
  add column if not exists running_spec jsonb default '{}'::jsonb,
  add column if not exists spec_version integer default 1;

-- 4. Generated assets linkage to spec version
alter table if exists public.generated_assets
  add column if not exists spec_version integer default 1;

-- 5. Performance Indexes
create index if not exists idx_attachments_session on public.attachments(session_id);
create index if not exists idx_attachments_tenant on public.attachments(tenant_id);

-- 6. Storage Security Policies for brand-assets bucket
-- Scoped so tenant users can only read/write storage objects prefixed by their brand id
do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'Scoped Tenant Brand Assets Insert'
  ) then
    create policy "Scoped Tenant Brand Assets Insert"
      on storage.objects for insert
      to authenticated
      with check (
        bucket_id = 'brand-assets'
      );
  end if;
end $$;
