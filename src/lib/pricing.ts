/**
 * Pricing shown on the home page. Prices come from the project brief;
 * deliverables are a starting point. Edit freely: the UI updates from this file.
 */
export type Plan = {
  id: string;
  name: string;
  price: number;
  /** "onwards" for one-time projects, "/month" for retainers */
  unit: "onwards" | "/month";
  bestFor: string;
  features: string[];
  recommended?: boolean;
};

export type AddOn = { id: string; name: string; desc: string; price: number; unit: "onwards" | "/month onwards" };

export const WEBSITE_PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 4999,
    unit: "onwards",
    bestFor: "A simple, professional online presence.",
    features: ["1-page website or landing page", "Mobile responsive design", "Contact form & WhatsApp button", "Basic SEO setup", "1 revision round"],
  },
  {
    id: "business",
    name: "Business",
    price: 8999,
    unit: "onwards",
    bestFor: "Small businesses that need a complete website.",
    features: ["Up to 5 pages", "Mobile responsive design", "Contact form, WhatsApp & Google Maps", "On-page SEO basics", "Google Analytics setup", "2 revision rounds"],
    recommended: true,
  },
  {
    id: "professional",
    name: "Professional",
    price: 14999,
    unit: "onwards",
    bestFor: "Brands that want a custom, premium experience.",
    features: ["Up to 10 pages", "Custom design with animations", "Blog / CMS", "Speed optimisation", "On-page SEO", "3 revision rounds"],
  },
  {
    id: "ecommerce",
    name: "E-commerce",
    price: 19999,
    unit: "onwards",
    bestFor: "Selling products online.",
    features: ["Online store setup", "Product catalogue & categories", "Cart & checkout", "Payment gateway integration", "Order notifications", "Admin panel"],
  },
];

export const SOCIAL_PLANS: Plan[] = [
  {
    id: "social-basic",
    name: "Basic",
    price: 3999,
    unit: "/month",
    bestFor: "Staying active on one platform.",
    features: ["1 platform", "8 creative posts / month", "Captions & hashtags", "Content scheduling", "Monthly report"],
  },
  {
    id: "social-growth",
    name: "Growth",
    price: 7999,
    unit: "/month",
    bestFor: "Growing reach across two platforms.",
    features: ["2 platforms", "12 posts + 4 reels / month", "Content calendar", "Community management basics", "Monthly report"],
    recommended: true,
  },
  {
    id: "social-premium",
    name: "Premium",
    price: 12999,
    unit: "/month",
    bestFor: "A full social presence, managed for you.",
    features: ["3 platforms", "20 posts + 8 reels / month", "Stories", "Monthly strategy call", "Detailed analytics report"],
  },
];

export const ADD_ONS: AddOn[] = [
  { id: "logo", name: "Logo Design", desc: "A clean, memorable logo with source files.", price: 999, unit: "onwards" },
  { id: "brand", name: "Brand Identity", desc: "Logo, colours, typography and brand guidelines.", price: 2499, unit: "onwards" },
  { id: "creatives", name: "10 Social Media Creatives", desc: "On-brand post designs, ready to publish.", price: 1499, unit: "onwards" },
  { id: "gbp", name: "Google Business Profile", desc: "Setup and optimisation for local search.", price: 999, unit: "onwards" },
  { id: "local-seo", name: "Local SEO", desc: "Ongoing local ranking and visibility work.", price: 2999, unit: "/month onwards" },
];

export const PRICING_NOTES = [
  "Third-party expenses, advertising budget, hosting and domain are additional unless included in the approved quotation.",
  "Final pricing depends on scope; you will get a clear written quotation before any work begins.",
];
