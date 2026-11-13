import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryLabel, getProject, projects } from "@/lib/content";
import { vars } from "@/lib/client";
import { SplitTitle } from "@/components/ui/SplitTitle";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { Contact } from "@/components/sections/Contact";

type Params = { params: Promise<{ slug: string }> };

// Every project page is built at build time; unknown slugs are a 404.
export const dynamicParams = false;
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = getProject((await params).slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.text,
    openGraph: { title: p.title, description: p.text, images: [{ url: p.image }] },
  };
}

function externalLabel(url: string) {
  if (url.includes("behance.net")) return "View on Behance";
  if (url.includes("artstation.com")) return "View on ArtStation";
  if (url.includes("vimeo.com") || url.includes("youtube.com")) return "Watch the film";
  return "View project";
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();

  const index = projects.indexOf(p);
  const next = projects[(index + 1) % projects.length];

  // Only facts that exist are shown; nothing is invented to fill the grid.
  const facts = [
    ["Client", p.client],
    ["Type", p.kind],
    ["Year", p.year],
    ["Role", p.role],
    ["Tools", p.tools],
    ["Category", categoryLabel(p.category)],
  ].filter((f): f is [string, string] => !!f[1]);

  return (
    <main>
      <article className="sec sub proj">
        <Link className="label back" href="/projects">
          ← All projects
        </Link>
        <div className="eyebrow">{categoryLabel(p.category)}</div>
        <SplitTitle as="h1" text={p.title} className="display proj-title" />

        <div className="grid12 proj-intro">
          <div className="c7">
            <p className="lead" data-reveal>
              {p.text}
            </p>
            {p.url && (
              <ExternalLink className="btn primary proj-cta" href={p.url} data-reveal>
                {externalLabel(p.url)} ↗
              </ExternalLink>
            )}
          </div>
          <dl className="proj-facts c5" data-reveal style={vars({ "--d": "120ms" })}>
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt className="label">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <figure className="proj-cover" data-reveal>
          <Image src={p.image} alt={p.alt} fill priority sizes="100vw" />
        </figure>

        {p.body && p.body.length > 0 && (
          <div className="proj-body">
            {p.body.map((para, i) => (
              <p key={i} data-reveal>
                {para}
              </p>
            ))}
          </div>
        )}

        {p.gallery && p.gallery.length > 0 && (
          <ul className="proj-gallery">
            {p.gallery.map((g, i) => (
              <li key={g.src} data-reveal style={vars({ "--d": `${(i % 2) * 120}ms` })}>
                <Image src={g.src} alt={g.alt} fill sizes="(min-width:768px) 50vw, 100vw" />
              </li>
            ))}
          </ul>
        )}
      </article>

      {next.slug !== p.slug && (
        <section className="sec next-proj" aria-label="Next project">
          <Link href={`/projects/${next.slug}`} className="next-link card" data-reveal>
            <span className="label">Next project</span>
            <span className="next-title display">{next.title}</span>
            <span className="ph next-ph">
              <Image className="ph-art ph-img" src={next.image} alt="" fill sizes="(min-width:768px) 40vw, 100vw" />
            </span>
          </Link>
        </section>
      )}

      <Contact />
    </main>
  );
}
