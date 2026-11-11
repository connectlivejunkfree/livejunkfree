/**
 * Lead form constants shared by the browser and the server. No zod here, so
 * the client bundle stays small (validation schemas live in ./schema.ts, server-side).
 */
export const POSTAL_CODE = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i;
export const BOOKING_SERVICE_OPTIONS = ["Single", "Multiple Items", "Curbside (10% Discount)"] as const;
export const ARRIVAL_WINDOWS = ["6 AM - 8 AM", "8 AM - 10 AM", "10 AM - 12 PM", "12 PM - 2 PM", "2 PM - 4 PM", "4 PM - 6 PM", "6 PM - 8 PM", "8 PM - 10 PM"] as const;
/** Names: letters (any language), spaces, apostrophes, hyphens, periods. No digits. */
export const NAME_ALLOWED = /[^\p{L}\p{M}\s'’.-]/gu;
export const NAME_VALID = /^[\p{L}\p{M}][\p{L}\p{M}\s'’.-]*$/u;
/** Free-text "what needs to go": quantities like "2 couches" are fine, but it must contain words. */
export const HAS_LETTERS = /\p{L}{2,}/u;
/** Phone: keep digits only; a pasted +1 / 1 country code is dropped; max 10. */
export const phoneDigits = (v: string) => {
  const d = v.replace(/\D/g, "");
  return (d.length === 11 && d.startsWith("1") ? d.slice(1) : d).slice(0, 10);
};
/** Postal code as typed → "M6K 1X9" (upper case, letters/digits only, space after 3). */
export const formatPostal = (v: string) => {
  const c = v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  return c.length > 3 ? `${c.slice(0, 3)} ${c.slice(3)}` : c;
};
export const MAX_PHOTOS = 5;
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

export type Attribution = {
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  landing_path?: string;
};
