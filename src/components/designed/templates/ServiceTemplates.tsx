/**
 * Service page templates, ported from the design's PAGES:
 * couch-removal (item), estate-cleanout (cleanout), office-cleanout (commercial),
 * deck-demolition (demolition).
 */
import Link from "next/link";
import type { CleanoutContent, CommercialContent, Crumb, DemolitionContent, ItemContent } from "@content/designed/types";
import { Icon } from "@/components/icons";
import { PageShell } from "@/components/designed/layout/PageShell";
import { Faq, PriceNote, Sec, SecHead, Steps } from "../sections/Blocks";
import { CtaBand } from "../sections/CtaBand";
import { LoadMeter } from "../sections/LoadMeter";
import { Reviews } from "../sections/Reviews";
import { ServiceHero } from "../sections/ServiceHero";
import { JsonLd } from "../ui/JsonLd";
import { Panel } from "../ui/Panel";
import { RelatedLinks } from "../ui/RelatedLinks";
import { Rich } from "../ui/Rich";
import { Ticks } from "../ui/Ticks";
import { service as serviceLd } from "@/components/designed/lib/schema";

/** gap:clamp(24px,4vw,56px) used by the design's two-column sections. */
export const GAP = "gap-[clamp(24px,4vw,56px)]!";

type Base = { crumbs: Crumb[]; path: string; pending: boolean; name: string };

export function ItemTemplate({ c, crumbs, path, pending, name }: Base & { c: ItemContent }) {
  return (
    <PageShell pending={pending} mobileCta={c.mobileCta}>
      <JsonLd data={serviceLd(name, c.hero.lead, path)} />
      <ServiceHero hero={c.hero} crumbs={crumbs} path={path} />
      <Sec>
        <div className={`grid g2 ${GAP}`}>
          <div className="stack">
            <h2 className="d2">{c.take.title}</h2>
            <p className="muted">
              <Rich text={c.take.intro} />
            </p>
            <Ticks items={c.take.ticks} className="two" />
            {c.take.note ? (
              <p className="small muted">
                <Rich text={c.take.note} />
              </p>
            ) : null}
          </div>
          <div className="grid g2">
            {c.panels.map((p) => (
              <Panel key={p.title} {...p} />
            ))}
          </div>
        </div>
      </Sec>
      <Sec variant="white">
        <SecHead title={c.pricing.title} intro={c.pricing.intro} />
        <div className="grid g2">
          {c.pricing.panels.map((p) => (
            <div key={p.title} className="panel stack">
              <h3 className="h4">{p.title}</h3>
              <p className="small muted">{p.text}</p>
              <Ticks items={p.ticks} className="small" />
            </div>
          ))}
        </div>
      </Sec>
      <Sec>
        <SecHead title={c.steps.title} />
        <Steps list={c.steps.list} />
      </Sec>
      <Sec variant="white">
        <Reviews ids={c.reviews} />
      </Sec>
      <Sec>
        <Faq list={c.faq} />
      </Sec>
      <Sec variant="white tight" wrapClassName="grid g2">
        {c.related.map((r) => (
          <RelatedLinks key={r.title} {...r} />
        ))}
      </Sec>
      <CtaBand {...c.cta} />
    </PageShell>
  );
}

export function CleanoutTemplate({ c, crumbs, path, pending, name }: Base & { c: CleanoutContent }) {
  return (
    <PageShell calm={c.calm} pending={pending} mobileCta={c.mobileCta}>
      <JsonLd data={serviceLd(name, c.hero.lead, path)} />
      <ServiceHero hero={c.hero} crumbs={crumbs} path={path} />
      <Sec wrapClassName="split">
        <div className="stack">
          <h2 className="d2">{c.includes.title}</h2>
          <p className="muted">{c.includes.intro}</p>
        </div>
        <div className="grid g2">
          {c.includes.panels.map((p) => (
            <Panel key={p.title} {...p} />
          ))}
        </div>
      </Sec>
      <Sec variant="white">
        <SecHead title={c.steps.title} intro={c.steps.intro} />
        <Steps list={c.steps.list} />
      </Sec>
      <Sec wrapClassName={`grid g2 ${GAP} items-start`}>
        <div className="stack">
          <h2 className="d2">{c.audience.title}</h2>
          <Ticks items={c.audience.ticks} />
        </div>
        <div className="callout calm stack">
          <h3 className="h4">{c.limits.title}</h3>
          <p className="small muted">
            <Rich text={c.limits.text} />
          </p>
          <p className="small muted">
            <Rich text={c.limits.note} />
          </p>
        </div>
      </Sec>
      <Sec variant="white">
        <SecHead title={c.pricing.title} intro={c.pricing.intro} />
        <LoadMeter />
      </Sec>
      <Sec>
        <Reviews ids={c.reviews} />
      </Sec>
      <Sec variant="white">
        <Faq list={c.faq} />
      </Sec>
      <CtaBand {...c.cta} />
    </PageShell>
  );
}

export function CommercialTemplate({ c, crumbs, path, pending, name }: Base & { c: CommercialContent }) {
  return (
    <PageShell pending={pending} mobileCta={c.mobileCta}>
      <JsonLd data={serviceLd(name, c.hero.lead, path)} />
      <ServiceHero hero={c.hero} crumbs={crumbs} path={path} />
      <Sec variant="white tight">
        <div className="route-mini">
          {c.segments.map((s) => (
            <div key={s.title} className="panel flat">
              <h2 className="h4">{s.title}</h2>
            </div>
          ))}
        </div>
      </Sec>
      <Sec wrapClassName={`grid g2 ${GAP} items-start`}>
        <div className="stack">
          <h2 className="d2">{c.schedule.title}</h2>
          <p className="muted">{c.schedule.intro}</p>
          <Ticks items={c.schedule.ticks} />
        </div>
        <div className="panel stack">
          <h3 className="h4">{c.includes.title}</h3>
          <Ticks items={c.includes.items} className="small" />
        </div>
      </Sec>
      <Sec>
        <SecHead title={c.pricing.title} intro={c.pricing.intro} />
        <PriceNote text={c.pricing.note} />
      </Sec>
      <Sec variant="slate">
        <SecHead title={c.steps.title} />
        <Steps list={c.steps.list} />
      </Sec>
      <Sec>
        <Reviews ids={c.reviews} />
      </Sec>
      <Sec variant="white">
        <Faq list={c.faq} />
      </Sec>
      <CtaBand {...c.cta} />
    </PageShell>
  );
}

export function DemolitionTemplate({ c, crumbs, path, pending, name }: Base & { c: DemolitionContent }) {
  return (
    <PageShell pending={pending}>
      <JsonLd data={serviceLd(name, c.hero.lead, path)} />
      <ServiceHero hero={c.hero} crumbs={crumbs} path={path} />
      <Sec wrapClassName="grid g3">
        <div className="panel stack">
          <h2 className="h4">Included</h2>
          <Ticks items={c.scope.included} className="small" />
        </div>
        <div className="panel stack">
          <h2 className="h4">Before we arrive</h2>
          <Ticks items={c.scope.before} className="small" />
        </div>
        <div className="panel stack">
          <h2 className="h4">Not included</h2>
          <ul className="small muted list-disc pl-[18px]">
            {c.scope.excluded.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </Sec>
      <Sec variant="white">
        <SecHead title={c.pricing.title} intro={c.pricing.intro} />
        <PriceNote text={c.pricing.note} />
      </Sec>
      <Sec>
        <SecHead title={c.steps.title} />
        <Steps list={c.steps.list} />
      </Sec>
      <Sec variant="white">
        <SecHead title={c.other.title} />
        <div className="items">
          {c.other.items.map((i) => (
            <Link key={i.label} className="item" href={i.href}>
              <Icon name={i.icon} />
              {i.label}
            </Link>
          ))}
        </div>
      </Sec>
      <Sec>
        <Faq list={c.faq} />
      </Sec>
      <CtaBand {...c.cta} />
    </PageShell>
  );
}
