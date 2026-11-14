// Default content for the whole site. The live site reads content from MongoDB (edited in /admin/content);
// any section that was never saved there falls back to the values in this file.
// Components never import content directly: pages load it with getContent() and pass it down as props.

export const site = {
  availability: "Available for Freelance, Part-Time & Full-Time",
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
  /** A Vimeo link or an uploaded webm/mp4. Plays muted on a loop; empty shows the poster only. */
  video: "https://vimeo.com/1239225361" as string,
  poster: "/projects/creative-point-smart-led/cover.webp",
  label: "Showreel 2026",
  format: "1920 × 1080 · 24 fps",
  status: "Now playing",
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

export type ProjectCategory = "animation" | "advertising" | "model" | "env" | "fx" | "print" | "tools";

export const projectCategories: { id: ProjectCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "animation", label: "Product Animation" },
  { id: "advertising", label: "CGI Advertising" },
  { id: "model", label: "Modeling & Lookdev" },
  { id: "env", label: "Environments" },
  { id: "fx", label: "FX & Simulation" },
  { id: "print", label: "3D Printing" },
  { id: "tools", label: "Tools & Pipeline" },
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
  /** Main film (webm/mp4), shown in place of the cover with player controls. The cover is its poster. */
  video?: string;
  /** Extra images or short looping videos, in public/projects/<slug>/. */
  gallery?: { src: string; alt: string }[];
};


const g = (slug: string, items: [string, string][]) => items.map(([f, alt]) => ({ src: `/projects/${slug}/${f}`, alt }));

export const projects: Project[] = [
  {
    slug: "ferrero-rocher",
    title: "Ferrero Rocher CGI Remake",
    text: "A cinematic product film recreated from scratch, built on fluid dynamics, debris simulation and macro texturing.",
    category: "animation",
    image: "/projects/ferrero-rocher/cover.webp",
    alt: "Chocolate hazelnut close-up with gold Ferrero Rocher lettering",
    video: "/projects/ferrero-rocher/film.webm",
    kind: "Personal project",
    tools: "Houdini · Blender · Substance 3D Painter · After Effects · Photoshop",
    role: "FX simulation, modeling, texturing, lookdev, lighting, rendering and compositing",
    url: "https://www.behance.net/gallery/250743835/Ferrero-Rocher-Commercial-Unofficial-CGI-Remake",
    body: [
      "An unofficial CGI remake of the original Ferrero Rocher commercial, made as a learning project in product animation, visual storytelling and Houdini FX.",
      "The caramel is a FLIP fluid simulation and the nut pieces are rigid-body (RBD) simulations, both in Houdini. Modeling, lookdev and rendering were done in Blender, texturing in Substance 3D Painter, and compositing in After Effects.",
    ],
    gallery: g("ferrero-rocher", [
      ["hazelnut-hero.webp", "Hero hazelnut"],
      ["caramel-pour.webp", "Caramel pour, fluid simulation"],
      ["caramel-drip.webp", "Caramel drip"],
      ["nut-crumble-splash.webp", "Crumble hitting the chocolate"],
      ["hazelnut-burst.webp", "Hazelnut burst"],
      ["hazelnut-scatter.webp", "Hazelnut pieces settling"],
      ["nuts-rbd-sim.webp", "Rigid-body simulation of the nut pieces"],
      ["golden-praline.webp", "The finished praline"],
    ]),
  },
  {
    slug: "creative-point-smart-led",
    title: "Creative Point Smart LED",
    text: "A smart LED pool light with RGB and warm color modes, brought out through cinematic animation and photoreal pool scenes.",
    category: "advertising",
    image: "/projects/creative-point-smart-led/cover.webp",
    alt: "Round LED pool light beside a swimming pool with the Creative Point logo",
    video: "/projects/creative-point-smart-led/film.webm",
    kind: "Client work",
    client: "Creative Point",
    tools: "Blender · After Effects · Photoshop",
    body: [
      "Product visuals for Creative Point's smart pool light: a short film and a set of key visuals for social media and the product page.",
      "The production went from concept and storyboard to modeling, texturing, animation, rendering and compositing. Modeling, shading, lighting, animation and rendering were done in Blender, compositing and color in After Effects, and final frame polish in Photoshop.",
    ],
    gallery: g("creative-point-smart-led", [
      ["poolside-logo.webp", "Key visual with the brand lockup"],
      ["sunset-pool.webp", "Sunset pool"],
      ["palace-pool.webp", "Palace pool"],
      ["courtyard-pool.webp", "Courtyard pool"],
      ["poolside-warm.webp", "Warm mode"],
      ["poolside-rgb.webp", "RGB mode"],
      ["poolside-cool.webp", "Cool mode"],
      ["product-angle.webp", "Product angle"],
      ["lens-macro.webp", "Lens macro"],
      ["circuit-macro.webp", "Circuit board macro"],
      ["led-chips.webp", "LED chips"],
      ["scene-blockout.webp", "Scene blockout"],
      ["scene-lit.webp", "Lit scene"],
      ["blender-scene.webp", "The scene in Blender"],
    ]),
  },
  {
    slug: "smart-led-product-film",
    title: "Smart LED Product Film",
    text: "A studio product film for an LED light: hero lineup, macro passes over the board and a water splash, all in CGI.",
    category: "advertising",
    image: "/projects/smart-led-product-film/cover.webp",
    alt: "LED light on a dark studio floor next to the Creative Point logo",
    video: "/projects/smart-led-product-film/film.webm",
    kind: "Client work",
    client: "Creative Point",
    tools: "Blender · After Effects · Photoshop",
    gallery: g("smart-led-product-film", [
      ["lineup-warm.webp", "Lineup, warm light"],
      ["lineup-cool.webp", "Lineup, lights off"],
      ["lens-closeup.webp", "Lens close-up"],
      ["water-splash-film.webm", "Water splash film"],
      ["water-splash.webp", "Water splash"],
      ["board-macro.webp", "Board macro"],
      ["housing-macro.webp", "Housing macro"],
      ["model-front.webp", "Model, front"],
      ["model-side.webp", "Model, side"],
      ["model-back.webp", "Model, back"],
      ["model-bracket.webp", "Mounting bracket"],
      ["blender-scene.webp", "The scene in Blender"],
    ]),
  },
  {
    slug: "leather-satchel",
    title: "Leather Satchel",
    text: "A hand-tooled leather bag with stitching, brass buckles and years of wear in the texture work.",
    category: "model",
    image: "/projects/leather-satchel/cover.webp",
    alt: "Worn brown leather satchel with a tooled flap",
    video: "/projects/leather-satchel/film.webm",
    kind: "Personal project",
    tools: "Blender · Substance 3D Painter",
    body: [
      "A 3D prop study of a vintage leather satchel, textured in Substance 3D Painter and rendered in Blender: aged leather, worn edges, decorative stitching and embossed floral patterns.",
      "The clay render, normal pass and color variants show the asset before and after texturing.",
    ],
    gallery: g("leather-satchel", [
      ["hero-dark.webp", "Hero render"],
      ["flap-closeup.webp", "Flap close-up"],
      ["leather-detail.webp", "Leather detail"],
      ["turntable-front.webp", "Front view"],
      ["texturing-process.webm", "Texturing in Substance Painter"],
      ["substance-painter.webp", "Substance Painter"],
      ["clay-render.webp", "Clay render"],
      ["normal-pass.webp", "Normal pass"],
      ["grey-variant.webp", "Grey variant"],
      ["black-variant.webp", "Black variant"],
    ]),
  },
  {
    slug: "desert-oasis",
    title: "Desert Oasis",
    text: "A desert oasis at golden hour: dunes, palms and still water, built as a full environment in Houdini.",
    category: "env",
    image: "/projects/desert-oasis/cover.webp",
    alt: "Desert oasis with palm trees around a lake at sunset",
    kind: "Personal project",
    tools: "Houdini",
    gallery: g("desert-oasis", [["breakdown.webm", "Breakdown"]]),
  },
  {
    slug: "procedural-flower",
    title: "Procedural Flower",
    text: "A daisy built procedurally in Houdini, so petals, stems and blooms can be regenerated in any arrangement.",
    category: "model",
    image: "/projects/procedural-flower/cover.webp",
    alt: "Two white daisies against a dark violet background",
    kind: "Personal project",
    tools: "Houdini",
    gallery: g("procedural-flower", [
      ["single-bloom.webp", "Single bloom"],
      ["pair-tall.webp", "Pair of blooms"],
      ["single-tall.webp", "Tall stem"],
      ["petals-violet.webp", "Petals"],
      ["petals-macro.webp", "Petal macro"],
    ]),
  },
  {
    slug: "portrait-lighting",
    title: "Portrait Lighting Study",
    text: "Lighting and lookdev on a character portrait in Houdini Karma, from clay renders to the final lit passes.",
    category: "model",
    image: "/projects/portrait-lighting/cover.webp",
    alt: "Clay render of a woman's portrait in profile",
    video: "/projects/portrait-lighting/film.webm",
    kind: "Personal project",
    tools: "Houdini · Karma",
    gallery: g("portrait-lighting", [
      ["lighting-pass-2.webm", "Lighting pass"],
      ["clay-side.webp", "Clay, side"],
      ["clay-front.webp", "Clay, three-quarter"],
    ]),
  },
  {
    slug: "crowd-battle",
    title: "Crowd Battle",
    text: "A crowd simulation of two armies charging across a plain at night. Work in progress.",
    category: "fx",
    image: "/projects/crowd-battle/cover.webp",
    alt: "Army of soldiers charging across a dark plain at night",
    kind: "Work in progress",
    tools: "Houdini",
    gallery: g("crowd-battle", [
      ["blockout.webm", "Crowd blockout"],
      ["agent-cycle.webm", "Agent animation cycle"],
    ]),
  },
  {
    slug: "animal-bookmarks",
    title: "3D Animal Bookmark Set",
    text: "Five character bookmarks, an octopus, shark, turtle, wolf and ghost, designed in 3D and made to be printed.",
    category: "print",
    image: "/projects/animal-bookmarks/cover.webp",
    alt: "Five cartoon animal bookmarks under the title 3D Animal Bookmark Set",
    kind: "Product design",
    tools: "Blender · PrusaSlicer",
    gallery: g("animal-bookmarks", [
      ["octopus-turntable.webm", "Octopus turntable"],
      ["turtle-on-book.webp", "Turtle on a book"],
      ["octopus-on-book.webp", "Octopus on a book"],
      ["shark-on-book.webp", "Shark on a book"],
      ["wolf-on-book.webp", "Wolf on a book"],
      ["ghost-on-book.webp", "Ghost on a book"],
      ["turtle-corner.webp", "Turtle on a page corner"],
      ["octopus-corner.webp", "Octopus on a page corner"],
      ["octopus.webp", "Octopus"],
      ["shark.webp", "Shark"],
      ["turtle.webp", "Turtle"],
      ["slicer.webp", "Prepared for printing"],
    ]),
  },
  {
    slug: "saudi-landmarks",
    title: "Saudi Landmark Souvenirs",
    text: "The Makkah Clock Tower, Kingdom Centre and the Prophet's Mosque as printable souvenirs, with renders and production sheets.",
    category: "print",
    image: "/projects/saudi-landmarks/cover.webp",
    alt: "Model of the Makkah Clock Tower on a round wooden base",
    kind: "Product design",
    tools: "Blender",
    gallery: g("saudi-landmarks", [
      ["clock-tower-detail.webp", "Makkah Clock Tower, detail"],
      ["clock-tower-top.webp", "Makkah Clock Tower, from above"],
      ["clock-tower-base.webp", "Engraved base"],
      ["kingdom-centre.webp", "Kingdom Centre"],
      ["kingdom-centre-room.webp", "Kingdom Centre in a room"],
      ["kingdom-centre-wood.webp", "Kingdom Centre, wood base"],
      ["kingdom-centre-sheet.webp", "Kingdom Centre sheet"],
      ["kingdom-centre-dimensions.webp", "Kingdom Centre dimensions"],
      ["prophets-mosque.webp", "The Prophet's Mosque"],
      ["prophets-mosque-top.webp", "The Prophet's Mosque, from above"],
      ["prophets-mosque-sheet.webp", "The Prophet's Mosque sheet"],
      ["prophets-mosque-dimensions.webp", "The Prophet's Mosque dimensions"],
    ]),
  },
  {
    slug: "printed-products",
    title: "3D Printed Products",
    text: "Ramadan lanterns, a tabletop fountain and a pill dispenser prototype, taken from model to printed part.",
    category: "print",
    image: "/projects/printed-products/cover.webp",
    alt: "Two dark lanterns with gold details",
    kind: "Product design",
    tools: "Blender · PrusaSlicer",
    gallery: g("printed-products", [
      ["lantern.webp", "Lantern"],
      ["pill-dispenser.webm", "Pill dispenser prototype"],
      ["fountain-printed.webp", "Printed fountain"],
      ["fountain-side.webp", "Fountain, side"],
      ["fountain-model.webp", "Fountain model"],
      ["fountain-slicer.webp", "Fountain in the slicer"],
      ["vase-sculpt.webp", "Vase sculpt"],
    ]),
  },
  {
    slug: "hdri-browser",
    title: "HDRI Image Browser for Houdini",
    text: "A Houdini panel that previews every HDRI in your folders and applies one to the scene light in a click.",
    category: "tools",
    image: "/projects/hdri-browser/cover.webp",
    alt: "HDRI Image Browser panel with a row of HDRI thumbnails",
    video: "/projects/hdri-browser/demo.webm",
    kind: "Tool",
    tools: "Houdini · Python",
    gallery: g("hdri-browser", [
      ["preview.webm", "Browsing HDRIs"],
      ["install.webm", "Installing"],
      ["folder-settings.webp", "Folder settings"],
    ]),
  },
];

export type WallItem = { title: string; tag: string; src: string; desc: string };

export const renderWall: WallItem[] = [
  { title: "Caramel Pour", tag: "Product Animation", src: "/gallery/caramel-pour.webp", desc: "Ferrero Rocher remake. Caramel fluid simulation over the hazelnut." },
  { title: "Toy", tag: "3D Animation", src: "/gallery/toy.webm", desc: "A toy dinosaur and a ball in a dark room." },
  { title: "Smart LED Poolside", tag: "CGI Advertising", src: "/gallery/led-poolside.webp", desc: "Creative Point pool light, key visual." },
  { title: "Desert Oasis", tag: "Environments", src: "/gallery/desert-oasis.webp", desc: "Dunes, palms and still water at golden hour, built in Houdini." },
  { title: "Explosion", tag: "FX & Simulation", src: "/gallery/explosion.webm", desc: "Pyro explosion simulation." },
  { title: "Leather Satchel", tag: "Modeling & Lookdev", src: "/gallery/satchel.webp", desc: "Tooled leather, brass buckles and years of wear in the textures." },
  { title: "Procedural Flower", tag: "Houdini", src: "/gallery/procedural-flower.webp", desc: "Daisies built procedurally in Houdini." },
  { title: "Octopus Bookmark", tag: "3D Printing", src: "/gallery/octopus-bookmark.webm", desc: "Turntable of the octopus from the animal bookmark set." },
  { title: "Crumble Splash", tag: "Product Animation", src: "/gallery/nut-crumble-splash.webp", desc: "Nut crumble hitting the chocolate, rigid-body simulation." },
  { title: "Sponge Character", tag: "Character", src: "/gallery/sponge-character.webp", desc: "3D SpongeBob character design, modeled and textured in Blender." },
  { title: "Sunset Pool", tag: "CGI Advertising", src: "/gallery/led-sunset-pool.webp", desc: "Smart LED pool light at sunset." },
  { title: "Gas Station", tag: "Environments", src: "/gallery/gas-station-sunset.webp", desc: "Roadside gas station at sunset." },
  { title: "JAVERNE Perfume", tag: "Product Animation", src: "/gallery/javerne-perfume.webm", desc: "Luxury perfume bottle with a volumetric smoke simulation, made in Blender." },
  { title: "Makkah Clock Tower", tag: "3D Printing", src: "/gallery/makkah-clock-tower.webp", desc: "Printable souvenir of the clock tower." },
  { title: "White Sneaker", tag: "Product Render", src: "/gallery/sneaker-white.webp", desc: "Floating sneaker product shot." },
  { title: "Portrait Study", tag: "Lookdev", src: "/gallery/portrait-clay.webp", desc: "Clay portrait lit in Houdini Karma." },
  { title: "LED Lineup", tag: "CGI Advertising", src: "/gallery/led-lineup.webp", desc: "Smart LED lineup with warm reflections." },
  { title: "Diner at Night", tag: "Environments", src: "/gallery/diner-night.webp", desc: "Empty diner lit in neon." },
  { title: "Hazelnut Scatter", tag: "Product Animation", src: "/gallery/hazelnut-scatter.webp", desc: "Hazelnut pieces settling on the table." },
  { title: "Ramadan Lanterns", tag: "3D Printing", src: "/gallery/lanterns.webp", desc: "Two lanterns designed for printing." },
  { title: "Toy Car", tag: "3D Animation", src: "/gallery/toy-car.webp", desc: "A toy car under a single spotlight." },
  { title: "Satchel Close-up", tag: "Modeling & Lookdev", src: "/gallery/satchel-closeup.webp", desc: "Tooled flap and brass buckle." },
  { title: "Stylized Spray Can", tag: "Game Asset", src: "/gallery/spray-can.webp", desc: "Game-ready energy spray can, low and high poly, with Unity-ready textures." },
  { title: "Gas Station at Dusk", tag: "Environments", src: "/gallery/gas-station-dusk.webp", desc: "The gas station under a blue dusk sky." },
  { title: "Flower Macro", tag: "Houdini", src: "/gallery/flower-macro.webp", desc: "Macro of the procedural daisy." },
  { title: "Yellow Sneaker", tag: "Product Render", src: "/gallery/sneaker-yellow.webp", desc: "Sneaker on a yellow backdrop." },
  { title: "The Prophet's Mosque", tag: "3D Printing", src: "/gallery/prophets-mosque.webp", desc: "Printable souvenir with an engraved base." },
  { title: "Sponge Close-up", tag: "Character", src: "/gallery/sponge-closeup.webp", desc: "Close-up of the SpongeBob model's sponge material." },
  { title: "Diner by Day", tag: "Environments", src: "/gallery/diner-day.webp", desc: "The diner in daylight." },
  { title: "Victorian House", tag: "Architecture", src: "/gallery/forest-house.webp", desc: "A Victorian-style house in a forest, modeled and rendered in Blender." },
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
  /** The download itself (uploaded in the dashboard, or a path/link). Without it the card says "Download soon". */
  file?: string;
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

/** Everything editable in the CMS. Each key is saved as one document in the "content" collection. */
export const defaultContent = {
  site,
  heroRoles,
  showreel,
  disciplines,
  about,
  services,
  projects,
  renderWall,
  reviewsUrl,
  stats,
  voices,
  experience,
  freeAssets,
  socials,
};

export type SiteContent = typeof defaultContent;
export type ContentKey = keyof SiteContent;
