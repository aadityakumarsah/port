import { useEffect, useState } from "react";
import type { Editor as TiptapEditor } from "@tiptap/react";
import {
  Bold,
  Check,
  ChevronDown,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Underline,
  X,
} from "lucide-react";

const TEXT_COLORS = [
  { name: "Default", value: "default" },
  { name: "Red", value: "#f87171" },
  { name: "Orange", value: "#fb923c" },
  { name: "Green", value: "#4ade80" },
  { name: "Blue", value: "#60a5fa" },
  { name: "Indigo", value: "#818cf8" },
  { name: "Purple", value: "#c084fc" },
  { name: "Pink", value: "#f472b6" },
];

const HIGHLIGHT_COLORS = [
  { name: "None", value: "none" },
  { name: "Yellow", value: "#fef08a" },
  { name: "Green", value: "#bbf7d0" },
  { name: "Pink", value: "#fbcfe8" },
  { name: "Blue", value: "#bfdbfe" },
  { name: "Gray", value: "#e5e7eb" },
];

function Btn({
  active,
  onClick,
  title,
  children,
  dark = true,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <button
      type="button"
      onMouseDown={e => e.preventDefault()}
      onClick={onClick}
      title={title}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
        active
          ? "bg-white/20 text-white"
          : dark
            ? "text-zinc-300 hover:bg-white/10 hover:text-white"
            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
      }`}
    >
      {children}
    </button>
  );
}

export function SelectionToolbar({ editor }: { editor: TiptapEditor | null }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [flip, setFlip] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [hlOpen, setHlOpen] = useState(false);
  const [headOpen, setHeadOpen] = useState(false);

  useEffect(() => {
    if (!editor) return;
    const ed = editor;

    function update() {
      if (ed.isDestroyed || !ed.view.dom.isConnected) return;

      const { from, to } = ed.state.selection;
      const inEditor =
        ed.view.hasFocus() || ed.view.dom.contains(document.activeElement);

      const selectedText = ed.state.doc.textBetween(from, to, " ").trim();
      const inCodeBlock = ed.isActive("codeBlock");

      if (!inEditor || from === to || !selectedText || inCodeBlock) {
        setVisible(false);
        return;
      }

      const start = ed.view.coordsAtPos(from);
      const end = ed.view.coordsAtPos(to);
      const x = (start.left + end.right) / 2;
      const flipped = start.top - 70 < 0;
      setFlip(flipped);
      setPos({ x, y: flipped ? end.bottom : start.top });
      setVisible(true);
    }

    function hide() {
      setVisible(false);
    }

    ed.on("selectionUpdate", update);
    ed.on("update", update);
    ed.on("focus", update);
    ed.on("blur", hide);
    document.addEventListener("mouseup", update);
    document.addEventListener("keyup", update);
    document.addEventListener("selectionchange", update);
    window.addEventListener("scroll", hide, true);

    return () => {
      ed.off("selectionUpdate", update);
      ed.off("update", update);
      ed.off("focus", update);
      ed.off("blur", hide);
      document.removeEventListener("mouseup", update);
      document.removeEventListener("keyup", update);
      document.removeEventListener("selectionchange", update);
      window.removeEventListener("scroll", hide, true);
    };
  }, [editor]);

  if (!editor) return null;

  const activeColor = editor.getAttributes("textStyle").color as string | undefined;
  const activeHl = editor.getAttributes("highlight").color as string | undefined;

  const clampX = (x: number) => Math.max(260, Math.min(x, window.innerWidth - 260));

  return visible ? (
    <div
      onMouseDown={e => e.preventDefault()}
      className="fixed z-50 flex items-center gap-0.5 rounded-full border border-white/10 bg-zinc-900/95 px-2 py-1.5 shadow-2xl shadow-black/50 backdrop-blur"
      style={{
        left: clampX(pos.x),
        top: pos.y,
        transform: flip
          ? "translate(-50%, 14px)"
          : "translate(-50%, calc(-100% - 14px))",
      }}
    >
      {/* caret */}
      <div
        className={`absolute left-1/2 -ml-1.5 h-3 w-3 rotate-45 border-white/10 bg-zinc-900/95 ${
          flip
            ? "top-0 -mt-1.5 border-t border-l"
            : "top-full -mt-1.5 border-b border-r"
        }`}
      />

      {/* Headings */}
      <div className="relative" onClick={e => e.stopPropagation()}>
        <button
          type="button"
          onMouseDown={e => e.preventDefault()}
          onClick={() => setHeadOpen(o => !o)}
          className="flex h-8 items-center gap-0.5 rounded-lg px-1.5 text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Heading1 size={16} />
          <ChevronDown size={11} className="text-zinc-500" />
        </button>
        {headOpen && (
          <div
            className="absolute bottom-full left-1/2 z-50 mb-2 w-40 -translate-x-1/2 rounded-xl border border-zinc-700 bg-zinc-900 p-1.5 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {[
              { label: "Normal text", cmd: () => editor.chain().focus().setParagraph().run(), active: editor.isActive("paragraph") },
              { label: "Heading 1", cmd: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive("heading", { level: 1 }) },
              { label: "Heading 2", cmd: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }) },
              { label: "Heading 3", cmd: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive("heading", { level: 3 }) },
            ].map(item => (
              <button
                key={item.label}
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => {
                  item.cmd();
                  setHeadOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                  item.active ? "bg-white/10 font-semibold text-white" : "text-zinc-300 hover:bg-white/10"
                }`}
              >
                <span className="font-serif">{item.label}</span>
                {item.active && <Check size={13} className="text-emerald-400" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mx-0.5 h-5 w-px bg-white/15" />

      <Btn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold size={15} />
      </Btn>
      <Btn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic size={15} />
      </Btn>
      <Btn title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <Underline size={15} />
      </Btn>
      <Btn title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough size={15} />
      </Btn>
      <Btn title="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
        <Code size={15} />
      </Btn>
      <Btn
        title={editor.isActive("link") ? "Remove link" : "Add link"}
        active={editor.isActive("link")}
        onClick={() => {
          if (editor.isActive("link")) {
            editor.chain().focus().unsetLink().run();
          } else {
            const url = window.prompt("Paste URL:");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }
        }}
      >
        <LinkIcon size={15} />
      </Btn>

      <div className="mx-0.5 h-5 w-px bg-white/15" />

      <Btn title="Numbered list (1, 2, 3)" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered size={15} />
      </Btn>
      <Btn title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List size={15} />
      </Btn>
      <Btn title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote size={15} />
      </Btn>

      <div className="mx-0.5 h-5 w-px bg-white/15" />

      {/* Text color */}
      <div className="relative" onClick={e => e.stopPropagation()}>
        <button
          type="button"
          onMouseDown={e => e.preventDefault()}
          onClick={() => {
            setColorOpen(o => !o);
            setHlOpen(false);
          }}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/10 ${
            colorOpen || (activeColor && activeColor !== "default") ? "bg-white/20" : ""
          }`}
          title="Text color"
        >
          <span className="relative flex h-5 w-4 items-end justify-center">
            <span className="text-sm font-bold text-zinc-100">A</span>
            <span
              className="absolute bottom-0 h-[3px] w-full rounded-full"
              style={{ background: activeColor && activeColor !== "default" ? activeColor : "#a1a1aa" }}
            />
          </span>
        </button>
        {colorOpen && (
          <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-xl border border-zinc-700 bg-zinc-900 p-2 shadow-2xl">
            <div className="grid grid-cols-4 gap-1.5">
              {TEXT_COLORS.map(c => (
                <button
                  key={c.name}
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  title={c.name}
                  onClick={() => {
                    if (c.value === "default") editor.chain().focus().unsetColor().run();
                    else editor.chain().focus().setColor(c.value).run();
                    setColorOpen(false);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 transition-transform hover:scale-110"
                  style={{ background: c.value === "default" ? "#3f3f46" : c.value }}
                >
                  {c.value === "default" && <X size={11} className="text-zinc-400" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Highlight */}
      <div className="relative" onClick={e => e.stopPropagation()}>
        <button
          type="button"
          onMouseDown={e => e.preventDefault()}
          onClick={() => {
            setHlOpen(o => !o);
            setColorOpen(false);
          }}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/10 ${
            hlOpen || activeHl ? "bg-white/20" : ""
          }`}
          title="Highlight (note)"
        >
          <Highlighter size={15} className={activeHl ? "text-amber-300" : "text-zinc-300"} />
        </button>
        {hlOpen && (
          <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-xl border border-zinc-700 bg-zinc-900 p-2 shadow-2xl">
            <div className="flex items-center gap-1.5">
              {HIGHLIGHT_COLORS.map(c => (
                <button
                  key={c.name}
                  type="button"
                  onMouseDown={e => e.preventDefault()}
                  title={c.name}
                  onClick={() => {
                    if (c.value === "none") editor.chain().focus().unsetHighlight().run();
                    else editor.chain().focus().toggleHighlight({ color: c.value }).run();
                    setHlOpen(false);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 transition-transform hover:scale-110"
                  style={{ background: c.value === "none" ? "#3f3f46" : c.value }}
                >
                  {c.value === "none" && <X size={11} className="text-zinc-400" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  ) : null;
}
