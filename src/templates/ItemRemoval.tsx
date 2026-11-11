/**
 * Template 2 — General item removal (couch, mattress, appliances, bed bug furniture…).
 * Renders: conversion hero with quote form, summary, the page's sections, related services, CTA.
 * Content: content/pages/services/residential-junk-removal-services/<slug>.json
 */
import type { PageDoc } from "@/lib/content";
import { ServiceLayout } from "./ServiceLayout";
import { serviceRelated } from "./relatedLinks";

/** Google Ads destinations: quote form in the hero (Priority 0: bed bug furniture removal). */
const ADS_DESTINATIONS = new Set(["/services/residential-junk-removal-services/bed-bug-furniture-removal-services/"]);

export function ItemRemoval({ doc }: { doc: PageDoc }) {
  return <ServiceLayout variant="item" doc={doc} formService="Residential junk removal" related={serviceRelated(doc, "Residential")} formHero={ADS_DESTINATIONS.has(doc.path)} />;
}
