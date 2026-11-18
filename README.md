# Live Junk Free website

This is the new **livejunkfree.ca**. It's built with Next.js and hosted on Vercel, and every page and URL of the old WordPress site is here in the new design. All the text, prices and business facts are plain files in this folder, so you can change them yourself, or ask Claude to change them for you.

> **Status:** reviewed preview (Batch 1). The site is **not launched yet**: livejunkfree.ca still points to the old WordPress site. Launching needs the steps in `docs/LAUNCH-SEO-CHECKLIST.md` and a joint sign-off.

---

## 1. One-time setup on your computer

You need three free programs:

| Program | Why | Get it |
|---|---|---|
| **Node.js 22 LTS** (version 20.9 or newer works) | Runs and builds the website | https://nodejs.org → download "LTS" and install |
| **Git** | Saves changes and sends them to GitHub | Mac: already installed (run `git --version` in Terminal). Windows: https://git-scm.com |
| **Claude Code** (optional) | Lets Claude read and edit the project for you | https://claude.com/claude-code |

Then open **Terminal** (Mac) or **PowerShell** (Windows) and go into this folder. For example, if you unzipped it in Downloads:

```bash
cd ~/Downloads/livejunkfree
```

Install the project's packages (only needed once, and again after an update to `package.json`; takes 1–3 minutes):

```bash
npm install
```

**Settings and keys.** The site reads its settings from two files in this folder:
- `.env`: preview settings, with no secrets.
- `.env.local`: the secret keys (database, email, spam protection). It's included in this folder.

**Never share `.env.local` or `vercel.env` publicly, and never upload them to GitHub** (they're already excluded by `.gitignore`). If you ever need to set up a fresh copy, copy `.env.example` to `.env.local` and fill in the values from Vercel → Project → Settings → Environment Variables.

## 2. Run the website on your computer

```bash
npm run dev
```

Open **http://localhost:3000** in your browser. Pages update as soon as you save a file. Press `Ctrl + C` in Terminal to stop.

## 3. Check your changes before publishing

Always run these two commands before you publish. They take about 2 minutes:

```bash
npm run build
npm run check:content
```

- `npm run build` builds all ~800 pages and **stops if a content file is broken** (for example a missing comma in a JSON file).
- `npm run check:content` runs six automatic checks on the built pages:

| Check | What it catches |
|---|---|
| claims | Wording the 18 Nov answers rule out: guarantees, "same day" without "may be available", "no hidden fees", invented discounts, unverified recycling percentages, data-destruction or permit promises, review counts, and so on |
| page structure | An empty heading, card or FAQ; a gutted page; broken text; raw links like "business-cleanout-services"; a wrong call link; a wrong photo label |
| QA end states | The fixes the independent QA asked for are still in place |
| pricing | Every truck price still matches Nav's rate card |
| tracking | The Google Ads conversion fires only after a real enquiry, once |
| emails | The customer acknowledgement never reads like a confirmed appointment |

Everything should end in **pass / 0 failing**. If something fails, the message says which page and which sentence. Ask Claude to fix it (section 6).

## 4. Publish a change

The website lives on GitHub (`connectlivejunkfree/livejunkfree`). Vercel rebuilds it automatically on every push:

```bash
git add -A
git commit -m "Short description of what you changed"
git push
```

- **Branch `batch-1-fixes`:** builds a private preview (sign in to Vercel to see it).
- **Branch `main`:** updates **https://livejunkfree-phi.vercel.app**, the preview you share. After launch, `main` becomes the live site.
- **Undo a bad publish:** Vercel → Deployments → the previous deployment → **Instant Rollback** (seconds).

## 5. Where to change things

| I want to change… | Open this file |
|---|---|
| Phone hours, same-day wording, recycling sentence, insurance wording and every other business claim (used across all pages) | `content/business-facts.json` (each claim has `text`; `status` shows if it's confirmed) |
| A price (updates the truck, "Junk Load from C$…" and Google data) | `content/pricing.json` (then update `scripts/checks/pricing-check.mjs` to Nav's new card) |
| Customer and team email wording | `content/emails.json` |
| Text of the hand-designed pages (Home, Services, Couch, Estate, Business cleanout, Deck, Locations, Toronto, How It Works, Contact, About) | `content/designed/pages/*.ts` (shared parts and FAQs: `content/designed/*.ts`) |
| Text of any other page | `content/pages/…`. The folders follow the web address: `/locations/toronto/` → `content/pages/locations/toronto.json` |
| A blog post | `content/blog/<name>.json` |
| Phone, email, towns, socials | `content/site.json` |
| Menu and footer links | `content/navigation.json` |
| Redirects (old address → new address) | `content/redirects.csv` |
| Images | `public/images/uploads/` (same folders as WordPress) and `public/images/brand/`. Upload photos at most **1600 px wide** (JPEG or WebP, ideally under 500 KB). `npm run build` makes the small WebP copies the pages show (`public/_img/`, never edit that folder) |
| Colours, fonts, spacing | `src/styles/globals.css` |
| Enquiries (leads) and photos | Supabase dashboard → table `leads`, storage bucket `lead-photos` |
| Confirm a pickup and send the confirmation email | `/admin/` on the website (sign in with an emailed link). Guide: `docs/EMAILS.md` |

**A tip that saves time:** wording used on many pages, like the same-day sentence or the recycling sentence, lives once in `content/business-facts.json`. Pages refer to it as `{{fact:sameDay}}`. Change it there and every page updates.

## 6. Working with Claude

Open Claude Code in this folder:

```bash
cd ~/Downloads/livejunkfree
claude
```

Claude automatically reads **`CLAUDE.md`** in this folder. It explains the project's rules: what wording is allowed, where things live, and which checks must pass. Just describe what you want in plain words, for example:

- "On the hot tub page, change the first paragraph to say …"
- "Nav confirmed we can say weekend pickups are available every Saturday. Update it everywhere."
- "`npm run check:content` failed on B1-24, please fix it."
- "Add an FAQ to the estate page: Q … A …"
- "Run the site, check the couch page on a phone size, and tell me if anything looks broken."

Good habits:
1. **Ask Claude to run `npm run build` and `npm run check:content` after every change,** and to tell you the result.
2. **New claims need Nav's confirmation first.** If you want to add something like "certified recycling" or "same-day guaranteed", get Nav's written confirmation, then tell Claude it's confirmed. It belongs in `content/business-facts.json` as `"status": "confirmed"`.
3. **Review before publishing.** Ask Claude "what did you change?" and look at http://localhost:3000 before you push.
4. **Don't open the thank-you pages** (`/thank-you-estate-quote/`, `/thankpage-schedule/`) on the live site: loading them can count as an Ads conversion.

## 7. Website settings (Vercel)

Set these in Vercel → Project → Settings → Environment Variables, ticking Production and Preview:

| Setting | What it does |
|---|---|
| `NEXT_PUBLIC_REVIEW_MODE` | `true` = preview mode (hidden from Google, review toolbar). Set to `false` at launch |
| `NEXT_PUBLIC_SITE_URL` | `https://livejunkfree.ca` |
| `BUILD_PHASE` | `3` = every page is built |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Database for enquiries |
| `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TEST_MODE`, `EMAIL_TEST_TO` | Sending emails (see `docs/EMAILS.md`). Keep `EMAIL_TEST_MODE` on until the controlled test passes |
| `LEAD_NOTIFY_EMAIL`, `LEAD_CC_EMAIL` | Who receives new-enquiry emails (Nav's inbox + info@; CC Manisha) |
| `ADMIN_EMAILS` | Who can sign in to `/admin/` |
| `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GTM_HOSTS` | Google Tag Manager. It only loads on livejunkfree.ca, never on the preview |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Spam protection on forms |

Database changes are in `supabase/migrations/`. Run each file once, in order, in Supabase → SQL editor.

## 8. Documents in this folder

| File | What it's for |
|---|---|
| `docs/client/batch-1/BATCH-1-REPORT.md` | What was done in Batch 1, the test results, and what's still open and who owns it |
| `docs/client/batch-1/LJF_QA_Reconciliation_2026-11-18_WORKING.xlsx` | Every QA row and its status now |
| `docs/client/batch-1/NAV-CONFIRMATIONS.md` | Claims waiting for Nav, with the current safe wording |
| `docs/client/batch-1/service-areas-for-nav.md` | The 26 towns for Nav to confirm |
| `docs/client/batch-1/MEDIA-NEEDED.md` | Photos still needed from the Drive folders |
| `docs/client/batch-1/pricing-verification.md` | Proof that the truck prices match Nav's card |
| `docs/client/batch-1/RESEND-DNS-RECORDS.md` | DNS records for sending email from livejunkfree.ca |
| `docs/EMAILS.md` | How enquiries, emails and `/admin/` work |
| `docs/PRICING.md` | How prices work |
| `docs/LAUNCH-SEO-CHECKLIST.md` | Step-by-step launch and rollback |
| `docs/CMS-OPTIONS.md` | The planned editing panel, and its demo script |
| `docs/OWNERSHIP.md` | Accounts, owners, costs and backups |

## 9. Folder map

```
content/            ALL website text, prices, facts, emails, menus, redirects   ← you edit here
public/images/      images
src/                the website's code (pages, layout, forms, admin, emails)
scripts/            content rules and the automatic checks (npm run check:content)
supabase/           database setup for enquiries
docs/               guides and the Batch 1 client documents
```

## 10. If something goes wrong

| Problem | Fix |
|---|---|
| `npm: command not found` | Install Node.js (section 1), then close and reopen Terminal |
| `npm run build` says "Invalid content file …" | That JSON file has a typo (usually a missing comma or quote). Ask Claude: "fix the content file error from npm run build" |
| Port 3000 is already in use | Another copy is running; close it, or run `npm run dev -- -p 3001` |
| Something looks wrong after `git pull` or after updating | Run `npm install` again, then `npm run dev` |
| A change broke the live site | Vercel → Deployments → previous deployment → Instant Rollback |
