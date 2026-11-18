"use client";

/**
 * Booking form on /contact/: same fields, options and order as the live site's
 * form (address, name, phone, email, items, Single / Multiple Items /
 * Curbside (10% Discount, items already at the curb or driveway), preferred callback time (optional; not a booking).
 * Only change: the label typo "Describe Items To Be Remove" → "Removed"
 */
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { site } from "@/lib/content/client";
import { BOOKING_SERVICE_OPTIONS, CALLBACK_TIMES, NAME_VALID, POSTAL_CODE, phoneDigits } from "@/lib/leads/constants";
import { CityInput, NameInput, PhoneInput, PostalInput, SelectMenu } from "./fields";
import { Turnstile } from "./Turnstile";
import { useLeadSubmit } from "./useLeadSubmit";
import { PRICING_SELECTION_KEY } from "@/lib/leads/context";
import { fact } from "@/lib/content/facts";

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
        callback_time: get("callback_time"),
        page_id: "/contact/",
        pricing_selection: (() => {
          try {
            return sessionStorage.getItem(PRICING_SELECTION_KEY) ?? "";
          } catch {
            return "";
          }
        })(),
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
        {/* Rule R6: the discount applies only to items already at the curb / in the driveway. */}
        <p className="form-note">Curbside: {fact("curbsideDiscount")}.</p>
      </fieldset>
      {/* Answers A3.4/A3.6: no pickup date/time booking; the team agrees the pickup by phone. */}
      <div className="field">
        <label htmlFor={f("callback_time")}>{fact("callbackNote", "label")}</label>
        <SelectMenu id={f("callback_time")} name="callback_time" options={CALLBACK_TIMES} placeholder="Choose a time" />
        <span className="form-note">{fact("callbackNote")}</span>
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
