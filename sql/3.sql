-- 3.sql (optional): Seed a couple of sample posts
-- Paste this only after 1.sql and 2.sql succeed.

insert into public.posts (title, slug, content)
values
  (
    'Hello, World — First Post',
    'hello-world-first-post',
    'Welcome to my blog. This is a placeholder post to verify the Supabase connection. Replace or delete it with the dashboard.'
  ),
  (
    'Sample Research Note',
    'sample-research-note',
    'A second placeholder post. Delete this row from the table editor once real posts exist.'
  );
