/**
 * page-lint: structural and quality checks on every built route.
 *
 *   node scripts/checks/page-lint.mjs [--out docs/client/batch-1/page-lint-report.csv]
 *
 * Exit code 1 when any check fails on one of the 50 Batch 1 pages; the rest of the site is counted.
 * Run `npm run build` first.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { all, hasClass, hidden, text, walk } from "./html.mjs";
import { BATCH_PATHS, ROOT, load, routes } from "./pages.mjs";

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg("--out", "docs/client/batch-1/page-lint-report.csv");
const TEL = "tel:+16479225865";
const towns = JSON.parse(readFileSync(join(ROOT, "content/site.json"), "utf8")).towns;
const TOWN_RE = new RegExp(`\\b(${towns.map((t) => t.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "g");
const norm = (s) => s.toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9$%']+/g, " ").trim();
const words = (s) => (s.match(/[A-Za-z0-9$][\w'’$%-]*/g) ?? []).length;

// The page's expected form category (independent of the app code, from the URL only).
function expectedService(route) {
  const last = route.split("/").filter(Boolean).pop() ?? "";
  if (/commercial-junk-removal-services|\/(office|business|retail|warehouse|computer)/.test(route) || /^(office|business|retail|warehouse|computer|commercial)/.test(last) || /-(office|business|retail|warehouse|commercial)-/.test(`-${last}-`)) return "Commercial junk removal";
  if (/junk-demolition-services|demolition/.test(route)) return "Demolition";
  if (/junk-cleanout-services|cleanout|clean-out|hoarding|estate|eviction|storage-unit|bereavement/.test(route)) return "Cleanouts";
  return "Residential junk removal";
}

// Service words that identify a specific job in an image filename or alt text.
const SERVICE_WORDS = ["deck", "concrete", "shed", "hot-tub", "hottub", "jacuzzi", "piano", "mattress", "couch", "sofa", "appliance", "fridge", "carpet", "fence", "pool", "warehouse", "retail", "tank", "e-waste", "playset", "swing", "hoarding", "estate", "office", "garage", "basement"];
const ALIAS = { hottub: "hot-tub", jacuzzi: "hot-tub", sofa: "couch", fridge: "appliance" };
const BAD_ALT = /^(\d{6,}[_ -]?\d*|\d{8}|(IMG|DSC|PXL|DJI|MVIMG|WhatsApp Image|Screenshot)[\w .-]*|[\w-]+\.(jpe?g|png|webp))/i;
const BRANDS = /LiveJunkFree|JunkFree|YouTube|iPhone|WordPress|LinkedIn|TikTok|PlayStation|GoodWill|FaceTime|McDonald|MacBook|HomeSense|HomeGoods|HomeDepot|PayPal|GoFundMe/;

const rows = [];
const summary = { batch: { fail: 0, pages: {} }, site: { fail: 0, routes: 0 }, byCheck: {} };
const add = (route, id, check, detail) => {
  rows.push([route, id ?? "", check, String(detail).slice(0, 300), id ? "FAIL" : "SITE"]);
  summary.byCheck[check] ??= { batch: 0, site: 0 };
  if (id) { summary.batch.fail++; summary.byCheck[check].batch++; summary.batch.pages[id] = (summary.batch.pages[id] ?? 0) + 1; }
  else { summary.site.fail++; summary.byCheck[check].site++; }
};

for (const { route, file } of routes()) {
  const id = BATCH_PATHS.get(route);
  if (!id) summary.site.routes++;
  const p = load(file);
  const main = all(p.body, (n) => n.tag === "main")[0] ?? p.body;
  const vis = (n) => !hidden(n);
  const isService = /^\/(services\/[^/]+\/[^/]+|locations\/[^/]+\/[^/]+|[^/]+-(services?|removal|cleanouts?)[^/]*)\/$/.test(route) || /-in-[a-z-]+\/$/.test(route);

  // ---- H1: exactly one, not empty
  const h1s = all(p.body, (n) => n.tag === "h1" && vis(n));
  if (h1s.length === 0) add(route, id, "h1-missing", "no visible <h1>");
  if (h1s.length > 1) add(route, id, "h1-multiple", h1s.map((h) => text(h)).join(" | "));
  for (const h of h1s) if (!text(h).replace(/\s+/g, "")) add(route, id, "h1-empty", "the <h1> has no text");

  // ---- Headings / card titles with nothing after them (until the next heading of the same or higher level)
  const events = [];
  for (const n of walk(main)) {
    if (n.text !== undefined) {
      const t = n.text.replace(/\s+/g, " ").trim();
      if (!t) continue;
      let inH = false;
      for (let q = n.parent; q && q !== main; q = q.parent) if (/^h[1-6]$/.test(q.tag) || q.tag === "summary") { inH = true; break; }
      if (!inH && !hidden(n.parent)) events.push({ t: "x", text: t });
    } else if (/^h[1-6]$/.test(n.tag) && vis(n)) events.push({ t: "h", level: +n.tag[1], text: text(n), node: n });
  }
  events.forEach((e, i) => {
    if (e.t !== "h" || e.level === 1) return;
    for (let j = i + 1; j < events.length; j++) {
      const f = events[j];
      if (f.t === "x") return;
      if (f.level > e.level) return;
      break;
    }
    add(route, id, "heading-no-body", `<h${e.level}> “${e.text}” has no text after it`);
  });
  // card-style panels: a heading and nothing else inside the card
  for (const card of all(main, (n) => vis(n) && n.tag === "div" && (hasClass(n, "panel") || hasClass(n, "card")))) {
    const h = all(card, (n) => /^h[2-6]$/.test(n.tag))[0];
    if (!h) continue;
    const rest = text(card).replace(text(h), "").replace(/\s+/g, "");
    if (!rest) add(route, id, "card-empty", `card “${text(h)}” has no body text`);
  }
  // accordions
  for (const d of all(main, (n) => n.tag === "details" && vis(n))) {
    const s = all(d, (n) => n.tag === "summary")[0];
    const q = s ? text(s) : "";
    if (!q.trim()) add(route, id, "accordion-no-question", "accordion with an empty question");
    else if (!text(d).replace(q, "").replace(/\s+/g, "")) add(route, id, "accordion-no-answer", `“${q}” has no answer`);
  }

  // ---- Gutted service page: words between the hero and the reviews section
  if (isService) {
    const secs = main.children.filter((c) => c.tag === "section" || c.tag === "div");
    let n = 0;
    for (const s of secs.slice(1)) {
      const t = text(s);
      if (/what people say|read what our past customers say|real reviews from customers/i.test(t)) break;
      n += words(t);
    }
    if (n < 150) add(route, id, "page-gutted", `${n} words between the hero and the reviews (needs ≥ 150)`);
  }

  // ---- Malformed text (visible lines in <main>)
  const lines = text(main).split("\n").map((l) => l.trim()).filter(Boolean);
  for (const l of lines) {
    if (/\b(We['’]re|We are|Our|Your)\s+Read our\b/.test(l)) add(route, id, "text-broken", l);
    if (/\b(Safe|Fast|Quick|Easy|Affordable|Reliable|Professional|Local|Trusted|Careful), (Removal|Pickup|Service|Services|Junk)\b/.test(l)) add(route, id, "text-broken", l);
    const glued = l.replace(BRANDS, "").match(/[a-z]{3,}\d{2,}/);
    if (glued && !/https?:|www\.|@|\.ca\b|\.com\b/.test(l)) add(route, id, "text-run-together", `“${glued[0]}” in: ${l}`);
    if (words(l) >= 4 && /(,|;|\b(and|or|but|with|to|the|of|for|our|your))$/i.test(l)) add(route, id, "text-dangling", l);
    if (/[,;:]\s*[.,;:]|(?<!\.)\.\.(?!\.)|\s[,.;:!?](\s|$)|!\.|\?\./.test(l)) add(route, id, "text-double-punctuation", l);
    if (/\b[a-z]+(-[a-z]+)+-services?\b/.test(l)) add(route, id, "text-raw-slug", l);
  }
  for (const h of all(main, (n) => /^h[1-6]$/.test(n.tag) && vis(n))) if (/^\s*[-–—]\s/.test(text(h))) add(route, id, "heading-leading-hyphen", text(h));
  // words glued together inside one text node ("pickupNow"); separate elements are laid out apart, so they're not checked
  for (const n of walk(main)) {
    if (n.text === undefined || hidden(n.parent)) continue;
    const g = n.text.replace(BRANDS, "").match(/\b[a-z]{3,}[A-Z][a-z]{2,}\b/);
    if (g && !/https?:|www\.|@/.test(n.text)) add(route, id, "text-run-together", `“${g[0]}” in: ${n.text.trim().slice(0, 160)}`);
  }

  // ---- Links and CTAs
  const hasQuoteForm = all(p.body, (n) => n.attrs?.id === "quote-form").length > 0;
  const nonResidential = /commercial|demolition|cleanout|clean-out|office|warehouse|retail|business|estate|hoarding|eviction/.test(route);
  for (const a of all(main, (n) => n.tag === "a" && vis(n))) {
    const t = text(a).replace(/\s+/g, " ").trim();
    const href = a.attrs.href ?? "";
    if (/^[a-z0-9]+(-[a-z0-9]+)+$/.test(t)) add(route, id, "link-raw-slug", `${t} → ${href}`);
    if (nonResidential && /\bresidential\b/i.test(t) && (hasClass(a, "btn") || /project|book|set up|schedule/i.test(t))) add(route, id, "cta-residential-on-wrong-page", `${t} → ${href}`);
    if (hasQuoteForm && /\b(quote|estimate)\b/i.test(t) && /^\/contact\/?/.test(href)) add(route, id, "cta-quote-to-contact", `${t} → ${href}`);
    if (/^\s*(call|phone)\b/i.test(t) && href !== TEL) add(route, id, "cta-call-not-tel", `${t} → ${href}`);
    if (href.startsWith("tel:") && href !== TEL) add(route, id, "cta-wrong-tel", href);
  }
  for (const h of all(main, (n) => /^h[1-6]$/.test(n.tag) && vis(n))) if (nonResidential && /\bresidential junk removal project\b/i.test(text(h))) add(route, id, "cta-residential-on-wrong-page", text(h));

  // ---- Form default service
  const form = all(p.body, (n) => n.tag === "form" && n.attrs.id === "quote-form")[0];
  if (form) {
    const svc = all(form, (n) => n.tag === "input" && n.attrs.name === "service")[0]?.attrs.value ?? "";
    const exp = expectedService(route);
    if (svc && svc !== exp && !(exp === "Residential junk removal" && route.startsWith("/locations/") && !/-(in|services)/.test(route))) add(route, id, "form-service-mismatch", `form “${svc}”, page expects “${exp}”`);
  }

  // ---- FAQ parity (visible accordion vs FAQPage JSON-LD)
  const faqPages = [];
  const visitLd = (o) => { if (Array.isArray(o)) o.forEach(visitLd); else if (o && typeof o === "object") { if (o["@type"] === "FAQPage") faqPages.push(o); Object.values(o).forEach(visitLd); } };
  p.ld.forEach(visitLd);
  if (faqPages.length > 1) add(route, id, "faq-multiple-faqpage", `${faqPages.length} FAQPage objects`);
  if (p.ldErrors.length) add(route, id, "jsonld-parse-error", p.ldErrors.join("; "));
  const visQ = all(main, (n) => n.tag === "summary" && vis(n)).map((s) => norm(text(s)));
  const visAll = norm(text(main));
  for (const fp of faqPages) {
    for (const q of [].concat(fp.mainEntity ?? [])) {
      const qn = norm(q.name ?? "");
      if (!visQ.some((v) => v === qn || v.endsWith(qn) || qn.endsWith(v))) add(route, id, "faq-schema-question-not-visible", q.name);
      const an = norm([].concat(q.acceptedAnswer ?? []).map((x) => x.text ?? "").join(" "));
      if (an && !visAll.includes(an.slice(0, 120))) add(route, id, "faq-schema-answer-differs", `${q.name} → ${an.slice(0, 120)}`);
    }
  }

  // ---- Images
  const pageWords = new Set(SERVICE_WORDS.filter((w) => route.includes(w)).map((w) => ALIAS[w] ?? w));
  if (/hot-tub|jacuzzi/.test(route)) pageWords.add("hot-tub");
  if (/couch|sofa/.test(route)) pageWords.add("couch");
  if (/appliance|fridge/.test(route)) pageWords.add("appliance");
  const pageTown = towns.find((t) => route.includes(`/${t.slug}/`) || route.includes(`-in-${t.slug}`) || route.endsWith(`-${t.slug}/`));
  for (const img of all(main, (n) => n.tag === "img" && vis(n))) {
    const src = (img.attrs.src || img.attrs.srcset || "").split(/[\s,]/)[0];
    const fileName = decodeURIComponent(src.split("/").pop() ?? "").toLowerCase();
    const alt = img.attrs.alt ?? "";
    if (pageWords.size) {
      for (const w of SERVICE_WORDS) {
        const ww = ALIAS[w] ?? w;
        if (!pageWords.has(ww) && new RegExp(`(^|[^a-z])${w}([^a-z]|$)`).test(fileName)) { add(route, id, "image-wrong-service", `${fileName} on a ${[...pageWords].join("/")} page`); break; }
      }
    }
    if (alt && BAD_ALT.test(alt.trim())) add(route, id, "image-filename-alt", alt);
    if (pageTown) for (const m of alt.matchAll(TOWN_RE)) if (m[1] !== pageTown.name && m[1] !== "Toronto") add(route, id, "image-alt-wrong-city", `${alt} (page: ${pageTown.name})`);
  }
}

const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""').replace(/\s+/g, " ").trim()}"`;
rows.sort((a, b) => (a[4] === b[4] ? 0 : a[4] === "FAIL" ? -1 : 1) || String(a[1]).localeCompare(String(b[1])) || a[0].localeCompare(b[0]));
writeFileSync(join(ROOT, OUT), ["route,page_id,check,detail,status", ...rows.map((r) => r.map(csvCell).join(","))].join("\n") + "\n");
writeFileSync(join(ROOT, OUT.replace(/\.csv$/, ".summary.json")), JSON.stringify(summary, null, 1) + "\n");
console.log(`page-lint → ${OUT}`);
console.log(`  Batch 1 (50 pages): ${summary.batch.fail} failing checks on ${Object.keys(summary.batch.pages).length} pages`);
console.log(`  Rest of site (${summary.site.routes} routes): ${summary.site.fail} findings`);
for (const [k, v] of Object.entries(summary.byCheck).sort()) console.log(`    ${k.padEnd(34)} batch ${String(v.batch).padStart(4)}   site ${String(v.site).padStart(5)}`);
if (summary.batch.fail) {
  console.log("  Failing pages:", Object.entries(summary.batch.pages).sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => `${k}:${v}`).join(" "));
  process.exitCode = 1;
}
