import { sendEmail } from "@/lib/resend/client";
import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/env";

/**
 * Single abstraction over every outbound customer notification.
 * Email always fires (degrades to console log if Resend isn't configured).
 * SMS/WhatsApp via Twilio are optional and no-op cleanly when unconfigured —
 * per spec section 20, the app must work normally without them.
 */
const twilioConfigured = Boolean(
  env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_PHONE_NUMBER
);

export async function notifyCustomer({ userId, title, body, email, subject, html }) {
  // Each channel is isolated: a failure in one must never stop the others.
  try {
    await prisma.notification.create({
      data: { userId, title, body, channel: "IN_APP" },
    });
  } catch (err) {
    console.error("[notify] in-app notification failed:", err);
  }

  if (email && subject && html) {
    await sendEmail({ to: email, subject, html });
  }

  if (twilioConfigured) {
    // Structure only — real Twilio call omitted; wire up here once
    // TWILIO_* env vars are set. Never blocks the main flow if it fails.
    // await twilioClient.messages.create({ to: phone, from: env.TWILIO_PHONE_NUMBER, body });
  }
}

export async function notifyAdmins({ title, body }) {
  await prisma.notification.create({
    data: { title, body, channel: "IN_APP", isAdmin: true },
  });
}