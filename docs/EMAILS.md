# Enquiry and confirmation emails

Approved flow: `docs/client/batch-1/LJF_Akshat_Point_by_Point_Answers_18_Nov_2026.pdf` (A3, A4, E.6).

## Flow

```
Customer submits a form (quote / estate / booking): service, name, email, phone, city/address,
description, optional photos, and an optional PREFERRED CALLBACK TIME (not a booking)
        │
        ▼
src/app/actions/leads.ts ── validates, saves to Supabase `leads` (status New), returns the thank-you page
        │  (after the response, so the visitor never waits)
        ├──► Internal notification ──► LEAD_NOTIFY_EMAIL (Nav's form inbox + info@livejunkfree.ca), CC LEAD_CC_EMAIL (Manisha)
        └──► Acknowledgement        ──► the customer: "This is an enquiry acknowledgement, not a confirmed pickup appointment"

Team CALLS the customer and agrees the pickup day and arrival window
        │
        ▼
/admin → open the enquiry → enter the agreed date, arrival window and address → "Mark confirmed & send confirmation"
        └──► "Your Live Junk Free pickup is confirmed — [date]" (service, address, date, arrival window)
             Details changed later → "Update & resend confirmation" (new version → one new email)

Statuses: New → Contacted → Confirmed → Closed.  No calendar invite, reminders or cancellation emails in phase 1 (A3.4, A3.7).
```

Every send is logged in `public.email_log`. Its `dedupe_key` (`<lead id>:<kind>:v<version>`) makes each email go out once, even if a button is pressed twice. Failures are logged and can be retried. The lead is always saved, and the customer never sees an email error.

## The emails (exact wording: `content/emails.json`)

| Email | Subject | Trigger | To |
|---|---|---|---|
| Acknowledgement | We received your Live Junk Free enquiry | successful submit (customer gave an email) | customer; reply-to info@livejunkfree.ca |
| Internal notification | New website enquiry — [service] — [city] | successful submit | `LEAD_NOTIFY_EMAIL`, CC `LEAD_CC_EMAIL` |
| Pickup confirmation | Your Live Junk Free pickup is confirmed — [date] | staff, after the phone call | customer; reply-to info@livejunkfree.ca |

The internal email lists: submission ID, timestamp (Toronto), status, source page, name, email, phone, service, city and address, requested callback time (marked as not a pickup booking), pricing-truck choice, description, and a link to the enquiry in /admin, where photos open behind sign-in.

Templates are in `src/emails/`. The sender name is "Live Junk Free". There are no prices, payment or cancellation terms, response times or hours in any email (A3.3, A3.5).

## Settings (Vercel → Settings → Environment Variables; tick Production + Preview)

| Variable | Value |
|---|---|
| `RESEND_API_KEY` | Resend API key |
| `EMAIL_FROM` | Leave unset until the domain is verified (it then defaults to Resend's test sender). After verification: `Live Junk Free <leads@livejunkfree.ca>` |
| `EMAIL_REPLY_TO` | Optional; defaults to `info@livejunkfree.ca` |
| `LEAD_NOTIFY_EMAIL` | **Nav's current form inbox, plus `info@livejunkfree.ca`**, comma-separated. Copy Nav's address exactly from the WordPress form's notification settings (A3.1); don't guess it |
| `LEAD_CC_EMAIL` | Manisha's business email (A3.1) |
| `ADMIN_EMAILS` | Who may sign in to /admin, comma-separated |
| `EMAIL_TEST_MODE` | Leave unset (on) until Manisha's controlled test passes; then `false` |
| `EMAIL_TEST_TO` | The test inbox: the Resend account owner's email, while using Resend's test sender |
| `LEAD_WEBHOOK_SECRET` | Long random string (only for the optional Supabase webhook) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For the /admin sign-in |
| `NEXT_PUBLIC_GTM_HOSTS` | Optional. Hostnames where Google Tag Manager may load (default `livejunkfree.ca,www.livejunkfree.ca`), so the Vercel preview never fires live conversions (A4.1) |

**Test mode:** while `EMAIL_TEST_MODE` isn't `false`, every email, customer emails included, goes to `EMAIL_TEST_TO`. Its subject starts `[TEST → real recipients cc …]`, and nothing is CC'd.

## One-time setup

1. **Database:** run both files in Supabase → SQL editor, in order. Both are safe to run more than once:
   - `supabase/migrations/20261118000000_lead_status_emails.sql`
   - `supabase/migrations/20261118120000_callback_time_closed.sql` (adds `callback_time` and the `closed` status)
2. **Admin sign-in:** in Supabase → Authentication → URL Configuration → Redirect URLs, add `https://livejunkfree.ca/admin/`, `https://livejunkfree-phi.vercel.app/admin/` and `https://livejunkfree-*.vercel.app/admin/**`.
3. **Sending domain:** add the DNS records in `docs/client/batch-1/RESEND-DNS-RECORDS.md`.
4. **(Optional) Webhook backup** for confirmations set directly in the Supabase dashboard: Database → Webhooks, table `leads`, event Update, `POST https://<site>/api/lead-status`, header `x-ljf-webhook-secret: <LEAD_WEBHOOK_SECRET>`.

## How the team confirms a pickup

1. A new-enquiry email arrives with an **Open in admin** button. Or go to `/admin/` and sign in with the emailed link.
2. Call the customer. Agree the pickup day and arrival window.
3. In the enquiry, enter the **agreed pickup date**, **agreed arrival window** (e.g. `10 AM - 12 PM`) and **service address**. Press **Mark confirmed & send confirmation**.
4. If the details change, edit them and press **Update & resend confirmation**. When the job is done or the enquiry is no longer active, press **Close**.
5. The **Emails** box shows every email sent for the enquiry, and whether it went out in test mode.

## Controlled test (E.6, coordinated by Manisha)

Run one test per form template: home or core quote, estate, commercial, demolition, city page, and `/contact/` booking.

1. Keep `EMAIL_TEST_MODE` on.
2. Submit a form with `TEST` data. Check:
   - the `leads` row (service, city, page, callback time)
   - the internal email, as it would go to both inboxes with the CC
   - the acknowledgement
3. In /admin, confirm the test enquiry and check the confirmation email. Pressing it again must not send a second one.
4. Google Ads / GA4: GTM loads only on livejunkfree.ca. The `generate_lead` event fires once per submitted enquiry (per lead id), never on a thank-you page load or refresh. The estate thank-you page is opened only during this test.
5. Delete the TEST rows afterwards.

Preview the templates without sending: `npx tsx --tsconfig scripts/tsconfig.emails.json scripts/preview-emails.tsx`, which writes the files to `.next/email-preview/`.
