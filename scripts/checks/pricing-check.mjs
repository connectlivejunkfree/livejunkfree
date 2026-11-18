/**
 * pricing-check (QA 18 Nov §4): content/pricing.json against Nav's rate card as transcribed in
 * docs/client/batch-1/LJF_Akshat_Point_by_Point_Answers_18_Nov_2026.pdf (A1, "Pricing values approved for
 * implementation"), and the built Home / How It Works / Estate pages against pricing.json.
 *
 *   node scripts/checks/pricing-check.mjs      (run `npm run build` first for the page checks)
 * Exit code 1 on any difference.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
// Nav's card, exactly as the 18 Nov answers list it: [fraction, cubic yards, CAD].
const CARD = {
  junkLoad: { labour: "1/2 Hour of Labour Included Per 1/4 Load.", tiers: [["1/16", 1, 125], ["1/8", 2, 155], ["1/6", 3, 195], ["1/4", 4, 265], ["1/3", 5, 335], ["3/8", 6, 385], ["1/2", 8, 455], ["5/8", 10, 515], ["2/3", 11, 555], ["3/4", 12, 595], ["5/6", 13, 615], ["7/8", 14, 635], ["Full", 16, 655]] },
  bedLoad: { labour: "1 Hour of Labour Included Per 1/2 Load.", tiers: [["1/6", 0.5, 195], ["1/4", 0.75, 265], ["1/3", 1, 335], ["1/2", 1.5, 455], ["2/3", 2, 555], ["3/4", 2.5, 595], ["Full", 3, 655]] },
};
const pricing = JSON.parse(readFileSync(join(ROOT, "content/pricing.json"), "utf8"));
let bad = 0;
const out = [];
for (const [key, card] of Object.entries(CARD)) {
  const p = pricing[key];
  const sizes = p?.sizes ?? [];
  if (sizes.length !== card.tiers.length) { bad++; out.push(`DIFF ${key}: ${sizes.length} sizes in pricing.json, card has ${card.tiers.length}`); }
  for (const [label, yd, cad] of card.tiers) {
    const s = sizes.find((x) => x.label === label);
    const ok = s && s.cubicYards === yd && s.price === cad;
    if (!ok) bad++;
    out.push(`${ok ? "MATCH" : "DIFF "} ${key.padEnd(8)} ${label.padEnd(5)} ${String(yd).padStart(5)} yd³  C$${cad}${ok ? "" : `  (pricing.json: ${s ? `${s.cubicYards} yd³, C$${s.price}` : "missing"})`}`);
  }
  const labourOk = p?.labour === card.labour;
  if (!labourOk) bad++;
  out.push(`${labourOk ? "MATCH" : "DIFF "} ${key} labour note: "${p?.labour}"`);
}

// Built pages show the same figures as pricing.json (the truck itself renders from pricing.json).
const page = (route) => {
  const f = join(ROOT, ".next/server/app", route === "/" ? "index.html" : route.replace(/^\/|\/$/g, "") + ".html");
  return existsSync(f) ? readFileSync(f, "utf8").replace(/<script(?![^>]*ld\+json)[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " ").replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ") : null;
};
const min = pricing.junkLoad.sizes.find((s) => s.label === "1/16").price;
const full = pricing.junkLoad.sizes.find((s) => s.label === "Full").price;
// the truck opens on pricing.json's default size (Home shows that tier's price before any tap)
const def = pricing.junkLoad.sizes.find((s) => s.id === pricing.junkLoad.defaultSize) ?? pricing.junkLoad.sizes[0];
const PAGES = [
  ["/", [new RegExp(`C\\$${def.price}\\b`), new RegExp(`${def.cubicYards} cubic yards`), /exclude applicable taxes/]],
  ["/how-it-works/", [new RegExp(`Junk Load from C\\$${min}\\b`), new RegExp(`C\\$${full}\\b`), /exclude applicable taxes/]],
  ["/services/junk-cleanout-services/estate-cleanout-services/", [/Contact us for a quote based on the items/, /exclude applicable taxes/]],
];
for (const [route, must] of PAGES) {
  const t = page(route);
  if (!t) { out.push(`SKIP  ${route} (not built)`); continue; }
  for (const re of must) { const ok = re.test(t); if (!ok) bad++; out.push(`${ok ? "MATCH" : "DIFF "} ${route} shows ${re}`); }
  // no price on the page that isn't on the card
  const cardPrices = new Set(Object.values(CARD).flatMap((c) => c.tiers.map((x) => x[2])));
  for (const m of t.matchAll(/C\$(\d{2,4})\b/g)) if (!cardPrices.has(+m[1])) { bad++; out.push(`DIFF  ${route} shows C$${m[1]}, not a rate on the card`); }
}
console.log(out.join("\n"));
console.log(bad ? `pricing-check: ${bad} difference(s)` : "pricing-check: all 20 rates, both labour notes and the page figures match Nav's card");
if (bad) process.exitCode = 1;
