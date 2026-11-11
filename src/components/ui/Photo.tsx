/**
 * Rounded photo (`.photo`) using next/image with the image's real size, so
 * nothing shifts while it loads. Alt text comes from the content file.
 * Content fields used: Image { src, alt, width?, height? }.
 */
import Image from "next/image";
import { imageSize, type Image as ImageT } from "@/lib/content";

type Props = {
  image: ImageT;
  sizes: string;
  /** Above-the-fold hero photos load eagerly with high priority. */
  priority?: boolean;
  className?: string;
  cap?: string;
};

export function Photo({ image, sizes, priority, className, cap }: Props) {
  const size = imageSize(image.src) ?? (image.width && image.height ? { width: image.width, height: image.height } : { width: 1200, height: 900 });
  return (
    <figure className={className ? `photo ${className}` : "photo"} style={{ aspectRatio: `${size.width} / ${size.height}` }}>
      <Image
        src={image.src}
        alt={image.alt}
        width={size.width}
        height={size.height}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
      />
      {cap ? <figcaption className="cap">{cap}</figcaption> : null}
    </figure>
  );
}
