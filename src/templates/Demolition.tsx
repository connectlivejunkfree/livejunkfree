/**
 * Template 5 — Demolition (deck, shed, fence, hot tub…).
 * Content: content/pages/services/junk-demolition-services/<slug>.json
 */
import type { PageDoc } from "@/lib/content";
import { ServiceLayout } from "./ServiceLayout";
import { serviceRelated } from "./relatedLinks";

export function Demolition({ doc }: { doc: PageDoc }) {
  return <ServiceLayout variant="demolition" doc={doc} formService="Demolition" related={serviceRelated(doc, "Demolition")} />;
}
