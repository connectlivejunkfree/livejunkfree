"use server";

/**
 * /admin server actions (lead list, lead detail, appointment workflow).
 *
 * Auth: Supabase magic link. requestMagicLink() only emails addresses on ADMIN_EMAILS;
 * every other action verifies the caller's access token and checks the allow-list again.
 * All reads/writes use the service role on the server; the browser never reads leads directly.
 *
 * Statuses New / Contacted / Confirmed / Closed (Answers A3.4). The team agrees the pickup BY PHONE;
 * then staff record the agreed date + arrival window and send the confirmation:
 *   contacted   status → contacted                                   (no email)
 *   confirm     status → confirmed, agreed details saved, version +1 → "Your Live Junk Free pickup is confirmed"
 *               (pressing it again with the same details does not re-send; changed details send a new version)
 *   close       status → closed                                      (no email)
 */
import { createClient } from "@supabase/supabase-js";
import { emailConfig } from "@/lib/email/config";
import { sendConfirmationEmail, torontoDateInstant, type LeadRecord } from "@/lib/email/lead-emails";
import { PHOTO_BUCKET, supabaseAdmin } from "@/lib/supabase/server";

type Fail = { ok: false; error: string };
const fail = (error: string): Fail => ({ ok: false, error });

async function requireAdmin(token: string): Promise<string | Fail> {
  const db = supabaseAdmin();
  if (!db) return fail("Supabase is not configured.");
  const { data, error } = await db.auth.getUser(token);
  const email = data.user?.email?.toLowerCase();
  if (error || !email) return fail("Please sign in again.");
  if (!emailConfig().admins.includes(email)) return fail("This email is not on the admin list.");
  return email;
}

/** Send a sign-in link, only to allow-listed admins (no account enumeration: same reply either way). */
export async function requestMagicLink(email: string, redirectTo: string): Promise<{ ok: true }> {
  const e = email.trim().toLowerCase();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && anon && emailConfig().admins.includes(e)) {
    const sb = createClient(url, anon, { auth: { persistSession: false, flowType: "implicit" } });
    const { error } = await sb.auth.signInWithOtp({ email: e, options: { emailRedirectTo: redirectTo, shouldCreateUser: true } });
    if (error) console.error("[admin] magic link failed", error.message);
  }
  return { ok: true };
}

export type LeadListItem = Pick<LeadRecord, "id" | "created_at" | "name" | "phone" | "email" | "service" | "service_detail" | "city" | "source_path" | "appointment_at" | "appointment_window"> & { status: string; form_type: string };

export async function listLeads(token: string, f: { status?: string; q?: string; days?: number } = {}): Promise<{ ok: true; leads: LeadListItem[] } | Fail> {
  const who = await requireAdmin(token);
  if (typeof who !== "string") return who;
  const db = supabaseAdmin()!;
  let q = db.from("leads").select("*").order("created_at", { ascending: false }).limit(200);
  if (f.status) q = q.eq("status", f.status);
  if (f.days) q = q.gte("created_at", new Date(Date.now() - f.days * 86_400_000).toISOString());
  if (f.q?.trim()) {
    const s = f.q.trim().replace(/[%,()]/g, " ");
    q = q.or(`name.ilike.%${s}%,phone.ilike.%${s}%,email.ilike.%${s}%,postal_code.ilike.%${s}%`);
  }
  const { data, error } = await q;
  if (error) return fail(error.message);
  return { ok: true, leads: (data ?? []) as LeadListItem[] };
}

export type LeadDetail = { lead: LeadRecord & { status: string; notes?: string | null; confirmed_at?: string | null }; photos: { path: string; url: string }[]; emails: { created_at: string; kind: string; to_email: string; status: string; test_mode: boolean; error: string | null }[] };

export async function getLead(token: string, id: string): Promise<({ ok: true } & LeadDetail) | Fail> {
  const who = await requireAdmin(token);
  if (typeof who !== "string") return who;
  const db = supabaseAdmin()!;
  const { data: lead, error } = await db.from("leads").select("*").eq("id", id).single();
  if (error || !lead) return fail("Lead not found.");
  const { data: ph } = await db.from("lead_photos").select("path").eq("lead_id", id);
  const paths = (ph ?? []).map((p) => p.path as string);
  const { data: signed } = paths.length ? await db.storage.from(PHOTO_BUCKET).createSignedUrls(paths, 3600) : { data: [] };
  const photos = (signed ?? []).flatMap((s) => (s.signedUrl ? [{ path: s.path ?? "", url: s.signedUrl }] : []));
  const { data: emails } = await db.from("email_log").select("created_at,kind,to_email,status,test_mode,error").eq("lead_id", id).order("created_at", { ascending: false });
  return { ok: true, lead: lead as LeadDetail["lead"], photos, emails: (emails ?? []) as LeadDetail["emails"] };
}

export type AppointmentInput = { date: string; window: string; address?: string; notes?: string };
export type AdminAction = "contacted" | "confirm" | "close";

export async function leadAction(token: string, id: string, action: AdminAction, input?: AppointmentInput): Promise<{ ok: true; email?: string } | Fail> {
  const who = await requireAdmin(token);
  if (typeof who !== "string") return who;
  const db = supabaseAdmin()!;
  const { data: cur, error } = await db.from("leads").select("*").eq("id", id).single();
  if (error || !cur) return fail("Lead not found.");
  const lead = cur as LeadRecord & { status: string };

  if (action === "contacted") {
    const { error: e } = await db.from("leads").update({ status: "contacted" }).eq("id", id);
    return e ? fail(e.message) : { ok: true };
  }
  if (action === "close") {
    let { error: e } = await db.from("leads").update({ status: "closed" }).eq("id", id);
    // Before supabase/migrations/20261118120000_callback_time_closed.sql runs, 'closed' isn't a status yet.
    if (e && /enum|invalid input value/i.test(e.message)) ({ error: e } = await db.from("leads").update({ status: "completed" }).eq("id", id));
    return e ? fail(e.message) : { ok: true };
  }

  // confirm: details agreed with the customer on the phone
  if (!input?.date || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return fail("Enter the agreed pickup date.");
  const window = input.window?.trim() ?? "";
  if (!window || window.length > 60) return fail("Enter the agreed arrival window (e.g. 10 AM - 12 PM).");
  const at = torontoDateInstant(input.date).toISOString();
  const address = input.address?.trim() || lead.address || null;
  const same =
    lead.status === "confirmed" &&
    lead.appointment_at &&
    new Date(lead.appointment_at).toISOString() === at &&
    lead.appointment_window === window &&
    (lead.appointment_address ?? null) === address;
  const version = same ? (lead.appointment_version ?? 1) : (lead.appointment_version ?? 0) + 1;
  const patch = {
    status: "confirmed",
    appointment_at: at,
    appointment_window: window,
    appointment_address: address,
    appointment_notes: input.notes?.trim() || null,
    appointment_version: version,
    ...(lead.status !== "confirmed" ? { confirmed_at: new Date().toISOString() } : {}),
  };
  const { error: e } = await db.from("leads").update(patch).eq("id", id);
  if (e) return fail(/column/i.test(e.message) ? "Run the database update first (supabase/migrations/20261118000000_lead_status_emails.sql)." : e.message);
  const r = await sendConfirmationEmail({ ...lead, ...patch });
  return { ok: true, email: r.status === "duplicate" ? "already sent for these details" : r.status };
}
