// Describes every editable section of the site. The dashboard builds its forms from this,
// and the server validates saves against it, so the two can never disagree.
import { accentPresets, projectCategories, type ContentKey } from "./content";
import type { UploadFolder } from "./uploads";

type Base = { k: string; label: string; help?: string; optional?: boolean };
export type Field =
  | (Base & { type: "text" | "textarea" | "url" | "slug"; max?: number })
  /** image: picture shown on the site. media: picture or short looping video. file: a download (CV, HDA, zip…). All can be uploaded or typed as a path/URL. */
  | (Base & { type: "image" | "media" | "file"; folder: UploadFolder })
  | (Base & { type: "color"; presets?: { label: string; value: string }[] })
  | (Base & { type: "select"; options: { value: string; label: string }[] })
  | (Base & { type: "strings"; multiline?: boolean; itemLabel?: string })
  | (Base & {
      type: "list";
      item: Field[];
      titleKey?: string;
      itemLabel?: string;
      /** Adds an "Upload images" button that creates one item per picked image: { [src]: url, [alt]: file name }. */
      bulkUpload?: { src: string; alt?: string; folder: UploadFolder };
    })
  | (Base & { type: "object"; fields: Field[] });

export type SectionDef = { key: ContentKey; title: string; description: string; root: Field };

const t = (k: string, label: string, extra: Partial<Base> & { max?: number } = {}): Field => ({ k, label, type: "text", ...extra });
const ta = (k: string, label: string, extra: Partial<Base> & { max?: number } = {}): Field => ({ k, label, type: "textarea", ...extra });

export const SECTIONS: SectionDef[] = [
  {
    key: "site",
    title: "Settings & accent",
    description: "Name, role, contact email, availability and the accent color used across the whole site.",
    root: {
      k: "",
      label: "",
      type: "object",
      fields: [
        { k: "accent", label: "Accent color", type: "color", presets: accentPresets, help: "Used for the giant name, buttons, highlights and the hero rain." },
        t("name", "Full name"),
        t("role", "Role / title"),
        t("availability", "Availability badge", { optional: true, help: "Leave empty to hide the green badge in the hero." }),
        ta("description", "Hero description"),
        t("location", "Location"),
        t("email", "Public email"),
        { k: "cvUrl", label: "CV file", type: "file", folder: "cv", help: "Upload the PDF, or keep the path of the file in /public." },
      ],
    },
  },
  { key: "heroRoles", title: "Hero roles", description: "The stacked lines at the top left of the hero.", root: { k: "", label: "Roles", type: "strings", itemLabel: "role" } },
  {
    key: "showreel",
    title: "Showreel",
    description: "The framed reel in the hero.",
    root: {
      k: "",
      label: "",
      type: "object",
      fields: [
        { k: "poster", label: "Poster image", type: "image", folder: "gallery" },
        t("label", "Label (top left)"),
        t("format", "Format (top right)"),
        t("status", "Status (bottom left)"),
      ],
    },
  },
  { key: "disciplines", title: "Marquee", description: "Words scrolling under the hero.", root: { k: "", label: "Disciplines", type: "strings", itemLabel: "word" } },
  {
    key: "projects",
    title: "Projects",
    description: "Cards on the homepage and /projects, and each project's own page.",
    root: {
      k: "",
      label: "Projects",
      type: "list",
      titleKey: "title",
      itemLabel: "project",
      item: [
        t("title", "Title"),
        { k: "slug", label: "URL slug", type: "slug", help: "Lowercase words joined by dashes. The page is /projects/<slug>." },
        { k: "category", label: "Category", type: "select", options: projectCategories.filter((c) => c.id !== "all").map((c) => ({ value: c.id, label: c.label })) },
        ta("text", "Short description", { help: "Shown on the card and at the top of the project page." }),
        { k: "image", label: "Cover image", type: "image", folder: "projects" },
        t("alt", "Cover image description (for screen readers)"),
        t("kind", "Type", { help: "e.g. Personal project, Client work" }),
        t("tools", "Tools"),
        { k: "url", label: "External link", type: "url", optional: true, help: "Behance, ArtStation, Vimeo…" },
        t("client", "Client", { optional: true }),
        t("year", "Year", { optional: true }),
        t("role", "Your role", { optional: true }),
        { k: "body", label: "Write-up paragraphs", type: "strings", multiline: true, optional: true, itemLabel: "paragraph" },
        {
          k: "gallery",
          label: "Gallery",
          type: "list",
          optional: true,
          titleKey: "alt",
          itemLabel: "image",
          bulkUpload: { src: "src", alt: "alt", folder: "gallery" },
          item: [{ k: "src", label: "Image", type: "image", folder: "gallery" }, t("alt", "Description")],
        },
      ],
    },
  },
  {
    key: "renderWall",
    title: "Render wall",
    description: "Frames on the infinite draggable wall.",
    root: {
      k: "",
      label: "Frames",
      type: "list",
      titleKey: "title",
      itemLabel: "frame",
      item: [t("title", "Title"), t("tag", "Tag"), { k: "src", label: "Image or video", type: "media", folder: "gallery", help: "A picture, or a short webm/mp4 that plays muted on a loop." }, t("desc", "One line")],
    },
  },
  {
    key: "stats",
    title: "Numbers",
    description: "The four big numbers in the clients section.",
    root: { k: "", label: "Numbers", type: "list", titleKey: "label", itemLabel: "number", item: [t("value", "Value"), t("label", "Label")] },
  },
  {
    key: "voices",
    title: "Client reviews",
    description: "Reviews shown next to the numbers.",
    root: {
      k: "",
      label: "Reviews",
      type: "list",
      titleKey: "name",
      itemLabel: "review",
      item: [t("name", "Client name"), t("project", "Project"), ta("quote", "Quote")],
    },
  },
  { key: "reviewsUrl", title: "Reviews link", description: "Where the “Read reviews” button goes.", root: { k: "", label: "URL", type: "url" } },
  {
    key: "services",
    title: "Services",
    description: "The services grid.",
    root: { k: "", label: "Services", type: "list", titleKey: "title", itemLabel: "service", item: [t("title", "Title"), ta("text", "Description"), t("meta", "Deliverables line")] },
  },
  {
    key: "about",
    title: "About",
    description: "Intro, toolkit and the four pipeline steps.",
    root: {
      k: "",
      label: "",
      type: "object",
      fields: [
        t("title", "Title"),
        ta("lead", "Intro paragraph"),
        { k: "tools", label: "Toolkit", type: "strings", itemLabel: "tool" },
        { k: "steps", label: "Pipeline steps", type: "list", titleKey: "title", itemLabel: "step", item: [t("title", "Title"), ta("text", "Text")] },
      ],
    },
  },
  {
    key: "experience",
    title: "Experience",
    description: "Work, education and awards.",
    root: {
      k: "",
      label: "Entries",
      type: "list",
      titleKey: "title",
      itemLabel: "entry",
      item: [
        t("when", "When"),
        t("title", "Title"),
        t("org", "Organisation", { optional: true, help: "Shown under the title when there are no links." }),
        { k: "links", label: "Links", type: "list", optional: true, titleKey: "label", itemLabel: "link", item: [t("label", "Label"), { k: "href", label: "URL", type: "url" }] },
        ta("text", "Description", { optional: true }),
        { k: "awards", label: "Awards (shown instead of the description)", type: "strings", optional: true, itemLabel: "award" },
      ],
    },
  },
  {
    key: "freeAssets",
    title: "Free assets",
    description: "Cards on the /free-assets page.",
    root: {
      k: "",
      label: "Assets",
      type: "list",
      titleKey: "title",
      itemLabel: "asset",
      item: [
        t("title", "Title"),
        { k: "slug", label: "Slug", type: "slug" },
        ta("text", "Description"),
        t("tag", "Tag", { help: "e.g. HDA, Python, Materials" }),
        t("version", "Version line"),
        { k: "image", label: "Preview image", type: "image", folder: "assets", optional: true, help: "Without an image the card shows a gradient." },
        { k: "file", label: "Download file", type: "file", folder: "assets", optional: true, help: "The HDA, script or zip visitors download. Without it the card says “Download soon”." },
        { k: "art", label: "Gradient (used when there is no image)", type: "object", fields: [t("x", "Light X (e.g. 30%)"), t("y", "Light Y"), t("a", "Angle (e.g. 160deg)")] },
      ],
    },
  },
  {
    key: "socials",
    title: "Social links",
    description: "Links in the footer.",
    root: { k: "", label: "Links", type: "list", titleKey: "label", itemLabel: "link", item: [t("label", "Label"), { k: "href", label: "URL", type: "url" }] },
  },
];

export const sectionByKey = (key: string) => SECTIONS.find((s) => s.key === key);

/* ---------- validation (runs on the server before saving) ---------- */

const URL_RE = /^(https?:\/\/[^\s]+|\/[^\s]*|mailto:[^\s]+)$/i;
// Images must come from this site (/public, /uploads) or a host next/image is allowed to load (next.config.ts).
const IMAGE_RE = /^(\/[^\s]+|https:\/\/res\.cloudinary\.com\/[^\s]+|https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/[^\s]+)$/i;
// Downloads can live anywhere (uploaded to Blob, in /public, or a link to Drive/GitHub…).
const FILE_RE = /^(https:\/\/[^\s]+|\/[^\s]+)$/i;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Cleans a value against its field. Returns undefined for an empty optional field (the key is then left out). */
export function sanitize(field: Field, value: unknown, path: string, errors: string[]): unknown {
  const where = path || field.label || "value";
  const need = (msg: string) => {
    errors.push(`${where}: ${msg}`);
    return undefined;
  };

  switch (field.type) {
    case "text":
    case "textarea":
    case "url":
    case "image":
    case "media":
    case "file":
    case "slug": {
      const s = typeof value === "string" ? value.trim() : "";
      if (!s) return field.optional ? undefined : need("required");
      const max = field.type === "textarea" ? 5000 : "max" in field && field.max ? field.max : 500;
      if (s.length > max) return need(`too long (max ${max} characters)`);
      if (field.type === "url" && !URL_RE.test(s)) return need("must start with https://, / or mailto:");
      if (field.type === "image" && !IMAGE_RE.test(s)) return need("upload an image, or use a path starting with /");
      if (field.type === "media" && !IMAGE_RE.test(s)) return need("upload an image or a video, or use a path starting with /");
      if (field.type === "file" && !FILE_RE.test(s)) return need("upload a file, or use a path starting with / or an https:// link");
      if (field.type === "slug" && !SLUG_RE.test(s)) return need("use lowercase letters, numbers and dashes only");
      return s;
    }
    case "color": {
      const s = typeof value === "string" ? value.trim() : "";
      return /^#[0-9a-f]{6}$/i.test(s) ? s.toLowerCase() : need("must be a hex color like #ff3b1d");
    }
    case "select": {
      const s = typeof value === "string" ? value : "";
      return field.options.some((o) => o.value === s) ? s : need("pick one of the options");
    }
    case "strings": {
      const arr = Array.isArray(value) ? value : [];
      const out = arr.map((v) => (typeof v === "string" ? v.trim() : "")).filter(Boolean);
      if (out.some((s) => s.length > 5000)) return need("an entry is too long");
      if (!out.length) return field.optional ? undefined : need("add at least one");
      return out;
    }
    case "list": {
      const arr = Array.isArray(value) ? value : [];
      if (!arr.length) return field.optional ? undefined : need("add at least one");
      if (arr.length > 200) return need("too many entries");
      const out = arr.map((item, i) => sanitize({ k: "", label: "", type: "object", fields: field.item }, item, `${where} #${i + 1}`, errors));
      for (const f of field.item) {
        if (f.type !== "slug") continue;
        const seen = new Set<string>();
        for (const it of out as Record<string, unknown>[]) {
          const v = it?.[f.k] as string | undefined;
          if (v && seen.has(v)) errors.push(`${where}: the slug "${v}" is used twice`);
          if (v) seen.add(v);
        }
      }
      return out;
    }
    case "object": {
      const src = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
      const out: Record<string, unknown> = {};
      for (const f of field.fields) {
        const v = sanitize(f, src[f.k], path ? `${path} › ${f.label}` : f.label, errors);
        if (v !== undefined) out[f.k] = v;
      }
      return out;
    }
  }
}
