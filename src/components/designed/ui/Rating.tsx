import { RATING } from "@content/designed/site";
import { Stars } from "./Stars";

/** "★★★★★ 5.0 from 780+ Google reviews" once the count is confirmed (business-facts.json), otherwise a plain link label. */
export function Rating() {
  return (
    <div className="rating">
      <Stars />
      <span>
        {RATING.count ? (
          <>
            <b>{RATING.score}</b> from {RATING.count} Google reviews
          </>
        ) : (
          RATING.fallback
        )}
      </span>
    </div>
  );
}
