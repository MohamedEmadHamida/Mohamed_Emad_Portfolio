# Mohamed Emad — Portfolio

Next.js (App Router, TypeScript) site for the portfolio, plus the project plan.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

Needs Node 20.9 or newer.

## Layout

- `app/` — `layout.tsx` (fonts, metadata), `page.tsx` (the homepage), `globals.css` (all styles), `icon.svg`
- `components/sections/` — one file per homepage section
- `components/effects/` — client-only effects: preloader, smooth scroll (Lenis), reveals, hero dots, timecode
- `components/layout/Nav.tsx` — navbar and mobile menu
- `components/dev/AccentSwatch.tsx` — accent color preview, shown in development only
- `lib/content.ts` — all homepage text and data. The CMS replaces this file in part 4
- `lib/client.ts` — small browser helpers (scroll lock, CSS variable styles)
- `public/gallery/` — Render Wall images, `public/projects/` — project covers,
  `public/free-assets/` — free asset previews (each folder has a README with sizes and naming)
- `public/cv/` — the CV file. `public/work/` only holds the old low-res PNGs and can be deleted
- `prototype/index.html` — the original single-file prototype, kept for reference
- `docs/PLAN.md` — decisions, the eight parts of the project, status and open items

## Deploy

Vercel: import the repo, framework preset "Next.js", defaults for everything else.
Set `NEXT_PUBLIC_SITE_URL` once there is a custom domain (used for social preview image URLs).
