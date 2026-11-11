/**
 * Page chrome for every template: header (or the minimal Ads header), main
 * content, footer and the sticky mobile call bar.
 * `calm` = sensitive cleanouts (estate, hoarding, eviction, bereavement):
 * ink buttons and a dark CTA band.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { site } from "@/lib/content";
import { Icon } from "../icons";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Logo } from "./Logo";
import { MobileCallBar } from "./MobileCallBar";

type Props = {
  children: ReactNode;
  calm?: boolean;
  /** Ads landing pages: logo + phone only, no main navigation. */
  minimal?: boolean;
  /** Where the mobile "Get a quote" button goes ("#quote-form" on pages with a form). */
  quoteHref?: string;
};

export function PageShell({ children, calm, minimal, quoteHref }: Props) {
  return (
    <div className={calm ? "page-root calm" : "page-root"}>
      {minimal ? (
        <header className="lp-hdr">
          <div className="wrap">
            <Logo href={null} />
            <a className="btn btn-dark btn-sm" href={`tel:${site.phone.tel}`}>
              <Icon name="phone" /> {site.phone.display}
            </a>
          </div>
        </header>
      ) : (
        <Header />
      )}
      <main id="main">{children}</main>
      <Footer minimal={minimal} />
      <MobileCallBar quoteHref={quoteHref} />
      {minimal ? null : (
        <Link href="#main" className="sr-only">
          Back to top
        </Link>
      )}
    </div>
  );
}
