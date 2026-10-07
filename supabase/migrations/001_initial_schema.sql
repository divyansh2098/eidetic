-- Eidetic Initial Database Schema Migration
-- Matches TAD §4 (Multi-tenant with 1-to-many Tenant -> Brand Profile)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Tenants table
create table if not exists public.tenants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  plan text not null default 'free' check (plan in ('free', 'pro', 'enterprise')),
  monthly_generation_limit integer not null default 20,
  current_month_generations integer not null default 0,
  canva_connected boolean not null default false,
  canva_access_token text,
  canva_refresh_token text,
  canva_token_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Users table (links to Supabase auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Brand Profiles (1-to-many: Tenant -> Brand Profile)
create table if not exists public.brand_profiles (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  tagline text,
  description text not null,
  logo_url text,
  always_include_logo boolean not null default false,
  color_palette jsonb not null default '{
    "primary": "#3B82F6",
    "secondary": "#1E293B",
    "accent": "#F59E0B",
    "neutral": "#94A3B8",
    "background": "#0F172A"
  }'::jsonb,
  typography jsonb not null default '{
    "heading_font": "Inter",
    "body_font": "Inter"
  }'::jsonb,
  tone_of_voice text[] not null default array['professional', 'modern'],
  visual_rules text,
  target_audience text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Chat Sessions
create table if not exists public.chat_sessions (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  brand_profile_id uuid not null references public.brand_profiles(id) on delete cascade,
  title text not null default 'New Graphic Session',
  created_by uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Messages
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  sender text not null check (sender in ('user', 'assistant', 'system')),
  content text not null,
  format_preset text,
  aspect_ratio text,
  custom_dimensions jsonb,
  created_at timestamptz not null default now()
);

-- 6. Generated Assets
create table if not exists public.generated_assets (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  brand_profile_id uuid not null references public.brand_profiles(id) on delete cascade,
  session_id uuid references public.chat_sessions(id) on delete set null,
  message_id uuid references public.messages(id) on delete set null,
  image_url text not null,
  storage_path text not null,
  prompt_used text not null,
  system_prompt_snapshot text not null,
  aspect_ratio text not null,
  format_preset text not null,
  width integer not null,
  height integer not null,
  model_provider text not null,
  model_name text not null,
  cost_estimate numeric(8, 5) not null default 0.00000,
  canva_design_url text,
  created_at timestamptz not null default now()
);

-- Performance Indexes
create index if not exists idx_users_tenant on public.users(tenant_id);
create index if not exists idx_brand_profiles_tenant on public.brand_profiles(tenant_id);
create index if not exists idx_chat_sessions_tenant on public.chat_sessions(tenant_id);
create index if not exists idx_chat_sessions_brand on public.chat_sessions(brand_profile_id);
create index if not exists idx_messages_session on public.messages(session_id);
create index if not exists idx_messages_tenant on public.messages(tenant_id);
create index if not exists idx_generated_assets_tenant on public.generated_assets(tenant_id);
create index if not exists idx_generated_assets_brand on public.generated_assets(brand_profile_id);

-- Row Level Security (RLS)
alter table public.tenants enable row level security;
alter table public.users enable row level security;
alter table public.brand_profiles enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.messages enable row level security;
alter table public.generated_assets enable row level security;

-- Tenant isolation RLS helper
create or replace function public.current_user_tenant_id()
returns uuid
language sql
security definer
stable
as $$
  select tenant_id from public.users where id = auth.uid() limit 1;
$$;

-- RLS Policies
create policy "Users can view their tenant"
  on public.tenants for select
  using (id = public.current_user_tenant_id());

create policy "Users can view members of their tenant"
  on public.users for select
  using (tenant_id = public.current_user_tenant_id());

create policy "Users can manage brand profiles of their tenant"
  on public.brand_profiles for all
  using (tenant_id = public.current_user_tenant_id());

create policy "Users can manage chat sessions of their tenant"
  on public.chat_sessions for all
  using (tenant_id = public.current_user_tenant_id());

create policy "Users can manage messages of their tenant"
  on public.messages for all
  using (tenant_id = public.current_user_tenant_id());

create policy "Users can manage generated assets of their tenant"
  on public.generated_assets for all
  using (tenant_id = public.current_user_tenant_id());
