import { FAQS } from "../faqs";
import { cityLinks } from "../nav";
import { COUCH_PRICING } from "../pricing";
import { REVIEW_SETS } from "../reviews";
import { svc } from "../routes";
import type { ItemContent } from "../types";

/** Designed page: Template: Item removal (Couch). Copy from livejunkfree.ca's couch removal page. */
export const COUCH: ItemContent = {
  hero: {
    h1: "Couch and sofa removal in Toronto and the GTA",
    lead: "Sectionals, sleeper sofas, recliners and loveseats. We remove couches from any location, including tight basements and high-rise apartments.",
    ticks: ["Removed from inside: basements, stairs, condos", "Disassembly when it won't fit through the door", "Price confirmed before we lift"],
    image: "couch",
    alt: "Living room after a Live Junk Free couch removal",
    callout: {
      title: "Starting at C$125",
      note: "Single item, all cleanup included.",
    },
  },
  take: {
    title: "What we take",
    intro: "Whether it weighs 80 pounds or 400, whether it disassembles or doesn't, whether it's from a basement or a penthouse — if it's a couch, we remove it.",
    ticks: [
      "Pull-out sofa beds",
      "Sectional sofas (L & U shape)",
      "Power & manual recliners",
      "Loveseats & 2-seaters",
      "Chesterfields & tuxedo sofas",
      "Futons & daybeds",
      "Modular & convertible sofas",
      "Sleeper sofas (queen & full)",
      "Accent chairs & armchairs",
      "Ottomans & storage benches",
    ],
    note: `Bed bugs? See [bed bug furniture removal](${svc("bed-bug-furniture-removal-services")}).`,
  },
  panels: [
    { icon: "stairs", title: "Stairs and tight spaces", text: "We disassemble pieces when needed and protect your floors and door frames throughout." },
    { icon: "building", title: "Condos and apartments", text: "We service high-rises, condos, and walk-ups; no job is too tricky." },
    { icon: "leaf", leaf: true, title: "Donated when possible", text: "Responsible disposal through recycling centers or donation partners." },
    { icon: "box", title: "Add other items", text: "Removing a couch and a few other items? Bundle them together for a better rate on the whole job." },
  ],
  pricing: {
    title: "Couch removal pricing",
    intro: "Free estimate before we book anything. Get your exact price via phone, text, or photo.",
    panels: COUCH_PRICING,
  },
  steps: {
    title: "How couch removal works",
    list: [
      { title: "Text us a photo of your couch", text: "Show us the couch and the space it's in — that's all we need to give you an accurate quote." },
      { title: "Receive a clear, all-in quote", text: "Labor, hauling, and disposal — all included. Nothing added at the door." },
      { title: "Choose a time that works for you", text: "Pick same-day, next morning, or any time that suits your schedule — including weekends." },
      { title: "We arrive, we remove, we clean up", text: "Disassembly if needed, careful extraction, full cleanup. Most jobs are wrapped up in under an hour." },
    ],
  },
  reviews: REVIEW_SETS.couch,
  faq: FAQS.couch,
  related: [
    {
      title: "Often booked together",
      links: [
        { label: "Mattress removal", href: svc("mattress-removal-services") },
        { label: "Furniture removal", href: svc("furniture-removal-services") },
        { label: "Appliance removal", href: svc("appliance-removal-services") },
        { label: "Basement cleanout", href: svc("basement-cleanouts-services") },
      ],
    },
    { title: "Couch removal near you", links: cityLinks(["Toronto", "Mississauga", "Vaughan", "Markham", "Brampton"]) },
  ],
  cta: { h: "Get rid of that couch this week", form: { service: "Single item or a few items" } },
};
