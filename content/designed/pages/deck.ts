import { FAQS } from "../faqs";
import { PRICE_NOTES } from "../pricing";
import { svc } from "../routes";
import type { DemolitionContent } from "../types";

/** Designed page: Template: Demolition (Deck). Copy from livejunkfree.ca's deck demolition page. */
export const DECK: DemolitionContent = {
  hero: {
    h1: "Deck removal and demolition",
    lead: "We specialize in making old decks disappear quickly, safely, and affordably, and we handle every step from the first loose board to the final sweep of your clean, open yard.",
    ticks: ["Same-day and next-day deck removal", "Wood, composite, and metal sorted for recycling", "Free, no-obligation estimates"],
    image: "deckAfter",
    alt: "Backyard after a Live Junk Free deck removal",
    primary: "Get a demolition quote",
  },
  scope: {
    included: ["Boards, railings, stairs and framing", "All debris loaded and hauled", "Nails and screws swept up", "Eco-friendly disposal for all materials"],
    before: ["Clear furniture and planters", "Turn off and disconnect any lighting or hot tub power", "Tell us about gas lines or anything under the deck"],
    excluded: ["Electrical disconnection by a licensed electrician", "Rebuilding or landscaping"],
  },
  pricing: {
    title: "What affects the price",
    intro: "You only pay for what we remove.",
    note: PRICE_NOTES.deck,
  },
  steps: {
    title: "How deck removal works",
    list: [
      { title: "Send us photos", text: "Take a few pictures of your deck and text or upload them to us for a free, no-obligation quote." },
      { title: "Get your quote", text: "Straightforward pricing with no hidden fees, based on your deck's size, materials, and condition." },
      { title: "Pick your time", text: "Select same-day service, next-day availability, or schedule a future date that works for you." },
      { title: "We remove it", text: "Our crew arrives on time, safely demolishes your deck, removes all debris, and leaves your yard clean." },
    ],
  },
  other: {
    title: "Other demolition we do",
    items: [
      { label: "Sheds", href: svc("shed-demolition-services"), icon: "home" },
      { label: "Fences", href: svc("fence-demolition-services"), icon: "hammer" },
      { label: "Hot tubs", href: svc("hot-tub-demolition-services"), icon: "tub" },
      { label: "Playsets & swing sets", href: svc("playset-demolition-services"), icon: "tree" },
      { label: "Gazebos", href: svc("gazebo-demolition-services"), icon: "home" },
      { label: "Above-ground pools", href: svc("above-ground-pool-demolition-services"), icon: "tub" },
      { label: "Garages", href: svc("garage-demolition-services"), icon: "building" },
      { label: "Concrete", href: svc("concrete-demolition-services"), icon: "box" },
    ],
  },
  faq: FAQS.deck,
  cta: {
    h: "Get your deck removal quote",
    p: "Send a few photos and rough dimensions for a faster quote.",
    form: { title: "Demolition quote", service: "Demolition (deck, shed, fence)", cta: "Request a quote" },
  },
};
