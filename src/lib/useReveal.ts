"use client";

import { useEffect } from "react";

/** True unless the visitor asked for reduced motion. */
export const motionAllowed = () =>
  typeof window !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Scroll-reveal groups, ported from the design's init():
 * [selector, class, stagger]. stagger = "index" staggers by sibling index
 * (max 6 × 80ms); a number is a fixed delay.
 */
const GROUPS: [string, "rvl" | "wipe", "index" | number][] = [
  [".sec-head,.lm,.ba,.tbl,.callout,.split>.stack:first-child,.reviews>.stack,.cta-band .wrap>*,.summary,.price-card,.split-media>*,.post-cta,.cta-strip,.mapf,.prose-band,.lead-split>*,.art-cta,.art-fig", "rvl", 0],
  [".route .photo,.gallery .photo,.mosaic>.photo", "wipe", "index"],
  [".steps>.step,.dest>div,.regions>.region,.grid>.panel,.route-mini>*,.faq>details,.az>div,.trust .t,.cards>*,.link-grid>li,.posts>li,.stats>div,.rv-list>*,.areas>li,.items>.item,.chip-grid>li,.svc-grid>.svc-card", "rvl", "index"],
];
const SKIP = ".hero-home,.qcard,.mega,.drawer,.hero,.lp-hero";

/**
 * Adds the hidden starting state (.rvl / .wipe) after hydration, only when
 * motion is allowed, and only to elements still below the fold, so nothing
 * that is already on screen ever flashes. Elements get `.in` when they scroll
 * into view. Without JS or with reduced motion, everything stays visible.
 *
 * `[data-reveal]` opts any extra element in (value = delay in ms).
 */
export function useReveal(key: string) {
  useEffect(() => {
    if (!motionAllowed() || !("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    const fold = window.innerHeight;
    const mark = (el: HTMLElement, cls: "rvl" | "wipe", delay: number) => {
      if (el.classList.contains("in")) return;
      // Already marked by an earlier run (React Strict Mode runs effects twice in dev,
      // and the first run's observer was disconnected): just observe it again.
      if (el.classList.contains("rvl") || el.classList.contains("wipe")) {
        io.observe(el);
        return;
      }
      if (el.closest(SKIP)) return;
      // Items in a sideways-swipe list (reviews on phones) stay visible: a fade there shows blank cards mid-swipe.
      const parent = el.parentElement;
      if (parent && parent.scrollWidth > parent.clientWidth + 4 && getComputedStyle(parent).overflowX !== "visible") return;
      if (el.getBoundingClientRect().top < fold) return; // already visible: leave as is
      el.classList.add(cls);
      el.style.setProperty("--d", `${delay}ms`);
      io.observe(el);
    };

    for (const [sel, cls, stagger] of GROUPS) {
      document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
        const siblings = el.parentElement ? Array.from(el.parentElement.children) : [];
        const d = stagger === "index" ? Math.min(siblings.indexOf(el), 6) * 50 : stagger;
        mark(el, cls, d);
      });
    }
    document.querySelectorAll<HTMLElement>(".bento>.bx").forEach((el, i) => mark(el, "wipe", i * 90));
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => mark(el, "rvl", Number(el.dataset.reveal) || 0));

    // Safety net: anything still hidden is observed, so it can never stay invisible.
    document.querySelectorAll<HTMLElement>(".rvl:not(.in),.wipe:not(.in)").forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, [key]);
}

/** Calls `fn` once, the first time `el` is at least `threshold` visible. */
export function onceVisible(el: Element, fn: () => void, threshold = 0) {
  if (!("IntersectionObserver" in window)) {
    fn();
    return () => {};
  }
  const o = new IntersectionObserver(
    ([e]) => {
      if (!e.isIntersecting) return;
      o.disconnect();
      fn();
    },
    { threshold },
  );
  o.observe(el);
  return () => o.disconnect();
}
