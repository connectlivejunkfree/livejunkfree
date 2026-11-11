/**
 * Email notification for new leads via Resend (plain HTTP API, no SDK).
 * Sends to LEAD_NOTIFY_EMAIL (info@livejunkfree.ca). Without RESEND_API_KEY
 * it only logs, so local/preview builds never fail.
 */
type LeadEmail = { subject: string; rows: [string, string | undefined | null][]; replyTo?: string };

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export async function notifyLead({ subject, rows, replyTo }: LeadEmail): Promise<{ sent: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFY_EMAIL ?? "info@livejunkfree.ca";
  const from = process.env.LEAD_FROM_EMAIL ?? "Live Junk Free website <leads@livejunkfree.ca>";
  const filled = rows.filter(([, v]) => v);
  const text = filled.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html = `<table cellpadding="6" style="font-family:system-ui,sans-serif;font-size:14px">${filled
    .map(([k, v]) => `<tr><td style="color:#5B6672;vertical-align:top">${esc(k)}</td><td><b>${esc(String(v)).replace(/\n/g, "<br>")}</b></td></tr>`)
    .join("")}</table>`;

  if (!key) {
    console.info(`[lead email — not sent, RESEND_API_KEY missing]\nTo: ${to}\nSubject: ${subject}\n${text}`);
    return { sent: false, error: "RESEND_API_KEY not set" };
  }
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: [to], subject, text, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
      });
      if (res.ok) return { sent: true };
      console.error(`[lead email] Resend ${res.status}: ${await res.text()}`);
    } catch (e) {
      console.error("[lead email] network error", e);
    }
  }
  return { sent: false, error: "Resend failed" };
}
