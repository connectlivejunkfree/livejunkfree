import Link from "next/link";
import { Fragment } from "react";
import type { Crumb } from "@content/designed/types";
import { breadcrumbs } from "@/components/designed/lib/schema";
import { JsonLd } from "./JsonLd";

/** Breadcrumb trail. Also emits BreadcrumbList JSON-LD for the current page. */
export function Breadcrumbs({ crumbs, path }: { crumbs: Crumb[]; path: string }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      {crumbs.map((c, i) =>
        i < crumbs.length - 1 && c.href ? (
          <Fragment key={i}>
            <Link href={c.href}>{c.label}</Link>
            <span aria-hidden="true">/</span>
          </Fragment>
        ) : (
          <b key={i} aria-current="page">{c.label}</b>
        ),
      )}
      <JsonLd data={breadcrumbs(crumbs, path)} />
    </nav>
  );
}
