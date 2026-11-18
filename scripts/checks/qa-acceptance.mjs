/**
 * qa-acceptance: the 18 Nov QA's required end states (Acceptance Register / P0 Actions / New Defects), checked
 * page by page on the built HTML. Complements claims-lint (patterns) and page-lint (structure).
 *
 *   node scripts/checks/qa-acceptance.mjs [--out docs/client/batch-1/qa-acceptance-report.csv]
 *
 * Each assertion is one of:
 *   no: /re/            the page's visible text, title, meta and JSON-LD must NOT match
 *   has: /re/           the visible text must match
 *   h1: "text"          the visible H1 is exactly this
 *   meta: "text"        the meta description is exactly this
 *   link: "/path/"      the page's <main> links to this path
 *   heroNot: /re/       the hero image src must not match
 *   faqMax: n           at most n FAQ questions
 * Exit code 1 if any assertion fails.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { all, text } from "./html.mjs";
import { BATCH, ROOT, load, routes } from "./pages.mjs";

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg("--out", "docs/client/batch-1/qa-acceptance-report.csv");

const A = {
  "B1-01": [{ no: /Booked in minutes|Gone in one visit/ }, { has: /Quick quotes\. Removal scheduled around you\./ }],
  "B1-03": [{ no: /big or tiny ,/ }, { no: /Residential Junk Removal Project Right Now/ }],
  "B1-04": [{ no: /\bwe guarantee\b/i }, { no: /Residential Junk Removal Project/ }, { has: /Request a commercial quote/i }],
  "B1-05": [{ no: /\bguarantee/i }, { no: /Residential Junk Removal Project/ }, { has: /Request a demolition quote/i }],
  "B1-06": [{ no: /Residential Junk Removal Project|nothing is impossible|office cleanout services to satisfy/i }, { has: /Request a cleanout quote/i }, { has: /Which cleanout do you need\?/ }],
  "B1-13": [{ h1: "Bed Bug Furniture Removal Across the GTA" }, { no: /bagged and contained|guideline|licensed channels|Book your Appointment|Satisfied Custom\b/i }, { has: /Request a Callback/ }],
  "B1-14": [{ heroNot: /estate-cleanout|deck-(after|before)/ }],
  "B1-15": [{ no: /\blivable\b|deep[- ]clean/i }],
  "B1-17": [{ no: /\b(we|our crew|crews?)\b[^.]{0,30}\bdisconnect|appliance disconnection|\bone visit\b|\bsweep|zero damage|donation receipt/i }, { has: /elevator or loading-dock approval with your building/i }],
  "B1-18": [{ no: /Charity Before Landfill/i }],
  "B1-19": [{ no: /make it right/i }],
  "B1-20": [{ no: /Fair Pricing Guaranteed|Special rates/i }],
  "B1-21": [{ no: /overnight|zero[- ]downtime|\bCOIs?\b|diversion report/i }],
  "B1-22": [{ no: /loaded for delivery/i }, { has: /Storage unit cleanout FAQs/ }],
  "B1-23": [{ meta: "Couch and sofa removal across the GTA. Tell us the size, floor and access for a quote; pickup scheduled around availability." }, { no: /any couch same day/i }],
  "B1-24": [{ no: /\bsealed\b|encase|delivery-day|\b20-minute\b/i }, { link: "/bed-bug-furniture-removal/" }],
  "B1-25": [{ no: /No hidden labour fees|no disposal surcharges|no last-minute additions/i }],
  "B1-26": [{ h1: "Hot Tub Removal in Toronto & the GTA" }, { no: /Best Price/i }, { has: /drained and its power disconnected by a qualified person/ }],
  "B1-27": [{ no: /in most GTA areas/i }],
  "B1-28": [{ no: /eliminates the risk|Guaranteed Safe Disposal|prevent any spread|Property Protection Guarantee|special pricing|\bbulk\b/i }],
  "B1-29": [{ no: /schools|community cent(re|er)s|grand piano|all types of pianos/i }],
  "B1-30": [{ no: /\bbulk\b|multi-device|discount/i }],
  "B1-31": [{ no: /pulled up/i }],
  "B1-32": [{ h1: "Garage Junk Removal in the Greater Toronto Area" }, { link: "/services/junk-cleanout-services/garage-cleanout-services/" }],
  "B1-33": [{ no: /We’re Read our Google reviews/ }, { has: /drained and disconnected by a qualified person before pickup/ }, { has: /Request a water tank removal quote/i }],
  "B1-36": [{ no: /heavy items like machinery|racking systems/i }],
  "B1-37": [{ no: /\bimmediate(ly)?\b|\bone visit\b/i }],
  "B1-38": [{ link: "/services/residential-junk-removal-services/e-waste-removal-services/" }],
  "B1-39": [{ no: /foundation|quotes are guaranteed/i }],
  "B1-40": [{ no: /hundreds of|completely clean/i }],
  "B1-41": [{ no: /Turn off and disconnect|concrete pool decks?/i }],
  "B1-42": [{ heroNot: /deck-(after|before)/ }, { no: /industrial breakers?|\bsaws\b|dust suppression|all-weather|site restoration/i }, { faqMax: 8 }],
  "B1-43": [{ no: /for every condo|60 seconds/i }],
  "B1-44": [{ h1: "Junk Removal in Mississauga" }],
  "B1-45": [{ no: /across all (of )?Markham/i }],
  "B1-46": [{ no: /final — guaranteed|Commercial30|more than any other|barn demolition/i }],
  "B1-47": [{ no: /\bbased in\b|representatives in|large-scale demolition|both residential and commercial properties, ensuring/i }],
  "B1-48": [{ no: /most days|immediate(ly)? confirm/i }],
  "B1-49": [{ no: /most of the time|regardless of (the )?season/i }],
  "B1-50": [{ no: /normal operating pattern|rather than a premium|quote (does not|doesn['’]t) move|Demolitions We Do/i }],
};

const byPath = new Map(routes().map((r) => [r.route, r.file]));
const rows = [];
let fail = 0;
for (const page of BATCH) {
  const checks = A[page.id];
  if (!checks) continue;
  const p = load(byPath.get(page.path));
  const main = all(p.body, (n) => n.tag === "main")[0] ?? p.body;
  const visible = text(main);
  const everything = [p.visible, p.title, p.meta, ...p.ldText].join("\n");
  const h1 = all(p.body, (n) => n.tag === "h1").map((h) => text(h).replace(/\s+/g, " ").trim());
  const hero = all(main, (n) => n.tag === "img")[0];
  for (const c of checks) {
    let ok, what, found = "";
    if (c.no) { const m = everything.match(c.no); ok = !m; what = `not ${c.no}`; found = m ? everything.slice(Math.max(0, m.index - 50), m.index + 70) : ""; }
    else if (c.has) { ok = c.has.test(visible); what = `has ${c.has}`; }
    else if (c.h1) { ok = h1.length === 1 && h1[0] === c.h1; what = `H1 = "${c.h1}"`; found = h1.join(" | "); }
    else if (c.meta) { ok = p.meta === c.meta; what = "meta description"; found = p.meta; }
    else if (c.link) { ok = all(main, (n) => n.tag === "a" && n.attrs.href === c.link).length > 0; what = `links to ${c.link}`; }
    else if (c.heroNot) { const src = hero?.attrs.src ?? ""; ok = !c.heroNot.test(src); what = `hero image not ${c.heroNot}`; found = src; }
    else if (c.faqMax) { const n = all(main, (x) => x.tag === "summary").length; ok = n <= c.faqMax; what = `≤ ${c.faqMax} FAQ questions`; found = `${n}`; }
    if (!ok) fail++;
    rows.push([page.id, page.path, what, ok ? "PASS" : "FAIL", found.replace(/\s+/g, " ")]);
  }
}
const cell = (v) => `"${String(v).replace(/"/g, '""')}"`;
writeFileSync(join(ROOT, OUT), ["page_id,route,assertion,result,found", ...rows.map((r) => r.map(cell).join(","))].join("\n") + "\n");
console.log(`qa-acceptance → ${OUT}: ${rows.length - fail}/${rows.length} pass`);
for (const r of rows.filter((x) => x[3] === "FAIL")) console.log(`  FAIL ${r[0]} ${r[2]}  ${r[4] ? "«" + r[4].slice(0, 140) + "»" : ""}`);
if (fail) process.exitCode = 1;
