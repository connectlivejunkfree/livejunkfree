/**
 * Related internal links for service pages: other services in the same
 * category (built pages only) and the biggest service areas.
 */
import { isBuilt, manifest, site, type PageDoc } from "@/lib/content";

const tidy = (t: string) => t.replace(/\s*[-|–]\s*Live\s?Junk\s?Free.*$/i, "").trim();

export function serviceRelated(doc: PageDoc, categoryLabel: string) {
  const parent = `/${doc.path.split("/").filter(Boolean).slice(0, -1).join("/")}/`;
  const siblings = manifest
    .filter((r) => r.parent === parent && r.path !== doc.path && r.type === "service" && isBuilt(r.path))
    .slice(0, 9)
    .map((r) => ({ label: tidy(r.title), href: r.path }));
  // Only add an areas list when the page's own content doesn't already have one.
  const hasAreas = JSON.stringify(doc.sections).includes("Areas We Serve");
  const areas = site.towns.slice(0, 12).map((t) => ({ label: t.name, href: `/locations/${t.slug}/` }));
  return [
    ...(siblings.length ? [{ title: `More ${categoryLabel.toLowerCase()} services`, links: siblings }] : []),
    ...(hasAreas ? [] : [{ title: "Areas we serve", links: areas }]),
  ];
}
