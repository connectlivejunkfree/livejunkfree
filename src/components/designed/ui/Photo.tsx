import Image from "next/image";
import { IMG, type ImageKey } from "@content/designed/images";

type Props = {
  image: ImageKey;
  alt: string;
  cap?: string;
  /** Responsive sizes hint for next/image. */
  sizes: string;
  /** Above-the-fold hero photos load eagerly with high priority. */
  priority?: boolean;
  className?: string;
};

/** Rounded photo card (`.photo`) with an optional caption pill. */
export function Photo({ image, alt, cap, sizes, priority, className }: Props) {
  return (
    <div className={className ? `photo ${className}` : "photo"}>
      <Image
        src={IMG[image]}
        alt={alt}
        fill
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
      />
      {cap ? <span className="cap">{cap}</span> : null}
    </div>
  );
}
