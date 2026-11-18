import { fact } from "@/lib/content/facts";
import { FAQS } from "../faqs";
import { PRICE_NOTES } from "../pricing";
import { svc } from "../routes";
import type { DemolitionContent } from "../types";

/** Designed page: Template: Demolition (Deck). Copy from livejunkfree.ca's deck demolition page. */
export const DECK: DemolitionContent = {
  hero: {
    h1: "Deck removal and demolition",
    lead: "We specialize in making old decks disappear quickly, safely, and affordably, and we handle every step from the first loose board to hauling the last of it away.",
    ticks: [fact("sameDay", "short"), fact("recycling"), "Free, no-obligation estimates"],
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
      { title: "Get your quote", text: "A clear quote based on your deck's size, materials and condition, confirmed before work begins." },
      { title: "Pick your time", text: "Pick a date that works for you. We confirm timing when you book." },
      { title: "We remove it", text: "Our crew arrives at the agreed time, takes the deck down, removes the debris and tidies the work area." },
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
