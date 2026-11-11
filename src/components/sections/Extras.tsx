/**
 * Supporting sections used by several templates.
 *   SummaryBox — answer-first 2–3 sentence summary, quoted verbatim from the page (GEO).
 *   LinkGrid   — internal links (a town's services, a category's services, nearby towns).
 *   CtaBand    — closing call-to-action: phone + Book Now (dark slate on sensitive pages).
 * Content used: the page's own sentences, content/site.json, manifest titles.
 */
import Link from "next/link";
import { site } from "@/lib/content";
import { Icon } from "../icons";
import { Stars } from "../ui/Stars";

export function SummaryBox({ sentences, label = "In short" }: { sentences: string[]; label?: string }) {
  if (!sentences.length) return null;
  return (
    <section className="summary-band" aria-label={label}>
      <div className="wrap">
        <div className="summary">
          <p className="eyebrow">{label}</p>
          <p className="summary-text">{sentences.join(" ")}</p>
        </div>
      </div>
    </section>
  );
}

export function LinkGrid({ title, links, tone = "white" }: { title: string; links: { label: string; href: string }[]; tone?: "white" | "soft" }) {
  if (!links.length) return null;
  return (
    <section className={`sec tight ${tone}`}>
      <div className="wrap">
        <h2 className="d3 mb-6">{title}</h2>
        <ul className="link-grid">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href}>
                <span>{l.label}</span>
                <Icon name="arrow" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function CtaBand({ title = "Call Now!", text = site.footerBlurb, formAnchor }: { title?: string; text?: string; formAnchor?: string }) {
  return (
    <section className="cta-band on-dark">
      <div className="wrap cta-wrap">
        <div className="stack">
          <h2 className="d2">{title}</h2>
          <p className="lead">{text}</p>
          <a className="rating" href={site.googleBusinessProfile} target="_blank" rel="noopener noreferrer">
            <Stars />
            <span>
              <b>{site.rating.display}</b> from {site.rating.countDisplay} Google reviews
            </span>
          </a>
        </div>
        <div className="stack cta-actions">
          <a className="callbig" href={`tel:${site.phone.tel}`} data-track="phone">
            {site.phone.display}
          </a>
          <p className="muted small">{site.hours.display}</p>
          <div className="btn-row">
            {formAnchor ? (
              <a className="btn btn-primary" href={formAnchor}>
                Get a Free Quote
              </a>
            ) : (
              <Link className="btn btn-primary" href="/contact/">
                Book Now
              </Link>
            )}
            <a className="btn btn-dark" href={`tel:${site.phone.tel}`} data-track="phone">
              <Icon name="phone" /> Call Now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
