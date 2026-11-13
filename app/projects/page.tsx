import type { Metadata } from "next";
import { Work } from "@/components/sections/Work";
import { Contact } from "@/components/sections/Contact";

export const metadata: Metadata = {
  title: "Projects",
  description: "Product animation, CGI advertising, Houdini FX, modeling and environments by Mohamed Emad.",
};

export default function ProjectsPage() {
  return (
    <main>
      <Work page />
      <Contact />
    </main>
  );
}
