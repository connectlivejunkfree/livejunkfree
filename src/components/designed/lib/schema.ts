/**
 * JSON-LD helpers (schema.org). Values come from content/site.ts (livejunkfree.ca).
 */
import { plain } from "@/components/designed/ui/Rich";
import type { FaqItem } from "@content/designed/faqs";
import { AREAS } from "@content/designed/locations";
import { HOURS, SITE, SOCIAL } from "@content/designed/site";
import type { Crumb } from "@content/designed/types";

const abs = (path: string) => new URL(path, SITE.url).toString();

export function localBusiness() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": abs("/#business"),
    name: SITE.name,
    description: SITE.tagline,
    url: abs("/"),
    telephone: SITE.phoneE164,
    email: SITE.email,
    logo: abs("/images/logo.webp"),
    areaServed: AREAS.map((a) => ({ "@type": "City", name: a.name })),
    openingHours: HOURS.schema,
    sameAs: SOCIAL.map((s) => s.href),
  };
}

export function service(name: string, description: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description: plain(description),
    url: abs(path),
    serviceType: name,
    provider: { "@id": abs("/#business"), "@type": "LocalBusiness", name: SITE.name, telephone: SITE.phoneE164 },
    areaServed: { "@type": "Place", name: "Toronto and the Greater Toronto Area" },
  };
}

export function breadcrumbs(crumbs: Crumb[], currentPath: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      item: abs(c.href ?? currentPath),
    })),
  };
}

export function faqPage(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: plain(f.a) },
    })),
  };
}
