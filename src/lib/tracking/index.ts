"use client";

/**
 * Tracking helpers (browser only).
 *
 * - Attribution: gclid / gbraid / wbraid / utm_* from the landing URL are kept in
 *   a first-party cookie `ljf_attr` for 90 days and attached to every lead.
 * - dataLayer events for Google Tag Manager (GTM-5GPZ262Z), which forwards them
 *   to Google Ads (AW-16519215726) and GA4.
 */
import type { Attribution } from "@/lib/leads/constants";

const COOKIE = "ljf_attr";
const KEYS = ["gclid", "gbraid", "wbraid", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...params });
}

function readCookie(): Attribution {
  try {
    const raw = document.cookie.split("; ").find((c) => c.startsWith(`${COOKIE}=`));
    return raw ? (JSON.parse(decodeURIComponent(raw.slice(COOKIE.length + 1))) as Attribution) : {};
  } catch {
    return {};
  }
}

/** Store attribution from the current URL (a new ad click replaces the old one). */
export function captureAttribution() {
  const params = new URLSearchParams(window.location.search);
  const fromUrl: Attribution = {};
  for (const k of KEYS) {
    const v = params.get(k);
    if (v) fromUrl[k] = v.slice(0, 300);
  }
  if (!Object.keys(fromUrl).length) return;
  const value: Attribution = { ...fromUrl, landing_path: window.location.pathname };
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(value))}; Max-Age=${90 * 24 * 3600}; Path=/; SameSite=Lax${secure}`;
}

export function getAttribution(): Attribution {
  return typeof document === "undefined" ? {} : readCookie();
}
