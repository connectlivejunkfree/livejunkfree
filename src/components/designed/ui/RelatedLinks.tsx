import Link from "next/link";
import type { RelatedGroup } from "@content/designed/types";

export function RelatedLinks({ title, links }: RelatedGroup) {
  return (
    <div className="stack">
      <h3 className="h4">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <Link key={l.label} className="chip" href={l.href}>
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
