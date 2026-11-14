import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryLabel } from "@/lib/content";
import { vars } from "@/lib/client";
import { getContent, getProjectBySlug } from "@/lib/server/content-store";
import { SplitTitle } from "@/components/ui/SplitTitle";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { Contact } from "@/components/sections/Contact";
import { AutoVideo } from "@/components/ui/AutoVideo";
import { isVideo } from "@/lib/uploads";

type Params = { params: Promise<{ slug: string }> };

// Known projects are built at build time. Projects added later in the dashboard are rendered
// on first visit and then cached; unknown slugs are a 404.
export async function generateStaticParams() {
  return (await getContent()).projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = await getProjectBySlug((await params).slug);
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
  const c = await getContent();
  const projects = c.projects;
  const p = projects.find((x) => x.slug === slug);
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
      <article className="sec sub proj" data-section="project">
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
          {p.video ? (
            <AutoVideo className="proj-film" src={p.video} poster={p.image} label={p.alt} controls />
          ) : (
            <Image src={p.image} alt={p.alt} fill priority sizes="100vw" quality={90} />
          )}
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
                {isVideo(g.src) ? (
                  <AutoVideo src={g.src} label={g.alt} />
                ) : (
                  // Natural size, so tall renders and wide screenshots are shown whole instead of cropped.
                  <Image src={g.src} alt={g.alt} width={0} height={0} sizes="(min-width:768px) 50vw, 100vw" />
                )}
                {g.alt && <span className="label proj-cap">{g.alt}</span>}
              </li>
            ))}
          </ul>
        )}
      </article>

      {next.slug !== p.slug && (
        <section className="sec next-proj" aria-label="Next project" data-section="next-project">
          <Link href={`/projects/${next.slug}`} className="next-link card" data-reveal>
            <span className="label">Next project</span>
            <span className="next-title display">{next.title}</span>
            <span className="ph next-ph">
              <Image className="ph-art ph-img" src={next.image} alt="" fill sizes="(min-width:768px) 40vw, 100vw" quality={90} />
            </span>
          </Link>
        </section>
      )}

      <Contact site={c.site} socials={c.socials} />
    </main>
  );
}
