"use client";

/**
 * Shared submit flow for lead forms: run the server action, upload photos to
 * Supabase Storage with the one-time signed URLs it returns, push the
 * `generate_lead` dataLayer event, then go to the thank-you page.
 */
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { submitLead } from "@/app/actions/leads";
import { getAttribution, track } from "@/lib/tracking";

export type Status = { state: "idle" | "sending" | "error"; message?: string; fields?: Record<string, string>; callUs?: boolean };

async function uploadPhotos(files: File[], uploads: { path: string; token: string }[]) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon || !uploads.length) return;
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(url, anon, { auth: { persistSession: false } });
  await Promise.allSettled(uploads.map((u, i) => (files[i] ? sb.storage.from("lead-photos").uploadToSignedUrl(u.path, u.token, files[i]) : null)));
}

export function useLeadSubmit() {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<Status>({ state: "idle" });

  const submit = useCallback(
    async (data: Record<string, unknown>, opts: { files?: File[]; turnstileToken?: string; honeypot?: string }) => {
      setStatus({ state: "sending" });
      try {
        const res = await submitLead(
          { ...data, source_path: pathname, photo_count: opts.files?.length ?? 0, attribution: getAttribution() },
          opts.turnstileToken,
          opts.honeypot,
        );
        if (!res.ok) {
          setStatus({ state: "error", message: res.message, fields: res.fields, callUs: res.callUs });
          return;
        }
        if (opts.files?.length) await uploadPhotos(opts.files, res.uploads);
        track("generate_lead", { form_type: data.form_type, page_path: pathname, service: data.service ?? "" });
        router.push(res.redirectTo);
      } catch {
        // Network failure: one retry happens inside the action; here we ask them to call.
        setStatus({ state: "error", message: "We couldn't send your request. Please call us at +1 647 922 5865.", callUs: true });
      }
    },
    [pathname, router],
  );
  return { status, submit };
}
