import { Icon } from "../icons";
import { fact } from "@/lib/content/facts";

/**
 * Star rating. With `n` it shows one review's own rating. Without it, it stands for the overall Google rating,
 * which shows only once business-facts.json `reviews.rating` is verified (Answers B8.1, C.5).
 */
export function Stars({ n }: { n?: number }) {
  if (n === undefined) {
    const r = Number(fact("reviews", "rating"));
    if (!r) return null;
    n = Math.round(r);
  }
  return (
    <span className="stars" role="img" aria-label={`${n} out of 5`}>
      {Array.from({ length: n }, (_, i) => (
        <Icon key={i} name="star" />
      ))}
    </span>
  );
}
