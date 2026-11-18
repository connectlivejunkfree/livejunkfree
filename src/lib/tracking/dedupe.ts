/**
 * Conversion de-duplication (audit OBS-08, G14; QA 18 Nov P1 tracking gate): a lead id counts once per browser
 * session. Pure, so scripts/checks/tracking-test.mjs can test it without a browser.
 */
export const TRACKED_KEY = "ljf_tracked_leads";

type Store = Pick<Storage, "getItem" | "setItem">;

/** True the first time a lead id is seen (no id: honeypot / unsaved lead → still once per submit). */
export function firstTimeFor(id: string | null, store: Store | null): boolean {
  if (!id) return true;
  try {
    if (!store) return true;
    const seen: string[] = JSON.parse(store.getItem(TRACKED_KEY) ?? "[]");
    if (seen.includes(id)) return false;
    store.setItem(TRACKED_KEY, JSON.stringify([...seen, id].slice(-20)));
  } catch {}
  return true;
}
