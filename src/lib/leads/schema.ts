/**
 * Lead form validation (zod), shared by the browser (instant inline errors)
 * and the server (the real check). Canadian conventions: postal code A1A 1A1.
 */
import { z } from "zod";
import { ARRIVAL_WINDOWS, BOOKING_SERVICE_OPTIONS, HAS_LETTERS, MAX_PHOTOS, NAME_VALID, POSTAL_CODE } from "./constants";

export { ARRIVAL_WINDOWS, BOOKING_SERVICE_OPTIONS, MAX_PHOTO_BYTES, MAX_PHOTOS, POSTAL_CODE } from "./constants";


const phone = z
  .string()
  .trim()
  .refine((v) => v.replace(/\D/g, "").replace(/^1/, "").length === 10, "Please enter a 10-digit phone number.")
  // Stored and emailed as "+1 647 922 5865" (forms send the 10 digits; the +1 is fixed in the field).
  .transform((v) => {
    const d = v.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
    return `+1 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  });
const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

/** Attribution captured from the URL (gclid, utm_*) and kept in a first-party cookie for 90 days. */
export const AttributionSchema = z.object({
  gclid: optionalText(300),
  gbraid: optionalText(300),
  wbraid: optionalText(300),
  utm_source: optionalText(200),
  utm_medium: optionalText(200),
  utm_campaign: optionalText(200),
  utm_term: optionalText(200),
  utm_content: optionalText(200),
  landing_path: optionalText(500),
});
export type Attribution = z.infer<typeof AttributionSchema>;

/** Quote form (hero + full form on service, location and landing pages). */
export const QuoteLeadSchema = z.object({
  form_type: z.enum(["quote", "landing"]),
  source_path: z.string().max(500),
  name: z.string().trim().min(1, "Please add your name.").max(120).regex(NAME_VALID, "Please enter your name (letters only)."),
  phone,
  email: z.union([z.literal(""), z.email("That email doesn't look right.")]).optional(),
  postal_code: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || POSTAL_CODE.test(v), "Please use a Canadian postal code, e.g. M6K 1X9."),
  service: optionalText(120),
  preferred_date: optionalText(20),
  details: optionalText(4000).refine((v) => !v || HAS_LETTERS.test(v), "Please describe the items in words, e.g. 2 couches and a fridge."),
  photo_count: z.number().int().min(0).max(MAX_PHOTOS).default(0),
  attribution: AttributionSchema.default({}),
});
export type QuoteLead = z.infer<typeof QuoteLeadSchema>;

/** Booking form on /contact/: same fields and options as the live site's form. */

export const BookingLeadSchema = z.object({
  form_type: z.literal("booking"),
  source_path: z.string().max(500),
  street_address: z.string().trim().min(1, "Please add the street address.").max(200),
  unit: optionalText(80),
  city: z.string().trim().min(1, "Please add the city.").max(80).regex(NAME_VALID, "Please enter the city (letters only)."),
  postal_code: z.string().trim().refine((v) => POSTAL_CODE.test(v), "Please use a Canadian postal code, e.g. M6K 1X9."),
  name: z.string().trim().min(1, "Please add your name.").max(120).regex(NAME_VALID, "Please enter your name (letters only)."),
  phone,
  email: z.email("Please add a valid email."),
  details: optionalText(4000).refine((v) => !v || HAS_LETTERS.test(v), "Please describe the items in words, e.g. 2 couches and a fridge."),
  service: z.enum(BOOKING_SERVICE_OPTIONS).optional(),
  preferred_date: z.string().trim().min(1, "Please choose a date."),
  arrival_window: z.enum(ARRIVAL_WINDOWS, "Please choose a time."),
  photo_count: z.number().int().min(0).max(MAX_PHOTOS).default(0),
  attribution: AttributionSchema.default({}),
});
export type BookingLead = z.infer<typeof BookingLeadSchema>;

