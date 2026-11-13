import { getContent } from "@/lib/server/content-store";
import { Preloader } from "@/components/effects/Preloader";
import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { About } from "@/components/sections/About";
import { Services } from "@/components/sections/Services";
import { Work } from "@/components/sections/Work";
import { RenderWall } from "@/components/sections/RenderWall";
import { Clients } from "@/components/sections/Clients";
import { Experience } from "@/components/sections/Experience";
import { CvBand } from "@/components/sections/CvBand";
import { Contact } from "@/components/sections/Contact";

// Nav, smooth scroll, effects and analytics live in app/(site)/layout.tsx. Free assets have their own page.
export default async function HomePage() {
  const c = await getContent();
  return (
    <>
      <Preloader name={c.site.name} />
      <main>
        {/* Proof first: work, then trust (numbers and reviews), then what I offer, then who I am. */}
        <Hero site={c.site} roles={c.heroRoles} showreel={c.showreel} />
        <Marquee items={c.disciplines} />
        <Work projects={c.projects} />
        <RenderWall items={c.renderWall} />
        <Clients stats={c.stats} voices={c.voices} reviewsUrl={c.reviewsUrl} />
        <Services items={c.services} />
        <About about={c.about} />
        <Experience items={c.experience} />
        <CvBand cvUrl={c.site.cvUrl} />
        <Contact site={c.site} socials={c.socials} />
      </main>
    </>
  );
}
