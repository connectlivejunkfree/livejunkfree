"use client";

/**
 * Counts a number up from 0 when it first scrolls into view (≤ 400ms).
 * Server-renders the final value (visible without JS); skipped under
 * prefers-reduced-motion or when already on screen at load.
 */
import { useEffect, useRef } from "react";
import { motionAllowed, onceVisible } from "@/lib/useReveal";

export function CountUp({ value }: { value: string }) {
  const el = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = el.current;
    const m = value.match(/^(\D*)([\d,.]+)(.*)$/);
    if (!node || !m || !motionAllowed()) return;
    if (node.getBoundingClientRect().top < window.innerHeight) return;
    const [, pre, num, post] = m;
    const end = Number(num.replace(/,/g, ""));
    const decimals = num.includes(".") ? num.split(".")[1].length : 0;
    let raf = 0;
    const stop = onceVisible(node, () => {
      const t0 = performance.now();
      const tick = (t: number) => {
        const k = Math.min((t - t0) / 400, 1);
        const v = end * (1 - Math.pow(1 - k, 3));
        node.textContent = `${pre}${v.toLocaleString("en-CA", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${post}`;
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    return () => {
      stop();
      cancelAnimationFrame(raf);
      node.textContent = value;
    };
  }, [value]);
  return <span ref={el}>{value}</span>;
}
