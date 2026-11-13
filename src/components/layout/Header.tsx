"use client";

/**
 * Site header: floating pill with the Services mega-menu (Residential /
 * Commercial / Cleanouts / Demolition, each with an "All …" link), top links,
 * phone and "Book Now". Condenses on scroll. Mobile: burger → drawer.
 * Content used: content/navigation.json, content/site.json.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navigation, site } from "@/lib/content/client";
import { Icon, type IconName } from "../icons";
import { Logo } from "./Logo";
import { MobileDrawer } from "./MobileDrawer";

/** True on devices with a real mouse (hover opens the menu; touch uses tap). */
const canHover = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches;

/** Menu label without the repeated "Services" so each fits on one line ("Couch Removal Services" → "Couch Removal"). */
function shortLabel(label: string) {
  return label
    .replace(/\s+Services$/i, "")
    .replace(/Cleanouts$/, "Cleanout")
    .replace(/^Property Management Cleanout$/, "Property Management");
}

export function Header() {
  const pathname = usePathname();
  const [mega, setMega] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const liRef = useRef<HTMLLIElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  // Short grace period on mouse-out so a diagonal move from "Services" to the wide menu doesn't close it.
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const openMega = () => {
    clearTimeout(closeTimer.current);
    setMega(true);
  };
  const closeMegaSoon = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMega(false), 250);
  };
  useEffect(() => () => clearTimeout(closeTimer.current), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mega) return;
    const onDoc = (e: MouseEvent) => {
      if (!liRef.current?.contains(e.target as Node)) setMega(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMega(false);
        liRef.current?.querySelector("button")?.focus();
      }
    };
    // Safety nets, so the big menu never lingers over the page:
    // scrolling closes it, and so does the pointer being anywhere outside it
    // (covers a missed mouseleave, e.g. after scrolling under a still pointer)
    // or leaving the browser window.
    const startY = window.scrollY;
    const onScroll = () => {
      if (Math.abs(window.scrollY - startY) > 40) setMega(false);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (liRef.current?.contains(e.target as Node))
        clearTimeout(closeTimer.current);
      else closeMegaSoon();
    };
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget && canHover()) closeMegaSoon();
    };
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseout", onOut);
    return () => {
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseout", onOut);
    };
  }, [mega]);

  const active = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header className={scrolled ? "hdr scrolled" : "hdr"}>
        <div className="wrap">
          <Logo />
          <nav aria-label="Main">
            <ul className="nav">
              <li
                ref={liRef}
                className={mega ? "has-mega open" : "has-mega"}
                onMouseEnter={() => canHover() && openMega()}
                onMouseLeave={() => canHover() && closeMegaSoon()}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node))
                    setMega(false);
                }}
              >
                <button
                  type="button"
                  aria-expanded={mega}
                  aria-controls="mega-menu"
                  className={active("/services/") ? "on" : undefined}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMega((v) => (canHover() ? true : !v));
                  }}
                >
                  Services <Icon name="chev" />
                </button>
                <div
                  className="mega"
                  id="mega-menu"
                  onClick={(e) =>
                    (e.target as HTMLElement).closest("a") && setMega(false)
                  }
                >
                  {navigation.mega.map((g) => (
                    <div key={g.label} className="col">
                      <p className="mh">
                        <span className="ic">
                          <Icon name={g.icon as IconName} />
                        </span>
                        <span>
                          <b>{g.label}</b>
                          <small>{g.blurb}</small>
                        </span>
                      </p>
                      <ul>
                        {g.items.map((l) => (
                          <li key={l.href}>
                            <Link href={l.href} title={l.label}>
                              {shortLabel(l.label)}
                            </Link>
                          </li>
                        ))}
                        <li className="all-li">
                          <Link className="all" href={g.all.href}>
                            {g.all.label.replace(
                              /^All (.+?) services$/i,
                              (_, w: string) =>
                                `View all ${w.toLowerCase() === "cleanout" ? "cleanouts" : w}`,
                            )}{" "}
                            →
                          </Link>
                        </li>
                      </ul>
                    </div>
                  ))}
                  <div className="promo">
                    <span className="eb">Free estimate</span>
                    <p className="h4">Not sure which service you need?</p>
                    <p>
                      Send a photo or tell us what&apos;s going — we&apos;ll
                      quote it upfront, often same day.
                    </p>
                    <Link
                      className="btn btn-primary btn-sm"
                      href={navigation.cta.href}
                    >
                      Get a free quote
                    </Link>
                    <a className="ph" href={`tel:${site.phone.tel}`}>
                      <Icon name="phone" />
                      {site.phone.display}
                    </a>
                    <ul className="chk">
                      <li>✓ Upfront, all-in pricing</li>
                      <li>✓ Same-day pickup available</li>
                      <li>✓ Fully insured crew</li>
                    </ul>
                  </div>
                </div>
              </li>
              {navigation.header.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={active(l.href) ? "on" : undefined}
                    aria-current={pathname === l.href ? "page" : undefined}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="hdr-cta">
            <a className="hdr-phone" href={`tel:${site.phone.tel}`}>
              <Icon name="phone" />
              {site.phone.display}
            </a>
            <Link className="btn btn-primary btn-sm" href={navigation.cta.href}>
              {navigation.cta.label}
            </Link>
          </div>
          <button
            ref={burgerRef}
            type="button"
            className="burger"
            aria-label="Open menu"
            aria-expanded={drawer}
            aria-controls="drawer"
            onClick={() => setDrawer(true)}
          >
            <Icon name="menu" />
          </button>
        </div>
      </header>
      <MobileDrawer
        open={drawer}
        onClose={() => {
          setDrawer(false);
          burgerRef.current?.focus();
        }}
      />
    </>
  );
}
