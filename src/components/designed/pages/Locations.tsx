import { PageShell } from "@/components/designed/layout/PageShell";
import { MapEmbed } from "@/components/designed/sections/Areas";
import { Sec } from "@/components/designed/sections/Blocks";
import { CtaBand } from "@/components/designed/sections/CtaBand";
import { LocationsFinder } from "@/components/designed/sections/RegionList";
import { GAP } from "@/components/designed/templates/ServiceTemplates";
import { Rich } from "@/components/designed/ui/Rich";
import { Icon } from "@/components/icons";
import Link from "next/link";
import { LOCATIONS_INDEX } from "@content/designed/pages/other";
import { HREF } from "@content/designed/routes";
import { SITE } from "@content/designed/site";


export function LocationsPage() {
  const o = LOCATIONS_INDEX.outside;
  return (
    <PageShell>
      <LocationsFinder path={HREF.locations} />
      <Sec wrapClassName={`grid g2 items-center ${GAP}`}>
        <MapEmbed className="min-h-[360px]!" />
        <div className="stack">
          <h2 className="d2">{o.title}</h2>
          <p className="muted">
            <Rich text={o.text} />
          </p>
          <div className="btn-row">
            <Link className="btn btn-primary" href={HREF.contact}>
              {o.cta}
            </Link>
            <a className="btn btn-ghost" href={SITE.tel}>
              <Icon name="phone" /> {SITE.phone}
            </a>
          </div>
        </div>
      </Sec>
      <CtaBand />
    </PageShell>
  );
}
