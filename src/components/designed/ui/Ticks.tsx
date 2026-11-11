import { Rich } from "./Rich";

/** Orange-tick list (`.ticks`). */
export function Ticks({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={className ? `ticks ${className}` : "ticks"}>
      {items.map((t) => (
        <li key={t}>
          <Rich text={t} />
        </li>
      ))}
    </ul>
  );
}
