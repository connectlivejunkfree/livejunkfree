"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { IMG, type ImageKey } from "@content/designed/images";
import { motionAllowed, onceVisible } from "@/lib/useReveal";
import { Icon } from "@/components/icons";
import { Rich } from "../ui/Rich";

const KEYS: [number, number][] = [[0, 50], [700, 22], [1500, 78], [2200, 50]];
const ease = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);

/**
 * Before/after slider (range input). Plays a demo sweep the first time it is
 * half in view, and the knob pulses until the visitor touches it.
 */
export function BeforeAfter({ before, after, cap }: { before: ImageKey; after: ImageKey; cap?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const range = useRef<HTMLInputElement>(null);

  const set = (v: number) => box.current?.style.setProperty("--x", `${v}%`);

  useEffect(() => {
    const ba = box.current;
    const r = range.current;
    if (!ba || !r || !motionAllowed()) return;
    let raf = 0;
    let timer = 0;
    const stop = onceVisible(
      ba,
      () => {
        timer = window.setTimeout(() => {
          const t0 = performance.now();
          const f = (t: number) => {
            if (ba.classList.contains("touched")) return;
            const el = t - t0;
            let v = 50;
            for (let i = 1; i < KEYS.length; i++) {
              if (el <= KEYS[i][0]) {
                const [a, va] = KEYS[i - 1];
                const [b, vb] = KEYS[i];
                v = va + (vb - va) * ease((el - a) / (b - a));
                break;
              }
            }
            r.value = String(v);
            set(v);
            if (el < 2200) raf = requestAnimationFrame(f);
          };
          raf = requestAnimationFrame(f);
        }, 300);
      },
      0.5,
    );
    return () => {
      stop();
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, []);

  const touch = () => box.current?.classList.add("touched");

  return (
    <>
      <div className="ba" ref={box}>
        <Image src={IMG[before]} alt="Before: old deck in the backyard" fill sizes="(max-width: 1280px) 100vw, 1200px" />
        <Image className="after" src={IMG[after]} alt="After: deck removed and yard cleared" fill sizes="(max-width: 1280px) 100vw, 1200px" />
        <span className="t l">Before</span>
        <span className="t r">After</span>
        <div className="knob">
          <span>
            <Icon name="arrows" />
          </span>
        </div>
        <input
          ref={range}
          type="range"
          min="0"
          max="100"
          defaultValue="50"
          aria-label="Drag to compare before and after"
          onPointerDown={touch}
          onKeyDown={touch}
          onInput={(e) => set(Number(e.currentTarget.value))}
        />
      </div>
      {cap ? (
        <p className="small muted mt-3">
          <Rich text={cap} />
        </p>
      ) : null}
    </>
  );
}
