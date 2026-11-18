/**
 * Copy reused across several pages. Every claim here appears on livejunkfree.ca.
 */
import type { IconName } from "@/components/icons";
import { fact } from "@/lib/content/facts";
import type { Step } from "./types";

export const STEPS_STD: Step[] = [
  { title: "Tell us what needs to go", text: "Call, text or send photos. We give you a free, no-obligation quote." },
  { title: "We confirm the price on site", text: "The crew sees the load, gives you a firm price, and only starts when you say yes." },
  { title: "We load and haul it away", text: "We remove the agreed items from the house, garage or yard, and recycle or donate suitable items where practical." },
];

export const TRUST: { icon: IconName; title: string; text: string }[] = [
  { icon: "clock", title: fact("sameDay", "short"), text: `${fact("weekendPickup")}. ${fact("businessHours")}.` },
  { icon: "tag", title: "Price before we lift", text: "Free onsite estimate; your quote is confirmed before work begins" },
  { icon: "leaf", title: "Donate and recycle first", text: fact("recycling") },
  { icon: "shield", title: "Fully licensed and insured", text: "Insured, uniformed, and respectful crew" },
];

export const CTA_DEFAULT = {
  h: "Ready to clear it out?",
  p: "Send a few details and photos. You get a free, no-obligation quote before anyone lifts a thing.",
  callLabel: "Or call us now",
  ticks: ["No charge for the quote", "Price confirmed before we start", "Clean-up included"],
};

export const QUOTE_FORM = {
  title: "Get a free quote",
  cta: "Send my quote request",
  services: [
    "Single item or a few items",
    "Garage, basement or room cleanout",
    "Estate or whole-house cleanout",
    "Office or commercial",
    "Demolition (deck, shed, fence)",
    "Not sure",
  ],
  labels: {
    company: "Company",
    name: "Your name",
    phone: "Phone",
    email: "Email",
    postal: "Postal code",
    postalHint: "M6K 1X9",
    day: "Preferred day",
    service: "What do you need?",
    details: "What needs to go?",
    detailsHint: "e.g. 3-seat couch, old fridge, 10 boxes. Third floor, elevator available.",
    photos: "Add photos",
    photosHint: "for a faster, more accurate price",
    optional: "(optional)",
  },
  note: "Prefer to talk? Call",
  success: "Request sent. We'll call or text you shortly.",
  sending: "Sending…",
};

export const PENDING_BANNER = "Preview: content for this page is pending";
