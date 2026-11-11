/** /feed/ — RSS feed of blog posts (same URL as the old WordPress feed). */
import { blogPosts, site } from "@/lib/content";
import { abs } from "@/lib/seo/schema";

export const dynamic = "force-static";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function GET() {
  const items = blogPosts()
    .slice(0, 50)
    .map((p) => `<item><title>${esc(p.doc.title)}</title><link>${abs(p.path)}</link><guid isPermaLink="true">${abs(p.path)}</guid><pubDate>${new Date(p.doc.published + "Z").toUTCString()}</pubDate><description>${esc(p.doc.excerpt ?? "")}</description></item>`)
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${esc(site.name)} Blog</title><link>${abs("/blog/")}</link><description>Fresh junk removal updates, cleanup tips, and company news from the Live Junk Free team.</description><language>en-CA</language>\n${items}\n</channel></rss>\n`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
