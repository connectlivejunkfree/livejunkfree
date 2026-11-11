import { Icon } from "@/components/icons";

export function Stars({ n = 5 }: { n?: number }) {
  return (
    <span className="stars" role="img" aria-label={`${n} out of 5`}>
      {Array.from({ length: n }, (_, i) => (
        <Icon key={i} name="star" />
      ))}
    </span>
  );
}
