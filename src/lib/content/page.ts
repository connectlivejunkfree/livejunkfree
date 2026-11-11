/**
 * Page helpers shared by every template: breadcrumbs from the URL, hero
 * extraction, the answer-first summary and internal links for location pages.
 * Nothing here writes new copy: the summary is quoted verbatim from the page.
 */
import { childrenOf, getDoc, isBuilt, manifest, manifestRow, resolvePrices, site, townName, type Block, type Image, type Inline, type PageDoc, type Section } from "./index";

const SECTION_LABEL: Record<string, string> = {
  services: "Services",
  locations: "Locations",
  blog: "Blog",
  "residential-junk-removal-services": "Residential",
  "commercial-junk-removal-services": "Commercial",
  "junk-cleanout-services": "Cleanouts",
  "junk-demolition-services": "Demolition",
};

const tidy = (t: string) => t.replace(/\s*[-|–]\s*Live\s?Junk\s?Free.*$/i, "").trim();

/** Home › Services › Residential › Couch Removal Services (follows the URL hierarchy). */
export function breadcrumbs(doc: PageDoc): { label: string; href: string }[] {
  const segs = doc.path.split("/").filter(Boolean);
  const crumbs = [{ label: "Home", href: "/" }];
  segs.forEach((seg, i) => {
    const href = `/${segs.slice(0, i + 1).join("/")}/`;
    const isLast = i === segs.length - 1;
    const town = site.towns.find((t) => t.slug === seg && segs[0] === "locations" && i === 1);
    const label = isLast ? tidy(doc.title) : (SECTION_LABEL[seg] ?? (town ? town.name : tidy(manifestRow(href)?.title ?? seg)));
    if (!isLast && !manifestRow(href) && !SECTION_LABEL[seg]) return; // skip non-pages
    crumbs.push({ label, href });
  });
  return crumbs;
}

export type Hero = {
  h1: string;
  eyebrow?: string;
  sub: Inline[][];
  ctas: { label: string; href: string }[];
  trust: string[];
  image?: Image;
  rest: Section[];
};

/** Lift the H1, subtitle, CTAs, trust points and first photo out of the content for the hero. */
export function extractHero(doc: PageDoc, opts: { keepImage?: boolean } = {}): Hero {
  const sections = structuredClone(doc.sections);
  const first = sections[0]?.blocks ?? [];
  const hero: Hero = { h1: doc.h1, sub: [], ctas: [], trust: [], rest: sections };
  let i = first.findIndex((b) => b.t === "h" && b.l === 1);
  if (i === -1) i = 0;
  // Anything before the H1 that is a short label becomes the eyebrow.
  const pre = first.slice(0, Math.max(0, i));
  const eyebrow = pre.find((b) => b.t === "eyebrow" || b.t === "checks" || (b.t === "h" && b.text.length < 60));
  if (eyebrow) hero.eyebrow = eyebrow.t === "checks" ? eyebrow.items[0] : (eyebrow as { text: string }).text;
  let j = first[i]?.t === "h" && (first[i] as { l: number }).l === 1 ? i + 1 : i;
  for (; j < first.length; j++) {
    const b = first[j];
    if (b.t === "h" && b.l >= 3) hero.sub.push([b.text]);
    else if (b.t === "p" && hero.sub.length < 3) hero.sub.push(b.c);
    else if (b.t === "ctas") hero.ctas.push(...b.items);
    else if (b.t === "cards" && b.items.every((c) => !c.image) && b.items.length <= 4) hero.trust.push(...b.items.map((c) => c.title));
    else if (b.t === "checks") hero.trust.push(...b.items);
    else break;
  }
  sections[0] = { blocks: [...pre.filter((b) => b !== eyebrow && b.t !== "h"), ...first.slice(j)] };
  // First photo on the page (first two sections) becomes the hero photo
  // (or, with keepImage, stays in the content for the first two-column section).
  for (const s of sections.slice(0, 2)) {
    const k = s.blocks.findIndex((b) => b.t === "img");
    if (k !== -1) {
      hero.image = (s.blocks[k] as { image: Image }).image;
      if (!opts.keepImage) s.blocks.splice(k, 1);
      break;
    }
  }
  hero.rest = sections.filter((s) => s.blocks.length);
  return hero;
}

const sentences = (t: string) => t.match(/[^.!?]+[.!?]+(\s|$)/g)?.map((s) => s.trim()) ?? [];

/**
 * Answer-first summary (GEO): the first 2–3 sentences of the page's own copy,
 * quoted verbatim, plus the page's own price sentence if it has one.
 */
export function summary(doc: PageDoc): string[] {
  const texts: string[] = [];
  for (const s of doc.sections)
    for (const b of s.blocks) if (b.t === "p") texts.push(resolvePrices(plainInline(b.c)));
  const out: string[] = [];
  for (const t of texts) {
    for (const s of sentences(t)) {
      if (s.split(" ").length < 6 || /\?$/.test(s)) continue;
      out.push(s);
      if (out.length === 2) break;
    }
    if (out.length === 2) break;
  }
  const priceSentence = texts.flatMap(sentences).find((s) => /(starts? at|from)\s+(just\s+)?(C?\$\d|\d+\$)/i.test(s));
  if (priceSentence && !out.includes(priceSentence)) out.push(priceSentence);
  return out.slice(0, 3);
}

export function plainInline(c: Inline[]): string {
  return c.map((n) => (typeof n === "string" ? n : "br" in n ? " " : "b" in n ? plainInline(n.b) : "i" in n ? plainInline(n.i) : plainInline(n.c))).join("");
}

/** Region groups used to pick "nearby towns". */
const REGIONS: string[][] = [
  ["toronto", "scarborough", "etobicoke"],
  ["mississauga", "brampton", "caledon", "bolton"],
  ["vaughan", "woodbridge", "richmond-hill", "markham", "king-city", "nobleton", "schomberg"],
  ["aurora", "new-market", "east-gwillimbury", "whitchurch-stouffville", "georgina", "bradford"],
  ["pickering", "ajax", "whitby", "oshawa", "uxbridge", "port-perry"],
];
export function nearbyTowns(town: string, n = 3): string[] {
  const region = REGIONS.find((r) => r.includes(town)) ?? [];
  const order = [...region.filter((t) => t !== town), ...REGIONS.flat().filter((t) => t !== town && !region.includes(t))];
  return order.slice(0, n);
}

/** For a location × service page: its town hub, parent service page and 3 nearby towns. */
export function locationLinks(doc: PageDoc, town: string | null) {
  const links: { label: string; href: string }[] = [];
  if (town) links.push({ label: `Junk removal in ${townName(town)}`, href: `/locations/${town}/` });
  const slug = doc.path.split("/").filter(Boolean).pop() ?? "";
  const service = slug.split("-in-")[0];
  const parent = manifest.find((r) => r.type === "service" && (r.path.endsWith(`/${service}/`) || r.path.split("/").filter(Boolean).pop()!.startsWith(service.replace(/s$/, ""))));
  const category = !parent ? manifest.find((r) => r.type === "service-hub" && r.path.includes(service.replace(/-in$/, ""))) : undefined;
  const target = parent ?? category;
  if (target) links.push({ label: tidy(target.title), href: target.path });
  const nearby = town
    ? nearbyTowns(town).map((t) => {
        // Prefer the same service in the nearby town, else that town's hub.
        const same = manifest.find((r) => r.type === "location-service" && r.town === t && r.path.split("/").filter(Boolean).pop()!.startsWith(service));
        return same && isBuilt(same.path) ? { label: `${tidy(same.title)}`, href: same.path } : { label: `Junk removal in ${townName(t)}`, href: `/locations/${t}/` };
      })
    : [];
  return { links, nearby };
}

/** Services listed under a hub (category pages and /services/), in URL order. */
export function hubChildren(path: string) {
  return childrenOf(path)
    .filter((r) => r.type === "service" || r.type === "service-hub")
    .map((r) => ({ label: tidy(r.title), href: r.path, built: isBuilt(r.path) }));
}

/** Location × service pages under a town hub. */
export function townServices(town: string) {
  return manifest
    .filter((r) => r.type === "location-service" && r.town === town && r.status === "extracted")
    .map((r) => ({ label: tidy(r.title), href: r.path }));
}

export const firstBlock = (sections: Section[], t: Block["t"]) => sections.flatMap((s) => s.blocks).find((b) => b.t === t);
export { getDoc };
