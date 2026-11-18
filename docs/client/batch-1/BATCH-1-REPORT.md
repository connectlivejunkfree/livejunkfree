# Batch 1 report: first 50 pages, with the 18 Nov 2026 answers and Manisha's follow-up applied

Branch `batch-1-fixes`. Sources:
- `LJF_Akshat_Implementation_Register_v1_2026-11-12.xlsx`
- `LJF_Akshat_Point_by_Point_Answers_18_Nov_2026.pdf`

Row-by-row status is in `LJF_Implementation_Register_v1_WORKING.xlsx`. **This is a reviewable preview. It is not a production launch.** Production cutover needs the joint approval in E.7.

## Status

| Register rows | DONE | NEXT-BATCH | BLOCKED-ACCESS | TODO-BEFORE-LAUNCH | N/A |
|---|---|---|---|---|---|
| 156 OBS rows | 136 | 7 | 12 | – | 1 |
| 15 Global Fixes | 13 | – | 1 | 1 | – |

- **DONE:** fixed. For the business-claim rows, the approved wording from the answers is now on the site (`NAV-CONFIRMATIONS.md` gives the answer reference for each row).
- **NEXT-BATCH (7):**
  - copy-overlap reduction between page pairs whose roles E.2 has now decided: OBS-82, 92, 102, 111
  - three concise FAQ rewrites: OBS-99, 107, 129

  The unsupported claims on these pages are already removed.
- **BLOCKED-ACCESS (12 photo rows + G10):** Nav approved the Drive folders (C.1). Google Drive isn't connected for the developer yet, so no photos have been placed. See `MEDIA-NEEDED.md`.
- **TODO-BEFORE-LAUNCH (G15):** the editor/CMS is required and in scope (E.5). The plan is in `docs/CMS-OPTIONS.md`. It hasn't been built yet.

## Manisha's follow-up (18 Nov 2026)

| Point | On the site now |
|---|---|
| Same-day | "Same-day pickup may be available depending on the job, location and crew availability." Used everywhere the same-day sentence appears: pages, header menu, schema, llms.txt. |
| Weekends | "Weekend pickups are available, subject to scheduling." It's part of the scheduling sentence. Evening, after-hours and overnight work shown as standard or included (143 strings) is replaced with that sentence. Wording that already says "may be available" stays. |
| Phone hours | "Phone hours: 7 am–11 pm." Shown in the footer on every page, the contact page, the quote sections and llms.txt. The schema has no opening hours, because the days weren't stated. |
| Taxes | "Displayed load rates exclude applicable taxes." Shown under the price on the truck, on every price block (148 pages), on the couch and pricing pages, and in the schema Offer. 377 strings that said disposal, fuel or labour are included in the price are removed. The couch price card no longer lists disposal or disassembly as included. |
| Guarantee, recycling %, data destruction / shredding, permits | All removed (see the rules table). Permits use the B5.9 sentence. |
| Structural / attached demolition | "Structural or attached demolition work is subject to assessment and isn't guaranteed for every project." 43 universal claims are replaced, including load-bearing-wall copy that had been pasted onto the TV and wall-unit pages. |

## What the 18 Nov answers changed

| Answer | On the site now |
|---|---|
| **A1** Nav's price card | All 13 Junk Load tiers (1/16 = 1 yd³ = C$125 … Full = 16 yd³ = C$655) and all 7 Bed Load tiers, exact. The labour note is shown only for its own load type. Pages for standard junk removal say "Junk Load from C$125 (1/16 load, 1 cubic yard)". Cleanouts, demolition, bed bug, hot tub, mattress, appliances, e-waste, piano, water tank, carpet, shed and commercial specialist pages say "Contact us for a quote based on the items, access and removal requirements." The schema `minPrice` follows the same rule. Third-party amounts, such as a $500 city fine, are never used as our price. |
| **A1 pricing language, B1.4** | The approved pricing paragraph, plus the extra-handling and taxes sentence, is used wherever a page promised an all-in price. Removed: "all-inclusive", "no hidden fees", "what we quote is exactly what you pay", "one price covers everything", "price locked in", "no stair / fuel surcharges", "dismantled at no extra charge". |
| **A1.8, B1.2** | 10% only for items already at the curb or driveway, with "Ask our team to confirm offer eligibility." All other discounts and promotions are removed. |
| **A3, E.6** Forms and email | The pickup date and arrival-window pickers are replaced by an optional **preferred callback time**, which doesn't book anything. Your exact three email templates are used. The team notification goes to `LEAD_NOTIFY_EMAIL`, CC `LEAD_CC_EMAIL`. Statuses: New / Contacted / Confirmed / Closed. The confirmation email is sent only from /admin, after the phone call. There's no calendar invite. |
| **A4.1, D.3** | Google Tag Manager loads only on `livejunkfree.ca`, so the preview can't fire live conversions. The `generate_lead` event fires once per enquiry. |
| **B1.3** | "Quote from photos within minutes / no onsite visit" is replaced with the free-onsite-estimate wording. |
| **B2.1–B2.3** | The same-day sentence (as updated in the follow-up). No 24/7, no response times, no durations, no deadline guarantees. Phone hours come from the follow-up. |
| **B3.1–B3.3** | "Licensed and insured. Commercial customers and property managers can contact our team about documentation." Certificate-of-insurance and WSIB promises are removed. "We take care when moving items…" replaces floor runners, padding and zero-damage promises. |
| **B4** | "We aim to recycle or donate suitable items where practical…". No "certified", R2, percentages or donation receipts. |
| **B5** | Approved scope wording for data (pickup only, no erasure certificates), shredding, medical offices, appliance and utility disconnection, hot tubs, water tanks, permits, demolition, concrete and site work (no excavation or grading), carpet, office, warehouse and piano. No photo-documentation or compliance-report promises (B5.18). |
| **B6, B7** | Cleanout scope, retained items, building access, the eviction lawful-possession sentence, light cleanup only if agreed (B6.2), no biohazard work. Bed bug: the confirmed handling (B7.1), with Call as the primary button and the form lower on the page (B7.3). |
| **B8** | No review counts or numeric counters (including "250+ happy clients"). "Serving [town] and surrounding areas". No "across Canada". No street address in the schema. |
| **E.1, E.3, E.4** | Both bed bug pages kept and self-canonical. Both Markham URLs kept. All 788 URLs kept, with no redirects added. |
| **D.6** | Old production mattress URL, checked 18 Nov: **HTTP 301 with an empty `Location` header**. That's a broken redirect on WordPress, not a loop. No second redirect was added. |

## Site-wide rules (`scripts/content-rules.mjs`, all 784 content files, re-runnable)

The table counts strings that match each rule. "Before" is the original content imported from WordPress (git HEAD). "After" is the current content. Full counts are in `content-rules-report.json`.

| Rule | Answer | Before | After |
|---|---|---|---|
| Same-day promises → approved wording | B2.1 | 2,622 | 23 (already qualified, or URLs / image filenames) |
| Review counts, "N+ happy clients" | B8.1, B8.2 | 1,652 | 0 |
| All-in pricing, in other words | A1.4, A1.7, B1.4 | 918 | 0 |
| Price scope ("from C$125" only where the card prices it) | A1.3, A1.6 | 868 | 0 |
| $125 → the single `{{min_price}}` source | A1.3 | 717 | 0 |
| "No hidden fees", "all-inclusive", "tax included" | B1.4 | 691 | 0 |
| "Disposal / fuel / labour included in the price" | Follow-up (taxes), A1.4 | 377 | 0 |
| Old hours ("6AM–11PM", "7 days a week"), 24/7 scheduling | B2.3 | 561 | 0 |
| 30–50% cheaper | B1.1 | 552 | 0 |
| "Canada" claims | B8.4 | 493 | 8 (legal / privacy text) |
| "Certified" recycling, percentages, zero landfill | B4.2, B4.3 | 351 | 4 (the data-security disclaimer) |
| "Demo slots" CTA | R7 | 350 | 0 |
| Photo / damage documentation, LTB evidence, "ready for the landlord's inspection" | B5.18, B6.2 | 331 | 0 |
| Certificates of insurance, WSIB | B3.1 | 305 | 0 |
| One-off fixes (CTAs, typos, headings, alt text, dangling price labels, broken FAQ items) | G03, G04 | 307 | 0 |
| Evening / after-hours shown as standard | Follow-up (weekends), B2.2 | 143 | 0 |
| Fixed durations | B2.1 | 189 | 0 |
| "No extra charge" for labour, disassembly, disconnection | A1.7 | 147 | 0 |
| Specialist claims (data, refrigerant, permits, structural…) | B5 | 138 | 0 |
| Instant / photo quotes, "within minutes" | B1.3 | 131 | 0 |
| One-minute / 60-second response | B2.3 | 124 | 0 |
| Lease-ready / inspection-ready | B6.2 | 123 | 0 |
| Promotions (bulk, multi-unit, multi-service, price-match, bundle) | B1.2 | 109 | 0 |
| Structural / attached / load-bearing demolition offered universally | Follow-up, B5.10 | 43 | 0 |
| Floor runners, padding, wall protection | B3.3 | 81 | 0 |
| Zero / no damage | B3.3 | 67 | 0 |
| Obsolete prices ($75, $99, $255, $249, $225, $200–$500) | A1.5, A1.6 | 63 | 0 |
| Deadline / timeline guarantees | B2.1, B3.2 | 37 | 0 |
| Satisfaction guarantee | B3.2 | 30 | 0 |
| Superlatives ("most recommended"…) | B8 | 20 | 0 |
| Deep cleaning / biohazard work as a service | B6.2, B6.7 | 20 | 0 |
| Donation receipts | B4.4 | 13 | 0 |
| Excavation / site grading | B5.10 | 10 | 0 |
| Free after-hours | B2.2 | 5 | 0 |
| Broken / staging links | G07 | 8 | 0 |

**The approved wording lives in one file,** `content/business-facts.json`. Pages reference it as `{{fact:key}}`, so changing a sentence there updates every page on the next build. The per-page fixes for B1-03 to B1-50 are in `scripts/batch1-page-fixes.mjs`, each tagged with its OBS id.

## Pricing truck

- **Source:** `content/pricing.json`, Nav's card exactly. "Displayed load rates exclude applicable taxes" shows under every price.
- **What it shows:** a Junk Load / Bed Load switch, the LJF logo on the truck, the selected fraction, the cubic yards, the price and that schedule's labour note. It also shows the approved pricing paragraph, the extra-charges sentence, free onsite estimates, the 10% curbside note, Call and Get a quote.
- **Into the enquiry:** Get a quote passes the selection, e.g. "Junk Load: 1/4 (4 cubic yards, C$265)".
- **Checked at 1440 px and 360 px:** tapping 1/4 shows 1/4 Junk Load, 4 cubic yards, C$265, and the truck fills to 25%. Bed Load shows 7 sizes. Arrow keys work. Tap targets are at least 44 px. No overflow.
- **Docs:** `docs/PRICING.md` explains how to change a price.

## Enquiry and confirmation emails

The full guide is in `docs/EMAILS.md`.
- **Templates:** `content/emails.json` holds your three templates word for word.
- **Who gets what:** the customer gets the acknowledgement. The team gets the notification with:
  - submission ID, Toronto timestamp, status and source page
  - contact details, service and city/address
  - requested callback time, marked "not a pickup booking"
  - pricing-truck choice, description, and a sign-in link to the photos
- **After the phone call:** staff use /admin → **Mark confirmed & send confirmation** (or **Update & resend confirmation**). Each email is sent once, even if the button is pressed twice.
- **Test mode stays on:** every email goes to the test inbox with a `[TEST → …]` subject until Manisha's controlled test (E.6) passes.
- **Domain records:** `RESEND-DNS-RECORDS.md` is for the domain administrator. It touches the `send.` subdomain only and leaves the root MX alone.

## Final QA (18 Nov 2026, after all answer changes)

| Check | Result |
|---|---|
| Rendered-page scan, all 787 pages plus `llms.txt` / `llms-full.txt` (visible text, title, description, JSON-LD): every banned phrase in the answers (prices, all-in wording, old hours, 24/7, guarantees, certified / %, counts, Canada, instant quotes, promotions, unresolved tokens) | **0 found** |
| FAQ integrity | 0 FAQ questions replaced by a label; 0 empty questions. Items whose question carried a removed claim were dropped (27) |
| Second scan for B3–B8 (COI, floor runners, receipts, shredding, permits, deep cleaning, biohazard, valuables, counters) | 0 claims. The remaining matches were checked by hand: disclaimers ("we don't provide…"), "tell us about hazardous items", and blog advice |
| Devices: 196 runs (49 pages × 360 / 390 / 768 / 1440) | 0 overflow, 0 wrong `tel:`, 0 dead anchors, 0 JS errors, 0 JSON-LD errors, 0 pages with more than one FAQPage, 0 tap targets under 44 px. Text under 16 px only on desktop cards (15 px), 0 on phones and tablets |
| Forms, local server with the database and email keys switched off (nothing saved or sent; thank-you pages and Google tags blocked) | Home, estate, business, deck, Aurora city page and /contact/ booking all send service, detail, city, page and truck choice, plus `callback_time`. Booking works with no date or window. The rate limit (5 per 10 minutes) works |
| Link crawl | 789 internal links on 788 pages, 0 broken (`url-inventory.csv`) |
| Structured data, one page per template | Required properties present; one FAQPage; `minPrice` 125 only on priced pages; no openingHours, aggregateRating or street address |
| TypeScript, lint, production build (801 pages) | Clean |
| Lighthouse (mobile; run on the earlier Batch 1 build, before the answer changes, which were copy only) | Performance 84–94, Accessibility 100, Best Practices 100. SEO is lowered only by the review-mode `noindex` |

Screenshots: `evidence/<page>-before|after-390|1440.jpg` (196 files).

## Still needed

| Item | From | Goes into |
|---|---|---|
| Google Drive access to "Before and after pics" and "Jobs" (C.1) | Manisha / Nav | `MEDIA-NEEDED.md` |
| Nav's exact form-notification inbox, copied from the WordPress form settings (A3.1, D.1) | WordPress access (D.1) | Vercel `LEAD_NOTIFY_EMAIL` |
| Resend DNS records added at Hostinger (A2.1, D.4) | Domain administrator | `RESEND-DNS-RECORDS.md` |
| Controlled test, one per form template (E.6) | Manisha | `docs/EMAILS.md` → Controlled test |
| Search Console export before any consolidation (D.2, E.3, E.4) | Manisha | `redirect-proposal.md` |
| CMS demo before launch (E.5) | Developer | `docs/CMS-OPTIONS.md` |
| Later verification: operating hours, review count/widget, recycling partners, insurance documents, tax and surcharges, Bed Load classification | Nav | `NAV-CONFIRMATIONS.md` → Still open |
