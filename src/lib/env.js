import { z } from "zod";

/**
 * Centralized, validated environment configuration.
 * The app fails fast and loudly at boot if a required variable is missing,
 * rather than surfacing confusing runtime errors deep in a request handler.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),

  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("30d"),

  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  // add inside envSchema, near the Stripe block:
MPESA_ENV: z.enum(["sandbox", "production"]).default("sandbox"),
MPESA_CONSUMER_KEY: z.string().min(1),
MPESA_CONSUMER_SECRET: z.string().min(1),
MPESA_SHORTCODE: z.string().min(1),
MPESA_PASSKEY: z.string().min(1),
MPESA_CALLBACK_URL: z.string().url(),

  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),

  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),

  GOOGLE_MAPS_API_KEY: z.string().min(1).optional(),

  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
});

// In dev/test, allow missing optional third-party keys so the app still
// boots — those integrations degrade gracefully (see lib/cloudinary,
// lib/resend, lib/notifications). Required keys (DB, JWT, Stripe) always
// throw immediately if absent, since the app cannot function without them.
function loadEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const missing = Object.entries(flat)
      .map(([key, errs]) => `  - ${key}: ${errs?.join(", ")}`)
      .join("\n");
    throw new Error(
      `Invalid/missing environment variables:\n${missing}\n\nCopy .env.example to .env and fill in real values.`
    );
  }
  return parsed.data;
}

export const env = loadEnv();
