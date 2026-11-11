/**
 * Shared layout for the service, location and Ads templates. Every page is
 * rendered in the client-approved demo design by <AutoPage>
 * (src/components/designed/auto/), filled with the page's own content.
 * JSON-LD: one @graph with LocalBusiness, WebSite, BreadcrumbList and Service.
 * Content used: the page file (content/pages/…), content/site.json.
 */
import type { ReactNode } from "react";
import { AutoPage, type Variant } from "@/components/designed/auto/AutoPage";
import type { PageDoc } from "@/lib/content";
import { breadcrumbs, summary } from "@/lib/content/page";
import { breadcrumbNode, graph, serviceNode } from "@/lib/seo/schema";

export type ServiceLayoutProps = {
  doc: PageDoc;
  variant: Variant;
  calm?: boolean;
  serviceName?: string;
  town?: string;
  formService?: string;
  related?: { title: string; links: { label: string; href: string }[] }[];
  /** Extra sections after the page content (maps, town service grids…). */
  after?: ReactNode;
  showSummary?: boolean;
  formHero?: boolean;
};

const PRICE = /(starts? at|from|only|just)\s+(just\s+)?(C?\$\s?\d)/i;

export function ServiceLayout({ doc, variant, calm, serviceName, town, formService, related = [], after, formHero }: ServiceLayoutProps) {
  const crumbs = breadcrumbs(doc);
  const name = serviceName ?? crumbs[crumbs.length - 1].label;
  const sum = summary(doc);
  const price = sum.find((s) => PRICE.test(s) && s.length <= 150);
  return (
    <AutoPage
      doc={doc}
      variant={variant}
      calm={calm}
      formService={formService}
      jsonLd={graph(breadcrumbNode(crumbs), serviceNode(doc, { name, town }))}
      // No separate "In short" box: the page's first section already answers the question up
      // front (answer-first for GEO), and the box repeated it word for word.
      summary={undefined}
      price={price}
      related={related}
      after={after}
      formHero={formHero}
    />
  );
}
