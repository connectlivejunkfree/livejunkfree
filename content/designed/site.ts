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

/** Hours (livejunkfree.ca/locations/toronto/ FAQ). */
export const HOURS = {
  days: "7 days a week",
  time: "6AM–11PM",
  summary: "7 days a week, 6AM–11PM",
  /** schema.org openingHours */
  schema: "Mo-Su 06:00-23:00",
} as const;

/** Google rating (Google Maps listing + Trustindex widget on the homepage). */
export const RATING = {
  score: "5.0",
  count: "780+",
} as const;

/** Homepage counters on livejunkfree.ca. */
export const STATS = [
  { value: "1,000+", label: "Services completed" },
  { value: "700+", label: "Happy clients" },
  { value: "6+", label: "Years experience" },
] as const;

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
