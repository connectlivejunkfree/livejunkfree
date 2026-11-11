/**
 * Scrolling strip of services (the live site's "Seamless Scrolling Text" widget).
 * Pauses on hover; static under prefers-reduced-motion. Content: marquee block items.
 */
export function ItemMarquee({ items }: { items: string[] }) {
  const row = (dup: boolean) =>
    items.map((t) => (
      <span key={`${dup ? "b" : "a"}-${t}`} className="chip" aria-hidden={dup || undefined}>
        {t}
      </span>
    ));
  return (
    <div className="marquee" role="region" aria-label="Services">
      <div className="track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
