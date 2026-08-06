-- 2.sql: Enable Row Level Security and allow public read only
alter table public.posts enable row level security;

-- Anyone (anon + authenticated) can read posts
create policy "posts are publicly readable"
  on public.posts
  for select
  using (true);

-- Note: no insert/update/delete policies exist, so writes are blocked for
-- anon/authenticated roles. The service_role key bypasses RLS entirely and
-- can still insert/update/delete. Never expose SUPABASE_SECRET_KEY to the browser.
