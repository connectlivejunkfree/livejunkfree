/**
 * Spam protection for lead forms: Cloudflare Turnstile verification (when
 * TURNSTILE_SECRET_KEY is set) and a simple per-IP rate limit.
 */

/** Verify a Turnstile token. Passes when Turnstile isn't configured yet. */
export async function verifyTurnstile(token: string | undefined, ip: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token, ...(ip ? { remoteip: ip } : {}) });
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const data = (await res.json()) as { success: boolean };
    return data.success;
  } catch {
    // Network trouble at Cloudflare must not cost a real lead: let it through, honeypot + rate limit still apply.
    return true;
  }
}

/**
 * Rate limit: at most 5 submissions per IP per 10 minutes (per server instance).
 * Good enough against casual abuse; Turnstile is the real bot filter.
 */
const hits = new Map<string, number[]>();
export function rateLimited(ip: string | null): boolean {
  if (!ip) return false;
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 5;
}
