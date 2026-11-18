/**
 * Email settings (server only). See docs/EMAILS.md.
 *
 *   RESEND_API_KEY      Resend API key. Without it nothing is sent (logged as "skipped").
 *   EMAIL_FROM          Sender. Default "Live Junk Free <onboarding@resend.dev>" (Resend's test
 *                       sender) until livejunkfree.ca is verified in Resend.
 *   EMAIL_REPLY_TO      Reply-to for customer emails (default info@livejunkfree.ca, Answers A3.2).
 *   LEAD_NOTIFY_EMAIL   Team inboxes for new enquiries, comma-separated: Nav's current form inbox AND
 *                       info@livejunkfree.ca, copied exactly from the WordPress form settings (Answers A3.1).
 *   LEAD_CC_EMAIL       CC on new-enquiry notifications (Manisha's business address), comma-separated.
 *   ADMIN_EMAILS        Who may sign in to /admin, comma-separated.
 *   EMAIL_TEST_MODE     "true" (default) sends EVERY email, customer emails included, to
 *                       EMAIL_TEST_TO with the subject prefixed "[TEST → real recipient]".
 *                       Set to "false" only after the domain is verified and an authorised test passed.
 *   EMAIL_TEST_TO       Test inbox (default: the first LEAD_NOTIFY_EMAIL). With Resend's test
 *                       sender this must be the Resend account's own address.
 *   LEAD_WEBHOOK_SECRET Shared secret for the Supabase status-change webhook (/api/lead-status).
 */
const list = (v?: string) => (v ?? "").split(",").map((s) => s.trim()).filter(Boolean);

export function emailConfig() {
  const notify = list(process.env.LEAD_NOTIFY_EMAIL || "info@livejunkfree.ca");
  return {
    apiKey: process.env.RESEND_API_KEY ?? "",
    from: process.env.EMAIL_FROM || "Live Junk Free <onboarding@resend.dev>",
    replyTo: process.env.EMAIL_REPLY_TO || "info@livejunkfree.ca",
    notify,
    cc: list(process.env.LEAD_CC_EMAIL),
    admins: list(process.env.ADMIN_EMAILS).map((e) => e.toLowerCase()),
    testMode: (process.env.EMAIL_TEST_MODE ?? "true").toLowerCase() !== "false",
    testTo: process.env.EMAIL_TEST_TO || notify[0],
    webhookSecret: process.env.LEAD_WEBHOOK_SECRET ?? "",
    siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "https://livejunkfree.ca").replace(/\/$/, ""),
  };
}
