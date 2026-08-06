import { useEffect, useState } from "react";
import { BookOpen, ArrowLeft, Calendar, ExternalLink } from "lucide-react";
import { supabase } from "./lib/supabase";

interface Post {
  id: string | number;
  title: string;
  slug?: string;
  content?: string;
  image_url?: string | null;
  created_at: string;
}

export function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      if (!supabase) {
        setError("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("posts")
        .select("id, title, slug, content, image_url, created_at")
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        setError(error.message);
      } else {
        setPosts(data ?? []);
      }
      setLoading(false);
    }

    loadPosts();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-zinc-300">
      <main className="mx-auto max-w-3xl px-6 py-16">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-10"
        >
          <ArrowLeft size={16} />
          Back to home
        </a>

        <div className="flex items-center gap-3 mb-2">
          <BookOpen size={24} className="text-indigo-400" />
          <h1 className="text-2xl font-bold text-white">Blog</h1>
        </div>
        <p className="text-zinc-500 mb-12">Notes on AI engineering, systems, and things I'm building.</p>

        {loading && <p className="text-zinc-500">Loading posts…</p>}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <p className="text-zinc-500">No posts yet. Coming soon.</p>
        )}

        <div className="space-y-4">
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.slug ? `https://medium.com/@aadityakumarsa/${post.slug}` : "https://medium.com/@aadityakumarsa"}
              target="_blank"
              rel="noreferrer"
              className="group block p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-indigo-500/50 transition-all duration-300"
            >
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-44 object-cover rounded-lg mb-4"
                />
              )}
              <h2 className="font-semibold text-zinc-100 group-hover:text-white transition-colors">
                {post.title}
              </h2>
              {post.content && (
                <p className="mt-2 text-sm text-zinc-500 line-clamp-2">
                  {post.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()}
                </p>
              )}
              <div className="mt-3 flex items-center gap-3 text-xs text-zinc-500">
                <span className="inline-flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(post.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="inline-flex items-center gap-1 text-indigo-400 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform">
                  Read on Medium
                  <ExternalLink size={12} />
                </span>
              </div>
            </a>
          ))}
        </div>

        <p className="mt-16 text-center text-xs text-zinc-600">
          <a href="/admin" className="hover:text-zinc-400 transition-colors">Admin</a>
        </p>
      </main>
    </div>
  );
}
