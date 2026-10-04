import { NextResponse } from "next/server";

/** { success: true, data } */
export function ok(data, init) {
  return NextResponse.json({ success: true, data }, init);
}

/** { success: false, error: { code, message, details? } } */
export function fail(code, message, { status = 400, details } = {}) {
  return NextResponse.json(
    { success: false, error: { code, message, ...(details ? { details } : {}) } },
    { status }
  );
}

export const ApiErrors = {
  validation: (details) => fail("VALIDATION_ERROR", "Invalid request.", { status: 422, details }),
  unauthorized: () => fail("UNAUTHORIZED", "Authentication required.", { status: 401 }),
  forbidden: () => fail("FORBIDDEN", "You do not have permission to do that.", { status: 403 }),
  notFound: (what = "Resource") => fail("NOT_FOUND", `${what} not found.`, { status: 404 }),
  conflict: (message = "Conflict.") => fail("CONFLICT", message, { status: 409 }),
  rateLimited: () => fail("RATE_LIMITED", "Too many requests. Please try again shortly.", { status: 429 }),
  server: (message = "Something went wrong. Please try again.") =>
    fail("SERVER_ERROR", message, { status: 500 }),
};

/**
 * Wrap a route handler so unexpected throws become a clean 500 instead of
 * leaking stack traces / crashing the process. Zod errors are converted to
 * 422s automatically.
 */
export function withApiHandler(handler) {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (err) {
      if (err?.name === "ZodError") {
        return ApiErrors.validation(err.issues);
      }
      if (err?.status && err?.code) {
        return fail(err.code, err.message, { status: err.status });
      }
      console.error("[API_ERROR]", err);
      return ApiErrors.server();
    }
  };
}
