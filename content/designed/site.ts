import { fact } from "@/lib/content/facts";
/**
 * Business details used across the site.
 * Every value here is taken from livejunkfree.ca (checked 7 Nov 2026).
 */

export const SITE = {
  name: "Live Junk Free",
  url: "https://livejunkfree.ca",
  tagline: "Junk removal, cleanouts and small demolition across Toronto and the GTA.",
  /** Shown on the page. Same format as livejunkfree.ca ("+1 647 922 5865"). */
  phone: "+1 647 922 5865",
  /** E.164, for schema.org. */
  phoneE164: "+16479225865",
  tel: "tel:+16479225865",
  email: "info@livejunkfree.ca",
  copyright: "© 2026 Live Junk Free. Serving Toronto and the GTA.",
} as const;

/** Phone hours (Manisha, 18 Nov 2026). Days weren't stated, so no schema openingHours. Text: business-facts.json `businessHours`. */
export const PHONE_HOURS = "7 am–11 pm";

/**
 * Google rating and homepage counters come from content/business-facts.json
 * ("reviews", "stats"). The live site showed conflicting figures (598+, 700+,
 * 780, 1,030 reviews; 6+ years vs "over a decade"), so they stay hidden until
 * Nav confirms them (audit OBS-64, OBS-133, B1-01, B1-08; Part 2 B-8 #1-2).
 */
export const RATING = {
  score: fact("reviews", "rating") ? Number(fact("reviews", "rating")).toFixed(1) : null,
  count: fact("reviews", "count") || null,
  fallback: fact("reviews") || "Read our Google reviews",
};

/** Homepage / About counters; empty until confirmed. */
export const STATS = [
  { value: fact("stats", "jobs"), label: "Services completed" },
  { value: fact("stats", "clients"), label: "Happy clients" },
  { value: fact("stats", "years"), label: "Years experience" },
].filter((s) => s.value);

export const SOCIAL = [
  { label: "Facebook", short: "Fb", href: "https://www.facebook.com/share/18y5rgyG68/" },
  { label: "Instagram", short: "Ig", href: "https://www.instagram.com/livejunkfree.ca" },
  { label: "TikTok", short: "Tt", href: "https://www.tiktok.com/@livejunkfree.ca" },
] as const;

/** Live Junk Free's Google Maps listing (same place as the homepage map embed). */
export const GOOGLE_REVIEWS_URL = "https://maps.google.com/?cid=9440346679886628444";

/** Google Maps embed used on livejunkfree.ca's homepage. */
export const MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d737760.8563776969!2d-79.47888510000001!3d43.754623!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8cc77d6dd498a753%3A0x8302d949cb2e465c!2sLive%20Junk%20Free!5e0!3m2!1sen!2sin!4v1753969695931!5m2!1sen!2sin";

/** Review mode shows the toolbar, /review/ and keeps the whole site noindex. */
export const REVIEW_MODE = process.env.NEXT_PUBLIC_REVIEW_MODE === "true";
