import { env } from "@/lib/env";

const BASE_URL = env.MPESA_ENV === "production"
  ? "https://api.safaricom.co.ke"
  : "https://sandbox.safaricom.co.ke";

let cachedToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

  const credentials = Buffer.from(`${env.MPESA_CONSUMER_KEY}:${env.MPESA_CONSUMER_SECRET}`).toString("base64");
  const res = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${credentials}` },
  });
  if (!res.ok) throw new Error("Failed to authenticate with M-Pesa");
  const json = await res.json();

  cachedToken = json.access_token;
  tokenExpiresAt = Date.now() + (Number(json.expires_in) - 60) * 1000; // refresh 1 min early
  return cachedToken;
}

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function password(ts) {
  return Buffer.from(`${env.MPESA_SHORTCODE}${env.MPESA_PASSKEY}${ts}`).toString("base64");
}

// Normalizes 07XXXXXXXX / +2547XXXXXXXX / 2547XXXXXXXX into 2547XXXXXXXX,
// which is the only format Daraja's STK Push endpoint accepts.
export function normalizePhone(phone) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.startsWith("7") || digits.startsWith("1")) return `254${digits}`;
  throw new Error("Invalid Kenyan phone number");
}

export async function initiateStkPush({ phone, amountCents, accountReference, transactionDesc }) {
  const token = await getAccessToken();
  const ts = timestamp();
  const normalizedPhone = normalizePhone(phone);

  const res = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      BusinessShortCode: env.MPESA_SHORTCODE,
      Password: password(ts),
      Timestamp: ts,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amountCents / 100), // M-Pesa takes whole shillings, not cents
      PartyA: normalizedPhone,
      PartyB: env.MPESA_SHORTCODE,
      PhoneNumber: normalizedPhone,
      CallBackURL: env.MPESA_CALLBACK_URL,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc,
    }),
  });

  const json = await res.json();
  if (!res.ok || json.ResponseCode !== "0") {
    throw new Error(json.errorMessage || json.ResponseDescription || "Failed to initiate M-Pesa payment");
  }

  return {
    merchantRequestId: json.MerchantRequestID,
    checkoutRequestId: json.CheckoutRequestID,
  };
}

export async function queryStkStatus(checkoutRequestId) {
  const token = await getAccessToken();
  const ts = timestamp();

  const res = await fetch(`${BASE_URL}/mpesa/stkpushquery/v1/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      BusinessShortCode: env.MPESA_SHORTCODE,
      Password: password(ts),
      Timestamp: ts,
      CheckoutRequestID: checkoutRequestId,
    }),
  });

  return res.json();
}