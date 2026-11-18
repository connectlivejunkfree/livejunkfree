# Email sending: DNS records for livejunkfree.ca (Answers A2.1)

For the domain administrator. These records let the website send its emails (enquiry acknowledgement, team notification, pickup confirmation) **from livejunkfree.ca** through Resend.

- **Your existing email is not affected.** The records go on a sending subdomain (`send.livejunkfree.ca`) and a DKIM name. The root MX records that deliver mail to `info@livejunkfree.ca` **stay exactly as they are; do not change or delete them**.
- **No password sharing.** Whoever manages DNS (Hostinger) adds these records.
- **No website change.** These records don't touch where `livejunkfree.ca` points, so the live WordPress site is unaffected.

## Step 1: Developer: generate the exact values

1. Resend → **Domains** → **Add Domain** → `livejunkfree.ca`, region **North America (us-east-1)**.
2. Resend shows the records below with the **exact** DKIM key for this account. Copy them from that screen (each row has a copy button) and send them to the domain administrator, for example as a screenshot of the Resend DNS table.

## Step 2: Domain administrator: add these records at Hostinger

Hostinger → Domains → livejunkfree.ca → **DNS / Nameservers** → **DNS records** → *Add record*:

| # | Type | Name / Host | Value / Target | Priority | TTL | Purpose |
|---|---|---|---|---|---|---|
| 1 | **MX** | `send` | `feedback-smtp.us-east-1.amazonses.com` | 10 | 3600 (or default) | Bounce and complaint handling for the sending subdomain only |
| 2 | **TXT** | `send` | `v=spf1 include:amazonses.com ~all` | – | 3600 | SPF for the sending subdomain only (the root SPF is untouched) |
| 3 | **TXT** | `resend._domainkey` | `p=MIGfMA0G…` **(the long key shown in Resend; copy it exactly)** | – | 3600 | DKIM signature, which proves the emails really come from livejunkfree.ca |
| 4 (recommended) | **TXT** | `_dmarc` | `v=DMARC1; p=none;` | – | 3600 | DMARC in monitor-only mode. **Skip this one if a `_dmarc` record already exists**; don't add a second |

Notes:

- At Hostinger, enter only the part before the domain in **Name** (`send`, `resend._domainkey`, `_dmarc`). Hostinger adds `.livejunkfree.ca` itself.
- If Resend shows a different region host in record 1, use exactly what Resend shows.
- **Do not change** the existing root `MX`, `A` or `CNAME` records, or the root `@` TXT/SPF record.

## Step 3: Verify and switch on (developer)

1. Resend → Domains → livejunkfree.ca → **Verify DNS Records**. DNS changes usually show within minutes, but can take up to 48 hours. Wait for **Verified**.
2. Vercel → Environment Variables: `EMAIL_FROM` = `Live Junk Free <leads@livejunkfree.ca>`. The display name "Live Junk Free" was approved in A3.2. Replies go to `info@livejunkfree.ca` (`EMAIL_REPLY_TO`).
3. Keep `EMAIL_TEST_MODE` on until Manisha's controlled test (E.6) passes, then set it to `false` and redeploy.

Until the domain is verified, emails can only be sent from Resend's test sender, and only to the Resend account owner's inbox. That's the test mode currently in place.
