/**
 * Proxy (runs before routing):
 *   1. www.livejunkfree.ca → livejunkfree.ca (301)
 *   2. removed test pages → 410 Gone (content/redirects.csv rows with status 410)
 *   3. transition fallback: real URLs from a later phase are served from the
 *      old WordPress site, so no URL ever 404s while phases roll out.
 *      Uses OLD_SITE_ORIGIN (e.g. https://old.livejunkfree.ca). Before the DNS
 *      switch, preview deployments fall back to https://livejunkfree.ca.
 *      Remove this fallback at the end of Phase 3.
 */
import { NextResponse, type NextRequest } from "next/server";
import manifest from "../content/manifest.json";

type Row = { path: string; phase: number | null; status: string; template: string };
const BUILD_PHASE = Number(process.env.BUILD_PHASE ?? "1");
const rows = manifest as Row[];
const gone = new Set(rows.filter((r) => r.status === "test-410").map((r) => r.path));
const later = new Set(rows.filter((r) => (r.status === "extracted" || r.status === "empty") && r.phase !== null && r.phase > BUILD_PHASE).map((r) => r.path));

const GONE_HTML = `<!doctype html><html lang="en-CA"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Page removed — Live Junk Free</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="font-family:system-ui,sans-serif;max-width:40rem;margin:4rem auto;padding:0 1rem"><h1>This page has been removed</h1><p><a href="/">Go to the Live Junk Free homepage</a> or call <a href="tel:+16479225865">+1 647 922 5865</a>.</p></body></html>`;

export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const host = request.headers.get("host") ?? "";

  if (host.startsWith("www.")) {
    const to = new URL(url.pathname + url.search, `https://${host.slice(4)}`);
    return NextResponse.redirect(to, 301);
  }

  // WordPress ignores case: /locations/Ajax/ → /locations/ajax/ (301).
  if (/[A-Z]/.test(url.pathname)) {
    const lower = url.clone();
    lower.pathname = url.pathname.toLowerCase();
    return NextResponse.redirect(lower, 301);
  }

  if (gone.has(url.pathname)) {
    return new NextResponse(GONE_HTML, { status: 410, headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex" } });
  }

  if (later.has(url.pathname)) {
    const origin = process.env.OLD_SITE_ORIGIN || (host.endsWith("livejunkfree.ca") ? "" : "https://livejunkfree.ca");
    if (origin) return NextResponse.rewrite(new URL(url.pathname + url.search, origin));
  }

  return NextResponse.next();
}

export const config = {
  // Pages only: skip Next internals, images, files with an extension and the server-action POSTs.
  matcher: ["/((?!_next/|images/|favicon\\.ico|.*\\.[a-zA-Z0-9]+$).*)"],
};
