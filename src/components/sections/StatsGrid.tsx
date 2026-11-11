/**
 * Number counters (e.g. "Services Completed 1,000+") with a count-up when they
 * scroll into view. The final number is server-rendered, so it shows without JS.
 * Content fields used: stats block items { label, value }.
 */
import { CountUp } from "../motion/CountUp";

export function StatsGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="stats">
      {items.map((s) => (
        <div key={s.label}>
          <b>
            <CountUp value={s.value} />
          </b>
          <span>{s.label}</span>
        </div>
      ))}
    </div>
  );
}
