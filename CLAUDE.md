# Working on the Live Junk Free website

Next.js 16 (App Router, static pages) + React 19, hosted on Vercel; Supabase for enquiries; Resend for email. The owner (Nav) approves business claims; Manisha manages the site. Read `README.md` first.

## Commands

- `npm install`: once per machine, and after `package.json` changes.
- `npm run dev`: http://localhost:3000.
- `npm run build && npm run check:content`: run after **every** change, and report the result. All six checks must pass, with 0 failing on the 50 Batch 1 pages.
- `npx tsc --noEmit` and `npm run lint`: must be clean.

## Where content lives

- `content/business-facts.json`: every business claim as a fact. Pages use `{{fact:key}}` / `{{fact:key.field}}`. A fact with `status: "removed"` renders as nothing; `pending-nav` renders, but is still waiting on Nav.
- `content/pricing.json`: the only place a rate is set. Facts read it with `{{rate:junkLoad.1/16}}`, and pages use `{{min_price}}`. If a rate changes, update the card in `scripts/checks/pricing-check.mjs` too.
- `content/pages/**.json`, `content/blog/*.json`: generated pages. `content/designed/**.ts`: the 11 hand-designed pages.
- `content/emails.json`: email wording (the client's exact templates).

## Content rules (non-negotiable)

Source of truth: `docs/client/batch-1/LJF_Akshat_Point_by_Point_Answers_18_Nov_2026.pdf`, Manisha's follow-up (in `NAV-CONFIRMATIONS.md`) and the 18 Nov QA (`LJF_First50_Independent_QA_2026-11-18.xlsx`).

**Never invent a fact.** Anything Nav hasn't confirmed gets conditional, safe wording, never an absolute. Don't delete in a way that leaves an empty heading, card or FAQ. In particular, never write:
- guarantees
- "no hidden fees", "all-inclusive", "price is final", or flat / bulk / multi-unit / special rates
- same-day / next-day / weekend without "may be available" / "subject to scheduling"
- 24/7, emergency, instant quotes or response times
- certified / R2 / % recycling, donation receipts, data destruction
- permits handled, structural or foundation work, utility disconnection by us
- deep cleaning, sorting or sweeping as standard
- review counts, superlatives, or local offices

Approved wording lives in `business-facts.json`: reuse the fact rather than retyping it.

**Fixed facts:**
- Phone `tel:+16479225865`, phone hours 7 am–11 pm.
- 10% off only for items already at the curb or driveway.
- Bed bug work: wrap, bag smaller items, remove and dispose; no pest treatment.
- Displayed rates exclude applicable taxes.

**Forms request a quote or callback;** they never book or confirm an appointment.

## How changes are made

- Site-wide wording patterns: `scripts/content-rules.mjs` (rules run over every content file; idempotent).
- Page-specific fixes: `scripts/batch1-page-fixes.mjs` and `scripts/batch1-qa-fixes.mjs` (tagged with QA / OBS ids; idempotent).
- After changing rules, run in this order: `node scripts/content-rules.mjs` → `node scripts/batch1-page-fixes.mjs` → `node scripts/batch1-qa-fixes.mjs` → `node scripts/content-rules.mjs`. The last run must report `changed 0`.
- Direct edits to a page's JSON or `.ts` file are fine for one-off copy changes.
- The checks live in `scripts/checks/`. `claims-patterns.json` holds the claim patterns and the allow-list; every allow entry needs a written reason.

## Safety

- Don't open `/thank-you-estate-quote/` or `/thankpage-schedule/` on the live site: loading them can count as an Ads conversion.
- Don't submit test enquiries into the live database. To test forms, run locally with the keys blanked: `SUPABASE_SERVICE_ROLE_KEY= RESEND_API_KEY= npx next start -p 3101`.
- Don't change Google Ads / GA4 / GTM settings, DNS, or production WordPress.
- Never remove a URL or add a redirect without the Search Console review (`docs/client/batch-1/redirect-proposal.md`).
- Never print or commit `.env.local` / `vercel.env`.

