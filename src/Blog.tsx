import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Calendar, ChevronRight, Clock } from "lucide-react";
import { supabase } from "./lib/supabase";

interface Post {
  id: number;
  title: string;
  slug?: string | null;
  content?: string | null;
  image_url?: string | null;
  created_at: string;
}

function postIdFromPath(): number | null {
  const m = window.location.pathname.match(/^\/blog\/(\d+)\/?$/);
  return m ? Number(m[1]) : null;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function readingTime(html: string | null | undefined): string {
  if (!html) return "1 min read";
  const words = stripHtml(html).split(" ").length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function Blog() {
  const postId = postIdFromPath();
  const [posts, setPosts] = useState<Post[]>([]);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!supabase) {
        setError("Supabase is not configured.");
        setLoading(false);
        return;
      }
      if (postId != null) {
        const { data, error } = await supabase
          .from("posts")
          .select("id, title, slug, content, image_url, created_at")
          .eq("id", postId)
          .single();
        if (cancelled) return;
        if (error) setError(error.message);
        else setPost(data);
      } else {
        const { data, error } = await supabase
          .from("posts")
          .select("id, title, slug, content, image_url, created_at")
          .order("created_at", { ascending: false });
        if (cancelled) return;
        if (error) setError(error.message);
        else setPosts(data ?? []);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  /* ---- Article (reader) view ---- */
  if (postId != null) {
    return (
      <div className="min-h-screen bg-white text-zinc-900">
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-zinc-100">
          <div className="mx-auto max-w-3xl px-5 sm:px-6 h-16 flex items-center justify-between">
            <a href="/blog" className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-black transition-colors">
              <ArrowLeft size={15} /> All articles
            </a>
            <a href="/" className="font-serif font-extrabold text-xl tracking-tight text-black">
              Aaditya
            </a>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-5 sm:px-6 py-12">
          {loading && <p className="text-zinc-400">Loading article…</p>}
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
              <a href="/blog" className="block mt-2 text-indigo-400 underline underline-offset-2">
                Back to all articles
              </a>
            </div>
          )}
          {!loading && !error && post && (
            <article>
              <h1 className="font-serif font-extrabold text-4xl leading-tight text-black mb-5">
                {post.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-zinc-500 mb-8">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={14} /> {formatDate(post.created_at)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={14} /> {readingTime(post.content)}
                </span>
              </div>
              {post.image_url && (
                <img src={post.image_url} alt={post.title} className="w-full rounded-2xl mb-10" />
              )}
              <div className="tip-canvas" dangerouslySetInnerHTML={{ __html: post.content ?? "" }} />
            </article>
          )}
          <div className="mt-16 pt-8 border-t border-zinc-100 flex items-center justify-between">
            <a href="/blog" className="text-sm font-medium text-zinc-500 hover:text-black transition-colors">
              ← All articles
            </a>
            <a href="/" className="text-sm font-medium text-zinc-500 hover:text-black transition-colors">
              Home →
            </a>
          </div>
        </main>
      </div>
    );
  }

  /* ---- List view ---- */
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
              href={`/blog/${post.id}`}
              className="group block p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-indigo-500/50 hover:bg-zinc-900/60 transition-all duration-300"
            >
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-44 object-cover rounded-lg mb-4"
                />
              )}
              <h2 className="font-semibold text-lg text-zinc-100 group-hover:text-white transition-colors">
                {post.title}
              </h2>
              {post.content && (
                <p className="mt-2 text-sm text-zinc-500 line-clamp-2">
                  {stripHtml(post.content)}
                </p>
              )}
              <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500">
                <span className="inline-flex items-center gap-1">
                  <Calendar size={12} />
                  {formatDate(post.created_at)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock size={12} />
                  {readingTime(post.content)}
                </span>
                <span className="ml-auto inline-flex items-center gap-1 text-indigo-400 group-hover:translate-x-1 transition-transform">
                  Read article
                  <ChevronRight size={13} />
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
