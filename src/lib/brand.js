/**
 * Centralized brand configuration for Kiyomi Online Store.
 *
 * NOTE ON THE INSTAGRAM SOURCE MATERIAL:
 * This build environment has no ability to browse or authenticate against
 * Instagram, so the real @kyomi___store feed, exact product catalog, and
 * photography could not be inspected. Rather than invent fake posts/products
 * and present them as real Kiyomi content, every brand-facing value below is
 * a clearly-labeled, tasteful placeholder for a premium boutique — pull it
 * from the admin Settings panel (see src/app/admin/settings) or edit this
 * file once you have the real assets. Nothing here should be mistaken for
 * verified Kiyomi brand data.
 */

export const brand = {
  name: "Kiyomi Online Store",
  shortName: "Kiyomi",
  tagline: "Modern boutique essentials.",
  instagramHandle: "@kyomi___store",
  instagramUrl: "https://www.instagram.com/kyomi___store/",
  supportEmail: "hello@kiyomionline.com",
  supportPhone: "+254 700 000 000",
  whatsappNumber: "+254700000000",
  currency: "KES",
  locale: "en-KE",
  country: "Kenya",

  colors: {
    ink: "#1b1815",
    sand: "#f4efe9",
    sandDark: "#e7ded2",
    terracotta: "#b5613f",
    gold: "#a8813f",
    cream: "#faf7f2",
    muted: "#8a8178",
  },

  // Placeholder starter categories — replace with the real Kiyomi catalog
  // categories via the admin panel once available. Kept data-driven
  // (Category model) rather than hard-coded in components.
  seedCategories: [
    "New Arrivals",
    "Dresses",
    "Tops",
    "Bottoms",
    "Sets",
    "Shoes",
    "Bags",
    "Accessories",
    "Sale",
  ],

  socialLinks: {
    instagram: "https://www.instagram.com/kyomi___store/",
    tiktok: null,
    facebook: null,
  },
};

export function formatPrice(amountInMinorUnits, currency = brand.currency) {
  return new Intl.NumberFormat(brand.locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amountInMinorUnits / 100);
}
