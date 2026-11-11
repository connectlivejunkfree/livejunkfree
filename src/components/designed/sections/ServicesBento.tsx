import Image from "next/image";
import Link from "next/link";
import { IMG } from "@content/designed/images";
import { HOME } from "@content/designed/pages/home";
import { Icon } from "@/components/icons";

const SIZES: Record<string, string> = {
  a: "(max-width: 960px) 100vw, 700px",
  b: "(max-width: 640px) 100vw, (max-width: 960px) 50vw, 500px",
  c: "(max-width: 640px) 100vw, (max-width: 960px) 50vw, 500px",
  d: "(max-width: 1280px) 100vw, 1200px",
};

/** Bento grid of the four service families, each with a real job photo. */
export function ServicesBento() {
  return (
    <div className="bento">
      {HOME.bento.cards.map((c) => {
        const wide = c.variant === "d";
        return (
          <Link key={c.title} className={wide ? "bx d max-sm:min-h-[260px]!" : `bx ${c.variant}`} href={c.href}>
            <div className="bg">
              <Image src={IMG[c.image]} alt={c.alt} fill sizes={SIZES[c.variant]} />
            </div>
            <span className="lbl">{c.label}</span>
            <span className="arrow">
              <Icon name="arrow" />
            </span>
            {wide ? (
              <div>
                <h3 className="d3">{c.title}</h3>
                <p>{c.text}</p>
              </div>
            ) : (
              <>
                <h3 className={c.variant === "a" ? "d3" : "h4"}>{c.title}</h3>
                <p>{c.text}</p>
              </>
            )}
          </Link>
        );
      })}
    </div>
  );
}
