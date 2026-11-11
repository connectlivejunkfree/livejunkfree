/**
 * Template registry: picks the page template from the content file's
 * `template` field (set by the extraction script from the URL type).
 */
import type { PageDoc } from "@/lib/content";
import { AdsLanding } from "./AdsLanding";
import { BlogIndex, BlogPost } from "./Blog";
import { Cleanout } from "./Cleanout";
import { Commercial } from "./Commercial";
import { CoreContact, CoreHome, CorePage, ServiceHub, ThankYou } from "./Core";
import { Demolition } from "./Demolition";
import { ItemRemoval } from "./ItemRemoval";
import { LocationService } from "./LocationService";
import { TownHub } from "./TownHub";

export function PageTemplate({ doc }: { doc: PageDoc }) {
  switch (doc.template) {
    case "Core":
      if (doc.path === "/") return <CoreHome doc={doc} />;
      if (doc.path === "/contact/") return <CoreContact doc={doc} />;
      return <CorePage doc={doc} />;
    case "Legal":
      return <CorePage doc={doc} />;
    case "ServiceHub":
      return <ServiceHub doc={doc} />;
    case "ItemRemoval":
      return <ItemRemoval doc={doc} />;
    case "Cleanout":
      return <Cleanout doc={doc} />;
    case "Commercial":
      return <Commercial doc={doc} />;
    case "Demolition":
      return <Demolition doc={doc} />;
    case "TownHub":
      return <TownHub doc={doc} />;
    case "LocationService":
      return <LocationService doc={doc} />;
    case "AdsLanding":
      return <AdsLanding doc={doc} />;
    case "BlogIndex":
      return <BlogIndex doc={doc} />;
    case "BlogPost":
      return <BlogPost doc={doc} />;
    case "ThankYou":
      return <ThankYou doc={doc} />;
    default:
      return null;
  }
}
