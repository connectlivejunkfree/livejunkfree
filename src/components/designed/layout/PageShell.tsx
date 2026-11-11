/**
 * Adapter: the approved demo pages use the site's real header, footer and
 * sticky mobile bar (src/components/layout/PageShell). `pending` is ignored
 * (designed pages are finished); `mobileCta` keeps the demo's label.
 */
import type { ReactNode } from "react";
import { PageShell as SiteShell } from "@/components/layout/PageShell";

export function PageShell({ children, calm }: { children: ReactNode; calm?: boolean; pending?: boolean; mobileCta?: string }) {
  return (
    <SiteShell calm={calm} quoteHref="/contact/">
      {children}
    </SiteShell>
  );
}
