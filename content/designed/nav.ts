/**
 * Navigation: mega menu, mobile drawer and footer columns.
 */
import { HREF, categoryHref, city, svc } from "./routes";
import type { CategoryKey } from "./services";

export type Link = { label: string; href: string };

export type MegaGroup = { key: CategoryKey; label: string; all: Link; items: Link[] };

export const MEGA: MegaGroup[] = [
  {
    key: "residential",
    label: "Residential",
    all: { label: "All residential", href: categoryHref("residential") },
    items: [
      { label: "Couch & sofa removal", href: svc("couch-removal-services") },
      { label: "Mattress & box spring", href: svc("mattress-removal-services") },
      { label: "Appliance removal", href: svc("appliance-removal-services") },
      { label: "Hot tub removal", href: svc("hot-tub-removal-services") },
      { label: "E-waste & TVs", href: svc("e-waste-removal-services") },
      { label: "Piano removal", href: svc("piano-removal-services") },
    ],
  },
  {
    key: "commercial",
    label: "Commercial",
    all: { label: "All commercial", href: categoryHref("commercial") },
    items: [
      { label: "Office furniture & cubicles", href: svc("office-furniture-removal-services") },
      { label: "Business cleanouts", href: svc("business-cleanout-services") },
      { label: "Warehouse cleanouts", href: svc("warehouse-cleanout-services") },
      { label: "Retail cleanouts", href: svc("retail-cleanout-services") },
      { label: "Property managers", href: svc("property-management-junk-removal-services") },
    ],
  },
  {
    key: "cleanouts",
    label: "Cleanouts",
    all: { label: "All cleanouts", href: categoryHref("cleanouts") },
    items: [
      { label: "Estate cleanouts", href: svc("estate-cleanout-services") },
      { label: "House cleanouts", href: svc("house-cleanouts-services") },
      { label: "Hoarding cleanouts", href: svc("hoarding-cleanouts-services") },
      { label: "Basement & garage", href: svc("basement-cleanouts-services") },
      { label: "Eviction cleanouts", href: svc("eviction-cleanouts-services") },
      { label: "Storage units", href: svc("storage-unit-cleanouts-services") },
    ],
  },
  {
    key: "demolition",
    label: "Demolition",
    all: { label: "All demolition", href: categoryHref("demolition") },
    items: [
      { label: "Deck removal", href: svc("deck-demolition-services") },
      { label: "Shed demolition", href: svc("shed-demolition-services") },
      { label: "Fence removal", href: svc("fence-demolition-services") },
      { label: "Hot tub demolition", href: svc("hot-tub-demolition-services") },
      { label: "Playsets & gazebos", href: svc("playset-demolition-services") },
    ],
  },
];

export const MEGA_PROMO = {
  title: "Not sure which service?",
  text: "Send a photo of what needs to go and we'll tell you what it'll take.",
  cta: { label: "Get a free quote", href: HREF.contact },
};

/** Top-level header links after the "Services" mega menu. `match` marks the active link. */
export const HEADER_LINKS: (Link & { match?: string })[] = [
  { label: "Pricing", href: HREF.pricing, match: HREF.howItWorks },
  { label: "How it works", href: HREF.how },
  { label: "Locations", href: HREF.locations, match: "/locations/" },
  { label: "About", href: HREF.about, match: HREF.about },
];

export const DRAWER_LINKS: Link[] = [
  { label: "Pricing & how it works", href: HREF.howItWorks },
  { label: "Locations", href: HREF.locations },
  { label: "About", href: HREF.about },
];

export const FOOTER = {
  cta: {
    title: "Got junk? We'll take it from here.",
    text: "Free quote, firm price on site, gone in one visit.",
  },
  blurb: "Junk removal, cleanouts and small demolition across Toronto and the GTA.",
  columns: [
    {
      title: "Services",
      links: [
        { label: "Residential removal", href: categoryHref("residential") },
        { label: "Commercial removal", href: categoryHref("commercial") },
        { label: "Cleanouts", href: categoryHref("cleanouts") },
        { label: "Demolition", href: categoryHref("demolition") },
        { label: "All services", href: HREF.services },
      ],
    },
    {
      title: "Popular",
      links: [
        { label: "Couch removal", href: svc("couch-removal-services") },
        { label: "Mattress removal", href: svc("mattress-removal-services") },
        { label: "Appliance removal", href: svc("appliance-removal-services") },
        { label: "Hot tub removal", href: svc("hot-tub-removal-services") },
        { label: "Estate cleanouts", href: svc("estate-cleanout-services") },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About us", href: HREF.about },
        { label: "How it works", href: HREF.how },
        { label: "Pricing", href: HREF.pricing },
        { label: "Locations", href: HREF.locations },
        { label: "Blog", href: HREF.blog },
        { label: "Contact", href: HREF.contact },
      ],
    },
  ] satisfies { title: string; links: Link[] }[],
  legal: [
    { label: "Privacy policy", href: HREF.privacy },
    { label: "Terms", href: HREF.privacy },
    { label: "Sitemap", href: "/sitemap.xml" },
  ] satisfies Link[],
};

/** "Near you" helper used by templates. */
export const cityLinks = (names: string[]): Link[] => names.map((n) => ({ label: n, href: city(n) }));
