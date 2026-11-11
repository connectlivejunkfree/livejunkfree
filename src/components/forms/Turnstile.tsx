"use client";

/**
 * Cloudflare Turnstile bot check. Renders nothing until
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY is set; the script loads only when the form
 * is on screen, so it never slows the first paint.
 */
import { useEffect, useRef } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

declare global {
  interface Window {
    turnstile?: { render: (el: HTMLElement, opts: Record<string, unknown>) => string; reset: (id?: string) => void };
  }
}

let scriptPromise: Promise<void> | null = null;
function loadScript() {
  scriptPromise ??= new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = () => resolve();
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!SITE_KEY || !ref.current) return;
    const el = ref.current;
    let cancelled = false;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      loadScript().then(() => {
        if (cancelled || !window.turnstile) return;
        window.turnstile.render(el, { sitekey: SITE_KEY, size: "flexible", appearance: "interaction-only", callback: onToken });
      });
    });
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, [onToken]);
  return SITE_KEY ? <div ref={ref} className="turnstile" /> : null;
}

export const turnstileEnabled = Boolean(SITE_KEY);
