/**
 * /review/ (review mode only, noindex): every URL in this build, grouped by
 * type, plus the URLs still served by the old site until their phase ships.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { builtRows, manifest, BUILD_PHASE } from "@/lib/content";
import { REVIEW_MODE } from "@/lib/env";

export const metadata: Metadata = { title: "All pages — Live Junk Free preview", robots: { index: false, follow: false } };

export default function ReviewIndex() {
  if (!REVIEW_MODE) notFound();
  const built = builtRows();
  const groups = [...new Set(built.map((r) => r.type))];
  const later = manifest.filter((r) => (r.phase ?? 9) > BUILD_PHASE && r.status === "extracted");
  return (
    <main id="main" className="wrap review">
      <h1 className="d2">All pages (Phase {BUILD_PHASE})</h1>
      <p className="lead">
        <b>{built.length}</b> pages built in this phase · {manifest.filter((r) => r.status === "redirect").length} redirects ·{" "}
        {manifest.filter((r) => r.status === "test-410").length} removed test pages (410) · {later.length} pages still served by the old site until their phase ships.
      </p>
      {groups.map((g) => {
        const rows = built.filter((r) => r.type === g);
        return (
          <section key={g} className="panel white stack-sm">
            <h2 className="h4">
              {g} ({rows.length})
            </h2>
            <ul className="rvw-list">
              {rows.map((r) => (
                <li key={r.path}>
                  <Link href={r.path}>
                    <span>
                      <span className="block font-medium">{r.h1}</span>
                      <code>{r.path}</code>
                    </span>
                    <span className="status designed">{r.template}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
