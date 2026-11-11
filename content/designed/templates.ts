/**
 * Content for template-preview pages (content pending).
 * Each non-designed service renders its category's designed template with the
 * item name swapped in; each non-designed city renders the Toronto template.
 * Item-specific copy is replaced with general statements from livejunkfree.ca.
 * Replace these with real per-page copy (or CMS entries) as pages are written.
 */
import { DECK } from "./pages/deck";
import { ESTATE } from "./pages/estate";
import { OFFICE } from "./pages/office";
import { COUCH } from "./pages/couch";
import { TORONTO } from "./pages/toronto";
import { FAQS, FAQ_LOCATION_GENERIC } from "./faqs";
import { TOP_AREAS, type Area } from "./locations";
import { cityLinks } from "./nav";
import { COUCH_PRICING } from "./pricing";
import { HREF } from "./routes";
import { DESIGNED_SERVICES, type Service } from "./services";
import type { CleanoutContent, CommercialContent, DemolitionContent, ItemContent, LocationContent } from "./types";

const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

export function itemContent(s: Service): ItemContent {
  if (s.slug === DESIGNED_SERVICES.couch) return COUCH;
  const n = lower(s.name);
  return {
    ...COUCH,
    hero: {
      ...COUCH.hero,
      h1: `${s.name} in Toronto and the GTA`,
      lead: `We take ${lower(s.label)} from anywhere in your home: basements, stairs, condos and backyards. Leave the heavy lifting to us.`,
      ticks: ["Removed from inside, from any floor", "Disassembly when needed", "Price confirmed before we lift"],
      alt: `${s.name} by the Live Junk Free crew`,
    },
    take: {
      title: "What we take",
      intro: "If you're unsure if we can take a specific item, feel free to reach out to us.",
      ticks: ["Taken from any floor", "Disassembly when needed", "Full cleanup included", "Recycled or donated whenever possible"],
    },
    pricing: {
      ...COUCH.pricing,
      title: `${s.name} pricing`,
      panels: [{ ...COUCH_PRICING[0], text: "One pickup, all cleanup included." }, COUCH_PRICING[1]],
    },
    steps: {
      title: `How ${n} works`,
      list: COUCH.steps.list.map((st, i) => (i === 0 ? { title: "Text us a photo", text: "Show us the items and the space they're in — that's all we need to give you an accurate quote." } : st)),
    },
    faq: FAQS.home,
    related: [COUCH.related[0], { title: `${s.name} near you`, links: COUCH.related[1].links }],
    cta: { ...COUCH.cta, h: `Book ${n} this week` },
  };
}

export function cleanoutContent(s: Service): CleanoutContent {
  if (s.slug === DESIGNED_SERVICES.estate) return ESTATE;
  const n = lower(s.name);
  return {
    ...ESTATE,
    calm: false,
    hero: {
      ...ESTATE.hero,
      h1: `${s.name} in Toronto and the GTA`,
      lead: "We discuss the size of the cleanout, access requirements and the items to be removed before arranging the job. You decide what stays; we remove what needs to go.",
      image: s.slug === "hoarding-cleanouts-services" ? "hoarding" : ESTATE.hero.image,
      alt: `${s.name} by Live Junk Free`,
      primary: "Get a free quote",
    },
    pricing: { ...ESTATE.pricing, title: `How ${n} are priced` },
    faq: FAQS.home,
    cta: { ...ESTATE.cta, h: `Get a quote for ${n}`, form: { title: "Get a free quote", cta: "Send my quote request", service: "Garage, basement or room cleanout" } },
    mobileCta: undefined,
  };
}

export function commercialContent(s: Service): CommercialContent {
  if (s.slug === DESIGNED_SERVICES.office) return OFFICE;
  return {
    ...OFFICE,
    hero: { ...OFFICE.hero, h1: `${s.name} for businesses`, alt: `${s.name} by Live Junk Free` },
  };
}

export function demolitionContent(s: Service): DemolitionContent {
  if (s.slug === DESIGNED_SERVICES.deck) return DECK;
  const n = lower(s.name);
  return {
    ...DECK,
    hero: {
      ...DECK.hero,
      h1: `${s.name} and haul-away`,
      lead: "We tear it down, haul away every piece and leave the area clean, with eco-friendly disposal for all materials.",
      ticks: ["Same-day and next-day service", "Materials sorted for recycling", "Free, no-obligation estimates"],
      alt: `${s.name} by Live Junk Free`,
    },
    steps: {
      title: `How ${n} works`,
      list: [
        { title: "Send us photos", text: "Take a few pictures and text or upload them to us for a free, no-obligation quote." },
        { title: "Get your quote", text: "Straightforward pricing with no hidden fees, based on size, materials, and condition." },
        DECK.steps.list[2],
        { title: "We remove it", text: "Our crew arrives on time, safely takes it down, removes all debris, and leaves your yard clean." },
      ],
    },
    other: { ...DECK.other, items: DECK.other.items.filter((i) => !i.href.includes(s.slug)) },
    faq: FAQS.home,
    cta: { ...DECK.cta, h: `Get your ${n} quote` },
  };
}

export function locationContent(a: Area): LocationContent {
  if (a.slug === "toronto") return TORONTO;
  return {
    ...TORONTO,
    hero: {
      ...TORONTO.hero,
      h1: `Junk removal in ${a.name}`,
      lead: `Homes, condos and businesses across ${a.name}. We do all the lifting, sweep up, and donate or recycle whenever possible.`,
      ticks: ["Free on-site estimate before any work begins", "Volume-based pricing, no hidden fees", "Same-day appointments when available"],
      alt: `Live Junk Free crew in ${a.name}`,
    },
    local: {
      title: `Getting junk out of ${a.name} homes`,
      intro: "If you're unsure if we cover your area, please don't hesitate to contact us.",
      panels: [
        { title: "Priced by volume", text: "Our pricing is based on the volume of items being removed, the type of items, and the difficulty of removal." },
        { title: "We do the work", text: "Leave the heavy lifting to us. We carry items from every floor and clean up after." },
      ],
    },
    neighbourhoods: { title: "Areas we serve", list: [a.name] },
    popular: { ...TORONTO.popular, title: `Popular services in ${a.name}` },
    faq: { title: `${a.name} questions`, items: FAQ_LOCATION_GENERIC },
    nearby: {
      title: "Nearby areas",
      links: [...cityLinks(TOP_AREAS.filter((x) => x !== a.name)), { label: "All locations", href: HREF.locations }],
    },
    cta: { h: `Book a ${a.name} pickup` },
  };
}
