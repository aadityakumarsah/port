-- 5.sql: Admin access + write policies (replaces the Bun server admin API)
-- Run this in the Supabase SQL editor.

-- Which emails are allowed to create/delete posts? Replace with YOUR email.
create table if not exists public.admins (
  email text primary key
);
insert into public.admins (email)
values ('your-email@example.com')
on conflict (email) do nothing;

-- Admins can create posts (needs them to be signed in via Supabase Auth)
create policy "admins can insert posts"
  on public.posts
  for insert
  to authenticated
  with check (
    (select auth.jwt() ->> 'email') in (select email from public.admins)
  );

-- Admins can delete posts
create policy "admins can delete posts"
  on public.posts
  for delete
  to authenticated
  using (
    (select auth.jwt() ->> 'email') in (select email from public.admins)
  );

-- Storage: create a public bucket for post images (run once)
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

-- Signed-in users can upload into the bucket
create policy "authenticated users can upload to post-images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'post-images');

-- Anyone can read post images
create policy "public can read post-images"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'post-images');

-- Owners (same user) can delete their images
create policy "uploader can delete their post-images"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'post-images' and owner = auth.uid());
