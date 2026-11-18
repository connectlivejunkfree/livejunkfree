/**
 * Business facts awaiting the owner's confirmation (content/business-facts.json).
 * Text references a fact as {{fact:key}} (its `text`) or {{fact:key.field}}.
 * A fact with status "removed", or a missing / null field, renders as "".
 * Safe on both server and client (plain JSON import, no fs).
 */
import factsJson from "@content/business-facts.json";

type Fact = { status?: string; [field: string]: unknown };
export const facts = factsJson as unknown as Record<string, Fact | string>;

/** A fact's field as display text ("" when removed, missing or null). */
export function fact(key: string, field = "text"): string {
  const f = facts[key];
  if (!f || typeof f !== "object" || f.status === "removed") return "";
  const v = f[field];
  return v === null || v === undefined ? "" : String(v);
}

/** True when a fact can be shown (not removed, and its field has a value). */
export const hasFact = (key: string, field = "text") => fact(key, field) !== "";

/** Status of a specialist capability (content/business-facts.json → specialist). Anything but "confirmed" is hidden. */
export function specialist(key: string): boolean {
  const s = facts.specialist as Record<string, string> | undefined;
  return s?.[key] === "confirmed";
}

/** "5.0 from 780 Google reviews" once both are confirmed, otherwise "Read our Google reviews". */
export function reviewLine(): string {
  const count = fact("reviews", "count"), rating = fact("reviews", "rating");
  return count && rating ? `${Number(rating).toFixed(1)} from ${count} Google reviews` : fact("reviews") || "Read our Google reviews";
}

const TOKEN = /\{\{fact:(\w+)(?:\.(\w+))?\}\}/g;

/** Replace every {{fact:…}} token; tidies spaces / punctuation left behind by an empty fact. */
export function resolveFacts(text: string): string {
  if (!text.includes("{{fact:")) return text;
  return text
    .replace(TOKEN, (_m, key: string, field?: string) => fact(key, field ?? "text"))
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .trim();
}
