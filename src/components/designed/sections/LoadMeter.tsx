"use client";

/**
 * Interactive pricing truck. A Live Junk Free box truck whose load window fills
 * as the customer picks a load size; the fraction, volume (cubic yards) and price
 * update with it. Junk Load and Bed Load are separate schedules from Nav's rate
 * card, each with its own labour note. No item examples (Answers: "never invent
 * unsupported item examples").
 *
 * Data: content/pricing.json via content/designed/pricing.ts; wording from
 * content/business-facts.json (pricingIntro, freeOnsiteEstimates, curbsideDiscount).
 *
 * Accessibility: both pickers are radiogroups (arrow keys move and select,
 * Home/End jump), the result is announced via aria-live, and the fill level
 * has a text equivalent. The fill animates with transform only (~350ms) and is
 * instant under prefers-reduced-motion. Tap targets are 44px+.
 *
 * "Get a quote" stores the selection (sessionStorage "ljf_pricing_selection")
 * so the quote form sends it as pricing_selection, then goes to the page's own
 * #quote-form if there is one, otherwise /contact/.
 */
import Link from "next/link";
import { useId, useState, type KeyboardEvent } from "react";
import { LOAD_METER, PRODUCTS, type ProductKey } from "@content/designed/pricing";
import { fact } from "@/lib/content/facts";
import { PRICING_SELECTION_KEY } from "@/lib/leads/context";

const KEYS: ProductKey[] = ["junkLoad", "bedLoad"];
const LOGO = "/images/brand/logo-transparent.webp";

/** Roving-tabindex radiogroup keyboard handling. */
function onRadioKeys(e: KeyboardEvent<HTMLDivElement>, count: number, current: number, select: (i: number) => void) {
  const next = { ArrowRight: current + 1, ArrowDown: current + 1, ArrowLeft: current - 1, ArrowUp: current - 1, Home: 0, End: count - 1 }[e.key];
  if (next === undefined) return;
  e.preventDefault();
  const i = (next + count) % count;
  select(i);
  (e.currentTarget.querySelectorAll<HTMLButtonElement>("[role=radio]")[i])?.focus();
}

export function LoadMeter({ compact = false, id }: { compact?: boolean; id?: string }) {
  const [productKey, setProductKey] = useState<ProductKey>("junkLoad");
  const product = PRODUCTS[productKey];
  const [sel, setSel] = useState<Record<ProductKey, number>>({ junkLoad: PRODUCTS.junkLoad.defaultIndex, bedLoad: PRODUCTS.bedLoad.defaultIndex });
  const size = product.sizes[sel[productKey]];
  const clipId = useId().replace(/:/g, "");
  const phone = fact("phone", "tel");
  const selection = `${product.label}: ${size.label} (${size.volume}, ${size.display})`;
  const loadName = `${size.label} ${product.label}, ${size.volume}, ${size.display}`;

  const pickSize = (i: number) => setSel((s) => ({ ...s, [productKey]: i }));

  const goQuote = (e: React.MouseEvent<HTMLAnchorElement>) => {
    try {
      sessionStorage.setItem(PRICING_SELECTION_KEY, selection);
    } catch {}
    window.dispatchEvent(new CustomEvent("ljf:pricing", { detail: selection }));
    const form = document.getElementById("quote-form");
    if (form) {
      e.preventDefault();
      form.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      form.querySelector<HTMLElement>("input, select, textarea")?.focus({ preventScroll: true });
    }
  };

  const fill = Math.max(0, Math.min(100, size.fillPercent)) / 100;

  return (
    <div className={compact ? "lm compact" : "lm"} id={id}>
      <div className="lm-visual">
        <div className="lm-product" role="radiogroup" aria-label="Pricing type" onKeyDown={(e) => onRadioKeys(e, KEYS.length, KEYS.indexOf(productKey), (i) => setProductKey(KEYS[i]))}>
          {KEYS.map((k) => (
            <button key={k} type="button" role="radio" aria-checked={k === productKey} tabIndex={k === productKey ? 0 : -1} onClick={() => setProductKey(k)}>
              {PRODUCTS[k].label}
            </button>
          ))}
        </div>

        <svg className="truck" viewBox="0 0 560 230" role="img" aria-label={`Live Junk Free truck, ${loadName}: about ${Math.round(fill * 100)}% full`}>
          <defs>
            <clipPath id={`win-${clipId}`}>
              <rect x="30" y="104" width="352" height="70" rx="9" />
            </clipPath>
            <pattern id={`junk-${clipId}`} width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(-20)">
              <rect width="28" height="28" fill="#FF6A13" />
              <rect width="14" height="28" fill="#F25A05" />
            </pattern>
          </defs>
          {/* cargo box */}
          <rect x="14" y="14" width="384" height="176" rx="14" fill="#fff" />
          <rect x="14" y="14" width="384" height="176" rx="14" fill="none" stroke="#D5DCE3" strokeWidth="2" />
          {/* logo on the side of the box (600×131 source; aspect kept) */}
          <image href={LOGO} x="46" y="30" width="320" height="69.9" preserveAspectRatio="xMidYMid meet" />
          {/* load window */}
          <rect x="30" y="104" width="352" height="70" rx="9" fill="#E9EDF2" />
          <g clipPath={`url(#win-${clipId})`}>
            <rect className="lm-fill" x="30" y="104" width="352" height="70" fill={`url(#junk-${clipId})`} style={{ transform: `scaleX(${fill})` }} />
          </g>
          {[0.25, 0.5, 0.75].map((t) => (
            <line key={t} x1={30 + 352 * t} x2={30 + 352 * t} y1="108" y2="170" stroke="#0E1621" strokeOpacity=".18" strokeDasharray="4 5" />
          ))}
          {/* cab */}
          <path d="M406 64h78a12 12 0 0 1 9 4l46 52a12 12 0 0 1 3 8v54a8 8 0 0 1-8 8H406z" fill="#fff" stroke="#D5DCE3" strokeWidth="2" />
          <path d="M420 78h58l38 44h-96z" fill="#0E1621" opacity=".88" />
          <rect x="520" y="150" width="20" height="10" rx="3" fill="#FF6A13" />
          <rect x="6" y="186" width="540" height="12" rx="6" fill="#0E1621" opacity=".85" />
          {[96, 316, 466].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy="200" r="24" fill="#0E1621" />
              <circle cx={cx} cy="200" r="10" fill="#C5D0DB" />
            </g>
          ))}
        </svg>

        <div
          className="lm-sizes"
          role="radiogroup"
          aria-label={`${product.label} size`}
          style={{ "--n": product.sizes.length } as React.CSSProperties}
          onKeyDown={(e) => onRadioKeys(e, product.sizes.length, sel[productKey], pickSize)}
        >
          {product.sizes.map((s, i) => (
            <button key={s.id} type="button" role="radio" aria-checked={i === sel[productKey]} tabIndex={i === sel[productKey] ? 0 : -1} onClick={() => pickSize(i)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="lm-out stack">
        <span className="tag">{LOAD_METER.tag}</span>
        <div aria-live="polite" aria-atomic="true" className="stack">
          <p className="eq-big">
            {size.label} {product.label}
          </p>
          <p className="lm-vol">{size.volume}</p>
          <p className={size.price === null ? "lm-price lm-tbd" : "lm-price"}>{size.display}</p>
          <p className="small lm-tax">{LOAD_METER.tax}.</p>
          <p className="sr-only">Truck about {Math.round(fill * 100)}% full.</p>
        </div>
        <p className="small lm-labour">{product.labour}</p>
        <p className="small muted">{LOAD_METER.intro}</p>
        {compact ? null : <p className="small muted">{LOAD_METER.extra}</p>}
        <p className="small muted">{LOAD_METER.estimates}</p>
        {LOAD_METER.curbside ? <p className="small lm-curb">{LOAD_METER.curbside}.</p> : null}
        <div className="btn-row lm-ctas">
          <a className="btn btn-primary lm-call" href={`tel:${phone}`}>
            {LOAD_METER.call} {fact("phone", "display")}
          </a>
          <Link className="btn btn-ghost lm-quote" href="/contact/" onClick={goQuote}>
            {LOAD_METER.cta}
          </Link>
        </div>
      </div>
    </div>
  );
}
