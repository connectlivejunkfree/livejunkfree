import type { IconName } from "@/components/icons";
import type { ImageKey } from "../images";
import { HREF, categoryHref } from "../routes";
import { fact } from "@/lib/content/facts";

export const HOME = {
  meta: {
    title: "Junk Removal Toronto & GTA | Live Junk Free",
    description:
      "Junk removal, cleanouts and small demolition across Toronto and the GTA. We do the lifting and loading, and recycle or donate suitable items where practical.",
  },
  hero: {
    image: "crewStreet" as ImageKey,
    alt: "Two Live Junk Free crew members in front of the company truck",
    pills: { rating: "on Google", sameDay: "Same-day when available" },
    h1: "Junk gone. Space back.",
    lead: "Junk removal, cleanouts and small demolition across Toronto and the GTA. We do the lifting and loading, and recycle or donate suitable items where practical.",
    primary: "Get a free quote",
    quick: {
      title: "What needs to go?",
      text: "Tell us what to remove and we'll get back to you with a free quote.",
      itemHint: "Couch, fridge, garage…",
      itemLabel: "What needs to go",
      postalLabel: "Postal code",
      postalHint: "Postal code",
      cta: "Get my quote",
    },
  },
  marquee: [
    ["Couches & sofas", "sofa"], ["Mattresses", "bed"], ["Fridges & freezers", "fridge"], ["Washers & dryers", "fridge"],
    ["TVs & e-waste", "tv"], ["Hot tubs", "tub"], ["Pianos", "piano"], ["Exercise equipment", "dumbbell"],
    ["Tires", "tire"], ["Yard waste & branches", "tree"], ["Cardboard & boxes", "box"], ["Office cubicles", "building"],
  ] as [string, IconName][],
  bento: {
    title: "What are you clearing out?",
    intro: "Pick the closest match. Each one shows what's included, how pricing works and the quickest way to book.",
    cards: [
      { variant: "a", href: categoryHref("residential"), image: "couch" as ImageKey, alt: "Living room after a couch removal", label: "Homeowners and renters", title: "Furniture, appliances and household junk", text: "Couches, mattresses, fridges, hot tubs, e-waste and more, taken from anywhere in your home." },
      { variant: "b", href: HREF.estate, image: "estate" as ImageKey, alt: "Crew clearing a property", label: "Families and executors", title: "Estate, house and hoarding cleanouts", text: "Whole properties cleared with care." },
      { variant: "c", href: HREF.office, image: "business" as ImageKey, alt: "Business cleanout in progress", label: "Businesses", title: "Office and commercial", text: "Offices, warehouses, retail and facility closures." },
      { variant: "d", href: HREF.deck, image: "deckAfter" as ImageKey, alt: "Backyard after a deck removal", label: "Demolition", title: "Demolition", text: "Decks, sheds, fences, hot tubs and playsets, taken down and hauled away." },
    ],
  },
  beforeAfter: {
    title: "Same yard, after the job.",
    intro: "Drag the handle to compare the yard before and after the removal.",
    before: "deckBefore" as ImageKey,
    after: "deckAfter" as ImageKey,
  },
  pricing: {
    title: "Pricing you can see",
    intro: "You pay for how much of the truck your items fill. Tap a load size to see what usually fits.",
  },
  steps: { title: "Quick quotes. Removal scheduled around you.", cta: "How it works" }, // QA 18 Nov B1-01
  stats: { title: "What our customers say" }, // B8.1: no rating until verified
  destinations: {
    title: "Where your junk ends up",
    intro: `${fact("recycling")}.`,
    // Lead card: headline and FAQ line from livejunkfree.ca/how-it-works/
    lead: { title: "Go clean, go green", text: "Our goal is to minimize waste and give back to the community whenever we can." },
    items: [
      { icon: "heart" as IconName, leaf: true, label: "Donation", text: "Usable furniture and household goods go to local charities where practical." },
      { icon: "leaf" as IconName, leaf: true, label: "Recycling", text: "Metal, e-waste, cardboard, appliances and mattresses are recycled where practical." },
      { icon: "truck" as IconName, leaf: false, label: "Disposed", text: "Everything else is disposed of responsibly at local disposal and recycling sites." },
    ],
  },
  areas: {
    title: "Local to Toronto and the GTA",
    intro: "We serve Toronto and surrounding GTA communities.",
    card: { title: "Not on the list?", text: "Check every community we serve, grouped by region.", link: "See all locations" },
  },
};
