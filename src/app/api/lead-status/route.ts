/**
 * Backup for status changes made in the Supabase dashboard instead of /admin.
 * Supabase Database Webhook (table public.leads, UPDATE) → POST here with header
 * x-ljf-webhook-secret: LEAD_WEBHOOK_SECRET. Sends the pickup confirmation email; the
 * email_log dedupe key ("<lead>:<kind>:v<version>") means anything /admin already sent is skipped.
 */
import { NextResponse } from "next/server";
import { emailConfig } from "@/lib/email/config";
import { sendConfirmationEmail, type LeadRecord } from "@/lib/email/lead-emails";

type Row = LeadRecord & { status: string };

export async function POST(req: Request) {
  const secret = emailConfig().webhookSecret;
  if (!secret || req.headers.get("x-ljf-webhook-secret") !== secret) return NextResponse.json({ ok: false }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { type?: string; record?: Row; old_record?: Row } | null;
  const rec = body?.record, old = body?.old_record;
  if (body?.type !== "UPDATE" || !rec || !old) return NextResponse.json({ ok: true, skipped: "not an update" });

  // Only the confirmation email exists in phase 1 (Answers A3.4): send it when a lead becomes confirmed
  // or its agreed details get a new version. Already-sent versions are skipped by the email_log dedupe key.
  const confirmed = rec.status === "confirmed" && (old.status !== "confirmed" || (rec.appointment_version ?? 0) > (old.appointment_version ?? 0));
  if (!confirmed) return NextResponse.json({ ok: true, skipped: "no email for this change" });
  const r = await sendConfirmationEmail({ ...rec, appointment_version: rec.appointment_version || 1 });
  const kind = "confirmed";
  return NextResponse.json({ ok: true, kind, email: r.status });
}
