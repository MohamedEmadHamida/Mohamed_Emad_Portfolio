# Portfolio website: plan and status

Owner: Mohamed Emad · 3D FX Artist & Programmer
Last updated: 2026-11-13

## Decisions made

| Topic | Decision |
|---|---|
| Visual base | The "theme" doc (Marcus Vane one-pager) is used for its visual language and motion only: Anton + Onest, rem grid, text reveals, Lenis, liquid hover |
| Dashboard | Custom built and kept very simple. Content editing is low priority. Analytics is the most important part |
| Language | English only |
| Accent color | One variable (`--accent`), must be changeable from the dashboard. Default red `#ff3b1d`. A violet palette was tried and rejected |
| Hosting | Vercel, free tiers first |
| Hero | Showreel is not ready. A still image stands in until it is |
| Navbar | Three frosted-glass pills: logo, links with active-section highlight, "Let's talk" |

## Parts (built one at a time)

| # | Part | Status |
|---|---|---|
| 1 | Design system + homepage | Ported to Next.js 16 (App Router, TypeScript). Content in `lib/content.ts`. Prototype kept in `prototype/` |
| 2 | Projects: grid, filtering, project detail page | Grid + filter on the homepage and on `/projects`. Detail pages at `/projects/[slug]` (soft navigation). Need real write-ups, year, role and more images |
| 3 | Free assets: listing, asset page, download | Own page at `/free-assets` (removed from the homepage). Three placeholder cards, no asset pages or downloads yet |
| 4 | Backend + admin login + simple CMS (MongoDB) | Done: password login at /admin, every section editable as forms, accent color setting, reset to default. Images are entered as paths (upload comes with part 5) |
| 5 | Media pipeline (images, video, download files) | Not started |
| 6 | Contact form sending + messages inbox | Form validates only. Nothing is sent |
| 7 | Analytics: tracking + dashboard page | MVP done: page views, visits, engaged time, time per section, scroll depth, CV/email/outbound/project/render-wall events, referrer, UTM, country/city, device, per-visit timeline. Later: navigation paths, map |
| 8 | SEO, performance, deploy | Not started. The static prototype can be deployed to Vercel as is |

## What the homepage prototype contains

1. Preloader, glass navbar, mobile menu
2. Hero: role lines, availability, CTAs, showreel frame (placeholder still), giant name, dot-grid light currents behind (own implementation, colored from the accent)
3. Marquee of disciplines
4. About: intro, toolkit tags, four pipeline steps (concept to final ad)
5. Services (6)
6. Selected projects (4) with category filter
7. Render Wall: infinite draggable gallery with spotlight and a typewriter focus card
8. Client numbers (25+ clients, ratings) and four client reviews, translated from Arabic
9. Experience, education and awards
10. Free assets (placeholders)
11. CV band
12. Contact: email, form, social links (LinkedIn, Behance, GitHub, Mostaql, Upwork)

## Open items needed from Mohamed

- Original high-resolution renders. Current images are crops of a screenshot, about 440px wide
- Details for Leather Satchel and Forest House: real title, tools, client or personal
- Up to 25 to 30 renders for the Render Wall, each with a title and one line
- The showreel video, or a final poster image
- Which email to show publicly (the CV gmail is used now)
- Real free assets, or hide that section at launch
- Check the English wording of the translated reviews

## Analytics scope (agreed direction)

- MVP: page views, sessions, custom events (showreel played, project opened, CV downloaded, asset downloaded, contact clicked, form submitted, external link clicked), referrer, UTM, device, country
- Later: scroll depth, navigation paths, map, city
- Cookieless, so "returning visitors" is approximate

## Before the site goes public

- ~~Remove or hide the accent swatch bar~~ Shown in development only now
- ~~The CV button does not download a file yet~~ Downloads `public/cv/Mohamed_Emad_CV.pdf`
- The contact form does not send
- On phones the showreel frame overlaps the "Contact me" button in the hero (also in the prototype)
- `public/work/` only holds the old 436px PNGs and can be deleted; images now live in `public/gallery`, `public/projects` and `public/free-assets`
