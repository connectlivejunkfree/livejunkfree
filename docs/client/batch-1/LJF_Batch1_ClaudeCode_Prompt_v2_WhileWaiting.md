# Claude Code prompt v2: Batch 1 while we wait for the client's answers

Paste everything below the line into Claude Code at the repo root, on branch `batch-1-fixes`. The audit files must be in `docs/client/batch-1/`. This replaces the earlier prompt.

---

## Context

The client (Manisha, content/SEO; Nav, owner) audited the first 50 pages of the preview (`https://livejunkfree-phi.vercel.app`). Read **every line** of:
- `docs/client/batch-1/LJF_Akshat_Detailed_Page_Change_Directions_v1_2026-11-12.docx`
- `docs/client/batch-1/LJF_Akshat_Implementation_Register_v1_2026-11-12.xlsx` (all sheets; this is the source of truth)

We have sent the client a list of questions (see `docs/client/batch-1/LJF_Info_Needed_Part1_Urgent.pdf` and `Part2.pdf` if present). **Nav's rate card and the answers have NOT arrived.** In this round, do everything that doesn't depend on those answers, and build it so that each answer is a **one-file change** when it arrives.

## Hard rules (from the audit; breaking any of these fails the batch)

1. Don't touch production: no edits to the live WordPress site, no publishing, no URL removals or redirects, no changes to Google Ads/GA4/GTM settings.
2. Don't invent facts. The only confirmed business facts are:
   - **R4:** "Licensed and Insured" (no extra coverage claims).
   - **R5:** "Free Onsite Estimates".
   - **R6:** 10% off **only** when items are already placed curbside or in the driveway.
   - **R3:** bed bug work = furniture wrapping, removal and disposal. **Never** pest-free, extermination, sterilisation or 100% containment.
   - **R2:** realistic scheduling, with no guaranteed completion dates.
   - **R9:** "Serving [city]", never a local office or crew.
   - **R1:** no "30–50%". Use value wording with no number until Nav provides the comparison.
   - Phone: `tel:+16479225865` (display "+1 647 922 5865").
3. Every claim marked BUSINESS CONFIRMATION / "HOLD CLAIM" in the register is removed or softened **now**, exactly as the register's ACTION column says. Log it (see step 1).
4. Keep every URL exactly as it is. No deletions, merges or redirects (the client decides after the Search Console review).
5. Don't open `/thank-you-estate-quote/` or any thank-you page. Don't submit real forms. Test only with clearly marked `TEST` data on the preview, and don't trigger conversions (step 7).
6. Visible copy, title, meta description, H1, FAQ and JSON-LD must all agree. One FAQPage per page.
7. No new photos from Google Drive this round (not reviewed or permitted yet). Fix wrong or mislabelled images using existing approved site images, or remove them.
8. Staging `noindex` stays on the preview.

---

## Step 1: Business facts in one file (do this first)

Create **`content/business-facts.json`** as the single source for every claim that is waiting on Nav. Every template, FAQ and JSON-LD reads from it, so no claim text is hard-coded anywhere. Each fact has a `status` (`confirmed` | `pending` | `removed`) and the safe wording to use while pending. For example:

```json
{
  "phone": { "status": "confirmed", "display": "+1 647 922 5865", "tel": "+16479225865" },
  "licensedInsured": { "status": "confirmed", "text": "Licensed and insured" },
  "freeOnsiteEstimates": { "status": "confirmed", "text": "Free onsite estimates" },
  "curbsideDiscount": { "status": "confirmed", "text": "10% off when items are already placed at the curb or in the driveway" },
  "minimumPrice": { "status": "pending", "value": 125, "text": "Starting from C$125 for small loads; final price confirmed at your free onsite estimate" },
  "sameDay": { "status": "pending", "text": "Same-day service may be available, subject to scheduling" },
  "competitorComparison": { "status": "pending", "text": "Honest, upfront pricing", "percent": null },
  "reviews": { "status": "pending", "count": null, "rating": null, "asOf": null },
  "stats": { "status": "pending", "jobs": null, "clients": null, "years": null },
  "businessHours": { "status": "pending", "text": "7 days a week, 6 AM – 11 PM" },
  "recycling": { "status": "pending", "text": "We recycle and donate where possible" },
  "satisfactionGuarantee": { "status": "removed" },
  "specialist": {
    "dataDestruction": "removed", "documentShredding": "removed", "medicalWaste": "removed",
    "refrigerants": "removed", "disconnections": "removed", "structuralDemolition": "removed",
    "permits": "removed", "emergency247": "removed", "r2Certified": "removed"
  }
}
```

(Use the hours, reviews and stats only if they appear consistently on the live site. Otherwise set them to null and hide them.)

Components render nothing when a fact is `removed` or `null`. Also create **`docs/client/batch-1/NAV-CONFIRMATIONS.md`**: for every OBS row you softened or removed, record the ID, page, original claim, current safe wording, which question in the client PDF it maps to (e.g. "Part 1 B-2 #1"), and which key in `business-facts.json` to flip.

## Step 2: Pricing data + truck (built now, numbers later)

1. Create **`content/pricing.json`** with two separate products, `junkLoad` and `bedLoad`. Each has an ordered list of sizes: `{ id, label, fillPercent, price, priceText, fitsText }`. Use placeholders: sizes minimum / 1/8 / 1/4 / 1/2 / 3/4 / full for Junk Load, and a reasonable set for Bed Load. Set `price: null` and `priceText: "Quoted at your free onsite estimate"`, except the minimum, which reads from `business-facts.minimumPrice`. Add `"_status": "AWAITING NAV RATE CARD"`.
2. **Remove every other hard-coded price** across `content/` and `src/`: C$655, $75, $99, $255, $249, $265, $200–$500, "$125 per appliance", and $125 presented as a whole-job price. Everything reads from `pricing.json` / `business-facts.json`. Report the before/after counts.
3. **Upgrade the interactive truck component:**
   - an SVG truck with the **Live Junk Free logo on the side of the box** (use the existing logo in `public/`; keep its proportions; crisp at every size)
   - a "Junk Load | Bed Load" switch
   - selecting a size animates the **fill level** and updates the **load size label** and **price text**
   - accessible: radiogroup, arrow keys, visible focus, `aria-live` price, and a text equivalent of the fill level
   - animation is transform/clip only, ~350ms, respects `prefers-reduced-motion`, no layout shift
   - mobile first: works at 360px with ≥44px tap targets
   - under the truck: "Final price confirmed at your free onsite estimate" + the curbside 10% note (R6) + **Call** (primary on mobile) and **Get a quote**, which passes `pricing_selection` into the form
   - when `price` is null, it shows `priceText`; when real prices are added, it shows them with no code change
4. Write `docs/PRICING.md`: how to enter the rate card into `pricing.json` and what updates automatically (truck, pricing sections, FAQ answers, JSON-LD Offers).

## Step 3: Template-level fixes (Global Fixes G01–G15, rules R1–R16)

Fix at the **source** (shared content, template, component or SEO/JSON-LD builder), then search all ~780 generated pages, not only the 50. Report before/after counts for each:
- `30–50%` / `30-50%`
- "demo slots"
- `livejunkfree.ca.com`, `hostingersite`
- unqualified "same day"
- "1 minute" / "60-second"
- fixed durations ("1–3 hours", "under an hour", "2–4 hours", etc.)
- "zero damage" / "no damage"
- "100%" / "satisfaction guarantee"
- "lease-ready" / "spotless"
- "certified" recycling, percentages, "zero landfill"
- R2 / data wiping / destruction / medical / refrigerant / disconnection / structural / permit claims
- superlatives ("most recommended", "best team")
- raw slugs in titles / breadcrumbs / cards / Service schema
- wrong city names (Ajax title "Bolton", Brampton text "Ajax"; check all 26 towns × all templates)
- copied hoarding text on apartment and house pages
- wrong CTA labels: "Book Your Scrap Metal Now", "Ward Tank", apartment CTA on basement
- "Call us now" links that aren't `tel:`
- the appliances editor note ("Maintains the same environmental focus…")
- "Satisfied Custom", "Commercial30–50%", the leading hyphen in the shed H2, "Why so lazy…"
- duplicate FAQ groups (merge into one per page, keeping FAQPage in sync)

**Forms (G05):** every form defaults to the page's correct service and submits hidden `service`, `service_detail`, `city`, `source_path`, `page_id`, `pricing_selection`. Each service has its own details prompt (e.g. deck size / material / access). Quote CTAs anchor to the page's own `#quote-form`.

## Step 4: Pages B1-01 to B1-50

Go page by page through the Page Directions sheet and **every OBS row** for each page (ACTION + EXPECTED FINAL). CONFIRMED DEFECT and TECHNICAL VERIFICATION rows: fix fully. BUSINESS CONFIRMATION rows: apply the safe version + log it. RECOMMENDED IMPROVEMENT rows: implement where they don't need new facts (consolidating repeated copy, clearer CTAs, page intent splits).

Key items to get right:
- **Bed bug landing:** $99 → minimum in the meta and JSON-LD, no noon cutoff, R3 wording, phone CTA primary with the form kept lower. Its role is separate from the long bed bug service page.
- **Estate, business cleanout, deck, Aurora apartment, Toronto office:** form defaults and service context.
- **Garage Cleanout** (whole space) vs **Garage Junk** (selected items), cross-linked. Also the splits Office Cleanouts / Office Furniture, Business Cleanout / Warehouse / Retail, and Computer (office) / E-Waste (household).
- **Garage Junk FAQ Q4:** a real scrap metal answer.
- **Retail:** remove the wrong gallery.
- **Computer:** fix the mismatched cards.
- **Concrete:** "Swing Set" heading → concrete.
- **Toronto:** office card link.
- **Markham:** keep both apartment URLs and report their status, canonical and intent.
- **Service × city fixes go in the template**, so all 536 combination pages update.
- **Mattress URL (OBS-11):** check whether it loads on the preview and report.

Wherever a photo is wrong and there's no suitable approved image, remove it and add the page to `docs/client/batch-1/MEDIA-NEEDED.md` (page, what photo is needed).

## Step 5: Email system (built and tested in Resend test mode)

1. **Migration** on `leads`: `status` (new / contacted / confirmed / completed / cancelled), `appointment_at timestamptz`, `appointment_window`, `appointment_address`, `appointment_notes`, `confirmed_at`, plus the context fields from step 3. Add an `email_log` table.
2. **On successful submit** (server-side, after the DB insert):
   - an internal notification to `LEAD_NOTIFY_EMAIL` (all fields, signed photo links, source page, link to `/admin`)
   - a **customer acknowledgement** to the customer's email
   
   Retry once, and log failures. The lead is always saved, and the customer never sees an email error.
3. **`/admin`** (Supabase magic link, allow-list `ADMIN_EMAILS`, `noindex`, mobile friendly): a lead list with filters, lead detail with photos, and actions Mark contacted / **Confirm appointment** (date, arrival window, notes) / Reschedule / Cancel / Complete.
4. **Confirm appointment** sends the separate **"Your appointment is confirmed"** email with an `.ics` attachment (America/Toronto). Reschedule and cancel send update/cancellation emails. Make it idempotent so the same action can't send twice. Add a Supabase webhook backup for status changes made in the dashboard.
5. Templates in `src/emails/`: React Email, LJF branding (logo, `#FF691D`, `#242424`, Poppins), plain-text versions, no tracking. **All wording comes from `content/emails.json`** with clearly marked DRAFT text. No reply-time promise, and no arrival-window length until Nav answers (Part 1 A3).
6. **Test mode:** `EMAIL_FROM` defaults to `onboarding@resend.dev`. While `EMAIL_TEST_MODE=true`, **every** email (including customer emails) goes to the test inbox, with the subject prefixed `[TEST → real-recipient]`. Env vars: `EMAIL_FROM`, `EMAIL_REPLY_TO`, `LEAD_NOTIFY_EMAIL`, `ADMIN_EMAILS`, `EMAIL_TEST_MODE`.
7. **Conversion safety (OBS-08):** fire the Ads/GA4 lead event only after a genuine successful submit, once per `lead_id`, and never from loading or refreshing a thank-you page. Add a `NEXT_PUBLIC_ENABLE_GTM` flag, but **leave the current GTM behaviour unchanged** until the client approves (question A4).
8. `docs/EMAILS.md`: the flow diagram, every email, triggers, env vars, how the team confirms an appointment, how to test, and what changes once `livejunkfree.ca` is verified in Resend.

## Step 6: Handover docs (no client input needed)

- `docs/client/batch-1/url-inventory.csv`: every preview URL with template, category, title, canonical, robots, status code and old live URL. Plus `redirect-proposal.md` (**proposal only**, waiting on Search Console).
- `docs/CMS-OPTIONS.md`: Keystatic vs TinaCMS vs Decap for our `content/` structure, with a recommendation, effort and cost, plus the current backup/rollback process (Vercel instant rollback + git revert).
- `docs/OWNERSHIP.md`: every account (Vercel, GitHub, Supabase, Resend, Cloudflare, domain), what it does, current owner, monthly cost, and backups.

## Step 7: QA (without real conversions)

- Playwright with **real device emulation** at 360×800 and 390×844, plus 768 and 1440, on all 50 pages. Wait for lazy images and animations before screenshots.
- Check on every page: no horizontal overflow, mobile menu, sticky call bar, every `tel:` link correct, quote CTAs reach the right form, form fields usable, the truck works by tap, FAQ accordions work by keyboard and touch, text ≥16px, tap targets ≥44px.
- Form tests: run them on the preview with `TEST – LJF QA` data and **GTM blocked in the test browser** (Playwright route-block `googletagmanager.com` / `google-analytics.com` / `googleads`), so no conversions fire. Check the DB row context, both emails in the test inbox, then the admin confirm / reschedule / cancel emails and the `.ics`. For the estate form, check the redirect target only; don't load the page.
- Crawl all internal links (no 404s, no wrong targets). Validate schema on one page of every template. Run Lighthouse mobile on home, the bed bug landing, one service page, one hub, one city page and one service × city page.

## Step 8: Report

- `docs/client/batch-1/LJF_Implementation_Register_v1_WORKING.xlsx`: for every OBS and G row, the status (DONE / DONE-SAFE-WORDING / WAITING-NAV / N/A), preview URL, before/after screenshots in `docs/client/batch-1/evidence/`, and the file(s) changed. Don't mark a page done if its title, meta, FAQ schema or JSON-LD is still wrong.
- `docs/client/batch-1/BATCH-1-REPORT.md`: template vs page fixes, search counts before/after, the QA table, and what is waiting on the client (rate card, Resend DNS, Nav answers, photos, GTM decision, test date).

Work in this order: steps 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8. Make logical commits, push to `batch-1-fixes`, and give me the preview URL. Stop and ask only if something in the register contradicts itself.

---

## When the client answers (for later)

- **Rate card:** "Fill `content/pricing.json` from the attached rate card, set `_status` to confirmed, and recheck the truck, pricing sections, FAQ and JSON-LD."
- **Nav's answers:** "Update `content/business-facts.json` and `content/emails.json` from these answers, restore any confirmed claims listed in NAV-CONFIRMATIONS.md, and rerun QA."
- **Resend domain verified:** "Set `EMAIL_FROM`, set `EMAIL_TEST_MODE=false` in Vercel, and send one authorised test."
