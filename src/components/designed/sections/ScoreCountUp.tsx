"use client";

import { useEffect, useRef } from "react";
import { motionAllowed, onceVisible } from "@/lib/useReveal";

/** Big rating number that counts up the first time it scrolls into view. */
export function ScoreCountUp({ value }: { value: string }) {
  const el = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = el.current;
    const end = parseFloat(value);
    if (!node || Number.isNaN(end) || !motionAllowed()) return;
    // Only animate if it starts off-screen, so the visible number never jumps.
    if (node.getBoundingClientRect().top < window.innerHeight) return;
    let raf = 0;
    const stop = onceVisible(node, () => {
      const t0 = performance.now();
      const f = (t: number) => {
        const k = Math.min((t - t0) / 1200, 1);
        node.textContent = (end * (1 - Math.pow(1 - k, 3))).toFixed(1);
        if (k < 1) raf = requestAnimationFrame(f);
      };
      raf = requestAnimationFrame(f);
    });
    return () => {
      stop();
      cancelAnimationFrame(raf);
      node.textContent = value;
    };
  }, [value]);

  return (
    <span ref={el} className="score">
      {value}
    </span>
  );
}
