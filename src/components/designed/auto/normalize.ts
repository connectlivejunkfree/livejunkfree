/**
 * Turns an old WordPress page (content/pages/…) into clean, design-ready parts
 * for <AutoPage>. Content is never rewritten — only re-arranged:
 *
 *  - the old page's repeated "Instant Service Quote / Tell Us What needs to go"
 *    and embedded-form sections are removed (their words become the closing
 *    quote band once; the page keeps one form: hero or closing band);
 *  - page-builder CSS that leaked into text is dropped;
 *  - Elementor "headings used as paragraphs" (long H3s) become paragraphs;
 *  - stray one-line fragments ("- Simplify Your Space -") become the next section's eyebrow;
 *  - image-only sections feed the page's photo pool, so photos are re-placed into the design;
 *  - headless leftovers are merged into the previous section; exact duplicates are dropped.
 */
import { imageSize, largestVariant, resolvePrices, site, type Block, type BlockOf, type Image, type Inline, type PageDoc } from "@/lib/content";
import { plainInline } from "@/lib/content/page";

export type Head = { eyebrow?: string; title?: string };
export type Sub = { title: string; body: Block[] };
export type Part = { head: Head; blocks: Block[]; image?: Image; group?: Sub[] };
export type Normalized = {
  h1: string;
  eyebrow?: string;
  lead: Inline[][];
  ctas: { label: string; href: string }[];
  trust: string[];
  stats?: BlockOf<"stats">;
  heroImage?: Image;
  parts: Part[];
  quote: { title?: string; text?: string };
  pool: Image[];
};

const text = (b: Block): string => {
  switch (b.t) {
    case "h":
    case "eyebrow":
      return b.text;
    case "p":
      return plainInline(b.c);
    case "ul":
    case "ol":
      return b.items.map(plainInline).join(" ");
    case "cards":
      return b.items.map((c) => c.title + " " + (c.text ? plainInline(c.text) : "")).join(" ");
    case "faq":
      return b.items.map((f) => f.q).join(" ");
    case "steps":
      return b.items.map((s) => s.title).join(" ");
    case "checks":
    case "marquee":
      return b.items.join(" ");
    case "img":
      return b.image.src;
    case "gallery":
      return b.images.map((i) => i.src).join(" ");
    default:
      return b.t;
  }
};

/** Old designed PNG banners (text baked into the image) are not used as hero photos. */
export const isBanner = (im: Image) => /\.png$/i.test(im.src);
/**
 * Only real job / crew photos are shown: JPG or WebP, at least 400px wide.
 * The old site's PNG graphics (icons, badges, sparkles, text banners, rating images) are dropped —
 * the new design uses its own icons and layout instead.
 */
const GRAPHIC_NAME = /(^|\/)(frame|group|background|container|vector|shape|icon|logo|badge|rating|star|image-\d+|mask|ellipse|rectangle|union)[-_\d.]|button|banner|call-?(for|now|us)|cta[-_]|book-?now/i;
export const isPhoto = (im: Image) => {
  const w = imageSize(im.src)?.width ?? im.width ?? 800;
  if (/\.(jpe?g|webp)$/i.test(im.src)) return w >= 400;
  // A few real photos / illustrations were uploaded as large PNGs.
  return /\.png$/i.test(im.src) && w >= 900 && !GRAPHIC_NAME.test(im.src.split("/").pop() ?? "");
};
export const widthOf = (im: Image) => imageSize(im.src)?.width ?? im.width ?? 800;
/** Same photo at its largest saved size (alt text kept). */
const upsize = (im: Image): Image => {
  const src = largestVariant(im.src);
  if (src === im.src) return im;
  const sz = imageSize(src);
  return { ...im, src, width: sz?.width, height: sz?.height };
};

/** Split an inline run on line breaks (old "item<br>item<br>…" lists). */
export function splitBr(c: Inline[]): Inline[][] {
  const out: Inline[][] = [[]];
  for (const n of c) {
    if (typeof n === "object" && "br" in n) out.push([]);
    else out[out.length - 1].push(n);
  }
  return out.filter((x) => plainInline(x).trim());
}
const shortLine = (c: Inline[]) => {
  const t = plainInline(c).trim();
  return t.length > 0 && t.length <= 60 && !/[.:!?]$/.test(t);
};
const CSS_LEAK = /[.#][\w-]+\s*\{[^}]*:[^}]*;|@media\s*\(/;
const QUOTE_WORDS = /instant service quote|tell us what|free your space|connect us|get (a|your) (free )?quote|request a quote|call (us )?now|book now|schedule now/i;
export const isIcon = (im: Image) => {
  const s = imageSize(im.src) ?? (im.width ? { width: im.width, height: im.height ?? im.width } : null);
  return !!s && s.width <= 200 && s.height <= 200;
};

type FaqItem = BlockOf<"faq">["items"][number];
const NUMBERED_Q = /^\s*\d{1,2}[.)]\s+(.+\?)\s*$/;
/** One accordion holding "1. Question? / answer / 2. Question? / answer…" → one FAQ item per question. */
function splitNumberedFaq(f: FaqItem): FaqItem[] {
  const qs = f.a.filter((p) => NUMBERED_Q.test(plainInline(p)));
  if (qs.length < 2) return [f];
  const out: FaqItem[] = [];
  for (const p of f.a) {
    const m = plainInline(p).match(NUMBERED_Q);
    if (m) out.push({ q: m[1].trim(), a: [] });
    else if (out.length) out[out.length - 1].a.push(p);
  }
  return out.filter((x) => x.a.length);
}

/** "steps(1, title only)" followed by a paragraph, repeated → one cards block (old Elementor icon-box lists). */
function mergeLoneSteps(blocks: Block[]): Block[] {
  const out: Block[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const next = blocks[i + 1];
    if (b.t === "steps" && b.items.length === 1 && !b.items[0].text.some((t) => plainInline(t).trim())) {
      const card = { title: b.items[0].title, text: next?.t === "p" ? next.c : undefined };
      if (next?.t === "p") i++;
      const last = out[out.length - 1];
      if (last?.t === "cards" && (last as { merged?: boolean }).merged) last.items.push(card);
      else out.push(Object.assign({ t: "cards" as const, items: [card] }, { merged: true }));
    } else out.push(b);
  }
  return out.map((b) => (b.t === "cards" && "merged" in b ? { t: "cards", items: b.items } : b));
}

/** Long H3/H4 "headings" are really paragraphs; CSS leaks and empty blocks go. */
function cleanBlocks(blocks: Block[]): Block[] {
  return mergeShortParas(mergeLoneSteps(cleanBlocks1(blocks)));
}
/** 6+ consecutive one-line paragraphs ("Couch Removal", "Mattress Removal"…) are a list. */
function mergeShortParas(blocks: Block[]): Block[] {
  const out: Block[] = [];
  for (let i = 0; i < blocks.length; i++) {
    let j = i;
    while (j < blocks.length && blocks[j].t === "p" && shortLine((blocks[j] as BlockOf<"p">).c)) j++;
    if (j - i >= 6) {
      out.push({ t: "ul", items: blocks.slice(i, j).map((b) => (b as BlockOf<"p">).c) });
      i = j - 1;
    } else out.push(blocks[i]);
  }
  return out;
}
function cleanBlocks1(blocks: Block[]): Block[] {
  const out: Block[] = [];
  for (const b of blocks) {
    // Old rating badges ("4.8 Rating", "Google", "5.0 (500+ Reviews)"): the design shows the live rating instead.
    if (b.t === "rating" || (b.t === "h" && OLD_BADGE.test(b.text))) continue;
    if (b.t === "p" && CSS_LEAK.test(plainInline(b.c))) {
      // Keep any real text after the CSS (rare) — the leak is always a prefix.
      const rest = plainInline(b.c).replace(/^[\s\S]*\}\s*\}?/, "").trim();
      if (rest.length > 20 && !CSS_LEAK.test(rest)) out.push({ t: "p", c: [rest] });
      continue;
    }
    if (b.t === "h" && b.l >= 3 && /^\s*[–—-]\s+/.test(b.text)) {
      // "– Your upfront quote covers…" typed as a heading on the old site = the text under the heading above.
      out.push({ t: "p", c: [b.text.replace(/^\s*[–—-]\s+/, "")] });
      continue;
    }
    if (b.t === "h" && b.l >= 3 && b.text.length > 120) {
      out.push({ t: "p", c: [b.text] });
      continue;
    }
    if (b.t === "h" && !b.text.trim()) continue;
    if (b.t === "p" && !plainInline(b.c).trim()) continue;
    if (b.t === "form") continue; // one form per page: hero or closing band
    if (b.t === "img") {
      if (isPhoto(b.image)) out.push({ t: "img", image: upsize(b.image) });
      continue;
    }
    if (b.t === "gallery") {
      const images = b.images
        .filter(isPhoto)
        .map(upsize)
        .filter((im, k, arr) => arr.findIndex((x) => x.src === im.src) === k);
      if (images.length === 1) out.push({ t: "img", image: images[0] });
      else if (images.length) out.push({ t: "gallery", images });
      continue;
    }
    if (b.t === "p") {
      const lines = splitBr(b.c);
      if (lines.length >= 6 && lines.every(shortLine)) {
        out.push({ t: "ul", items: lines });
        continue;
      }
    }
    if (b.t === "faq" && b.items.length === 1) {
      // An old "View all items" accordion holding a long list → heading + list (shown as a chip grid).
      // Some old accordions start with page-builder CSS pasted as text ("* { box-sizing… }"): dropped.
      const isCss = (l: Inline[]) => /[{};]\s*$|^\s*[*.@#][^{]*\{/.test(plainInline(l)) || /\{[^}]*:[^}]*\}/.test(plainInline(l));
      const lines = b.items[0].a.flatMap(splitBr).filter((l) => !isCss(l)).map((l) => l.map((n) => (typeof n === "string" ? n.replace(/^[\s✱*•·\-–]+/, "") : n)));
      if (lines.length >= 8 && lines.every(shortLine)) {
        out.push({ t: "h", l: 3, text: b.items[0].q }, { t: "ul", items: lines });
        continue;
      }
    }
    if (b.t === "faq") {
      const items: FaqItem[] = [];
      for (const f of b.items) {
        const parts = splitNumberedFaq({ q: f.q, a: f.a.filter((p) => !CSS_LEAK.test(plainInline(p))) });
        if (parts.length > 1) out.push({ t: "h", l: 3, text: f.q }); // keep the accordion's label
        items.push(...parts.filter((x) => x.a.length));
      }
      if (items.length) out.push({ t: "faq", items });
      continue;
    }
    if (b.t === "cards") {
      out.push({
        t: "cards",
        items: b.items.map((c) => {
          const card = { ...c, image: c.image && isPhoto(c.image) ? upsize(c.image) : undefined };
          return card.text && typeof card.text[0] === "string" ? { ...card, text: [card.text[0].replace(/^\s*[–—-]\s+/, ""), ...card.text.slice(1)] } : card;
        }),
      });
      continue;
    }
    out.push(b);
  }
  return out;
}

const isQuoteSection = (bs: Block[]) =>
  bs.length > 0 &&
  bs.every((b) => b.t === "h" || b.t === "ctas" || b.t === "form" || b.t === "eyebrow") &&
  (bs.some((b) => b.t === "form") || bs.some((b) => b.t === "h" && QUOTE_WORDS.test(b.text)) || bs.every((b) => b.t === "ctas"));

const isFragment = (bs: Block[]) => bs.length > 0 && bs.length <= 2 && bs.every((b) => b.t === "h" || b.t === "eyebrow") && bs.reduce((n, b) => n + text(b).length, 0) < 90;
const tidyEyebrow = (s: string) => s.replace(/^[\s\-–—•]+|[\s\-–—•]+$/g, "").trim();

/** The old "4.8 Rating / 250+ Reviews" badge text (outdated) — the live rating is 5.0 from 780+. */
const OLD_BADGE = /^\s*(\d(\.\d)?\s*rating|\d+\+?\s*reviews|google|\d(\.\d)?\s*\(\d+\+?\s*reviews\))\s*$/i;

/** Lift the H1, lead, buttons, trust points, stats and first photo out of section 0. */
function hero(doc: PageDoc, first: Block[]) {
  const h: Pick<Normalized, "h1" | "eyebrow" | "lead" | "ctas" | "trust" | "stats" | "heroImage"> = { h1: doc.h1, lead: [], ctas: [], trust: [] };
  const rest: Block[] = [];
  let seenH1 = false;
  for (const b of first) {
    if (b.t === "h" && b.l === 1 && !seenH1) {
      seenH1 = true;
      continue;
    }
    if (!seenH1 && (b.t === "eyebrow" || (b.t === "h" && b.text.length < 70) || (b.t === "checks" && b.items.length === 1)) && !h.eyebrow) {
      h.eyebrow = tidyEyebrow(b.t === "checks" ? b.items[0] : b.text);
      continue;
    }
    if (b.t === "h" && b.l >= 2 && h.lead.length < 2 && !rest.length) h.lead.push([b.text]);
    else if (b.t === "p" && h.lead.length < 2 && !rest.length) h.lead.push(b.c);
    else if (b.t === "ctas" && !rest.length) h.ctas.push(...b.items);
    else if (b.t === "cards" && b.items.length <= 4 && b.items.every((c) => !c.image || isIcon(c.image)) && !rest.length) h.trust.push(...b.items.map((c) => c.title.trim()));
    else if (b.t === "checks" && !rest.length) h.trust.push(...b.items);
    else if (b.t === "rating" || (b.t === "h" && OLD_BADGE.test(b.text))) continue; // the design shows the live 5.0 / 780+ rating
    else if (b.t === "stats" && !h.stats) h.stats = b;
    else if (b.t === "img" && !h.heroImage && !isIcon(b.image) && !isBanner(b.image)) h.heroImage = b.image;
    else rest.push(b);
  }
  return { h, rest };
}

/** {{price}} tokens in every text field (headings, card titles, FAQ questions, buttons…), not just paragraphs. */
function withPrices<T>(v: T, key = ""): T {
  if (typeof v === "string") return (key === "src" || key === "a" || key === "href" ? v : resolvePrices(v)) as T;
  if (Array.isArray(v)) return v.map((x) => withPrices(x)) as T;
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, withPrices(x, k)])) as T;
  return v;
}

export function normalize(raw: PageDoc): Normalized {
  const doc = withPrices(raw);
  const sections = doc.sections.map((s) => cleanBlocks(s.blocks));
  // A heading or long paragraph that appears twice (old builders duplicated sections, e.g. a stray
  // copy over the reviews widget): keep only the last copy, the one with its full section.
  const key = (b: Block) => (b.t === "h" && b.l <= 2 ? "h:" + b.text.trim().toLowerCase() : b.t === "p" && plainInline(b.c).length >= 80 ? "p:" + plainInline(b.c).trim().toLowerCase() : "");
  const last = new Map<string, [number, number]>();
  sections.forEach((sec, si) => sec.forEach((b, bi) => key(b) && last.set(key(b), [si, bi])));
  sections.forEach((sec, si) => {
    sections[si] = sec.filter((b, bi) => {
      const k = key(b);
      if (!k) return true;
      const [ls, lb] = last.get(k)!;
      return ls === si && lb === bi;
    });
  });
  // The old pages often repeat a list (desktop + mobile copies): keep the first.
  const lists: Set<string>[] = [];
  sections.forEach((sec, si) => {
    sections[si] = sec.filter((b) => {
      if (b.t !== "ul" || b.items.length < 4) return true;
      const items = new Set(b.items.map((it) => plainInline(it).trim().toLowerCase()));
      const dup = lists.some((l) => [...items].filter((x) => l.has(x)).length >= items.size * 0.8);
      if (!dup) lists.push(items);
      return !dup;
    });
  });
  const { h, rest } = hero(doc, sections[0] ?? []);
  const out: Normalized = { ...h, parts: [], quote: {}, pool: [] };
  const queue = [rest, ...sections.slice(1)];
  const seen = new Set<string>();
  let pendingEyebrow: string | undefined;

  for (const raw of queue) {
    const bs = raw.filter((b) => !(b.t === "img" && isIcon(b.image)));
    if (!bs.length) continue;
    // Repeated quote / form sections → closing band (first wording kept).
    if (isQuoteSection(bs)) {
      const hs = bs.filter((b): b is BlockOf<"h"> => b.t === "h");
      if (!out.quote.title && hs[0]) out.quote = { title: hs[0].text, text: hs[1]?.text };
      continue;
    }
    // Image-only sections → photo pool (+ their short label becomes the next eyebrow).
    const imgs = bs.filter((b): b is BlockOf<"img"> => b.t === "img");
    const others = bs.filter((b) => b.t !== "img");
    if (imgs.length && others.every((b) => b.t === "h" && b.text.length < 70)) {
      out.pool.push(...imgs.map((b) => b.image));
      if (others[0]) pendingEyebrow = tidyEyebrow(text(others[0]));
      continue;
    }
    if (isFragment(bs)) {
      pendingEyebrow = tidyEyebrow(bs.map(text).join(" "));
      continue;
    }
    const sig = bs.map(text).join("|").replace(/\s+/g, " ").toLowerCase();
    if (seen.has(sig)) continue;
    seen.add(sig);

    // Head: eyebrow? + first H2 (or H3 when the section has no H2 at the top).
    const head: Head = {};
    if (bs[0]?.t === "eyebrow") head.eyebrow = tidyEyebrow((bs.shift() as BlockOf<"eyebrow">).text);
    if (bs[0]?.t === "h" && bs[0].l <= 3) head.title = (bs.shift() as BlockOf<"h">).text;
    if (pendingEyebrow && !head.eyebrow) head.eyebrow = pendingEyebrow;
    pendingEyebrow = undefined;
    if (head.eyebrow && head.title && head.eyebrow.toLowerCase() === head.title.toLowerCase()) delete head.eyebrow;

    // A section without its own heading continues the previous one (old builders split one topic into containers).
    const prev = out.parts[out.parts.length - 1];
    if (!head.title && !head.eyebrow && prev) {
      prev.blocks.push(...bs);
      continue;
    }
    // Same heading twice in a row (old page duplicated a section title) → one section.
    if (head.title && prev?.head.title && prev.head.title.trim().toLowerCase() === head.title.trim().toLowerCase()) {
      prev.blocks.push(...bs);
      continue;
    }
    out.parts.push({ head, blocks: bs });
  }

  // One photo per text section: its own, else one from the pool.
  for (const p of out.parts) {
    const i = p.blocks.findIndex((b) => b.t === "img");
    if (i !== -1) {
      p.image = (p.blocks[i] as BlockOf<"img">).image;
      out.pool.push(...p.blocks.filter((b, k): b is BlockOf<"img"> => b.t === "img" && k !== i).map((b) => b.image));
      p.blocks = p.blocks.filter((b) => b.t !== "img");
    }
  }
  out.parts = groupMinis(out.parts, out.pool);
  if (out.heroImage && widthOf(out.heroImage) < 700) {
    out.pool.push(out.heroImage);
    out.heroImage = undefined;
  }
  if (!out.heroImage) {
    const k = out.pool.findIndex((im) => !isBanner(im) && widthOf(im) >= 700);
    if (k !== -1) out.heroImage = out.pool.splice(k, 1)[0];
  }
  if (!out.heroImage) {
    const p = out.parts.find((x) => x.image && !isBanner(x.image) && widthOf(x.image) >= 700);
    if (p) {
      out.heroImage = p.image;
      p.image = undefined;
    }
  }
  // Each photo once per page (old pages often repeat the same image).
  const base = (src: string) => src.replace(/-\d+x\d+(?=\.\w+$)/, "").replace(/-scaled(?=[.-])/, "");
  const used = new Set<string>(out.heroImage ? [base(out.heroImage.src)] : []);
  for (const p of out.parts) for (const b of p.blocks) if (b.t === "gallery") b.images.forEach((im) => used.add(base(im.src)));
  for (const p of out.parts) {
    if (!p.image) continue;
    if (used.has(base(p.image.src))) p.image = undefined;
    else used.add(base(p.image.src));
  }
  out.pool = out.pool.filter((im) => !used.has(base(im.src)) && (used.add(base(im.src)), true));
  // Galleries: drop photos already used as the hero or beside a section.
  const placed = new Set<string>([out.heroImage, ...out.parts.map((p) => p.image)].filter(Boolean).map((im) => base(im!.src)));
  for (const p of out.parts)
    p.blocks = p.blocks
      .map((b) =>
        b.t === "gallery"
          ? { ...b, images: b.images.filter((im) => !placed.has(base(im.src))) }
          : b.t === "cards"
            ? {
                ...b,
                items: b.items.map((c) => {
                  if (!c.image) return c;
                  const k = base(c.image.src);
                  if (placed.has(k)) return { ...c, image: undefined };
                  placed.add(k);
                  return c;
                }),
              }
            : b,
      )
      .filter((b) => b.t !== "gallery" || b.images.length > 0);
  return out;
}

/** H3/H4 sub-sections inside a section: [intro blocks, [{title, body}]]. */
export function subsections(blocks: Block[]): [Block[], Sub[]] {
  const intro: Block[] = [];
  const subs: Sub[] = [];
  for (const b of blocks) {
    if (b.t === "h" && b.l >= 3 && b.text.length <= 120) subs.push({ title: b.text, body: [] });
    else if (subs.length) subs[subs.length - 1].body.push(b);
    else intro.push(b);
  }
  return [intro, subs];
}

const townNames = new Set(site.towns.flatMap((t) => [t.name.toLowerCase(), t.slug]).concat(["stouffville", "newmarket", "toronto", "north york"]));
const isTown = (n: string) => {
  const l = n.toLowerCase().trim();
  return townNames.has(l) || townNames.has(l.replace(/[\s–—-]+/g, "-"));
};
/** A list (or a "Ajax • Aurora • …" line) whose entries are (nearly) all GTA town names. */
export function townList(b: Block): string[] | null {
  const raw = b.t === "ul" ? b.items.map(plainInline) : b.t === "p" ? [plainInline(b.c)] : null;
  if (!raw) return null;
  const names = raw.flatMap((t) => t.split(/\s*[•·|]\s*/)).map((n) => n.replace(/[.,;]$/, "").trim()).filter(Boolean);
  if (names.length < 4 || (b.t === "p" && names.length < 6)) return null;
  const hits = names.filter(isTown).length;
  return hits >= names.length - 1 ? names : null;
}

export const isStepCards = (b: BlockOf<"cards">, title?: string) =>
  b.items.length >= 3 &&
  b.items.length <= 6 &&
  b.items.every((c) => c.text && !(c.image && !isIcon(c.image))) &&
  (b.items.every((c) => /^\s*(step\s*)?\d+[.):\s-]/i.test(c.title)) || /how it works|simple steps|\bsteps\b|our process|how (we|it) work/i.test(title ?? ""));

export const stripNum = (t: string) => t.replace(/^\s*(step\s*)?\d+\s*[.):-]?\s*/i, "").trim();

/** An old "View all items" accordion: one question whose answer is a long list of short lines. */
export const listFaq = (b: Block): string[] | null => {
  if (b.t !== "faq" || b.items.length !== 1) return null;
  const lines = b.items[0].a.map((p) => plainInline(p).replace(/^[\s✱*•·\-–]+/, "").trim()).filter(Boolean);
  return lines.length >= 8 && lines.every((l) => l.length <= 60) ? lines : null;
};

/** A tiny section: one short heading + one or two short paragraphs (an old one-card Elementor container). */
const isMini = (p: Part) =>
  !!p.head.title &&
  p.head.title.length <= 70 &&
  p.blocks.length >= 1 &&
  p.blocks.length <= 2 &&
  p.blocks.every((b) => b.t === "p") &&
  p.blocks.reduce((n, b) => n + text(b).length, 0) <= 260;

/** Runs of 2+ tiny sections become one section with a panel grid. */
function groupMinis(parts: Part[], pool: Image[]): Part[] {
  const out: Part[] = [];
  for (let i = 0; i < parts.length; i++) {
    let j = i;
    while (j < parts.length && isMini(parts[j]) && (j === i || !parts[j].head.eyebrow)) j++;
    if (j - i >= 2) {
      const run = parts.slice(i, j);
      run.forEach((r) => r.image && pool.push(r.image));
      out.push({ head: { eyebrow: run[0].head.eyebrow }, blocks: [], group: run.map((r) => ({ title: r.head.title!, body: r.blocks })) });
      i = j - 1;
    } else out.push(parts[i]);
  }
  return out;
}
