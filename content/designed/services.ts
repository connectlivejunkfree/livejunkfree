/**
 * Service catalogue: the 4 categories and every A–Z item.
 * Slugs follow the existing livejunkfree.ca URL structure. Do not change a slug
 * without adding a 301 redirect.
 */
import type { IconName } from "@/components/icons";
import type { ImageKey } from "./images";

export type CategoryKey = "residential" | "commercial" | "cleanouts" | "demolition";
/** Which page template a category's items render with. */
export type TemplateKind = "item" | "commercial" | "cleanout" | "demolition";

export type Category = {
  key: CategoryKey;
  /** Label used in nav, A–Z headings and breadcrumbs. */
  label: string;
  slug: string;
  template: TemplateKind;
  /** Category landing page (hub filtered to this category). */
  h1: string;
  lead: string;
  /** Audience card on the services hub. */
  card: { title: string; text: string; icon: IconName; image: ImageKey };
};

export const CATEGORIES: Record<CategoryKey, Category> = {
  residential: {
    key: "residential",
    label: "Residential",
    slug: "residential-junk-removal-services",
    template: "item",
    h1: "Residential junk removal",
    lead: "Single items to full rooms. Furniture, appliances, mattresses, hot tubs and household junk, taken from anywhere in your home.",
    card: { title: "Homeowners & renters", text: "Single items to full rooms", icon: "home", image: "couch" },
  },
  commercial: {
    key: "commercial",
    label: "Commercial",
    slug: "commercial-junk-removal-services",
    template: "commercial",
    h1: "Commercial junk removal",
    lead: "Offices, warehouses, retail and property portfolios. Scheduled around your business hours.",
    card: { title: "Businesses, contractors & property managers", text: "Offices, reno debris, warehouses, units", icon: "building", image: "business" },
  },
  cleanouts: {
    key: "cleanouts",
    label: "Cleanouts",
    slug: "junk-cleanout-services",
    template: "cleanout",
    h1: "Junk cleanouts",
    lead: "Estates, houses, basements, garages and storage units, cleared and left broom-clean.",
    card: { title: "Families & executors", text: "Estate, house and hoarding cleanouts", icon: "heart", image: "estate" },
  },
  demolition: {
    key: "demolition",
    label: "Demolition",
    slug: "junk-demolition-services",
    template: "demolition",
    h1: "Junk demolition",
    lead: "Decks, sheds, fences, hot tubs and playsets, torn down and hauled away the same day.",
    card: { title: "Demolition", text: "Decks, sheds, fences, hot tubs", icon: "hammer", image: "deckAfter" },
  },
};

export const CATEGORY_ORDER: CategoryKey[] = ["residential", "commercial", "cleanouts", "demolition"];

export type Service = {
  /** Text shown in the A–Z list. */
  label: string;
  slug: string;
  /** Page name, used in the H1, breadcrumbs and template copy. */
  name: string;
  category: CategoryKey;
};

type Row = [label: string, slug: string, name: string];

const RESIDENTIAL: Row[] = [
  ["Appliances", "appliance-removal-services", "Appliance removal"],
  ["Bed bug furniture", "bed-bug-furniture-removal-services", "Bed bug furniture removal"],
  ["Box springs", "box-spring-removal-services", "Box spring removal"],
  ["Brush & branches", "brush-removal-services", "Brush and branch removal"],
  ["Cardboard", "cardboard-removal-services", "Cardboard removal"],
  ["Carpet", "carpet-removal-services", "Carpet removal"],
  ["Clutter", "clutter-removal-services", "Clutter removal"],
  ["Couches", "couch-removal-services", "Couch removal"],
  ["Desks", "desk-removal-services", "Desk removal"],
  ["Dirt & soil", "dirt-removal-services", "Dirt and soil removal"],
  ["Dishwashers", "dishwasher-removal-services", "Dishwasher removal"],
  ["Dressers", "dresser-removal-services", "Dresser removal"],
  ["E-waste", "e-waste-removal-services", "E-waste removal"],
  ["Exercise equipment", "exercise-equipment-removal-services", "Exercise equipment removal"],
  ["Filing cabinets", "filing-cabinet-removal-services", "Filing cabinet removal"],
  ["Freezers", "freezer-removal-services", "Freezer removal"],
  ["Furniture", "furniture-removal-services", "Furniture removal"],
  ["Hot tubs", "hot-tub-removal-services", "Hot tub removal"],
  ["Hutches", "hutch-removal-services", "Hutch removal"],
  ["Jacuzzis", "jacuzzi-removal-services", "Jacuzzi removal"],
  ["Mattresses", "mattress-removal-services", "Mattress removal"],
  ["Microwaves", "microwave-removal-services", "Microwave removal"],
  ["Paper", "paper-removal-services", "Paper removal"],
  ["Patio furniture", "patio-furniture-removal-services", "Patio furniture removal"],
  ["Pianos", "piano-removal-services", "Piano removal"],
  ["Pool tables", "pool-table-removal-services", "Pool table removal"],
  ["Scrap metal", "scrap-metal-removal-services", "Scrap metal removal"],
  ["Sofas", "sofa-removal-services", "Sofa removal"],
  ["Stoves", "stove-removal-services", "Stove removal"],
  ["Tires", "tire-removal-services", "Tire removal"],
  ["Treadmills", "treadmill-removal-services", "Treadmill removal"],
  ["TVs", "tv-removal-services", "TV removal"],
  ["Wall units", "wall-unit-removal-services", "Wall unit removal"],
  ["Washers & dryers", "washer-dryer-removal-services", "Washer and dryer removal"],
  ["Water tanks", "water-tank-removal-services", "Water tank removal"],
];

const COMMERCIAL: Row[] = [
  ["Business cleanouts", "business-cleanout-services", "Office cleanouts"],
  ["Computers", "computer-removal-services", "Computer removal"],
  ["Electronics", "electronics-removal-services", "Electronics removal"],
  ["Monitors", "monitor-removal-services", "Monitor removal"],
  ["Office cubicles", "office-cubicle-removal-services", "Office cubicle removal"],
  ["Office furniture", "office-furniture-removal-services", "Office furniture removal"],
  ["Pallets", "pallet-removal-services", "Pallet removal"],
  ["Property management", "property-management-junk-removal-services", "Property management junk removal"],
  ["Retail cleanouts", "retail-cleanout-services", "Retail cleanouts"],
  ["Safes", "safe-removal-services", "Safe removal"],
  ["Shelving & storage", "shelving-removal-services", "Shelving and storage removal"],
  ["Warehouse cleanouts", "warehouse-cleanout-services", "Warehouse cleanouts"],
];

const CLEANOUTS: Row[] = [
  ["Apartment", "apartment-cleanouts-services", "Apartment cleanouts"],
  ["Basement", "basement-cleanouts-services", "Basement cleanouts"],
  ["Estate", "estate-cleanout-services", "Estate cleanouts"],
  ["Eviction", "eviction-cleanouts-services", "Eviction cleanouts"],
  ["Garage", "garage-cleanouts-services", "Garage cleanouts"],
  ["Hoarding", "hoarding-cleanouts-services", "Hoarding cleanouts"],
  ["House", "house-cleanouts-services", "House cleanouts"],
  ["Office", "office-cleanouts-services", "Office cleanouts"],
  ["Storage unit", "storage-unit-cleanouts-services", "Storage unit cleanouts"],
];

const DEMOLITION: Row[] = [
  ["Above-ground pools", "above-ground-pool-demolition-services", "Above-ground pool removal"],
  ["Concrete", "concrete-demolition-services", "Concrete removal"],
  ["Decks", "deck-demolition-services", "Deck removal"],
  ["Fences", "fence-demolition-services", "Fence removal"],
  ["Garages", "garage-demolition-services", "Garage demolition"],
  ["Gazebos", "gazebo-demolition-services", "Gazebo removal"],
  ["Hot tubs", "hot-tub-demolition-services", "Hot tub demolition"],
  ["Jacuzzis", "jacuzzi-demolition-services", "Jacuzzi demolition"],
  ["Playsets", "playset-demolition-services", "Playset removal"],
  ["Sheds", "shed-demolition-services", "Shed demolition"],
  ["Swing sets", "swing-set-demolition-services", "Swing set removal"],
  ["Trampolines", "trampoline-demolition-services", "Trampoline removal"],
  ["Walls", "wall-demolition-services", "Wall demolition"],
];

const build = (category: CategoryKey, rows: Row[]): Service[] =>
  rows.map(([label, slug, name]) => ({ label, slug, name, category }));

export const SERVICES: Service[] = [
  ...build("residential", RESIDENTIAL),
  ...build("commercial", COMMERCIAL),
  ...build("cleanouts", CLEANOUTS),
  ...build("demolition", DEMOLITION),
];

/** The 4 service pages with full designed content (all others are template previews). */
export const DESIGNED_SERVICES = {
  couch: "couch-removal-services",
  estate: "estate-cleanout-services",
  office: "business-cleanout-services",
  deck: "deck-demolition-services",
} as const;

export const isDesignedService = (slug: string) =>
  (Object.values(DESIGNED_SERVICES) as string[]).includes(slug);

export const servicesIn = (category: CategoryKey) => SERVICES.filter((s) => s.category === category);
