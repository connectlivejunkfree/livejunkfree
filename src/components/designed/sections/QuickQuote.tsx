"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { HAS_LETTERS } from "@/lib/leads/constants";
import { PostalInput } from "@/components/forms/fields";
import { HOME } from "@content/designed/pages/home";
import { HREF } from "@content/designed/routes";
const PREFILL_KEY = "ljf-quote-prefill";

const Q = HOME.hero.quick;

/** Homepage hero card: two fields that carry over into the full quote form on /contact/. */
export function QuickQuote() {
  const router = useRouter();
  const [itemErr, setItemErr] = useState("");
  return (
    <div className="qcard intro" style={{ "--d": "750ms" } as React.CSSProperties}>
      <h2 className="h4">{Q.title}</h2>
      <p className="small muted mb-3.5">{Q.text}</p>
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const item = String(fd.get("item") ?? "").trim();
          // Words, not just numbers ("2 couches" is fine, "475464" is not).
          if (item && !HAS_LETTERS.test(item)) return setItemErr("Please describe the items in words, e.g. couch and fridge.");
          setItemErr("");
          try {
            sessionStorage.setItem(PREFILL_KEY, JSON.stringify({ item: fd.get("item"), postal: fd.get("postal") }));
          } catch {
            /* storage unavailable: just navigate */
          }
          router.push(HREF.contact);
        }}
      >
        <input name="item" aria-label={Q.itemLabel} placeholder={Q.itemHint} maxLength={200} aria-invalid={itemErr ? true : undefined} aria-describedby={itemErr ? "qq-item-err" : undefined} onChange={() => itemErr && setItemErr("")} />
        {itemErr ? (
          <span className="form-err" id="qq-item-err">
            {itemErr}
          </span>
        ) : null}
        <PostalInput name="postal" aria-label={Q.postalLabel} placeholder={Q.postalHint} />
        <button className="btn btn-primary" type="submit">
          {Q.cta}
        </button>
      </form>
    </div>
  );
}
