"use server";

/**
 * Lead submission (quote, landing and booking forms).
 *   1. validate (zod) + honeypot + rate limit + Turnstile
 *   2. save to Supabase `leads` (and create signed upload URLs for photos)
 *   3. email the team (internal notification) and the customer (acknowledgement) via Resend,
 *      after the response when the lead is saved (src/lib/email/lead-emails.tsx, docs/EMAILS.md)
 *   4. return the thank-you page to redirect to (keeps Ads conversion tracking working) and the
 *      lead id (the browser fires the conversion event once per lead id)
 * Never loses a lead silently: if saving AND emailing both fail, the visitor is
 * told to call instead.
 */
import { after } from "next/server";
import { headers } from "next/headers";
import { sendNewLeadEmails, type LeadRecord } from "@/lib/email/lead-emails";
import { rateLimited, verifyTurnstile } from "@/lib/leads/guard";
import { BookingLeadSchema, MAX_PHOTOS, QuoteLeadSchema, type BookingLead, type QuoteLead } from "@/lib/leads/schema";
import { PHOTO_BUCKET, supabaseAdmin } from "@/lib/supabase/server";

export type LeadResult =
  | { ok: true; redirectTo: string; uploads: { path: string; token: string }[]; leadId: string | null }
  | { ok: false; message: string; fields?: Record<string, string>; callUs?: boolean };

const THANK_YOU = {
  default: "/thankpage-schedule/",
  estate: "/thank-you-estate-quote/",
};

function fieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const out: Record<string, string> = {};
  for (const i of issues) out[String(i.path[0])] ??= i.message;
  return out;
}

export async function submitLead(input: unknown, turnstileToken?: string, honeypot?: string): Promise<LeadResult> {
  // Bots fill every field: pretend success, store nothing.
  if (honeypot) return { ok: true, redirectTo: THANK_YOU.default, uploads: [], leadId: null };

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip");
  if (rateLimited(ip)) return { ok: false, message: "Too many requests. Please call us instead.", callUs: true };
  if (!(await verifyTurnstile(turnstileToken, ip))) return { ok: false, message: "Please confirm you're not a robot and try again." };

  const formType = (input as { form_type?: string })?.form_type;
  const parsed = formType === "booking" ? BookingLeadSchema.safeParse(input) : QuoteLeadSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Please check the highlighted fields.", fields: fieldErrors(parsed.error.issues) };
  const lead = parsed.data as QuoteLead | BookingLead;
  const a = lead.attribution ?? {};

  // 1. Save to Supabase.
  let leadId: string | null = null;
  const uploads: { path: string; token: string }[] = [];
  const db = supabaseAdmin();
  if (db) {
    const row = {
      source_path: lead.source_path,
      form_type: lead.form_type,
      name: lead.name,
      phone: lead.phone,
      email: lead.email || null,
      postal_code: lead.postal_code || null,
      service: lead.service || null,
      preferred_date: lead.preferred_date || null,
      arrival_window: "arrival_window" in lead ? lead.arrival_window : null,
      address: "street_address" in lead ? [lead.street_address, lead.unit, lead.city].filter(Boolean).join(", ") : null,
      details: lead.details || null,
      utm_source: a.utm_source || null,
      utm_medium: a.utm_medium || null,
      utm_campaign: a.utm_campaign || null,
      utm_term: a.utm_term || null,
      utm_content: a.utm_content || null,
      gclid: a.gclid || null,
      gbraid: a.gbraid || null,
      wbraid: a.wbraid || null,
      landing_path: a.landing_path || null,
    };
    // Enquiry context (audit G05). Needs supabase/migrations/20261118000000_lead_status_emails.sql;
    // until that runs, the insert is retried without these columns so no lead is lost.
    const context = {
      service_detail: lead.service_detail || null,
      city: lead.city || null,
      page_id: lead.page_id || null,
      pricing_selection: lead.pricing_selection || null,
      callback_time: lead.callback_time || null,
    };
    let full = true;
    for (let attempt = 1; attempt <= 3 && !leadId; attempt++) {
      const { data, error } = await db.from("leads").insert(full ? { ...row, ...context } : row).select("id").single();
      if (error) {
        console.error(`[lead] supabase insert failed (attempt ${attempt})`, error.message);
        if (full && /column|schema cache|PGRST204/i.test(`${error.code} ${error.message}`)) full = false;
      } else leadId = data.id as string;
    }
    // Photos upload straight from the browser to private storage using one-time signed URLs.
    if (leadId) {
      for (let i = 0; i < Math.min(lead.photo_count, MAX_PHOTOS); i++) {
        const path = `${leadId}/${i + 1}-${crypto.randomUUID()}`;
        const { data, error } = await db.storage.from(PHOTO_BUCKET).createSignedUploadUrl(path);
        if (!error && data) uploads.push({ path, token: data.token });
      }
      if (uploads.length) {
        const { error } = await db.from("lead_photos").insert(uploads.map((u) => ({ lead_id: leadId, path: u.path })));
        if (error) console.error("[lead] photo records failed", error.message);
      }
    }
  } else {
    console.info("[lead — not saved, Supabase not configured]", JSON.stringify(lead));
  }

  // 2. Email the team + acknowledge the customer.
  const record: LeadRecord = {
    id: leadId ?? crypto.randomUUID(),
    form_type: lead.form_type,
    name: lead.name,
    phone: lead.phone,
    email: lead.email || null,
    postal_code: lead.postal_code || null,
    address: "street_address" in lead ? [lead.street_address, lead.unit, lead.city].filter(Boolean).join(", ") : null,
    service: lead.service || null,
    service_detail: lead.service_detail || null,
    city: lead.city || null,
    source_path: lead.source_path,
    page_id: lead.page_id || null,
    pricing_selection: lead.pricing_selection || null,
    callback_time: lead.callback_time || null,
    preferred_date: lead.preferred_date || null,
    arrival_window: "arrival_window" in lead ? lead.arrival_window : null,
    details: lead.details || null,
    photo_count: lead.photo_count,
    gclid: a.gclid || null,
    utm_source: a.utm_source || null,
    utm_medium: a.utm_medium || null,
    utm_campaign: a.utm_campaign || null,
  };
  if (leadId) {
    // Saved: email after the response so the visitor isn't kept waiting.
    after(() => sendNewLeadEmails(record).then(() => undefined));
  } else {
    // Not saved: email now, and if that fails too, ask the visitor to call.
    const mail = await sendNewLeadEmails(record);
    if (db && mail.internal.status !== "sent") {
      return { ok: false, message: "We couldn't send your request. Please call us at +1 647 922 5865.", callUs: true };
    }
  }

  const estate = /estate/i.test(lead.source_path) || /estate/i.test(lead.service ?? "");
  return { ok: true, redirectTo: estate ? THANK_YOU.estate : THANK_YOU.default, uploads, leadId };
}
