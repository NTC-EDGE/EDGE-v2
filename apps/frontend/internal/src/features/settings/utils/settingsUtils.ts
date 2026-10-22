export type TabType = "profile" | "security" | "appearance" | "support";

export interface PasswordChecklist {
  hasMinLength: boolean;
  hasUpperAndLower: boolean;
  hasNumber: boolean;
  strengthText: "None" | "Weak" | "Medium" | "Strong";
  strengthColor: string;
}

export interface ThemeColorsMinimal {
  semantic: {
    error: string;
    warning: string;
    success: string;
  };
  textMuted: string;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return "An unexpected error occurred.";
}

export function isObjectWithCreatePassword(obj: unknown): obj is {
  createPassword: (params: {
    newPassword: string;
    signOutOfOtherSessions?: boolean;
  }) => Promise<unknown>;
} {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof Reflect.get(obj, "createPassword") === "function"
  );
}

export function calculatePasswordStrength(
  password: string,
  colors: ThemeColorsMinimal
): PasswordChecklist {
  const hasMinLength = password.length >= 8;
  const hasUpperAndLower = /[A-Z]/.test(password) && /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  let strengthText: "None" | "Weak" | "Medium" | "Strong" = "Weak";
  let strengthColor: string = colors.semantic.error;
  const count =
    (hasMinLength ? 1 : 0) +
    (hasUpperAndLower ? 1 : 0) +
    (hasNumber ? 1 : 0);

  if (password.length === 0) {
    strengthText = "None";
    strengthColor = colors.textMuted;
  } else if (count === 2) {
    strengthText = "Medium";
    strengthColor = colors.semantic.warning;
  } else if (count === 3) {
    strengthText = "Strong";
    strengthColor = colors.semantic.success;
  }

  return {
    hasMinLength,
    hasUpperAndLower,
    hasNumber,
    strengthText,
    strengthColor,
  };
}

export function validatePasswordChange(params: {
  hasPassword: boolean;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): string | null {
  const { hasPassword, currentPassword, newPassword, confirmPassword } = params;

  if (newPassword.length === 0) {
    return null;
  }

  if (hasPassword && currentPassword.trim().length === 0) {
    return "Please enter your current password.";
  }

  if (newPassword.length < 8) {
    return "New password must be at least 8 characters.";
  }

  if (newPassword !== confirmPassword) {
    return "New password and confirmation do not match.";
  }

  if (hasPassword && currentPassword === newPassword) {
    return "New password must be different from your current password.";
  }

  return null;
}
