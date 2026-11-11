/**
 * Template 8 — Google Ads landing page: minimal header (logo + phone, no main
 * navigation), quote form above the fold, the page's sections, closing CTA.
 * Content: content/pages/<landing-slug>.json
 */
import type { PageDoc } from "@/lib/content";
import { ServiceLayout } from "./ServiceLayout";

export function AdsLanding({ doc }: { doc: PageDoc }) {
  return <ServiceLayout variant="ads" doc={doc} showSummary={false} />;
}
