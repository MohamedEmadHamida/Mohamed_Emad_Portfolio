import Image from "next/image";
import type { FreeAsset } from "@/lib/content";
import { vars } from "@/lib/client";
import { SectionHead } from "@/components/ui/SectionHead";

/** Free assets grid. Shown on its own page, /free-assets. */
export function FreeAssets({ items: freeAssets }: { items: FreeAsset[] }) {
  return (
    <section className="sec sub" id="assets">
      <SectionHead
        as="h1"
        eyebrow="Free Assets & Tools"
        title="Take it. Break it. Ship it."
        maxWidth="12ch"
        aside={<span className="label">HDAs · Scripts · Materials</span>}
      />
      <p className="lead" data-reveal>
        Houdini digital assets, pipeline scripts and materials from my own work, free to use in personal and commercial
        projects.
      </p>
      <ul className="assets">
        {freeAssets.map((a, i) => (
          <li key={a.slug} className="asset card" data-reveal style={vars({ "--d": `${(i % 3) * 110}ms` })}>
            <div className="ph" style={vars({ "--x": a.art.x, "--y": a.art.y, "--a": a.art.a })}>
              {a.image ? (
                <Image className="ph-art ph-img" src={a.image} alt={a.title} fill sizes="(min-width:768px) 33vw, 100vw" />
              ) : (
                <div className="ph-art" />
              )}
              <span className="tag">{a.tag}</span>
            </div>
            <h3>{a.title}</h3>
            <p>{a.text}</p>
            <div className="asset-meta label">
              <span>{a.version}</span>
              <span className="soon">Download soon</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
