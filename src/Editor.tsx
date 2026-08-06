import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import type { Transaction } from "@tiptap/pm/state";
import StarterKit from "@tiptap/starter-kit";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import { mergeAttributes } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import {
  Bell,
  Bold,
  ChevronDown,
  ChevronLeft,
  Code,
  Eye,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Loader2,
  Minus,
  MoreHorizontal,
  Quote,
  Strikethrough,
  Underline as UnderlineIcon,
  Video,
  X,
} from "lucide-react";
import { formatSmartText, htmlToText, isDiagramText, isJsonText, isPlainPaste } from "./lib/smartPaste";
import { supabase } from "./lib/supabase";
import { SelectionToolbar } from "./SelectionToolbar";
import { ImageToolbar } from "./ImageToolbar";

const DRAFT_KEY = "blog_editor_draft";

interface Draft {
  title: string;
  html: string;
}

interface EditorProps {
  post?: { id: number; title: string; content?: string | null } | null;
  onPublished: () => void;
  onBack: () => void;
}

type Status = "draft" | "saving" | "saved" | "publishing";

const STATUS_TEXT: Record<Status, string> = {
  draft: "Draft",
  saving: "Drafting...",
  saved: "Draft saved",
  publishing: "Publishing...",
};

function loadDraft(): Draft {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null") ?? { title: "", html: "" };
  } catch {
    return { title: "", html: "" };
  }
}

function toVideoEmbed(url: string) {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (yt) {
    return `<iframe width="100%" height="420" src="https://www.youtube.com/embed/${yt[1]}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  }
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) {
    return `<iframe width="100%" height="420" src="https://player.vimeo.com/video/${vimeo[1]}" frameborder="0" allowfullscreen></iframe>`;
  }
  return null;
}

export function Editor({ post, onPublished, onBack }: EditorProps) {
  const [title, setTitle] = useState(() => post?.title ?? loadDraft().title);
  const [status, setStatus] = useState<Status>("draft");
  const [plusPos, setPlusPos] = useState<{ x: number; y: number } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [chHighlight, setChHighlight] = useState(() => localStorage.getItem("chHighlight") !== "off");
  const chHighlightRef = useRef(chHighlight);
  useEffect(() => { chHighlightRef.current = chHighlight; }, [chHighlight]);
  const [msg, setMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const dragCount = useRef(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const htmlRef = useRef<string>(post?.content ?? loadDraft().html);

  const editorRef = useRef<ReturnType<typeof useEditor>>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({
        lowlight: createLowlight(common),
      }),
      Image.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            align: {
              default: "center",
              parseHTML: el => el.getAttribute("data-align") ?? "center",
              renderHTML: attrs =>
                attrs.align && attrs.align !== "center" ? { "data-align": attrs.align } : {},
            },
          };
        },
      }).configure({ allowBase64: false }),
      Paragraph.extend({
        name: "caption",
        group: "block",
        content: "inline*",
        defining: true,
        parseHTML: () => [{ tag: "p[data-type='caption']" }],
        renderHTML: ({ HTMLAttributes }) => [
          "p",
          mergeAttributes(HTMLAttributes, { "data-type": "caption" }),
          0,
        ],
      }),
      Paragraph.extend({
        name: "tableNote",
        group: "block",
        content: "inline*",
        defining: true,
        parseHTML: () => [{ tag: "p[data-type='table-note']", priority: 60 }],
        renderHTML: ({ HTMLAttributes }) => [
          "p",
          mergeAttributes(HTMLAttributes, { "data-type": "table-note" }),
          0,
        ],
      }),
      Placeholder.configure({ placeholder: "Tell your story..." }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Underline,
      TextStyle,
      Color.configure({ types: ["textStyle"] }),
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        autolink: false,
        defaultProtocol: "https",
      }),
    ],
    content: htmlRef.current,
    editorProps: {
      attributes: { class: "tip-canvas" },
      handlePaste(view, event) {
        const ed = editorRef.current;
        if (!ed) return false;
        const cd = event.clipboardData;
        if (!cd) return false;
        const html = cd.getData("text/html") || null;

        if (!isPlainPaste(html)) return false;

        const text = cd.getData("text/plain") || (html ? htmlToText(html) : "");
        if (!text.trim()) return false;

        event.preventDefault();
        if (isJsonText(text)) {
          const body = text
            .replace(/\u00a0/g, " ")
            .replace(/^[\r\n]+/, "")
            .replace(/[\r\n]+$/, "");
          ed.chain()
            .focus()
            .insertContent({
              type: "codeBlock",
              attrs: { language: "json" },
              content: body ? [{ type: "text", text: body }] : undefined,
            })
            .run();
          return true;
        }
        if (isDiagramText(text)) {
          const body = text
            .replace(/\u00a0/g, " ")
            .replace(/^[\r\n]+/, "")
            .replace(/[\r\n]+$/, "");
          ed.chain()
            .focus()
            .insertContent({ type: "codeBlock", content: body ? [{ type: "text", text: body }] : undefined })
            .run();
          return true;
        }
        ed.chain().focus().insertContent(formatSmartText(text, { highlightChapters: chHighlight })).run();
        return true;
      },
      handleDrop(view, event) {
        setDragOver(false);
        const dt = event.dataTransfer;
        if (!dt) return false;
        if (dt.types.includes("application/x-prosemirror-slice")) return false;

        const dropPos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;

        const files = Array.from(dt.files ?? []);
        const images = files.filter(f => f.type.startsWith("image/"));
        if (images.length > 0) {
          event.preventDefault();
          images.forEach(file => uploadImage(file, dropPos));
          return true;
        }

        const uri = dt.getData("text/uri-list") || dt.getData("text/plain");
        if (uri && /\.(png|jpe?g|gif|webp|svg|avif)([?#]|$)/i.test(uri)) {
          event.preventDefault();
          const url = uri.split("\n")[0]!.trim();
          const ed = editorRef.current;
          if (ed && dropPos != null) {
            let existingPos: number | null = null;
            ed.state.doc.descendants((node, p) => {
              if (node.type.name === "image" && node.attrs.src === url) {
                existingPos = p;
                return false;
              }
              return true;
            });
            if (
              existingPos != null &&
              !(dropPos >= existingPos && dropPos <= existingPos + (ed.state.doc.nodeAt(existingPos)?.nodeSize ?? 0))
            ) {
              const node = ed.state.doc.nodeAt(existingPos);
              if (node) {
                const delTr = ed.state.tr;
                delTr.delete(existingPos, existingPos + node.nodeSize);
                ed.view.dispatch(delTr);
                const insertAt = delTr.mapping.map(dropPos);
                editorRef.current
                  ?.chain()
                  .focus()
                  .insertContentAt(insertAt, node, { updateSelection: true })
                  .run();
                scheduleSave();
                return true;
              }
            }
          }
          if (dropPos != null) {
            editorRef.current
              ?.chain()
              .insertContentAt(dropPos, { type: "image", attrs: { src: url } }, { updateSelection: true })
              .run();
          } else {
            editorRef.current?.chain().focus().setImage({ src: url }).run();
          }
          scheduleSave();
          return true;
        }
        return false;
      },
      handleDOMEvents: {
        dragenter: () => {
          dragCount.current++;
          setDragOver(true);
          return false;
        },
        dragleave: () => {
          dragCount.current = Math.max(0, dragCount.current - 1);
          if (dragCount.current === 0) setDragOver(false);
          return false;
        },
        dragover(view, event) {
          const dt = event.dataTransfer;
          if (dt && Array.from(dt.types).includes("Files")) {
            event.preventDefault();
          }
          return false;
        },
      },
    },
    onUpdate: ({ editor }) => {
      htmlRef.current = editor.getHTML();
      scheduleSave();
    },
  });

  editorRef.current = editor;

  function scheduleSave() {
    setStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, html: htmlRef.current }));
      setStatus("saved");
    }, 800);
  }

  useEffect(() => {
    if (!editor) return;

    function updatePlus() {
      const { from } = editor.state.selection;
      const child = editor.state.doc.childBefore(from);
      const node = child?.node ?? editor.state.doc.nodeAt(from);
      const isEmpty = node?.type.name === "paragraph" && node.content.size === 0;
      if (isEmpty) {
        const coords = editor.view.coordsAtPos(from);
        setPlusPos({ x: coords.left - 34, y: coords.top + 10 });
      } else if (!menuOpen) {
        setPlusPos(null);
      }
    }

    editor.on("selectionUpdate", updatePlus);
    editor.on("update", updatePlus);
    return () => {
      editor.off("selectionUpdate", updatePlus);
      editor.off("update", updatePlus);
    };
  }, [editor, menuOpen]);

  const canPublish = title.trim().length > 0 && !!editor && !editor.isEmpty;

  const skipImageDeleteRef = useRef(false);

  function storagePathFromUrl(src: string): string | null {
    const m = src.match(/\/storage\/v1\/object\/public\/post-images\/(.+)/);
    return m ? decodeURIComponent(m[1] ?? "") : null;
  }

  useEffect(() => {
    if (!editor) return;
    const ed = editor;

    function collectStorageSrcs(doc: typeof ed.state.doc): Set<string> {
      const srcs = new Set<string>();
      doc.descendants(node => {
        if (node.type.name === "image") {
          const src = String(node.attrs.src ?? "");
          if (src.includes("/storage/v1/object/public/post-images/")) srcs.add(src);
        }
        return true;
      });
      return srcs;
    }

    function deleteFromStorage(src: string) {
      const path = storagePathFromUrl(src);
      if (path) supabase?.storage.from("post-images").remove([path]).catch(() => {});
    }

    const pending = new Map<string, ReturnType<typeof setTimeout>>();

    const onTransaction = ({ transaction: tr }: { transaction: Transaction }) => {
      if (!tr.docChanged || skipImageDeleteRef.current) return;
      const before = collectStorageSrcs(tr.before as never);
      const after = collectStorageSrcs(tr.doc as never);
      before.forEach(src => {
        if (after.has(src) || pending.has(src)) return;
        pending.set(
          src,
          setTimeout(() => {
            pending.delete(src);
            let stillPresent = false;
            ed.state.doc.descendants(node => {
              if (node.type.name === "image" && node.attrs.src === src) {
                stillPresent = true;
                return false;
              }
              return true;
            });
            if (!stillPresent) deleteFromStorage(src);
          }, 4000)
        );
      });
    };

    ed.on("transaction", onTransaction);

    return () => {
      ed.off("transaction", onTransaction);
      pending.forEach(t => clearTimeout(t));
      pending.clear();
    };
  }, [editor]);

  async function publish() {
    if (!editor || !supabase) return;
    setStatus("publishing");
    setMsg(null);
    try {
      const payload = { title: title.trim(), content: editor.getHTML() };
      const { error } = post
        ? await supabase.from("posts").update(payload).eq("id", post.id)
        : await supabase.from("posts").insert(payload);
      if (error) throw new Error(error.message);
      localStorage.removeItem(DRAFT_KEY);
      htmlRef.current = "";
      skipImageDeleteRef.current = true;
      editor.commands.clearContent();
      skipImageDeleteRef.current = false;
      setTitle("");
      onPublished();
    } catch (err) {
      setMsg((err as Error).message);
      setStatus("saved");
    }
  }

  async function uploadImage(file: File, pos?: number) {
    const previewUrl = URL.createObjectURL(file);
    setUploading(true);
    setMsg(null);
    try {
      if (pos != null) {
        editorRef.current
          ?.chain()
          .insertContentAt(
            pos,
            { type: "image", attrs: { src: previewUrl, alt: file.name } },
            { updateSelection: true }
          )
          .run();
      } else {
        editorRef.current?.chain().focus().setImage({ src: previewUrl, alt: file.name }).run();
      }

      const path = `posts/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${file.name
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .slice(-60)}`;
      const { data, error } = await supabase!.storage.from("post-images").upload(path, file);
      if (error) throw new Error(error.message);
      const url = supabase!.storage.from("post-images").getPublicUrl(path).data.publicUrl;

      const ed = editorRef.current;
      if (ed) {
        let foundPos: number | null = null;
        ed.state.doc.descendants((node, p) => {
          if (node.type.name === "image" && node.attrs.src === previewUrl) {
            foundPos = p;
            return false;
          }
          return true;
        });
        if (foundPos != null) {
          const node = ed.state.doc.nodeAt(foundPos);
          if (node) {
            const tr = ed.state.tr;
            tr.setNodeMarkup(foundPos, undefined, { ...node.attrs, src: url });
            ed.view.dispatch(tr);
          }
        }
      }
      scheduleSave();
    } catch (err) {
      const ed = editorRef.current;
      if (ed) {
        let fpos: number | null = null;
        ed.state.doc.descendants((node, p) => {
          if (node.type.name === "image" && node.attrs.src === previewUrl) {
            fpos = p;
            return false;
          }
          return true;
        });
        if (fpos != null) {
          const node = ed.state.doc.nodeAt(fpos);
          if (node) {
            const tr = ed.state.tr;
            tr.delete(fpos, fpos + node.nodeSize);
            ed.view.dispatch(tr);
          }
        }
      }
      setMsg((err as Error).message);
    } finally {
      URL.revokeObjectURL(previewUrl);
      setUploading(false);
      setMenuOpen(false);
    }
  }

  function insertEmbed() {
    setMenuOpen(false);
    const html = window.prompt("Paste embed code (HTML):");
    if (!html) return;
    editor?.chain().focus().insertContent(html).run();
    scheduleSave();
  }

  function insertVideo() {
    setMenuOpen(false);
    const url = window.prompt("Paste video URL (YouTube / Vimeo):");
    if (!url) return;
    const embed = toVideoEmbed(url);
    if (!embed) {
      setMsg("Could not detect a YouTube or Vimeo URL.");
      return;
    }
    editor?.chain().focus().insertContent(embed).run();
    scheduleSave();
  }

  function insertDivider() {
    setMenuOpen(false);
    editor?.chain().focus().setHorizontalRule().run();
    scheduleSave();
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900">


      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-zinc-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="hidden sm:inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-black transition-colors shrink-0"
            >
              <ChevronLeft size={16} /> Dashboard
            </button>
            <a href="/blog" className="font-serif font-extrabold text-2xl tracking-tight text-black shrink-0">
              Aaditya
            </a>
            <span className="text-sm text-zinc-400 whitespace-nowrap">{STATUS_TEXT[status]}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                const nv = !chHighlight;
                setChHighlight(nv);
                localStorage.setItem("chHighlight", nv ? "on" : "off");
              }}
              title="Auto-highlight chapter references (Ch N) when pasting"
              aria-pressed={chHighlight}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                chHighlight
                  ? "border-amber-300 bg-amber-50 text-amber-700"
                  : "border-zinc-200 bg-white text-zinc-400 hover:text-zinc-600"
              }`}
            >
              <Highlighter size={13} />
              <span className="hidden sm:inline">{chHighlight ? "Chapters on" : "Chapters off"}</span>
            </button>
            <button
              onClick={publish}
              disabled={!canPublish || status === "publishing"}
              className="inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-1.5 text-sm font-semibold text-white hover:bg-green-700 disabled:bg-green-200 disabled:cursor-not-allowed transition-colors"
            >
              {status === "publishing" && <Loader2 size={14} className="animate-spin" />}
              Publish
            </button>

            <div className="relative">
              <button
                onClick={() => setMoreOpen(o => !o)}
                className="p-2 rounded-full text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors"
                aria-label="More options"
              >
                <MoreHorizontal size={20} />
              </button>
              {moreOpen && (
                <div className="absolute right-0 top-11 w-52 rounded-xl border border-zinc-200 bg-white shadow-lg p-1.5 z-50">
                  <button
                    onClick={() => { setMoreOpen(false); setPreviewOpen(true); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-700 hover:bg-zinc-100 transition-colors"
                  >
                    <Eye size={15} /> Story preview
                  </button>
                  <button
                    onClick={() => { setMoreOpen(false); setMsg(null); localStorage.removeItem(DRAFT_KEY); htmlRef.current = ""; editor?.commands.clearContent(); setTitle(""); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-700 hover:bg-zinc-100 transition-colors"
                  >
                    <X size={15} /> Clear draft
                  </button>
                </div>
              )}
            </div>

            <button className="hidden sm:inline-flex p-2 rounded-full text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors" aria-label="Notifications">
              <Bell size={20} />
            </button>

            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              AS
            </div>
          </div>
        </div>
      </header>

      {/* Canvas */}
      <main className="mx-auto max-w-3xl px-5 sm:px-8 pt-14 sm:pt-16 pb-32">
        <textarea
          value={title}
          onChange={e => {
            setTitle(e.target.value);
            e.currentTarget.style.height = "auto";
            e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
            scheduleSave();
          }}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              editor?.commands.focus("end");
            }
          }}
          rows={1}
          placeholder="Title"
          className="w-full resize-none overflow-hidden bg-transparent outline-none placeholder:text-zinc-300 font-serif font-bold text-4xl sm:text-5xl text-black leading-tight"
        />

        <div className={`relative mt-2 ${dragOver ? "rounded-xl outline-2 outline-dashed outline-indigo-400/80 outline-offset-4" : ""}`}>
          <SelectionToolbar editor={editor} />
          <ImageToolbar editor={editor} uploading={uploading} />
          <EditorContent editor={editor} />

          {dragOver && (
            <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
              <span className="rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white shadow-xl">
                Drop to upload image
              </span>
            </div>
          )}

          {plusPos && (
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="fixed z-30 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-black shadow-sm transition-colors"
              style={{ left: plusPos.x, top: plusPos.y }}
              aria-label="Insert block"
            >
              {menuOpen ? <X size={15} /> : <Minus size={15} />}
            </button>
          )}

          {menuOpen && plusPos && (
            <div
              className="fixed z-30 w-60 rounded-xl border border-zinc-200 bg-white shadow-xl p-1.5"
              style={{ left: Math.min(plusPos.x, window.innerWidth - 260), top: plusPos.y - 8, transform: "translateX(-100%)" }}
            >
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 transition-colors"
              >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />} Image
              </button>
              <button
                onClick={insertVideo}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                <Video size={16} /> Video
              </button>
              <button
                onClick={insertEmbed}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                <Code size={16} /> Embed code
              </button>
              <button
                onClick={insertDivider}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                <Minus size={16} /> Section divider
              </button>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) uploadImage(file);
              e.target.value = "";
            }}
          />
        </div>

        {msg && <p className="mt-6 text-sm text-red-600">{msg}</p>}
      </main>

      {/* Preview modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 overflow-y-auto p-4 sm:p-10" onClick={() => setPreviewOpen(false)}>
          <div
            className="w-full max-w-3xl bg-white rounded-2xl p-8 sm:p-12 my-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif font-bold text-2xl text-black">Story preview</h2>
              <button onClick={() => setPreviewOpen(false)} className="p-2 rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-black transition-colors">
                <X size={18} />
              </button>
            </div>
            {title ? (
              <h1 className="font-serif font-bold text-4xl text-black leading-tight mb-6">{title}</h1>
            ) : (
              <p className="font-serif text-zinc-400 text-2xl mb-6 italic">Title</p>
            )}
            <div className="tip-canvas" dangerouslySetInnerHTML={{ __html: htmlRef.current || "<p></p>" }} />
          </div>
        </div>
      )}
    </div>
  );
}
