import Link from "next/link";
import { HREF } from "@content/designed/routes";
import { CATEGORIES, CATEGORY_ORDER, type CategoryKey } from "@content/designed/services";
import { SERVICES_HUB } from "@content/designed/pages/other";
import { Photo } from "../ui/Photo";

/** Where each audience card on the hub leads (the designed template pages). */
const TARGET: Record<CategoryKey, string> = {
  residential: HREF.couch,
  commercial: HREF.office,
  cleanouts: HREF.estate,
  demolition: HREF.deck,
};

/** Services hub: four photo cards, one per audience. */
export function AudienceCards() {
  return (
    <div className="route-mini">
      {CATEGORY_ORDER.map((k) => {
        const c = CATEGORIES[k].card;
        return (
          <Link key={k} className="route" href={TARGET[k]}>
            <Photo image={c.image} alt={c.title} sizes="(max-width: 480px) 100vw, (max-width: 960px) 50vw, 300px" />
            <div className="body">
              <h2 className="h4">{c.title}</h2>
              <p className="items">{c.text}</p>
              <span className="go">{SERVICES_HUB.cardCta}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
