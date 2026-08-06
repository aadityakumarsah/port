import { useEffect, useState } from "react";
import {
  Home, Library, User, BookOpen, BarChart3, Search, PenLine,
  ArrowLeft, Calendar, ExternalLink,
} from "lucide-react";
import { supabase } from "./lib/supabase";

interface Post {
  id: string | number;
  title: string;
  slug?: string;
  content?: string;
  image_url?: string | null;
  created_at: string;
}

function readTime(html?: string) {
  if (!html) return 1;
  const words = html.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 238));
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ArticleView({ post }: { post: Post }) {
  const date = formatDate(post.created_at);

  return (
    <div className="min-h-screen bg-white relative">
      <div className="fixed inset-0 bg-white -z-10" />

      {/* Left fixed sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[220px] border-r border-[#f2f2f2] flex-col justify-between px-5 py-8 bg-white">
        <div>
          <a href="/" className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-black">
            Aaditya
            <Search size={17} className="text-zinc-400" />
          </a>
          <nav className="mt-8 space-y-0.5">
            {[
              { icon: Home, label: "Home", href: "/" },
              { icon: Library, label: "Library", href: "/blog" },
              { icon: User, label: "Profile", href: "/" },
              { icon: BookOpen, label: "Stories", href: "/blog" },
              { icon: BarChart3, label: "Stats", href: "/blog" },
            ].map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-[#242424] hover:bg-zinc-100 transition-colors"
              >
                <Icon size={18} className="shrink-0" />
                {label}
              </a>
            ))}
          </nav>
        </div>
        <div className="border-t border-[#f2f2f2] pt-4">
          <p className="text-sm font-semibold text-[#242424]">Following</p>
          <p className="mt-1 text-xs leading-relaxed text-[#6b6b6b]">
            Find writers and publications to follow.
          </p>
          <a href="/blog" className="mt-2 block text-xs text-[#6b6b6b] hover:underline">
            See suggestions
          </a>
        </div>
      </aside>

      {/* Top right floating bar */}
      <header className="fixed top-4 right-6 z-40 flex items-center gap-4">
        <a href="/admin" className="flex items-center gap-1.5 text-sm text-[#242424] hover:text-black transition-colors">
          <PenLine size={17} />
          <span className="hidden sm:inline">Write</span>
        </a>
        <button className="rounded-full border border-[#242424] px-4 py-1.5 text-sm text-[#242424] hover:bg-zinc-50 transition-colors">
          Get App
        </button>
        <a
          href="/admin"
          className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-semibold"
        >
          A
        </a>
      </header>

      {/* Central content column */}
      <main className="lg:pl-[220px]">
        <article className="mx-auto max-w-[680px] px-6 py-20">
          <a
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-[#6b6b6b] hover:text-black transition-colors"
          >
            <ArrowLeft size={15} />
            Back
          </a>

          <h1 className="mt-8 text-[2.4rem] font-bold leading-[1.2] tracking-tight text-[#242424]">
            {post.title}
          </h1>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold">
              A
            </div>
            <div>
              <p className="text-sm font-semibold text-[#242424]">Aaditya Kumar Sah</p>
              <p className="text-xs text-[#6b6b6b]">{date} · {readTime(post.content)} min read</p>
            </div>
          </div>

          <hr className="my-8 border-[#f2f2f2]" />

          {post.image_url && (
            <img src={post.image_url} alt={post.title} className="w-full rounded-lg mb-8" />
          )}

          <div className="article-reader">
            <div className="tip-canvas" dangerouslySetInnerHTML={{ __html: post.content ?? "" }} />
          </div>

          <hr className="my-12 border-[#f2f2f2]" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center text-[11px] font-semibold">
                A
              </div>
              <p className="text-sm text-[#6b6b6b]">Aaditya Kumar Sah</p>
            </div>
            <a
              href={post.slug ? `https://medium.com/@aadityakumarsa/${post.slug}` : "https://medium.com/@aadityakumarsa"}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-[#6b6b6b] hover:text-black transition-colors"
            >
              Read on Medium
              <ExternalLink size={14} />
            </a>
          </div>
        </article>
      </main>
    </div>
  );
}

export function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [post, setPost] = useState<Post | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const path = window.location.pathname;
  const articleId = path.startsWith("/blog/") ? path.split("/").filter(Boolean)[1] : null;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!supabase) {
        setError("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env");
        setLoading(false);
        return;
      }

      if (articleId) {
        const isNumeric = /^\d+$/.test(articleId);
        const { data, error } = await supabase
          .from("posts")
          .select("id, title, slug, content, image_url, created_at")
          .eq(isNumeric ? "id" : "slug", isNumeric ? Number(articleId) : articleId)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          setError(error.message);
        } else if (data) {
          setPost(data);
        } else {
          setNotFound(true);
        }
      } else {
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
      }
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [articleId]);

  if (articleId) {
    if (loading) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-sm text-[#6b6b6b]">Loading…</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      );
    }
    if (notFound || !post) {
      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
          <p className="text-lg font-semibold text-[#242424]">Story not found</p>
          <a href="/blog" className="text-sm text-[#6b6b6b] hover:text-black hover:underline">
            Back to stories
          </a>
        </div>
      );
    }
    return <ArticleView post={post} />;
  }

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
                  {formatDate(post.created_at)}
                </span>
                <span className="inline-flex items-center gap-1">
                  {readTime(post.content)} min read
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
