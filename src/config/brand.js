/**
 * BRAND CONFIGURATION
 * ---------------------------------------------------------------------------
 * Single source of truth for everything brand-specific: name, logo, colors,
 * typography, social links, default categories, currency, and copy.
 *
 * Change values here to re-skin the entire storefront without touching any
 * component code. Colors are also mirrored into Tailwind (see
 * tailwind.config.js, which reads from `colors` below) and into CSS custom
 * properties (see src/app/globals.css).
 *
 * NOTE ON SOURCE: We were unable to verify or access an Instagram account
 * matching the handle provided (@kyomi___store) at build time — public
 * search did not return a matching, verifiable account. Per the project
 * brief's own fallback instruction, this file ships with a tasteful,
 * original "premium boutique" design system rather than invented brand
 * facts. Swap in real photography, copy, and colors here once you have
 * them; nothing else in the codebase needs to change.
 * ---------------------------------------------------------------------------
 */

export const brand = {
  name: "Kiyomi Online Store",
  shortName: "Kiyomi",
  tagline: "Elevated everyday fashion",
  description:
    "Kiyomi Online Store is a boutique fashion destination offering curated, elevated everyday pieces — designed for the modern, self-assured woman.",

  // Social — update once real handles/links are confirmed.
  social: {
    instagramHandle: "kyomi___store",
    instagramUrl: "https://instagram.com/kyomi___store",
    tiktokUrl: "",
    facebookUrl: "",
    whatsappNumber: "", // e.g. "+254700000000"
  },

  contact: {
    email: "hello@kiyomionlinestore.com",
    phone: "",
    supportHours: "Mon–Sat, 9am–6pm EAT",
  },

  // Locale / currency — configurable, not hardcoded through the app.
  locale: {
    currency: "KES",
    currencySymbol: "KSh",
    country: "KE",
    language: "en-KE",
  },

  // Default catalog categories — seed data only. Admins can add/edit/remove
  // categories at runtime; this list just seeds a sensible starting point.
  defaultCategories: [
    { name: "New Arrivals", slug: "new-arrivals" },
    { name: "Dresses", slug: "dresses" },
    { name: "Tops", slug: "tops" },
    { name: "Bottoms", slug: "bottoms" },
    { name: "Sets", slug: "sets" },
    { name: "Shoes", slug: "shoes" },
    { name: "Bags", slug: "bags" },
    { name: "Accessories", slug: "accessories" },
    { name: "Sale", slug: "sale" },
  ],

  // Design tokens — premium/editorial, not "generic SaaS."
  colors: {
    // Warm neutral base + a single confident accent, editorial fashion feel.
    ink: "#1B1815", // near-black, warm — primary text
    paper: "#FAF7F2", // warm off-white — primary background
    sand: "#EFE7DA", // secondary surface / section background
    stone: "#B9AFA2", // muted borders / dividers
    accent: "#7A2E2E", // deep terracotta/oxblood — CTAs, sale badges
    accentSoft: "#C98F6B", // warm clay — hover states, secondary accent
    gold: "#B08D57", // subtle metallic detail — badges, dividers
    success: "#3F6B4A",
    error: "#A3342A",
    warning: "#B08D57",
  },

  typography: {
    display: "var(--font-display)", // serif, editorial headlines
    body: "var(--font-body)", // clean sans, body copy
  },

  heroCtas: {
    primary: { label: "Shop New Arrivals", href: "/shop?sort=newest" },
    secondary: { label: "Explore Collections", href: "/categories" },
  },
};

export default brand;
