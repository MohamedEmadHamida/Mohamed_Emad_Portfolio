import type { Metadata } from "next";
import { getContent } from "@/lib/server/content-store";
import { FreeAssets } from "@/components/sections/FreeAssets";
import { Contact } from "@/components/sections/Contact";

export const metadata: Metadata = {
  title: "Free Assets & Tools",
  description: "Free Houdini digital assets, pipeline scripts and materials by Mohamed Emad.",
};

export default async function FreeAssetsPage() {
  const c = await getContent();
  return (
    <main>
      <FreeAssets items={c.freeAssets} />
      <Contact site={c.site} socials={c.socials} />
    </main>
  );
}
