/**
 * Renders the three lead emails (HTML + plain text) to .next/email-preview/ for review. Sends nothing.
 *
 *   npx tsx --tsconfig scripts/tsconfig.emails.json scripts/preview-emails.tsx
 */
import { mkdirSync, writeFileSync } from "node:fs";
import * as React from "react";
import { render } from "@react-email/components";
import emails from "../content/emails.json";

// tsx compiles JSX with the classic transform: make React global, then load the templates.
(globalThis as { React?: typeof React }).React = React;

const OUT = ".next/email-preview";
mkdirSync(OUT, { recursive: true });
const site = "https://livejunkfree.ca";
const fill = (t: string, v: Record<string, string>) => t.replace(/\{(\w+)\}/g, (_m, k: string) => v[k] ?? "");

async function save(name: string, el: React.ReactElement) {
  writeFileSync(`${OUT}/${name}.html`, await render(el));
  writeFileSync(`${OUT}/${name}.txt`, await render(el, { plainText: true }));
}

(async () => {
  const { AcknowledgementEmail, ConfirmationEmail, InternalEmail } = await import("../src/emails/LeadEmails");
  const E = emails;
  const v = { firstName: "Alex", service: "deck demolition", inCity: " in Aurora" };
  await save(
    "acknowledgement",
    <AcknowledgementEmail preview={E.acknowledgement.preheader} siteUrl={site} footer={E.brand.footer} greeting={fill(E.acknowledgement.greeting, v)} paragraphs={E.acknowledgement.paragraphs.map((t) => fill(t, v))} signoff={E.brand.signoff} signoffEmail={E.brand.signoffEmail} />,
  );
  await save(
    "confirmed",
    <ConfirmationEmail preview={E.confirmed.preheader} siteUrl={site} footer={E.brand.footer} greeting="Hi Alex," intro={E.confirmed.intro} rows={[["Service", "Deck demolition"], ["Address", "1 Test St, Aurora"], ["Date", "Saturday, November 22, 2026"], ["Arrival window", "10 AM - 12 PM"]]} closing={E.confirmed.closing} signoff={E.brand.signoff} />,
  );
  await save(
    "internal",
    <InternalEmail preview="TEST lead" siteUrl={site} footer={E.brand.footer} heading={E.internal.heading} rows={[["Submission ID", "00000000-0000-0000-0000-000000000000"], ["Submitted", "Nov 18, 2026, 3:20 p.m. (Toronto)"], ["Status", "New"], ["Source page", `${site}/services/junk-demolition-services/deck-demolition-services/`], ["Name", "TEST LJF QA"], ["Phone", "+1 647 555 0100"], ["Service", "Deck demolition"], ["City", "Aurora"], [E.internal.callbackNote, "Afternoon"], ["Description", "TEST – LJF QA"]]} adminUrl={`${site}/admin/leads/00000000-0000-0000-0000-000000000000/`} openAdmin={E.internal.openAdmin} photosNote="2 photo(s) attached – view them securely in admin." confirmHint={E.internal.confirmHint} />,
  );
  console.log("subjects:", E.acknowledgement.subject, "|", fill(E.confirmed.subject, { date: "Saturday, November 22, 2026" }), "|", fill(E.internal.subject, { service: "Deck demolition", city: "Aurora" }));
  console.log("written to", OUT);
})();
