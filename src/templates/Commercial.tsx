/**
 * Template 4 — Commercial (office, warehouse, retail, property managers).
 * Content: content/pages/services/commercial-junk-removal-services/<slug>.json
 */
import type { PageDoc } from "@/lib/content";
import { ServiceLayout } from "./ServiceLayout";
import { serviceRelated } from "./relatedLinks";

export function Commercial({ doc }: { doc: PageDoc }) {
  return <ServiceLayout variant="commercial" doc={doc} formService="Commercial junk removal" related={serviceRelated(doc, "Commercial")} />;
}
