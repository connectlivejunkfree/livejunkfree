/**
 * Page heroes.
 *   ConversionHero — services, towns, location pages, Ads landings: H1 + lead +
 *     trust points on the left, the quote form on the right (form comes right
 *     after the H1 on mobile so it is above the fold).
 *   PhotoHero — homepage: full-bleed real crew photo, H1, CTAs, quick quote card.
 *   PlainHero — core pages: breadcrumbs, H1, lead, CTAs, optional photo.
 * Content used: the page's own H1, subtitle, CTAs and trust points (extractHero).
 */
import Image from "next/image";
import Link from "next/link";
import { imageSize, site, type Image as ImageT, type Inline } from "@/lib/content";
import { Icon } from "../icons";
import { QuoteForm } from "../forms/QuoteForm";
import { Breadcrumbs } from "../ui/Breadcrumbs";
import { renderInline } from "../ui/InlineText";
import { Photo } from "../ui/Photo";
import { Stars } from "../ui/Stars";
import { WordReveal } from "./WordReveal";

type Crumb = { label: string; href: string };
type Common = {
  h1: string;
  eyebrow?: string;
  sub: Inline[][];
  trust: string[];
  ctas: { label: string; href: string }[];
  crumbs?: Crumb[];
};

function RatingLine() {
  return (
    <a className="rating" href={site.googleBusinessProfile} target="_blank" rel="noopener noreferrer">
      <Stars />
      <span>
        <b>{site.rating.display}</b> from {site.rating.countDisplay} Google reviews
      </span>
    </a>
  );
}

function HeroCtas({ ctas, formAnchor }: { ctas: Common["ctas"]; formAnchor?: string }) {
  const quote = ctas.find((c) => !c.href.startsWith("tel:"));
  return (
    <div className="btn-row hero-ctas">
      {quote ? (
        formAnchor ? (
          <a className="btn btn-primary" href={formAnchor}>
            {quote.label}
          </a>
        ) : (
          <Link className="btn btn-primary" href={quote.href || "/contact/"}>
            {quote.label}
          </Link>
        )
      ) : null}
      <a className="btn btn-ghost" href={`tel:${site.phone.tel}`} data-track="phone">
        <Icon name="phone" /> {site.phone.display}
      </a>
    </div>
  );
}

export function ConversionHero({ h1, eyebrow, sub, trust, ctas, crumbs, formTitle = "Get a Free Quote", service, formType = "quote" }: Common & { formTitle?: string; service?: string; formType?: "quote" | "landing" }) {
  return (
    <section className="hero hero-conv">
      <div className="wrap">
        <div className="hero-copy">
          {crumbs ? <Breadcrumbs crumbs={crumbs} /> : null}
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          {/* Static H1: conversion pages paint the headline instantly (it's the LCP element). */}
          <h1 className="d1">{h1}</h1>
          {sub.slice(0, 1).map((c, i) => (
            <p key={i} className="lead">
              {renderInline(c, `sub${i}`)}
            </p>
          ))}
        </div>
        <div className="hero-form qcard" id="quote">
          <QuoteForm title={formTitle} compact service={service} formType={formType} cta="Get my free quote" />
        </div>
        <div className="hero-extra">
          {sub.slice(1).map((c, i) => (
            <p key={i} className="lead">
              {renderInline(c, `sub2${i}`)}
            </p>
          ))}
          {trust.length ? (
            <ul className="ticks">
              {trust.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          ) : null}
          <HeroCtas ctas={ctas} formAnchor="#quote-form" />
          <RatingLine />
        </div>
      </div>
    </section>
  );
}

export function PhotoHero({ h1, sub, trust, ctas, image }: Common & { image: ImageT }) {
  const size = imageSize(image.src) ?? { width: 2400, height: 1350 };
  return (
    <section className="hero-home">
      <div className="bg parallax">
        <Image src={image.src} alt={image.alt} width={size.width} height={size.height} sizes="100vw" quality={60} preload fetchPriority="high" />
      </div>
      <div className="wrap">
        <div className="stack-lg">
          <div className="pill-row">
            <span className="gpill">
              <Stars /> {site.rating.display} · {site.rating.countDisplay} Google reviews
            </span>
          </div>
          <h1 className="d1">
            <WordReveal text={h1} />
          </h1>
          {sub.slice(0, 2).map((c, i) => (
            <p key={i} className="lead">
              {renderInline(c, `hsub${i}`)}
            </p>
          ))}
          {trust.length ? (
            <ul className="checks on-dark-checks">
              {trust.slice(0, 4).map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          ) : null}
          <div className="btn-row">
            <Link className="btn btn-primary" href={ctas.find((c) => !c.href.startsWith("tel:"))?.href || "/contact/"}>
              {ctas.find((c) => !c.href.startsWith("tel:"))?.label ?? "Book Now"}
            </Link>
            <a className="btn btn-ghost btn-glass" href={`tel:${site.phone.tel}`} data-track="phone">
              <Icon name="phone" /> {site.phone.display}
            </a>
          </div>
        </div>
        <div className="qcard" id="quote">
          <QuoteForm title="Get a Free Quote" compact cta="Get my free quote" />
        </div>
      </div>
    </section>
  );
}

export function PlainHero({ h1, eyebrow, sub, ctas, crumbs, image }: Common & { image?: ImageT }) {
  return (
    <section className="hero">
      <div className={image ? "wrap" : "wrap one"}>
        <div className="stack-lg">
          {crumbs ? <Breadcrumbs crumbs={crumbs} /> : null}
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h1 className="d1">
            <WordReveal text={h1} />
          </h1>
          {sub.slice(0, 2).map((c, i) => (
            <p key={i} className="lead">
              {renderInline(c, `psub${i}`)}
            </p>
          ))}
          {ctas.length ? <HeroCtas ctas={ctas} /> : null}
        </div>
        {image ? <Photo image={image} sizes="(max-width: 960px) 100vw, 600px" priority /> : null}
      </div>
    </section>
  );
}
