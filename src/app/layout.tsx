/**
 * Root layout: fonts, <html lang="en-CA">, Search Console verification,
 * Google Tag Manager, tracking listeners (gclid capture, phone clicks) and the
 * motion layer. The review toolbar shows only in review mode.
 */
import type { Metadata, Viewport } from "next";
import { GoogleTagManager } from "@next/third-parties/google";
import { Bricolage_Grotesque, Geist } from "next/font/google";
import { TrackingListeners } from "@/components/layout/TrackingListeners";
import { MotionLayer } from "@/components/motion/MotionLayer";
import { ReviewBar } from "@/components/review/ReviewBar";
import { site } from "@/lib/content";
import { GTM_ID, REVIEW_MODE } from "@/lib/env";
import "@/styles/globals.css";

// Static weights only (600/700/800): much smaller than the variable font with the
// optical-size axis, so the H1 (the LCP element on Ads pages) paints fast on mobile.
const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-display", display: "swap" });
const body = Geist({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  applicationName: site.name,
  verification: { google: site.searchConsoleVerification },
  formatDetection: { telephone: false },
  icons: { icon: "/favicon.ico" },
  ...(REVIEW_MODE ? { robots: { index: false, follow: false } } : {}),
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0E1621" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-scroll-behavior lets Next.js turn smooth scrolling off during page changes,
    // so each new page opens at the top.
    <html lang="en-CA" data-scroll-behavior="smooth" className={`${display.variable} ${body.variable}`}>
      {GTM_ID ? <GoogleTagManager gtmId={GTM_ID} /> : null}
      <body>
        {REVIEW_MODE ? <ReviewBar /> : null}
        {children}
        <TrackingListeners />
        <MotionLayer />
      </body>
    </html>
  );
}
