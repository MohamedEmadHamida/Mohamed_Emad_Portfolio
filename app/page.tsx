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

// Nav, smooth scroll and page effects live in app/layout.tsx. Free assets have their own page (/free-assets).
export default function HomePage() {
  return (
    <>
      <Preloader />
      <main>
        {/* Proof first: work, then trust (numbers and reviews), then what I offer, then who I am. */}
        <Hero />
        <Marquee />
        <Work />
        <RenderWall />
        <Clients />
        <Services />
        <About />
        <Experience />
        <CvBand />
        <Contact />
      </main>
    </>
  );
}
