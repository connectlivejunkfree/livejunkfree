import { FAQS } from "../faqs";
import { REVIEW_SETS } from "../reviews";
import { svc } from "../routes";
import type { CleanoutContent } from "../types";

/** Designed page: Template: Sensitive cleanout (Estate). Calm variant. Copy from livejunkfree.ca's estate cleanout page. */
export const ESTATE: CleanoutContent = {
  calm: true,
  hero: {
    h1: "Estate cleanouts, handled with care",
    lead: "Live Junk Free helps families, executors and property representatives clear unwanted furniture and household contents. You decide what stays; we remove what needs to go.",
    ticks: [
      "We discuss the property and quote before scheduling the cleanout",
      "Our crew handles the lifting, carrying and loading",
      "Arranging it from out of town? Tell us who can provide access",
    ],
    image: "estate",
    alt: "Live Junk Free crew member clearing a property",
    primary: "Request an estate quote",
  },
  includes: {
    title: "What we can help remove",
    intro: "We discuss the size of the cleanout, access requirements and the items to be removed before arranging the job.",
    panels: [
      { icon: "home", title: "Household furniture", text: "Sofas, tables, chairs, beds and other household furniture." },
      { icon: "box", title: "Contents and clutter", text: "Boxes, books, unwanted household items and general clutter." },
      { icon: "key", title: "Basements, garages, storage", text: "Furniture and stored contents in basements, garages and storage areas." },
      { icon: "truck", title: "Full-property cleanouts", text: "Several rooms or a full-property cleanout that may require multiple truckloads." },
    ],
  },
  steps: {
    title: "How it works",
    list: [
      { title: "Call us", text: "Tell us the property city, approximate scope, items to remove and any important deadline." },
      { title: "Review the job", text: "Share details or photos if helpful. We will confirm whether an additional assessment is needed for a quote." },
      { title: "Agree on what goes", text: "Identify the items to retain, confirm access and review the removal scope and price." },
      { title: "Arrange removal", text: "Our crew lifts, carries and loads the agreed unwanted items once the job details and schedule are confirmed." },
    ],
  },
  audience: {
    title: "Who we help",
    ticks: [
      "**Families** clearing inherited homes, after identifying the belongings to keep",
      "**Executors and estate representatives** who need to discuss scope, access and next steps",
      "**Homeowners and realtors** clearing agreed rooms ahead of a listing or handover",
      "**Relatives out of town**: tell us who can provide access and approve the removal instructions",
    ],
  },
  limits: {
    title: "What we don't do",
    text: "Live Junk Free is a paid removal service. We don't buy, appraise or sell estate contents. Before removal begins, separate cash, jewellery, family photographs, documents and anything relatives want to keep, and clearly mark items that should remain in the property.",
    note: `Hoarding situations: see [hoarding cleanouts](${svc("hoarding-cleanouts-services")}).`,
  },
  pricing: {
    title: "How estate cleanouts are priced",
    intro: "A full truckload is C$655, small removals start at C$125. Larger properties may take several loads.",
  },
  reviews: REVIEW_SETS.estate,
  faq: FAQS.estate,
  cta: {
    h: "Talk to us before you decide anything",
    p: "Tell us where the property is and what needs to go. We will help you understand the next step and quote process.",
    form: { title: "Request an estate quote", service: "Estate or whole-house cleanout", cta: "Request an estate quote" },
  },
  mobileCta: "Get an estate quote",
};
