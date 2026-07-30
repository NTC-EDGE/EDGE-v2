/**
 * Uniform Error Message Parser for NTC-EDGE Application Ecosystem.
 * Modular, type-safe pipeline for parsing C# .NET 10 Backend API responses,
 * Clerk Identity API errors, and network connection failures.
 */

// Helper to safely read a property from an unknown object without type assertions
function getProperty(target: unknown, key: string): unknown {
  if (typeof target === "object" && target !== null) {
    return Reflect.get(target, key);
  }
  return undefined;
}

/**
 * 1. Network Connection Failure Parser
 */
function parseNetworkError(err: unknown): string | null {
  if (typeof err === "object" && err !== null) {
    const code = getProperty(err, "code");
    if (code === "ERR_NETWORK") {
      return "Unable to connect to the backend server. Please verify that your internet connection is active and the C# backend API is running.";
    }
    const message = getProperty(err, "message");
    if (typeof message === "string" && message.includes("Network Error")) {
      return "Unable to connect to the backend server. Please verify that your internet connection is active and the C# backend API is running.";
    }
  }
  if (err instanceof Error && err.message.includes("Network Error")) {
    return "Unable to connect to the backend server. Please verify that your internet connection is active and the C# backend API is running.";
  }
  return null;
}

/**
 * 2. Clerk Sign-In Attempt Status Parser (e.g. needs_client_trust, needs_second_factor)
 */
function parseClerkSignInStatus(errObj: object): string | null {
  const signInObj = getProperty(errObj, "sign_in") ?? getProperty(errObj, "response") ?? errObj;
  if (typeof signInObj !== "object" || signInObj === null) return null;

  const status = getProperty(signInObj, "status");
  const identifier = getProperty(signInObj, "identifier");

  if (typeof status !== "string") return null;

  const idSuffix = typeof identifier === "string" && identifier.length > 0 ? ` for ${identifier}` : "";

  if (status === "needs_client_trust") {
    return `Verification Required: Clerk requires device trust or email code verification${idSuffix}. Please check your email inbox for a verification link or code.`;
  }
  if (status === "needs_second_factor") {
    return `Two-Factor Verification Required: Please enter the 2FA code sent to your email/authenticator${idSuffix}.`;
  }
  if (status === "needs_first_factor") {
    return "Authentication Incomplete: Additional identification factor is required to finish signing in.";
  }
  return null;
}

/**
 * 3. C# .NET 10 Backend API Response Parser (ApiResponse<T>, ProblemDetails, ValidationProblem)
 */
function parseBackendApiResponse(errObj: object): string | null {
  const response = getProperty(errObj, "response");
  if (typeof response !== "object" || response === null) return null;

  const data = getProperty(response, "data");
  const status = getProperty(response, "status");

  if (typeof data === "object" && data !== null) {
    // C# ApiResponse<T> format: { succeeded: false, message: "..." }
    const message = getProperty(data, "message");
    if (typeof message === "string" && message.trim().length > 0) {
      return message.trim();
    }

    // C# ProblemDetails format: { detail: "...", title: "..." }
    const detail = getProperty(data, "detail");
    if (typeof detail === "string" && detail.trim().length > 0) {
      return detail.trim();
    }
    const title = getProperty(data, "title");
    if (typeof title === "string" && title.trim().length > 0) {
      return title.trim();
    }

    // FluentValidation dictionary format: { errors: { SelectedRegion: ["Region is required"] } }
    const errors = getProperty(data, "errors");
    if (typeof errors === "object" && errors !== null) {
      const keys = Object.keys(errors);
      if (keys.length > 0) {
        const firstArr = getProperty(errors, keys[0]);
        if (Array.isArray(firstArr) && firstArr.length > 0 && typeof firstArr[0] === "string") {
          return firstArr[0];
        }
      }
    }
  }

  // HTTP status code fallbacks
  if (typeof status === "number") {
    if (status === 403) return "Access Denied: You do not have permission or active membership in the selected region.";
    if (status === 401) return "Session Expired: Please log in again to continue.";
    if (status === 404) return "Resource Not Found: The requested record does not exist.";
    if (status === 429) return "Too many requests. Please wait a moment before trying again.";
  }

  return null;
}

/**
 * 4. Clerk API Error Code Parser (strategy_for_user_invalid, form_identifier_not_found, etc.)
 */
function parseClerkErrorPayload(errObj: object): string | null {
  const errors = getProperty(errObj, "errors");
  const singleError = getProperty(errObj, "error");
  const targetErr = Array.isArray(errors) && errors.length > 0 ? errors[0] : singleError;

  if (typeof targetErr !== "object" || targetErr === null) return null;

  const code = getProperty(targetErr, "code");
  const message = getProperty(targetErr, "message");
  const longMessage = getProperty(targetErr, "long_message");

  if (code === "strategy_for_user_invalid") {
    return "Password reset or password login is unavailable for this account because it was registered using Google Sign-In. Please sign in with Google.";
  }
  if (code === "too_many_requests" || (typeof code === "string" && code.includes("rate_limit"))) {
    return typeof message === "string" && message.trim().length > 0
      ? message.trim()
      : "Too many requests. Please try again in a bit.";
  }
  if (code === "form_identifier_not_found") {
    return typeof longMessage === "string" && longMessage.trim().length > 0
      ? longMessage.trim()
      : typeof message === "string" && message.trim().length > 0
      ? message.trim()
      : "Couldn't find your account. Please check your email or username.";
  }
  if (code === "form_password_incorrect") {
    return typeof longMessage === "string" && longMessage.trim().length > 0
      ? longMessage.trim()
      : typeof message === "string" && message.trim().length > 0
      ? message.trim()
      : "Incorrect password. Please try again.";
  }

  if (typeof longMessage === "string" && longMessage.trim().length > 0) {
    return longMessage.trim();
  }
  if (typeof message === "string" && message.trim().length > 0) {
    return message.trim();
  }

  return null;
}

/**
 * Main Uniform Error Message Parser Function
 */
export const parseApiError = (
  err: unknown,
  defaultFallback = "An unexpected error occurred. Please try again."
): string => {
  if (err === null || err === undefined) {
    return defaultFallback;
  }

  if (typeof err === "string" && err.trim().length > 0) {
    return err.trim();
  }

  // Step 1: Check for Network Connection Failure
  const networkError = parseNetworkError(err);
  if (networkError !== null) return networkError;

  if (typeof err === "object" && err !== null) {
    // Step 2: Check for Clerk Sign-In Attempt Status (needs_client_trust, 2FA, etc.)
    const signInStatusError = parseClerkSignInStatus(err);
    if (signInStatusError !== null) return signInStatusError;

    // Step 3: Check for C# Backend API HTTP Response (ApiResponse / ProblemDetails)
    const backendError = parseBackendApiResponse(err);
    if (backendError !== null) return backendError;

    // Step 4: Check for Clerk Error Payload (errors array or error object)
    const clerkError = parseClerkErrorPayload(err);
    if (clerkError !== null) return clerkError;

    // Step 5: Direct object message fallback
    const directMessage = getProperty(err, "message");
    if (typeof directMessage === "string" && directMessage.trim().length > 0) {
      if (directMessage.includes("needs_client_trust")) {
        return "Verification Required: Clerk requires device trust or email code verification. Please check your email inbox for a verification code.";
      }
      return directMessage.trim();
    }
  }

  // Step 6: Standard JS Error instance fallback
  if (err instanceof Error && err.message.trim().length > 0) {
    if (err.message.includes("needs_client_trust")) {
      return "Verification Required: Clerk requires device trust or email code verification. Please check your email inbox for a verification code.";
    }
    return err.message.trim();
  }

  return defaultFallback;
};
