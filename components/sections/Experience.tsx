import { Fragment } from "react";
import type { SiteContent } from "@/lib/content";
import { vars } from "@/lib/client";
import { SectionHead } from "@/components/ui/SectionHead";
import { ExternalLink } from "@/components/ui/ExternalLink";

function Trophy() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4z" />
      <path d="M8 5H4.5v1.5A3.5 3.5 0 0 0 8 10M16 5h3.5v1.5A3.5 3.5 0 0 1 16 10M12 13v4M8.5 20h7M10 17h4v3h-4z" />
    </svg>
  );
}

export function Experience({ items: experience }: { items: SiteContent["experience"] }) {
  return (
    <section className="sec" id="experience">
      <SectionHead eyebrow="Experience" title="Where the hours went." maxWidth="14ch" />
      <ol className="xp">
        {experience.map((x, i) => (
          <li key={x.title} data-reveal style={vars({ "--d": `${i * 90}ms` })}>
            <span className="when">{x.when}</span>
            <div>
              <h3>{x.title}</h3>
              <span className="label">
                {x.links
                  ? x.links.map((l, j) => (
                      <Fragment key={l.href}>
                        {j > 0 && " · "}
                        <ExternalLink className="ul" href={l.href}>
                          {l.label}
                        </ExternalLink>
                      </Fragment>
                    ))
                  : x.org}
              </span>
            </div>
            {x.awards ? (
              <ul className="pts">
                {x.awards.map((a) => (
                  <li key={a}>
                    <Trophy />
                    {a}
                  </li>
                ))}
              </ul>
            ) : (
              <p>{x.text}</p>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
