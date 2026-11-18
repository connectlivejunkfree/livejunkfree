/**
 * tracking-test (QA 18 Nov P1 tracking gate): the Google Ads / GA4 lead conversion fires only after a successful
 * submission, once per lead_id, and never because a thank-you page was loaded or refreshed.
 *
 * Proven without opening a thank-you page in a browser (project rule): the built thank-you routes are inspected
 * as files, and the de-duplication is unit-tested.
 *
 *   node scripts/checks/tracking-test.mjs      (run `npm run build` first)
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
let fail = 0;
const ok = (cond, msg) => { console.log(`${cond ? "PASS" : "FAIL"}  ${msg}`); if (!cond) fail++; };

// 1. Unit test: one conversion per lead id per session.
const { firstTimeFor } = await import(join(ROOT, "src/lib/tracking/dedupe.ts"));
const mem = new Map();
const store = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) };
ok(firstTimeFor("lead-A", store) === true, "first submit of lead-A counts");
ok(firstTimeFor("lead-A", store) === false, "the same lead-A again (double click / refresh / back) does not count");
ok(firstTimeFor("lead-B", store) === true, "a different lead-B counts");
ok(firstTimeFor(null, store) === true, "a submit without an id still counts once (no stored state)");

// 2. Source: generate_lead is pushed in exactly one place, after the server accepted the lead.
const files = [];
const scan = (d) => { for (const e of readdirSync(d, { withFileTypes: true })) { const p = join(d, e.name); if (e.isDirectory()) scan(p); else if (/\.(tsx?|mjs|js)$/.test(p)) files.push(p); } };
scan(join(ROOT, "src"));
const pushes = files.filter((f) => readFileSync(f, "utf8").includes('"generate_lead"'));
ok(pushes.length === 1 && pushes[0].endsWith("src/components/forms/useLeadSubmit.ts"), `generate_lead is pushed only in useLeadSubmit.ts (found in: ${pushes.map((f) => f.replace(ROOT + "/", "")).join(", ") || "none"})`);
const submit = readFileSync(join(ROOT, "src/components/forms/useLeadSubmit.ts"), "utf8");
const iOk = submit.indexOf("if (!res.ok)"), iTrack = submit.indexOf('track("generate_lead"'), iPush = submit.indexOf("router.push(res.redirectTo)");
ok(iOk > 0 && iTrack > iOk && iPush > iTrack, "the event follows the server's success check and comes before the redirect to the thank-you page");
ok(/firstTimeFor\(res\.leadId/.test(submit), "the event is gated by firstTimeFor(lead_id)");

// 3. Built thank-you routes: nothing on the page itself pushes a conversion.
const APP = join(ROOT, ".next/server/app");
for (const route of ["thank-you-estate-quote", "thankpage-schedule"]) {
  const html = join(APP, `${route}.html`);
  if (!existsSync(html)) { ok(false, `/${route}/ is built (run npm run build)`); continue; }
  const body = readFileSync(html, "utf8") + (existsSync(join(APP, `${route}.rsc`)) ? readFileSync(join(APP, `${route}.rsc`), "utf8") : "");
  ok(!/generate_lead|conversion|send_to|AW-\d+\/|gtag\(/.test(body), `/${route}/ contains no conversion push (generate_lead / gtag / send_to)`);
  ok(!/googletagmanager\.com\/gtm\.js/.test(body), `/${route}/ doesn't embed GTM in its HTML (GTM is added by GtmGate on livejunkfree.ca only)`);
}

// 4. GTM only loads on the production hostnames, so the preview can never fire a live conversion.
const gate = readFileSync(join(ROOT, "src/components/layout/GtmGate.tsx"), "utf8");
ok(/livejunkfree\.ca,www\.livejunkfree\.ca/.test(gate) && /HOSTS\.includes|includes\(/.test(gate), "GtmGate loads GTM only on livejunkfree.ca / www.livejunkfree.ca");

console.log(fail ? `tracking-test: ${fail} failed` : "tracking-test: all passed");
console.log("Note: whether Google Ads ALSO counts a thank-you page view is configured in the GTM container, not in this code. Manisha verifies that in the controlled test (Answers D.3, E.6).");
if (fail) process.exitCode = 1;
