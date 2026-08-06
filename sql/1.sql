-- 1.sql: Create the posts table
create table if not exists public.posts (
  id bigint generated always as identity primary key,
  title text not null,
  slug text,
  content text,
  created_at timestamptz not null default now()
);

-- Index for listing newest first
create index if not exists posts_created_at_idx on public.posts (created_at desc);
