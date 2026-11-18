/**
 * Batch 1 fixes from the 18 Nov 2026 independent QA (docs/client/batch-1/LJF_First50_Independent_QA_2026-11-18.xlsx,
 * prompt v3 §3). Page-specific end states the site-wide rules (scripts/content-rules.mjs) can't express.
 *
 * Run order: content-rules → batch1-page-fixes → batch1-qa-fixes → content-rules. Idempotent: every op looks for
 * the old wording (or for its own marker) first, so a second run changes nothing.
 *
 *   node scripts/batch1-qa-fixes.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
// "a" is skipped only when it's a link target (a string); in FAQ items "a" is the answer and is edited.
const SKIP = new Set(["src", "href", "path", "canonical", "ogImage", "id", "t", "kind", "type", "template"]);
const log = [];

const mapStrings = (node, fn, key = "") => {
  if (typeof node === "string") return SKIP.has(key) ? node : fn(node, key);
  if (Array.isArray(node)) return node.map((x) => mapStrings(x, fn, key));
  if (node && typeof node === "object") { const o = {}; for (const [k, v] of Object.entries(node)) o[k] = k === "a" && typeof v === "string" ? v : mapStrings(v, fn, k); return o; }
  return node;
};
const blocks = (doc) => doc.sections.flatMap((s) => s.blocks ?? []);

// ---------------------------------------------------------------- operations
/** Replace text in every visible string (incl. title, h1, seo). */
const rep = (find, to) => (doc) => mapStrings(doc, (s) => (typeof find === "string" ? s.split(find).join(to) : s.replace(find, to)));
/** Set the H1 (doc.h1, the level-1 heading block and, optionally, the SEO title). */
const setH1 = (text, seoTitle) => (doc) => {
  doc.h1 = text;
  for (const b of blocks(doc)) if (b.t === "h" && b.l === 1) b.text = text;
  if (seoTitle) doc.seo.title = seoTitle;
  return doc;
};
const setSeo = (field, value) => (doc) => ((doc.seo[field] = value), doc);
/** Remove card / step / list items whose JSON matches. */
const dropItem = (re) => (doc) => {
  for (const b of blocks(doc)) if (Array.isArray(b.items) && b.t !== "faq") b.items = b.items.filter((x) => !re.test(JSON.stringify(x)));
  return doc;
};
/** Rename a card / step title and set its text. */
const card = (titleRe, title, text) => (doc) => {
  for (const b of blocks(doc)) if (Array.isArray(b.items)) for (const it of b.items) if (it && typeof it === "object" && typeof it.title === "string" && titleRe.test(it.title)) { it.title = title; if (text !== undefined) it.text = [text]; }
  return doc;
};
/** Rewrite FAQ questions (and optionally answers) whose question matches. */
const faq = (qRe, q, a) => (doc) => {
  for (const b of blocks(doc)) if (b.t === "faq") for (const f of b.items) if (qRe.test(f.q)) { if (q) f.q = q; if (a !== undefined) f.a = [[a]]; }
  return doc;
};
const dropFaq = (qRe) => (doc) => { for (const b of blocks(doc)) if (b.t === "faq") b.items = b.items.filter((f) => !qRe.test(f.q)); return doc; };
/** Keep only the first n FAQ items (OBS-129: merge a long FAQ into a short set). */
const trimFaq = (n) => (doc) => {
  let seen = 0;
  for (const s of doc.sections) for (const b of s.blocks ?? []) if (b.t === "faq") { b.items = b.items.slice(0, Math.max(0, n - seen)); seen += b.items.length; }
  for (const s of doc.sections) s.blocks = (s.blocks ?? []).filter((b) => !(b.t === "faq" && !b.items.length));
  return doc;
};
/** Add an FAQ item to the page's first FAQ (if the question isn't there yet). */
const addFaq = (q, a) => (doc) => {
  const f = blocks(doc).find((b) => b.t === "faq");
  if (f && !f.items.some((x) => x.q === q)) f.items.push({ q, a: [[a]] });
  return doc;
};
/** Replace a paragraph whose text matches with new inline content. */
const para = (re, c) => (doc) => {
  for (const b of blocks(doc)) if (b.t === "p" && re.test(JSON.stringify(b.c))) b.c = c;
  return doc;
};
/** Insert a paragraph right after the first heading matching, unless that text is already on the page. */
const insertAfterHeading = (hRe, c) => (doc) => {
  if (JSON.stringify(doc).includes(JSON.stringify(c).slice(1, 60))) return doc;
  for (const s of doc.sections) {
    const i = (s.blocks ?? []).findIndex((b) => b.t === "h" && hRe.test(b.text));
    if (i >= 0) { s.blocks.splice(i + 1, 0, { t: "p", c }); return doc; }
  }
  return doc;
};
/** Replace the blocks of the section whose first heading matches (idempotent: skips if already replaced). */
const sectionBlocks = (hRe, newBlocks) => (doc) => {
  const sec = doc.sections.find((x) => (x.blocks ?? []).some((b) => b.t === "h" && hRe.test(b.text)));
  if (sec && JSON.stringify(sec.blocks) !== JSON.stringify(newBlocks)) sec.blocks = newBlocks;
  return doc;
};
/** Set the alt text of images whose src matches. */
const alt = (srcRe, text) => (doc) => {
  const fix = (img) => { if (img && typeof img.src === "string" && srcRe.test(img.src)) img.alt = text; };
  for (const b of blocks(doc)) { if (b.image) fix(b.image); for (const im of b.images ?? []) fix(im); }
  return doc;
};

// ---------------------------------------------------------------- B1-33 Water Tank: full, safe service body (new defect)
const galleryHeadings = (doc) => {
  // the photo section keeps one heading (the old page had a section heading and a gallery heading)
  for (const sec of doc.sections) if ((sec.blocks ?? []).some((b) => b.t === "gallery")) {
    let seen = false;
    sec.blocks = sec.blocks.filter((b) => b.t !== "h" || (!seen && (seen = true)));
  }
  return doc;
};
const WATER_TANK = (doc) => {
  if (JSON.stringify(doc).includes("{{fact:waterTankPrep}}")) return galleryHeadings(doc); // already rewritten
  const hero = doc.sections[0];
  hero.blocks = [
    { t: "h", l: 1, text: "Water Tank Removal Services in Toronto & the GTA" },
    { t: "p", c: ["Residential water heater and hot water tank removal, quoted before we book."] },
    { t: "ctas", items: [{ label: "Request a water tank removal quote", href: "#quote-form" }] },
    { t: "cards", items: [{ title: "{{fact:licensedInsured}}" }, { title: "{{fact:freeOnsiteEstimates}}" }, { title: "{{fact:sameDay.short}}" }] },
  ];
  doc.h1 = "Water Tank Removal Services in Toronto & the GTA";
  const keep = (re) => doc.sections.find((s) => (s.blocks ?? []).some((b) => re(b)));
  const gallery = keep((b) => b.t === "gallery");
  const reviews = keep((b) => b.t === "reviews");
  const areas = doc.sections.find((s) => (s.blocks ?? []).some((b) => b.t === "h" && /Areas We Serve/i.test(b.text)));
  const photo = blocks(doc).find((b) => b.t === "img");
  const body = [
    { blocks: [
      { t: "h", l: 2, text: "Old water tank removal" },
      { t: "p", c: ["Live Junk Free removes old residential water heaters and hot water tanks from homes across Toronto and the GTA. Tell us the tank type and size, where it is (basement, garage or utility room) and the way out, and we'll give you a quote."] },
      { t: "p", c: ["{{fact:waterTankPrep}}. We confirm the preparation and access with you before the pickup is booked."] },
      { t: "ctas", items: [{ label: "Request a water tank removal quote", href: "#quote-form" }, { label: "Call +1 647 922 5865", href: "tel:+16479225865" }] },
      ...(photo ? [{ ...photo, image: { ...photo.image, alt: "Old water tank before removal" } }] : []),
    ] },
    { blocks: [
      { t: "h", l: 2, text: "What we remove" },
      { t: "ul", items: [["Residential hot water tanks and water heaters, drained and disconnected"], ["Small storage and pressure tanks from homes"], ["Tanks in basements, garages and utility rooms"]] },
      { t: "p", c: ["We don't remove industrial or commercial tanks, or tanks that still hold fuel or chemicals. {{fact:hazardous}}"] },
    ] },
    { blocks: [
      { t: "h", l: 2, text: "Before we arrive" },
      { t: "ul", items: [["{{fact:waterTankPrep}}."], ["Tell us about stairs, narrow doorways or tight corners on the way out."], ["Clear a path to the tank so the crew can carry it out."]] },
    ] },
    { blocks: [
      { t: "h", l: 2, text: "Pricing" },
      { t: "p", c: ["{{fact:quoteText}} {{fact:taxNote}}."] },
      { t: "p", c: ["{{fact:freeOnsiteEstimates.long}}"] },
    ] },
    { blocks: [
      { t: "h", l: 2, text: "How it works" },
      { t: "steps", items: [
        { n: "01", title: "Send the details", text: [["Tell us the tank type, size and location. Photos help us understand the job."]] },
        { n: "02", title: "Get your quote", text: [["{{fact:changedScope}}."]] },
        { n: "03", title: "Agree a pickup time", text: [["{{fact:scheduling}}"]] },
        { n: "04", title: "We carry it out", text: [["We remove the tank and haul it away. {{fact:recycling}}."]] },
      ] },
    ] },
    { blocks: [
      { t: "h", l: 2, text: "Water tank removal FAQs" },
      { t: "faq", items: [
        { q: "Do I need to drain the tank first?", a: [["{{fact:waterTankPrep}}. We confirm the preparation with you when we book."]] },
        { q: "How much does water tank removal cost?", a: [["{{fact:quoteText}} {{fact:taxNote}}."]] },
        { q: "Can you pick it up the same day?", a: [["{{fact:sameDay}}."]] },
        { q: "What happens to the old tank?", a: [["{{fact:recycling}}."]] },
        { q: "Which areas do you serve?", a: [["Toronto and the GTA. See the list of areas below, or call us to check your address."]] },
      ] },
    ] },
  ];
  if (gallery) for (const b of gallery.blocks) {
    if (b.t === "h") b.text = "Water tank removal photos";
    if (b.t === "p") b.c = ["Photos from water tank removals by Live Junk Free."];
    if (b.t === "gallery") b.images = b.images.map((im) => ({ ...im, alt: /after/i.test(im.src) ? "After a water tank removal" : "Water tank before removal" }));
  }
  if (gallery) gallery.blocks = gallery.blocks.filter((b) => b.t !== "cards");
  doc.sections = [hero, ...body, ...[gallery, reviews, areas].filter(Boolean)];
  return galleryHeadings(doc);
};

// ---------------------------------------------------------------- page list
const S = "services";
const HUB_LINE = ["No matter how big or tiny , We haul it all.", "Big or small, tell us what needs to go."];
const RESIDENTIAL_CTA = "Set Up a Time For Your Residential Junk Removal Project Right Now!";
const PAGES = [
  ["B1-03", `${S}/residential-junk-removal-services`, [
    ["B1-03 / P2", rep(...HUB_LINE)],
    ["B1-03 / P2 callback wording", rep(RESIDENTIAL_CTA, "Request a Junk Removal Quote or Callback")],
  ]],
  ["B1-04", `${S}/commercial-junk-removal-services`, [
    ["B1-04", rep(...HUB_LINE)],
    ["B1-04", rep("Set Up a Time for Your Commercial Junk Removal Project", "Request a Commercial Quote")],
    ["B1-04", para(/"Let Us Handle the"/, ["Let Us Handle the Heavy Lifting for Your Business"])],
  ]],
  ["B1-05", `${S}/junk-demolition-services`, [
    ["B1-05", rep(...HUB_LINE)],
    ["B1-05", rep(RESIDENTIAL_CTA, "Request a Demolition Quote")],
  ]],
  ["B1-06", `${S}/junk-cleanout-services`, [
    ["B1-06", rep(...HUB_LINE)],
    ["B1-06", rep(RESIDENTIAL_CTA, "Request a Cleanout Quote")],
    ["B1-06", (doc) => { for (const b of blocks(doc)) if (b.t === "ul") b.items = b.items.map((it) => (JSON.stringify(it).includes("If you’re looking for a ") ? ["Estate cleanouts: ", { a: "/services/junk-cleanout-services/estate-cleanout-services/", c: ["clearing a loved one’s home"] }, " once the family has set aside what they’re keeping."] : it)); return doc; }],
  ]],
  ["B1-06 rewrite", `${S}/junk-cleanout-services`, [["B1-06 distinct cleanout services", (doc) => {
    if (JSON.stringify(doc).includes("Which cleanout do you need?")) return doc;
    const C = "/services/junk-cleanout-services/";
    const drop = /^(Our Commitment to Efficient Stress-Free Cleanouts|Vision|Mission|Stress-Free Cleanouts Within No Time|Why Live Junk-Free|All the Services You Need for a Clutter-Free Life|Transform Your Space with Our Comprehensive Services)$/;
    const i = doc.sections.findIndex((x) => (x.blocks ?? []).some((b) => b.t === "h" && drop.test(b.text)));
    doc.sections = doc.sections.filter((x) => !(x.blocks ?? []).some((b) => (b.t === "h" && drop.test(b.text)) || b.t === "stats" || b.t === "marquee"));
    doc.sections.splice(Math.max(1, i), 0,
      { blocks: [
        { t: "h", l: 2, text: "Cleanouts across Toronto and the GTA" },
        { t: "p", c: ["{{fact:retainedItems}} {{fact:freeOnsiteEstimates.long}}"] },
      ] },
      { blocks: [
        { t: "h", l: 2, text: "Which cleanout do you need?" },
        { t: "cards", items: [
          { title: "Estate cleanouts", text: ["Clearing a loved one’s home with care, once the family has set aside what they’re keeping."], href: `${C}estate-cleanout-services/` },
          { title: "House cleanouts", text: ["Whole homes or single rooms. The price and timing depend on the volume and access."], href: `${C}house-cleanouts-services/` },
          { title: "Apartment cleanouts", text: ["Condos and apartments. Please arrange elevator or loading-dock approval with your building."], href: `${C}apartment-cleanouts-services/` },
          { title: "Hoarding cleanouts", text: ["Discreet, respectful removal of the items you agree to, at a pace that suits you."], href: `${C}hoarding-cleanouts-services/` },
          { title: "Storage unit cleanouts", text: ["You arrange access with the facility and mark anything you’re keeping; we remove the rest."], href: `${C}storage-unit-cleanouts-services/` },
          { title: "Garage cleanouts", text: ["A whole-garage clear-out. For just a few items, see garage junk removal."], href: `${C}garage-cleanout-services/` },
          { title: "Eviction cleanouts", text: ["For landlords and property managers who have confirmed their legal right to remove the contents."], href: `${C}eviction-cleanout-services/` },
          { title: "Basement cleanouts", text: ["Stored boxes, old furniture and clutter carried up and hauled away. Tell us about any damp items."], href: `${C}basement-cleanout-services/` },
          { title: "Office cleanouts", text: ["Desks, chairs and equipment from offices. Tell us about building rules and timing."], href: `${C}office-cleanout-services/` },
        ] },
      ] });
    return doc;
  }]]],
  ["B1-13", "bed-bug-furniture-removal", [
    ["New defect B1-13 (H1)", setH1("Bed Bug Furniture Removal Across the GTA", "Bed Bug Furniture Removal Across the GTA | Live Junk Free")],
    ["OBS-14 / R3", rep("All items bagged and wrapped before leaving your home", "Furniture wrapped and smaller items bagged before we carry them out")],
    ["B1-13 callback", rep("Book your Appointment", "Request a Callback")],
  ]],
  ["B1-17", `${S}/junk-cleanout-services/apartment-cleanouts-services`, [["OBS-27", card(/^Donation-First Sorting$/, "Donation First, Where Possible")]]],
  ["B1-19", `${S}/junk-cleanout-services/eviction-cleanout-services`, [
    ["B1-19", para(/Or next-day service when available/, ["Need an urgent cleanout? {{fact:sameDay}}. Call us to check the earliest available time."])],
    ["B1-19", faq(/emergency same-day eviction/i, "How soon can you do an eviction cleanout?", "{{fact:sameDay}}. {{fact:eviction}}")],
  ]],
  ["B1-20", `${S}/junk-cleanout-services/garage-cleanout-services`, [["G12 / one FAQ", dropFaq(/^Read What People Ask/i)]]],
  ["B1-21", `${S}/junk-cleanout-services/office-cleanout-services`, [
    ["OBS-39", card(/^Zero-Downtime Scheduling$/, "Scheduling Around Your Business")],
    ["OBS-40", dropItem(/"title":"Multi-Site & Landlord Programs"/)],
  ]],
  ["B1-37", `${S}/commercial-junk-removal-services/retail-cleanout-services`, [["OBS-106", rep("Need immediate service? ", "Need it cleared soon? ")]]],
  ["B1-37 FAQ", `${S}/commercial-junk-removal-services/retail-cleanout-services`, [
    ["OBS-105 / OBS-107", faq(/full cleanout services for retail stores/i, "Do you clear out retail stores?", "Yes. We remove fixtures, shelving, displays and unwanted stock that you've agreed to clear. Cleaning isn't included unless it's agreed in your quote.")],
    ["OBS-105 / OBS-107", faq(/What types of retail fixtures do you remove/i, "What retail fixtures can you remove?", "Clothing racks, display cases, shelving units, counters, mannequins and signage. Fixtures that are fixed to the building may need an assessment first.")],
    ["OBS-105 / OBS-107", faq(/How much does a retail cleanout cost/i, null, "{{fact:quoteText}} {{fact:taxNote}}.")],
    ["OBS-107", faq(/^What areas do you serve\??\s*$/i, "Which areas do you serve?", "Toronto and the GTA. See the list of areas on this page, or call us to check your address.")],
    ["OBS-106", faq(/Can I get same-day service/i, null, "{{fact:sameDay}}.")],
  ]],
  ["B1-38", `${S}/commercial-junk-removal-services/computer-removal-services`, [
    ["OBS-109", dropItem(/"title":"Multi-Device Pickups"/)],
    ["OBS-111", (doc) => {
      const c = ["This page is for office and business IT equipment. {{fact:dataSecurity}} Clearing out household TVs, laptops or electronics? See ", { a: "/services/residential-junk-removal-services/e-waste-removal-services/", c: ["e-waste removal"] }, "."];
      if (JSON.stringify(doc).includes("This page is for office and business IT equipment.")) return doc;
      const s1 = doc.sections[1];
      const i = (s1?.blocks ?? []).findIndex((b) => b.t === "h");
      if (s1 && i >= 0) s1.blocks.splice(i + 1, 0, { t: "p", c });
      return doc;
    }],
  ]],
  ["B1-23", `${S}/residential-junk-removal-services/couch-removal-services`, [
    ["OBS-45", setSeo("description", "Couch and sofa removal across the GTA. Tell us the size, floor and access for a quote; pickup scheduled around availability.")],
  ]],
  ["B1-24", `${S}/residential-junk-removal-services/mattress-removal-services`, [
    ["OBS-51", rep("Mattress Haul Away — Timed to Your New Bed's Delivery", "Mattress Haul Away Across the GTA")],
    ["OBS-51", para(/most deadline-shaped job/, ["Tell us the mattress size, the floor and the access, and we'll give you a quote. {{fact:sameDay}}."])],
    ["OBS-51", dropItem(/Delivery-Day Sync|new-bed deliveries/i)],
    ["OBS-51", card(/^Pick a Window That Beats Delivery$/, "Pick a Callback Time", "{{fact:scheduling}}")],
    ["OBS-51", faq(/cost, and is same-day really possible/i, "How much does mattress removal cost?", "{{fact:quoteText}} {{fact:taxNote}}. {{fact:sameDay}}.")],
    ["OBS-49 / R3", insertAfterHeading(/^Mattress Haul Away Across the GTA$/, ["Mattress with bed bugs? See our ", { a: "/bed-bug-furniture-removal/", c: ["bed bug furniture removal"] }, ": {{fact:bedBugScope}}"])],
  ]],
  ["B1-25", `${S}/residential-junk-removal-services/furniture-removal-services`, [
    ["OBS-53", rep("Need that old furniture gone today? We’ve got you covered. ", "Need old furniture removed? ")],
    ["OBS-53", (doc) => { for (const b of blocks(doc)) for (const it of b.items ?? []) if (it && typeof it === "object" && /entire weekend of stress/.test(JSON.stringify(it.text ?? ""))) it.text = ["Our crew arrives equipped to lift and carry, and we take care moving items through your home."]; return doc; }],
  ]],
  ["B1-26", `${S}/residential-junk-removal-services/hot-tub-removal-services`, [
    ["OBS-57 (H1)", setH1("Hot Tub Removal in Toronto & the GTA", "Hot Tub Removal in Toronto & the GTA | Live Junk Free")],
    ["OBS-57", rep("After that, we will commence the demolition work, take out the hot tub, tidy up the site, and handle the removal and disposal.", "After that, we take the hot tub apart where needed, carry it out and haul it away.")],
    ["OBS-57", rep("Taking out a hot tub is quite the task, which is why it’s helpful to have a professional demolition company like us come in and take care of it.", "Taking out a hot tub is a big job, which is why it helps to have a professional removal crew take care of it.")],
    ["OBS-57", rep("Accepting difficult tasks such as hot tub demolition can result in muscle soreness and, in the worst case, personal injury. Why take a chance?", "Moving a hot tub yourself can lead to strain or injury. Why take the chance?")],
    ["OBS-57", para(/In addition to demolitions, we’re prepared/, ["We also remove ", { a: "/services/residential-junk-removal-services/appliances-removal-services/", c: ["appliances"] }, ", ", { a: "/services/residential-junk-removal-services/furniture-removal-services/", c: ["furniture"] }, " and general junk."])],
    ["OBS-59", insertAfterHeading(/^Hot Tub Removal in Toronto & the GTA$/, ["{{fact:hotTubPrep}}. We confirm the preparation and access with you before the job is booked."])],
    ["OBS-59", addFaq("Do I need to drain the hot tub first?", "{{fact:hotTubPrep}}. We confirm the preparation and access with you before the job is booked.")],
  ]],
  ["B1-28", `${S}/residential-junk-removal-services/bed-bug-furniture-removal-services`, [["B1-28", rep("clean, usable areas..", "clear, usable areas.")]]],
  ["B1-29", `${S}/residential-junk-removal-services/piano-removal-services`, [
    ["OBS-70 / OBS-72 / B5.17", sectionBlocks(/^The Live Junk Free Advantage – Piano Removal Done Right$/, [
      { t: "h", l: 2, text: "The Live Junk Free Advantage – Piano Removal Done Right" },
      { t: "cards", items: [
        { title: "Flexible Scheduling", text: ["{{fact:sameDay}}."] },
        { title: "Clear Quotes", text: ["{{fact:quoteText}} {{fact:taxNote}}."] },
        { title: "Reuse or Recycle", text: ["We reuse or recycle where possible; disposal depends on the piano's condition and local facilities."] },
        { title: "Careful Handling", text: ["{{fact:propertyProtection}}."] },
        { title: "Licensed & Insured", text: ["{{fact:licensedInsured}}. Tell us the piano type, the floors and stairs, and the access, and we'll confirm what's involved before booking."] },
      ] },
    ])],
  ]],
  ["B1-29", `${S}/residential-junk-removal-services/piano-removal-services`, [
    ["B5.17 / OBS-70", rep("We Remove ALL Types of Pianos & Keyboards!", "Piano & Keyboard Removal")],
    ["B5.17 / OBS-70", rep("At Live Junk Free, we specialize in removing all types of pianos:", "We remove upright pianos and keyboards. For other piano types, tell us the model, the floors and stairs, and the access, and we'll confirm what's involved:")],
    ["B5.17 / OBS-70", (doc) => { for (const b of blocks(doc)) if (b.t === "ul") b.items = b.items.map((it) => (JSON.stringify(it) === '["Upright Pianos Grand Piano"]' ? ["Upright pianos"] : it)).filter((it) => !/^\["(Baby )?Grand Pianos?"\]$/i.test(JSON.stringify(it))); return doc; }],
  ]],
  ["B1-31", `${S}/residential-junk-removal-services/carpet-removal-services`, [["OBS-77 (H1)", setH1("Carpet Removal and Haul-Away Across the GTA")]]],
  ["B1-32", `${S}/residential-junk-removal-services/garage-junk-removal-services`, [
    ["OBS-82 (H1)", setH1("Garage Junk Removal in the Greater Toronto Area", "Garage Junk Removal in the GTA | Live Junk Free")],
    ["OBS-82", rep("Garage Cleanout Services – FAQs", "Garage Junk Removal – FAQs")],
    ["OBS-84", card(/^Donation-First Sorting$/, "Donation First, Where Possible")],
    ["OBS-82", insertAfterHeading(/^Garage Junk Removal in the Greater Toronto Area$/, ["Garage junk removal is for selected items or a partial pickup: a few bulky pieces, old tools or a corner of boxes. For a whole-garage clear-out, see ", { a: "/services/junk-cleanout-services/garage-cleanout-services/", c: ["Garage Cleanouts"] }, "."])],
  ]],
  ["B1-33", `${S}/residential-junk-removal-services/water-tank-removal-services`, [["New defect B1-33 / OBS-86–89", WATER_TANK]]],
  ["B1-36", `${S}/commercial-junk-removal-services/warehouse-cleanout-services`, [["OBS-101 timing", rep(/warehouse cleanout services, subject to scheduling\.(\s*)$/, "warehouse cleanout services (subject to availability)$1")]]],
  ["B1-22", `${S}/junk-cleanout-services/storage-unit-cleanouts-services`, [["OBS-44 one short FAQ", (doc) => {
    if (blocks(doc).some((b) => b.t === "faq" && b.items.length)) return doc;
    const at = doc.sections.findIndex((x) => (x.blocks ?? []).some((b) => b.t === "reviews"));
    doc.sections.splice(at < 0 ? doc.sections.length : at, 0, { blocks: [
      { t: "h", l: 2, text: "Storage unit cleanout FAQs" },
      { t: "faq", items: [
        { q: "Do I need to be there?", a: [["Please arrange access with the storage facility and mark or remove anything you’re keeping before we start. {{fact:retainedItems}}"]] },
        { q: "How much does a storage unit cleanout cost?", a: [["{{fact:quoteText}} {{fact:taxNote}}."]] },
        { q: "Can you do it the same day?", a: [["{{fact:sameDay}}."]] },
        { q: "What happens to the items?", a: [["{{fact:recycling}}."]] },
      ] },
    ] });
    return doc;
  }]]],
  ["B1-47", "locations/ajax", [
    ["OBS-145", rep("We provide professional demolition services for both residential and commercial properties, ensuring safe and controlled demolition.", "Demolition we can quote in Ajax: decks, sheds, fences, hot tubs and playsets. {{fact:structuralDemolition}}.")],
    ["OBS-145", rep(/,? and old office equipment to large-scale demolition j[^.]*\./, " and old office equipment, we can help.")],
  ]],
  ["B1-39", `${S}/junk-demolition-services/shed-demolition-services`, [["OBS-115", dropItem(/Multi-Shed/i)]]],
  ["B1-40", `${S}/junk-demolition-services/garage-demolition-services`, [
    ["OBS-119", dropItem(/Multi-Garage|Concrete Block Garages/i)],
    ["OBS-119", rep(/^Transparent Garage Demolition Pricing –$/, "Transparent Garage Demolition Pricing")],
    ["OBS-120", alt(/garage-demolition-services-after/i, "After a garage demolition (example project photo)")],
    ["OBS-120", alt(/garage-demolition-services-before/i, "Before a garage demolition (example project photo)")],
  ]],
  ["B1-42", `${S}/junk-demolition-services/concrete-demolition-services`, [
    ["OBS-128", dropItem(/All-Weather/i)],
    ["OBS-129", trimFaq(6)],
  ]],
  ["B1-44", "locations/mississauga", [
    ["New defect B1-44 (H1)", setH1("Junk Removal in Mississauga")],
    ["B1-44", rep("No franchise call centres..", "No franchise call centres.")],
  ]],
  ["B1-48", "locations/brampton", [
    ["OBS-147", rep("our Brampton crew takes care of it all", "our crew takes care of it all")],
    ["OBS-147", (doc) => {
      for (const b of blocks(doc)) if (b.t === "p" && Array.isArray(b.c)) {
        const i = b.c.findIndex((x) => typeof x === "string" && x.endsWith("Same-day, subject to scheduling. "));
        if (i < 0) continue;
        b.c[i] = b.c[i].replace(/Same-day, subject to scheduling\. $/, "{{fact:sameDay}}.");
        if (JSON.stringify(b.c[i + 1]) === '{"b":["junk removal services in Brampton"]}' && b.c[i + 2] === " Timing confirmed at your estimate") b.c.splice(i + 1, 2);
      }
      return doc;
    }],
  ]],
  ["B1-49", "locations/aurora/apartment-cleanout-services-in-aurora", [
    ["OBS-150", rep(/Donation-first checks before anything is recycled( where possible)? or disposed of/g, "Donation and recycling first, where possible; disposal only for what's left")],
    ["OBS-150", rep("Donation and recycling where possible, before anything is disposed of", "Donation and recycling first, where possible; disposal only for what's left")],
  ]],
  ["B1-50", "locations/toronto/office-cleanout-services-in-toronto", [
    ["OBS-155", faq(/overnight or on a weekend/i, "Can you work outside business hours?", "{{fact:weekendPickup}}. Ask us about after-hours scheduling; availability and any after-hours rates are confirmed with your quote.")],
  ]],
];

for (const [id, rel, ops] of PAGES) {
  const file = join(ROOT, "content/pages", rel + ".json");
  const raw = readFileSync(file, "utf8");
  let doc = JSON.parse(raw);
  const changed = [];
  for (const [tag, op] of ops) {
    const before = JSON.stringify(doc);
    doc = op(doc) ?? doc;
    if (JSON.stringify(doc) !== before) changed.push(tag);
  }
  const out = JSON.stringify(doc, null, (raw.match(/^\{\n( +)/) || [, " "])[1].length) + (raw.endsWith("\n") ? "\n" : "");
  if (out !== raw) writeFileSync(file, out);
  log.push(`${id.padEnd(6)} ${changed.length ? changed.join(", ") : "no change"}   ${rel}`);
}
console.log(log.join("\n"));
