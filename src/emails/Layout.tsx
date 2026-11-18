/**
 * Shared email shell: Live Junk Free branding (logo, #FF691D orange, #242424 ink, Poppins with
 * system fallbacks), plain layout that works in Gmail / Outlook / Apple Mail. No tracking pixels.
 * Wording comes from content/emails.json; see src/lib/email/lead-emails.tsx.
 */
import { Body, Container, Font, Head, Hr, Html, Img, Preview, Section, Text } from "@react-email/components";
import type { ReactNode } from "react";

export const ORANGE = "#FF691D";
export const INK = "#242424";
export const MUTED = "#5B6672";

export function Layout({ preview, siteUrl, footer, children }: { preview: string; siteUrl: string; footer: string; children: ReactNode }) {
  return (
    <Html lang="en-CA">
      <Head>
        <Font fontFamily="Poppins" fallbackFontFamily={["Helvetica", "Arial"]} webFont={{ url: "https://fonts.gstatic.com/s/poppins/v22/pxiEyp8kv8JHgFVrJJfecg.woff2", format: "woff2" }} fontWeight={400} fontStyle="normal" />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: "#F4F5F7", margin: 0, padding: "24px 0", fontFamily: "Poppins, Helvetica, Arial, sans-serif", color: INK }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", backgroundColor: "#FFFFFF", borderRadius: 12, overflow: "hidden" }}>
          <Section style={{ padding: "22px 28px", borderBottom: `4px solid ${ORANGE}` }}>
            <Img src={`${siteUrl}/images/brand/logo-email.png`} width="180" height="40" alt="Live Junk Free" />
          </Section>
          <Section style={{ padding: "26px 28px 8px" }}>{children}</Section>
          <Hr style={{ borderColor: "#E6E8EB", margin: "16px 28px" }} />
          <Section style={{ padding: "0 28px 24px" }}>
            <Text style={{ fontSize: 12, lineHeight: "18px", color: MUTED, margin: 0 }}>{footer}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export const h = { fontSize: 22, lineHeight: "30px", fontWeight: 700, color: INK, margin: "0 0 12px" } as const;
export const p = { fontSize: 15, lineHeight: "23px", color: INK, margin: "0 0 12px" } as const;
export const small = { fontSize: 13, lineHeight: "20px", color: MUTED, margin: "0 0 10px" } as const;
export const label = { fontSize: 12, lineHeight: "16px", color: MUTED, margin: "0", textTransform: "uppercase" as const, letterSpacing: "0.04em" };
export const value = { fontSize: 15, lineHeight: "22px", color: INK, margin: "2px 0 12px", fontWeight: 600 } as const;
export const button = { backgroundColor: ORANGE, color: INK, fontWeight: 700, fontSize: 15, padding: "12px 20px", borderRadius: 999, textDecoration: "none", display: "inline-block" } as const;
