import type { IconName } from "@/components/icons";
import type { ImageKey } from "../images";
import { HREF, categoryHref } from "../routes";

export const HOME = {
  meta: {
    title: "Junk Removal Toronto & GTA | Live Junk Free",
    description:
      "Junk removal, cleanouts and small demolition across Toronto and the GTA. We do all the lifting, sweep up, and donate or recycle whenever possible.",
  },
  hero: {
    image: "crewStreet" as ImageKey,
    alt: "Two Live Junk Free crew members in front of the company truck",
    pills: { rating: "on Google", sameDay: "Same-day when available" },
    h1: "Junk gone. Space back.",
    lead: "Junk removal, cleanouts and small demolition across Toronto and the GTA. We do all the lifting, sweep up, and donate or recycle whenever possible.",
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
      { variant: "d", href: HREF.deck, image: "deckAfter" as ImageKey, alt: "Backyard after a deck removal", label: "Demolition", title: "Demolition", text: "Decks, sheds, fences, hot tubs and playsets, torn down and hauled away the same day." },
    ],
  },
  beforeAfter: {
    title: "Same yard. One visit later.",
    intro: "Drag the handle. This is what one visit from our crew looks like.",
    before: "deckBefore" as ImageKey,
    after: "deckAfter" as ImageKey,
  },
  pricing: {
    title: "Pricing you can see",
    intro: "You pay for how much of the truck your items fill. Tap a load size to see what usually fits.",
  },
  steps: { title: "Booked in minutes. Gone in one visit.", cta: "How it works" },
  stats: { title: "Rated 5 star by customers" },
  destinations: {
    title: "Where your junk ends up",
    intro: "Every load is sorted after pickup. Landfill is the last stop, not the first.",
    // Lead card: headline and FAQ line from livejunkfree.ca/how-it-works/
    lead: { title: "Go clean, go green", text: "Our goal is to minimize waste and give back to the community whenever we can." },
    items: [
      { icon: "heart" as IconName, leaf: true, label: "Donated", text: "Usable furniture and household goods go to local charities whenever possible." },
      { icon: "leaf" as IconName, leaf: true, label: "Recycled", text: "Metal, e-waste, cardboard, appliances and mattresses are recycled whenever possible." },
      { icon: "truck" as IconName, leaf: false, label: "Disposed", text: "Everything else is disposed of in a sustainable manner, without causing harm to the surroundings." },
    ],
  },
  areas: {
    title: "Local to Toronto and the GTA",
    intro: "Our trucks run across the city and 25 surrounding communities, 7 days a week.",
    card: { title: "Not on the list?", text: "Check every community we serve, grouped by region.", link: "See all locations" },
  },
};
