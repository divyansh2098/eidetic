-- Seed data for Eidetic development & testing
-- Creates a demo tenant, demo brand profile (Acme Eco Tech), and sample session

do $$
declare
  demo_tenant_id uuid := 'a0000000-0000-0000-0000-000000000001'::uuid;
  demo_user_id uuid := 'b0000000-0000-0000-0000-000000000001'::uuid;
  demo_brand_id uuid := 'c0000000-0000-0000-0000-000000000001'::uuid;
begin
  -- 1. Insert demo tenant
  insert into public.tenants (id, name, slug, plan, monthly_generation_limit, current_month_generations, canva_connected)
  values (demo_tenant_id, 'Acme Innovations', 'acme-innovations', 'pro', 200, 12, false)
  on conflict (id) do nothing;

  -- 2. Insert demo brand profile
  insert into public.brand_profiles (
    id,
    tenant_id,
    name,
    tagline,
    description,
    logo_url,
    always_include_logo,
    color_palette,
    typography,
    tone_of_voice,
    visual_rules,
    target_audience,
    is_default
  )
  values (
    demo_brand_id,
    demo_tenant_id,
    'Acme Eco Tech',
    'Sustainable Energy for Tomorrow',
    'Acme Eco Tech builds next-generation clean energy storage solutions for smart homes and urban microgrids. Our aesthetic is minimalist, modern, eco-conscious, with sleek tech elements.',
    'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&auto=format&fit=crop&q=60',
    true,
    '{
      "primary": "#10B981",
      "secondary": "#064E3B",
      "accent": "#F59E0B",
      "neutral": "#64748B",
      "background": "#0B1320"
    }'::jsonb,
    '{
      "heading_font": "Inter",
      "body_font": "Inter"
    }'::jsonb,
    array['eco-friendly', 'minimalist', 'high-tech', 'confident'],
    'Clean negative space, subtle glowing green neon accents, dark charcoal/navy backdrop, photorealistic clean tech rendering, never use cluttered or noisy backgrounds.',
    'Tech-forward homeowners aged 28-55 interested in solar, sustainability, and home automation.',
    true
  )
  on conflict (id) do nothing;

end $$;
