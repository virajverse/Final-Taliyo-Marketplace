-- Minimal seed data for Taliyo Marketplace (idempotent-ish)
-- Run in Supabase SQL editor after schema.sql

-- Categories
insert into categories (name, description, icon, slug, is_active, sort_order)
values
  ('Web Development','Professional web development services','web','web-development',true,1),
  ('Mobile Development','iOS/Android and cross-platform apps','mobile','mobile-development',true,2),
  ('Digital Marketing','SEO, SMM and PPC','marketing','digital-marketing',true,3)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

-- Services (one sample)
insert into services (
  id, category_id, title, description, price_min, price_max, price_type, location,
  is_remote, images, provider_name, provider_avatar, provider_verified,
  rating_average, rating_count, is_active, is_featured, slug
) values (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  (select id from categories where slug = 'web-development'),
  'Professional Web Development',
  'Responsive, fast and SEO-friendly websites',
  5000, 15000, 'fixed', 'Delhi NCR',
  true,
  '["https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=800&fit=crop"]',
  'Tech Solutions',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
  true,
  4.8, 100, true, true, 'professional-web-development'
) on conflict (slug) do update set
  category_id = excluded.category_id,
  title = excluded.title,
  description = excluded.description,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  price_type = excluded.price_type,
  location = excluded.location,
  is_remote = excluded.is_remote,
  images = excluded.images,
  provider_name = excluded.provider_name,
  provider_avatar = excluded.provider_avatar,
  provider_verified = excluded.provider_verified,
  rating_average = excluded.rating_average,
  rating_count = excluded.rating_count,
  is_active = excluded.is_active,
  is_featured = excluded.is_featured;

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
