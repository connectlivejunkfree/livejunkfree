import { HubTemplate } from "@/components/designed/templates/HubTemplate";
import { SERVICES_HUB } from "@content/designed/pages/other";
import { HREF } from "@content/designed/routes";
import { CATEGORY_ORDER } from "@content/designed/services";


export function ServicesHubPage() {
  return (
    <HubTemplate
      crumbs={[{ label: "Home", href: HREF.home }, { label: "Services" }]}
      path={HREF.services}
      h1={SERVICES_HUB.h1}
      lead={SERVICES_HUB.lead}
      categories={CATEGORY_ORDER}
    />
  );
}
