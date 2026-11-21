export type Service = {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  /** cube positions (in cube units) for the 3D pixel icon */
  icon: [number, number, number][];
};

export const SERVICES: Service[] = [
  {
    slug: "website-development",
    title: "Website Development",
    summary: "Modern websites, landing pages, business websites and e-commerce solutions.",
    tags: ["Business Websites", "Landing Pages", "E-commerce", "Web Apps"],
    // a screen on a stand
    icon: [
      [-1, -0.5, 0], [0, -0.5, 0], [1, -0.5, 0],
      [-1, 0.5, 0], [0, 0.5, 0], [1, 0.5, 0],
      [0, 1.6, 0],
    ],
  },
  {
    slug: "branding-creative-design",
    title: "Branding & Creative Design",
    summary: "Logo design, brand identity, social media graphics and visual communication.",
    tags: ["Logo Design", "Brand Identity", "Social Graphics", "Visual Communication"],
    // a 2×2×2 block with one pixel lifted out
    icon: [
      [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5],
      [-0.5, -0.5, 0.5], [-0.5, 0.5, 0.5], [0.5, 0.5, 0.5],
      [1.3, -1.3, 1.3],
    ],
  },
  {
    slug: "social-media-management",
    title: "Social Media Management",
    summary: "Content planning, creative posts, social media management and brand communication.",
    tags: ["Content Planning", "Creative Posts", "Reels", "Brand Communication"],
    // a plus / "add post"
    icon: [
      [0, 0, 0], [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0],
      [0, 0, 1],
    ],
  },
  {
    slug: "digital-marketing-seo",
    title: "Digital Marketing & SEO",
    summary: "Search engine optimization, local visibility, Google Business Profile and advertising management.",
    tags: ["SEO", "Local SEO", "Google Business Profile", "Ads Management"],
    // growth stairs
    icon: [
      [-1, 1, 0],
      [0, 1, 0], [0, 0, 0],
      [1, 1, 0], [1, 0, 0], [1, -1, 0],
    ],
  },
  {
    slug: "business-automation",
    title: "Business Automation",
    summary: "Workflow automation, Excel automation, API integrations and custom business tools.",
    tags: ["Workflow Automation", "Excel Automation", "API Integrations", "Custom Tools"],
    // a loop
    icon: [
      [-1, -1, 0], [0, -1, 0], [1, -1, 0], [1, 0, 0],
      [1, 1, 0], [0, 1, 0], [-1, 1, 0], [-1, 0, 0],
    ],
  },
];
