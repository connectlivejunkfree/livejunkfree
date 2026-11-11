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
import { Icon } from "../icons";
import { Logo } from "./Logo";
import { MobileDrawer } from "./MobileDrawer";

export function Header() {
  const pathname = usePathname();
  const [mega, setMega] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const liRef = useRef<HTMLLIElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

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
    document.addEventListener("click", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [mega]);

  const canHover = () => typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches;
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

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
                onMouseEnter={() => canHover() && setMega(true)}
                onMouseLeave={() => canHover() && setMega(false)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) setMega(false);
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
                <div className="mega" id="mega-menu" onClick={(e) => (e.target as HTMLElement).closest("a") && setMega(false)}>
                  {navigation.mega.map((g) => (
                    <div key={g.label}>
                      <p className="mh">{g.label}</p>
                      <ul>
                        {g.items.map((l) => (
                          <li key={l.href}>
                            <Link href={l.href}>{l.label}</Link>
                          </li>
                        ))}
                        <li>
                          <Link className="all" href={g.all.href}>
                            {g.all.label} →
                          </Link>
                        </li>
                      </ul>
                    </div>
                  ))}
                </div>
              </li>
              {navigation.header.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={active(l.href) ? "on" : undefined} aria-current={pathname === l.href ? "page" : undefined}>
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
          <button ref={burgerRef} type="button" className="burger" aria-label="Open menu" aria-expanded={drawer} aria-controls="drawer" onClick={() => setDrawer(true)}>
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
