import { site, socials } from "@/lib/content";
import { vars } from "@/lib/client";
import { SplitTitle } from "@/components/ui/SplitTitle";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { ContactForm } from "./ContactForm";

export function Contact() {
  const year = new Date().getFullYear();
  return (
    <footer className="contact" id="contact">
      <div className="grid12">
        <div className="c7">
          <div className="eyebrow">Let&apos;s Build</div>
          <SplitTitle text="Have a product that needs to move?" />
          <p className="lead" data-reveal>
            Send the brief, a deadline and any reference. I reply within two working days.
          </p>
          <a className="mail" href={`mailto:${site.email}`}>
            {site.email} <i>↗</i>
          </a>
        </div>
        <ContactForm className="c5" style={vars({ "--d": "120ms" })} />
      </div>
      <div className="bar grid12">
        <div className="c6">
          <p className="sig display">{site.name}</p>
          <p className="label">
            {site.role} · {site.location}
          </p>
        </div>
        <nav className="c3 social" aria-label="Social">
          <ul>
            {socials.map((s) => (
              <li key={s.label}>
                <ExternalLink href={s.href}>{s.label}</ExternalLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="c3 right">
          <p className="label" style={{ margin: 0 }}>
            © {year} {site.name}
          </p>
          <a className="label totop" href="#top">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
