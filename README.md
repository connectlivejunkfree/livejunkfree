# Live Junk Free — website

The new livejunkfree.ca, built with Next.js and hosted on Vercel. It has every page and URL of the old WordPress site in the new design.

## Where is…?

| I want to change… | Open |
|---|---|
| The text of the 11 hand-designed pages (Home, Services, Couch, Estate, Business cleanout, Deck, Locations, Toronto, How It Works, Contact, About) | `content/designed/pages/*.ts` (shared parts: `content/designed/*.ts`) |
| The text of any other page | `content/pages/`. Folders mirror the URL: `/locations/toronto/` → `content/pages/locations/toronto.json` |
| A blog post | `content/blog/<slug>.json` |
| A price (changes it everywhere) | `content/pricing.json` |
| Phone, email, hours, socials, rating, towns | `content/site.json` |
| The menu or footer links | `content/navigation.json` |
| Redirects (old URL → new URL) | `content/redirects.csv` |
| Images | `public/images/uploads/` (same year/month folders as WordPress) and `public/images/brand/` (logo, sharing image) |
| Colours, fonts, spacing | `src/styles/globals.css` (settings at the top) |
| Form leads | Supabase dashboard → table `leads` (photos in storage bucket `lead-photos`) |
| Tracking IDs (GTM, Google Ads) | Vercel environment variables |

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build (checks every content file)
```

Copy `.env.example` to `.env.local` and fill in the keys. Set the same values in Vercel → Project → Settings → Environment Variables.

## Folders

```
content/        all website text, prices, menus, redirects (edit here)
public/images/  images
src/app/        routes
src/templates/  one file per page type
src/components/ layout, sections, forms, ui, motion
src/lib/        content loaders, SEO, Supabase, tracking
supabase/       database tables for leads
```
