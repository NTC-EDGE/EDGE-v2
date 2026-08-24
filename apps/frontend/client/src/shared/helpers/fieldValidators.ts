/**
 * Field Validation Helpers for EDGE Frontend
 */

/**
 * Validates Philippine contact numbers:
 * Must start with:
 * - '0' followed by exactly 10 digits (11 digits total, e.g. 09171234567)
 * - '+63' followed by exactly 10 digits (13 characters total, e.g. +639171234567)
 * - '63' followed by exactly 10 digits (12 digits total, e.g. 639171234567)
 */
export function validateContactNumber(value: string | undefined | null): string | null {
  if (!value || value.trim() === "") {
    return "Contact number is required.";
  }
  const clean = value.trim().replace(/[\s\-\(\)\.]/g, "");
  const contactRegex = /^(0\d{10}|\+63\d{10}|63\d{10})$/;
  if (!contactRegex.test(clean)) {
    if (!clean.startsWith("0") && !clean.startsWith("+63") && !clean.startsWith("63")) {
      return "Contact number must start with 0 or +63.";
    }
    return "Contact number must be exactly 10 digits after 0 or +63 (e.g., 09171234567 or +639171234567).";
  }
  return null;
}

export function isValidContactNumber(value: string | undefined | null): boolean {
  return validateContactNumber(value) === null;
}

/**
 * Validates standard email address format:
 * user@domain.tld
 */
export function validateEmailAddress(value: string | undefined | null): string | null {
  if (!value || value.trim() === "") {
    return "Email address is required.";
  }
  const clean = value.trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(clean)) {
    return "Please enter a valid email address (e.g. name@example.com).";
  }
  return null;
}

export function isValidEmailAddress(value: string | undefined | null): boolean {
  return validateEmailAddress(value) === null;
}
