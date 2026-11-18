/**
 * /admin: lead inbox and appointment confirmations for Nav's team.
 * Not indexed, not in the sitemap, disallowed in robots.txt. See docs/EMAILS.md.
 */
import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: "Leads – Live Junk Free admin",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="adm">{children}</div>;
}
