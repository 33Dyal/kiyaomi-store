import { Resend } from "resend";
import { env } from "@/lib/env";

const configured = Boolean(env.RESEND_API_KEY && env.RESEND_FROM_EMAIL);
export const resendConfigured = configured;

const resend = configured ? new Resend(env.RESEND_API_KEY) : null;

/**
 * Sends a transactional email. Never throws, so auth/order flows keep working,
 * but every failure is logged to the server terminal so it can be diagnosed.
 * Resend's SDK returns { data, error } instead of throwing, so we check `error`.
 */
export async function sendEmail({ to, subject, html }) {
  if (!configured) {
    const missing = [
      !env.RESEND_API_KEY && "RESEND_API_KEY",
      !env.RESEND_FROM_EMAIL && "RESEND_FROM_EMAIL",
    ].filter(Boolean);
    console.warn(
      `[email:not-configured] Missing ${missing.join(", ")}. Would send "${subject}" to ${to}`
    );
    return { skipped: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `Kiyomi <${env.RESEND_FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    if (error) {
      console.error(`[email:failed] "${subject}" to ${to}:`, error);
      return { error };
    }
    console.log(`[email:sent] "${subject}" to ${to} (id: ${data?.id})`);
    return { data };
  } catch (err) {
    console.error(`[email:exception] "${subject}" to ${to}:`, err);
    return { error: err };
  }
}