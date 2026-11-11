"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useReveal } from "@/lib/useReveal";

/**
 * Global motion layer: scroll reveal (re-run per route) and the scroll
 * progress bar. Mounted once in the root layout.
 */
export function MotionLayer() {
  const pathname = usePathname();
  useReveal(pathname);

  // Page-change fade (design: #app fadeIn) only after the first client navigation.
  const prev = useRef(pathname);
  // Back/forward navigations keep the browser's restored scroll position.
  const popped = useRef(false);
  useEffect(() => {
    const onPop = () => (popped.current = true);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  useEffect(() => {
    if (pathname === prev.current) return;
    prev.current = pathname;
    document.documentElement.classList.add("navd");
    // A link click opens the new page at the very top (above the review bar too),
    // unless the link points at a section on the page (e.g. /how-it-works/#pricing).
    if (!popped.current && !window.location.hash) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    popped.current = false;
  }, [pathname]);

  useEffect(() => {
    const bar = document.querySelector<HTMLElement>(".sprog");
    if (!bar) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = document.documentElement;
      bar.style.setProperty("--p", String(h.scrollTop / Math.max(1, h.scrollHeight - window.innerHeight)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return <div className="sprog" aria-hidden="true" />;
}
