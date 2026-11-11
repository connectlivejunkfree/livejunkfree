/**
 * Environment flags (see .env.example).
 * REVIEW_MODE: client-preview mode — the review toolbar shows and every page is noindex.
 */
export const REVIEW_MODE = process.env.NEXT_PUBLIC_REVIEW_MODE === "true";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://livejunkfree.ca";
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "";
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? "";
