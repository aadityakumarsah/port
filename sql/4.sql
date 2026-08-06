-- 4.sql: Add image support to posts (Cloudinary)
alter table public.posts
  add column if not exists image_url text,
  add column if not exists cloudinary_public_id text;
