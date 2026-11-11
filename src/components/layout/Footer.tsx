/**
 * Site footer: CTA strip, the live footer text, services, popular pages, all
 * 26 towns, company links, phone, email, socials and hours (as stated on the
 * live site). Content used: content/site.json, content/navigation.json.
 */
import Link from "next/link";
import { navigation, site } from "@/lib/content";

export function Footer({ minimal = false }: { minimal?: boolean }) {
  if (minimal) {
    return (
      <footer className="ftr ftr-min">
        <div className="wrap">
          <div className="bottom">
            <span>{site.copyright}</span>
            <span className="flex gap-4">
              <Link href="/privacy-policy/">Privacy Policy</Link>
            </span>
          </div>
        </div>
      </footer>
    );
  }
  return (
    <footer className="ftr">
      <div className="wrap">
        <div className="cols">
          <div className="stack">
            <Link className="logo" href="/" aria-label="Live Junk Free home">
              <span className="wm block! text-white! text-2xl!">
                Live Junk<span> Free</span>
              </span>
            </Link>
            <p className="max-w-[44ch]">{site.footerBlurb}</p>
            <div className="hours">
              <div>
                <span>Hours</span>
                <b>{site.hours.display}</b>
              </div>
            </div>
            <ul className="contact-list">
              <li>
                <a href={`tel:${site.phone.tel}`}>{site.phone.display}</a>
              </li>
              <li>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
            </ul>
            <div className="social">
              <span className="sr-only">Follow Us On</span>
              {site.socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">
                  <span aria-hidden="true">{s.short}</span>
                  <span className="sr-only">{s.label}</span>
                </a>
              ))}
            </div>
          </div>
          <FooterCol title="Services" links={navigation.footer.services} />
          <FooterCol title="Popular" links={navigation.footer.popular} />
          <FooterCol title="Quick Links" links={navigation.footer.company} />
        </div>
        <div className="towns">
          <h2 className="fh">Areas We Serve</h2>
          <ul>
            {site.towns
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((t) => (
                <li key={t.slug}>
                  <Link href={`/locations/${t.slug}/`}>{t.name}</Link>
                </li>
              ))}
          </ul>
        </div>
        <div className="bigword" aria-hidden="true" data-word="Live Junk Free" />
        <div className="bottom mt-0!">
          <span>{site.copyright}</span>
          <span className="flex gap-4">
            <Link href="/privacy-policy/">Privacy Policy</Link>
            <a href="/sitemap.xml">Sitemap</a>
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="fh">{title}</h2>
      <ul>
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href}>{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
