/**
 * claims-lint: scans every built route (visible text, <title>, meta description, image alt, JSON-LD) for the
 * claim patterns in scripts/checks/claims-patterns.json.
 *
 *   node scripts/checks/claims-lint.mjs [--out docs/client/batch-1/claims-report.csv]
 *
 * Exit code 1 when any un-allowed hit is on one of the 50 Batch 1 pages. Other routes are reported and counted.
 * Run `npm run build` first.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { sentences } from "./html.mjs";
import { BATCH_PATHS, ROOT, load, routes } from "./pages.mjs";

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg("--out", "docs/client/batch-1/claims-report.csv");
const cfg = JSON.parse(readFileSync(join(ROOT, "scripts/checks/claims-patterns.json"), "utf8"));
const rx = (p) => (typeof p === "string" ? new RegExp(p, "i") : new RegExp(p.re, p.flags ?? "i"));
const CATS = Object.entries(cfg.categories).map(([name, c]) => ({ name, patterns: c.patterns.map(rx), allow: (c.allow ?? []).map((a) => ({ re: rx(a.re), reason: a.reason })) }));
const GLOBAL = (cfg.globalAllow ?? []).map((a) => ({ re: rx(a.re), reason: a.reason }));

// Approved sentences from business-facts.json (status confirmed): a page sentence containing one is allowed.
const norm = (s) => s.toLowerCase().replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ").replace(/[.\s]+$/, "").trim();
const pricing = JSON.parse(readFileSync(join(ROOT, "content/pricing.json"), "utf8"));
const rate = (t) => t.replace(/\{\{rate:(\w+)\.([^}.]+)(\.n)?\}\}/g, (_m, pr, label, n) => { const v = pricing[pr]?.sizes?.find((x) => x.label === label)?.price; return v == null ? "" : n ? String(v) : `C$${v}`; });
const facts = JSON.parse(rate(readFileSync(join(ROOT, "content/business-facts.json"), "utf8")));
const APPROVED = [];
for (const [k, f] of Object.entries(facts)) {
  if (!f || typeof f !== "object" || f.status !== "confirmed") continue;
  for (const field of ["text", "short", "long", "extra"]) if (typeof f[field] === "string") for (const s of f[field].split(/(?<=[.!?;])\s+/)) if (s.trim().length > 12) APPROVED.push({ s: norm(s), key: `${k}${field === "text" ? "" : "." + field}` });
}

const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""').replace(/\s+/g, " ").trim()}"`;
const rows = [];
const summary = { batch: { fail: 0, allowed: 0, pages: {} }, site: { hits: 0, allowed: 0, routes: 0 }, byCategory: {} };

for (const { route, file } of routes()) {
  const id = BATCH_PATHS.get(route);
  const p = load(file);
  if (!id) summary.site.routes++;
  const sources = [
    ["text", p.visible],
    ["title", p.title],
    ["meta", p.meta],
    ...p.alts.map((a) => ["alt", a]),
    ...p.ldText.map((t) => ["jsonld", t]),
  ];
  const seen = new Set();
  for (const [loc, txt] of sources) {
    for (const sent of sentences(txt)) {
      for (const c of CATS) {
        for (const re of c.patterns) {
          const m = sent.match(re);
          if (!m) continue;
          const key = `${loc}|${c.name}|${m[0].toLowerCase()}|${sent}`;
          if (seen.has(key)) continue;
          seen.add(key);
          const n = norm(sent);
          const fact = APPROVED.find((a) => n.includes(a.s));
          const allow = fact ? { reason: `approved fact ${fact.key}` } : [...c.allow, ...GLOBAL].find((a) => a.re.test(sent));
          const status = allow ? "ALLOWED" : id ? "FAIL" : "SITE";
          rows.push([route, id ?? "", loc, c.name, m[0], sent.slice(0, 400), status, allow?.reason ?? ""]);
          summary.byCategory[c.name] ??= { batchFail: 0, site: 0, allowed: 0 };
          if (allow) { summary.byCategory[c.name].allowed++; (id ? summary.batch : summary.site).allowed++; }
          else if (id) { summary.batch.fail++; summary.byCategory[c.name].batchFail++; summary.batch.pages[id] = (summary.batch.pages[id] ?? 0) + 1; }
          else { summary.site.hits++; summary.byCategory[c.name].site++; }
        }
      }
    }
  }
}

rows.sort((a, b) => (a[6] === b[6] ? 0 : a[6] === "FAIL" ? -1 : b[6] === "FAIL" ? 1 : 0) || String(a[1]).localeCompare(String(b[1])) || a[0].localeCompare(b[0]));
writeFileSync(join(ROOT, OUT), ["route,page_id,location,category,matched,sentence,status,allow_reason", ...rows.map((r) => r.map(csvCell).join(","))].join("\n") + "\n");
writeFileSync(join(ROOT, OUT.replace(/\.csv$/, ".summary.json")), JSON.stringify(summary, null, 1) + "\n");

console.log(`claims-lint → ${OUT}`);
console.log(`  Batch 1 (50 pages): ${summary.batch.fail} failing hits on ${Object.keys(summary.batch.pages).length} pages; ${summary.batch.allowed} allowed (with reasons)`);
console.log(`  Rest of site (${summary.site.routes} routes): ${summary.site.hits} hits; ${summary.site.allowed} allowed`);
for (const [k, v] of Object.entries(summary.byCategory)) console.log(`    ${k.padEnd(13)} batch-fail ${String(v.batchFail).padStart(4)}   site ${String(v.site).padStart(5)}   allowed ${v.allowed}`);
if (summary.batch.fail) {
  console.log("  Failing pages:", Object.entries(summary.batch.pages).sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => `${k}:${v}`).join(" "));
  process.exitCode = 1;
}
