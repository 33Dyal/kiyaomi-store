import { getCurrentUser } from "@/lib/auth/session";
import { ok, apiError } from "@/lib/utils/api-response";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return apiError("UNAUTHORIZED", "Not signed in", 401);
  return ok({
    user: {
      id: user.id, firstName: user.firstName, lastName: user.lastName,
      email: user.email, phone: user.phone, role: user.role, emailVerified: user.emailVerified,
    },
  });
}
