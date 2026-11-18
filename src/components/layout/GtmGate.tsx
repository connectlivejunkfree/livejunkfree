"use client";

/**
 * Loads Google Tag Manager only on the production hostnames (Answers A4.1): the Vercel preview
 * (e.g. livejunkfree-phi.vercel.app) must never fire live Google Ads / GA4 conversions.
 * NEXT_PUBLIC_GTM_HOSTS overrides the list (comma-separated). The live GTM container itself is unchanged.
 */
import { GoogleTagManager } from "@next/third-parties/google";
import { useEffect, useState } from "react";

const HOSTS = (process.env.NEXT_PUBLIC_GTM_HOSTS || "livejunkfree.ca,www.livejunkfree.ca").split(",").map((h) => h.trim().toLowerCase()).filter(Boolean);

export function GtmGate({ gtmId }: { gtmId: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (HOSTS.includes(window.location.hostname.toLowerCase())) queueMicrotask(() => setOn(true));
  }, []);
  return on ? <GoogleTagManager gtmId={gtmId} /> : null;
}
