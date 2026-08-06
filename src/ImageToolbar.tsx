import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Editor as TiptapEditor } from "@tiptap/react";
import { NodeSelection } from "@tiptap/pm/state";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ImageIcon,
  Loader2,
  Settings2,
  Trash2,
  X,
} from "lucide-react";

function parsePct(width: unknown): number {
  const s = typeof width === "string" ? width : "";
  const m = s.match(/^(\d+(?:\.\d+)?)%?$/);
  const n = m ? parseFloat(m[1] ?? "") : NaN;
  return Number.isFinite(n) && n > 0 ? Math.min(100, n) : 100;
}

function AlignBtn({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={e => e.preventDefault()}
      onClick={onClick}
      title={title}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
        active ? "bg-white/20 text-white" : "text-zinc-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

export function ImageToolbar({
  editor,
  token,
  uploading,
}: {
  editor: TiptapEditor | null;
  token: string;
  uploading: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [flip, setFlip] = useState(false);
  const [rect, setRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [widthPct, setWidthPct] = useState(100);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelY, setPanelY] = useState(0);
  const [panelFlip, setPanelFlip] = useState(false);
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [replacing, setReplacing] = useState(false);
  const [panelErr, setPanelErr] = useState<string | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const posRef = useRef<number | null>(null);

  useEffect(() => {
    if (!editor) return;
    const ed = editor;

    function captionAfter(imgPos: number, imgSize: number): string {
      const after = ed.state.doc.nodeAt(imgPos + imgSize);
      return after?.type.name === "caption" ? after.textContent : "";
    }

    function update() {
      if (ed.isDestroyed || !ed.view.dom.isConnected) return;
      const sel = ed.state.selection;
      if (!(sel instanceof NodeSelection) || sel.node.type.name !== "image") {
        posRef.current = null;
        setPanelOpen(false);
        setVisible(false);
        return;
      }
      const start = ed.view.coordsAtPos(sel.from);
      const end = ed.view.coordsAtPos(sel.to);
      setPos({ x: (start.left + end.right) / 2, y: start.top });
      setRect({
        x: start.left,
        y: start.top,
        w: end.right - start.left,
        h: end.bottom - start.top,
      });
      setWidthPct(parsePct(sel.node.attrs.width));
      setFlip(start.top - 70 < 0);
      setAlt((sel.node.attrs.alt as string) ?? "");
      setCaption(captionAfter(sel.from, sel.node.nodeSize));
      if (posRef.current !== null && posRef.current !== sel.from) {
        setPanelOpen(false);
      }
      posRef.current = sel.from;
      setVisible(true);
    }

    function hide() {
      setVisible(false);
      setPanelOpen(false);
    }

    function onDocMouseDown(e: MouseEvent) {
      const t = e.target as Node;
      const isInsideToolbar = rootRef.current?.contains(t) ?? false;
      const isInsideEditor = ed.view.dom.contains(t);
      if (!isInsideToolbar && !isInsideEditor) {
        hide();
      }
    }

    ed.on("selectionUpdate", update);
    ed.on("update", update);
    ed.on("focus", update);
    document.addEventListener("mousedown", onDocMouseDown);
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", update);

    return () => {
      ed.off("selectionUpdate", update);
      ed.off("update", update);
      ed.off("focus", update);
      document.removeEventListener("mousedown", onDocMouseDown);
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", update);
    };
  }, [editor]);

  useLayoutEffect(() => {
    if (panelOpen && panelRef.current && rect) {
      const h = panelRef.current.offsetHeight;
      const above = rect.y - h - 12;
      const below = rect.y + rect.h + 12;
      let y: number;
      let flipPanel: boolean;
      if (above >= 0) {
        y = above;
        flipPanel = false;
      } else if (below + h <= window.innerHeight) {
        y = below;
        flipPanel = true;
      } else {
        y = Math.max(8, Math.min(above, window.innerHeight - h - 8));
        flipPanel = false;
      }
      setPanelFlip(flipPanel);
      setPanelY(y);
    }
  }, [panelOpen, rect]);

  if (!editor || !visible) return null;
  const ed = editor;

  const sel = ed.state.selection;
  const align =
    sel instanceof NodeSelection && sel.node.type.name === "image"
      ? (sel.node.attrs.align as string) ?? "center"
      : "center";

  function setAlign(value: string) {
    ed.chain().focus().updateAttributes("image", { align: value }).run();
  }

  function remove() {
    ed.chain().focus().deleteSelection().run();
  }

  function resizeTo(pct: number) {
    const tr = ed.state.tr;
    const current = ed.state.selection;
    if (current instanceof NodeSelection && current.node.type.name === "image") {
      tr.setNodeMarkup(current.from, undefined, { ...current.node.attrs, width: `${pct}%` });
      tr.setMeta("addToHistory", false);
      ed.view.dispatch(tr);
    }
  }

  function setAltText(text: string) {
    setAlt(text);
    const current = ed.state.selection;
    if (current instanceof NodeSelection && current.node.type.name === "image") {
      const tr = ed.state.tr;
      tr.setNodeMarkup(current.from, undefined, { ...current.node.attrs, alt: text });
      tr.setMeta("addToHistory", false);
      ed.view.dispatch(tr);
    }
  }

  const captionNode = ed.schema.nodes.caption!;

  function upsertCaption(text: string) {
    setCaption(text);
    const current = ed.state.selection;
    if (!(current instanceof NodeSelection) || current.node.type.name !== "image") return;
    const imgPos = current.from;
    const afterPos = imgPos + current.node.nodeSize;
    const afterNode = ed.state.doc.nodeAt(afterPos);
    const tr = ed.state.tr;
    tr.setMeta("addToHistory", false);
    if (afterNode?.type.name === "caption") {
      if (text.trim()) {
        tr.replaceWith(afterPos, afterPos + afterNode.nodeSize, captionNode.create(null, ed.schema.text(text)));
      } else {
        tr.delete(afterPos, afterPos + afterNode.nodeSize);
      }
    } else if (text.trim()) {
      tr.insert(afterPos, captionNode.create(null, ed.schema.text(text)));
    }
    ed.view.dispatch(tr);
  }

  async function replaceImage(file: File) {
    setReplacing(true);
    setPanelErr(null);
    try {
      const form = new FormData();
      form.set("image", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "x-admin-token": token },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      const current = ed.state.selection;
      if (current instanceof NodeSelection && current.node.type.name === "image") {
        const tr = ed.state.tr;
        tr.setNodeMarkup(current.from, undefined, { ...current.node.attrs, src: data.url });
        tr.setMeta("addToHistory", false);
        ed.view.dispatch(tr);
      }
    } catch (err) {
      setPanelErr((err as Error).message);
    } finally {
      setReplacing(false);
    }
  }

  const containerWidth = ed.view.dom.clientWidth || 600;

  function onHandleDown(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startPct = widthPct;
    function onMove(ev: MouseEvent) {
      const pct = Math.round(
        Math.min(100, Math.max(10, startPct + ((ev.clientX - startX) / containerWidth) * 100))
      );
      resizeTo(pct);
    }
    function onUp() {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  function onSliderDown(e: React.MouseEvent) {
    e.preventDefault();
    const track = sliderRef.current;
    if (!track) return;
    const trackRect = track.getBoundingClientRect();
    function setFromX(clientX: number) {
      const pct = Math.round(
        Math.min(100, Math.max(10, ((clientX - trackRect.left) / trackRect.width) * 100))
      );
      resizeTo(pct);
    }
    setFromX(e.clientX);
    function onMove(ev: MouseEvent) {
      setFromX(ev.clientX);
    }
    function onUp() {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  const clampX = (x: number, margin: number) =>
    Math.max(margin, Math.min(x, window.innerWidth - margin));

  return (
    <div ref={rootRef}>
      <div
        onMouseDown={e => e.preventDefault()}
        className="fixed z-50 flex items-center gap-0.5 rounded-full border border-white/10 bg-zinc-900/95 px-2 py-1.5 shadow-2xl shadow-black/50 backdrop-blur"
        style={{
          left: clampX(pos.x, 280),
          top: flip && rect ? rect.y + rect.h : pos.y,
          transform: flip ? "translate(-50%, 14px)" : "translate(-50%, calc(-100% - 14px))",
        }}
      >
        {/* caret */}
        <div
          className={`absolute left-1/2 -ml-1.5 h-3 w-3 rotate-45 border-white/10 bg-zinc-900/95 ${
            flip ? "top-0 -mt-1.5 border-t border-l" : "top-full -mt-1.5 border-b border-r"
          }`}
        />

        <AlignBtn title="Align left" active={align === "left"} onClick={() => setAlign("left")}>
          <AlignLeft size={15} />
        </AlignBtn>
        <AlignBtn title="Align center" active={align === "center"} onClick={() => setAlign("center")}>
          <AlignCenter size={15} />
        </AlignBtn>
        <AlignBtn title="Align right" active={align === "right"} onClick={() => setAlign("right")}>
          <AlignRight size={15} />
        </AlignBtn>

        <div className="mx-1 h-5 w-px bg-white/15" />

        <div
          ref={sliderRef}
          onMouseDown={onSliderDown}
          className="flex h-8 w-20 cursor-pointer items-center"
          title="Image width"
        >
          <div className="relative h-1 w-full rounded-full bg-white/20">
            <div
              className="absolute left-0 top-0 h-1 rounded-full bg-indigo-400"
              style={{ width: `${widthPct}%` }}
            />
            <div
              className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow"
              style={{ left: `${widthPct}%` }}
            />
          </div>
        </div>
        <span className="w-8 text-right text-[10px] font-medium tabular-nums text-zinc-400">
          {widthPct}%
        </span>

        <div className="mx-1 h-5 w-px bg-white/15" />

        <AlignBtn title="Edit image" active={panelOpen} onClick={() => setPanelOpen(o => !o)}>
          <Settings2 size={15} />
        </AlignBtn>

        <AlignBtn title="Delete image" active={false} onClick={remove}>
          <Trash2 size={15} className="text-red-400" />
        </AlignBtn>
      </div>

      {/* resize handle */}
      {rect && (
        <div
          onMouseDown={onHandleDown}
          className="fixed z-50 h-3.5 w-3.5 cursor-nwse-resize rounded-full border-2 border-white bg-zinc-900 shadow-lg"
          style={{ left: rect.x + rect.w, top: rect.y + rect.h, transform: "translate(50%, 50%)" }}
          title="Drag to resize"
        />
      )}

      {/* upload progress */}
      {uploading && rect && (
        <div
          className="fixed z-50 flex items-center gap-2 rounded-full bg-black/75 px-3 py-1.5 text-xs font-medium text-white shadow-xl backdrop-blur"
          style={{
            left: rect.x + rect.w / 2,
            top: rect.y + rect.h / 2,
            transform: "translate(-50%, -50%)",
          }}
        >
          <Loader2 size={13} className="animate-spin" />
          Uploading...
        </div>
      )}

      {/* settings panel */}
      {panelOpen && (
        <div
          ref={panelRef}
          onMouseDown={e => e.preventDefault()}
          className="fixed z-50 w-72 rounded-2xl border border-zinc-700 bg-zinc-900 p-4 shadow-2xl shadow-black/60"
          style={{
            left: clampX(pos.x, 160),
            top: panelY,
            transform: panelFlip ? "translate(-50%, 0)" : "translate(-50%, -12px)",
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Image settings</h3>
            <button
              type="button"
              onClick={() => setPanelOpen(false)}
              className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Close settings"
            >
              <X size={15} />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                Replace image
              </label>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={replacing}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800 disabled:opacity-50 transition-colors"
              >
                {replacing ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                {replacing ? "Uploading..." : "Choose a new image"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) replaceImage(file);
                  e.target.value = "";
                }}
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                Alt text
              </label>
              <input
                value={alt}
                onChange={e => setAltText(e.target.value)}
                placeholder="Describe the image"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                Caption
              </label>
              <input
                value={caption}
                onChange={e => upsertCaption(e.target.value)}
                placeholder="Add a caption below the image"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                Size
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[100, 70, 50, 25].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => resizeTo(pct)}
                    className={`rounded-lg border px-2 py-1.5 text-xs font-semibold transition-colors ${
                      Math.round(widthPct) === pct
                        ? "border-indigo-400 bg-indigo-500/20 text-indigo-200"
                        : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {panelErr && <p className="text-xs text-red-400">{panelErr}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
