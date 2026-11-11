/**
 * Template 6 — Town hub (/locations/<town>/).
 * Adds: geo meta (in generateMetadata), the town's location × service pages,
 * a map, and links to nearby towns.
 * Content: content/pages/locations/<town>.json
 */
import { MapEmbed } from "@/components/sections/Areas";
import { townName, type PageDoc } from "@/lib/content";
import { nearbyTowns, townServices } from "@/lib/content/page";
import { ServiceLayout } from "./ServiceLayout";

export function TownHub({ doc }: { doc: PageDoc }) {
  const town = doc.path.split("/").filter(Boolean)[1];
  const name = townName(town);
  const services = townServices(town);
  return (
    <ServiceLayout
      variant="town"
      doc={doc}
      serviceName={`Junk removal in ${name}`}
      town={name}
      related={[
        ...(services.length ? [{ title: `Our services in ${name}`, links: services }] : []),
        { title: "Nearby areas", links: nearbyTowns(town, 6).map((t) => ({ label: townName(t), href: `/locations/${t}/` })) },
      ]}
      after={
        <section className="sec">
          <div className="wrap">
            <h2 className="d2 mb-6">Live Junk Free in {name}</h2>
            <MapEmbed className="min-h-[340px]!" />
          </div>
        </section>
      }
    />
  );
}
