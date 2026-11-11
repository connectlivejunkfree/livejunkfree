"use client";

import Link from "next/link";
import { useState } from "react";
import { LOCATIONS_INDEX } from "@content/designed/pages/other";
import { REGIONS } from "@content/designed/locations";
import { city } from "@content/designed/routes";
import { SITE } from "@content/designed/site";
import { PageHero } from "./ServiceHero";

/** Locations index: search box + communities grouped by region. */
export function RegionSearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="filterbox m-0!">
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={LOCATIONS_INDEX.search}
        aria-label={LOCATIONS_INDEX.searchLabel}
        aria-controls="regions"
      />
    </div>
  );
}

export function RegionList({ query }: { query: string }) {
  const v = query.trim().toLowerCase();
  const groups = Object.entries(REGIONS).map(([r, list]) => [r, list, list.filter((a) => !v || a.toLowerCase().includes(v))] as const);
  const any = groups.some(([, , hits]) => hits.length);
  return (
    <>
      <div className="regions" id="regions" aria-live="polite">
        {groups.map(([r, list, hits]) =>
          hits.length ? (
            <div key={r} className="region">
              <div className="rh">
                <h2 className="h4">{r}</h2>
                <span className="small muted">
                  {list.length} {list.length === 1 ? "area" : "areas"}
                </span>
              </div>
              <ul className="areas">
                {hits.map((a) => (
                  <li key={a}>
                    <Link href={city(a)}>{a}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null,
        )}
      </div>
      {any ? null : (
        <p className="small muted mt-5" role="status">
          {LOCATIONS_INDEX.none}{" "}
          <a className="tlink" href={SITE.tel}>
            {SITE.phone}
          </a>{" "}
          {LOCATIONS_INDEX.noneAfter}
        </p>
      )}
    </>
  );
}

/** Hero (with search box) + region grid, sharing one query. */
export function LocationsFinder({ path }: { path: string }) {
  const [q, setQ] = useState("");
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Locations" }]}
        path={path}
        h1={LOCATIONS_INDEX.h1}
        lead={LOCATIONS_INDEX.lead}
        maxCh={15}
      >
        <RegionSearch value={q} onChange={setQ} />
      </PageHero>
      <section className="sec tight">
        <div className="wrap">
          <RegionList query={q} />
        </div>
      </section>
    </>
  );
}
