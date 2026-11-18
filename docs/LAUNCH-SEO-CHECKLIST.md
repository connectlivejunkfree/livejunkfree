# Launch SEO checklist (QA 18 Nov, P1 release gate "SEO migration")

This is for the production cutover. It is **not a launch approval**: cutover needs the joint sign-off in E.7, and the DNS switch needs separate approval and a back-out plan (D.4). Each step says how to check it.

## 1. Before the switch (on the preview)

| # | Check | How | Pass when |
|---|---|---|---|
| 1 | Content checks | `npm run build && npm run check:content` | All checks pass: claims, page structure, acceptance, pricing, tracking, email |
| 2 | Every old URL still resolves | `docs/client/batch-1/url-inventory.csv` plus the crawl (`scripts` in the QA notes) | 788 routes return 200, or 301 for the 4 existing redirects in `content/redirects.csv`; 0 broken internal links |
| 3 | Search Console export reviewed | Pages, clicks, queries, indexing, backlinks (D.2) | Each candidate in `docs/client/batch-1/redirect-proposal.md` has a decision. Nothing is consolidated without this |
| 4 | Redirect map (proposal only until approved) | `content/redirects.csv`, plus any approved rows from `redirect-proposal.md` | Each row: old path → new path, 301. No chains, no loops. The old mattress URL is fixed: production today returns 301 with an **empty** `Location` header (D.6) |
| 5 | Schema validation | Google Rich Results Test and validator.schema.org, on one page per template: `/`, `/services/`, a service page, a cleanout page, a demolition page, `/locations/toronto/`, a location × service page, a blog post | No errors. One FAQPage per page. `minPrice` only on standard junk-removal pages. No `aggregateRating`, opening hours or street address |
| 6 | Canonicals | View source on the pages above | `<link rel="canonical">` is the production `https://livejunkfree.ca/...` URL of the page itself (already true on the preview) |

## 2. At the switch

| # | Setting | Value |
|---|---|---|
| 7 | `NEXT_PUBLIC_REVIEW_MODE` in Vercel (Production) | `false`, or remove it. This turns off the site-wide `noindex, nofollow` and the `Disallow: /` in robots.txt |
| 8 | `NEXT_PUBLIC_SITE_URL` | `https://livejunkfree.ca` |
| 9 | `NEXT_PUBLIC_GTM_HOSTS` | Leave unset (default `livejunkfree.ca,www.livejunkfree.ca`), or set it to exactly those |
| 10 | Domain | Add `livejunkfree.ca` and `www.livejunkfree.ca` in Vercel. Point DNS as Vercel shows (D.4). Pick one host and redirect the other to it |

## 3. Straight after the switch (production)

| # | Check | How | Pass when |
|---|---|---|---|
| 11 | robots.txt | `curl -s https://livejunkfree.ca/robots.txt` | `Allow: /`; `Disallow` only for `/review/`, `/admin/`, `/api/` and the two thank-you pages; a `Sitemap:` line |
| 12 | No `noindex` on public pages | `curl -s https://livejunkfree.ca/ \| grep -i noindex` (and a service page) | No match. Thank-you pages keep `noindex` |
| 13 | Sitemaps | `https://livejunkfree.ca/sitemap.xml` and its 4 child sitemaps | Every built page, production URLs only, no preview host |
| 14 | Old URLs | Re-run the crawl against production with the URL inventory | Same results as step 2 |
| 15 | Search Console | Submit `sitemap.xml`; inspect the home page and 3 service pages | "URL is available to Google" |
| 16 | Tracking | Manisha's controlled test (E.6), one per form template | One `generate_lead` per enquiry; none on loading or refreshing a thank-you page; Ads conversion recorded once |
| 17 | Lead delivery | Same test | Lead stored with service, detail, city and page. Internal email to Nav + info@ (CC Manisha). Acknowledgement received; it says the team will call and does not confirm a time |
| 18 | Email sending | Resend domain verified (`RESEND-DNS-RECORDS.md`) | `EMAIL_FROM` set to the domain sender; `EMAIL_TEST_MODE=false` only after step 17 passes |

## 4. Rollback

- Vercel → Deployments → the previous deployment → **Instant Rollback** (seconds).
- DNS back-out: restore the DNS records exported before the switch (D.4). The old WordPress site stays running and recoverable until the new site is accepted (E.7).
