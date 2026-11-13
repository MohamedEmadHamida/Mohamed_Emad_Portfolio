# Mohamed Emad — Portfolio

Next.js (App Router, TypeScript) portfolio with a private dashboard: analytics and a content editor.

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill it in (see below)
npm run db                   # local MongoDB, keep this terminal open (first run downloads it, ~70MB)
npm run dev                  # http://localhost:3000, dashboard at /admin
```

Needs Node 20.9 or newer. Without `MONGODB_URI` the site still runs on the default content in
`lib/content.ts`; analytics are then not recorded and the dashboard cannot save.

## Environment variables

| Name | What it is |
|---|---|
| `MONGODB_URI` | Local: `mongodb://127.0.0.1:27017`. Production: the MongoDB Atlas connection string |
| `MONGODB_DB` | Database name, default `portfolio` |
| `ADMIN_PASSWORD` | Password for `/admin` |
| `SESSION_SECRET` | Random string, 32+ characters. Signs the login cookie and the daily visitor hash |
| `NEXT_PUBLIC_SITE_URL` | Optional. The public URL once there is a custom domain |

## Dashboard (`/admin`)

- **Analytics**: visitors, visits, time on site, project pages opened, CV downloads, contact clicks,
  most-watched sections, referrers and UTM campaigns, countries and cities, devices, and every visit
  as a timeline (pages, time per section, clicks). Cookieless: visitors are anonymous; country and
  city come from Vercel's headers (empty when running locally).
- **Content**: every section of the site, edited as forms. Saving updates the live site at once.
  "Reset to default" goes back to `lib/content.ts`.
- **Settings & accent**: name, email, availability badge and the accent color.
- "Don't count my visits" stops your own browser from being counted.

## Layout

- `app/(site)/` — the public site (home, `/projects`, `/projects/[slug]`, `/free-assets`) and its layout
- `app/admin/` — login, analytics, content editor; `proxy.ts` keeps `/admin` behind the login
- `app/api/track/` — receives analytics events
- `components/sections/` — one file per site section; `components/admin/` — dashboard pieces
- `components/analytics/Tracker.tsx` + `lib/track.ts` — the browser side of the analytics
- `lib/content.ts` — default content; `lib/cms-schema.ts` — editable fields and their validation
- `lib/server/` — database, login session, content store, analytics queries (server only)
- `public/gallery/`, `public/projects/`, `public/free-assets/` — images (each folder has a README)
- `scripts/local-db.mjs` — the local MongoDB used by `npm run db`
- `docs/PLAN.md` — decisions, the eight parts of the project, status and open items

## Deploy (Vercel)

1. Create a free MongoDB Atlas cluster (M0). Add a database user, allow access from anywhere
   (`0.0.0.0/0`, Vercel has no fixed IPs) and copy the connection string.
2. In Vercel → Project → Settings → Environment Variables add `MONGODB_URI`, `ADMIN_PASSWORD`
   and `SESSION_SECRET` (a new long random value, not the local one).
3. Redeploy. The dashboard is at `https://<your-site>/admin`.
