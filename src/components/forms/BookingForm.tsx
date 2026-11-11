"use client";

/**
 * Booking form on /contact/: same fields, options and order as the live site's
 * form (address, name, phone, email, items, Single / Multiple Items /
 * Curbside (10% Discount), date, 2-hour arrival window).
 * Only change: the label typo "Describe Items To Be Remove" → "Removed"
 */
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { site } from "@/lib/content/client";
import { ARRIVAL_WINDOWS, BOOKING_SERVICE_OPTIONS, NAME_VALID, POSTAL_CODE, phoneDigits } from "@/lib/leads/constants";
import { CityInput, DatePicker, NameInput, PhoneInput, PostalInput, SelectMenu } from "./fields";
import { Turnstile } from "./Turnstile";
import { useLeadSubmit } from "./useLeadSubmit";

export function BookingForm() {
  const uid = useId();
  const f = (k: string) => `${uid}-${k}`;
  const { status, submit } = useLeadSubmit();
  const [local, setLocal] = useState<Record<string, string>>({});
  const token = useRef("");
  const onToken = useCallback((t: string) => (token.current = t), []);
  const formRef = useRef<HTMLFormElement>(null);

  // Prefill from the homepage hero card (src/components/designed/sections/QuickQuote.tsx).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("ljf-quote-prefill");
      if (!raw) return;
      sessionStorage.removeItem("ljf-quote-prefill");
      const p = JSON.parse(raw) as { item?: string; postal?: string };
      const el = (n: string) => formRef.current?.elements.namedItem(n) as HTMLInputElement | HTMLTextAreaElement | null;
      const details = el("details");
      const postal = el("postal_code");
      if (p.item && details && !details.value) details.value = p.item;
      if (p.postal && postal && !postal.value) postal.value = p.postal;
    } catch {
      /* storage unavailable */
    }
  }, []);
  const errors = { ...status.fields, ...local };
  const err = (k: string) =>
    errors[k] ? (
      <span className="form-err" id={f(`${k}-err`)}>
        {errors[k]}
      </span>
    ) : null;
  const aria = (k: string) => (errors[k] ? { "aria-invalid": true as const, "aria-describedby": f(`${k}-err`) } : {});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) ?? "").trim();
    const next: Record<string, string> = {};
    if (!POSTAL_CODE.test(get("postal_code"))) next.postal_code = "Please use a Canadian postal code, e.g. M6K 1X9.";
    if (!NAME_VALID.test(get("name"))) next.name = "Please enter your name (letters only).";
    if (!NAME_VALID.test(get("city"))) next.city = "Please enter the city (letters only).";
    if (phoneDigits(get("phone")).length !== 10) next.phone = "Please enter a 10-digit phone number.";
    if (!get("preferred_date")) next.preferred_date = "Please choose a date.";
    if (!get("arrival_window")) next.arrival_window = "Please choose a time.";
    setLocal(next);
    if (Object.keys(next).length) return;
    await submit(
      {
        form_type: "booking",
        street_address: get("street_address"),
        unit: get("unit"),
        city: get("city"),
        postal_code: get("postal_code").toUpperCase(),
        name: get("name"),
        phone: get("phone"),
        email: get("email"),
        details: get("details"),
        service: get("service") || undefined,
        preferred_date: get("preferred_date"),
        arrival_window: get("arrival_window"),
      },
      { turnstileToken: token.current, honeypot: get("company_website") },
    );
  }

  const sending = status.state === "sending";
  return (
    <form ref={formRef} id="booking-form" className="form bform" onSubmit={onSubmit} noValidate aria-label="Book your appointment">
      <h2 className="d3 form-title">Book Your Appointment</h2>
      <div className="field">
        <label htmlFor={f("street_address")}>Street address</label>
        <input id={f("street_address")} name="street_address" autoComplete="address-line1" placeholder="Street address" required {...aria("street_address")} />
        {err("street_address")}
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor={f("unit")}>
            Apt, Suite, Unit, Building <i>(optional)</i>
          </label>
          <input id={f("unit")} name="unit" autoComplete="address-line2" placeholder="Apt, Suite, Unit, Building" />
        </div>
        <div className="field">
          <label htmlFor={f("city")}>City</label>
          <CityInput id={f("city")} name="city" placeholder="City" required {...aria("city")} />
          {err("city")}
        </div>
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor={f("postal_code")}>Postal Code</label>
          <PostalInput id={f("postal_code")} name="postal_code" placeholder="Postal Code" required {...aria("postal_code")} />
          {err("postal_code")}
        </div>
        <div className="field">
          <label htmlFor={f("name")}>Name</label>
          <NameInput id={f("name")} name="name" placeholder="Enter Name" required {...aria("name")} />
          {err("name")}
        </div>
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor={f("phone")}>Phone Number</label>
          <PhoneInput id={f("phone")} name="phone" required {...aria("phone")} />
          {err("phone")}
        </div>
        <div className="field">
          <label htmlFor={f("email")}>Email</label>
          <input id={f("email")} name="email" type="email" autoComplete="email" placeholder="Enter Email" required {...aria("email")} />
          {err("email")}
        </div>
      </div>
      <div className="field">
        <label htmlFor={f("details")}>Describe Items To Be Removed</label>
        <textarea id={f("details")} name="details" rows={3} placeholder="Example : Couch  in Living Room,Television in Basement" />
      </div>
      <fieldset className="field">
        <legend className="lbl-t">Choose Your Service</legend>
        <div className="seg">
          {BOOKING_SERVICE_OPTIONS.map((o, i) => (
            <span key={o}>
              <input type="radio" name="service" id={f(`svc${i}`)} value={o} defaultChecked={i === 0} />
              <label htmlFor={f(`svc${i}`)}>{o}</label>
            </span>
          ))}
        </div>
      </fieldset>
      <p className="form-note">Our team will arrive in the 2-hour arrival window of your choice.</p>
      <div className="row">
        <div className="field">
          <label htmlFor={f("preferred_date")}>Select Date</label>
          <DatePicker id={f("preferred_date")} name="preferred_date" placeholder="Choose a day" required {...aria("preferred_date")} />
          {err("preferred_date")}
        </div>
        <div className="field">
          <label htmlFor={f("arrival_window")}>Select Time</label>
          <SelectMenu id={f("arrival_window")} name="arrival_window" options={ARRIVAL_WINDOWS} placeholder="Choose a 2-hour window" required {...aria("arrival_window")} />
          {err("arrival_window")}
        </div>
      </div>
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp" />
      <Turnstile onToken={onToken} />
      {status.state === "error" ? (
        <p className="form-err" role="alert">
          {status.message}{" "}
          {status.callUs ? (
            <a className="tlink" href={`tel:${site.phone.tel}`}>
              Call {site.phone.display}
            </a>
          ) : null}
        </p>
      ) : null}
      <button className="btn btn-primary" type="submit" disabled={sending} aria-busy={sending}>
        {sending ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
