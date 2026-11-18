/**
 * The three emails (Answers 18 Nov 2026): customer enquiry acknowledgement, customer
 * pickup confirmation (sent by staff after the phone call), internal new-enquiry notification.
 * Pure presentational components; all text comes from content/emails.json via src/lib/email/lead-emails.tsx.
 */
import { Button, Heading, Section, Text } from "@react-email/components";
import { Layout, button, h, label, p, small, value } from "./Layout";

type Common = { preview: string; siteUrl: string; footer: string };
type Row = [string, string];

function Rows({ rows }: { rows: Row[] }) {
  return (
    <Section style={{ backgroundColor: "#F7F8FA", borderRadius: 10, padding: "14px 16px", margin: "6px 0 14px" }}>
      {rows.map(([k, v]) => (
        <div key={k}>
          <Text style={label}>{k}</Text>
          <Text style={{ ...value, whiteSpace: "pre-wrap" }}>{v}</Text>
        </div>
      ))}
    </Section>
  );
}

function Signoff({ name, email }: { name: string; email?: string }) {
  return (
    <Text style={p}>
      {name}
      {email ? (
        <>
          <br />
          {email}
        </>
      ) : null}
    </Text>
  );
}

/** "We received your Live Junk Free enquiry" (customer). */
export function AcknowledgementEmail(x: Common & { greeting: string; paragraphs: string[]; signoff: string; signoffEmail: string }) {
  return (
    <Layout preview={x.preview} siteUrl={x.siteUrl} footer={x.footer}>
      <Text style={p}>{x.greeting}</Text>
      {x.paragraphs.map((t, i) => (
        <Text key={i} style={i === x.paragraphs.length - 1 ? small : p}>
          {t}
        </Text>
      ))}
      <Signoff name={x.signoff} email={x.signoffEmail} />
    </Layout>
  );
}

/** "Your Live Junk Free pickup is confirmed — [date]" (customer, after the phone call). */
export function ConfirmationEmail(x: Common & { greeting: string; intro: string; rows: Row[]; closing: string; signoff: string }) {
  return (
    <Layout preview={x.preview} siteUrl={x.siteUrl} footer={x.footer}>
      <Text style={p}>{x.greeting}</Text>
      <Text style={p}>{x.intro}</Text>
      <Rows rows={x.rows} />
      <Text style={p}>{x.closing}</Text>
      <Signoff name={x.signoff} />
    </Layout>
  );
}

/** "New website enquiry — [service] — [city]" (team). */
export function InternalEmail(x: Common & { heading: string; rows: Row[]; adminUrl: string; openAdmin: string; photosNote?: string; confirmHint: string }) {
  return (
    <Layout preview={x.preview} siteUrl={x.siteUrl} footer={x.footer}>
      <Heading as="h1" style={h}>
        {x.heading}
      </Heading>
      <Rows rows={x.rows} />
      {x.photosNote ? <Text style={p}>{x.photosNote}</Text> : null}
      <Button href={x.adminUrl} style={button}>
        {x.openAdmin}
      </Button>
      <Text style={{ ...small, marginTop: 14 }}>{x.confirmHint}</Text>
    </Layout>
  );
}
