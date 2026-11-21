export type ProjectCategory = "Client Project" | "Independent Project" | "Founder Portfolio";

export type Project = {
  slug: string;
  name: string;
  category: ProjectCategory;
  year: string;
  description: string;
  services: string[];
  tech: string[];
  /** live site; leave undefined until the project is public */
  liveUrl?: string;
  /**
   * DEMO placeholder content. Replace every `demo: true` project with a real
   * one (and real screenshots) before launch. Demo cards show a "Demo" badge.
   */
  demo?: boolean;
  /** colours + copy for the generated preview mock (until real screenshots exist) */
  mock: {
    brand: string;
    headline: string;
    bg: string;
    surface: string;
    accent: string;
    accent2: string;
    ink: string;
    layout: "split" | "center" | "dashboard";
  };
};

export const PROJECTS: Project[] = [
  {
    slug: "saffron-table",
    name: "Saffron Table",
    category: "Client Project",
    year: "2026",
    description: "Restaurant website with a digital menu, table reservations and a Google Business Profile setup.",
    services: ["Website Development", "Branding", "Local SEO"],
    tech: ["Next.js", "Tailwind CSS"],
    demo: true,
    mock: { brand: "Saffron", headline: "Taste the tradition.", bg: "#1a0f08", surface: "#2a1a0e", accent: "#f59e0b", accent2: "#ea580c", ink: "#fff7ed", layout: "split" },
  },
  {
    slug: "carepoint-clinic",
    name: "CarePoint Clinic",
    category: "Client Project",
    year: "2026",
    description: "Clinic website with online appointment booking, doctor profiles and local search visibility.",
    services: ["Website Development", "Digital Marketing & SEO"],
    tech: ["Next.js", "Supabase"],
    demo: true,
    mock: { brand: "CarePoint", headline: "Care that comes first.", bg: "#f2f8fb", surface: "#ffffff", accent: "#0ea5e9", accent2: "#14b8a6", ink: "#0b2530", layout: "center" },
  },
  {
    slug: "urbanthreads",
    name: "UrbanThreads",
    category: "Client Project",
    year: "2026",
    description: "E-commerce store for a streetwear label, with product filters, cart and secure checkout.",
    services: ["E-commerce", "Branding & Creative Design", "Social Media"],
    tech: ["Next.js", "Stripe"],
    demo: true,
    mock: { brand: "URBN", headline: "Wear the city.", bg: "#0f0f10", surface: "#1c1c1f", accent: "#e5e7eb", accent2: "#a3e635", ink: "#fafafa", layout: "split" },
  },
  {
    slug: "ledgerflow",
    name: "LedgerFlow",
    category: "Independent Project",
    year: "2026",
    description: "Automation dashboard that turns daily Excel sheets into live sales and stock reports.",
    services: ["Business Automation", "Custom Tools"],
    tech: ["React", "Node.js", "Excel Automation"],
    demo: true,
    mock: { brand: "LedgerFlow", headline: "Your numbers, automated.", bg: "#0b1020", surface: "#131a30", accent: "#6366f1", accent2: "#22d3ee", ink: "#e0e7ff", layout: "dashboard" },
  },
  {
    slug: "nestora",
    name: "Nestora Realty",
    category: "Independent Project",
    year: "2026",
    description: "Real-estate listing concept with map search, property galleries and enquiry forms.",
    services: ["Website Development", "UI Design"],
    tech: ["Next.js", "Mapbox"],
    demo: true,
    mock: { brand: "Nestora", headline: "Find a place to belong.", bg: "#f7f3ee", surface: "#ffffff", accent: "#1f4d3a", accent2: "#c08457", ink: "#1d1a16", layout: "center" },
  },
  {
    slug: "founder-portfolio",
    name: "Developer Portfolio",
    category: "Founder Portfolio",
    year: "2026",
    description: "The founder's personal frontend portfolio: interactive 3D, motion design and case studies.",
    services: ["Frontend Development", "Motion Design"],
    tech: ["Next.js", "Three.js", "GSAP"],
    demo: true,
    mock: { brand: "dev/folio", headline: "Building for the web.", bg: "#08080d", surface: "#17131f", accent: "#c34dff", accent2: "#8b35f5", ink: "#ffffff", layout: "split" },
  },
];

export const PROJECT_FILTERS = ["All", "Client Project", "Independent Project", "Founder Portfolio"] as const;
