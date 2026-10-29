import { NTCService } from "../../data/servicesData";
import { GeneralApplicantData } from "../types/generalApplicantTypes";
import { isValidContactNumber, isValidEmailAddress } from "../../../../shared/helpers/fieldValidators";

export interface ServiceRequirementItem {
  id?: string;
  key?: string;
  name?: string;
  label?: string;
  title?: string;
  description?: string;
  hint?: string;
  isRequired?: boolean;
  required?: boolean;
  [key: string]: unknown;
}

export function isRequirementMandatory(req: ServiceRequirementItem | string): boolean {
  if (typeof req === "string") {
    const lower = req.toLowerCase().trim();
    return !(
      lower.includes("(optional)") ||
      lower.includes("[optional]") ||
      lower.endsWith("optional") ||
      lower.startsWith("optional")
    );
  }
  if (typeof req === "object" && req !== null) {
    if (req.isRequired !== undefined) return Boolean(req.isRequired);
    if (req.required !== undefined) return Boolean(req.required);
    const label = (req.name || req.label || req.title || req.description || "").toLowerCase().trim();
    return !(
      label.includes("(optional)") ||
      label.includes("[optional]") ||
      label.endsWith("optional") ||
      label.startsWith("optional")
    );
  }
  return true;
}

function isValidUploadEntry(val: unknown): boolean {
  if (val === null || val === undefined) return false;
  if (typeof val === "string") {
    const s = val.trim();
    return s.startsWith("data:") || s.startsWith("blob:") || s.startsWith("http:") || s.startsWith("https:") || s.startsWith("file:");
  }
  if (typeof val === "object" && "file" in val && Boolean(val.file)) {
    return true;
  }
  if (typeof val === "object" && "uri" in val && typeof val.uri === "string" && val.uri.trim().length > 0) {
    const u = val.uri.trim();
    return u.startsWith("data:") || u.startsWith("blob:") || u.startsWith("http:") || u.startsWith("https:") || u.startsWith("file:");
  }
  return false;
}

export function isRequirementUploaded(
  req: ServiceRequirementItem | string,
  idx: number,
  uploads: Record<string, { name?: string; uri?: string } | string | undefined> | undefined
): boolean {
  if (!uploads) return false;
  const isReqObj = typeof req === "object" && req !== null;
  const reqId = isReqObj && req.id ? String(req.id).trim() : "";
  const reqLabel = (isReqObj ? (req.name || req.label || req.title || "") : req).trim();

  const candidateKeys = [
    reqId ? `req-${reqId}` : "",
    reqId,
    `req-${idx}`,
    `req-gen-${idx}`,
    idx.toString(),
    reqLabel,
    reqLabel.replace(/\*$/, "").trim(),
  ].filter(Boolean);

  for (const k of candidateKeys) {
    const val = uploads[k];
    if (isValidUploadEntry(val)) return true;
  }

  const uploadEntries = Object.entries(uploads);
  for (const [upKey, upVal] of uploadEntries) {
    if (!isValidUploadEntry(upVal)) continue;

    const upKeyLower = upKey.toLowerCase().trim();
    if (
      (reqId && upKeyLower.includes(reqId.toLowerCase())) ||
      (reqLabel && upKeyLower === reqLabel.toLowerCase()) ||
      (reqLabel && upKeyLower === reqLabel.replace(/\*$/, "").toLowerCase().trim()) ||
      upKeyLower === `req-${idx}` ||
      upKeyLower === `req-gen-${idx}`
    ) {
      return true;
    }
  }

  return false;
}

export const isGeneralApplicantComplete = (
  app: GeneralApplicantData,
  service?: NTCService,
  variantRequirements: Array<ServiceRequirementItem | string> = []
): boolean => {
  const hasName =
    (Boolean(app.firstName && app.firstName.trim().length > 0) && Boolean(app.lastName && app.lastName.trim().length > 0)) ||
    Boolean(app.companyName && app.companyName.trim().length > 0) ||
    Boolean(app.representativeName && app.representativeName.trim().length > 0) ||
    Boolean(
      app.formFieldValues?.some(
        (fv) =>
          ((fv.fieldId &&
            (fv.fieldId.toLowerCase().includes("name") ||
              fv.fieldId.toLowerCase().includes("fullname") ||
              fv.fieldId.toLowerCase().includes("company") ||
              fv.fieldId.toLowerCase().includes("applicant"))) ||
            (fv.fieldLabel &&
              (fv.fieldLabel.toLowerCase().includes("name") ||
                fv.fieldLabel.toLowerCase().includes("applicant") ||
                fv.fieldLabel.toLowerCase().includes("company")))) &&
          fv.value &&
          fv.value.trim().length > 0
      )
    );

  const hasEmail =
    Boolean(app.email && isValidEmailAddress(app.email)) ||
    Boolean(
      app.formFieldValues?.some(
        (fv) =>
          (fv.fieldId?.toLowerCase().includes("email") || fv.fieldLabel?.toLowerCase().includes("email")) &&
          fv.value &&
          isValidEmailAddress(fv.value.trim())
      )
    );

  const hasContact =
    Boolean(app.contactNo && isValidContactNumber(app.contactNo)) ||
    Boolean(
      app.formFieldValues?.some(
        (fv) =>
          (fv.fieldId?.toLowerCase().includes("contact") ||
            fv.fieldLabel?.toLowerCase().includes("contact") ||
            fv.fieldId?.toLowerCase().includes("phone") ||
            fv.fieldLabel?.toLowerCase().includes("phone") ||
            fv.fieldId?.toLowerCase().includes("mobile") ||
            fv.fieldLabel?.toLowerCase().includes("mobile")) &&
          fv.value &&
          fv.value.trim().length > 0
      )
    );

  if (!hasName || !hasEmail || !hasContact) {
    return false;
  }

  const reqList =
    variantRequirements && variantRequirements.length > 0
      ? variantRequirements
      : service?.requirements && service.requirements.length > 0
      ? service.requirements
      : [];

  if (reqList.length > 0) {
    const mandatoryList = reqList
      .map((req, idx) => ({ req, idx }))
      .filter(({ req }) => isRequirementMandatory(req));

    const allMandatoryUploaded = mandatoryList.every(({ req, idx }) =>
      isRequirementUploaded(req, idx, app.uploads)
    );

    if (!allMandatoryUploaded) {
      return false;
    }
  }

  return true;
};
