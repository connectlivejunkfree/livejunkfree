import type { ReactNode } from "react";
import type { PanelContent } from "@content/designed/types";
import { Icon } from "@/components/icons";
import { Rich } from "./Rich";

type Props = Partial<PanelContent> & {
  variant?: "flat" | "white" | "leaf";
  className?: string;
  children?: ReactNode;
  heading?: "h3" | "h2";
};

/** Rounded surface card with optional icon tile, title and text. */
export function Panel({ icon, leaf, title, text, variant, className, children, heading: H = "h3" }: Props) {
  const v = variant ?? (leaf ? "leaf" : undefined);
  return (
    <div className={["panel", v, className].filter(Boolean).join(" ")}>
      {icon ? (
        <div className={leaf ? "icon leaf" : "icon"}>
          <Icon name={icon} />
        </div>
      ) : null}
      {title ? <H className="h4">{title}</H> : null}
      {text ? (
        <p className="small muted">
          <Rich text={text} />
        </p>
      ) : null}
      {children}
    </div>
  );
}
