# Projects

One folder per project, named after its slug (the page is `/projects/<slug>`).

- `cover.webp`: the card image and the poster of the film. Cards are 16:11, so keep the subject away from the edges
- `film.webm` (or `demo.webm`, `breakdown.webm`): optional main film, shown in place of the cover with sound and controls
- Everything else: the gallery, shown at its natural shape in two columns. Short `.webm`/`.mp4` clips play muted on a loop
- Names: lowercase with dashes that say what the picture is, e.g. `flap-closeup.webp`
- Images: `.webp`, about 2000–2560px wide. Videos: `.webm`, keep each clip a few MB
- After adding a file, list it in the project's `gallery` in `lib/content.ts`, or upload it from the dashboard

The raw library these were picked from is `public/AllData/`, which stays on this machine (it is in `.gitignore`).
