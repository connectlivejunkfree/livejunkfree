"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { DEFAULT_LOAD, LOADS, LOAD_METER, PRICES } from "@content/designed/pricing";
import { HREF } from "@content/designed/routes";

const CELLS = Array.from({ length: 8 }, (_, i) => i);
const WHEELS = [90, 300, 448];

/**
 * Signature pricing widget: pick a load size, the truck fills cell by cell,
 * bumps and spins its wheels, and "what usually fits" flips in.
 * Only the two published prices are shown (from C$125, full truck C$655).
 */
export function LoadMeter({ compact = false, id }: { compact?: boolean; id?: string }) {
  const [sel, setSel] = useState(DEFAULT_LOAD);
  const [tick, setTick] = useState(0); // re-keys animated nodes so they replay
  const [pill, setPill] = useState<{ w: number; x: number } | null>(null);
  const tabs = useRef<HTMLDivElement>(null);
  const truck = useRef<SVGSVGElement>(null);
  const L = LOADS[sel];
  const full = sel === LOADS.length - 1;

  // Sliding white pill behind the selected tab.
  useLayoutEffect(() => {
    const move = () => {
      const b = tabs.current?.querySelector<HTMLButtonElement>("[aria-pressed=true]");
      if (b) setPill({ w: b.offsetWidth, x: b.offsetLeft });
    };
    move();
    window.addEventListener("resize", move);
    return () => window.removeEventListener("resize", move);
  }, [sel]);

  const pick = (i: number) => {
    setSel(i);
    setTick((t) => t + 1);
    const t = truck.current;
    if (t) {
      t.classList.remove("bump");
      void t.getBBox(); // restart the animation
      t.classList.add("bump");
    }
  };

  return (
    <div className="lm" id={id}>
      <div>
        <svg ref={truck} className="truck" viewBox="0 0 520 190" role="img" aria-label={`Truck load size: ${L.k} truck`}>
          <g className="body">
            <rect x="10" y="30" width="370" height="110" rx="14" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="3" />
            {CELLS.map((i) => (
              <rect
                key={i}
                className={i < L.fill ? "cell on" : "cell"}
                style={{ "--ci": i } as React.CSSProperties}
                x={20 + i * 44.5}
                y="40"
                width="40"
                height="90"
                rx="8"
              />
            ))}
            <path d="M388 60h62a8 8 0 0 1 6 3l42 40v37H388z" fill="#fff" />
            <path d="M402 72h44l30 30h-74z" fill="#0E1621" opacity=".85" />
            <rect x="0" y="140" width="510" height="10" rx="5" fill="rgba(255,255,255,.35)" />
          </g>
          {WHEELS.map((cx) => (
            <g key={cx} className="whl">
              <circle cx={cx} cy="160" r="22" fill="#000" />
              <circle cx={cx} cy="160" r="9" fill="#FF6A13" />
              <rect x={cx - 2} y="146" width="4" height="8" rx="2" fill="#000" />
            </g>
          ))}
        </svg>
        <div ref={tabs} className={pill ? "lm-tabs has-pill" : "lm-tabs"} role="group" aria-label="Choose a load size">
          {pill ? <span className="pillbg" style={{ width: pill.w, transform: `translateX(${pill.x}px)` }} /> : null}
          {LOADS.map((l, i) => (
            <button key={l.k} type="button" aria-pressed={i === sel} onClick={() => pick(i)}>
              {l.k}
              <small>truck</small>
            </button>
          ))}
        </div>
      </div>
      <div className="lm-out stack" aria-live="polite">
        <span className="tag">{LOAD_METER.tag}</span>
        <p className="eq-big">
          <span className="flip" key={`e${tick}`}>
            {L.k} truck: {L.eq}
          </span>
        </p>
        <p className="small muted">{LOAD_METER.fitsLabel}</p>
        <ul key={`i${tick}`}>
          {L.items.map((t, j) => (
            <li key={t} className="chip" style={{ "--ci": j } as React.CSSProperties}>
              {t}
            </li>
          ))}
        </ul>
        <div className="lm-prices">
          <div className={full ? undefined : "on"}>
            <span className="price">From {PRICES.from}</span>
            <small>{PRICES.fromLabel}</small>
          </div>
          <div className={full ? "on" : undefined}>
            <span className="price">{PRICES.full}</span>
            <small>{PRICES.fullLabel}</small>
          </div>
        </div>
        {compact ? null : <p className="small muted">{LOAD_METER.footnote}</p>}
        <div className="btn-row">
          <Link className="btn btn-primary" href={HREF.contact}>
            {LOAD_METER.cta}
          </Link>
          {compact ? (
            <Link className="btn btn-ghost" href={HREF.pricing}>
              {LOAD_METER.secondary}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
