/**
 * Splits a headline into words for the hero "words rise in" animation.
 * The .w wrappers only animate under prefers-reduced-motion: no-preference;
 * otherwise they render as plain inline text.
 */
export function WordReveal({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  return (
    <>
      {words.map((w, i) => (
        <span key={i}>
          <span className="w">
            <span style={{ "--i": i } as React.CSSProperties}>{w}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </>
  );
}
