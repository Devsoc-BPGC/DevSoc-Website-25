/**
 * A scene that has not been built yet. Holds its id, so anchors and the
 * directory already work, and its place in the order, so the page has the
 * right length while the night is being built one chapter at a time.
 *
 * Temporary. Each one is replaced by its scene and this file goes when the
 * last one does.
 */

export function Pending({ id, name }: { id: string; name: string }) {
  return (
    <section id={id} className="flex min-h-[100dvh] items-end border-t border-[var(--c-steel)]/30 gutter pb-10">
      <p className="meta text-muted">{name}, not built yet</p>
    </section>
  );
}
