import Image from "next/image";
import type { SiteContent } from "@/lib/content";
import { vars } from "@/lib/client";
import { HeroRain } from "@/components/effects/HeroRain";
import { Timecode } from "@/components/effects/Timecode";
import { ReelPlayer } from "@/components/sections/ReelPlayer";
import { isVimeo } from "@/lib/uploads";

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
  const video = showreel.video?.trim();
  const vimeo = !!video && isVimeo(video);
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

      <figure className={video ? "reel has-video" : "reel"} aria-label={showreel.label}>
        <Image className="reel-poster" src={showreel.poster} alt="" fill sizes="(min-width:1024px) 44vw, (min-width:640px) 52vw, 88vw" priority quality={90} />
        {video && <ReelPlayer src={video} poster={showreel.poster} title={showreel.label} />}
        {/* Vimeo draws its own controls along the edges, so the labels stay off its player. */}
        {!vimeo && (
          <div className="reel-meta top">
            <span>{showreel.label}</span>
            <span>{showreel.format}</span>
          </div>
        )}
        {!video && (
          <div className="reel-ui">
            <span className="play" />
          </div>
        )}
        {!vimeo && (
          <div className="reel-meta">
            <span className="rec">{showreel.status}</span>
            {!video && <Timecode />}
          </div>
        )}
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
