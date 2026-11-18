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
