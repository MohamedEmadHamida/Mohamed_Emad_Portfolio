import type { Metadata, Viewport } from "next";
import { Anton, JetBrains_Mono, Onest } from "next/font/google";
import { site } from "@/lib/content";
import { Nav } from "@/components/layout/Nav";
import { SmoothScroll } from "@/components/effects/SmoothScroll";
import { PageEffects } from "@/components/effects/PageEffects";
import { AccentSwatch } from "@/components/dev/AccentSwatch";
import "./globals.css";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--ff-anton", display: "swap" });
const onest = Onest({ weight: ["400", "500", "600"], subsets: ["latin"], variable: "--ff-onest", display: "swap" });
const mono = JetBrains_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--ff-mono", display: "swap" });

// Absolute base for OG image URLs: NEXT_PUBLIC_SITE_URL once a domain exists, else Vercel's production URL.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${site.name} · ${site.role}`, template: `%s · ${site.name}` },
  description: site.description,
  openGraph: {
    title: `${site.name} · ${site.role}`,
    description: site.description,
    type: "website",
    images: [{ url: "/projects/ferrero-rocher.webp", width: 872, height: 680 }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#08080a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${anton.variable} ${onest.variable} ${mono.variable}`} suppressHydrationWarning>
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
      <body>
        <Nav />
        {children}
        {process.env.NODE_ENV !== "production" && <AccentSwatch />}
        <SmoothScroll />
        <PageEffects />
      </body>
    </html>
  );
}
