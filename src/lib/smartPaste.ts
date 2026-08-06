// Medium-style smart paste: parses plain text into structured HTML
// - short lines without terminal punctuation -> headings (uppercase/dash lines -> h2, else h3)
// - "1. / 1) " lines -> auto-numbered ordered list
// - "- / * / bullet" lines -> bulleted list
// - blank lines -> paragraph breaks
// - **bold**, *italic*, `code`, and bare URLs -> inline formatting

export function formatSmartText(text: string, opts?: { highlightChapters?: boolean }): string {
  const hl = opts?.highlightChapters ?? false;
  // light tree decoration (│ ├ └ ▼ ...) around prose gets stripped; real ASCII
  // diagrams never reach here (handlePaste routes them to code blocks first)
  text = stripTreeDecoration(text);
  const lines = text.split(/\r?\n/);
  const blocks: string[] = [];
  let i = 0;
  let lastBlockWasTable = false;
  let blankSinceLastBlock = false;

  while (i < lines.length) {
    const line = lines[i] ?? "";
    const trimmed = line.trim();

    if (trimmed === "") {
      i++;
      blankSinceLastBlock = true;
      continue;
    }

    // comparison table: tab-separated or pipe-separated rows (copied from markdown)
    if (isTableRow(trimmed)) {
      const rows: string[][] = [];
      while (i < lines.length) {
        const t = (lines[i] ?? "").trim();
        if (!isTableRow(t)) break;
        i++;
        // markdown separator row "|---|---|" or "| :--- | :---: |"
        if (t.includes("-") && /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/.test(t)) continue;
        const cells = t.startsWith("|")
          ? t.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map(c => c.trim())
          : t.split("\t").map(c => c.trim());
        rows.push(cells);
      }
      if (rows.length >= 2) {
        blocks.push(buildTable(rows, hl));
        lastBlockWasTable = true;
        blankSinceLastBlock = false;
        continue;
      }
      // not enough rows to be a table -> fall through as paragraph-ish content
    }

    // ordered list (1. / 1) / (1) )
    if (/^(?:\d+[.)]|\(\d+\))\s+/.test(trimmed)) {
      // single numbered line directly followed by a table -> section title, not a list item
      const next = (lines[i + 1] ?? "").trim();
      if (isTableRow(next)) {
        const base = trimmed.replace(/^(?:\d+[.)]|\(\d+\))\s+/, "");
        const tag = /^[A-Z0-9][A-Z0-9 /&():,—-]*$/.test(base) ? "h2" : "h3";
        blocks.push(`<${tag}>${inlineMarkdown(base, hl)}</${tag}>`);
        i++;
        lastBlockWasTable = false;
        blankSinceLastBlock = false;
        continue;
      }
      const items: string[] = [];
      while (i < lines.length) {
        const t = (lines[i] ?? "").trim();
        if (/^(?:\d+[.)]|\(\d+\))\s+/.test(t)) {
          items.push(inlineMarkdown(t.replace(/^(?:\d+[.)]|\(\d+\))\s+/, ""), hl));
          i++;
        } else {
          break;
        }
      }
      blocks.push(`<ol>${items.map(x => `<li>${x}</li>`).join("")}</ol>`);
      continue;
    }

    // bulleted list (- / * / • / – / — )
    if (/^[-*•–—]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length) {
        const t = (lines[i] ?? "").trim();
        if (/^[-*•–—]\s+/.test(t)) {
          items.push(inlineMarkdown(t.replace(/^[-*•–—]\s+/, ""), hl));
          i++;
        } else {
          break;
        }
      }
      blocks.push(`<ul>${items.map(x => `<li>${x}</li>`).join("")}</ul>`);
      continue;
    }

    // heading
    if (isHeading(trimmed)) {
      const base = trimmed.replace(/\s*\(\d+\s*(?:lines|points|items|bullets?)\)\s*$/i, "");
      const tag = /^[A-Z0-9][A-Z0-9 /&():,—-]*$/.test(base) || (/(—|–|-)/.test(trimmed) && /[A-Z]/.test(trimmed)) ? "h2" : "h3";
      blocks.push(`<${tag}>${inlineMarkdown(trimmed, hl)}</${tag}>`);
      i++;

      // "(N lines / N points)" marker on the heading -> auto-number the next N lines as 1., 2., 3. ...
      const countMatch = trimmed.match(/\((\d+)\s*(?:lines|points|items|bullets?)\)/i);
      if (countMatch) {
        const max = parseInt(countMatch[1] ?? "0", 10);
        const items: string[] = [];
        while (i < lines.length && items.length < max) {
          const t = (lines[i] ?? "").trim();
          i++;
          if (t === "") continue; // blank lines between points are separators, not item boundaries
          if (/^(?:\d+[.)]|\(\d+\))\s+/.test(t)) {
            items.push(inlineMarkdown(t.replace(/^(?:\d+[.)]|\(\d+\))\s+/, ""), hl));
          } else {
            items.push(inlineMarkdown(t, hl));
          }
        }
        // keep numbering if more lines follow without a blank line or a new heading
        while (i < lines.length) {
          const t = (lines[i] ?? "").trim();
          if (t === "" || isHeading(t) || /^(?:\d+[.)]|\(\d+\))\s+/.test(t)) break;
          items.push(inlineMarkdown(t, hl));
          i++;
        }
        if (items.length > 0) {
          blocks.push(`<ol>${items.map(x => `<li>${x}</li>`).join("")}</ol>`);
        }
      } else if (/^PART\s+\d/i.test(trimmed)) {
        // "PART N — ..." heading without a count marker -> number all following
        // non-blank lines as 1., 2., 3. ... until a blank line or a new heading
        const items: string[] = [];
        while (i < lines.length) {
          const t = (lines[i] ?? "").trim();
          if (t === "" || isHeading(t)) break;
          i++;
          if (/^(?:\d+[.)]|\(\d+\))\s+/.test(t)) {
            items.push(inlineMarkdown(t.replace(/^(?:\d+[.)]|\(\d+\))\s+/, ""), hl));
          } else {
            items.push(inlineMarkdown(t, hl));
          }
        }
        if (items.length > 0) {
          blocks.push(`<ol>${items.map(x => `<li>${x}</li>`).join("")}</ol>`);
        }
      }
      continue;
    }

    // paragraph: Medium-style. A line that does not end a sentence/label
    // (. ! ? : )) pulls in following lowercase continuation lines, so
    // text that was line-wrapped when copied stays one paragraph.
    if (lastBlockWasTable && !blankSinceLastBlock) {
      // text right after a table (no blank line) -> small faded note under it
      blocks.push(`<p data-type="table-note">${inlineMarkdown(line, hl)}</p>`);
      lastBlockWasTable = false;
    } else {
      let para = line;
      while (i + 1 < lines.length) {
        const next = (lines[i + 1] ?? "").trim();
        if (next === "" || /^[.!?：:)]$/.test(para.slice(-1))) break;
        if (!/^[a-z]/.test(next)) break;
        if (
          isTableRow(next) ||
          isHeading(next) ||
          /^(?:\d+[.)]|\(\d+\))\s+/.test(next) ||
          /^[-*•–—]\s+/.test(next)
        ) {
          break;
        }
        para = `${para} ${next}`;
        i++;
      }
      blocks.push(`<p>${inlineMarkdown(para, hl)}</p>`);
    }
    i++;
    blankSinceLastBlock = false;
  }

  return blocks.join("");
}

function isTableRow(line: string): boolean {
  return line.includes("\t") || /^\s*\|.*\|\s*$/.test(line);
}

function buildTable(rows: string[][], hl: boolean): string {
  const cols = Math.max(1, ...rows.map(r => r.length));
  const norm = rows.map(r => {
    const c = [...r];
    while (c.length < cols) c.push("");
    return c;
  });
  const head = norm[0] ?? [];
  const body = norm.slice(1);
  const th = head.map(c => `<th>${inlineMarkdown(c, hl)}</th>`).join("");
  const trs = body
    .map(r => `<tr>${r.map(c => `<td>${inlineMarkdown(c, hl)}</td>`).join("")}</tr>`)
    .join("");
  return `<table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`;
}

function isHeading(line: string): boolean {
  if (line.length > 90) return false;
  if (/[.!?:;,]\.?$/.test(line)) return false;
  if (/^(?:\d+[.)]|\(\d+\))\s/.test(line) || /^[-*•–—]\s/.test(line)) return false;
  // only lines that actually look like titles: uppercase-dominant, or a
  // "X — Y" / "X – Y" pair, or an explicit PART/SECTION/CHAPTER prefix.
  // plain short prose ("(tests green) push") stays a paragraph.
  if (line.length > 70) return false;
  if (/^[A-Z0-9][A-Z0-9 /&():,—-]*$/.test(line)) return true;
  if (/(—|–)/.test(line) && /[A-Z]/.test(line)) return true;
  return /^(PART|SECTION|CHAPTER)\b/i.test(line);
}

export function inlineMarkdown(text: string, highlightChapters = false): string {
  let out = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  if (highlightChapters) {
    // "(Ch 18)", "(Ch 37-39)", "(Ch 25, → Part 4)" -> highlighted chapter refs
    // (a real <mark> so Tiptap's Highlight extension keeps the color)
    out = out.replace(
      /(\(Ch\s*\d+(?:-\d+)?(?:[\s,，]+(?:→|->)\s*Part\s*\d+)?\))/gi,
      '<mark data-color="#fef3c7">$1</mark>',
    );
  }
  return out
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/(^|\s)(https?:\/\/[^\s]+)/g, '$1<a href="$2" rel="nofollow">$2</a>');
}

// Convert a minimal-HTML paste (divs/brs only) back to text so it gets smart-formatted too
export function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|blockquote|tr|section)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// True when the pasted HTML carries no meaningful formatting (divs/brs only)
export function isPlainPaste(html: string | null): boolean {
  if (!html) return true;
  return !/<(b|strong|i|em|u|a\b|h[1-6]|li|ol|ul|img|iframe|blockquote|pre|code|table)\b/i.test(html);
}

const DIAGRAM_GLYPH_RE = /[─│┌┐└┘├┤┬┴┼═║╔╗╚╝╠╣╦╩╬▼▲►◄→←↑↓↔]/g;
const ASCII_BOX_RE = /[+]/g;
const ARROW_TOKEN_RE = /(→|←|↓|↑|↔|➜|⟶|⇢|▼|▲|-->|==>|->|=>)/g;

// Leading tree decoration on prose lines ("   ├─ checks pass", "  │  note:")
// is stripped before smart formatting. Bullets (- * • — –) and prose arrows
// (→ ←) are left alone, as are real em/en dashes.
function stripTreeDecoration(text: string): string {
  return text
    .split(/\r?\n/)
    .map(line => line.replace(/^[\s│├└┌┐┘┤┬┴┼─═║╔╗╚╝╠╣╦╩╬▼▲►◄↓↑→←]+/, ""))
    .join("\n");
}

// True when pasted text is an ASCII/Unicode diagram (box-drawing art, flowcharts,
// arrow chains, tree views from GPT/opencode) that must be preserved verbatim in a
// code block instead of being smart-formatted into headings/lists.
//
// A text is a diagram when ANY of these hold:
//   1. glyph density: >=2 lines that are glyph-heavy (>=4 glyphs) or glyph-rich
//      relative to their letter content ("┌────────────┐", "│   START   │")
//   2. glyph columns: >=3 lines made of glyphs with no letters at all ("│", "▼",
//      "+--------+") -- node/flow diagrams hang arrows and pipes on their own lines
//   3. arrow chains: >=3 lines (<=80 chars) each carrying an arrow token
//      (→, ↓, -->, ->, ...) AND arrow lines make up at least half the content —
//      "A → B" / "flowchart TD ... A --> B" flows and aligned command specs
//      ("curl ... → HTTP 200?"), but NOT prose sentences with the odd arrow
//      sprinkled in ("push → reply ... (Ch 46)")
export function isDiagramText(text: string): boolean {
  const lines = text.split(/\r?\n/);
  const nonBlank = lines.filter(l => l.trim() !== "").length;
  let diagramLines = 0;
  let pureGlyphLines = 0;
  let shortArrowLines = 0;
  for (const line of lines) {
    const glyphs =
      (line.match(DIAGRAM_GLYPH_RE) ?? []).length + (line.match(ASCII_BOX_RE) ?? []).length;
    const letters = (line.match(/[A-Za-z0-9]/g) ?? []).length;
    if (glyphs > 0) {
      if (letters === 0) pureGlyphLines++;
      if (glyphs >= 4 || (glyphs >= 2 && glyphs >= letters * 0.15)) diagramLines++;
    }
    if (line.trim().length <= 80) {
      const arrows = line.match(ARROW_TOKEN_RE);
      if (arrows && arrows.length > 0) shortArrowLines++;
    }
  }
  if (diagramLines >= 2) return true;
  if (pureGlyphLines >= 3) {
    // glyph columns are only a diagram when the labels between them are short
    // ("User request" / "Parse intent") — long sentence lines mean it is a
    // workflow/checklist with │ decoration, which should stay prose
    const letterLines = lines
      .map(l => l.trim())
      .filter(t => t !== "" && /[A-Za-z0-9]/.test(t));
    const avgLen = letterLines.length
      ? letterLines.reduce((s, l) => s + l.length, 0) / letterLines.length
      : 0;
    if (avgLen <= 35) return true;
    // step flows: design walkthroughs ("schema + docs + error guidance") hang
    // short prose steps off a single │ column — high avgLen but diagram-like
    // structure. Preserved when >=3 steps and every step is <=3 lines long.
    if (isStepFlow(lines)) return true;
  }
  return shortArrowLines >= 3 && shortArrowLines * 2 >= nonBlank;
}

// A line that is nothing but vertical connector glyphs (│ ├ ┃ ... plus spaces)
const VERTICAL_CONNECTOR_RE = /^[\s│║┃├┣┋┃┝┠┟┢]+$/;

// True when vertical connector lines split the text into >=3 short prose
// steps ("  validate: ..." / "│" / "  instrument: ..." / "│" / ...) — design
// walkthroughs (schema + docs + error guidance). Each step must be compact
// (<=3 lines), otherwise it is long workflow prose and stays prose.
function isStepFlow(lines: string[]): boolean {
  const steps: string[][] = [];
  let cur: string[] = [];
  for (const line of lines) {
    if (VERTICAL_CONNECTOR_RE.test(line)) {
      if (cur.length) steps.push(cur);
      cur = [];
    } else if (line.trim() !== "") {
      cur.push(line.trim());
    }
  }
  if (cur.length) steps.push(cur);
  const blocks = steps.filter(s => s.length > 0);
  return blocks.length >= 3 && blocks.every(s => s.length <= 3);
}

// True when pasted text is a complete JSON document ({...} or [...])
export function isJsonText(text: string): boolean {
  const t = text.trim();
  if (!/^[[{]/.test(t)) return false;
  try {
    JSON.parse(t);
    return true;
  } catch {
    return false;
  }
}
