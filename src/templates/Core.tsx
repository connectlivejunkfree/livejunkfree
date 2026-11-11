/**
 * Template 1 — Core pages.
 *   CoreHome    "/"            full-bleed real crew photo hero + quick quote card, then the page's sections.
 *   CorePage    about, how it works, locations index, services hub, privacy policy.
 *   CoreContact "/contact/"    the live booking form (same fields/options) + phone, email, hours, map.
 * Content: content/pages/home.json, about.json, how-it-works.json, contact.json, …
 */
import Link from "next/link";
import { AutoPage, iconFor } from "@/components/designed/auto/AutoPage";
import { BookingForm } from "@/components/forms/BookingForm";
import { PageShell } from "@/components/layout/PageShell";
import { MapEmbed } from "@/components/sections/Areas";
import { ContentSections } from "@/components/sections/ContentSections";
import { CtaBand, LinkGrid } from "@/components/sections/Extras";
import { PhotoHero, PlainHero } from "@/components/sections/Hero";
import { Icon } from "@/components/icons";
import { JsonLd } from "@/components/ui/JsonLd";
import { site, type PageDoc } from "@/lib/content";
import { breadcrumbs, extractHero, hubChildren } from "@/lib/content/page";
import { breadcrumbNode, graph } from "@/lib/seo/schema";

export function CoreHome({ doc }: { doc: PageDoc }) {
  const hero = extractHero(doc);
  const image = hero.image ?? { src: "/images/brand/og-default.webp", alt: "Live Junk Free crew in front of the company truck" };
  return (
    <PageShell quoteHref="#quote-form">
      <JsonLd data={graph(breadcrumbNode([{ label: "Home", href: "/" }]))} />
      <PhotoHero h1={hero.h1} sub={hero.sub} trust={hero.trust} ctas={hero.ctas} image={image} />
      <ContentSections sections={hero.rest} formAnchor="#quote-form" />
      <CtaBand formAnchor="#quote-form" />
    </PageShell>
  );
}

export function CorePage({ doc }: { doc: PageDoc }) {
  const crumbs = breadcrumbs(doc);
  const hero = extractHero(doc);
  const extra =
    doc.path === "/locations/"
      ? { title: "All service areas", links: site.towns.map((t) => ({ label: t.name, href: `/locations/${t.slug}/` })) }
      : doc.path === "/services/"
        ? { title: "Our services", links: hubChildren("/services/") }
        : null;
  return (
    <PageShell>
      <JsonLd data={graph(breadcrumbNode(crumbs))} />
      <PlainHero h1={hero.h1} eyebrow={hero.eyebrow} sub={hero.sub} trust={[]} ctas={hero.ctas} crumbs={crumbs} image={hero.image} />
      <ContentSections sections={hero.rest} />
      {extra ? <LinkGrid title={extra.title} links={extra.links} tone="soft" /> : null}
      <CtaBand />
    </PageShell>
  );
}

export function CoreContact({ doc }: { doc: PageDoc }) {
  const crumbs = breadcrumbs(doc);
  return (
    <PageShell quoteHref="#booking-form">
      <JsonLd data={graph(breadcrumbNode(crumbs))} />
      <section className="hero">
        <div className="wrap contact-grid">
          <div className="stack-lg">
            <nav className="crumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true">›</span>
              <b aria-current="page">Contact</b>
            </nav>
            <h1 className="d1">{doc.h1 && doc.h1 !== "Contact" ? doc.h1 : "Book Your Appointment"}</h1>
            <div className="panel stack">
              <p className="small muted">Call or text</p>
              <a className="callbig" href={`tel:${site.phone.tel}`} data-track="phone">
                {site.phone.display}
              </a>
              <p className="small">
                <a className="tlink" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
              </p>
              <p className="small muted">{site.hours.display}</p>
              <div className="social">
                {site.socials.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                    {s.short}
                  </a>
                ))}
              </div>
            </div>
            <MapEmbed className="min-h-[260px]!" />
          </div>
          <div className="panel form-panel">
            <BookingForm />
          </div>
        </div>
      </section>
      <ContentSections sections={doc.sections.filter((s) => s.blocks.some((b) => b.t !== "h" && b.t !== "form"))} />
    </PageShell>
  );
}

/** Service category pages (/services/<category>/): demo design (AutoPage) + every service in the category as link cards. */
export function ServiceHub({ doc }: { doc: PageDoc }) {
  const crumbs = breadcrumbs(doc);
  const children = hubChildren(doc.path);
  return (
    <AutoPage
      doc={doc}
      variant="hub"
      jsonLd={graph(breadcrumbNode(crumbs))}
      listed={children.map((c) => c.label)}
      afterHero={
        children.length ? (
          <section className="sec white">
            <div className="wrap stack-lg">
              <div className="sec-head">
                <div className="stack-sm">
                  <p className="eyebrow">{children.length} services</p>
                  <h2 className="d2">All services in this category</h2>
                </div>
              </div>
              <div className="svc-grid">
                {children.map((c) => (
                  <Link key={c.href} className="svc-card" href={c.href}>
                    <span className="icon" aria-hidden="true">
                      <Icon name={iconFor(c.label)} />
                    </span>
                    <b>{c.label}</b>
                    <span className="go" aria-hidden="true">
                      <Icon name="arrow" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null
      }
    />
  );
}

/** Thank-you pages (noindex): confirmation copy from the page + next steps. Fires the lead_thank_you event. */
export function ThankYou({ doc }: { doc: PageDoc }) {
  const hero = extractHero(doc);
  return (
    <PageShell>
      <JsonLd data={graph(breadcrumbNode(breadcrumbs(doc)))} />
      <section className="hero">
        <div className="wrap one">
          <div className="stack-lg thanks">
            <span className="thanks-tick" aria-hidden="true">
              <svg viewBox="0 0 26 26" fill="none">
                <circle cx="13" cy="13" r="12" fill="#169B5E" />
                <path d="M7.5 13.5l3.5 3.5 7.5-8" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <h1 className="d1">{hero.h1}</h1>
            <p className="lead">Thank you. Your request has been sent to the Live Junk Free team. We&apos;ll be in touch shortly.</p>
            <div className="btn-row">
              <a className="btn btn-primary" href={`tel:${site.phone.tel}`} data-track="phone">
                <Icon name="phone" /> Call {site.phone.display}
              </a>
              <Link className="btn btn-ghost" href="/">
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </section>
      <ContentSections sections={hero.rest} />
    </PageShell>
  );
}
