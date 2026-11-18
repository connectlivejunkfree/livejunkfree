import { fact } from "@/lib/content/facts";
import { FAQS } from "../faqs";
import { PRICE_NOTES } from "../pricing";
import { REVIEW_SETS } from "../reviews";
import type { CommercialContent } from "../types";

/** Designed page: Template: Commercial (Office). Copy from livejunkfree.ca's business cleanout page. */
export const OFFICE: CommercialContent = {
  hero: {
    h1: "Office and commercial junk removal",
    lead: "Whether you're clearing a small professional office or a large industrial facility, our business cleanout team handles every detail, from planning access with your building to careful removal of office furniture and equipment.",
    ticks: ["Licensed & insured team", fact("sameDay", "short"), fact("freeOnsiteEstimates")],
    image: "business",
    alt: "Live Junk Free crew clearing out a business space",
    primary: "Request a commercial quote",
  },
  // QA 18 Nov B1-35 / OBS-99: each segment says what to tell us and links to the matching service.
  segments: [
    { title: "Office relocation cleanouts", text: "Desks, chairs, filing cabinets and unwanted equipment. Tell us the floor, elevator and loading-dock rules.", href: "/services/commercial-junk-removal-services/office-furniture-removal-services/" },
    { title: "Facility closure cleanouts", text: "Mark anything that stays (inventory, fixtures, equipment) and we quote the rest at the onsite estimate.", href: "/services/commercial-junk-removal-services/retail-cleanout-services/" },
    { title: "Warehouse cleanouts", text: `${fact("equipmentScope")}.`, href: "/services/commercial-junk-removal-services/warehouse-cleanout-services/" },
    { title: "Medical office furniture", text: `Non-hazardous furniture and equipment only. ${fact("medicalOffice")}` }, // Answers B5.3
  ],
  schedule: {
    title: "Built for business schedules",
    intro: `Facing a tight timeline? Tell us your dates when you call. ${fact("sameDay")}.`,
    ticks: [
      // Answers B1.4, B5.2, B4.1, B3.1
      fact("competitorComparison"),
      fact("recycling"),
      "Licensed and insured crew that respects your commercial space",
    ],
  },
  includes: {
    title: "Full-service business cleanouts include",
    items: [
      "Complete removal from all areas (offices, storage rooms, production floors)",
      "Safe hauling of furniture, equipment, inventory, and electronics",
      // Answers B5.1 / B5.2: no in-house shredding or data destruction
      `${fact("dataSecurity")}`,
      fact("recycling"),
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
      { title: "Choose your time", text: "Pick a date that suits your business. We confirm timing when you book." },
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
