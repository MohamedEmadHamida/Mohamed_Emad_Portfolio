"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { categoryLabel, projectCategories, type Project, type ProjectCategory } from "@/lib/content";
import { pad2, vars } from "@/lib/client";
import { SectionHead } from "@/components/ui/SectionHead";

/** Project grid with a category filter. `page` renders it as the /projects page (h1, no "All projects" button). */
export function Work({ projects, page = false }: { projects: Project[]; page?: boolean }) {
  const [filter, setFilter] = useState<ProjectCategory | "all">("all");
  const shown = projects.filter((p) => filter === "all" || p.category === filter).length;

  return (
    <section className={page ? "sec sub" : "sec"} id="work">
      <SectionHead
        as={page ? "h1" : "h2"}
        eyebrow="Selected Projects"
        title="Work built to be watched twice."
        maxWidth="12ch"
        aside={<span className="label">{pad2(shown)} / Projects</span>}
      />
      <div className="chips" role="group" aria-label="Filter projects">
        {projectCategories.map((c) => (
          <button key={c.id} className="chip" aria-pressed={filter === c.id} onClick={() => setFilter(c.id)} data-track="project_filter" data-track-label={c.id}>
            {c.label}
          </button>
        ))}
      </div>
      <ul className={filter === "all" ? "work" : "work filtered"}>
        {projects.map((p, i) => (
          <li
            key={p.slug}
            data-reveal
            hidden={filter !== "all" && p.category !== filter}
            style={i % 2 ? vars({ "--d": "120ms" }) : undefined}
          >
            <article className="card">
              <div className="ph">
                <Image className="ph-art ph-img" src={p.image} alt={p.alt} fill sizes="(min-width:768px) 50vw, 100vw" />
              </div>
              <div className="card-row">
                <div>
                  {/* The link covers the whole card (see .card-link in globals.css). */}
                  <h3>
                    <Link className="card-link" href={`/projects/${p.slug}`}>
                      {p.title}
                    </Link>
                  </h3>
                  <p>{p.text}</p>
                </div>
                <div className="card-side">
                  <span className="label">{p.kind}</span>
                  <span className="label out">{p.tools}</span>
                </div>
              </div>
              <p className="label cat">{categoryLabel(p.category)}</p>
            </article>
          </li>
        ))}
      </ul>
      {!page && (
        <div className="more">
          <Link className="btn" href="/projects">
            All projects
          </Link>
        </div>
      )}
    </section>
  );
}
