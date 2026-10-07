-- Supabase Storage Setup Migration — TAD §8
-- Sets up the 'brand-assets' bucket for tenant logos and generated assets

-- 1. Create the brand-assets storage bucket if it does not exist
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'brand-assets',
  'brand-assets',
  true,
  10485760, -- 10MB limit per file
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 10485760;

-- 2. Storage RLS Policies
create policy "Public Access to Brand Assets"
  on storage.objects for select
  using (bucket_id = 'brand-assets');

create policy "Authenticated Users Can Upload Tenant Assets"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'brand-assets'
  );

create policy "Users Can Update Their Tenant Assets"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'brand-assets'
  );

create policy "Users Can Delete Their Tenant Assets"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'brand-assets'
  );
