# Redirect proposal (PROPOSAL ONLY, not implemented)

The audit (rule 4, T02, T03) says to keep every URL until Google Search Console data, backlinks and traffic have been reviewed. **No URL was removed, merged or redirected in Batch 1.** This lists the candidates so the decision is quick once the Search Console export arrives (Part 2 D #2).

## Already in place (from the old site, unchanged)

`content/redirects.csv` holds the redirects the old WordPress site already had: 4 permanent redirects (`apartment-cleanouts-in-newmarket`, `junk-removal-services-in-georgina`, `-whitby`, `-woodbridge` → their current pages) and the 410s for removed test pages. The full list of old-site URLs was checked in an earlier round: all 759 old sitemap URLs resolve on the preview (755 directly, 4 via those redirects).

## Candidates to review after Search Console

| Pair / group | Today | Options | What decides it |
|---|---|---|---|
| `/bed-bug-furniture-removal/` (ad landing) vs `/services/residential-junk-removal-services/bed-bug-furniture-removal-services/` | Both live. Distinct roles: ad landing is call-first; service page is long-form | Keep both; set the ad landing to `noindex` if Ads is its only purpose | Which URL the Ads point to, and whether the landing has organic traffic (Part 2 E #1) |
| `/locations/apartment-cleanouts-in-markham/` vs `/locations/markham/apartment-cleanout-services-in-markham/` | Both 200, self-canonical, **same title** | Keep the one with clicks and backlinks; 301 the other to it | Search Console clicks and impressions for each (OBS-139) |
| `/services/junk-cleanout-services/garage-cleanout-services/` vs `/services/residential-junk-removal-services/garage-junk-removal-services/` | Both live; overlapping intent | Keep both with distinct roles (whole garage vs selected items) | Client approval (Part 2 E #2), then queries for each |
| Office Cleanouts vs Office Furniture Removal; Business Cleanout vs Warehouse / Retail; Computer Removal vs E-Waste | All live | Keep all with distinct roles | Client approval (Part 2 E #2) |
| `/locations/cleanout-services-in-pickering/` vs `/services/cleanout-new-landing/cleanout-services-in-pickering/` | The landing copy is already `noindex` | Keep the landing as an Ads destination only | Which URL the Ads use |
| `/locations/nobleton/hoarding-cleanouts-in-nobleton/` vs `…-nobleton-2/` | Both live, distinct titles | Merge into the original with a 301 if `-2` has no traffic | Search Console |
| 536 location × service pages | All live | Keep, merge or `noindex` per group | Search Console, by service × town (Architecture Decisions) |

## How a redirect would be added

Add a row to `content/redirects.csv` (`from,to,301,manual`). The site applies it at build time. Each change should be tested for a single hop, with no chains and no 404s (T03).
