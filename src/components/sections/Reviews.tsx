/**
 * Real Google reviews from the Trustindex widget snapshot (content/reviews.json).
 * Never hand-written. Cards scroll horizontally on mobile.
 * Content used: content/reviews.json, content/site.json (rating, Google profile link).
 */
import { reviews, site } from "@/lib/content";
import { Stars } from "../ui/Stars";
import { CountUp } from "../motion/CountUp";

/** Shortest reviews first keeps cards compact; `count` controls how many show. */
export function Reviews({ count = 6 }: { count?: number }) {
  const list = [...reviews.reviews].filter((r) => r.stars === 5).sort((a, b) => a.text.length - b.text.length).slice(0, count);
  return (
    <div className="reviews">
      <div className="stack">
        <div className="score-row">
          <span className="score">
            <CountUp value={site.rating.display} />
          </span>
          <Stars />
        </div>
        <p className="muted">
          Based on <b>{site.rating.countDisplay}</b> Google reviews
        </p>
        <a className="tlink self-start" href={site.googleBusinessProfile} target="_blank" rel="noopener noreferrer">
          Read all reviews on Google
        </a>
      </div>
      <div className="rv-list" role="region" tabIndex={0} aria-label="Google reviews">
        {list.map((r) => (
          <figure key={r.name} className="rv">
            <Stars n={r.stars} />
            <blockquote>
              <q>{r.text}</q>
            </blockquote>
            <figcaption className="who">
              <div>
                <b>{r.name}</b>
                Posted on Google
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
