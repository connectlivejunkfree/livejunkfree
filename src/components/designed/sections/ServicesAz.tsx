"use client";

import Link from "next/link";
import { useState } from "react";
import { SERVICES_HUB } from "@content/designed/pages/other";
import { categoryHref, serviceHref } from "@content/designed/routes";
import { CATEGORIES, SERVICES, type CategoryKey } from "@content/designed/services";

const AZ = SERVICES_HUB.az;

/** Searchable A–Z of every service item, one column per category. */
export function ServicesAz({ categories }: { categories: CategoryKey[] }) {
  const [q, setQ] = useState("");
  const v = q.trim().toLowerCase();
  const hits = SERVICES.filter((s) => categories.includes(s.category) && (!v || s.label.toLowerCase().includes(v) || s.name.toLowerCase().includes(v)));
  return (
    <>
      <div className="filterbox">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={AZ.search} aria-label={AZ.searchLabel} aria-controls="az" />
      </div>
      <div className={categories.length > 1 ? "grid g4 az" : "grid az"} id="az">
        {categories.map((k) => (
          <div key={k}>
            <h3>
              {CATEGORIES[k].label}{" "}
              <Link className="tlink" href={categoryHref(k)}>
                {AZ.overview}
              </Link>
            </h3>
            <ul className={categories.length > 1 ? undefined : "columns-2 md:columns-4"}>
              {SERVICES.filter((s) => s.category === k).map((s) => (
                <li key={s.slug} className={hits.includes(s) ? undefined : "hidden"}>
                  <Link href={serviceHref(s)}>{s.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {hits.length === 0 ? (
        <p className="small muted mt-4" role="status">
          {AZ.empty}
        </p>
      ) : null}
    </>
  );
}
