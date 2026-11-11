/**
 * Inline SVG icon set, ported 1:1 from the design file (`const I = {…}`).
 * No icon library. Usage: <Icon name="phone" />
 */
import type { SVGProps } from "react";

type Def = { viewBox?: string; stroke?: boolean; sw?: number; cap?: boolean; join?: boolean; body: React.ReactNode };

const DEFS = {
  phone: { sw: 2, cap: true, join: true, body: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /> },
  truck: { cap: true, join: true, body: <><path d="M1 4h14v12H1zM15 9h4l4 4v3h-8z" /><circle cx="6" cy="18.5" r="2" /><circle cx="18" cy="18.5" r="2" /></> },
  leaf: { cap: true, join: true, body: <><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z" /><path d="M2 21c0-3 1.9-5.4 5.1-6" /></> },
  clock: { cap: true, body: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></> },
  shield: { join: true, body: <><path d="M12 2l8 3v6c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V5z" /><path d="M8.5 12l2.5 2.5 4.5-5" strokeLinecap="round" /></> },
  tag: { join: true, body: <><path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z" /><circle cx="7" cy="7" r="1.5" /></> },
  home: { join: true, body: <path d="M3 10l9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /> },
  building: { join: true, body: <path d="M4 21V3h11v18M15 9h5v12M2 21h20M8 7h3M8 11h3M8 15h3" /> },
  hammer: { cap: true, join: true, body: <><path d="M15 12l-8.5 8.5a2.1 2.1 0 0 1-3-3L12 9" /><path d="M17.6 15L22 10.6 13.4 2 9 6.4z" /></> },
  box: { join: true, body: <path d="M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8" /> },
  heart: { join: true, body: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z" /> },
  sofa: { join: true, body: <><path d="M4 11V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" /><path d="M2 13a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v5H2zM5 18v2M19 18v2" /></> },
  bed: { join: true, body: <path d="M2 18V6M2 12h20v6M22 18v-4M6 12V9h6v3" /> },
  fridge: { join: true, body: <><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M5 10h14M9 5v2M9 13v3" /></> },
  tv: { join: true, body: <><rect x="2" y="5" width="20" height="13" rx="2" /><path d="M8 22h8" /></> },
  tub: { join: true, body: <path d="M2 12h20v3a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5zM6 12V5a2 2 0 0 1 4 0" /> },
  tire: { body: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /></> },
  chip: { body: <><rect x="5" y="5" width="14" height="14" rx="2" /><path d="M9 1v4M15 1v4M9 19v4M15 19v4M1 9h4M1 15h4M19 9h4M19 15h4" /></> },
  tree: { join: true, body: <path d="M12 2l6 9h-3l4 6H5l4-6H6zM12 17v5" /> },
  dumbbell: { cap: true, body: <path d="M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12" /> },
  piano: { join: true, body: <><rect x="2" y="4" width="20" height="16" rx="1" /><path d="M2 13h20M7 13v7M12 13v7M17 13v7" /></> },
  star: { stroke: false, body: <path d="M12 2l3 6.6 7.2.7-5.4 4.8 1.6 7.1L12 17.5 5.6 21.2l1.6-7.1L1.8 9.3 9 8.6z" /> },
  menu: { sw: 2, cap: true, body: <path d="M3 6h18M3 12h18M3 18h18" /> },
  x: { sw: 2, cap: true, body: <path d="M6 6l12 12M18 6L6 18" /> },
  camera: { join: true, body: <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></> },
  stairs: { join: true, body: <path d="M3 21h5v-5h5v-5h5V6h3" /> },
  file: { join: true, body: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></> },
  key: { cap: true, body: <><circle cx="7.5" cy="15.5" r="5.5" /><path d="M11.5 11.5L21 2M16 7l3 3" /></> },
  arrow: { sw: 2, cap: true, join: true, body: <path d="M5 12h14M13 6l6 6-6 6" /> },
  arrows: { sw: 2, cap: true, join: true, body: <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" /> },
  chev: { viewBox: "0 0 12 12", sw: 2, body: <path d="M2 4l4 4 4-4" /> },
  calendar: { cap: true, join: true, body: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /></> },
  check: { sw: 2.2, cap: true, join: true, body: <path d="M5 12.5l4.5 4.5L19 7.5" /> },
} satisfies Record<string, Def>;

export type IconName = keyof typeof DEFS;

export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  const d: Def = DEFS[name];
  const stroked = d.stroke !== false;
  return (
    <svg
      viewBox={d.viewBox ?? "0 0 24 24"}
      fill={stroked ? "none" : "currentColor"}
      stroke={stroked ? "currentColor" : undefined}
      strokeWidth={stroked ? (d.sw ?? 1.8) : undefined}
      strokeLinecap={d.cap ? "round" : undefined}
      strokeLinejoin={d.join ? "round" : undefined}
      aria-hidden="true"
      focusable="false"
      className={name === "chev" ? "chev" : undefined}
      {...props}
    >
      {d.body}
    </svg>
  );
}
