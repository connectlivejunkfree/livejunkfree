import type { IconName } from "@/components/icons";
import { Icon } from "@/components/icons";
import { TRUST } from "@content/designed/shared";
import { Rich } from "../ui/Rich";

/** Infinite marquee of items we remove. Pauses on hover. */
export function ItemMarquee({ items }: { items: [string, IconName][] }) {
  const row = (dup: boolean) =>
    items.map(([t, ic]) => (
      <span key={`${dup ? "b" : "a"}-${t}`} className="chip" aria-hidden={dup || undefined}>
        <Icon name={ic} />
        {t}
      </span>
    ));
  return (
    <div className="marquee" role="region" aria-label="Items we remove">
      <div className="track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

/** Four trust points under the hero. */
export function TrustStrip() {
  return (
    <section className="trust" aria-label="Why customers choose us">
      <div className="wrap">
        {TRUST.map((t) => (
          <div key={t.title} className="t">
            <Icon name={t.icon} />
            <div>
              <b>{t.title}</b>
              <span>
                <Rich text={t.text} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
