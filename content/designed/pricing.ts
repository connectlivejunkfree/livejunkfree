/**
 * Pricing. Only two figures are published on livejunkfree.ca:
 *   - small or single-item removals start at C$125
 *   - a full truckload is C$655
 * Everything else is volume-based and confirmed with a free on-site estimate.
 */

export const PRICES = {
  from: "C$125",
  fromLabel: "Small or single-item removals",
  full: "C$655",
  fullLabel: "Full truckload",
} as const;

/** Truck load sizes for the LoadMeter: what usually fits. `fill` = lit truck cells (of 8). */
export type Load = { k: string; eq: string; items: string[]; fill: number };

export const LOADS: Load[] = [
  { k: "1/8", eq: "About one pickup-truck bed", items: ["A couch", "A mattress + box spring", "A few boxes"], fill: 1 },
  { k: "1/4", eq: "A small room or a garage corner", items: ["Bedroom set", "Washer + dryer", "Patio set"], fill: 2 },
  { k: "1/2", eq: "A one-bedroom apartment", items: ["Living room furniture", "Basement storage", "Hot tub (cut down)"], fill: 4 },
  { k: "3/4", eq: "A full garage or large basement", items: ["Garage cleanout", "Renovation debris", "Office move-out"], fill: 6 },
  { k: "Full", eq: "A small house cleanout", items: ["Estate cleanout", "Whole-house declutter", "Small shed teardown"], fill: 8 },
];

export const DEFAULT_LOAD = 1;

export const LOAD_METER = {
  tag: "Load size",
  fitsLabel: "What usually fits",
  footnote:
    "You pay for the space your items fill in our truck, with a free on-site estimate and no hidden fees. The price you approve is the price you pay.",
  cta: "Get my exact price",
  secondary: "How pricing works",
};

/** Pricing sentences used on individual pages (all from livejunkfree.ca). */
export const PRICE_NOTES = {
  howItWorks:
    "Small or single-item removals start at C$125. A full truckload is C$655. Final price depends on volume, item type and access, confirmed with a free on-site estimate.",
  estate: "A full truckload is C$655, small removals start at C$125. Larger properties may take several loads.",
  commercial: "Clear quotes starting at C$125, with volume discounts for multi-site cleanouts.",
  deck: "Our services start at C$125, with final pricing based on size, materials, and complexity. We provide free, no-obligation estimates.",
} as const;

/** Couch page pricing panels (livejunkfree.ca couch removal page). */
export const COUCH_PRICING = [
  {
    title: "Single item removal starting at C$125",
    text: "One couch, one pickup, all cleanup included. Perfect for a single sofa, loveseat, or recliner.",
    ticks: ["Disassembly if required", "Floor & wall protection", "Post-removal area cleanup", "Eco-responsible disposal"],
  },
  {
    title: "Save more by choosing a multi-item bundle",
    text: "Removing a couch and a few other items? Bundle them together for a better rate on the whole job.",
    ticks: ["Couches + any other furniture", "Appliances included", "Mattresses & bed frames", "All cleanup & disposal included"],
  },
];
