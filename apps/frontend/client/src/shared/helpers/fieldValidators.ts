/**
 * Field Validation Helpers for EDGE Frontend
 */

/**
 * Validates Philippine contact numbers:
 * Must start with:
 * - '09' followed by exactly 9 digits (11 digits total, e.g. 09171234567)
 * - '+639' followed by exactly 9 digits (13 characters total, e.g. +639171234567)
 * - '639' followed by exactly 9 digits (12 digits total, e.g. 639171234567)
 */
export function validateContactNumber(value: string | undefined | null): string | null {
  if (!value || value.trim() === "") {
    return "Contact number is required.";
  }
  const clean = value.trim().replace(/[\s\-\(\)\.]/g, "");
  const contactRegex = /^(09\d{9}|\+639\d{9}|639\d{9})$/;
  if (!contactRegex.test(clean)) {
    if (!clean.startsWith("09") && !clean.startsWith("+639") && !clean.startsWith("639")) {
      return "Contact number must start with 09 (e.g. 09XXXXXXXXX) or +639 (e.g. +639XXXXXXXXX).";
    }
    if (clean.startsWith("09") && clean.length !== 11) {
      return `Contact number starting with 09 must be exactly 11 digits (currently ${clean.length} digits).`;
    }
    if (clean.startsWith("+639") && clean.length !== 13) {
      return `Contact number starting with +639 must be exactly 13 characters (currently ${clean.length} characters).`;
    }
    if (clean.startsWith("639") && clean.length !== 12) {
      return `Contact number starting with 639 must be exactly 12 digits (currently ${clean.length} digits).`;
    }
    return "Please enter a valid Philippine mobile number (e.g., 09171234567 or +639171234567).";
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
