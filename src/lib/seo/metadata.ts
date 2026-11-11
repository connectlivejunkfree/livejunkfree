/**
 * Per-page metadata. Keeps the live site's Rank Math title, description and
 * canonical exactly (they rank today). Missing values fall back to the page's
 * H1 + town + "Live Junk Free". Canonical is always https://livejunkfree.ca<path>.
 */
import type { Metadata } from "next";
import { REVIEW_MODE } from "@/lib/env";
import { resolvePrices, site, townName, type PageDoc } from "@/lib/content";

export function pageMetadata(doc: PageDoc, opts: { noindex?: boolean; town?: string | null } = {}): Metadata {
  const fallbackTitle = [doc.h1, opts.town ? townName(opts.town) : null, site.name].filter(Boolean).join(" | ");
  const title = resolvePrices(doc.seo.title || fallbackTitle);
  const description = resolvePrices(doc.seo.description || doc.excerpt || `${doc.h1}. ${site.name} serves the Greater Toronto Area. Call ${site.phone.display}.`);
  const canonical = `${site.url}${doc.path}`;
  const image = doc.seo.ogImage ?? doc.featuredImage?.src ?? "/images/brand/og-default.webp";
  // Keep the live robots directives; review mode (client preview) is never indexed.
  const liveIndex = !/noindex/i.test(doc.seo.robots);
  const index = !REVIEW_MODE && !opts.noindex && liveIndex;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical, languages: { "en-CA": canonical, "x-default": canonical } },
    openGraph: {
      type: doc.kind === "post" ? "article" : "website",
      siteName: site.name,
      locale: "en_CA",
      url: canonical,
      title,
      description,
      images: [{ url: image }],
      ...(doc.kind === "post" ? { publishedTime: doc.published, modifiedTime: doc.modified } : {}),
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
    robots: index
      ? { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 }
      : { index: false, follow: !REVIEW_MODE },
    ...(opts.town ? { other: { "geo.region": "CA-ON", "geo.placename": townName(opts.town) } } : {}),
  };
}
