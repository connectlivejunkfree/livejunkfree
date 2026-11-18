# Accounts, ownership, costs and backups

To be completed with the client (Part 2 D #5, audit T15). **Owner** = who holds the login today; the client decides who should own each account long-term. Costs are list prices at the time of writing. Check each provider's pricing page before relying on them.

| Account | What it does | Current owner | Recommended owner | Monthly cost | Backups / rollback |
|---|---|---|---|---|---|
| **GitHub**: `connectlivejunkfree/livejunkfree` | The website's code and all page content (JSON). Every change is a commit. | `connectlivejunkfree` organisation (to confirm who administers it) | Live Junk Free, with the developer as collaborator | Free | Full history in git; any change can be reverted |
| **Vercel**: project `livejunkfree` (`manisha-2949` team) | Builds and hosts the site; preview URL `livejunkfree-phi.vercel.app`; environment variables | `manisha-2949` | Live Junk Free | Hobby is free but for **non-commercial** use only; a business site should be on **Pro (about US$20 per member per month)**. A recurring paid plan needs the client's approval first (D.5) | Every deploy is kept; Instant Rollback in Deployments |
| **Supabase** | Lead database (`leads`, `lead_photos`, `email_log`), photo storage, /admin sign-in | To confirm | Live Junk Free | Free tier (projects pause after a week of inactivity; no daily backups), or **Pro about US$25 per month** with daily backups (paid plan only with the client's approval, D.5) | Pro: daily backups. Free: export CSV regularly |
| **Resend** | Sends the team notification, the customer acknowledgement and the pickup-confirmation email | To confirm (the API key is in Vercel) | Live Junk Free | Free: 3,000 emails/month, 100/day. Pro about US$20/month if exceeded | `email_log` in Supabase records every send |
| **Cloudflare Turnstile** | Spam protection on all forms | To confirm (keys are in Vercel) | Live Junk Free | Free | n/a |
| **Domain `livejunkfree.ca` (Hostinger)** | Domain and DNS. Points to WordPress today; moves to Vercel at launch | Live Junk Free | Live Junk Free | Domain renewal (yearly) | Screenshot or export the DNS records before any change |
| **Google Tag Manager `GTM-5GPZ262Z` / Google Ads `AW-16519215726` / GA4** | Conversion tracking | Live Junk Free; Manisha coordinates permissions and the conversion test (D.3). The preview never loads GTM (`GtmGate`) | Live Junk Free | Free (ad spend separate) | GTM versions can be restored |
| **Google Search Console** | Search performance; needed before any URL change (T02) | To confirm (Part 2 D #2) | Live Junk Free | Free | n/a |
| **Old WordPress site (Hostinger)** | The live site until launch | Live Junk Free | Keep running after launch for a while (or keep a full backup) | Current hosting plan | Full backup before the DNS switch |

## Environment variables (Vercel)

These are documented in `docs/EMAILS.md` (email and admin) and `README.md`. Secrets (Supabase service role, Resend, Turnstile, webhook secret) are stored only in Vercel and in each developer's local `.env.local`, never in git.

## Launch-day checklist (T16)

1. Back up WordPress and export the DNS records.
2. In Vercel: set `NEXT_PUBLIC_REVIEW_MODE=false`, keep GTM on Production only, set `EMAIL_FROM` to the verified domain, and set `EMAIL_TEST_MODE=false` after the authorised test.
3. Point the domain at Vercel and check the redirects, `robots.txt` and sitemap on `livejunkfree.ca`.
4. Submit the sitemap in Search Console and check the Google Ads landing URLs.
5. Rollback: in Vercel, promote the previous deploy, or point DNS back to WordPress.
