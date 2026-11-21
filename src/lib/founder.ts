/**
 * Founder details for the "Meet the Founder" section.
 * PLACEHOLDER: replace name, photo, skills and links with real details,
 * then set `placeholder: false` (removes the "Placeholder" badge).
 */
export const FOUNDER = {
  placeholder: true,
  name: "Founder Name",
  role: "Founder & Frontend Developer",
  /** put the real photo in /public/brand/ (portrait, ~4:5) and point to it here */
  photo: "/brand/founder-placeholder.svg",
  intro:
    "Passive Pixel is founded by a frontend developer passionate about modern web technologies, creative design and building practical digital solutions.",
  skills: [
    { group: "Frontend", items: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Tailwind CSS"] },
    { group: "Creative & Motion", items: ["Three.js", "GSAP", "Framer Motion", "Figma"] },
    { group: "Backend & Tools", items: ["Node.js", "Supabase", "Git", "Vercel"] },
  ],
  /** the founder's separate personal developer portfolio (leave "" until it's live) */
  portfolioUrl: "",
  socials: [
    { label: "GitHub", url: "" },
    { label: "LinkedIn", url: "" },
  ],
};
