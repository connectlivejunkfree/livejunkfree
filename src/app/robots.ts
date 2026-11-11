/**
 * robots.txt — every crawler (search engines and AI search) allowed except on
 * form/thank-you/review pages. Review mode (client preview) blocks everything.
 */
import type { MetadataRoute } from "next";
import { REVIEW_MODE, SITE_URL } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  if (REVIEW_MODE) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/review/", "/thankpage-schedule/", "/thank-you-estate-quote/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
