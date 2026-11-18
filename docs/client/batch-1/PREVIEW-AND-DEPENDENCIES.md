# Live Junk Free: Batch 1 preview and remaining dependencies (18 Nov 2026)

**Preview:** `PREVIEW_LINK`. This is the Vercel preview for branch `batch-1-fixes`. It's for review only: not indexed, it doesn't fire Google Ads or GA4 conversions, and test emails go to a test inbox only. **It is not a production launch.**

## What's in the preview

- **Your 18 Nov answers and follow-up,** applied to the first 50 pages and to the shared content and templates. That covers all 784 content pages, not only the 50 sampled.
- **Pricing truck:** Nav's exact rate card, with separate Junk Load (13 sizes) and Bed Load (7 sizes) modes, the LJF logo, cubic yards, the price and the labour note. "Displayed load rates exclude applicable taxes" shows under the price, along with the 10% curbside note.
- **Pricing wording:**
  - "Junk Load from C$125 (1/16 load, 1 cubic yard)" appears only on standard junk removal pages.
  - Cleanouts, demolition and specialist items say "Contact us for a quote…".
  - No "all-inclusive", "no hidden fees" or "disposal included" wording anywhere.
- **Scheduling:**
  - "Same-day pickup may be available depending on the job, location and crew availability."
  - "Weekend pickups are available, subject to scheduling."
  - "Phone hours: 7 am–11 pm."
  - No 24/7, response-time or deadline promises.
- **Removed:**
  - the satisfaction guarantee
  - recycling percentages and "certified" claims
  - data-destruction and shredding claims
  - permit-handling promises
  - review counts and numeric counters
  - certificates of insurance, floor-runner, photo-documentation and donation-receipt promises
- **Structural or attached demolition** is described as "subject to assessment and isn't guaranteed for every project."
- **Forms:**
  - The base fields are unchanged.
  - The pickup date and time pickers are replaced by an optional preferred callback time, which doesn't book anything.
  - Each enquiry carries the page, service, city and truck choice.
- **Emails,** using your three templates word for word:
  - The customer gets the acknowledgement.
  - The team gets a notification with a New / Contacted / Confirmed / Closed status.
  - Staff send the pickup confirmation from /admin, only after the phone call.
- **No URLs removed and no redirects added.** The old site and its forms are unchanged.

The full status of every register row is in the attached `BATCH-1-REPORT.md` and `LJF_Implementation_Register_v1_WORKING.xlsx`. The wording used for each claim is in `NAV-CONFIRMATIONS.md`.

## Technical dependencies (what we need to go further)

| # | Needed | From | Why | Answer ref |
|---|---|---|---|---|
| 1 | **WordPress admin access or an export of the form notification settings.** Least-privilege access, and not by WhatsApp | Manisha | To copy Nav's exact form-notification inbox. The new forms then notify Nav's inbox + info@livejunkfree.ca, with Manisha CC'd | A3.1, D.1 |
| 2 | **Three DNS records added at Hostinger** (attached: `RESEND-DNS-RECORDS.md`) | Domain administrator, via Manisha / Nav | Lets the website send its emails from livejunkfree.ca. It uses a `send.` subdomain only: the existing email, the root MX records and the live website are untouched | A2.1, D.4 |
| 3 | **A date for the controlled test,** one test per form template | Manisha | Checks both inboxes, the customer acknowledgement, the confirmation email, the saved enquiry and Google Ads de-duplication. The estate thank-you page is opened only during this test | E.6, D.3 |
| 4 | **Google Drive access to "Before and after pics" and "Jobs"** | Manisha / Nav | To place real job photos. Every image will be inspected, and faces, addresses and plates masked | C.1–C.4 |
| 5 | **Google Search Console access or export** (pages, clicks, queries, indexing, backlinks) | Manisha | Required before any page consolidation, canonical change or redirect | D.2, E.3, E.4 |
| 6 | **Account ownership confirmed:** GitHub, Vercel, Supabase, Resend, Turnstile | Manisha / Nav | Hosting and data should be owned by LJF. Note: Vercel's free plan is for non-commercial use, and Supabase's free plan has no daily backups. No paid plan will be started without your approval | D.5 |

## Not blocking the preview (to add later once verified)

- A verified Google review count and rating, or a permitted review widget (B8.1, C.5)
- Named recycling or donation partners (B4.2)
- Insurance documents for commercial customers (B3.1)
- Which days the 7 am–11 pm phone hours apply to, so they can go into Google's business data
- Whether Bed Load can be linked to the bed bug page (A1.2)

## Developer work remaining before launch

- Editor/CMS, so you can change text, FAQs, images and SEO and add landing pages without a developer, with a demo in the handover (E.5).
- Seven register rows:
  - reducing copy overlap between the page pairs whose roles you've confirmed (E.2)
  - three short FAQ rewrites
- The launch checklist:
  - route and redirect mapping, canonical/indexing rules and sitemap
  - verified email sending and lead delivery, and conversion de-duplication
  - a rollback plan that keeps the current live forms and Ads destinations working

No DNS switch or production publish without explicit joint approval (E.7).
