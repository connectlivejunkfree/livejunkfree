"use client";

/**
 * Site-wide tracking listeners, mounted once in the root layout:
 *   - stores gclid / utm_* from the landing URL (first-party cookie, 90 days)
 *   - pushes `phone_click` to the dataLayer on every tel: link click
 *     (GTM forwards it to the Google Ads call conversion)
 */
import { useEffect } from "react";
import { captureAttribution, track } from "@/lib/tracking";

export function TrackingListeners() {
  useEffect(() => {
    captureAttribution();
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.('a[href^="tel:"]');
      if (!a) return;
      track("phone_click", { phone: a.getAttribute("href")?.slice(4), click_location: a.closest("header,footer,.mbar,.hero,.lp-hero") ? a.closest("header,footer,.mbar,.hero,.lp-hero")!.className.split(" ")[0] : "content", page_path: window.location.pathname });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
