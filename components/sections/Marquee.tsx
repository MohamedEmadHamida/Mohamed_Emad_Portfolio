import { disciplines } from "@/lib/content";

export function Marquee() {
  // The list is rendered twice so the -50% loop is seamless.
  const items = [...disciplines, ...disciplines];
  return (
    <section className="marquee" aria-label="Disciplines">
      <div className="track display">
        {items.map((d, i) => (
          <span key={i} aria-hidden={i >= disciplines.length || undefined}>
            {d}
          </span>
        ))}
      </div>
    </section>
  );
}
