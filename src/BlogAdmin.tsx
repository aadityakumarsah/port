import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Loader2, Lock, PenLine, Trash2 } from "lucide-react";
import { supabase } from "./lib/supabase";
import { Editor } from "./Editor";

interface Post {
  id: number;
  title: string;
  slug?: string | null;
  content?: string | null;
  image_url?: string | null;
  created_at: string;
}

const TOKEN_KEY = "blog_admin_token";

export function BlogAdmin() {
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) ?? "");
  const [unlocked, setUnlocked] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [view, setView] = useState<"list" | "editor">("list");
  const [posts, setPosts] = useState<Post[]>([]);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function refresh() {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("posts")
      .select("id, title, slug, content, image_url, created_at")
      .order("created_at", { ascending: false });
    if (!error) setPosts(data ?? []);
  }

  useEffect(() => {
    if (token) {
      setUnlocked(true);
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function unlock() {
    setUnlocking(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Wrong password");
      setToken(data.token);
      sessionStorage.setItem(TOKEN_KEY, data.token);
      setUnlocked(true);
      refresh();
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    } finally {
      setUnlocking(false);
    }
  }

  async function deletePost(id: number) {
    if (!confirm("Delete this post? Its images will also be removed from Cloudinary.")) return;
    setDeleting(id);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "DELETE",
        headers: { "x-admin-token": token },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to delete post");
      setMsg({ ok: true, text: "Post deleted (images removed from Cloudinary)." });
      refresh();
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    } finally {
      setDeleting(null);
    }
  }

  function onPublished() {
    setMsg({ ok: true, text: "Story published." });
    setView("list");
    refresh();
  }

  return (
    <div className="min-h-screen bg-black text-zinc-300">
      {view === "editor" && unlocked ? (
        <Editor
          token={token}
          onPublished={onPublished}
          onBack={() => {
            setView("list");
            refresh();
          }}
        />
      ) : (
        <main className="mx-auto max-w-3xl px-6 py-16">
          <a
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-10"
          >
            <ArrowLeft size={16} />
            Back to blog
          </a>

        {!unlocked ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 max-w-sm">
            <div className="flex items-center gap-2 mb-4">
              <Lock size={16} className="text-indigo-400" />
              <h1 className="font-bold text-white">Admin</h1>
            </div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && unlock()}
              placeholder="Password"
              autoFocus
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none mb-3"
            />
            <button
              onClick={unlock}
              disabled={unlocking}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50 transition-colors"
            >
              {unlocking && <Loader2 size={14} className="animate-spin" />}
              Unlock
            </button>
            {msg && !msg.ok && (
              <p className="mt-3 text-sm text-red-400">{msg.text}</p>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <BookOpen size={24} className="text-indigo-400" /> Blog Admin
              </h1>
              <button
                onClick={() => {
                  setMsg(null);
                  setView("editor");
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 transition-colors"
              >
                <PenLine size={15} /> Write a new story
              </button>
            </div>

            {msg && (
              <div
                className={`rounded-xl border p-4 text-sm mb-6 ${
                  msg.ok
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-red-500/30 bg-red-500/10 text-red-300"
                }`}
              >
                {msg.text}
              </div>
            )}

            <h2 className="font-semibold text-white mb-4">Stories ({posts.length})</h2>
            <div className="space-y-3">
              {posts.map(post => (
                <div
                  key={post.id}
                  className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4"
                >
                  {post.image_url ? (
                    <img src={post.image_url} alt={post.title} className="h-12 w-12 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-zinc-800 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-zinc-100 truncate">{post.title}</h3>
                    <p className="text-xs text-zinc-500">
                      {new Date(post.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => deletePost(post.id)}
                    disabled={deleting === post.id}
                    className="shrink-0 rounded-lg border border-zinc-800 p-2 text-zinc-500 hover:text-red-400 hover:border-red-500/50 transition-colors"
                    title="Delete post and its Cloudinary images"
                  >
                    {deleting === post.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
        </main>
      )}
    </div>
  );
}
