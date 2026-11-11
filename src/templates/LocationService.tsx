/**
 * Template 7 — Location × service (/locations/<town>/<service>-in-<town>/ and /locations/<service>-in-<town>/).
 * Links back to the town hub, the parent service page and 3 nearby towns.
 * Content: content/pages/locations/<town>/<slug>.json or content/pages/locations/<slug>.json
 */
import { manifestRow, townName, type PageDoc } from "@/lib/content";
import { locationLinks } from "@/lib/content/page";
import { ServiceLayout } from "./ServiceLayout";

export function LocationService({ doc }: { doc: PageDoc }) {
  const town = manifestRow(doc.path)?.town ?? null;
  const { links, nearby } = locationLinks(doc, town);
  return (
    <ServiceLayout
      variant="location"
      doc={doc}
      town={town ? townName(town) : undefined}
      related={[
        ...(links.length ? [{ title: "Related pages", links }] : []),
        ...(nearby.length ? [{ title: "Nearby towns", links: nearby }] : []),
      ]}
    />
  );
}
