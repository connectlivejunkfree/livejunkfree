"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
// Transparent version of the client's logo (JUNK-LOGO-01-ORANGE-01.png from livejunkfree.ca, trimmed),
// so it sits on the frosted header without a white box. The white-background logo.webp stays for schema/OG.
const LOGO = { src: "/images/brand/logo-transparent.webp", width: 600, height: 131, alt: "Live Junk Free" } as const;

/** Logo image with the text wordmark as a fallback if the image fails to load. */
export function Logo({ href = "/", height = 44 }: { href?: string | null; height?: number }) {
  const [failed, setFailed] = useState(false);
  const inner = (
    <>
      <Image
        src={LOGO.src}
        alt={LOGO.alt}
        width={LOGO.width}
        height={LOGO.height}
        sizes={`${Math.round((height * LOGO.width) / LOGO.height)}px`}
        loading="eager"
        style={{ height }}
        onError={() => setFailed(true)}
      />
      <span className="wm" aria-hidden={!failed}>
        Live Junk<span> Free</span>
      </span>
    </>
  );
  const cls = failed ? "logo noimg" : "logo";
  if (href === null) return <span className={cls}>{inner}</span>;
  return (
    <Link className={cls} href={href} aria-label="Live Junk Free home">
      {inner}
    </Link>
  );
}
