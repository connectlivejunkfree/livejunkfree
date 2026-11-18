/**
 * Pricing for the designed pages and the interactive truck.
 *
 * Exact figures from Nav's rate card (content/pricing.json → junkLoad / bedLoad),
 * approved in docs/client/batch-1/LJF_Akshat_Point_by_Point_Answers_18_Nov_2026.pdf.
 * Junk Load and Bed Load are separate schedules; each has its own labour note.
 * "From C$125" applies only to a standard 1/16 Junk Load (Answers A1.3); services
 * the card doesn't price use the quote wording (A1.6). See docs/PRICING.md.
 */
import pricingJson from "@content/pricing.json";
import { fact } from "@/lib/content/facts";

type RawSize = { id: string; label: string; cubicYards: number; fillPercent: number; price: number | null };
type RawProduct = { label: string; description: string; labour: string; defaultSize: string; sizes: RawSize[] };

export type LoadSize = RawSize & {
  /** "C$265", or the quote wording while a price is missing. */
  display: string;
  /** "4 cubic yards" */
  volume: string;
};
export type ProductKey = "junkLoad" | "bedLoad";
export type LoadProduct = { key: ProductKey; label: string; description: string; labour: string; defaultIndex: number; sizes: LoadSize[] };

export const PRICING_STATUS: string = (pricingJson as { _status?: string })._status ?? "";

const cad = (n: number) => `C$${Number.isInteger(n) ? n : n.toFixed(2)}`;
const yd = (n: number) => `${n} cubic yard${n === 1 ? "" : "s"}`;

function product(key: ProductKey): LoadProduct {
  const p = (pricingJson as unknown as Record<ProductKey, RawProduct>)[key];
  const sizes = p.sizes.map((s) => ({ ...s, display: s.price === null ? fact("quoteText") : cad(s.price), volume: yd(s.cubicYards) }));
  const defaultIndex = Math.max(0, sizes.findIndex((s) => s.id === p.defaultSize));
  return { key, label: p.label, description: p.description, labour: p.labour, defaultIndex, sizes };
}

export const PRODUCTS: Record<ProductKey, LoadProduct> = { junkLoad: product("junkLoad"), bedLoad: product("bedLoad") };

export const LOAD_METER = {
  tag: "Load size",
  intro: fact("pricingIntro"),
  extra: fact("pricingIntro", "extra"),
  estimates: fact("freeOnsiteEstimates", "long"),
  curbside: fact("curbsideDiscount"),
  tax: fact("taxNote"),
  call: "Call",
  cta: "Get a quote",
};

/** Pricing sentences used on individual designed pages. */
export const PRICE_NOTES = {
  howItWorks: `${fact("minimumPrice")}. ${fact("fullLoadPrice")}. ${fact("taxNote")}.`,
  estate: `Estate cleanouts are priced by the load sizes needed and the work involved. ${fact("quoteText")}`,
  commercial: fact("quoteText"),
  deck: fact("quoteText"),
} as const;

/** Couch page pricing panels (a couch is standard junk removal, so the Junk Load card applies). */
export const COUCH_PRICING = [
  {
    title: fact("minimumPrice", "short"),
    text: `The final quote depends on the items, access and work required and is confirmed before removal begins. ${fact("taxNote")}.`,
    // Manisha 18 Nov: don't present disposal or other charges as included in the displayed rate.
    ticks: [fact("labourJunk"), "Disassembly, stairs and long carries reviewed in your quote", "Recycled or donated where practical"],
  },
  {
    title: "More than one item?",
    text: "Removing a couch and a few other items? Tell us everything and we'll quote it as one job at your free onsite estimate.",
    ticks: ["Couches and other furniture", "Appliances (disconnected)", "Mattresses and bed frames", "Any disposal or extra handling charges explained in your quote"],
  },
];
