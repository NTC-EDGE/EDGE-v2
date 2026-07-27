/**
 * Uniform Error Message Parser for NTC-EDGE Application Ecosystem.
 * Parses errors from both C# .NET 10 Backend API (ApiResponse / ProblemDetails / ValidationProblem)
 * and Clerk Identity API uniformly into clear, user-friendly error strings.
 */
export const parseApiError = (
  err: unknown,
  defaultFallback = "An unexpected error occurred. Please try again."
): string => {
  if (err === null || err === undefined) {
    return defaultFallback;
  }

  // Handle error objects
  if (typeof err === "object" && err !== null) {
    const record = err as Record<string, unknown>;

    // 1. Handle HTTP / Axios responses from C# .NET 10 Backend API
    if ("response" in record && record.response !== null && typeof record.response === "object") {
      const response = record.response as Record<string, unknown>;
      const status = typeof response.status === "number" ? response.status : undefined;
      const data = response.data as Record<string, unknown> | undefined;

      if (data !== undefined && data !== null) {
        // C# ApiResponse<T> format: { succeeded: false, message: "...", errors: { ... } }
        if ("message" in data && typeof data.message === "string" && data.message.trim().length > 0) {
          return data.message.trim();
        }

        // C# ProblemDetails format: { detail: "...", title: "..." }
        if ("detail" in data && typeof data.detail === "string" && data.detail.trim().length > 0) {
          return data.detail.trim();
        }
        if ("title" in data && typeof data.title === "string" && data.title.trim().length > 0) {
          return data.title.trim();
        }

        // FluentValidation dictionary format: { errors: { SelectedRegion: ["Region is required"] } }
        if ("errors" in data && data.errors !== null && typeof data.errors === "object") {
          const errorsDict = data.errors as Record<string, string[]>;
          const firstKey = Object.keys(errorsDict)[0];
          if (firstKey !== undefined && Array.isArray(errorsDict[firstKey]) && errorsDict[firstKey].length > 0) {
            return errorsDict[firstKey][0];
          }
        }
      }

      if (status === 403) {
        return "Access Denied: You do not have permission or active membership in the selected region.";
      }
      if (status === 401) {
        return "Session Expired: Please log in again to continue.";
      }
      if (status === 404) {
        return "Resource Not Found: The requested record does not exist.";
      }
      if (status === 429) {
        return "Too many requests. Please wait a moment before trying again.";
      }
    }

    // 2. Direct object with errors array (Clerk API Response Error format)
    if ("errors" in record && Array.isArray(record.errors) && record.errors.length > 0) {
      const firstErr = record.errors[0] as Record<string, unknown>;
      const code = typeof firstErr.code === "string" ? firstErr.code : "";
      const message = typeof firstErr.message === "string" ? firstErr.message : "";

      if (code === "too_many_requests" || code.includes("rate_limit")) {
        return message.trim().length > 0
          ? message.trim()
          : "Too many requests. Please try again in a bit.";
      }
      if (code === "form_identifier_not_found" || code === "form_password_incorrect") {
        return "Authentication Failed: Invalid credentials, wrong password, or wrong region selected.";
      }
      if (message.trim().length > 0) {
        return message.trim();
      }
    }

    // 3. Direct object with error payload
    if ("error" in record && record.error !== null && typeof record.error === "object") {
      const clerkErr = record.error as Record<string, unknown>;
      const code = typeof clerkErr.code === "string" ? clerkErr.code : "";
      const message = typeof clerkErr.message === "string" ? clerkErr.message : "";

      if (code === "too_many_requests" || code.includes("rate_limit")) {
        return message.trim().length > 0
          ? message.trim()
          : "Too many requests. Please try again in a bit.";
      }
      if (code === "form_identifier_not_found" || code === "form_password_incorrect") {
        return "Authentication Failed: Invalid credentials, wrong password, or wrong region selected.";
      }
      if (message.trim().length > 0) {
        return message.trim();
      }
    }

    if ("message" in record && typeof record.message === "string" && record.message.trim().length > 0) {
      return record.message.trim();
    }
  }

  if (err instanceof Error && err.message.trim().length > 0) {
    return err.message.trim();
  }

  return defaultFallback;
};
