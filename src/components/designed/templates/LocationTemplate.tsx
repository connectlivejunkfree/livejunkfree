import Link from "next/link";
import type { Crumb, LocationContent } from "@content/designed/types";
import { Icon } from "@/components/icons";
import { PageShell } from "@/components/designed/layout/PageShell";
import { MapEmbed } from "../sections/Areas";
import { Faq, Sec, SecHead } from "../sections/Blocks";
import { CtaBand } from "../sections/CtaBand";
import { Reviews } from "../sections/Reviews";
import { ServiceHero } from "../sections/ServiceHero";
import { Panel } from "../ui/Panel";
import { RelatedLinks } from "../ui/RelatedLinks";
import { Rich } from "../ui/Rich";
import { GAP } from "./ServiceTemplates";

/** Template: Location (Toronto). */
export function LocationTemplate({ c, crumbs, path, pending }: { c: LocationContent; crumbs: Crumb[]; path: string; pending: boolean }) {
  return (
    <PageShell pending={pending}>
      <ServiceHero hero={c.hero} crumbs={crumbs} path={path} />
      <Sec wrapClassName={`grid g2 ${GAP} items-start`}>
        <div className="stack">
          <h2 className="d2">{c.local.title}</h2>
          <p className="muted measure">
            <Rich text={c.local.intro} />
          </p>
          {c.local.panels.map((p) => (
            <Panel key={p.title} title={p.title} text={p.text} />
          ))}
        </div>
        <div className="stack">
          <h2 className="d3">{c.neighbourhoods.title}</h2>
          <ul className="areas plain">
            {c.neighbourhoods.list.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <MapEmbed />
        </div>
      </Sec>
      <Sec variant="white">
        <SecHead title={c.popular.title} />
        <div className="route-mini">
          {c.popular.items.map((i) => (
            <Link key={i.label} className="route" href={i.href}>
              <div className="body">
                <div className="icon">
                  <Icon name={i.icon} />
                </div>
                <h3 className="h4">{i.label}</h3>
                <span className="go">Learn more</span>
              </div>
            </Link>
          ))}
        </div>
      </Sec>
      <Sec>
        <Reviews ids={c.reviews} />
      </Sec>
      <Sec variant="white">
        <Faq list={c.faq} />
      </Sec>
      <Sec variant="tight">
        <RelatedLinks {...c.nearby} />
      </Sec>
      <CtaBand {...c.cta} />
    </PageShell>
  );
}
