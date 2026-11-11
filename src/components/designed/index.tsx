/**
 * The client-approved demo pages ("designed pages"). These URLs render the
 * approved demo design and copy instead of the generic template; every other
 * URL renders its extracted live content. Metadata (title, description,
 * canonical) for these URLs still comes from the live site (content/pages/…).
 *
 * Demo copy lives in content/designed/ (pages/*.ts for page text).
 */
import type { ReactNode } from "react";
import { categoryHref } from "@content/designed/routes";
import { CATEGORIES, SERVICES } from "@content/designed/services";
import { cleanoutContent, commercialContent, demolitionContent, itemContent, locationContent } from "@content/designed/templates";
import { findArea } from "@content/designed/locations";
import { AboutPage } from "./pages/About";
import { ContactPage } from "./pages/Contact";
import { HomePage } from "./pages/Home";
import { HowItWorksPage } from "./pages/HowItWorks";
import { LocationsPage } from "./pages/Locations";
import { ServicesHubPage } from "./pages/ServicesHub";
import { LocationTemplate } from "./templates/LocationTemplate";
import { CleanoutTemplate, CommercialTemplate, DemolitionTemplate, ItemTemplate } from "./templates/ServiceTemplates";

function servicePage(demoSlug: string, path: string): ReactNode {
  const s = SERVICES.find((x) => x.slug === demoSlug)!;
  const cat = CATEGORIES[s.category];
  const props = { crumbs: [{ label: "Home", href: "/" }, { label: cat.label, href: categoryHref(s.category) }, { label: s.name }], path, pending: false, name: s.name };
  switch (cat.template) {
    case "item":
      return <ItemTemplate c={itemContent(s)} {...props} />;
    case "cleanout":
      return <CleanoutTemplate c={cleanoutContent(s)} {...props} />;
    case "commercial":
      return <CommercialTemplate c={commercialContent(s)} {...props} />;
    case "demolition":
      return <DemolitionTemplate c={demolitionContent(s)} {...props} />;
  }
}

const COUCH = "/services/residential-junk-removal-services/couch-removal-services/";
const ESTATE = "/services/junk-cleanout-services/estate-cleanout-services/";
const OFFICE = "/services/commercial-junk-removal-services/business-cleanout-services/";
const DECK = "/services/junk-demolition-services/deck-demolition-services/";

const DESIGNED: Record<string, () => ReactNode> = {
  "/": () => <HomePage />,
  "/services/": () => <ServicesHubPage />,
  [COUCH]: () => servicePage("couch-removal-services", COUCH),
  [ESTATE]: () => servicePage("estate-cleanout-services", ESTATE),
  [OFFICE]: () => servicePage("business-cleanout-services", OFFICE),
  [DECK]: () => servicePage("deck-demolition-services", DECK),
  "/locations/": () => <LocationsPage />,
  "/locations/toronto/": () => (
    <LocationTemplate
      c={locationContent(findArea("toronto")!)}
      crumbs={[{ label: "Home", href: "/" }, { label: "Locations", href: "/locations/" }, { label: "Toronto" }]}
      path="/locations/toronto/"
      pending={false}
    />
  ),
  "/how-it-works/": () => <HowItWorksPage />,
  "/contact/": () => <ContactPage />,
  "/about/": () => <AboutPage />,
};

export const DESIGNED_PATHS = new Set(Object.keys(DESIGNED));

/** The approved demo page for this URL, or null if the URL uses its extracted content. */
export function designedPage(path: string): ReactNode | null {
  return DESIGNED[path]?.() ?? null;
}
