/**
 * Environment flags (see .env.example).
 * REVIEW_MODE: client-preview mode — the review toolbar shows and every page is noindex.
 */
export const REVIEW_MODE = process.env.NEXT_PUBLIC_REVIEW_MODE === "true";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://livejunkfree.ca";
/**
 * GTM container. NEXT_PUBLIC_ENABLE_GTM="false" turns it off (e.g. on the preview, once the client
 * approves question A4). Default unchanged: GTM loads whenever NEXT_PUBLIC_GTM_ID is set.
 */
export const GTM_ENABLED = (process.env.NEXT_PUBLIC_ENABLE_GTM ?? "true").toLowerCase() !== "false";
export const GTM_ID = GTM_ENABLED ? (process.env.NEXT_PUBLIC_GTM_ID ?? "") : "";
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? "";
