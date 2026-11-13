import type { Metadata } from "next";
import { FreeAssets } from "@/components/sections/FreeAssets";
import { Contact } from "@/components/sections/Contact";

export const metadata: Metadata = {
  title: "Free Assets & Tools",
  description: "Free Houdini digital assets, pipeline scripts and materials by Mohamed Emad.",
};

export default function FreeAssetsPage() {
  return (
    <main>
      <FreeAssets />
      <Contact />
    </main>
  );
}
