import type { SiteContent } from "@/lib/content";
import { vars } from "@/lib/client";
import { SectionHead } from "@/components/ui/SectionHead";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { Voices } from "./Voices";

type Props = { stats: SiteContent["stats"]; voices: SiteContent["voices"]; reviewsUrl: string };

export function Clients({ stats, voices, reviewsUrl }: Props) {
  return (
    <section className="sec" id="clients">
      <SectionHead
        eyebrow="By The Numbers"
        title="Trusted by 25+ clients."
        maxWidth="14ch"
        aside={
          <ExternalLink className="btn" href={reviewsUrl}>
            Read reviews on Mostaql ↗
          </ExternalLink>
        }
      />
      <dl className="stats">
        {stats.map((s, i) => (
          <div key={s.label} data-reveal style={vars({ "--d": `${i * 110}ms` })}>
            <dt>{s.label}</dt>
            <dd>{s.value}</dd>
          </div>
        ))}
      </dl>
      <Voices voices={voices} />
    </section>
  );
}
