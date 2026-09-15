import { GeneralApplicantData } from "../hooks/useGeneralServiceWizard";

/**
 * Capitalizes names properly (Title Case / Capitalize first letters of name words).
 * E.g., "shonix" -> "Shonix", "juan dela cruz" -> "Juan Dela Cruz", "mary-jane" -> "Mary-Jane".
 */
export function formatProperName(name?: string | null): string {
  if (!name || typeof name !== "string") return "";
  const trimmed = name.trim();
  if (!trimmed) return "";

  return trimmed
    .split(/\s+/)
    .map((word) => {
      if (!word) return "";
      if (word.includes("-")) {
        return word
          .split("-")
          .map((part) => {
            if (!part) return "";
            if (part === part.toLowerCase()) {
              return part.charAt(0).toUpperCase() + part.slice(1);
            }
            return part;
          })
          .join("-");
      }
      if (word === word.toLowerCase()) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(" ");
}

/**
 * Returns the human-readable display name of an applicant,
 * prioritizing first/last name, formFieldValues name fields, or falling back to "Applicant".
 */
export function getApplicantDisplayName(app?: GeneralApplicantData | null, fallbackIdx?: number): string {
  if (!app) {
    return fallbackIdx !== undefined ? `Applicant #${fallbackIdx}` : "Applicant";
  }

  const explicitName = [app.firstName, app.middleName, app.lastName, app.suffix].filter(Boolean).join(" ").trim();
  if (explicitName.length > 0) {
    return formatProperName(explicitName);
  }

  if (app.formFieldValues && Array.isArray(app.formFieldValues) && app.formFieldValues.length > 0) {
    const fn = app.formFieldValues.find((f) => {
      const l = (f.fieldLabel || "").toLowerCase();
      return l.includes("first name") || l === "fname";
    })?.value?.trim();

    const ln = app.formFieldValues.find((f) => {
      const l = (f.fieldLabel || "").toLowerCase();
      return l.includes("last name") || l.includes("surname") || l === "lname";
    })?.value?.trim();

    const combined = [fn, ln].filter(Boolean).join(" ").trim();
    if (combined.length > 0) {
      return formatProperName(combined);
    }

    const fullName = app.formFieldValues.find((f) => {
      const l = (f.fieldLabel || "").toLowerCase();
      return (
        l.includes("full name") ||
        l.includes("applicant name") ||
        l === "name" ||
        l.includes("company name") ||
        l.includes("corporate name")
      );
    })?.value?.trim();

    if (fullName && fullName.length > 0) {
      return formatProperName(fullName);
    }
  }

  if (app.companyName && app.companyName.trim().length > 0) {
    return formatProperName(app.companyName.trim());
  }

  if (app.representativeName && app.representativeName.trim().length > 0) {
    return formatProperName(app.representativeName.trim());
  }

  if (app.deviceRegData?.businessName && app.deviceRegData.businessName.trim().length > 0) {
    return formatProperName(app.deviceRegData.businessName.trim());
  }

  if (app.tvroRegData?.applicantName && app.tvroRegData.applicantName.trim().length > 0) {
    return formatProperName(app.tvroRegData.applicantName.trim());
  }

  return "Applicant";
}
