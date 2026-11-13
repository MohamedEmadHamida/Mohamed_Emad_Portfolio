import { getContent } from "@/lib/server/content-store";
import { Nav } from "@/components/layout/Nav";
import { SmoothScroll } from "@/components/effects/SmoothScroll";
import { PageEffects } from "@/components/effects/PageEffects";
import { Tracker } from "@/components/analytics/Tracker";

/** Public site shell: nav, smooth scroll, reveal effects and analytics. /admin does not use any of these. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { site } = await getContent();
  return (
    <>
      <Nav name={site.name} />
      {children}
      <SmoothScroll />
      <PageEffects />
      <Tracker />
    </>
  );
}
