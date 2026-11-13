import { services } from "@/lib/content";
import { pad2, vars } from "@/lib/client";
import { SectionHead } from "@/components/ui/SectionHead";

export function Services() {
  return (
    <section className="sec" id="services">
      <SectionHead
        eyebrow="Services"
        title="What I can take off your desk."
        maxWidth="13ch"
        aside={<span className="label">{pad2(services.length)} / Services</span>}
      />
      <ul className="svc">
        {services.map((s, i) => (
          <li key={s.title} data-reveal style={vars({ "--d": `${(i % 3) * 110}ms` })}>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
            <span className="label">{s.meta}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
