import { RATING } from "@content/designed/site";
import { Stars } from "./Stars";

/** "★★★★★ 5.0 from 780+ Google reviews" */
export function Rating() {
  return (
    <div className="rating">
      <Stars />
      <span>
        <b>{RATING.score}</b> from {RATING.count} Google reviews
      </span>
    </div>
  );
}
