import type { Metadata } from "next";
import { getContent } from "@/lib/server/content-store";
import { Work } from "@/components/sections/Work";
import { Contact } from "@/components/sections/Contact";

export const metadata: Metadata = {
  title: "Projects",
  description: "Product animation, CGI advertising, Houdini FX, modeling and environments by Mohamed Emad.",
};

export default async function ProjectsPage() {
  const c = await getContent();
  return (
    <main>
      <Work projects={c.projects} page />
      <Contact site={c.site} socials={c.socials} />
    </main>
  );
}
