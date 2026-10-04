/**
 * Consistent API response shape across every route handler (spec section 38).
 */
export function ok(data, init = {}) {
  return Response.json({ success: true, data }, { status: 200, ...init });
}

export function created(data) {
  return Response.json({ success: true, data }, { status: 201 });
}

export function apiError(code, message, status = 400) {
  return Response.json(
    { success: false, error: { code, message } },
    { status }
  );
}

/**
 * Wraps a route handler so thrown errors (including the 401/403 errors
 * thrown by requireUser/requireRole) become consistent JSON responses
 * instead of unhandled 500s.
 */
export function withErrorHandling(handler) {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (err) {
      const status = err.status || 500;
      const code =
        status === 401 ? "UNAUTHORIZED" : status === 403 ? "FORBIDDEN" : status === 404 ? "NOT_FOUND" : "SERVER_ERROR";
      if (status === 500) console.error(err);
      return apiError(code, err.message || "Something went wrong", status);
    }
  };
}
