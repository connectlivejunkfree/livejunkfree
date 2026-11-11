import { REVIEWS, REVIEWS_HEADING, REVIEW_LINK_LABEL, REVIEW_SETS, REVIEW_SOURCE_LABEL, type ReviewId } from "@content/designed/reviews";
import { GOOGLE_REVIEWS_URL, RATING } from "@content/designed/site";
import { Stars } from "../ui/Stars";
import { ScoreCountUp } from "./ScoreCountUp";

/** Real Google reviews block. Cards scroll horizontally on mobile. */
export function Reviews({ ids = REVIEW_SETS.home }: { ids?: ReviewId[] }) {
  return (
    <div className="reviews">
      <div className="stack">
        <h2 className="d2">{REVIEWS_HEADING}</h2>
        <div>
          <ScoreCountUp value={RATING.score} />
        </div>
        <Stars />
        <p className="muted">
          {RATING.score} from <b>{RATING.count}</b> Google reviews.
        </p>
        <a className="tlink self-start" href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer">
          {REVIEW_LINK_LABEL}
        </a>
      </div>
      <div className="rv-list" role="region" tabIndex={0} aria-label="Customer reviews">
        {ids.map((id) => {
          const r = REVIEWS[id];
          return (
            <figure key={id} className="rv">
              <Stars />
              <blockquote>
                <q>{r.text}</q>
              </blockquote>
              <figcaption className="who">
                <div>
                  <b>{r.name}</b>
                  {REVIEW_SOURCE_LABEL}
                </div>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
