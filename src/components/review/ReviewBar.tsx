"use client";

/**
 * Review toolbar (only when NEXT_PUBLIC_REVIEW_MODE=true): jump to one example
 * page of each template, or open /review/ for every built URL. Removed at launch
 * by setting NEXT_PUBLIC_REVIEW_MODE=false.
 */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const SHOWCASE = [
  { label: "★ Bed Bug Furniture Removal (Ads)", href: "/services/residential-junk-removal-services/bed-bug-furniture-removal-services/" },
  { label: "Home", href: "/" },
  { label: "Item removal: Couch", href: "/services/residential-junk-removal-services/couch-removal-services/" },
  { label: "Cleanout: Estate", href: "/services/junk-cleanout-services/estate-cleanout-services/" },
  { label: "Commercial: Business cleanout", href: "/services/commercial-junk-removal-services/business-cleanout-services/" },
  { label: "Demolition: Deck", href: "/services/junk-demolition-services/deck-demolition-services/" },
  { label: "Town hub: Toronto", href: "/locations/toronto/" },
  { label: "Location × service: Eviction in Toronto", href: "/locations/toronto/eviction-cleanout-services-in-toronto/" },
  { label: "Ads landing: /bed-bug-furniture-removal/", href: "/bed-bug-furniture-removal/" },
  { label: "Ads landing: /junk-removal/", href: "/junk-removal/" },
  { label: "Services hub", href: "/services/" },
  { label: "Category: Residential", href: "/services/residential-junk-removal-services/" },
  { label: "Locations", href: "/locations/" },
  { label: "How It Works", href: "/how-it-works/" },
  { label: "About", href: "/about/" },
  { label: "Contact / booking", href: "/contact/" },
  { label: "Blog", href: "/blog/" },
  { label: "Thank-you", href: "/thankpage-schedule/" },
];
const OTHER = "__other";

export function ReviewBar() {
  const pathname = usePathname();
  const router = useRouter();
  const current = SHOWCASE.find((p) => p.href === pathname)?.href ?? OTHER;
  return (
    <div className="pv" role="region" aria-label="Preview controls">
      <div className="wrap">
        <b>Live Junk Free — new site</b>
        <span className="hide-m">Phase {process.env.NEXT_PUBLIC_BUILD_PHASE ?? "1"} preview</span>
        <select aria-label="Jump to a template" value={current} onChange={(e) => e.target.value !== OTHER && router.push(e.target.value)}>
          {current === OTHER ? (
            <option value={OTHER} disabled>
              {pathname}
            </option>
          ) : null}
          {SHOWCASE.map((p) => (
            <option key={p.href} value={p.href}>
              {p.label}
            </option>
          ))}
        </select>
        <span className="sp" />
        <Link className="pv-btn" href="/review/">
          All pages
        </Link>
      </div>
    </div>
  );
}
