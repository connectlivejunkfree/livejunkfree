/**
 * Copy for the hub, pricing, contact, locations index, landing, about and blog pages.
 * Claims come from livejunkfree.ca (checked 7 Nov 2026).
 */
import type { IconName } from "@/components/icons";
import { FAQS } from "../faqs";
import type { ImageKey } from "../images";
import { AREAS } from "../locations";
import { PRICE_NOTES } from "../pricing";
import { REVIEW_SETS } from "../reviews";
import { STEPS_STD } from "../shared";
import type { Step } from "../types";

export const SERVICES_HUB = {
  meta: {
    title: "Junk Removal Services | Live Junk Free",
    description: "Every Live Junk Free service on one page: residential, commercial, cleanouts and demolition across Toronto and the GTA.",
  },
  h1: "Every service, one page",
  lead: "Start with who you are, or search for the exact item. Every service includes loading, hauling, sweep-up and responsible disposal.",
  cardCta: "View services",
  az: {
    title: "Find your item",
    intro: "Don't see it? We probably take it. Send a photo.",
    search: "Search: piano, shed, fridge…",
    searchLabel: "Search services",
    overview: "Overview",
    empty: "No matching items. Send us a photo and we'll tell you if we take it.",
    note: "Each item keeps its existing URL and page.",
  },
  pricingTitle: "Not sure how much it'll cost?",
};

export const HOW_IT_WORKS = {
  meta: {
    title: "Junk Removal Pricing & How It Works | Live Junk Free",
    description: "Small or single-item removals start at C$125. A full truckload is C$655. Volume-based pricing, confirmed with a free on-site estimate.",
  },
  crumb: "Pricing and how it works",
  h1: "Simple pricing. Price confirmed before we lift.",
  lead: "You pay for the space your items take up in our truck, with upfront pricing and no hidden fees.",
  factors: {
    title: "What changes the price",
    items: [
      { icon: "truck" as IconName, title: "Volume", text: "How much of the truck your items fill." },
      { icon: "box" as IconName, title: "Type of items", text: "The kind of items being removed." },
      { icon: "stairs" as IconName, title: "Access", text: "The difficulty of removal: stairs, elevators and long carries." },
    ],
  },
  examples: {
    title: "What it costs",
    text: PRICE_NOTES.howItWorks,
  },
  steps: {
    title: "How it works",
    list: [
      { title: "Contact us for a no-obligation quote", text: "Call our official contact number. Our staff will answer your queries and explain our services." },
      { title: "Our professionals arrive", text: "We schedule a two-hour arrival window at your convenience and arrive on time with all the necessary tools and equipment." },
      { title: "Free on-site estimate", text: "Show the crew what needs to go. They quote using our simple price-per-volume formula, free of cost." },
      { title: "Load and clean up", text: "Once you approve the quote, the crew lifts everything, cleans the space and takes all the junk with them." },
      { title: "Handled responsibly", text: "Your items are sorted, then recycled or disposed of in a sustainable manner." },
    ] as Step[],
  },
  faq: FAQS.pricing,
};

export const CONTACT = {
  meta: {
    title: "Get a Free Junk Removal Quote | Live Junk Free",
    description: "Tell us what needs to go and get a free, no-obligation quote. Call or text +1 647 922 5865, 7 days a week, 6AM–11PM.",
  },
  crumb: "Get a quote",
  h1: "Get a free quote",
  lead: "Tell us what needs to go and we'll get back to you with a free, no-obligation quote.",
  fastest: "Fastest: call or text",
  hoursLabel: "Hours:",
  ticks: ["Quote is free and you're not committed", "Firm price confirmed on site before we start", "Photos help us give an accurate quote"],
  bookingFor: { label: "I'm booking for", options: ["My home", "A business", "An estate", "A property I manage"] },
};

export const LOCATIONS_INDEX = {
  meta: {
    title: "Junk Removal Service Areas | Toronto & GTA | Live Junk Free",
    description: `Toronto plus ${AREAS.length - 1} communities across Peel, York, Durham and Simcoe. Find your area for local details.`,
  },
  h1: "Every community we serve",
  lead: `Toronto plus ${AREAS.length - 1} communities across Peel, York, Durham and Simcoe. Find yours for local details.`,
  search: "Search your city or town",
  searchLabel: "Search locations",
  none: "We couldn't find that area. Call",
  noneAfter: "and we'll tell you if we can get there.",
  outside: {
    title: "Just outside the map?",
    text: "If you're unsure if we cover your area, please don't hesitate to contact us.",
    cta: "Check my area",
  },
};

export const LP_SAME_DAY = {
  meta: {
    title: "Same-Day Junk Removal Toronto & GTA | Live Junk Free",
    description: "Same-day available across Toronto, 7 days a week, 6AM–11PM. Price confirmed before we lift.",
  },
  h1: "Same-day junk removal in Toronto and the GTA",
  lead: "Same-day available across Toronto, 7 days a week, 6AM–11PM. Call for same-day availability.",
  ticks: ["Price confirmed before we lift", "Furniture, appliances, garage and basement junk", "Donated and recycled where possible"],
  image: "crewHero" as ImageKey,
  alt: "Live Junk Free crew loading the truck",
  form: { title: "Check today's availability", compact: true, cta: "Check availability" },
  pricingTitle: "What will it cost?",
  stepsTitle: "Three steps, one visit",
  steps: STEPS_STD,
  band: { title: "Want it gone today?", cta: "Check availability online" },
  mobile: { call: "Call now", cta: "Check today" },
};

export const LP_ESTATE = {
  meta: {
    title: "Estate Cleanouts Across the GTA | Live Junk Free",
    description: "We help families, executors and property representatives clear unwanted furniture and household contents. Call to discuss the property and get a quote.",
  },
  h1: "Estate cleanouts across the GTA, at your pace",
  lead: "We help families, executors and property representatives clear unwanted furniture and household contents. Call us to discuss the property and get a quote before scheduling the cleanout.",
  ticks: ["You decide what stays; we remove what needs to go", "Work with executors, realtors and family out of town", "Clear agreed rooms ahead of a listing or handover"],
  image: "estate" as ImageKey,
  alt: "Live Junk Free crew member clearing a property",
  form: { title: "Request an estate quote", compact: true, cta: "Request an estate quote" },
  talkFirst: "Prefer to talk first?",
  stepsTitle: "How it works",
  steps: [
    { title: "Call us", text: "Tell us the property city, approximate scope, items to remove and any important deadline." },
    { title: "Review the job", text: "Share details or photos if helpful. We will confirm whether an additional assessment is needed for a quote." },
    { title: "Agree on what goes", text: "Identify the items to retain, confirm access and review the removal scope and price." },
    { title: "Arrange removal", text: "Our crew lifts, carries and loads the agreed unwanted items once the job details and schedule are confirmed." },
  ] as Step[],
  reviews: REVIEW_SETS.home,
  faq: FAQS.lpEstate,
  mobile: { call: "Call", cta: "Get a quote" },
};

/** livejunkfree.ca/about/, arranged for the new layout. */
export const ABOUT = {
  meta: {
    title: "About Live Junk Free | Junk Removal in the Greater Toronto Area",
    description: "Live Junk Free is a residential and commercial junk removal provider in the Greater Toronto Area: household junk, construction debris, yard waste and more.",
  },
  h1: "About Live Junk Free",
  lead: "With years of experience, acumen and devotion, Live Junk Free has gained a reputation as a professional commercial and residential junk removal services provider dealing with household junk, construction debris, yard waste and more.",
  image: "crewAbout" as ImageKey,
  imageAlt: "Live Junk Free crew member loading the truck",
  intro: [
    "Not just removing the junk from the spaces but our experts are quite efficient in hauling, recycling and disposing of items in an eco-friendly manner.",
    "Since we're known highly for making the process smooth for our clients, we are able to achieve this through customization. We also contend to remain ahead of our competitors with constant research about current trends and innovations in decluttering methods.",
  ],
  mission: {
    title: "Our mission",
    text: "Our mission is to make cleanouts easygoing and convenient by devoting attention to the smallest of details and upholding our high standards of personalisation which offers unparalleled comfort to the customers. With customised solutions that guarantee optimum ease and fulfilment with the least amount of labour and time, we hope to meet the individual demands of every client.",
  },
  guarantee: {
    title: "Live Junk Free guarantees",
    text: "From the very beginning till the end, we take note that each step is accomplished properly including lifting hefty items, eliminating the junk from the premises and taking them away to dispose of sustainably. Instead of just focusing on delivering the services, it's the flawlessness of the service that we guarantee.",
  },
  unique: {
    title: "What makes Live Junk Free unique?",
    items: [
      {
        icon: "shield" as IconName,
        title: "Experience and expertise",
        // The About page also says "over a decade"; the homepage counter says 6+ years. Left out until the client confirms which is right.
        text: "Being in the industry comes with an immense amount of understanding of what exactly is expected of us. Constantly evolving ourselves with time according to the dynamics has truly benefited us and made us stand out among our competitors.",
      },
      {
        icon: "heart" as IconName,
        title: "Customer-centric approach",
        text: "Customers' comfort level always remains our top priority. Whether scheduling the slot according to their preferred timing or decluttering the space as per their instructions, our objective is to bestow them with the best of experiences.",
      },
      {
        icon: "leaf" as IconName,
        title: "Environmentally responsible practices",
        text: "We prioritise and incorporate nature-friendly disposal strategies in our process of home and office rubbish clearance to reduce the damage we cause and encourage sustainability.",
      },
      {
        icon: "tag" as IconName,
        title: "Transparent pricing",
        text: "We believe trust is the foundation of any relationship, so we are transparent about pricing and other details with our customers. Our quotation is free from any hidden costs while being extremely fair and budget-friendly.",
      },
    ],
  },
};

/** Latest posts on livejunkfree.ca/blog/ (they stay on the current site until migrated). */
export const BLOG = {
  meta: {
    title: "Blog | Live Junk Free",
    description: "Fresh junk removal updates, cleanup tips, and company news from the Live Junk Free team.",
  },
  h1: "Blog",
  lead: "Fresh junk removal updates, cleanup tips, and company news from the Live Junk Free team.",
  posts: [
    { date: "2026-10-17", title: "Does Toronto Have Same-Day Junk Removal?", excerpt: "Yes, Toronto has same-day junk removal services that can help homeowners, renters, landlords, and businesses get rid of unwanted items without waiting…", href: "https://livejunkfree.ca/blog/does-toronto-have-same-day-junk-removal/" },
    { date: "2026-10-15", title: "Do Junk Removal Services Remove Sheds or Playsets?", excerpt: "Old sheds and outdoor playsets can take up a lot of space in your backyard. A shed may be damaged by years…", href: "https://livejunkfree.ca/blog/do-junk-removal-services-remove-sheds-or-playsets/" },
    { date: "2026-10-13", title: "How Do Companies Handle Large-Scale Cleanouts?", excerpt: "Clearing an entire house, commercial property, warehouse, or storage facility can be a major project. Large-scale cleanouts often involve furniture, appliances, office…", href: "https://livejunkfree.ca/blog/how-do-companies-handle-large-scale-cleanouts/" },
    { date: "2026-10-11", title: "Should I Throw My Bed Frame Away If I Have Bed Bugs?", excerpt: "Finding bed bugs in your bedroom can be stressful, especially when you discover them around your bed frame. You may immediately wonder…", href: "https://livejunkfree.ca/blog/should-i-throw-my-bed-frame-away-if-i-have-bed-bugs/" },
    { date: "2026-10-09", title: "Can You Hire Someone to Clean Out a House?", excerpt: "Yes, you can hire a professional company to clean out a house. If your property is filled with unwanted furniture, appliances, boxes,…", href: "https://livejunkfree.ca/blog/can-you-hire-someone-to-clean-out-a-house/" },
    { date: "2026-10-07", title: "Which Junk Removal Services Specialize in Yard Cleanup?", excerpt: "A yard can collect more unwanted items than you might expect. Old patio furniture, broken garden tools, branches, outdoor equipment, damaged fencing,…", href: "https://livejunkfree.ca/blog/which-junk-removal-services-specialize-in-yard-cleanup/" },
    { date: "2026-10-04", title: "Best Estate Cleanout Near Me for Aging Parents With Too Many Belongings", excerpt: "As parents get older, their homes can gradually become filled with belongings collected over many years. Furniture, clothing, books, kitchen items, family…", href: "https://livejunkfree.ca/blog/best-estate-cleanout-near-me-for-aging-parents-with-too-many-belongings/" },
  ],
  more: { label: "See all posts on livejunkfree.ca", href: "https://livejunkfree.ca/blog/" },
};

/** The live privacy policy is unedited WordPress default text, so this page stays pending. */
export const PRIVACY = {
  h1: "Privacy policy",
  lead: "Live Junk Free's privacy policy is being written for the new site. For any privacy question, email info@livejunkfree.ca.",
};
