import { ExamApplicantData } from "../types/examTypes";

export const validateExamForm = (
  app: ExamApplicantData,
  setErrors: (errs: Record<string, string>) => void
): boolean => {
  const newErrors: Record<string, string> = {};

  if (!app.lastName) newErrors.lastName = "Last name is required.";
  if (!app.firstName) newErrors.firstName = "First name is required.";
  if (!app.province) newErrors.province = "Province is required.";
  if (!app.city) newErrors.city = "City is required.";
  if (!app.barangay) newErrors.barangay = "Barangay is required.";
  if (!app.street) newErrors.street = "Street is required.";
  
  if (!app.zipCode) {
    newErrors.zipCode = "Zip Code is required.";
  } else if (!/^\d{4}$/.test(app.zipCode)) {
    newErrors.zipCode = "Zip Code must be a 4-digit number.";
  }

  if (!app.schoolName) newErrors.schoolName = "School name is required.";
  if (!app.courseDegree) newErrors.courseDegree = "Course/Degree is required.";
  
  if (!app.yearGraduated) {
    newErrors.yearGraduated = "Graduation year is required.";
  } else if (!/^\d{4}$/.test(app.yearGraduated)) {
    newErrors.yearGraduated = "Must be a valid 4-digit year.";
  }

  if (!app.email) {
    newErrors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(app.email)) {
    newErrors.email = "Invalid email format.";
  }

  if (!app.contactNo) {
    newErrors.contactNo = "Contact number is required.";
  } else if (!/^(09|\+639)\d{9}$/.test(app.contactNo) && !/^\d{10,11}$/.test(app.contactNo)) {
    newErrors.contactNo = "Invalid contact number format.";
  }

  if (!app.signature) {
    newErrors.signature = "Applicant signature is required.";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

export const getFieldValidationError = (field: keyof ExamApplicantData, value: string): string | undefined => {
  if (field === "lastName" && !value) return "Last name is required.";
  if (field === "firstName" && !value) return "First name is required.";
  if (field === "province" && !value) return "Province is required.";
  if (field === "city" && !value) return "City is required.";
  if (field === "barangay" && !value) return "Barangay is required.";
  if (field === "street" && !value) return "Street is required.";
  
  if (field === "zipCode") {
    if (!value) return "Zip Code is required.";
    if (!/^\d{4}$/.test(value)) return "Zip Code must be a 4-digit number.";
  }

  if (field === "schoolName" && !value) return "School name is required.";
  if (field === "courseDegree" && !value) return "Course/Degree is required.";
  
  if (field === "yearGraduated") {
    if (!value) return "Graduation year is required.";
    if (!/^\d{4}$/.test(value)) return "Must be a valid 4-digit year.";
  }

  if (field === "email") {
    if (!value) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email format.";
  }

  if (field === "contactNo") {
    if (!value) return "Contact number is required.";
    if (!/^(09|\+639)\d{9}$/.test(value) && !/^\d{10,11}$/.test(value)) return "Invalid contact number format.";
  }

  if (field === "signature" && !value) {
    return "Applicant signature is required.";
  }

  return undefined;
};

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null;
}

/**
 * Safely extracts document/asset file name from an upload item or string descriptor
 * using defensive null-checks and runtime type guards without type assertions.
 */
export const getUploadItemFileName = (uploadItem: unknown): string => {
  if (typeof uploadItem === "string" && uploadItem.trim() !== "") {
    return uploadItem.trim();
  }
  if (isRecord(uploadItem)) {
    if (typeof uploadItem.name === "string" && uploadItem.name.trim() !== "") {
      return uploadItem.name.trim();
    }
    const rawFile = uploadItem.file;
    if (isRecord(rawFile) && typeof rawFile.name === "string" && rawFile.name.trim() !== "") {
      return rawFile.name.trim();
    }
    const rawUri = uploadItem.uri;
    if (typeof rawUri === "string" && rawUri.trim() !== "") {
      const parts = rawUri.split("/");
      const last = parts[parts.length - 1];
      if (last && last.trim() !== "") {
        return decodeURIComponent(last.trim());
      }
    }
  }
  return "Supporting Document";
};

/**
 * Safely extracts document/asset file size from an upload item.
 */
export const getUploadItemFileSize = (uploadItem: unknown): number | undefined => {
  if (isRecord(uploadItem)) {
    if (typeof uploadItem.size === "number" && uploadItem.size > 0) {
      return uploadItem.size;
    }
    const rawFile = uploadItem.file;
    if (isRecord(rawFile) && typeof rawFile.size === "number" && rawFile.size > 0) {
      return rawFile.size;
    }
  }
  return undefined;
};

/**
 * Safely extracts document/asset mime type from an upload item.
 */
export const getUploadItemMimeType = (uploadItem: unknown): string | undefined => {
  if (isRecord(uploadItem)) {
    if (typeof uploadItem.type === "string" && uploadItem.type.trim() !== "") {
      return uploadItem.type.trim();
    }
    if (typeof uploadItem.mimeType === "string" && uploadItem.mimeType.trim() !== "") {
      return uploadItem.mimeType.trim();
    }
    const rawFile = uploadItem.file;
    if (isRecord(rawFile) && typeof rawFile.type === "string" && rawFile.type.trim() !== "") {
      return rawFile.type.trim();
    }
  }
  return undefined;
};

export interface ExamRequirementItem {
  id?: string;
  name: string;
  isRequired?: boolean;
  description?: string;
  hint?: string;
}

export const getRequirementsList = (
  dbRequirements: unknown[],
  examineeType: string,
  serviceName?: string | null
): ExamRequirementItem[] => {
  if (Array.isArray(dbRequirements) && dbRequirements.length > 0) {
    return dbRequirements.map((rRaw, idx) => {
      const r = isRecord(rRaw) ? rRaw : {};
      const id = typeof r.id === "string" ? r.id : typeof r.requirementId === "string" ? r.requirementId : undefined;
      const name =
        typeof r.name === "string" && r.name.trim() !== ""
          ? r.name
          : typeof r.label === "string" && r.label.trim() !== ""
          ? r.label
          : typeof r.title === "string" && r.title.trim() !== ""
          ? r.title
          : `Requirement ${idx + 1}`;
      const isRequired = typeof r.isRequired === "boolean" ? r.isRequired : true;
      const description = typeof r.description === "string" ? r.description : undefined;
      const hint = typeof r.hint === "string" ? r.hint : description;

      return {
        id,
        name,
        isRequired,
        description,
        hint,
      };
    });
  }
  const list: ExamRequirementItem[] = [
    {
      name: "PSA Birth Certificate or Valid Passport / Government ID",
      isRequired: true,
      hint: "Clear colored scanned copy or photograph of valid PSA birth certificate or primary government ID",
    },
    {
      name: "Transcript of Records or Diploma with Special Order (SO) Number",
      isRequired: true,
      hint: "Certified true copy or scanned copy of official TOR or graduation diploma",
    },
    {
      name: "Three (3) clear 1x1 ID pictures taken within the last six (6) months",
      isRequired: true,
      hint: "Front-facing colored ID photograph on white background taken recently",
    },
  ];
  if (examineeType === "Upgrader" || (serviceName && serviceName.toLowerCase().includes("radio"))) {
    list.push({
      name: "Copy of prior Radio Operator Certificate (ROC) / License",
      isRequired: true,
      hint: "Front and back clear copy of active or expired radio certificate",
    });
  }
  return list;
};

export const mapApplicantsPayload = (
  applicants: ExamApplicantData[],
  formFields: unknown[],
  _serviceName?: string | null
) => {
  const months: Record<string, string> = {
    January: "01", February: "02", March: "03", April: "04", May: "05", June: "06",
    July: "07", August: "08", September: "09", October: "10", November: "11", December: "12"
  };

  return applicants.map((app) => {
    const hasBirthDate = Boolean(app.birthMonth && app.birthDay && app.birthYear);
    const monthNum = months[app.birthMonth] || "01";
    const day = (app.birthDay || "1").padStart(2, '0');
    const birthDate = hasBirthDate ? `${monthNum}/${day}/${app.birthYear}` : undefined;

    const address = [app.street, app.barangay, app.city, app.province, app.zipCode].filter(Boolean).join(', ');
    const formFieldValues: Array<{ fieldId: string; value: string }> = [];

    if (Array.isArray(formFields) && formFields.length > 0) {
      const mappings: Array<{ fieldId: string; terms: string[]; value: string }> = [];
      if (app.examType) {
        mappings.push({
          fieldId: "fd000000-0000-0000-0000-000000000007",
          terms: ["exam category", "category"],
          value: app.examType === "Amateur" ? "Amateur" : (app.examType === "RROC-Aircraft" ? "GMDSS" : "Commercial")
        });
      }
      if (app.examineeType) {
        mappings.push({
          fieldId: "fd000000-0000-0000-0000-000000000008",
          terms: ["examinee type", "type"],
          value: app.examineeType,
        });
      }
      if (app.selectedOption) {
        mappings.push({
          fieldId: "fd000000-0000-0000-0000-000000000009",
          terms: ["elements", "element"],
          value: app.selectedOption,
        });
      }

      const ignoredBioTerms = [
        "full name", "first name", "last name", "middle name", "applicant name", "name",
        "birth date", "date of birth", "dob", "birth",
        "address", "street", "residence", "barangay", "city", "province", "zip",
        "contact no", "contact number", "phone", "mobile",
        "email address", "email",
        "signature", "declare", "declaration", "terms"
      ];

      formFields.forEach((fieldRaw) => {
        const field = isRecord(fieldRaw) ? fieldRaw : {};
        const label = typeof field.label === "string" ? field.label : "";
        const labelLower = label.toLowerCase();
        const id = typeof field.fieldId === "string" ? field.fieldId : typeof field.id === "string" ? field.id : undefined;
        if (!id) return;

        if ((labelLower.includes("school") || labelLower.includes("university")) && app.schoolName) {
          formFieldValues.push({ fieldId: id, value: app.schoolName });
          return;
        }
        if ((labelLower.includes("course") || labelLower.includes("degree") || labelLower.includes("program")) && app.courseDegree) {
          formFieldValues.push({ fieldId: id, value: app.courseDegree });
          return;
        }
        if ((labelLower.includes("graduat") || labelLower.includes("year graduated")) && app.yearGraduated) {
          formFieldValues.push({ fieldId: id, value: app.yearGraduated });
          return;
        }
        if (ignoredBioTerms.some(t => labelLower.includes(t))) return;

        const match = mappings.find(m => m.fieldId === id || m.terms.some(t => labelLower.includes(t)));
        if (match && match.value) {
          formFieldValues.push({
            fieldId: id,
            value: match.value
          });
        }
      });
    }

    return {
      applicantType: "individual",
      firstName: app.firstName,
      middleName: app.middleName || undefined,
      lastName: app.lastName,
      suffix: app.suffix || undefined,
      email: app.email,
      contactNumber: app.contactNo,
      address: address,
      birthDate: birthDate,
      sex: app.sex || undefined,
      nationality: app.nationality || undefined,
      zipCode: app.zipCode || undefined,
      schoolAttended: app.schoolName || undefined,
      courseTaken: app.courseDegree || undefined,
      yearGraduated: app.yearGraduated || undefined,
      eSignature: app.signature || undefined,
      formFieldValues,
    };
  });
};
