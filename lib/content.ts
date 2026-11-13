// All homepage content in one place. In part 4 this file is replaced by data from the CMS (MongoDB),
// so components only read these shapes and never hard-code text.

export const site = {
  name: "Mohamed Emad",
  role: "3D FX Artist & Programmer",
  location: "Cairo, Egypt",
  email: "mohamedemadhamida@gmail.com",
  cvUrl: "/cv/Mohamed_Emad_CV.pdf",
  description:
    "3D FX generalist focused on simulation: Pyro, FLIP fluids and RBD destruction. Cinematic product films built in Houdini, Blender and Maya.",
  accent: "#ff3b1d",
};

// "/#id" = a section on the homepage, "/path" = its own page, "#contact" = on every page.
// `match` marks the link active on other pages whose path starts with it.
export const navLinks: { href: string; label: string; match?: string }[] = [
  { href: "/#work", label: "Work", match: "/projects" },
  { href: "/#services", label: "Services" },
  { href: "/#about", label: "About" },
  { href: "/#experience", label: "Experience" },
  { href: "/free-assets", label: "Free Assets", match: "/free-assets" },
  { href: "#contact", label: "Contact" },
];

export const heroRoles = ["3D FX Artist", "Programmer", "Product Animation", "CGI Advertising"];

export const showreel = {
  poster: "/gallery/creative-point-led-studio.webp",
  label: "Showreel 2026",
  format: "1920 × 1080 · 24 fps",
  status: "In production",
};

export const disciplines = [
  "Product Animation",
  "CGI Advertising",
  "Pyro",
  "FLIP Fluids",
  "RBD Destruction",
  "Cloth",
  "Particles",
];

export const about = {
  title: "An artist who reads the source code.",
  lead: "I hold a computer science degree and a diploma in 3D FX dynamics and simulation from ITI. Since 2023 I have worked as a freelance 3D artist on advertising and product visualization. That mix means I can direct a shot and also write the tool the shot needs.",
  tools: [
    "Houdini",
    "Blender",
    "Maya",
    "Substance 3D Painter",
    "Karma / Mantra",
    "USD",
    "After Effects",
    "Premiere Pro",
    "Photoshop",
    "Python",
    "C / C++ / C#",
  ],
  steps: [
    { title: "Concept & storyboard", text: "The idea, the references and a board that locks every shot before any 3D starts." },
    { title: "Model & lookdev", text: "The product is built to scale, then shaded and textured until it matches the real thing." },
    { title: "Animate & simulate", text: "Cameras and motion first, then the FX: fluids, smoke, destruction and cloth." },
    { title: "Light, render & comp", text: "Final lighting and renders, then compositing and grade into the finished ad." },
  ],
};

export const services = [
  { title: "Product Animation", text: "Hero films that show how a product is built, opens and behaves.", meta: "15–60s film · Cutdowns · Loops" },
  { title: "CGI Advertising", text: "Full CG spots and social campaigns, from storyboard to final grade.", meta: "TVC · Social formats · Key visuals" },
  { title: "Houdini FX", text: "Liquids, fire and smoke, particles, destruction and cloth, shot-ready.", meta: "FLIP · Pyro · RBD · Cloth" },
  { title: "Product Visualization", text: "Studio stills and packshots that match the real product.", meta: "Stills · 360 spins · Variants" },
  { title: "Modeling & Lookdev", text: "Accurate models from CAD or reference, with production materials.", meta: "Model · UV · Shaders · Textures" },
  { title: "Render & Comp", text: "Lighting, rendering and compositing for shots built elsewhere.", meta: "Lighting · AOVs · Final grade" },
];

export type ProjectCategory = "animation" | "advertising" | "model" | "env";

export const projectCategories: { id: ProjectCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "animation", label: "Product Animation" },
  { id: "advertising", label: "CGI Advertising" },
  { id: "model", label: "Modeling & Lookdev" },
  { id: "env", label: "Environments" },
];

export const categoryLabel = (id: ProjectCategory) => projectCategories.find((c) => c.id === id)?.label ?? id;

export type Project = {
  slug: string;
  title: string;
  text: string;
  category: ProjectCategory;
  image: string;
  alt: string;
  kind: string;
  tools: string;
  /** External link, e.g. the Behance case study. */
  url?: string;
  // Detail page only. Everything below is optional; empty fields are not shown.
  client?: string;
  year?: string;
  role?: string;
  /** Longer write-up, one string per paragraph. */
  body?: string[];
  /** Extra images, in public/projects/<slug>/ or public/gallery/. */
  gallery?: { src: string; alt: string }[];
};

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

export const projects: Project[] = [
  {
    slug: "ferrero-rocher",
    title: "Ferrero Rocher CGI Remake",
    text: "A cinematic product film recreated from scratch, built on fluid dynamics, debris simulation and macro texturing.",
    category: "animation",
    image: "/projects/ferrero-rocher.webp",
    alt: "Chocolate hazelnut close-up with gold title lettering",
    kind: "Personal project",
    tools: "Houdini · Substance · Blender",
    url: "https://www.behance.net/gallery/250743835/Ferrero-Rocher-Commercial-Unofficial-CGI-Remake",
  },
  {
    slug: "creative-point-smart-led",
    title: "Creative Point Smart LED",
    text: "A smart LED pool light with RGB and warm color modes, brought out through cinematic animation and photoreal rendering.",
    category: "advertising",
    image: "/projects/creative-point-led-poolside.webp",
    alt: "Round LED light beside a swimming pool",
    kind: "Animation & rendering",
    tools: "Blender · After Effects · Photoshop",
    client: "Creative Point",
    gallery: [
      { src: "/gallery/creative-point-led-studio.webp", alt: "The LED light in a studio shot with the Creative Point logo" },
      { src: "/gallery/creative-point-led-macro.webp", alt: "Macro detail of the LED lens and embossed mark" },
    ],
  },
  {
    slug: "leather-satchel",
    title: "Leather Satchel",
    text: "A hand-tooled leather bag with stitching, brass buckles and years of wear in the texture work.",
    category: "model",
    image: "/projects/leather-satchel.webp",
    alt: "Worn leather satchel with tooled flap",
    kind: "Asset",
    tools: "Details to add",
  },
  {
    slug: "forest-house",
    title: "Forest House",
    text: "A full exterior environment: a veranda house set among pines in dappled light.",
    category: "env",
    image: "/projects/forest-house.webp",
    alt: "Wooden house with a red roof in a forest clearing",
    kind: "Environment",
    tools: "Details to add",
  },
];

export type WallItem = { title: string; tag: string; src: string; desc: string };

export const renderWall: WallItem[] = [
  { title: "Ferrero Rocher", tag: "Product Animation", src: "/gallery/ferrero-rocher.webp", desc: "CGI remake. Fluids, debris and macro texturing built in Houdini." },
  { title: "Smart LED Poolside", tag: "CGI Advertising", src: "/gallery/creative-point-led-poolside.webp", desc: "Creative Point pool light, modeled, lit and rendered in Blender." },
  { title: "Smart LED Studio", tag: "CGI Advertising", src: "/gallery/creative-point-led-studio.webp", desc: "Studio shot of the light with the brand lockup." },
  { title: "Smart LED Macro", tag: "CGI Advertising", src: "/gallery/creative-point-led-macro.webp", desc: "Macro detail of the lens and the embossed mark." },
  { title: "Leather Satchel", tag: "Modeling & Lookdev", src: "/gallery/leather-satchel.webp", desc: "Tooled leather, brass buckles and years of wear in the textures." },
  { title: "Forest House", tag: "Environments", src: "/gallery/forest-house.webp", desc: "A veranda house among pines in dappled light." },
];

export const reviewsUrl = "https://mostaql.com/u/Mohamed_Emad_1/reviews";

export const stats = [
  { value: "25+", label: "Clients served since 2023" },
  { value: "5.0", label: "Quality of delivered work, Mostaql" },
  { value: "5.0", label: "On-time delivery, Mostaql" },
  { value: "5/5", label: "Overall client rating" },
];

// Reviews from Mostaql, translated from Arabic.
export const voices = [
  { name: "Saleh A.", project: "3D device assembly illustration", quote: "Professional work in 3D design and animation, and a pleasure to deal with. I recommend working with him." },
  { name: "Amal E.", project: "Figurine design for PVC and resin", quote: "Respectful, easy and flexible to work with. He brings out the required details professionally." },
  { name: "Lara S.", project: "House model in Maya", quote: "Professional work, cooperative and very courteous to deal with." },
  { name: "Hossam M.", project: "3D product model", quote: "Very respectful and professional in his work. I was happy to work with him." },
];

export const socials = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/mohamed-emad2" },
  { label: "Behance", href: "https://www.behance.net/mohamedemad406" },
  { label: "GitHub", href: "https://github.com/MohamedEmadHamida" },
  { label: "Mostaql", href: "https://mostaql.com/u/Mohamed_Emad_1/reviews" },
  { label: "Upwork", href: "https://www.upwork.com/freelancers/~01a2315df48ee11661" },
];

export type Experience = {
  when: string;
  title: string;
  org?: string;
  links?: { label: string; href: string }[];
  text?: string;
  awards?: string[];
};

export const experience: Experience[] = [
  {
    when: "2023 — Now",
    title: "Freelance 3D Artist",
    links: [
      { label: "Mostaql", href: "https://mostaql.com/u/Mohamed_Emad_1/reviews" },
      { label: "Upwork", href: "https://www.upwork.com/freelancers/~01a2315df48ee11661" },
    ],
    text: "3D animations for advertising and product visualization, plus models and game assets. Client projects handled from brief to final delivery.",
  },
  {
    when: "Feb — May 2025",
    title: "Freelancing Coach",
    org: "Eyouth · Digital Egypt Pioneers Initiative",
    text: "Trained university students to build profiles, position services and win projects. Over 90% of trainees reached their freelancing targets.",
  },
  {
    when: "2025 — 2026",
    title: "Diploma, 3D FX Dynamics & Simulation",
    org: "Information Technology Institute · Smart Village",
    text: "A nine-month program in dynamics and simulation for FX.",
  },
  {
    when: "2021 — 2025",
    title: "B.Sc. Computer Science",
    org: "Higher Future Institute for Specialized Technological Studies",
    text: "Graduation project: Smart Medical Pill Dispenser, graded A+.",
  },
  {
    when: "2025",
    title: "Awards",
    org: "Smart Medical Pill Dispenser",
    awards: [
      "2nd place, Software Track, National Forum for Scientific & Engineering Innovations",
      "1st place, Integrated System, Talents Competition, East Cairo",
    ],
  },
];

export type FreeAsset = {
  slug: string;
  title: string;
  text: string;
  tag: string;
  version: string;
  /** Preview in public/free-assets/, e.g. "/free-assets/rbd-fracture-hda.webp". Without it the card shows `art`. */
  image?: string;
  /** Gradient placeholder position and angle, used when there is no image. */
  art: { x: string; y: string; a: string };
};

// Placeholders until real assets exist (part 3).
export const freeAssets: FreeAsset[] = [
  { slug: "example-hda", title: "Example HDA", text: "A digital asset with a preview, install steps and a changelog.", tag: "HDA", version: "v1.0 · Houdini 21", art: { x: "30%", y: "30%", a: "160deg" } },
  { slug: "example-script", title: "Example Script", text: "A pipeline script with usage notes and supported versions.", tag: "Python", version: "v0.3 · Python 3", art: { x: "70%", y: "40%", a: "260deg" } },
  { slug: "example-material-pack", title: "Example Material Pack", text: "Shaders and textures with a render preview for each one.", tag: "Materials", version: "v1.2 · MaterialX", art: { x: "50%", y: "75%", a: "20deg" } },
];

export const accentPresets = [
  { label: "Red", value: "#ff3b1d" },
  { label: "Amber", value: "#ffb224" },
  { label: "Lime", value: "#c8f751" },
  { label: "Blue", value: "#4d8dff" },
  { label: "Bone", value: "#e9e4d8" },
];
