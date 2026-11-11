/**
 * Sitemap data, split by type. Only URLs built in this phase are listed (the
 * old site keeps its own sitemap for the rest until they ship). lastmod comes
 * from WordPress `modified`; images from each page's content.
 */
import { builtRows, getDoc, type ManifestRow } from "@/lib/content";
import { abs } from "./schema";

export const SITEMAPS = {
  pages: (r: ManifestRow) => ["core", "landing", "legal"].includes(r.type),
  services: (r: ManifestRow) => r.type === "service" || r.type === "service-hub",
  locations: (r: ManifestRow) => r.type === "location-town" || r.type === "location-service",
  blog: (r: ManifestRow) => r.type === "blog",
} as const;
export type SitemapName = keyof typeof SITEMAPS;

function imagesOf(path: string): string[] {
  const doc = getDoc(path);
  if (!doc) return [];
  const out = new Set<string>();
  if (doc.featuredImage) out.add(doc.featuredImage.src);
  for (const s of doc.sections)
    for (const b of s.blocks) {
      if (b.t === "img") out.add(b.image.src);
      if (b.t === "gallery") b.images.forEach((i) => out.add(i.src));
      if (b.t === "cards") b.items.forEach((c) => c.image && out.add(c.image.src));
    }
  return [...out].slice(0, 20);
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function sitemapXml(name: SitemapName): string {
  const rows = builtRows().filter(SITEMAPS[name]).filter((r) => r.type !== "thank-you");
  const urls = rows
    .map((r) => {
      const imgs = imagesOf(r.path)
        .map((src) => `<image:image><image:loc>${esc(abs(src))}</image:loc></image:image>`)
        .join("");
      return `<url><loc>${esc(abs(r.path))}</loc><lastmod>${new Date(r.modified + (r.modified.endsWith("Z") ? "" : "Z")).toISOString()}</lastmod>${imgs}</url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls}\n</urlset>\n`;
}

export function sitemapIndexXml(): string {
  const names = (Object.keys(SITEMAPS) as SitemapName[]).filter((n) => builtRows().some(SITEMAPS[n]));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${names
    .map((n) => `<sitemap><loc>${abs(`/sitemap-${n}.xml`)}</loc></sitemap>`)
    .join("\n")}\n</sitemapindex>\n`;
}
