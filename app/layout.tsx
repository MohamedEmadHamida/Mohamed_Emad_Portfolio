import type { Metadata, Viewport } from "next";
import { Anton, JetBrains_Mono, Onest } from "next/font/google";
import { getContent } from "@/lib/server/content-store";
import { vars } from "@/lib/client";
import "./globals.css";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--ff-anton", display: "swap" });
const onest = Onest({ weight: ["400", "500", "600"], subsets: ["latin"], variable: "--ff-onest", display: "swap" });
const mono = JetBrains_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--ff-mono", display: "swap" });

// Absolute base for OG image URLs: NEXT_PUBLIC_SITE_URL once a domain exists, else Vercel's production URL.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export async function generateMetadata(): Promise<Metadata> {
  const { site, projects } = await getContent();
  const title = `${site.name} · ${site.role}`;
  const ogImage = projects[0]?.image;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: `%s · ${site.name}` },
    description: site.description,
    openGraph: { title, description: site.description, type: "website", images: ogImage ? [{ url: ogImage }] : [] },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = {
  themeColor: "#08080a",
  colorScheme: "dark",
};

/** Root shell shared by the public site and /admin. The accent color comes from the CMS settings. */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { site } = await getContent();
  return (
    <html
      lang="en"
      className={`${anton.variable} ${onest.variable} ${mono.variable}`}
      style={/^#[0-9a-f]{6}$/i.test(site.accent) ? vars({ "--accent": site.accent }) : undefined}
      suppressHydrationWarning
    >
      <head>
        {/* Runs before paint so the reveal styles apply from the first frame.
            Fallback: if the app's JS never runs (blocked, failed to load), drop the preloader
            and show the hero after 8s instead of leaving the page stuck at 0%. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'var r=document.documentElement;r.classList.add("js");setTimeout(function(){r.classList.add("hero-in","pre-done")},8000)',
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
