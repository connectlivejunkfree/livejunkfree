/**
 * Live Junk Free's Google Maps listing (the same embed as livejunkfree.ca's homepage),
 * shown as a designed placeholder that loads Google Maps only on tap (see MapFacade).
 * Content used: content/site.json (mapEmbed).
 */
import { MapFacade } from "./MapFacade";

export function MapEmbed({ className }: { className?: string }) {
  return <MapFacade className={className} />;
}
