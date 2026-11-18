/**
 * Lead emails (server only). Approved flow (LJF_Akshat_Point_by_Point_Answers_18_Nov_2026.pdf, A3):
 *
 *   Form submitted  → internal notification to LEAD_NOTIFY_EMAIL (Nav's form inbox + info@), CC LEAD_CC_EMAIL (Manisha)
 *                   → acknowledgement to the customer ("not a confirmed pickup appointment")
 *   Team agrees the pickup by PHONE → staff presses "Send confirmation" in /admin
 *                   → "Your Live Junk Free pickup is confirmed — [date]" (no calendar invite in phase 1)
 *   Changed details → staff updates and resends; a new version is a new email, the same version never re-sends.
 *
 * Wording: content/emails.json. Each send has a dedupe key so it happens once.
 */
import { render } from "@react-email/components";
import emailsJson from "@content/emails.json";
import { AcknowledgementEmail, ConfirmationEmail, InternalEmail } from "@/emails/LeadEmails";
import { emailConfig } from "./config";
import { sendEmail, type SendResult } from "./send";

const E = emailsJson;

/** The lead fields the emails use (a row of public.leads). */
export type LeadRecord = {
  id: string;
  created_at?: string;
  status?: string;
  form_type: string;
  name: string;
  phone: string;
  email?: string | null;
  postal_code?: string | null;
  address?: string | null;
  service?: string | null;
  service_detail?: string | null;
  city?: string | null;
  source_path: string;
  page_id?: string | null;
  pricing_selection?: string | null;
  callback_time?: string | null;
  preferred_date?: string | null;
  arrival_window?: string | null;
  details?: string | null;
  photo_count?: number;
  appointment_at?: string | null;
  appointment_window?: string | null;
  appointment_address?: string | null;
  appointment_notes?: string | null;
  appointment_version?: number | null;
  gclid?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
};

const fill = (t: string, v: Record<string, string>) => t.replace(/\{(\w+)\}/g, (_m, k: string) => v[k] ?? "");
const firstName = (n: string) => n.trim().split(/\s+/)[0] || n;
const serviceLabel = (l: LeadRecord) => l.service_detail || l.service || "junk removal";
const toronto = (iso: string, o: Intl.DateTimeFormatOptions) => new Date(iso).toLocaleString("en-CA", { timeZone: "America/Toronto", ...o });

/** "Saturday, November 22, 2026" in Toronto time. */
export const fmtDate = (iso: string) => toronto(iso, { weekday: "long", year: "numeric", month: "long", day: "numeric" });

/** Toronto's UTC offset (minutes) at an instant, independent of the server's own time zone. */
function torontoOffset(at: Date): number {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })
      .formatToParts(at)
      .map((x) => [x.type, x.value]),
  );
  const asUtc = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour), Number(p.minute), Number(p.second));
  return Math.round((asUtc - at.getTime()) / 60_000);
}

/** A Toronto local date ("2026-11-22") at local noon → the UTC instant (the date stays right across EST/EDT). */
export function torontoDateInstant(date: string): Date {
  const [y, mo, d] = date.split("-").map(Number);
  const wall = Date.UTC(y, mo - 1, d, 12, 0);
  let t = wall - torontoOffset(new Date(wall)) * 60_000;
  t = wall - torontoOffset(new Date(t)) * 60_000;
  return new Date(t);
}

/** Internal notification (+ CC) and the customer acknowledgement for a new lead. Never throws. */
export async function sendNewLeadEmails(l: LeadRecord): Promise<{ internal: SendResult; acknowledgement: SendResult | null }> {
  const cfg = emailConfig();
  const adminUrl = `${cfg.siteUrl}/admin/leads/${l.id}/`;
  const submitted = toronto(l.created_at ?? new Date().toISOString(), { dateStyle: "medium", timeStyle: "short" });
  const rows: [string, string | null | undefined][] = [
    ["Submission ID", l.id],
    ["Submitted", `${submitted} (Toronto)`],
    ["Status", "New"],
    ["Source page", `${cfg.siteUrl}${l.source_path}`],
    ["Name", l.name],
    ["Email", l.email],
    ["Phone", l.phone],
    ["Service", serviceLabel(l)],
    ["Category", l.service_detail ? l.service : null],
    ["City", l.city],
    ["Address", l.address],
    ["Postal code", l.postal_code],
    [E.internal.callbackNote, l.callback_time],
    ["Pricing truck selection", l.pricing_selection],
    ["Description", l.details],
    ["Ad / campaign", [l.utm_source, l.utm_medium, l.utm_campaign].filter(Boolean).join(" / ") || null],
    ["gclid", l.gclid],
  ];
  const vars = { service: serviceLabel(l), city: l.city || "city not given", count: String(l.photo_count ?? 0) };
  const internalEl = (
    <InternalEmail
      preview={`${l.name} · ${serviceLabel(l)}${l.city ? ` · ${l.city}` : ""}`}
      siteUrl={cfg.siteUrl}
      footer={E.brand.footer}
      heading={E.internal.heading}
      rows={rows.filter((r): r is [string, string] => Boolean(r[1]))}
      adminUrl={adminUrl}
      openAdmin={E.internal.openAdmin}
      photosNote={l.photo_count ? fill(E.internal.photosNote, vars) : undefined}
      confirmHint={E.internal.confirmHint}
    />
  );
  const internal = await sendEmail({
    kind: "internal_notification",
    leadId: l.id,
    dedupeKey: `${l.id}:internal_notification`,
    to: cfg.notify,
    cc: cfg.cc,
    subject: fill(E.internal.subject, vars),
    html: await render(internalEl),
    text: await render(internalEl, { plainText: true }),
    replyTo: l.email || undefined,
  });

  if (!l.email) return { internal, acknowledgement: null };
  const ackVars = { firstName: firstName(l.name), service: serviceLabel(l).toLowerCase(), inCity: l.city ? ` in ${l.city}` : "" };
  const ackEl = (
    <AcknowledgementEmail
      preview={E.acknowledgement.preheader}
      siteUrl={cfg.siteUrl}
      footer={E.brand.footer}
      greeting={fill(E.acknowledgement.greeting, ackVars)}
      paragraphs={E.acknowledgement.paragraphs.map((t) => fill(t, ackVars))}
      signoff={E.brand.signoff}
      signoffEmail={E.brand.signoffEmail}
    />
  );
  const acknowledgement = await sendEmail({
    kind: "acknowledgement",
    leadId: l.id,
    dedupeKey: `${l.id}:acknowledgement`,
    to: [l.email],
    subject: E.acknowledgement.subject,
    html: await render(ackEl),
    text: await render(ackEl, { plainText: true }),
    replyTo: cfg.replyTo,
  });
  return { internal, acknowledgement };
}

/** "Your Live Junk Free pickup is confirmed — [date]" for the lead's current appointment_version. Never throws. */
export async function sendConfirmationEmail(l: LeadRecord): Promise<SendResult> {
  const cfg = emailConfig();
  if (!l.email) return { status: "skipped", error: "no customer email (confirmed by phone only)" };
  if (!l.appointment_at || !l.appointment_window) return { status: "skipped", error: "no agreed date / arrival window" };
  const version = l.appointment_version ?? 1;
  const date = fmtDate(l.appointment_at);
  const address = l.appointment_address || l.address || l.city || "";
  const L = E.confirmed.labels;
  const rows = (
    [
      [L.service, serviceLabel(l)],
      [L.address, address],
      [L.date, date],
      [L.window, l.appointment_window],
    ] as [string, string][]
  ).filter((r) => r[1]);
  const el = (
    <ConfirmationEmail
      preview={E.confirmed.preheader}
      siteUrl={cfg.siteUrl}
      footer={E.brand.footer}
      greeting={fill(E.confirmed.greeting, { firstName: firstName(l.name) })}
      intro={E.confirmed.intro}
      rows={rows}
      closing={E.confirmed.closing}
      signoff={E.brand.signoff}
    />
  );
  return sendEmail({
    kind: "confirmed",
    leadId: l.id,
    dedupeKey: `${l.id}:confirmed:v${version}`,
    to: [l.email],
    subject: fill(E.confirmed.subject, { date }),
    html: await render(el),
    text: await render(el, { plainText: true }),
    replyTo: cfg.replyTo,
  });
}
