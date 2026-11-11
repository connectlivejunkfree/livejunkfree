/**
 * 404: search box (blog search) plus the main service and location links.
 * Content used: content/navigation.json, content/site.json.
 */
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { navigation, site } from "@/lib/content";

export default function NotFound() {
  return (
    <PageShell>
      <section className="hero">
        <div className="wrap one">
          <div className="stack-lg">
            <h1 className="d1">Page not found</h1>
            <p className="lead">That page doesn&apos;t exist, or it has moved. Search the site or pick a service below.</p>
            <form action="/blog/" method="get" className="filterbox" role="search">
              <label htmlFor="nf-q" className="sr-only">
                Search
              </label>
              <input id="nf-q" type="search" name="q" placeholder="Search: couch, hot tub, estate cleanout…" />
            </form>
            <div className="btn-row">
              <Link className="btn btn-primary" href="/services/">
                See all services
              </Link>
              <a className="btn btn-ghost" href={`tel:${site.phone.tel}`}>
                Call {site.phone.display}
              </a>
            </div>
          </div>
        </div>
      </section>
      <section className="sec soft">
        <div className="wrap grid g4">
          {navigation.mega.map((g) => (
            <div key={g.label} className="stack-sm">
              <h2 className="h4">{g.label}</h2>
              <ul className="nf-list">
                {g.items.slice(0, 5).map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
                <li>
                  <Link className="tlink" href={g.all.href}>
                    {g.all.label}
                  </Link>
                </li>
              </ul>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
