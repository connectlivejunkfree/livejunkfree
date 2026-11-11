import { FAQS } from "../faqs";
import { TOP_AREAS } from "../locations";
import { cityLinks } from "../nav";
import { REVIEW_SETS } from "../reviews";
import { HREF, svc } from "../routes";
import type { LocationContent } from "../types";

/** Designed page: Template: Location (Toronto). Copy from livejunkfree.ca/locations/toronto/. */
export const TORONTO: LocationContent = {
  hero: {
    h1: "Junk removal in Toronto",
    lead: "From downtown condos on King Street to detached homes in Willowdale, we come to your Toronto property, assess everything in person and hand you a free on-site estimate before touching a single item.",
    ticks: ["Same-day junk removal, 7 days a week, 6AM to 11PM", "Condo-ready: elevator booking and loading docks", "Free on-site estimate before any work begins"],
    image: "crewAbout",
    alt: "Live Junk Free crew loading the truck in Toronto",
  },
  local: {
    title: "Getting junk out of Toronto homes",
    intro: "Volume-based pricing — the only fair way to charge in a city this diverse.",
    panels: [
      {
        title: "Condo towers",
        text: "For condo and high-rise buildings across downtown Toronto, Midtown, North York and beyond — elevator booking and building coordination is included in your quote.",
      },
      {
        title: "Priced by volume",
        text: "Whether you're in a 500 sq ft downtown condo or a 4,000 sq ft detached home in North York — you pay based on how much space your junk fills in our truck. Not by the hour.",
      },
      {
        title: "No Toronto premiums",
        text: "A job in the Financial District is priced the same way as a job in Scarborough — by volume. Your address in this city is never used to inflate your bill.",
      },
    ],
  },
  neighbourhoods: {
    title: "Neighbourhoods we serve",
    list: ["Downtown", "Midtown", "West End", "East End", "North York", "York", "East York", "Etobicoke", "Scarborough", "Willowdale", "King West"],
  },
  popular: {
    title: "Popular services in Toronto",
    items: [
      { label: "Couch removal", href: HREF.couch, icon: "sofa" },
      { label: "Condo cleanouts", href: svc("apartment-cleanouts-services"), icon: "building" },
      { label: "Estate cleanouts", href: HREF.estate, icon: "heart" },
      { label: "Office cleanouts", href: HREF.office, icon: "file" },
    ],
  },
  reviews: REVIEW_SETS.toronto,
  faq: FAQS.toronto,
  nearby: {
    title: "Nearby areas",
    links: [...cityLinks(TOP_AREAS.filter((a) => a !== "Toronto")), { label: "All locations", href: HREF.locations }],
  },
  cta: { h: "Book a Toronto pickup" },
};
