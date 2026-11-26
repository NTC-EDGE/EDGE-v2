import { NTCService } from "../../data/servicesData";
import { GeneralApplicantData } from "../../shared/types/generalApplicantTypes";
import { synthesizeAllApplicantFieldValues, FIELD_GUID_MAP } from "../../shared/helpers/applicantFieldSynthesizer";
import { formatCompositeAddress } from "../../../../shared/formPreview/core/formPreviewHelpers";

/**
 * Static GUID registry is imported directly from applicantFieldSynthesizer
 * to ensure consistent canonical GUID resolution and prevent mapping drift.
 */

/**
 * Resolves a field ID by checking:
 * 1. The static GUID registry (exact or partial key match)
 * 2. The live formFields array returned by the API
 * Guarantees a real GUID is always returned when the field is registered in the seeder.
 */
function resolveFieldId(label: string, formFields: Array<{ label?: string; fieldId?: string }>): string {
  const lowerLabel = label.toLowerCase();

  // 1. Exact match in static map
  const exactId = FIELD_GUID_MAP[lowerLabel];
  if (exactId !== undefined) return exactId;

  // 2. Partial match in static map (label contains a known key)
  for (const [key, id] of Object.entries(FIELD_GUID_MAP)) {
    if (lowerLabel.includes(key) || key.includes(lowerLabel)) return id;
  }

  // 3. Fallback to live formFields from API
  const matched = formFields.find(
    (f) => (f.label ?? "").toLowerCase().includes(lowerLabel)
  );
  if (matched !== undefined && matched.fieldId !== undefined) return matched.fieldId;

  // 4. Last resort — generate a deterministic slug (will be rejected by backend if form is DB-backed)
  return `f-${lowerLabel.replace(/\s+/g, "-")}`;
}

export interface FormFieldValuePayload {
  fieldId: string;
  fieldLabel?: string;
  value: string;
}

export interface SerializedApplicantPayload {
  serviceId?: string;
  serviceVariantId?: string;
  applicantType?: string;
  companyName?: string;
  representativeName?: string;
  dtiSecRegistration?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  email: string;
  contactNumber: string;
  address: string;
  birthDate?: string;
  sex?: string;
  civilStatus?: string;
  nationality?: string;
  zipCode?: string;
  schoolAttended?: string;
  courseTaken?: string;
  yearGraduated?: string;
  eSignature?: string;
  formFieldValues: FormFieldValuePayload[];
}

export function serializeCertificateApplicant(
  app: GeneralApplicantData,
  _service: NTCService,
  formFields: Array<{ label?: string; fieldId?: string; id?: string }> = []
): SerializedApplicantPayload {
  const monthMap: Record<string, string> = {
    January: "01",
    February: "02",
    March: "03",
    April: "04",
    May: "05",
    June: "06",
    July: "07",
    August: "08",
    September: "09",
    October: "10",
    November: "11",
    December: "12",
  };

  const hasBirthDate = Boolean(app.birthYear && app.birthMonth && app.birthDay);
  const birthDate = hasBirthDate
    ? `${app.birthYear}-${monthMap[app.birthMonth] || "01"}-${(app.birthDay || "1").padStart(2, "0")}`
    : (app.birthDate && app.birthDate.trim() !== "" ? app.birthDate.trim() : undefined);

  // Synthesize ALL applicant inputs: dynamic form fields, standard particulars, and specialized models
  const synthesized = synthesizeAllApplicantFieldValues(app, formFields);

  const validFieldIdSet = new Set<string>();
  formFields.forEach((f) => {
    const id = f.fieldId || f.id;
    if (id && id.trim() !== '') {
      validFieldIdSet.add(id.toLowerCase().trim());
    }
  });

  if (formFields.length > 0) {
    // When an active variant form schema is loaded, only allow fields from that schema
    // PLUS core applicant profile, address, contact, education, signature, variant, and element metadata GUIDs.
    // This prevents stale or hidden service-specific fields from other variants/sections from being saved.
    const coreApplicantMetadataGuids = [
      'fd000000-0000-0000-0000-000000000001', // fullName
      'fd000000-0000-0000-0000-000000000002', // birthDate
      'fd000000-0000-0000-0000-000000000003', // address
      'fd000000-0000-0000-0000-000000000004', // contactNo
      'fd000000-0000-0000-0000-000000000005', // email
      'fd000000-0000-0000-0000-000000000006', // education
      'fd000000-0000-0000-0000-000000000007', // examCategory
      'fd000000-0000-0000-0000-000000000008', // examineeType
      'fd000000-0000-0000-0000-000000000009', // elements
      'fd000000-0000-0000-0000-000000000010', // specialNeeds
      'fd000000-0000-0000-0000-000000000011', // admissionNumber
      'fd000000-0000-0000-0000-000000000012', // signatureField
      'fd000000-0000-0000-0000-000000000013', // declarationCheckbox
      'fd000000-0000-0000-0000-000000000014', // typeOfCertificate
      'fd000000-0000-0000-0000-000000000024', // permitType
      'fd000000-0000-0000-0000-000000000025', // classOfStation
      'fd000000-0000-0000-0000-000000000041', // sex
      'fd000000-0000-0000-0000-000000000042', // civilStatus
      'fd000000-0000-0000-0000-000000000043', // nationality
      'fd000000-0000-0000-0000-000000000051', // region
      'fd000000-0000-0000-0000-000000000052', // province
      'fd000000-0000-0000-0000-000000000053', // city
      'fd000000-0000-0000-0000-000000000054', // barangay
      'fd000000-0000-0000-0000-000000000055', // street
      'fd000000-0000-0000-0000-000000000056', // zipCode
      'fd000000-0000-0000-0000-000000000061', // schoolName
      'fd000000-0000-0000-0000-000000000062', // courseDegree
      'fd000000-0000-0000-0000-000000000063', // yearGraduated
      'fd000000-0000-0000-0000-000000000071', // emergencyContactPerson
      'fd000000-0000-0000-0000-000000000072', // emergencyContactNo
      'fd000000-0000-0000-0000-000000000081', // companyName
      'fd000000-0000-0000-0000-000000000082', // representativeName
      'fd000000-0000-0000-0000-000000000083', // representativePosition
      'fd000000-0000-0000-0000-000000000086', // dtiSecRegistration
      'fd000000-0000-0000-0000-000000000088', // applicantName
      'fd000000-0000-0000-0000-000000000210', // middleName
      'fd000000-0000-0000-0000-000000000211', // suffix
    ];
    coreApplicantMetadataGuids.forEach((guid) => {
      validFieldIdSet.add(guid.toLowerCase().trim());
    });
  } else {
    // Fallback when no DB schema fields were loaded
    Object.values(FIELD_GUID_MAP).forEach((guid) => {
      validFieldIdSet.add(guid.toLowerCase().trim());
    });
  }

  const finalFieldValues: FormFieldValuePayload[] = [];
  const processedFieldIds = new Set<string>();

  synthesized.forEach((fv) => {
    const cleanId = (fv.fieldId || '').trim();
    const idLower = cleanId.toLowerCase();

    // If validFieldIdSet has registered IDs, only include recognized fields to avoid bogus GUIDs
    if (validFieldIdSet.size > 0 && !validFieldIdSet.has(idLower)) {
      return;
    }

    if (cleanId && !processedFieldIds.has(idLower)) {
      processedFieldIds.add(idLower);
      finalFieldValues.push({
        fieldId: cleanId,
        fieldLabel: fv.fieldLabel,
        value: fv.value,
      });
    }
  });

  // If validFieldIdSet was empty (e.g. no DB schema provided or draft), preserve all synthesized fields
  if (finalFieldValues.length === 0 && synthesized.length > 0) {
    synthesized.forEach((fv) => {
      const cleanId = (fv.fieldId || '').trim();
      const idLower = cleanId.toLowerCase();
      if (cleanId && !processedFieldIds.has(idLower)) {
        processedFieldIds.add(idLower);
        finalFieldValues.push({
          fieldId: cleanId,
          fieldLabel: fv.fieldLabel,
          value: fv.value,
        });
      }
    });
  }

  const fnFromFields = finalFieldValues.find(fv => {
    const l = (fv.fieldLabel || "").toLowerCase();
    return l.includes("first name") || l === "fname";
  })?.value?.trim();

  const lnFromFields = finalFieldValues.find(fv => {
    const l = (fv.fieldLabel || "").toLowerCase();
    return l.includes("last name") || l.includes("surname") || l === "lname";
  })?.value?.trim();

  const fullNameField = finalFieldValues.find(fv => {
    const l = (fv.fieldLabel || "").toLowerCase();
    return l.includes("full name") || l.includes("applicant name") || l === "name";
  })?.value?.trim() || "";

  let finalFirstName = app.firstName?.trim() || fnFromFields || "";
  let finalLastName = app.lastName?.trim() || lnFromFields || "";

  if (!finalFirstName && fullNameField) {
    const parts = fullNameField.split(/\s+/);
    finalFirstName = parts[0] || "";
    finalLastName = parts.slice(1).join(" ") || "";
  }

  const isComp = (app.applicantType || "").toLowerCase() === "company";
  const effectiveFirstName = finalFirstName || (isComp ? app.representativeFirstName || "" : "");
  const effectiveMiddleName = app.middleName || (isComp ? app.representativeMiddleName : undefined);
  const effectiveLastName = finalLastName || (isComp ? app.representativeLastName || "" : "");
  const effectiveSuffix = app.suffix || (isComp ? app.representativeSuffix : undefined);

  const emailVal = app.email?.trim() || finalFieldValues.find(fv => (fv.fieldLabel || '').toLowerCase().includes('email'))?.value?.trim() || "";
  const contactVal = app.contactNo?.trim() || finalFieldValues.find(fv => (fv.fieldLabel || '').toLowerCase().includes('contact') || (fv.fieldLabel || '').toLowerCase().includes('mobile'))?.value?.trim() || "";

  const compositeAddress = formatCompositeAddress({
    ...app,
    address: app.street ? undefined : app.address,
  });

  const addressVal = compositeAddress || app.address?.trim() || finalFieldValues.find(fv => (fv.fieldLabel || '').toLowerCase().includes('address') && !(fv.fieldLabel || '').toLowerCase().includes('email'))?.value?.trim() || "";

  const hasSponsoringCompany = isComp || Boolean(app.companyName && app.companyName.trim().length > 0);

  return {
    serviceId: app.serviceId || _service.id || undefined,
    serviceVariantId: app.selectedVariantId || undefined,
    applicantType: app.applicantType || "individual",
    companyName: hasSponsoringCompany ? (app.companyName || undefined) : undefined,
    representativeName: hasSponsoringCompany ? (app.representativeName || undefined) : undefined,
    dtiSecRegistration: hasSponsoringCompany ? (app.dtiSecRegistration || undefined) : undefined,
    firstName: effectiveFirstName,
    middleName: effectiveMiddleName || undefined,
    lastName: effectiveLastName,
    suffix: effectiveSuffix || undefined,
    email: emailVal,
    contactNumber: contactVal,
    address: addressVal,
    birthDate,
    sex: app.sex || undefined,
    civilStatus: app.civilStatus || undefined,
    nationality: app.nationality || undefined,
    zipCode: app.zipCode || undefined,
    schoolAttended: app.schoolName || undefined,
    courseTaken: app.courseDegree || undefined,
    yearGraduated: app.yearGraduated || undefined,
    eSignature: app.signatureUrl || undefined,
    formFieldValues: finalFieldValues,
  };
}
