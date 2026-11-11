/**
 * Template 3 — Property / sensitive cleanouts (estate, hoarding, eviction, bereavement, storage…).
 * Sensitive cleanouts use the calm variant (ink buttons, dark CTA band).
 * Content: content/pages/services/junk-cleanout-services/<slug>.json
 */
import type { PageDoc } from "@/lib/content";
import { ServiceLayout } from "./ServiceLayout";
import { serviceRelated } from "./relatedLinks";

const SENSITIVE = /estate|hoarding|eviction|bereavement|downsizing|foreclosure/;

export function Cleanout({ doc }: { doc: PageDoc }) {
  return <ServiceLayout variant="cleanout" doc={doc} calm={SENSITIVE.test(doc.path)} formService="Cleanouts" related={serviceRelated(doc, "Cleanout")} />;
}
