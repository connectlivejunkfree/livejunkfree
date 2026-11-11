/**
 * Sticky mobile bar (≤760px): Call + Get a quote. Always visible on mobile.
 * "Get a quote" scrolls to the page's quote form when it has one.
 * Content used: content/site.json.
 */
import Link from "next/link";
import { site } from "@/lib/content";
import { Icon } from "../icons";

export function MobileCallBar({ quoteHref = "/contact/", quoteLabel = "Get a quote" }: { quoteHref?: string; quoteLabel?: string }) {
  return (
    <div className="mbar">
      <a className="btn btn-dark" href={`tel:${site.phone.tel}`} data-track="phone">
        <Icon name="phone" /> Call now
      </a>
      {quoteHref.startsWith("#") ? (
        <a className="btn btn-primary" href={quoteHref}>
          {quoteLabel}
        </a>
      ) : (
        <Link className="btn btn-primary" href={quoteHref}>
          {quoteLabel}
        </Link>
      )}
    </div>
  );
}
