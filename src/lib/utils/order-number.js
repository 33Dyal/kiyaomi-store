import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("0123456789", 6);

export function generateOrderNumber() {
  const date = new Date();
  const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, "");
  return `KYM-${yyyymmdd}-${nanoid()}`;
}
