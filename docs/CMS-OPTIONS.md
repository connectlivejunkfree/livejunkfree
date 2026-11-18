# Editing without a developer: CMS options

The audit (G15, R16, T14) asks that Manisha can change body copy, images, FAQs, SEO titles and descriptions, add a new landing page, and publish and roll back without a developer. **Answers E.5 (18 Nov 2026): this is required before launch and is part of the agreed scope, not a paid extra. A demonstration of the editing workflow goes in the handover. Nothing below is built yet.**

## How content works today

- Every page is a JSON file in `content/pages/…` and `content/blog/…`, about 780 files. Each holds the title, SEO fields, and a list of sections and blocks (headings, paragraphs, lists, cards, FAQs, images).
- Business claims live in `content/business-facts.json`, prices in `content/pricing.json`, and email wording in `content/emails.json`.
- The designed pages (home, services, couch, estate, business cleanout, deck, Toronto, How It Works, Contact, About) take their copy from `content/designed/*.ts`.
- Publishing works like this: a change is committed to GitHub, Vercel builds and deploys it (about 2–3 minutes), and every deploy can be rolled back instantly.

All three options below are **git-based**: they edit those same files and commit to GitHub. The site, hosting and rollback stay exactly as they are, with no extra database.

| | **Keystatic** | **TinaCMS** | **Decap CMS** |
|---|---|---|---|
| How editors sign in | GitHub account, via free Keystatic Cloud | Tina Cloud account | GitHub OAuth (needs a small auth proxy) |
| Editing experience | Clean forms; good for structured JSON like ours | Forms plus visual editing next to the live page preview | Older form UI; fewest features |
| Fits our JSON block structure | Yes: arrays of typed blocks map directly | Yes, but visual editing would need extra work for our block renderer | Yes, with list and object widgets; clunkier for nested blocks |
| New landing page from a template | Yes (collections) | Yes | Yes |
| SEO title / description / FAQ fields | Yes | Yes | Yes |
| Images | Uploads to the repo (`public/images/…`) | Repo or Tina media | Repo |
| Cost (check current pricing) | Free: Keystatic Cloud free tier covers a few editors | Free tier for small teams; paid plans add users and editorial workflow | Free and open source |
| Long-term risk | Actively maintained (Thinkmill) | Actively maintained; partly commercial | Maintained, but slower development |

## Recommendation: Keystatic

- It reads and writes the JSON files we already have, so nothing needs migrating.
- Free for a small team, with sign-in through GitHub (each editor needs a free GitHub account added to the repository).
- Typed forms for every block type stop malformed pages being published. The build also validates every file, and a bad file fails the build instead of reaching the live site.

### Effort (estimate)

| Step | Effort |
|---|---|
| Keystatic setup, sign-in, `/keystatic` admin route | ½ day |
| Schemas for page metadata (title, H1, SEO, canonical) and FAQ blocks | ½ day |
| Schemas for all content block types (heading, paragraph, list, cards, steps, images, CTAs) | 1–2 days |
| Collections: service pages, location pages, blog posts, landing page template | 1 day |
| Designed pages: move their copy from `.ts` to JSON so they become editable | 1–2 days |
| Business facts / pricing / email wording editors | ½ day |
| Hands-on handover: edit → preview → publish → roll back, recorded (T14) | ½ day |
| **Total** | **about 5–7 days** |

## Backup and rollback (today, no CMS needed)

- **Every change is a git commit,** so the full history is on GitHub and any file can be restored (`git revert <commit>`).
- **Every deploy is kept on Vercel.** In Vercel → Deployments, open a previous deploy → ⋯ → **Promote to Production** (Instant Rollback). This takes seconds and needs no rebuild.
- **Leads and email history are in Supabase** (`leads`, `lead_photos`, `email_log`), with daily backups on paid Supabase plans. On the free plan, export regularly (Table editor → Export to CSV).

## Handover demo script for Manisha (QA 18 Nov, P1 release gate "Handover")

Run this once the editor is built, as a 30-minute screen share, recorded for the handover pack. Each step lists what Manisha does and what should happen. Use a test page (for example a copy of `/services/residential-junk-removal-services/couch-removal-services/`) so nothing live changes during the demo.

| # | Manisha does | What she should see |
|---|---|---|
| 1 | Sign in at `/keystatic` with her GitHub account | The list of page collections: services, locations, blog, landing pages, business facts |
| 2 | **Edit a page:** open the test page and change one paragraph | The form shows the page's sections; the paragraph is a plain text field |
| 3 | **Edit an FAQ:** change an answer, and add a new question and answer | The FAQ block lists each question as a pair of fields |
| 4 | **Change an image:** upload a new photo and write its alt text | The image is stored with the page; the alt field is required |
| 5 | **Change SEO fields:** edit the SEO title and meta description | Character guidance shows (about 60 for the title, about 155 for the description) |
| 6 | **Preview:** save the change as a branch | A Vercel preview link appears in a couple of minutes; the change shows on the preview only |
| 7 | **Check before publishing:** on the preview, `npm run check:content` runs automatically (GitHub check) | A claim the 18 Nov answers rule out (for example "guaranteed same-day") fails the check and blocks publishing |
| 8 | **Publish:** merge the change | The live site updates in about 2–3 minutes |
| 9 | **Roll back:** Vercel → Deployments → the previous deployment → Instant Rollback | The live site goes back to the previous version within seconds |
| 10 | **Add a landing page:** create a page from the landing-page template (H1, intro, CTA, FAQ, SEO) | A new URL on the preview, with the quote form and the phone button already in place |
| 11 | **Change a business fact:** edit the phone hours in business facts | Every page that shows the phone hours updates on the next deploy |
| 12 | **Change a price:** edit one rate in pricing | The truck, "Junk Load from C$…" and the schema all update. `pricing-check` then flags the difference from Nav's approved card until the card record is updated too |

Done when Manisha has done steps 2–9 herself, without help.
