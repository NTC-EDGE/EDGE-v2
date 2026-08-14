import { GeneralApplicantData } from "../hooks/useGeneralServiceWizard";

/**
 * Returns the human-readable display name of an applicant,
 * prioritizing first/last name, formFieldValues name fields, or falling back to "Applicant #X".
 */
export function getApplicantDisplayName(app?: GeneralApplicantData | null, fallbackIdx?: number): string {
  if (!app) {
    return fallbackIdx !== undefined ? `Applicant #${fallbackIdx}` : "Applicant";
  }

  const explicitName = [app.firstName, app.lastName].filter(Boolean).join(" ").trim();
  if (explicitName.length > 0) {
    return explicitName;
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
      return combined;
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
      return fullName;
    }
  }

  return fallbackIdx !== undefined ? `Applicant #${fallbackIdx}` : "Applicant";
}
