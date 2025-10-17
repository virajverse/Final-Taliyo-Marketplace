-- Minimal seed data for Taliyo Marketplace (idempotent-ish)
-- Run in Supabase SQL editor after schema.sql

-- Categories
insert into categories (id, name, description, icon, slug, is_active, sort_order)
values
  ('11111111-1111-1111-1111-111111111111','Web Development','Professional web development services','web','web-development',true,1),
  ('22222222-2222-2222-2222-222222222222','Mobile Development','iOS/Android and cross-platform apps','mobile','mobile-development',true,2),
  ('33333333-3333-3333-3333-333333333333','Digital Marketing','SEO, SMM and PPC','marketing','digital-marketing',true,3)
on conflict (slug) do nothing;

-- Services (one sample)
insert into services (
  id, category_id, title, description, price_min, price_max, price_type, location,
  is_remote, images, provider_name, provider_avatar, provider_verified,
  rating_average, rating_count, is_active, is_featured, slug
) values (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'Professional Web Development',
  'Responsive, fast and SEO-friendly websites',
  5000, 15000, 'fixed', 'Delhi NCR',
  true,
  '["https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=800&fit=crop"]',
  'Tech Solutions',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
  true,
  4.8, 100, true, true, 'professional-web-development'
) on conflict (slug) do nothing;

-- Banners
insert into banners (image_url, cta_text, cta_url, cta_align, target, active, sort_order, overlay_opacity)
values (
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&h=600&fit=crop',
  'Chat on WhatsApp', 'https://wa.me/+917042523611', 'center', 'all', true, 1, 0.2
) on conflict do nothing;

-- Site settings
insert into site_settings (key, value) values ('home_banner_limit','3')
on conflict (key) do update set value=excluded.value;

-- Notifications
insert into notifications (type, title, message)
values
  ('system','Welcome to Taliyo','Your marketplace is ready to explore!'),
  ('promotion','Festival Sale','Get 20% off on top services this week!')
returning *;
