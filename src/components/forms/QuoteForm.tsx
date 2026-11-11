"use client";

/**
 * Quote form (hero card + full form). Fields: name, phone (required), email,
 * postal code (Canadian format), service type, preferred day, details, photos
 * (up to 5 × 10 MB). Inline errors, honeypot, Turnstile, then redirect to the
 * thank-you page (Google Ads conversion page).
 * UI text only; page copy never lives here.
 */
import { useCallback, useId, useRef, useState } from "react";
import { site } from "@/lib/content/client";
import { HAS_LETTERS, MAX_PHOTOS, MAX_PHOTO_BYTES, NAME_VALID, POSTAL_CODE, phoneDigits } from "@/lib/leads/constants";
import { DatePicker, NameInput, PhoneInput, PostalInput, SelectMenu } from "./fields";
import { Icon } from "../icons";
import { Turnstile } from "./Turnstile";
import { useLeadSubmit } from "./useLeadSubmit";

const SERVICES: readonly string[] = ["Residential junk removal", "Commercial junk removal", "Cleanouts", "Demolition", "Not sure"];

type Props = {
  title?: string;
  /** Short hero version: name, phone, postal code, details. */
  compact?: boolean;
  /** Pre-selected service type. */
  service?: string;
  cta?: string;
  formType?: "quote" | "landing";
  id?: string;
};

export function QuoteForm({ title = "Get a Free Quote", compact = false, service = "", cta = "Get my free quote", formType = "quote", id = "quote-form" }: Props) {
  const uid = useId();
  const f = (k: string) => `${uid}-${k}`;
  const { status, submit } = useLeadSubmit();
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [local, setLocal] = useState<Record<string, string>>({});
  const token = useRef<string>("");
  const onToken = useCallback((t: string) => (token.current = t), []);
  const errors = { ...status.fields, ...local };

  const err = (k: string) =>
    errors[k] ? (
      <span className="form-err" id={f(`${k}-err`)}>
        {errors[k]}
      </span>
    ) : null;
  const aria = (k: string) => (errors[k] ? { "aria-invalid": true as const, "aria-describedby": f(`${k}-err`) } : {});

  function pickFiles(list: FileList | null) {
    const arr = Array.from(list ?? []);
    if (arr.length > MAX_PHOTOS) return setFileError(`Please choose up to ${MAX_PHOTOS} photos.`);
    if (arr.some((x) => !x.type.startsWith("image/"))) return setFileError("Photos must be image files.");
    if (arr.some((x) => x.size > MAX_PHOTO_BYTES)) return setFileError("Each photo must be under 10 MB.");
    setFileError("");
    setFiles(arr);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) ?? "").trim();
    // Instant checks for the two fields people most often get wrong.
    const next: Record<string, string> = {};
    if (!NAME_VALID.test(get("name"))) next.name = "Please enter your name (letters only).";
    if (phoneDigits(get("phone")).length !== 10) next.phone = "Please enter a 10-digit phone number.";
    if (get("details") && !HAS_LETTERS.test(get("details"))) next.details = "Please describe the items in words, e.g. 2 couches and a fridge.";
    if (get("postal_code") && !POSTAL_CODE.test(get("postal_code"))) next.postal_code = "Please use a Canadian postal code, e.g. M6K 1X9.";
    setLocal(next);
    if (Object.keys(next).length) return;
    await submit(
      {
        form_type: formType,
        name: get("name"),
        phone: get("phone"),
        email: get("email"),
        postal_code: get("postal_code").toUpperCase(),
        service: get("service"),
        preferred_date: get("preferred_date"),
        details: get("details"),
      },
      { files, turnstileToken: token.current, honeypot: get("company_website") },
    );
  }

  const sending = status.state === "sending";
  return (
    <form id={id} className={compact ? "form qform compact" : "form qform"} onSubmit={onSubmit} noValidate aria-label={title}>
      {title ? <h2 className="d3 form-title">{title}</h2> : null}
      <div className="row">
        <div className="field">
          <label htmlFor={f("name")}>Your name</label>
          <NameInput id={f("name")} name="name" required {...aria("name")} />
          {err("name")}
        </div>
        <div className="field">
          <label htmlFor={f("phone")}>Phone</label>
          <PhoneInput id={f("phone")} name="phone" required {...aria("phone")} />
          {err("phone")}
        </div>
      </div>
      <div className="row">
        {!compact ? (
          <div className="field">
            <label htmlFor={f("email")}>
              Email <i>(optional)</i>
            </label>
            <input id={f("email")} name="email" type="email" autoComplete="email" {...aria("email")} />
            {err("email")}
          </div>
        ) : null}
        <div className="field">
          <label htmlFor={f("postal_code")}>Postal code</label>
          <PostalInput id={f("postal_code")} name="postal_code" placeholder="M6K 1X9" {...aria("postal_code")} />
          {err("postal_code")}
        </div>
        {compact ? (
          <div className="field">
            <label htmlFor={f("preferred_date")}>
              Preferred day <i>(optional)</i>
            </label>
            <DatePicker id={f("preferred_date")} name="preferred_date" />
          </div>
        ) : null}
      </div>
      {!compact ? (
        <div className="row">
          <div className="field">
            <label htmlFor={f("service")}>Service type</label>
            <SelectMenu id={f("service")} name="service" options={SERVICES} defaultValue={service && SERVICES.includes(service) ? service : SERVICES[0]} placeholder="Choose a service" />
          </div>
          <div className="field">
            <label htmlFor={f("preferred_date")}>
              Preferred day <i>(optional)</i>
            </label>
            <DatePicker id={f("preferred_date")} name="preferred_date" />
          </div>
        </div>
      ) : (
        <input type="hidden" name="service" value={service} />
      )}
      <div className="field">
        <label htmlFor={f("details")}>
          What needs to go? <i>(optional)</i>
        </label>
        <textarea id={f("details")} name="details" rows={compact ? 2 : 3} placeholder="e.g. couch and mattress, 3rd floor, elevator available" {...aria("details")} />
        {err("details")}
      </div>
      <label className="upload" htmlFor={f("photos")}>
        <Icon name="camera" width={20} height={20} />
        <span>{files.length ? <b>{files.length} photo{files.length > 1 ? "s" : ""} added</b> : <><b>Add photos</b> for a faster, more accurate quote</>}</span>
        <input id={f("photos")} type="file" accept="image/*" multiple onChange={(e) => pickFiles(e.currentTarget.files)} />
      </label>
      {fileError ? <span className="form-err">{fileError}</span> : null}
      {/* Honeypot: hidden from people and screen readers. */}
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp" />
      <Turnstile onToken={onToken} />
      {status.state === "error" ? (
        <p className="form-err" role="alert">
          {status.message}{" "}
          {status.callUs ? (
            <a className="tlink" href={`tel:${site.phone.tel}`} data-track="phone">
              Call {site.phone.display}
            </a>
          ) : null}
        </p>
      ) : null}
      <button className="btn btn-primary" type="submit" disabled={sending} aria-busy={sending}>
        {sending ? "Sending…" : cta}
      </button>
      <p className="form-note">
        Prefer to talk?{" "}
        <a className="tlink" href={`tel:${site.phone.tel}`}>
          Call {site.phone.display}
        </a>
      </p>
    </form>
  );
}
