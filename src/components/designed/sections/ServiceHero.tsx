import Link from "next/link";
import type { Crumb, HeroContent } from "@content/designed/types";
import { HREF } from "@content/designed/routes";
import { SITE } from "@content/designed/site";
import { Icon } from "@/components/icons";
import { Breadcrumbs } from "../ui/Breadcrumbs";
import { Photo } from "../ui/Photo";
import { Rating } from "../ui/Rating";
import { Rich } from "../ui/Rich";
import { Ticks } from "../ui/Ticks";
import { WordReveal } from "./WordReveal";

/** Text-left / image-right hero shared by every service and location template. */
export function ServiceHero({ hero, crumbs, path }: { hero: HeroContent; crumbs: Crumb[]; path: string }) {
  const { h1, lead, ticks, image, alt, cap, primary = "Get a free quote", secondary = true, callout } = hero;
  return (
    <section className="hero">
      <div className="wrap">
        <div className="stack-lg">
          <Breadcrumbs crumbs={crumbs} path={path} />
          <h1 className="d1 mt-0">
            <WordReveal text={h1} />
          </h1>
          <p className="lead">
            <Rich text={lead} />
          </p>
          <Ticks items={ticks} />
          <div className="btn-row">
            <Link className="btn btn-primary" href={HREF.contact}>
              {primary}
            </Link>
            {secondary ? (
              <a className="btn btn-ghost" href={SITE.tel}>
                <Icon name="phone" /> {SITE.phone}
              </a>
            ) : null}
          </div>
          <Rating />
          {callout ? (
            <div className="callout small">
              <b>{callout.title}</b>
              <br />
              <span className="muted">{callout.note}</span>
            </div>
          ) : null}
        </div>
        <Photo image={image} alt={alt} cap={cap} sizes="(max-width: 960px) 100vw, 600px" priority />
      </div>
    </section>
  );
}

/** Single-column page hero (hub, pricing, locations index). */
export function PageHero({ crumbs, path, h1, lead, maxCh, children }: { crumbs: Crumb[]; path: string; h1: string; lead: string; maxCh?: number; children?: React.ReactNode }) {
  return (
    <section className="hero">
      <div className="wrap one">
        <div className="stack-lg">
          <Breadcrumbs crumbs={crumbs} path={path} />
          <h1 className="d1" style={maxCh ? { maxWidth: `${maxCh}ch` } : undefined}>
            <WordReveal text={h1} />
          </h1>
          <p className="lead">{lead}</p>
          {children}
        </div>
      </div>
    </section>
  );
}
