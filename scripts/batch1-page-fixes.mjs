/**
 * Batch 1 page-level fixes (pages B1-01 … B1-50 in docs/client/batch-1/).
 * Run after scripts/content-rules.mjs (site-wide rules). Idempotent: every
 * operation searches for the old wording, so a second run changes nothing.
 *
 *   node scripts/batch1-page-fixes.mjs        apply + print what changed per OBS row
 *
 * Wording waiting on Nav uses {{fact:…}} tokens (content/business-facts.json).
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const SENT = /(?<=[.!?])\s+(?=[A-Z0-9"“‘(])/;
const log = [];
const SKIP = new Set(["src", "href", "path", "canonical", "ogImage", "id", "t", "kind", "type", "template"]);

// ---------------------------------------------------------------- operations
const isLink = (o) => o && typeof o === "object" && typeof o.a === "string" && Array.isArray(o.c);
const text = (v) => JSON.stringify(v);

function mapStrings(node, fn, key = "") {
  if (typeof node === "string") return SKIP.has(key) ? node : fn(node, key);
  if (Array.isArray(node)) return node.map((x) => mapStrings(x, fn, key));
  if (node && typeof node === "object") {
    const o = {};
    for (const [k, v] of Object.entries(node)) o[k] = (k === "a" && typeof v === "string") || SKIP.has(k) ? v : mapStrings(v, fn, k);
    return o;
  }
  return node;
}
/** Replace wording in every visible string (and seo title/description). */
const rep = (find, to) => (doc) => mapStrings(doc, (s) => (typeof find === "string" ? s.split(find).join(to) : s.replace(find, to)));
/** Remove sentences that match from longer text. */
const dropSent = (re) => (doc) =>
  mapStrings(doc, (s) => {
    if (!re.test(s)) return s;
    const parts = s.split(SENT);
    if (parts.length < 2) return s; // single sentences are handled by dropItem / rep
    return parts.filter((p) => !re.test(p)).join(" ");
  });
/** Remove list / card / step items (any array element) whose content matches. */
function dropItem(re) {
  const walk = (node) => {
    // Only list/card/step items: never a page section ({ blocks: [...] }) or a block ({ t: … }). An earlier
    // version also matched whole sections, which emptied pages such as Water Tank (QA new defect B1-33).
    if (Array.isArray(node)) return node.filter((x) => !(x && typeof x === "object" && !("t" in x) && !("blocks" in x) && re.test(text(x)))).map(walk);
    if (node && typeof node === "object") {
      const o = {};
      for (const [k, v] of Object.entries(node)) o[k] = k === "items" && Array.isArray(v) ? v.filter((x) => !re.test(text(x))).map(walk) : walk(v);
      return o;
    }
    return node;
  };
  return walk;
}
/** Remove FAQ questions matching. */
const dropFaq = (re) => (doc) => {
  for (const s of doc.sections) for (const b of s.blocks ?? []) if (b.t === "faq") b.items = b.items.filter((f) => !re.test(f.q));
  return doc;
};
/** Set the answer of FAQ questions matching. */
const faqAnswer = (re, answer) => (doc) => {
  for (const s of doc.sections) for (const b of s.blocks ?? []) if (b.t === "faq") for (const f of b.items) if (re.test(f.q)) f.a = [[answer]];
  return doc;
};
/** Remove whole sections whose heading / eyebrow matches. */
const dropSection = (re) => (doc) => {
  doc.sections = doc.sections.filter((s) => !(s.blocks ?? []).some((b) => (b.t === "h" || b.t === "eyebrow") && re.test(b.text ?? "")));
  return doc;
};
/** Replace a link node whose label matches with its plain label. */
function unlink(re) {
  const walk = (node) => {
    if (Array.isArray(node)) return node.flatMap((x) => (isLink(x) && re.test(text(x.c)) ? x.c : [walk(x)]));
    if (node && typeof node === "object") { const o = {}; for (const [k, v] of Object.entries(node)) o[k] = walk(v); return o; }
    return node;
  };
  return walk;
}
/** Set card text by card title. */
const cardText = (titleRe, title, body) => (doc) => {
  for (const s of doc.sections) for (const b of s.blocks ?? []) if (b.t === "cards") for (const c of b.items) if (titleRe.test(c.title ?? "")) { c.title = title; c.text = [body]; }
  return doc;
};
/**
 * Drop the long generic "Read What People Ask About …" accordion (one item holding dozens of
 * third-party legal / biohazard / general Q&As) where the page already has its own FAQ
 * (OBS-23, 29, 44, 50, 83; G12). The page keeps one service-specific FAQ.
 */
const dropMegaFaq = (doc) => {
  const mega = (b) => b.t === "faq" && b.items.length === 1 && /^Read What People Ask/i.test(b.items[0].q);
  const hasOwn = doc.sections.some((s) => (s.blocks ?? []).some((b) => b.t === "faq" && !mega(b) && b.items.length >= 3));
  if (hasOwn) doc.sections = doc.sections.filter((s) => !(s.blocks ?? []).some(mega));
  return doc;
};
const seo = (field, value) => (doc) => ((doc.seo[field] = value), doc);
const h1 = (value) => (doc) => ((doc.h1 = value), doc);

// ---------------------------------------------------------------- page directions
const S = "services";
const P = (p) => join(ROOT, "content/pages", p + ".json");
const PAGES = [
  ["B1-03", `${S}/residential-junk-removal-services`, [
    ["OBS G02", rep(/Everything Except Hazardous/g, "Most Household Items")],
    ["OBS G02", dropSent(/nothing gets wasted|stain[- ]free/i)],
    ["OBS G02", rep(/\bnothing gets wasted\b/gi, "we recycle and donate where possible")],
  ]],
  ["B1-04", `${S}/commercial-junk-removal-services`, [
    ["B1-04", dropItem(/free pallet removal/i)],
    ["B1-04", dropSent(/free (pallet|furniture) (removal|pickup)/i)],
    ["B1-04", rep("Set Up a Time For Your Residential Junk Removal Project Right Now!", "Set Up a Time for Your Commercial Junk Removal Project")],
  ]],
  ["B1-05", `${S}/junk-demolition-services`, [
    ["B1-05", dropSent(/basement dig-?out|architectural demolition|exact arrival/i)],
    ["B1-05", dropItem(/basement dig-?out|architectural demolition/i)],
    ["B1-05", rep(/Total Cleanup Guarantee/g, "Debris Hauled Away")],
  ]],
  ["B1-06", `${S}/junk-cleanout-services`, [
    ["B1-06", dropItem(/pallet/i)],
    ["B1-06", dropSent(/pallet|free (commercial )?removal/i)],
    ["B1-06", dropSent(/company to clean out houses after death/i)],
  ]],
  ["B1-11", "blog", [
    ["B1-11", seo("description", "Practical guides on junk removal, cleanouts, decluttering and disposal in Toronto and the GTA, written by the Live Junk Free crew.")],
  ]],
  ["B1-13", "bed-bug-furniture-removal", [
    ["OBS-14", dropSent(/every item is bagged and contained|toronto guideline|licensed disposal|no waiting|no delays|before noon/i)],
    ["OBS-14", rep(/Every item is bagged and contained[^.]*\./gi, "{{fact:bedBugScope}}")],
    ["OBS-13", rep(/\s*Book before noon[^.]*\./gi, "")],
  ]],
  ["B1-15", `${S}/junk-cleanout-services/hoarding-cleanouts-services`, [
    ["OBS-21", dropSent(/deep[- ]clean|completely protected|safe(,| and) (livable|liveable)|safe and healthy/i)],
    ["OBS-21", rep(/\s*[–-]\s*Every hoarding junk removal is done safely and responsibly\. With full insurance, you’re completely protected\./g, "– {{fact:licensedInsured}}.")],
    ["OBS-23", dropFaq(/biohazard|mental|legal|law\b|laws|court|attorney|guardian|lawyer|landlord.*(evict|tenant)|tenant.*right|sewage|bodily|remediation|disorder|therap|psycholog|insurance cover|social worker|adult protective/i)],
  ]],
  ["B1-16", `${S}/junk-cleanout-services/house-cleanouts-services`, [
    ["OBS-24", rep("Full-Service Hoarding Cleanouts Include:", "Full-Service House Cleanouts Include:")],
    ["OBS-24", rep(/Hoarding junk removal of /g, "Removal of ")],
    ["OBS-24", rep(/We Offer (Same-Day )?Hoarding Cleanout services\.?/g, "We Offer Whole-House Cleanouts")],
    ["OBS-24", rep(/Hoarding situations can feel overwhelming, but you don’t have to handle them alone\. Our hoarding cleanout services are designed to/g, "A whole-house cleanout can feel overwhelming, but you don’t have to handle it alone. Our house cleanout services are designed to")],
    ["OBS-24", rep(/our hoarding cleanout companies ensure the space is left broom clean, safe, and ready for a fresh start\.?/gi, "we clear every room you point out and tidy the work area as we go.")],
    ["OBS-24", rep(/\bhoarding cleanouts?\b/gi, (m) => (m[0] === "H" ? "House cleanout" : "house cleanout") + (/s$/.test(m) ? "s" : ""))],
    ["OBS-24", rep(/\bhoarding\b/gi, "household")],
  ]],
  ["B1-17", `${S}/junk-cleanout-services/apartment-cleanouts-services`, [
    ["OBS-28", rep("Full-Service Apartment Cleanouts – One Crew, One Visit, Empty Unit", "Full-Service Apartment Cleanouts – One Crew, Planned Around Your Building")],
    ["OBS-28", rep("We book elevators, follow condo rules, and protect every hallway we pass through", "We follow condo rules and protect the hallways we pass through. {{fact:accessCoordination}}")],
    ["OBS-27", dropSent(/donation receipts?|multi-unit (savings|discount)|whole-job (savings|discount)/i)],
  ]],
  ["B1-18", `${S}/junk-cleanout-services/basement-cleanout-services`, [
    ["OBS-31", dropSent(/paint cans?|mou?ld|flood/i)],
    ["OBS-31", rep(/,?\s*paint cans?,?/gi, ",")],
    ["OBS-32", dropSent(/pair[- ]and[- ]save|guaranteed protective/i)],
    ["OBS-32", rep(/Gone Before Dinner/gi, "Scheduled Around Your Day")],
  ]],
  ["B1-19", `${S}/junk-cleanout-services/eviction-cleanout-services`, [
    ["OBS-34", rep("We follow all legal rules and protect you from risks. You can trust us for safe, professional service.", "{{fact:eviction}}")],
    ["OBS-34", rep("We know eviction laws in your area. This helps us work fast and avoid delays.", "Tell us your deadline when you book and we'll plan the clear-out around it.")],
    ["OBS-34", rep("We clear out everything left behind:", "Once the owner or manager confirms lawful possession, we can remove what was left behind:")],
    ["OBS-35", dropFaq(/state law|statute|legal(ly)?|court|sheriff|abandoned property law|notice period|how long (must|do) (i|landlords)/i)],
  ]],
  ["B1-20", `${S}/junk-cleanout-services/garage-cleanout-services`, [
    ["OBS-38", rep("Insured, uniformed crews experienced in condo & apartment buildings", "Insured, uniformed crews for garages of every size")],
    ["OBS-38", rep("Garage Cleanout Services in Whitby from Live Junk Free", "Garage Cleanout Services from Live Junk Free")],
    ["OBS-37", rep("Absolutely. We offer volume discounts for multi-unit properties and apartment buildings.", "Yes. Tell us how many garages or units and we'll quote the whole job at the free onsite estimate.")],
  ]],
  ["B1-21", `${S}/junk-cleanout-services/office-cleanout-services`, [
    ["OBS-39", rep("From a single suite to an entire floor — cleared without disrupting business.", "From a single suite to an entire floor, planned around your business hours.")],
    ["OBS-40", dropItem(/COIs on file|Preferred rates for facility managers/i)],
    ["OBS-40", dropFaq(/Certificate of Insurance|\bCOI\b/i)],
    ["OBS-41", dropSection(/^Areas We Serve$/)],
  ]],
  ["B1-22", `${S}/junk-cleanout-services/storage-unit-cleanouts-services`, [
    ["OBS-42", rep(/\s*\(or handle it entirely without you[^)]*\)/gi, "")],
    ["OBS-42", rep(/,?\s*delivery of keep-items available,?/gi, ",")],
    ["OBS-42", dropSent(/photograph|deliver (your )?(kept|keep)|remote(ly)?/i)],
    ["OBS-43", dropSent(/billing stops|cheaper than (another month|rent)|another rent payment|month-end/i)],
  ]],
  ["B1-24", `${S}/residential-junk-removal-services/mattress-removal-services`, [
    ["OBS-49", rep("Sealed encasement bags and careful routing protect the rest of your home", "Bed bug mattresses are wrapped before they leave the room")],
    ["OBS-49", rep(/, with sealed-bag protocols for bed bug cases/gi, "; bed bug mattresses are wrapped before they leave the room")],
    ["OBS-49", rep(/Recycling-first handling – Springs, foam, fibre, and frame metals diverted to recyclers/g, "Recycling where possible – springs, foam and frame metal go to recycling when the material allows")],
    ["OBS-49", dropItem(/Sanitary-Case Handling/i)],
    ["OBS-51", dropSent(/20[- ]minute|delivery[- ]day|new mattress (delivery|arrives)|multi-bed rate/i)],
    ["OBS-52", seo("description", "Mattress and box spring pickup across Toronto and the GTA. We carry it out from any room; same-day pickup may be available. Call +1 647 922 5865 for a free quote.")],
  ]],
  ["B1-25", `${S}/residential-junk-removal-services/furniture-removal-services`, [
    ["OBS-55", unlink(/same-day removal/i)],
    ["OBS-53", rep(/^Instant booking$/g, "Easy booking")],
    ["OBS-54", rep(/,? or heavily infested items\./g, ". For bed bug–infested furniture, see our bed bug furniture removal service.")],
  ]],
  ["B1-26", `${S}/residential-junk-removal-services/hot-tub-removal-services`, [
    ["OBS-60", h1("Hot Tub Removal in Toronto & the GTA")], // QA 18 Nov wording
    ["OBS-60", rep("Locally Trusted – The Best Hot Tub Removal in Town is Here!", "Hot Tub Removal in Toronto & the GTA")],
    ["OBS-58", rep("At Live Junk Free, we specialize in removing all types of appliances:", "We remove most kinds of hot tubs and spas, including:")],
    ["OBS-58", rep("Hot Tubs (All types, sizes & conditions)", "Hot tubs of most sizes and conditions")],
    ["OBS-59", dropItem(/Hot Tub Patios & Deck Installations/)],
  ]],
  ["B1-28", `${S}/residential-junk-removal-services/bed-bug-furniture-removal-services`, [
    ["OBS-65", dropSent(/eliminate bed bug|pest[- ]free|100\s*%|zero[- ]risk|sanitiz|sanitis|destroy(ed)?\b|destruction/i)],
    ["OBS-65", rep("Post-removal area cleanup for a pest-free space", "Cleanup of the work area after removal")],
    ["OBS-66", rep(/ with no emergency fees/g, "")],
    ["OBS-67", faqAnswer(/treat|pest|exterminat/i, "{{fact:bedBugScope}} {{fact:pestProfessional}}")],
  ]],
  ["B1-29", `${S}/residential-junk-removal-services/piano-removal-services`, [
    ["OBS-71", dropItem(/ivory|Less than 5%/i)],
    ["OBS-71", dropSent(/less than 5|ivory|donated to (local )?schools/i)],
    ["OBS-70", dropSent(/best price|damage-free|under (an|one) hour/i)],
  ]],
  ["B1-30", `${S}/residential-junk-removal-services/e-waste-removal-services`, [
    ["OBS-76", rep("removes & recycles e-waste removal services across the GTA", "removes and recycles old TVs, computers and electronics across the GTA")],
    ["OBS-73", dropSent(/data (wiping|destruction|sanitiz|security guarantee)|certified technicians|complete (regulatory )?compliance/i)],
    ["OBS-73", faqAnswer(/data|wipe|hard drive|secure/i, "{{fact:dataSecurity}}")],
    ["OBS-74", dropItem(/servers?\b|battery removal|disconnect/i)],
  ]],
  ["B1-31", `${S}/residential-junk-removal-services/carpet-removal-services`, [
    ["OBS-77", dropSent(/tack strips?|staples?|glued|installer|subfloor/i)],
    ["OBS-77", dropItem(/tack strip|staple|glued|subfloor|installer/i)],
    ["OBS-79", dropSent(/no add-ons|weekend fee|every quote is on-site/i)],
  ]],
  ["B1-32", `${S}/residential-junk-removal-services/garage-junk-removal-services`, [
    ["OBS-81", faqAnswer(/scrap metal and old tools/i, "Scrap metal and old tools are set aside for metal recycling where possible, and usable tools can go to donation. Everything else is disposed of responsibly.")],
    ["OBS-83", faqAnswer(/curb|driveway/i, "Yes: {{fact:curbsideDiscount}}. Ask when you book.")],
    ["OBS-84", dropItem(/Floor-to-rafters clearing/i)],
    ["OBS-85", rep(/Photo Quotes in Minutes – Snap the mess as-is and get a firm number[^"]*/g, "Free onsite estimates – A firm price before any work starts")],
  ]],
  ["B1-33", `${S}/residential-junk-removal-services/water-tank-removal-services`, [
    ["OBS-86", dropItem(/industrial|pump|licens|plumbing|electrical/i)],
    ["OBS-86", dropSent(/all tank types|industrial|pump(ing)? out|licens|plumbing|electrical disconnect|disconnect(ing)? (the )?(gas|water|power)/i)],
    ["OBS-86", rep("Safe extraction of all tank types (above-ground, industrial, residential)", "Removal of residential water heaters and tanks")],
    ["OBS-86", faqAnswer(/disconnect|drain/i, "{{fact:utilityDisconnection}}")],
  ]],
  ["B1-34", `${S}/commercial-junk-removal-services/office-furniture-removal-services`, [
    ["OBS-90", dropSent(/wiped|certified facilit/i)],
    ["OBS-90", dropItem(/Office electronics were responsibly wiped/i)],
    ["OBS-91", rep(/,? and we'll respond within 30 minutes with a solution\./g, " and we'll get back to you with a quote.")],
    ["OBS-90", rep("Yes, our team professionally disassembles all modular furniture systems and large office items before removal.", "In most cases, yes. Tell us about any modular or wired systems when you call and we'll confirm what's involved at the estimate.")],
  ]],
  ["B1-36", `${S}/commercial-junk-removal-services/warehouse-cleanout-services`, [
    ["OBS-100", rep(/our warehouse cleanout team handles everything, lifting/g, "our warehouse cleanout team handles the lifting")],
    ["OBS-100", rep(/our team removes everything, shelving/g, "our team removes shelving")],
    ["OBS-100", rep(/We remove everything: /g, "We remove items such as ")],
    ["OBS-100", rep(/We remove almost everything: /g, "We remove items such as ")],
    ["OBS-100", dropSent(/heavy machinery|any size facility|facilities of any size/i)],
  ]],
  ["B1-37", `${S}/commercial-junk-removal-services/retail-cleanout-services`, [
    ["OBS-104", dropSection(/Before & After Retail Cleanout Gallery/)],
    ["OBS-106", rep(/, with volume discounts for multiple locations/g, "")],
    ["OBS-105", dropSent(/one visit|thorough final clean/i)],
  ]],
  ["B1-38", `${S}/commercial-junk-removal-services/computer-removal-services`, [
    ["OBS-110", cardText(/^Easy Booking by Phone or Online$/, "Multi-Device Pickups", "– Clearing out an entire office or many devices? Tell us the quantities and we'll quote the whole job at the free onsite estimate.")],
    ["OBS-110", cardText(/^Rapid Service$/, "Easy Booking", "– Book by phone or online. We confirm your pickup time when you book.")],
    ["OBS-109", rep(/ with no premium pricing/g, "")],
    ["OBS-108", cardText(/^\{\{fact:recycling\}\}$/, "{{fact:recycling}}", "– Working equipment goes to reuse where possible; the rest goes to electronics recycling. {{fact:dataSecurity}}")],
  ]],
  ["B1-39", `${S}/junk-demolition-services/shed-demolition-services`, [
    ["OBS-113", rep(/^-Our Simple/g, "Our Simple")],
    ["OBS-115", dropItem(/All-Weather Work/)],
    ["OBS-115", dropSent(/\$200|\$500|all-weather/i)],
    ["OBS-114", dropSent(/foundation extraction/i)],
  ]],
  ["B1-40", `${S}/junk-demolition-services/garage-demolition-services`, [
    ["OBS-117", dropItem(/foundations?|slabs?|grading|All-Weather/i)],
    ["OBS-117", dropSent(/attached structure|foundation|slab|grading|construction-ready|crushed for reuse/i)],
    ["OBS-118", faqAnswer(/permit/i, "{{fact:permits}}")],
  ]],
  ["B1-42", `${S}/junk-demolition-services/concrete-demolition-services`, [
    ["OBS-125", dropItem(/block wall|footing|foundation|chemical|excavator|robotic/i)],
    ["OBS-125", dropSent(/block wall|footing|foundation|chemical|excavator|precision saw|reinforced|ready for new construction/i)],
    ["OBS-128", dropItem(/price-match/i)],
    ["OBS-126", faqAnswer(/permit/i, "{{fact:permits}}")],
    ["OBS-129", dropFaq(/robotic|DIY|rent (a|an)|jackhammer yourself|do it yourself/i)],
  ]],
  ["B1-45", "locations/markham", [
    ["OBS-138", rep("We're significantly cheaper than Markham's franchise competitors", "{{fact:competitorComparison}}")],
  ]],
  ["B1-46", "locations/vaughan", [
    ["OBS-142", dropItem(/Barn and outbuilding demolition/i)],
  ]],
  ["B1-47", "locations/ajax", [
    ["OBS-144", rep(/Why so lazy to remove household junk or debris from the office and other relevant spaces\? Or are you unable to find a reliable pro[^.?]*[.?]/g, "Need household junk or office clutter gone in Ajax? Live Junk Free loads it, hauls it away and confirms your price at a free onsite estimate before any work starts.")],
    ["OBS-145", dropSent(/partition/i)],
    ["OBS-145", dropItem(/^\[\[?\{?"?a?"?:?"?[^"]*"?,?"?c?"?:?\["Wall Demolition"\]/)],
  ]],
  ["B1-48", "locations/brampton", [
    ["OBS-147", faqAnswer(/^01 - Commercial Removal/, "Offices, shops, warehouses and rental units across Brampton: we remove furniture, fixtures and clutter and quote the job at a free onsite estimate.")],
    ["OBS-147", faqAnswer(/^02 - Residential Removal/, "Furniture, appliances, mattresses and garage or basement junk from Brampton homes, carried out from any room and hauled away.")],
    ["OBS-147", faqAnswer(/^03 - Demolition/, "Sheds, decks, fences, playsets and hot tubs taken down and hauled away, with the scope agreed at the estimate.")],
    ["OBS-147", faqAnswer(/^04 - Cleanouts/, "Whole-house, estate, apartment, garage and basement cleanouts across Brampton. {{fact:retainedItems}}")],
    ["OBS-148", dropSent(/lease[- ]ready|ready for (the next|new) tenants?|certified/i)],
  ]],
  ["B1-49", "locations/aurora/apartment-cleanout-services-in-aurora", [
    ["OBS-150", faqAnswer(/valuable|keep|personal/i, "{{fact:retainedItems}}")],
    ["OBS-150", dropSent(/always set aside|same-day unit readiness/i)],
  ]],
  ["B1-50", "locations/toronto/office-cleanout-services-in-toronto", [
    ["OBS-154", rep(/Certificate of insurance naming the landlord and property manager, WSIB coverage, crew sign-in and common-area protection, filed a[^.]*\./g, "Crew sign-in and protection of common areas, following your building's rules.")],
    ["OBS-154", dropSent(/WSIB|certificate of insurance|asset inventor|certified/i)],
    ["OBS-155", dropSent(/same price|lease[- ]ready|overnight.*(same|no extra)/i)],
    ["OBS-156", dropSection(/^Demolitions We Do$/)],
  ]],
];

// Second pass: single-sentence strings and the generic mega-FAQs.
const MEGA = ["G12 / one FAQ", dropMegaFaq];
PAGES.push(
  ["B1-06", `${S}/junk-cleanout-services`, [
    ["B1-06", rep(/company to clean out houses after death, find our experts there to provide mental strength and clutter-free space\.?/g, "")],
    ["B1-06", rep(/company to clean out houses after death,/g, "estate cleanout,")],
  ]],
  ["B1-15", `${S}/junk-cleanout-services/hoarding-cleanouts-services`, [MEGA]],
  ["B1-16", `${S}/junk-cleanout-services/house-cleanouts-services`, [MEGA]],
  ["B1-17", `${S}/junk-cleanout-services/apartment-cleanouts-services`, [MEGA]],
  ["B1-18", `${S}/junk-cleanout-services/basement-cleanout-services`, [
    MEGA,
    ["OBS-32", dropItem(/Pair-and-Save/i)],
    ["OBS-31", dropItem(/Flood-Damaged & Mold-Affected/i)],
    ["OBS-31", rep(/ and post-flood chaos/g, "")],
    ["OBS-31", faqAnswer(/flood|musty|mou?ld/i, "Tell us about any water damage or damp items when you book. We'll confirm what we can take before the visit; heavily contaminated materials may need a remediation specialist first.")],
  ]],
  ["B1-19", `${S}/junk-cleanout-services/eviction-cleanout-services`, [MEGA]],
  ["B1-21", `${S}/junk-cleanout-services/office-cleanout-services`, [MEGA]],
  ["B1-22", `${S}/junk-cleanout-services/storage-unit-cleanouts-services`, [
    MEGA,
    ["OBS-43", rep("Month-End & Same-Week Unit Cleanouts Available!", "Unit Cleanouts Scheduled Around Your Move-Out Date")],
    ["OBS-43", rep("Cheaper Than Another Month's Rent", "Priced at Your Free Onsite Estimate")],
    ["OBS-42", rep("On-site with you, or fully remote with manager-coordinated access and photo proof", "On-site with you, or with access arranged through your facility manager")],
    ["OBS-42", dropItem(/Keep-Item Delivery|Keep-items are loaded separately/i)],
    ["OBS-42", rep(/Personal documents, photos, and valuables found during remote cleanouts are always set aside and returned, never discarded\./g, "{{fact:retainedItems}}")],
  ]],
  ["B1-24", `${S}/residential-junk-removal-services/mattress-removal-services`, [
    MEGA,
    ["OBS-49", faqAnswer(/bed ?bug/i, "Yes. Mention it when booking: we wrap the mattress before it leaves the room, then remove and dispose of it. {{fact:pestProfessional}}")],
  ]],
  ["B1-28", `${S}/residential-junk-removal-services/bed-bug-furniture-removal-services`, [
    ["OBS-65", dropItem(/100% containment|Zero risk disposal/i)],
    ["OBS-65", rep(/, and leaves your space sanitized/g, ", and tidies the work area")],
  ]],
  ["B1-32", `${S}/residential-junk-removal-services/garage-junk-removal-services`, [
    MEGA,
    ["OBS-83", rep(/^Some companies may offer different pricing depending on how accessible the items are[^]*$/g, "Yes: {{fact:curbsideDiscount}}. Ask when you book.")],
  ]],
  ["B1-40", `${S}/junk-demolition-services/garage-demolition-services`, [
    ["OBS-117", dropItem(/Attached Garages/i)],
    ["OBS-117", faqAnswer(/attached and detached/i, "Tell us whether the garage is attached or detached when you call. We'll look at the structure, utilities and access at the free onsite estimate and confirm what we can take on.")],
  ]],
  ["B1-47", "locations/ajax", [["OBS-145", dropItem(/Wall Demolition/)]]],
);

// ---------------------------------------------------------------- run
for (const [id, file, ops] of PAGES) {
  const f = P(file);
  if (!existsSync(f)) { log.push(`${id} MISSING ${file}`); continue; }
  const raw = readFileSync(f, "utf8");
  let doc = JSON.parse(raw);
  const changes = [];
  for (const [ref, op] of ops) {
    const before = text(doc);
    doc = op(doc) ?? doc;
    if (text(doc) !== before) changes.push(ref);
  }
  const out = JSON.stringify(doc, null, (raw.match(/^\{\n( +)/) || [, " "])[1].length) + (raw.endsWith("\n") ? "\n" : "");
  if (out !== raw) writeFileSync(f, out);
  log.push(`${id.padEnd(6)} ${changes.length ? "changed: " + [...new Set(changes)].join(", ") : "no change"}   ${file}`);
}
console.log(log.join("\n"));
