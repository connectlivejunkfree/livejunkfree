/**
 * Breadcrumb trail following the URL hierarchy (Home › Services › Residential › …).
 * The BreadcrumbList JSON-LD is emitted in the page's @graph, not here.
 */
import Link from "next/link";
import { Fragment } from "react";

export function Breadcrumbs({ crumbs }: { crumbs: { label: string; href: string }[] }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      {crumbs.map((c, i) =>
        i < crumbs.length - 1 ? (
          <Fragment key={c.href}>
            <Link href={c.href}>{c.label}</Link>
            <span aria-hidden="true">›</span>
          </Fragment>
        ) : (
          <b key={c.href} aria-current="page">
            {c.label}
          </b>
        ),
      )}
    </nav>
  );
}
