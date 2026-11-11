"use server";

/**
 * Lead submission (quote, landing and booking forms).
 *   1. validate (zod) + honeypot + rate limit + Turnstile
 *   2. save to Supabase `leads` (and create signed upload URLs for photos)
 *   3. email info@livejunkfree.ca via Resend
 *   4. return the thank-you page to redirect to (keeps Ads conversion tracking working)
 * Never loses a lead silently: if saving AND emailing both fail, the visitor is
 * told to call instead.
 */
import { headers } from "next/headers";
import { notifyLead } from "@/lib/leads/notify";
import { rateLimited, verifyTurnstile } from "@/lib/leads/guard";
import { BookingLeadSchema, MAX_PHOTOS, QuoteLeadSchema, type BookingLead, type QuoteLead } from "@/lib/leads/schema";
import { PHOTO_BUCKET, supabaseAdmin } from "@/lib/supabase/server";

export type LeadResult =
  | { ok: true; redirectTo: string; uploads: { path: string; token: string }[] }
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
  if (honeypot) return { ok: true, redirectTo: THANK_YOU.default, uploads: [] };

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
    for (let attempt = 1; attempt <= 2 && !leadId; attempt++) {
      const { data, error } = await db.from("leads").insert(row).select("id").single();
      if (error) console.error(`[lead] supabase insert failed (attempt ${attempt})`, error.message);
      else leadId = data.id as string;
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

  // 2. Email the team.
  const mail = await notifyLead({
    subject: `New ${lead.form_type} request — ${lead.name} (${lead.source_path})`,
    replyTo: lead.email || undefined,
    rows: [
      ["Form", lead.form_type],
      ["Page", `https://livejunkfree.ca${lead.source_path}`],
      ["Name", lead.name],
      ["Phone", lead.phone],
      ["Email", lead.email],
      ["Address", "street_address" in lead ? [lead.street_address, lead.unit, lead.city].filter(Boolean).join(", ") : undefined],
      ["Postal code", lead.postal_code],
      ["Service", lead.service],
      ["Preferred date", lead.preferred_date],
      ["Arrival window", "arrival_window" in lead ? lead.arrival_window : undefined],
      ["Details", lead.details],
      ["Photos", lead.photo_count ? `${lead.photo_count} (in Supabase storage)` : undefined],
      ["Source", [a.utm_source, a.utm_medium, a.utm_campaign].filter(Boolean).join(" / ") || undefined],
      ["gclid", a.gclid],
      ["Lead id", leadId],
    ],
  });

  // Saved nowhere and emailed nowhere (with both services configured) → ask them to call.
  if (db && !leadId && !mail.sent) {
    return { ok: false, message: "We couldn't send your request. Please call us at +1 647 922 5865.", callUs: true };
  }

  const estate = /estate/i.test(lead.source_path) || /estate/i.test(lead.service ?? "");
  return { ok: true, redirectTo: estate ? THANK_YOU.estate : THANK_YOU.default, uploads };
}
