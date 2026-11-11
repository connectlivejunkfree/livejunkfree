import Link from "next/link";
import { HOME } from "@content/designed/pages/home";
import { AREAS, TOP_AREAS } from "@content/designed/locations";
import { HREF, city } from "@content/designed/routes";
import { Icon } from "@/components/icons";
import { MapFacade } from "@/components/sections/MapFacade";

/** Homepage: top 10 areas + "+16 more" chip + "Not on the list?" card. */
export function AreasTop() {
  const c = HOME.areas.card;
  return (
    <div className="areas-top">
      <ul className="areas">
        {TOP_AREAS.map((a) => (
          <li key={a}>
            <Link href={city(a)}>{a}</Link>
          </li>
        ))}
        <li>
          <Link className="more" href={HREF.locations}>
            +{AREAS.length - TOP_AREAS.length} more areas
          </Link>
        </li>
      </ul>
      <Link className="areas-card" href={HREF.locations}>
        <span className="icon">
          <Icon name="truck" />
        </span>
        <b className="h4">{c.title}</b>
        <span className="small muted">{c.text}</span>
        <span className="tlink self-start">{c.link}</span>
      </Link>
    </div>
  );
}

/** Live Junk Free's Google Maps listing — designed placeholder, loads Google Maps on tap. */
export function MapEmbed({ className }: { className?: string }) {
  return <MapFacade className={className} />;
}
