import { FAQS } from "../faqs";
import { PRICE_NOTES } from "../pricing";
import { REVIEW_SETS } from "../reviews";
import type { CommercialContent } from "../types";

/** Designed page: Template: Commercial (Office). Copy from livejunkfree.ca's business cleanout page. */
export const OFFICE: CommercialContent = {
  hero: {
    h1: "Office and commercial junk removal",
    lead: "Whether you're clearing a small professional office or a large industrial facility, our business cleanout team handles every detail, from careful removal of office equipment to proper sorting of inventory and thorough space cleaning.",
    ticks: ["Licensed & insured team", "Same-day and next-day business cleanouts", "Clear quotes starting at C$125"],
    image: "business",
    alt: "Live Junk Free crew clearing out a business space",
    primary: "Request a commercial quote",
  },
  segments: [
    { title: "Office relocation cleanouts" },
    { title: "Facility closure cleanouts" },
    { title: "Industrial warehouse cleanouts" },
    { title: "Medical office cleanouts" },
  ],
  schedule: {
    title: "Built for business schedules",
    intro: "Facing an urgent timeline? We offer same-day and next-day business cleanout services, perfect for businesses preparing for sale or quick relocations.",
    ticks: [
      "Honest, upfront pricing with all costs clearly explained",
      "Secure document destruction and data protection",
      "Eco-friendly disposal, donation, and recycling programs",
      "Uniformed, insured crew that respects your commercial space",
    ],
  },
  includes: {
    title: "Full-service business cleanouts include",
    items: [
      "Complete removal from all areas (offices, storage rooms, production floors)",
      "Safe hauling of furniture, equipment, inventory, and electronics",
      "Secure document destruction and data protection",
      "Eco-friendly disposal, donation, and recycling programs",
    ],
  },
  pricing: {
    title: "How commercial jobs are priced",
    intro: "You only pay for what we take.",
    note: PRICE_NOTES.commercial,
  },
  steps: {
    title: "From first call to empty floor",
    list: [
      { title: "Share your needs", text: "Email or text details about your business space. We'll quickly assess and provide a tailored solution." },
      { title: "Receive your quote", text: "Get honest, upfront pricing for your business cleanout with all costs clearly explained - no surprises." },
      { title: "Choose your time", text: "Select same-day, next-day, or schedule in advance." },
      { title: "We do it all", text: "Our crew clears your commercial space and leaves it ready for new occupants or renovations." },
    ],
  },
  reviews: REVIEW_SETS.office,
  faq: FAQS.commercial,
  cta: {
    h: "Get a commercial quote",
    p: "Tell us about the space and timeline. We'll come back with honest, upfront pricing.",
    form: { title: "Commercial quote request", commercial: true, service: "Office or commercial", cta: "Request a quote" },
  },
  mobileCta: "Request a quote",
};
