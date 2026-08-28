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
  dbRequirements: any[],
  examineeType: string,
  serviceName?: string | null
): ExamRequirementItem[] => {
  if (dbRequirements && dbRequirements.length > 0) {
    return dbRequirements.map((r: any, idx: number) => ({
      id: r.id || r.requirementId,
      name: r.name || r.label || r.title || `Requirement ${idx + 1}`,
      isRequired: r.isRequired !== undefined ? r.isRequired : true,
      description: r.description,
      hint: r.hint || r.description,
    }));
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
  formFields: any[],
  serviceName?: string | null
) => {
  const months: Record<string, string> = {
    January: "01", February: "02", March: "03", April: "04", May: "05", June: "06",
    July: "07", August: "08", September: "09", October: "10", November: "11", December: "12"
  };

  return applicants.map((app) => {
    const monthNum = months[app.birthMonth] || "01";
    const day = app.birthDay.padStart(2, '0');
    const birthDate = `${monthNum}/${day}/${app.birthYear}`;

    let examCat = "radio";
    const sNameLower = (serviceName || app.examType || "").toLowerCase();
    if (sNameLower.includes("rroc") || sNameLower.includes("aircraft")) examCat = "rroc";
    if (sNameLower.includes("amateur")) examCat = "amateur";

    let examTaker = "first taker";
    const etLower = (app.examineeType || "").toLowerCase();
    if (etLower.includes("repeat") || etLower.includes("retake")) examTaker = "retaker";
    if (etLower.includes("upgrade")) examTaker = "upgrade";

    const address = `${app.street}, ${app.barangay}, ${app.city}, ${app.province}, ${app.zipCode}`;
    const formFieldValues: Array<{ fieldId: string; value: string }> = [];

    if (formFields.length > 0) {
      const mappings = [
        { fieldId: "fd000000-0000-0000-0000-000000000001", terms: ["full name", "applicant name", "name"], value: `${app.firstName} ${app.lastName}` },
        { fieldId: "fd000000-0000-0000-0000-000000000002", terms: ["birth date", "date of birth", "dob"], value: `${app.birthYear}-${monthNum}-${day}` },
        { fieldId: "fd000000-0000-0000-0000-000000000003", terms: ["address", "street", "residence"], value: address },
        { fieldId: "fd000000-0000-0000-0000-000000000004", terms: ["contact no", "contact number", "phone", "mobile"], value: app.contactNo },
        { fieldId: "fd000000-0000-0000-0000-000000000005", terms: ["email address", "email"], value: app.email },
        { fieldId: "fd000000-0000-0000-0000-000000000006", terms: ["education", "school", "course", "degree"], value: `${app.schoolName} - ${app.courseDegree}` },
        { 
          fieldId: "fd000000-0000-0000-0000-000000000007", 
          terms: ["exam category", "category"], 
          value: app.examType === "Amateur" ? "Amateur" : (app.examType === "RROC-Aircraft" ? "GMDSS" : "Commercial") 
        },
        { fieldId: "fd000000-0000-0000-0000-000000000008", terms: ["examinee type", "type"], value: app.examineeType },
        { fieldId: "fd000000-0000-0000-0000-000000000009", terms: ["elements", "element"], value: app.selectedOption },
        { fieldId: "fd000000-0000-0000-0000-000000000010", terms: ["special needs", "assistance"], value: "None" },
        { fieldId: "fd000000-0000-0000-0000-000000000011", terms: ["admission number", "admission slip"], value: `ADM-${Math.floor(100000 + Math.random() * 900000)}` },
        { fieldId: "fd000000-0000-0000-0000-000000000012", terms: ["signature"], value: `${app.firstName} ${app.lastName}` },
        { fieldId: "fd000000-0000-0000-0000-000000000013", terms: ["declare", "info is true", "checkbox"], value: "true" },
      ];

      formFields.forEach((field: any) => {
        const labelLower = (field.label || "").toLowerCase();
        const id = field.fieldId;
        const match = mappings.find(m => m.fieldId === id || m.terms.some(t => labelLower.includes(t)));
        if (match) {
          formFieldValues.push({
            fieldId: id,
            value: match.value
          });
        } else {
          formFieldValues.push({
            fieldId: id,
            value: field.type === "checkbox" ? "false" : ""
          });
        }
      });
    } else {
      formFieldValues.push(
        { fieldId: "f0100000-0000-0000-0000-000000000001", value: examCat },
        { fieldId: "f0100000-0000-0000-0000-000000000002", value: examTaker }
      );
    }

    return {
      applicantType: "individual",
      firstName: app.firstName,
      lastName: app.lastName,
      email: app.email,
      contactNumber: app.contactNo,
      address: address,
      birthDate: birthDate,
      formFieldValues,
    };
  });
};
