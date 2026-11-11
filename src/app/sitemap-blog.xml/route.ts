/** /sitemap-blog.xml — blog URLs built in this phase, with lastmod and images. */
import { sitemapXml } from "@/lib/seo/sitemaps";

export const dynamic = "force-static";

export function GET() {
  return new Response(sitemapXml("blog"), { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
