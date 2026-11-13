import { about } from "@/lib/content";
import { pad2, vars } from "@/lib/client";
import { SplitTitle } from "@/components/ui/SplitTitle";

export function About() {
  return (
    <section className="sec about" id="about">
      <div className="grid12">
        <div className="c6">
          <div className="eyebrow">About</div>
          <SplitTitle text={about.title} />
          <p className="lead" data-reveal>
            {about.lead}
          </p>
          <ul className="kit" data-reveal aria-label="Tools">
            {about.tools.map((t) => (
              <li key={t} className="tag">
                {t}
              </li>
            ))}
          </ul>
        </div>
        <ul className="rows c6">
          {about.steps.map((s, i) => (
            <li key={s.title} data-reveal style={vars({ "--d": `${i * 90}ms` })}>
              <span className="n">{pad2(i + 1)}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
