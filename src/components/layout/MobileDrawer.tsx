"use client";

/**
 * Mobile menu: slides in from the right; one accordion per service group.
 * Content used: content/navigation.json, content/site.json.
 */
import Link from "next/link";
import { useEffect, useRef } from "react";
import { navigation, site } from "@/lib/content/client";
import { Icon } from "../icons";
import { Logo } from "./Logo";

export function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      className={open ? "drawer open" : "drawer"}
      id="drawer"
      inert={!open}
      onClick={(e) => {
        const t = e.target as HTMLElement;
        if (t === e.currentTarget || t.closest("a")) onClose();
      }}
    >
      <div className="panel" role="dialog" aria-modal="true" aria-label="Menu">
        <div className="top">
          <Logo height={36} />
          <button ref={closeRef} type="button" className="burger" aria-label="Close menu" onClick={onClose}>
            <Icon name="x" width={26} height={26} />
          </button>
        </div>
        {navigation.mega.map((g) => (
          <details key={g.label}>
            <summary>
              {g.label} <Icon name="chev" />
            </summary>
            <ul>
              {g.items.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
              <li>
                <Link href={g.all.href}>{g.all.label}</Link>
              </li>
            </ul>
          </details>
        ))}
        {navigation.header.map((l) => (
          <Link key={l.href} className="dl" href={l.href}>
            {l.label}
          </Link>
        ))}
        <a className="btn btn-dark" href={`tel:${site.phone.tel}`}>
          <Icon name="phone" /> Call {site.phone.display}
        </a>
        <Link className="btn btn-primary" href={navigation.cta.href}>
          {navigation.cta.label}
        </Link>
      </div>
    </div>
  );
}
