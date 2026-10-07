-- Eidetic Migration 003: Chat Sessions & Messages Persistence
-- Enhances chat_sessions and messages to support full message metadata, asset linkages, and flexible ownership

-- 1. Make created_by nullable in chat_sessions so demo/system sessions can be persisted without foreign key errors
alter table if exists public.chat_sessions
  alter column created_by drop not null;

-- 2. Add format preset and aspect ratio to chat_sessions
alter table if exists public.chat_sessions
  add column if not exists format_preset text default 'instagram_post',
  add column if not exists aspect_ratio text default '1:1';

-- 3. Enhance messages table with brand reference, image URL, generated asset reference, and metadata
alter table if exists public.messages
  add column if not exists brand_profile_id uuid references public.brand_profiles(id) on delete cascade,
  add column if not exists image_url text,
  add column if not exists asset_id uuid references public.generated_assets(id) on delete set null,
  add column if not exists metadata jsonb default '{}'::jsonb;

-- 4. Create performance indexes for real-time chat queries
create index if not exists idx_chat_sessions_tenant_brand 
  on public.chat_sessions(tenant_id, brand_profile_id, updated_at desc);

create index if not exists idx_messages_session_created 
  on public.messages(session_id, created_at asc);

create index if not exists idx_messages_asset_id 
  on public.messages(asset_id);
