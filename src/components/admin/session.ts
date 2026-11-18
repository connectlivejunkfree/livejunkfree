"use client";

/**
 * /admin session in the browser: Supabase magic-link sign-in (implicit flow; the link
 * lands on /admin/ with the session in the URL). Only the access token is passed to the
 * server actions, which verify it and check ADMIN_EMAILS.
 */
import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

let client: SupabaseClient | null = null;
export function adminClient(): SupabaseClient | null {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  client = createClient(url, anon, { auth: { flowType: "implicit", persistSession: true, detectSessionInUrl: true, storageKey: "ljf-admin" } });
  return client;
}

export function useAdminSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sb = adminClient();
    if (!sb) {
      queueMicrotask(() => setReady(true));
      return;
    }
    sb.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);
  return { session, token: session?.access_token ?? "", ready, signOut: () => adminClient()?.auth.signOut() };
}

/** Filter values (Answers A3.4: New / Contacted / Confirmed / Closed). */
export const STATUSES = ["new", "contacted", "confirmed", "closed"] as const;
export const fmtTime = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString("en-CA", { timeZone: "America/Toronto", dateStyle: "medium", timeStyle: "short" }) : "";
