/**
 * JSON-LD (schema.org) builders. Facts come only from content/site.json and the
 * page's own content: hours as stated on the live site, the real Google rating,
 * and prices only where the page itself shows one.
 */
import { fact, resolvePrices, site, type PageDoc } from "@/lib/content";

const SITE = site.url;
export const abs = (path: string) => (path.startsWith("http") ? path : new URL(path, SITE).toString());
const BUSINESS_ID = `${SITE}/#business`;
const WEBSITE_ID = `${SITE}/#website`;

export function businessNode() {
  return {
    "@type": ["HomeAndConstructionBusiness", "LocalBusiness"],
    "@id": BUSINESS_ID,
    name: site.name,
    description: "Junk removal, cleanouts and demolition across the Greater Toronto Area.",
    additionalType: "https://en.wikipedia.org/wiki/Junk_removal",
    url: `${SITE}/`,
    telephone: site.phone.schema,
    email: site.email,
    logo: abs("/images/brand/logo.webp"),
    image: abs("/images/brand/og-default.webp"),
    priceRange: "$$",
    currenciesAccepted: "CAD",
    address: { "@type": "PostalAddress", addressRegion: site.region.province, addressCountry: site.region.country },
    areaServed: site.towns.map((t) => ({ "@type": "City", name: t.name, containedInPlace: { "@type": "AdministrativeArea", name: "Ontario", address: { "@type": "PostalAddress", addressRegion: "ON", addressCountry: "CA" } } })),
    // No openingHoursSpecification until Nav supplies current hours (Answers B2.3).
    sameAs: [...site.socials.map((s) => s.href), site.googleBusinessProfile],
    // Review count / rating only once confirmed in content/business-facts.json (audit OBS-64, OBS-133).
    ...(fact("reviews", "count") && fact("reviews", "rating")
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: Number(fact("reviews", "rating")), reviewCount: Number(fact("reviews", "count")), bestRating: 5 } }
      : {}),
  };
}

export function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE}/`,
    name: site.name,
    inLanguage: "en-CA",
    publisher: { "@id": BUSINESS_ID },
    potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: `${SITE}/blog/?q={search_term_string}` }, "query-input": "required name=search_term_string" },
  };
}

export function breadcrumbNode(crumbs: { label: string; href: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: abs(c.href) })),
  };
}

/**
 * The approved starting price ({{min_price}} → the 1/16 Junk Load minimum in business-facts.json), as a CAD number.
 * Only pages that show {{min_price}} get an Offer. Other {{cad_N}} tokens are third-party amounts (city fines,
 * landfill fees, buying prices), never our price, so they are ignored (Answers A1.3 / A1.6).
 */
export function pagePrice(doc: PageDoc): number | null {
  const text = JSON.stringify(doc.sections);
  return /\{\{min_price(?::\w+)?\}\}/.test(text) ? Number(fact("minimumPrice", "value")) || null : null;
}

export function serviceNode(doc: PageDoc, opts: { name: string; town?: string }) {
  const price = pagePrice(doc);
  return {
    "@type": "Service",
    "@id": `${abs(doc.path)}#service`,
    name: opts.name,
    serviceType: opts.name,
    description: resolvePrices(doc.seo.description),
    url: abs(doc.path),
    provider: { "@id": BUSINESS_ID },
    areaServed: opts.town ? { "@type": "City", name: opts.town, address: { "@type": "PostalAddress", addressRegion: "ON", addressCountry: "CA" } } : site.towns.map((t) => ({ "@type": "City", name: t.name })),
    ...(price
      ? { offers: { "@type": "Offer", priceCurrency: "CAD", priceSpecification: { "@type": "PriceSpecification", price, priceCurrency: "CAD", minPrice: price, description: `${fact("minimumPrice", "short")} (1/16 load, 1 cubic yard). Excludes applicable taxes. The final quote depends on the items, access and work required and is confirmed before removal begins.` } } }
      : {}),
  };
}

export function blogPostingNode(doc: PageDoc) {
  return {
    "@type": "BlogPosting",
    "@id": `${abs(doc.path)}#article`,
    headline: doc.h1 || doc.title,
    description: doc.seo.description || doc.excerpt,
    datePublished: doc.published,
    dateModified: doc.modified,
    author: { "@type": "Organization", name: site.name, url: `${SITE}/` },
    publisher: { "@id": BUSINESS_ID },
    mainEntityOfPage: abs(doc.path),
    inLanguage: "en-CA",
    ...(doc.featuredImage ? { image: abs(doc.featuredImage.src) } : {}),
  };
}

export function faqPage(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

/** One @graph per page: business + website + page-specific nodes. */
export function graph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": [businessNode(), websiteNode(), ...nodes] };
}
