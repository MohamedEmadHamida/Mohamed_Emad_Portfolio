import Image from "next/image";
import type { SiteContent } from "@/lib/content";
import { vars } from "@/lib/client";
import { HeroRain } from "@/components/effects/HeroRain";
import { Timecode } from "@/components/effects/Timecode";

/** One line of the giant name, split into letters that rise in one after another. */
function NameLine({ text, startMs }: { text: string; startMs: number }) {
  return (
    <span aria-hidden="true">
      {[...text].map((ch, i) => (
        <b key={i} style={vars({ "--d": `${startMs + i * 52}ms` })}>
          {ch}
        </b>
      ))}
    </span>
  );
}

type Props = { site: SiteContent["site"]; roles: string[]; showreel: SiteContent["showreel"] };

export function Hero({ site, roles, showreel }: Props) {
  const [first, ...rest] = site.name.split(" ");
  return (
    <section className="hero" id="top">
      <HeroRain accent={site.accent} />
      <div className="hero-top">
        <h2 className="roles display">
          {roles.map((r, i) => (
            <span key={r} style={vars({ "--d": `${0.2 + i * 0.08}s` })}>
              {r}
            </span>
          ))}
        </h2>
        <div className="hero-side">
          {site.availability && <span className="avail">{site.availability}</span>}
          <p>{site.description}</p>
          <div className="cta">
            <a className="btn primary" href="#work">
              View my work
            </a>
            <a className="btn" href="#contact">
              Contact me
            </a>
          </div>
        </div>
      </div>

      <figure className="reel" role="img" aria-label="Showreel placeholder. The reel is in production.">
        <Image className="reel-poster" src={showreel.poster} alt="" fill sizes="(min-width:1024px) 44vw, (min-width:640px) 52vw, 88vw" priority />
        <div className="reel-meta top">
          <span>{showreel.label}</span>
          <span>{showreel.format}</span>
        </div>
        <div className="reel-ui">
          <span className="play" />
        </div>
        <div className="reel-meta">
          <span className="rec">{showreel.status}</span>
          <Timecode />
        </div>
      </figure>

      <h1 className="hero-name display" aria-label={site.name}>
        <NameLine text={first} startMs={0} />
        <NameLine text={rest.join(" ")} startMs={240} />
      </h1>
      <div className="hero-fade" />
      <div className="cue">Scroll to enter</div>
    </section>
  );
}
