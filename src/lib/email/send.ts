/**
 * Send one email through Resend's HTTP API, idempotently (server only).
 *
 * - Idempotent: `dedupeKey` is unique in public.email_log; if a sent row exists the call is a no-op,
 *   so a repeated admin click or a webhook replay never emails the customer twice.
 * - Test mode (default): every email goes to EMAIL_TEST_TO, subject "[TEST → real-recipient] …".
 * - One retry; failures are logged and returned, never thrown, so a lead is never lost
 *   and the customer never sees an email error.
 */
import { supabaseAdmin } from "@/lib/supabase/server";
import { emailConfig } from "./config";

export type EmailKind = "internal_notification" | "acknowledgement" | "confirmed";
export type Attachment = { filename: string; content: string; contentType?: string };
export type SendInput = {
  kind: EmailKind;
  leadId: string | null;
  dedupeKey: string;
  to: string[];
  cc?: string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachments?: Attachment[];
};
export type SendResult = { status: "sent" | "failed" | "skipped" | "duplicate"; id?: string; error?: string };

async function alreadySent(key: string): Promise<boolean> {
  const db = supabaseAdmin();
  if (!db) return false;
  const { data, error } = await db.from("email_log").select("status").eq("dedupe_key", key).maybeSingle();
  if (error) return false; // table missing before the migration: send anyway (no dedupe yet)
  return data?.status === "sent";
}

async function log(input: SendInput, to: string, res: SendResult, testMode: boolean) {
  const db = supabaseAdmin();
  if (!db) return;
  const row = {
    lead_id: input.leadId,
    kind: input.kind,
    dedupe_key: input.dedupeKey,
    to_email: to,
    subject: input.subject,
    status: res.status === "duplicate" ? "sent" : res.status,
    test_mode: testMode,
    provider_id: res.id ?? null,
    error: res.error ?? null,
  };
  // upsert: a failed attempt can be retried later under the same key.
  const { error } = await db.from("email_log").upsert(row, { onConflict: "dedupe_key" });
  if (error) console.error("[email] log failed", error.message);
}

export async function sendEmail(input: SendInput): Promise<SendResult> {
  const cfg = emailConfig();
  const realTo = input.to.filter(Boolean);
  if (!realTo.length) return { status: "skipped", error: "no recipient" };
  if (await alreadySent(input.dedupeKey)) return { status: "duplicate" };

  const cc = (input.cc ?? []).filter(Boolean);
  const to = cfg.testMode ? [cfg.testTo] : realTo;
  const subject = cfg.testMode ? `[TEST → ${realTo.join(", ")}${cc.length ? ` cc ${cc.join(", ")}` : ""}] ${input.subject}` : input.subject;

  if (!cfg.apiKey) {
    console.info(`[email — not sent, RESEND_API_KEY missing] ${input.kind} → ${realTo.join(", ")}: ${input.subject}`);
    const res: SendResult = { status: "skipped", error: "RESEND_API_KEY not set" };
    await log(input, realTo.join(", "), res, cfg.testMode);
    return res;
  }

  const body = {
    from: cfg.from,
    to,
    ...(!cfg.testMode && cc.length ? { cc } : {}),
    subject,
    html: input.html,
    text: input.text,
    ...(input.replyTo ? { reply_to: input.replyTo } : {}),
    ...(input.attachments?.length
      ? { attachments: input.attachments.map((a) => ({ filename: a.filename, content: Buffer.from(a.content).toString("base64"), content_type: a.contentType })) }
      : {}),
    headers: { "X-Entity-Ref-ID": input.dedupeKey },
  };

  let res: SendResult = { status: "failed", error: "not attempted" };
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${cfg.apiKey}`, "Content-Type": "application/json", "Idempotency-Key": input.dedupeKey },
        body: JSON.stringify(body),
      });
      if (r.ok) {
        const j = (await r.json().catch(() => ({}))) as { id?: string };
        res = { status: "sent", id: j.id };
        break;
      }
      res = { status: "failed", error: `Resend ${r.status}: ${(await r.text()).slice(0, 300)}` };
    } catch (e) {
      res = { status: "failed", error: `network: ${String(e).slice(0, 200)}` };
    }
  }
  if (res.status === "failed") console.error(`[email] ${input.kind} failed`, res.error);
  await log(input, realTo.join(", "), res, cfg.testMode);
  return res;
}
