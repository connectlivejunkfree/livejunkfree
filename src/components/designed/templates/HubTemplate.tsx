import type { Crumb } from "@content/designed/types";
import { SERVICES_HUB } from "@content/designed/pages/other";
import type { CategoryKey } from "@content/designed/services";
import { PageShell } from "@/components/designed/layout/PageShell";
import { AudienceCards } from "../sections/AudienceCards";
import { Sec, SecHead } from "../sections/Blocks";
import { CtaBand } from "../sections/CtaBand";
import { LoadMeter } from "../sections/LoadMeter";
import { PageHero } from "../sections/ServiceHero";
import { ServicesAz } from "../sections/ServicesAz";

type Props = {
  crumbs: Crumb[];
  path: string;
  h1: string;
  lead: string;
  categories: CategoryKey[];
  /** Category pages are template previews of the hub, filtered to one category. */
  pending?: boolean;
};

/** Services hub (all categories) and the per-category landing pages. */
export function HubTemplate({ crumbs, path, h1, lead, categories, pending }: Props) {
  const all = categories.length > 1;
  return (
    <PageShell pending={pending}>
      <PageHero crumbs={crumbs} path={path} h1={h1} lead={lead} maxCh={16} />
      {all ? (
        <Sec variant="tight">
          <AudienceCards />
        </Sec>
      ) : null}
      <Sec variant="white">
        <SecHead title={SERVICES_HUB.az.title} intro={SERVICES_HUB.az.intro} />
        <ServicesAz categories={categories} />
      </Sec>
      <Sec>
        <SecHead title={SERVICES_HUB.pricingTitle} />
        <LoadMeter compact />
      </Sec>
      <CtaBand />
    </PageShell>
  );
}
