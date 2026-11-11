/**
 * Content loaders. Everything the site shows is read from /content here:
 *   content/manifest.json      every URL, its template and phase
 *   content/pages/**, blog/**  one file per URL (validated with zod)
 *   content/site.json          business details (phone, email, hours, socials, towns)
 *   content/navigation.json    header mega-menu and footer links
 *   content/pricing.json       every price, referenced from page text as {{key}}
 *   content/reviews.json       real Google reviews (Trustindex snapshot)
 *   content/images.json        real width/height of every image
 * Server-only: these read files at build time.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import manifestJson from "@content/manifest.json";
import navigationJson from "@content/navigation.json";
import pricingJson from "@content/pricing.json";
import reviewsJson from "@content/reviews.json";
import siteJson from "@content/site.json";
import imageSizes from "@content/images.json";
import { PageDocSchema, type ManifestRow, type PageDoc } from "./schema";

export * from "./schema";

/** Which phase is being built. Pages from later phases fall back to the old site (see src/proxy.ts). */
export const BUILD_PHASE = Number(process.env.BUILD_PHASE ?? "1");

export const site = siteJson;
export const navigation = navigationJson;
export const reviews = reviewsJson;
export const pricing = pricingJson as { prices: Record<string, { value: string; kind: string }> };
export const manifest = manifestJson as ManifestRow[];

const byPath = new Map(manifest.map((r) => [r.path, r]));
export const manifestRow = (path: string) => byPath.get(path);

/** An internal link that leads somewhere (a known URL or a site file); external links pass through. */
export function liveHref(href: string): string | null {
  if (!href.startsWith("/") || href.startsWith("/images/")) return href;
  const path = href.split(/[?#]/)[0];
  return byPath.has(path) || /^\/(blog\/page\/\d+\/|feed\/|sitemap.*\.xml|llms.*\.txt)/.test(path) ? href : null;
}

/** Rows rendered as pages in this build (built phase, not redirects / 410s). */
export function builtRows(): ManifestRow[] {
  return manifest.filter((r) => r.phase !== null && r.phase <= BUILD_PHASE && (r.status === "extracted" || r.status === "empty") && r.template !== "None");
}
const builtSet = new Set(builtRows().map((r) => r.path));
export const isBuilt = (path: string) => builtSet.has(path);

const cache = new Map<string, PageDoc>();
/** Load and validate the content file for a URL path. */
export function getDoc(path: string): PageDoc | null {
  const hit = cache.get(path);
  if (hit) return hit;
  const row = byPath.get(path);
  if (!row) return null;
  // Anchored at content/ so the build only traces the content folder.
  const raw = JSON.parse(readFileSync(join(process.cwd(), "content", row.file.replace(/^content\//, "")), "utf8"));
  const parsed = PageDocSchema.safeParse(raw);
  if (!parsed.success) throw new Error(`Invalid content file ${row.file}: ${parsed.error.message.slice(0, 600)}`);
  cache.set(path, parsed.data);
  return parsed.data;
}

/** Real image size (from content/images.json) for next/image. */
export function imageSize(src: string): { width: number; height: number } | undefined {
  return (imageSizes as Record<string, { width: number; height: number }>)[src];
}

const variantBase = (src: string) => src.replace(/-\d+x\d+(?=\.\w+$)/, "").replace(/-scaled(?=[.-])/, "");
let variants: Map<string, string> | undefined;
/** The largest saved copy of an image (WordPress keeps -768x512, -1024x765, -scaled… versions). */
export function largestVariant(src: string): string {
  if (!variants) {
    variants = new Map();
    for (const [k, v] of Object.entries(imageSizes as Record<string, { width: number }>)) {
      const b = variantBase(k);
      const cur = variants.get(b);
      if (!cur || (imageSize(cur)?.width ?? 0) < v.width) variants.set(b, k);
    }
  }
  return variants.get(variantBase(src)) ?? src;
}

/** Resolve {{price_key}} tokens: {{cad_125}} → $125, {{cad_125:C}} → C$125, {{cad_125:suffix}} → 125$. */
export function resolvePrices(text: string): string {
  return text.replace(/\{\{(\w+)(?::(\w+))?\}\}/g, (_m, key: string, fmt?: string) => {
    const v = pricing.prices[key]?.value ?? "";
    const num = v.replace(/^\$/, "");
    if (fmt === "C") return `C$${num}`;
    if (fmt === "suffix") return `${num}$`;
    return v;
  });
}

/** Town display name from its slug (content/site.json). */
export const townName = (slug: string) => site.towns.find((t) => t.slug === slug)?.name ?? slug;

/** Blog posts built in this phase, newest first. */
export function blogPosts(): (ManifestRow & { doc: PageDoc })[] {
  return manifest
    .filter((r) => r.type === "blog" && r.status === "extracted")
    .map((r) => ({ ...r, doc: getDoc(r.path)! }))
    .sort((a, b) => b.doc.published.localeCompare(a.doc.published));
}

/** Children of a path in the URL tree (built or not). */
export const childrenOf = (path: string) => manifest.filter((r) => r.parent === path && r.status !== "test-410" && r.status !== "redirect");
