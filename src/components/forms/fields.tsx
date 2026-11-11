"use client";

/**
 * Lead-form inputs shared by every form (quote, Ads landing, booking, home hero card).
 *   NameInput    letters only (any language) + space ' - . : digits and symbols never appear
 *   PhoneInput   digits only, 10 max; a pasted "+1 647-922-5865" becomes 6479225865
 *   PostalInput  upper case, "M6K 1X9" spacing as you type
 *   DatePicker   designed calendar pop-up (no past days); the value is sent as YYYY-MM-DD
 *   SelectMenu   designed drop-down list; the value is sent in a hidden input
 * The pickers replace the browser's own date/select controls so they match the site
 * on every browser. Both work fully by keyboard (arrows, Enter, Escape) and screen reader.
 */
import { useEffect, useId, useRef, useState, type InputHTMLAttributes, type KeyboardEvent } from "react";
import { NAME_ALLOWED, formatPostal, phoneDigits } from "@/lib/leads/constants";
import { Icon } from "../icons";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange"> & { defaultValue?: string };

export function NameInput({ defaultValue = "", ...rest }: InputProps) {
  const [v, setV] = useState(defaultValue);
  return <input {...rest} value={v} onChange={(e) => setV(e.currentTarget.value.replace(NAME_ALLOWED, "").replace(/^\s+/, "").replace(/\s{2,}/g, " ").slice(0, 80))} autoComplete="name" autoCapitalize="words" spellCheck={false} />;
}

/** City / town: same rule as names (letters, spaces, ' - .). */
export function CityInput({ defaultValue = "", ...rest }: InputProps) {
  const [v, setV] = useState(defaultValue);
  return <input {...rest} value={v} onChange={(e) => setV(e.currentTarget.value.replace(NAME_ALLOWED, "").replace(/^\s+/, "").replace(/\s{2,}/g, " ").slice(0, 60))} autoComplete="address-level2" autoCapitalize="words" />;
}

/**
 * Canadian / North American number: a fixed "+1" in front, the visitor types the 10 digits.
 * The value sent is the 10 digits; leads are stored and emailed as +1 numbers.
 */
export function PhoneInput({ defaultValue = "", placeholder = "647 922 5865", ...rest }: InputProps) {
  const [v, setV] = useState(phoneDigits(defaultValue));
  return (
    <span className="tel-field">
      <span className="tel-cc" aria-hidden="true">
        +1
      </span>
      <input {...rest} placeholder={placeholder} type="tel" inputMode="numeric" autoComplete="tel-national" value={v} onChange={(e) => setV(phoneDigits(e.currentTarget.value))} />
    </span>
  );
}

export function PostalInput({ defaultValue = "", ...rest }: InputProps) {
  const [v, setV] = useState(formatPostal(defaultValue));
  return <input {...rest} autoComplete="postal-code" autoCapitalize="characters" spellCheck={false} value={v} onChange={(e) => setV(formatPostal(e.currentTarget.value))} />;
}

/** Close a pop-up on a click outside `ref` or on Escape. */
function useDismiss(open: boolean, ref: React.RefObject<HTMLElement | null>, close: () => void) {
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, ref, close]);
}

/* ---------------- Date picker ---------------- */

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromIso = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return y && m && d ? new Date(y, m - 1, d) : null;
};
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const startOfToday = () => {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
};
const WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MAX_DAYS_AHEAD = 180;

type PickerProps = {
  id: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
};

export function DatePicker({ id, name, placeholder = "Choose a day", required, ...aria }: PickerProps) {
  const [value, setValue] = useState(""); // YYYY-MM-DD
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => startOfToday()); // any day inside the month on screen
  const [active, setActive] = useState(() => startOfToday()); // keyboard focus day
  const [alignRight, setAlignRight] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const labelId = useId();
  const close = () => setOpen(false);
  useDismiss(open, root, close);

  const today = startOfToday();
  const max = addDays(today, MAX_DAYS_AHEAD);
  const selected = value ? fromIso(value) : null;
  const inRange = (d: Date) => d >= today && d <= max;

  function show() {
    const start = selected ?? today;
    setView(start);
    setActive(start);
    const r = trigger.current?.getBoundingClientRect();
    setAlignRight(!!r && r.left + 320 > window.innerWidth - 8);
    setOpen(true);
  }
  // Move keyboard focus to the active day whenever it changes while open.
  useEffect(() => {
    if (open) grid.current?.querySelector<HTMLButtonElement>(`[data-day="${iso(active)}"]`)?.focus();
  }, [open, active]);

  function pick(d: Date) {
    setValue(iso(d));
    setOpen(false);
    trigger.current?.focus();
  }
  function moveTo(d: Date) {
    if (d < today) d = today;
    if (d > max) d = max;
    setActive(d);
    if (d.getMonth() !== view.getMonth() || d.getFullYear() !== view.getFullYear()) setView(d);
  }
  function onGridKey(e: KeyboardEvent) {
    const k = e.key;
    const step = k === "ArrowLeft" ? -1 : k === "ArrowRight" ? 1 : k === "ArrowUp" ? -7 : k === "ArrowDown" ? 7 : 0;
    if (step) {
      e.preventDefault();
      moveTo(addDays(active, step));
    } else if (k === "PageUp" || k === "PageDown") {
      e.preventDefault();
      moveTo(new Date(active.getFullYear(), active.getMonth() + (k === "PageUp" ? -1 : 1), active.getDate()));
    } else if (k === "Escape") {
      e.preventDefault();
      close();
      trigger.current?.focus();
    }
  }

  const first = new Date(view.getFullYear(), view.getMonth(), 1);
  const cells = Array.from({ length: 42 }, (_, i) => addDays(first, i - first.getDay()));
  const canPrev = new Date(view.getFullYear(), view.getMonth(), 0) >= today;
  const canNext = new Date(view.getFullYear(), view.getMonth() + 1, 1) <= max;
  const monthLabel = view.toLocaleDateString("en-CA", { month: "long", year: "numeric" });
  const shown = selected ? selected.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" }) : "";

  return (
    <div className="pick" ref={root}>
      <input type="hidden" name={name} value={value} />
      <button
        ref={trigger}
        id={id}
        type="button"
        className={value ? "pick-btn has" : "pick-btn"}
        aria-haspopup="dialog"
        aria-expanded={open}
        data-required={required || undefined}
        onClick={() => (open ? close() : show())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            show();
          }
        }}
        {...aria}
      >
        <Icon name="calendar" />
        <span>{shown || placeholder}</span>
        <Icon name="chev" />
      </button>
      {open ? (
        <div className={alignRight ? "cal right" : "cal"} role="dialog" aria-modal="false" aria-labelledby={labelId}>
          <div className="cal-head">
            <button type="button" className="cal-nav" aria-label="Previous month" disabled={!canPrev} onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}>
              <Icon name="chev" />
            </button>
            <b id={labelId} aria-live="polite">
              {monthLabel}
            </b>
            <button type="button" className="cal-nav next" aria-label="Next month" disabled={!canNext} onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}>
              <Icon name="chev" />
            </button>
          </div>
          <div className="cal-week" aria-hidden="true">
            {WEEK.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>
          <div className="cal-grid" role="grid" ref={grid} onKeyDown={onGridKey}>
            {cells.map((d) => {
              const k = iso(d);
              const out = d.getMonth() !== view.getMonth();
              const isSel = value === k;
              const isToday = k === iso(today);
              return (
                <button
                  key={k}
                  type="button"
                  role="gridcell"
                  data-day={k}
                  className={["cal-day", out && "out", isSel && "sel", isToday && "today"].filter(Boolean).join(" ")}
                  disabled={!inRange(d)}
                  tabIndex={k === iso(active) ? 0 : -1}
                  aria-selected={isSel}
                  aria-label={d.toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" }) + (isToday ? ", today" : "")}
                  onClick={() => pick(d)}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
          {value ? (
            <div className="cal-quick">
              <button
                type="button"
                className="clear"
                onClick={() => {
                  setValue("");
                  close();
                  trigger.current?.focus();
                }}
              >
                Clear date
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/* ---------------- Select menu ---------------- */

type SelectProps = PickerProps & { options: readonly string[]; defaultValue?: string };

export function SelectMenu({ id, name, options, defaultValue = "", placeholder = "Choose…", required, ...aria }: SelectProps) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const listId = useId();
  const close = () => setOpen(false);
  useDismiss(open, root, close);

  function show(at = Math.max(0, options.indexOf(value))) {
    setActive(at);
    setOpen(true);
  }
  useEffect(() => {
    if (open) list.current?.querySelectorAll<HTMLElement>("[role=option]")[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);
  function choose(i: number) {
    setValue(options[i]);
    close();
    trigger.current?.focus();
  }
  function onKey(e: KeyboardEvent) {
    const n = options.length;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        show();
      }
      return;
    }
    const moves: Record<string, () => void> = {
      ArrowDown: () => setActive((a) => (a + 1) % n),
      ArrowUp: () => setActive((a) => (a - 1 + n) % n),
      Home: () => setActive(0),
      End: () => setActive(n - 1),
      Enter: () => choose(active),
      " ": () => choose(active),
    };
    if (moves[e.key]) {
      e.preventDefault();
      moves[e.key]();
    } else if (e.key === "Escape" || e.key === "Tab") close();
    else if (e.key.length === 1) {
      const i = options.findIndex((o) => o.toLowerCase().startsWith(e.key.toLowerCase()));
      if (i !== -1) setActive(i);
    }
  }

  return (
    <div className="pick" ref={root}>
      <input type="hidden" name={name} value={value} />
      <button
        ref={trigger}
        id={id}
        type="button"
        role="combobox"
        className={value ? "pick-btn has" : "pick-btn"}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        aria-required={required || undefined}
        onClick={() => (open ? close() : show())}
        onKeyDown={onKey}
        {...aria}
      >
        <span>{value || placeholder}</span>
        <Icon name="chev" />
      </button>
      {open ? (
        <ul className="menu" role="listbox" id={listId} ref={list} aria-label={placeholder}>
          {options.map((o, i) => (
            <li
              key={o}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={o === value}
              className={i === active ? "on" : undefined}
              onPointerEnter={() => setActive(i)}
              onClick={() => choose(i)}
            >
              <span>{o}</span>
              {o === value ? <Icon name="check" /> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
