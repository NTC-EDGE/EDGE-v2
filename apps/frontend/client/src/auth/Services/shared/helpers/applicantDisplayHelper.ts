import { GeneralApplicantData } from "../hooks/useGeneralServiceWizard";

/**
 * Determines whether the selected service / variant is for an individual person (`true`)
 * rather than a company / corporate / club entity (`false`).
 */
export function isServiceVariantIndividual(
  service?: { id?: string; title?: string; code?: string } | null,
  variants?: Array<{ id: string; isIndividual?: boolean; name?: string; description?: string; [key: string]: unknown }>,
  selectedVariantId?: string | null,
  selectedVariantName?: string | null
): boolean {
  if (variants && variants.length > 0 && selectedVariantId) {
    const matched = variants.find((v) => String(v.id) === String(selectedVariantId));
    if (matched && typeof matched.isIndividual === "boolean") {
      return matched.isIndividual;
    }
  }

  const varIdLower = String(selectedVariantId || "").toLowerCase();
  const varNameLower = String(selectedVariantName || "").toLowerCase();
  if (varIdLower.includes("club") || varNameLower.includes("amateur club") || varNameLower.includes("club radio")) {
    return false;
  }

  const serviceTitle = String(service?.title || "").toUpperCase();
  const serviceIdLower = String(service?.id || "").toLowerCase();
  const serviceCodeLower = String(service?.code || "").toLowerCase();

  const isCompanyCertService =
    serviceTitle.includes("TVRO") ||
    serviceTitle.includes("CATV") ||
    serviceTitle.includes("VALUE-ADDED") ||
    serviceTitle.includes("VAS") ||
    serviceTitle.includes("RFID") ||
    serviceTitle.includes("SRD") ||
    serviceTitle.includes("WDN") ||
    serviceTitle.includes("CPE") ||
    serviceTitle.includes("ACCREDITATION") ||
    serviceTitle.includes("COMMERCIAL") ||
    serviceTitle.includes("CLUB") ||
    serviceIdLower.includes("119") ||
    serviceIdLower.includes("120") ||
    serviceIdLower.includes("122") ||
    serviceIdLower.includes("ntc_1_19") ||
    serviceIdLower.includes("ntc_1_20") ||
    serviceIdLower.includes("ntc_1_22") ||
    serviceCodeLower.includes("ntc_1_19") ||
    serviceCodeLower.includes("ntc_1_20") ||
    serviceCodeLower.includes("ntc_1_22");

  return !isCompanyCertService;
}

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
 * Company name is only used when the application itself is for a company (not an individual application)
 * and has been filled out on the application form.
 */
export function getApplicantDisplayName(
  app?: GeneralApplicantData | null,
  fallbackIdx?: number,
  options?: { isIndividualApplication?: boolean }
): string {
  if (!app) {
    return fallbackIdx !== undefined ? `Applicant #${fallbackIdx}` : "Applicant";
  }

  const hasVariantContext = Boolean(app.serviceId || app.selectedVariantId || app.selectedVariantName);
  const isIndividualApp =
    options?.isIndividualApplication !== undefined
      ? options.isIndividualApplication
      : app.applicantType !== "company" ||
        (hasVariantContext &&
          isServiceVariantIndividual(
            app.serviceId ? { id: app.serviceId, title: "" } : null,
            undefined,
            app.selectedVariantId,
            app.selectedVariantName
          ));

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
        (!isIndividualApp && (l.includes("company name") || l.includes("corporate name")))
      );
    })?.value?.trim();

    if (fullName && fullName.length > 0) {
      return formatProperName(fullName);
    }
  }

  if (!isIndividualApp) {
    if (app.companyName && app.companyName.trim().length > 0) {
      return formatProperName(app.companyName.trim());
    }

    if (app.deviceRegData?.businessName && app.deviceRegData.businessName.trim().length > 0) {
      return formatProperName(app.deviceRegData.businessName.trim());
    }

    if (app.tvroRegData?.applicantName && app.tvroRegData.applicantName.trim().length > 0) {
      return formatProperName(app.tvroRegData.applicantName.trim());
    }
  }

  return "Applicant";
}
