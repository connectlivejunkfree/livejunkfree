/**
 * Minimal, dependency-free HTML → tree parser for the content checks. It's built for the static HTML that
 * `next build` writes (well-formed, no conditional comments). Not a general-purpose parser.
 */
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const RAW = new Set(["script", "style", "template", "noscript", "textarea", "title"]);
const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", ndash: "–", mdash: "—", hellip: "…", copy: "©", reg: "®", trade: "™" };

export function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === "#") return String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    return ENT[e.toLowerCase()] ?? m;
  });
}

function attrs(src) {
  const out = {};
  for (const m of src.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) out[m[1].toLowerCase()] = decode(m[2] ?? m[3] ?? m[4] ?? "");
  return out;
}

/** Parse HTML into { tag, attrs, children[], parent }; text nodes are { text }. */
export function parse(html) {
  const root = { tag: "#root", attrs: {}, children: [] };
  let cur = root;
  const re = /<!--[\s\S]*?-->|<!doctype[^>]*>|<\/([a-zA-Z][\w:-]*)\s*>|<([a-zA-Z][\w:-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/gi;
  let last = 0;
  let m;
  while ((m = re.exec(html))) {
    if (m.index > last) cur.children.push({ text: decode(html.slice(last, m.index)), parent: cur });
    last = re.lastIndex;
    if (m[0].startsWith("<!")) continue;
    if (m[1]) {
      // closing tag: pop to the matching open element (tolerates unclosed <p>/<li>)
      const tag = m[1].toLowerCase();
      let n = cur;
      while (n && n.tag !== tag) n = n.parent;
      if (n && n.parent) cur = n.parent;
      continue;
    }
    const tag = m[2].toLowerCase();
    const el = { tag, attrs: attrs(m[3] || ""), children: [], parent: cur };
    cur.children.push(el);
    if (VOID.has(tag) || /\/\s*$/.test(m[3] || "")) continue;
    if (RAW.has(tag)) {
      const end = html.toLowerCase().indexOf(`</${tag}`, last);
      const stop = end < 0 ? html.length : end;
      el.raw = html.slice(last, stop);
      if (tag !== "script" && tag !== "style") el.children.push({ text: decode(el.raw), parent: el });
      const close = html.indexOf(">", stop);
      re.lastIndex = last = close < 0 ? html.length : close + 1;
      continue;
    }
    cur = el;
  }
  if (last < html.length) cur.children.push({ text: decode(html.slice(last)), parent: cur });
  return root;
}

export function* walk(n) {
  yield n;
  for (const c of n.children ?? []) yield* walk(c);
}

export const all = (root, pred) => [...walk(root)].filter((n) => n.tag && pred(n));
export const cls = (n) => ` ${n.attrs?.class ?? ""} `;
export const hasClass = (n, c) => cls(n).includes(` ${c} `);

/** Elements that are never shown: scripts, styles, hidden/aria-hidden subtrees, sr-only, <template>. */
export function hidden(n) {
  for (let p = n; p; p = p.parent) {
    if (!p.tag) continue;
    if (["script", "style", "template", "noscript", "head"].includes(p.tag)) return true;
    if ("hidden" in (p.attrs ?? {}) || p.attrs?.["aria-hidden"] === "true") return true;
  }
  return false;
}

const BLOCK = new Set(["p", "div", "section", "article", "header", "footer", "main", "nav", "aside", "li", "ul", "ol", "h1", "h2", "h3", "h4", "h5", "h6", "summary", "details", "dt", "dd", "td", "th", "tr", "table", "figcaption", "blockquote", "br", "label", "button", "option", "form", "fieldset", "legend"]);

/** Visible text of a subtree, with block elements separated by newlines so sentences never merge. */
export function text(n, { keepHidden = false } = {}) {
  let out = "";
  const rec = (x) => {
    if (x.text !== undefined) { out += x.text; return; }
    if (!keepHidden && x !== n && x.tag && (["script", "style", "template", "noscript"].includes(x.tag) || "hidden" in x.attrs || x.attrs["aria-hidden"] === "true")) return;
    const b = BLOCK.has(x.tag);
    if (b) out += "\n";
    for (const c of x.children ?? []) rec(c);
    if (b) out += "\n";
  };
  rec(n);
  return out.replace(/[ \t\r\f\v ]+/g, " ").replace(/ *\n[ \n]*/g, "\n").trim();
}

/** Every string value in a JSON-LD object, except identifiers/URLs. */
export function ldStrings(obj, out = [], key = "") {
  if (typeof obj === "string") {
    if (!/^(@type|@id|@context|url|image|logo|sameAs|telephone|email|item|priceCurrency|addressCountry|addressRegion|contentUrl|thumbnailUrl|mainEntityOfPage|inLanguage|datePublished|dateModified)$/.test(key) && !/^https?:\/\//.test(obj)) out.push(obj);
  } else if (Array.isArray(obj)) obj.forEach((x) => ldStrings(x, out, key));
  else if (obj && typeof obj === "object") for (const [k, v] of Object.entries(obj)) ldStrings(v, out, k);
  return out;
}

/** Split text into sentences (also on line breaks, which mark element boundaries). */
export const sentences = (t) => t.split(/\n+|(?<=[.!?])\s+(?=[A-Z0-9"“‘(★])/).map((s) => s.trim()).filter(Boolean);
