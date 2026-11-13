// Shapes shared by the browser tracker (lib/track.ts) and the collector (app/api/track/route.ts).

export const EVENT_NAMES = [
  "cv_download",
  "contact_email",
  "outbound",
  "project_click",
  "project_filter",
  "wall_open",
  "form_submit",
  "nav",
  "asset_download",
] as const;
export type EventName = (typeof EVENT_NAMES)[number];

export type TrackPayload =
  | {
      type: "pageview";
      sid: string;
      path: string;
      /** Only on the first pageview of a session. */
      ref?: string;
      utm?: { source?: string; medium?: string; campaign?: string };
      sw?: number;
    }
  | {
      /** Time actually spent on a page since the last flush (tab visible and the visitor not idle). */
      type: "engagement";
      sid: string;
      path: string;
      ms: number;
      /** Milliseconds each section was on screen, by section key. */
      sections: Record<string, number>;
      /** Deepest scroll position reached, 0–100. */
      scroll: number;
    }
  | { type: "event"; sid: string; path: string; name: EventName; label?: string };

/** Readable names for section keys in the dashboard. */
export const SECTION_LABELS: Record<string, string> = {
  top: "Hero & showreel",
  work: "Selected projects",
  wall: "Render wall",
  clients: "Numbers & reviews",
  services: "Services",
  about: "About",
  experience: "Experience",
  cv: "CV band",
  contact: "Contact",
  assets: "Free assets",
  project: "Project write-up",
  "next-project": "Next project",
};
