/**
 * Enquiry context from the page URL (audit G05, OBS-18, OBS-95, OBS-121, OBS-152, OBS-153):
 * every quote form defaults to the page's own service category, names the exact
 * service and town, and shows a details prompt that fits the job. Safe in the browser.
 */
import siteJson from "@content/site.json";

export const SERVICE_CATEGORIES = ["Residential junk removal", "Commercial junk removal", "Cleanouts", "Demolition", "Not sure"] as const;
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export type LeadContext = {
  /** Form service category (one of SERVICE_CATEGORIES). */
  service: ServiceCategory;
  /** The specific service, e.g. "Deck demolition", "Apartment cleanout". */
  serviceDetail: string;
  /** Town name for location pages, "" otherwise. */
  city: string;
  /** Placeholder for the "What needs to go?" field. */
  prompt: string;
};

/** sessionStorage key the pricing truck writes and quote forms read (sent as pricing_selection). */
export const PRICING_SELECTION_KEY = "ljf_pricing_selection";

const towns = (siteJson as { towns: { slug: string; name: string }[] }).towns;
const COMMERCIAL = /commercial|office|business|retail|warehouse|computer|monitor|electronics-removal|restaurant|property-management|industrial|cubicle/;
const CLEANOUT = /cleanout|clean-out|clear-?out|hoarding|estate|eviction|downsizing|bereavement|foreclosure|attic|storage-unit/;
const DEMOLITION = /demolition|deck|shed|fence|gazebo|concrete|playset|swing-set|pool|garage-demolition/;

const PROMPTS: [RegExp, string][] = [
  [/deck/, "e.g. 12 x 16 ft wooden deck, ground level, side gate access"],
  [/shed/, "e.g. 8 x 10 ft wooden shed on a gravel pad, backyard access"],
  [/fence/, "e.g. about 60 ft of wood fence, posts set in concrete"],
  [/concrete/, "e.g. 10 x 12 ft concrete patio, already broken up or not, driveway access"],
  [/hot-tub/, "e.g. 6-person hot tub on the deck, side gate about 36 in wide, power already disconnected"],
  [/piano/, "e.g. upright piano, main floor, 3 front steps"],
  [/water-tank/, "e.g. 40-gallon water heater in the basement, already drained and disconnected"],
  [/bed-bug/, "e.g. queen mattress and a couch, 2nd floor, no elevator"],
  [/office|business|cubicle/, "e.g. 20 desks and chairs, 3rd floor, freight elevator, after-hours preferred"],
  [/warehouse/, "e.g. 30 pallets of old stock and some racking, loading dock available"],
  [/retail|restaurant/, "e.g. display shelving and old stock from a 1,500 sq ft unit, rear door access"],
  [/computer|monitor|electronics|e-waste/, "e.g. 15 desktop computers and monitors, data already wiped, ground floor"],
  [/storage-unit/, "e.g. 10 x 10 storage unit, about half full, facility access hours"],
  [/apartment|condo/, "e.g. 1-bedroom condo, 12th floor, elevator booked, items to keep are marked"],
  [/estate|house|downsizing|bereavement|senior/, "e.g. 3-bedroom house, items to keep are set aside, driveway parking"],
  [/hoarding/, "e.g. 2 rooms and a garage, mostly bags and boxes; tell us anything we should know"],
  [/basement/, "e.g. basement storage: boxes, an old couch and a treadmill, side entrance"],
  [/garage/, "e.g. half a garage of boxes, a lawn mower and an old fridge"],
  [/eviction|rental|foreclosure|property-management/, "e.g. vacant 2-bedroom unit, everything left behind needs to go"],
  [/carpet/, "e.g. carpet from 2 bedrooms and the stairs, already pulled up"],
  [/appliance|fridge|freezer|washer|dryer|stove|dishwasher|microwave/, "e.g. old fridge and stove, main floor, already unplugged"],
  [/mattress/, "e.g. queen mattress and box spring, 2nd floor"],
];
const DEFAULT_PROMPT = "e.g. couch and mattress, 3rd floor, elevator available";

const title = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Context for the page at `path` (e.g. "/locations/aurora/apartment-cleanout-services-in-aurora/"). */
export function leadContext(path: string): LeadContext {
  const segs = path.split("/").filter(Boolean);
  const last = segs[segs.length - 1] ?? "";
  // Town: /locations/<town>/… or …-in-<town>
  let city = "";
  if (segs[0] === "locations") {
    const t = towns.find((x) => x.slug === segs[1]) ?? towns.find((x) => last.endsWith(`-in-${x.slug}`) || last.endsWith(`-${x.slug}`));
    city = t?.name ?? "";
  }
  const slug = segs[0] === "services" ? path : last;
  const service: ServiceCategory =
    /commercial-junk-removal-services/.test(path) || COMMERCIAL.test(last)
      ? "Commercial junk removal"
      : /junk-demolition-services/.test(path) || DEMOLITION.test(last)
        ? "Demolition"
        : /junk-cleanout-services/.test(path) || CLEANOUT.test(last)
          ? "Cleanouts"
          : "Residential junk removal";
  const townSlug = towns.find((t) => t.name === city)?.slug;
  let detail = last
    .replace(townSlug ? new RegExp(`-?(in-)?${townSlug}$`) : /$^/, "")
    .replace(/-(services?|in-gta|near-me|toronto|gta)$/g, "")
    .replace(/-services?(?=-|$)/g, "")
    .replace(/-/g, " ")
    .replace(/\bcleanouts\b/, "cleanout")
    .trim();
  if (!detail || segs.length <= 1 || /^(locations|services)$/.test(detail) || towns.some((t) => t.slug.replace(/-/g, " ") === detail)) detail = "";
  const prompt = PROMPTS.find(([re]) => re.test(slug))?.[1] ?? DEFAULT_PROMPT;
  return { service, serviceDetail: detail ? title(detail) : "", city, prompt };
}
