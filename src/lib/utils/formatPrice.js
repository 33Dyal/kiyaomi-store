import { brand } from "@/config/brand";

/**
 * Format an integer amount of "minor units" (cents) into a display price
 * using the store's configured currency/locale. All monetary values are
 * stored as integers (minor units) in the database to avoid floating point
 * rounding bugs — see prisma/schema.prisma comments.
 */
export function formatPrice(minorUnits, { currency = brand.locale.currency, locale = brand.locale.language } = {}) {
  if (minorUnits === null || minorUnits === undefined) return "";
  const amount = minorUnits / 100;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback for currencies/locales Intl can't format in this runtime.
    return `${brand.locale.currencySymbol} ${amount.toFixed(2)}`;
  }
}

/** Convert a decimal amount (e.g. from a form input "1200.50") to minor units. */
export function toMinorUnits(decimalAmount) {
  return Math.round(Number(decimalAmount) * 100);
}
