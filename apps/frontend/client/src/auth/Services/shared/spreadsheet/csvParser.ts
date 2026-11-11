import { GeneralApplicantData, initialGeneralApplicant } from "../types/generalApplicantTypes";
import { NTCService } from "../../data/servicesData";
import { FormDto, FieldDto } from "../../../../shared/components/dynamic-form/dynamicFormTypes";
import { parseOptions } from "../../../../shared/components/dynamic-form/dynamicFormUtils";

export interface ParsedRowResult {
  rowNumber: number;
  name: string;
  email: string;
  status: "Valid" | "Invalid";
  remarks: string[];
  applicantData: GeneralApplicantData;
}

export interface CsvParseResult {
  totalRows: number;
  validCount: number;
  invalidCount: number;
  results: ParsedRowResult[];
  applicants: GeneralApplicantData[];
}

export function normalizeHeaderKey(raw: string): string {
  if (!raw || typeof raw !== "string") return "";
  return raw
    .replace(/\s*\([^)]*options[^)]*\)/gi, "")
    .replace(/\s*\([^)]*\|[^)]*\)/g, "")
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/\s*\[[^\]]*\]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function parseSpreadsheetContent(
  csvContent: string,
  service: NTCService,
  form?: FormDto | null
): CsvParseResult {
  const lines = csvContent
    .split(/\r\n|\n|\r/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("#"));

  if (lines.length <= 1) {
    return {
      totalRows: 0,
      validCount: 0,
      invalidCount: 0,
      results: [],
      applicants: [],
    };
  }

  const rawHeaders = parseCsvLine(lines[0] || "");
  const headers = rawHeaders.map((h) => normalizeHeaderKey(h));

  const formFields: FieldDto[] = [];
  if (form && Array.isArray(form.sections)) {
    for (const sec of form.sections) {
      const secFields = Array.isArray(sec.fields) ? sec.fields : [];
      for (const f of secFields) {
        if (typeof f.label === "string" && f.label.trim().length > 0) {
          formFields.push(f);
        }
      }
    }
  }

  interface HeaderFieldMapping {
    colIndex: number;
    field: FieldDto;
    normalizedLabel: string;
  }

  const headerFieldMappings: HeaderFieldMapping[] = [];

  for (const f of formFields) {
    const rawLabel = typeof f.label === "string" ? f.label : "";
    const normLabel = normalizeHeaderKey(rawLabel);
    const normId = typeof f.fieldId === "string" ? f.fieldId.toLowerCase().replace(/[^a-z0-9]/g, "") : (typeof f.id === "string" ? f.id.toLowerCase().replace(/[^a-z0-9]/g, "") : "");

    let foundIndex = -1;
    for (let h = 0; h < headers.length; h++) {
      const hNorm = headers[h];
      if (!hNorm) continue;
      if (hNorm === normLabel || (normId.length > 0 && hNorm === normId)) {
        foundIndex = h;
        break;
      }
    }

    if (foundIndex === -1 && normLabel.length > 3) {
      for (let h = 0; h < headers.length; h++) {
        const hNorm = headers[h];
        if (!hNorm || hNorm.length <= 3) continue;
        if (normLabel.includes(hNorm) || hNorm.includes(normLabel)) {
          foundIndex = h;
          break;
        }
      }
    }

    if (foundIndex !== -1) {
      headerFieldMappings.push({
        colIndex: foundIndex,
        field: f,
        normalizedLabel: normLabel,
      });
    }
  }

  const results: ParsedRowResult[] = [];
  const applicants: GeneralApplicantData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    if (!rawLine) continue;

    const cols = parseCsvLine(rawLine);
    const rowDict: Record<string, string> = {};
    for (let h = 0; h < headers.length && h < cols.length; h++) {
      const headerKey = headers[h];
      if (headerKey) {
        rowDict[headerKey] = cols[h] || "";
      }
    }

    const getVal = (...keys: string[]): string => {
      for (const k of keys) {
        const normalized = normalizeHeaderKey(k);
        if (rowDict[normalized] !== undefined && rowDict[normalized] !== "") {
          return rowDict[normalized] || "";
        }
      }
      for (const k of keys) {
        const normalized = normalizeHeaderKey(k);
        if (normalized.length >= 4) {
          for (const dictKey of Object.keys(rowDict)) {
            if (dictKey.includes(normalized) || (dictKey.length >= 4 && normalized.includes(dictKey))) {
              if (rowDict[dictKey] !== undefined && rowDict[dictKey] !== "") {
                return rowDict[dictKey] || "";
              }
            }
          }
        }
      }
      return "";
    };

    const firstName = getVal("firstname", "first", "name", "applicantname", "businessname", "companyname");
    const middleName = getVal("middlename", "middle", "middleinitial", "mi");
    const lastName = getVal("lastname", "last", "surname");
    const suffix = getVal("suffix", "ext", "extension");
    const email = getVal("email", "emailaddress");
    const contactNo = getVal("contactnumber", "contactno", "phone", "mobile", "cellphone");
    const birthDate = getVal("dateofbirth", "birthdate", "dob");
    const nationality = getVal("nationality", "citizenship") || "Filipino";
    const region = getVal("region", "regionname");
    const province = getVal("province", "state");
    const city = getVal("city", "municipality", "citymunicipality");
    const barangay = getVal("barangay", "brgy", "bgy");
    const street = getVal("street", "streetaddress", "addressline1", "streetzone");
    const zipCode = getVal("zipcode", "zip", "postalcode", "postal");
    const schoolName = getVal("schoolname", "school", "university", "schoolattended", "education");
    const courseDegree = getVal("coursedegree", "course", "degree", "program");
    const yearGraduated = getVal("yeargraduated", "graduatedyear", "graduationyear", "yeargrad");
    const specialOrderNo = getVal("specialorderno", "specialorder", "sono", "so", "specialordernumber");
    const examType = getVal("examtype", "examcategory", "applicationtype", "apptype", "category") || "Radiotelephony";
    const selectedOption = getVal("selectedoption", "classelement", "elements", "element", "class", "optionclass", "radiooption") || "1PHN - Elements 1, 2, 3 & 4";
    const appType = getVal("applicationtype", "apptype", "examcategory") || "NEW";
    const years = getVal("noofyears", "numberofyears", "years") || "1";
    const notes = getVal("notes", "remarks", "specialneeds", "assistance") || "";

    const repFirstName = getVal("representativefirstname", "repfirstname", "repfirst");
    const repMiddleName = getVal("representativemiddlename", "repmiddlename", "repmiddle");
    const repLastName = getVal("representativelastname", "replastname", "replast");
    const repSuffix = getVal("representativesuffix", "repsuffix");
    const repName = getVal("representativename", "authorizedrepresentative", "representative", "repname") ||
      [repFirstName, repMiddleName, repLastName, repSuffix].filter(Boolean).join(" ");
    const repPosition = getVal("representativeposition", "designation", "position", "repposition");
    const companyName = getVal("companyname", "businessname", "corporatename", "organizationname", "entityname");
    const dtiSecRegistration = getVal("dtisecregistration", "dtisecno", "dtisec", "secno", "dtino", "registrationno", "registrationnumber");
    const applicantTypeVal = getVal("applicanttype", "entitytype", "classification");

    const addressParts = [street, barangay, city, province, zipCode].filter(Boolean);
    const address = addressParts.length > 0 ? addressParts.join(", ") : getVal("address", "physicaladdress");

    const remarks: string[] = [];

    // Strict validation for standard dropdown fields
    const rawSex = getVal("sex", "gender");
    let sex = "Male";
    if (rawSex.length > 0) {
      const sLower = rawSex.trim().toLowerCase();
      if (sLower === "male" || sLower === "m") {
        sex = "Male";
      } else if (sLower === "female" || sLower === "f") {
        sex = "Female";
      } else {
        remarks.push(`Invalid Sex "${rawSex}". Must strictly be either "Male" or "Female".`);
        sex = rawSex;
      }
    }

    const isExamService = (service.code || "").toUpperCase() === "NTC_1_01" ||
      (service.title || "").toUpperCase().includes("EXAM") ||
      (service.title || "").toUpperCase().includes("RADIO OPERATOR");

    const validExamineeTypes = ["First Taker", "Retaker", "Upgrade", "Removal"];
    const rawExamineeType = getVal("examineetype", "takertype", "applicantcategory");
    let examineeType = "First Taker";
    if (rawExamineeType.length > 0) {
      const normExaminee = rawExamineeType.toLowerCase().replace(/[^a-z0-9]/g, "");
      const matchedExaminee = validExamineeTypes.find((t) => t.toLowerCase().replace(/[^a-z0-9]/g, "") === normExaminee);
      if (matchedExaminee !== undefined) {
        examineeType = matchedExaminee;
      } else if (isExamService) {
        remarks.push(`Invalid Examinee Type "${rawExamineeType}". Must strictly be one of: ${validExamineeTypes.join(", ")}.`);
        examineeType = rawExamineeType;
      }
    }

    const isComp = applicantTypeVal.toLowerCase().includes("comp") || applicantTypeVal.toLowerCase().includes("org") || Boolean(companyName);

    const validEntityTypes = [
      "Corporation",
      "Single Proprietorship",
      "Partnership",
      "Government",
      "Cooperative",
      "Association",
      "Non-Profit",
    ];
    const rawEntityType = getVal("entitytype", "businesstype", "companytype");
    if (rawEntityType.length > 0 && isComp) {
      const normEntity = rawEntityType.toLowerCase().replace(/[^a-z0-9]/g, "");
      const matchedEntity = validEntityTypes.find((t) => t.toLowerCase().replace(/[^a-z0-9]/g, "") === normEntity);
      if (matchedEntity === undefined) {
        remarks.push(`Invalid Entity Type "${rawEntityType}". Must strictly match one of: ${validEntityTypes.join(", ")}.`);
      }
    }

    if (!firstName && !lastName) {
      remarks.push("Name or Business Name is missing.");
    }
    if (!email) {
      remarks.push("Email address is required.");
    } else if (!email.includes("@")) {
      remarks.push("Invalid email address format.");
    }
    if (!contactNo) {
      remarks.push("Contact Number is required.");
    }

    if (isExamService) {
      if (!lastName) remarks.push("Last Name is required.");
      if (!firstName) remarks.push("First Name is required.");
      if (!province) remarks.push("Province is required.");
      if (!city) remarks.push("City is required.");
      if (!barangay) remarks.push("Barangay is required.");
      if (!street && !address) remarks.push("Street address is required.");
      if (!zipCode) remarks.push("Zip Code is required.");
      if (!schoolName) remarks.push("School Name is required.");
      if (!courseDegree) remarks.push("Course/Degree is required.");
      if (!yearGraduated) remarks.push("Year Graduated is required.");
    }

    const displayName = `${firstName} ${lastName}`.trim() || `Row ${i} Applicant`;

    // Parse date components
    let birthMonth = "January";
    let birthDay = "1";
    let birthYear = "2000";

    if (birthDate) {
      const parts = birthDate.split(/[-/]/);
      if (parts.length === 3) {
        if (parts[0] && parts[0].length === 4) {
          birthYear = parts[0] || "2000";
          const mIdx = parseInt(parts[1] || "1", 10) - 1;
          const monthsArr = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ];
          birthMonth = monthsArr[mIdx] || "January";
          birthDay = String(parseInt(parts[2] || "1", 10));
        }
      }
    }

    const appObj: GeneralApplicantData = {
      ...initialGeneralApplicant(i),
      applicantType: isComp ? "company" : "individual",
      companyName: companyName || (isComp ? (firstName || displayName) : ""),
      representativeFirstName: repFirstName,
      representativeMiddleName: repMiddleName,
      representativeLastName: repLastName,
      representativeSuffix: repSuffix,
      representativeName: repName,
      representativePosition: repPosition,
      dtiSecRegistration: dtiSecRegistration,
      firstName: firstName || displayName,
      middleName: middleName,
      lastName: lastName,
      suffix: suffix,
      email: email,
      contactNo: contactNo,
      sex: sex,
      nationality: nationality,
      region: region,
      province: province,
      city: city,
      barangay: barangay,
      street: street,
      zipCode: zipCode,
      schoolName: schoolName,
      courseDegree: courseDegree,
      yearGraduated: yearGraduated,
      specialOrderNo: specialOrderNo,
      examType: examType,
      examineeType: examineeType,
      selectedOption: selectedOption,
      address: address,
      birthMonth,
      birthDay,
      birthYear,
      notes: notes,
    };

    // Extract dynamic fields configured in the Form Builder
    const dynamicFieldValues: Array<{ fieldId: string; fieldLabel: string; value: string }> = [];

    for (const mapping of headerFieldMappings) {
      const cellRaw = cols[mapping.colIndex];
      let cellVal = typeof cellRaw === "string" ? cellRaw.trim() : "";

      const fieldId = typeof mapping.field.fieldId === "string" && mapping.field.fieldId.trim().length > 0
        ? mapping.field.fieldId.trim()
        : (typeof mapping.field.id === "string" && mapping.field.id.trim().length > 0 ? mapping.field.id.trim() : `field-${mapping.normalizedLabel}`);

      const fieldLabel = typeof mapping.field.label === "string" && mapping.field.label.trim().length > 0
        ? mapping.field.label.trim()
        : mapping.normalizedLabel;

      if (cellVal.length > 0) {
        // Strict Dropdown / Options Validation
        const fieldOptions = parseOptions(mapping.field);
        if (fieldOptions.length > 0) {
          const normCell = cellVal.toLowerCase().replace(/[^a-z0-9]/g, "");
          const matchedOpt = fieldOptions.find((opt) => {
            const optLabel = typeof opt.label === "string" ? opt.label.trim() : "";
            const optValue = typeof opt.value === "string" ? opt.value.trim() : "";
            const normOptLabel = optLabel.toLowerCase().replace(/[^a-z0-9]/g, "");
            const normOptVal = optValue.toLowerCase().replace(/[^a-z0-9]/g, "");
            return (
              normCell === normOptLabel ||
              normCell === normOptVal ||
              cellVal.toLowerCase() === optLabel.toLowerCase() ||
              cellVal.toLowerCase() === optValue.toLowerCase()
            );
          });

          if (matchedOpt !== undefined) {
            cellVal = (typeof matchedOpt.label === "string" && matchedOpt.label.trim().length > 0)
              ? matchedOpt.label.trim()
              : (typeof matchedOpt.value === "string" ? matchedOpt.value.trim() : cellVal);
          } else {
            const allowedLabels = fieldOptions
              .map((o) => (typeof o.label === "string" && o.label.length > 0 ? o.label : o.value))
              .filter(Boolean)
              .join(", ");
            remarks.push(`Invalid value "${cellVal}" for "${fieldLabel}". Must strictly match one of the allowed dropdown options: ${allowedLabels}.`);
          }
        }

        dynamicFieldValues.push({
          fieldId,
          fieldLabel,
          value: cellVal,
        });

        // Bidirectional sync with standard applicant properties
        const lblLower = fieldLabel.toLowerCase();
        if (lblLower.includes("school") || lblLower.includes("university")) {
          appObj.schoolName = cellVal;
        } else if (lblLower.includes("course") || lblLower.includes("degree")) {
          appObj.courseDegree = cellVal;
        } else if (lblLower.includes("year") && lblLower.includes("grad")) {
          appObj.yearGraduated = cellVal;
        } else if (lblLower.includes("special order") || lblLower.includes("so no")) {
          appObj.specialOrderNo = cellVal;
        } else if (lblLower.includes("company name") || lblLower.includes("business name")) {
          appObj.companyName = cellVal;
        }
      }

      const isMandatory = mapping.field.isRequired === true;
      if (isMandatory && cellVal.length === 0) {
        remarks.push(`${fieldLabel} is required.`);
      }
    }

    // Pre-fill educational fields into dynamicFieldValues if parsed from standard columns and not already added
    if (appObj.schoolName && !dynamicFieldValues.some((fv) => fv.fieldLabel.toLowerCase().includes("school"))) {
      dynamicFieldValues.push({
        fieldId: "fd000000-0000-0000-0000-000000000061",
        fieldLabel: "School / University Attended",
        value: appObj.schoolName,
      });
    }
    if (appObj.courseDegree && !dynamicFieldValues.some((fv) => fv.fieldLabel.toLowerCase().includes("course"))) {
      dynamicFieldValues.push({
        fieldId: "fd000000-0000-0000-0000-000000000062",
        fieldLabel: "Course / Degree Program",
        value: appObj.courseDegree,
      });
    }
    if (appObj.yearGraduated && !dynamicFieldValues.some((fv) => fv.fieldLabel.toLowerCase().includes("graduated"))) {
      dynamicFieldValues.push({
        fieldId: "fd000000-0000-0000-0000-000000000063",
        fieldLabel: "Year Graduated",
        value: appObj.yearGraduated,
      });
    }

    appObj.formFieldValues = dynamicFieldValues;

    // Populate Certificate Sub-objects if available
    if (appObj.radioCertData) {
      appObj.radioCertData.applicantName = displayName;
      appObj.radioCertData.email = email;
      appObj.radioCertData.contactNo = contactNo;
      appObj.radioCertData.address = address;
      appObj.radioCertData.appType = (appType.toUpperCase() === "RENEWAL" ? "RENEWAL" : appType.toUpperCase() === "MODIFICATION" ? "MODIFICATION" : "NEW");
      appObj.radioCertData.years = years;
    }

    if (appObj.deviceRegData) {
      appObj.deviceRegData.businessName = displayName;
      appObj.deviceRegData.email = email;
      appObj.deviceRegData.contactNo = contactNo;
      appObj.deviceRegData.address = address;
      const regType = getVal("registrationtype", "regtype", "dealerornondealer");
      if (regType) {
        appObj.deviceRegData.registrationType = regType.toLowerCase().includes("non") ? "Non-Dealers" : "Dealers";
      }
      const invNo = getVal("invoicenumber", "invoiceno", "commercialinvoiceno", "commercialinvoicenumber", "invoice");
      if (invNo) {
        appObj.deviceRegData.invoiceNo = invNo;
      }
      const serialsStr = getVal("equipmentserialnumbers", "serialnumbers", "serials");
      if (serialsStr) {
        const serialsList = serialsStr.split(/[;,]/).map((s) => s.trim()).filter((s) => s.length > 0);
        if (serialsList.length > 0 && appObj.deviceRegData?.particulars?.[0]) {
          appObj.deviceRegData.particulars[0].equipmentSerials = serialsList.map((sn, sIdx) => ({
            id: `s-${i}-${sIdx}`,
            serialNumber: sn,
          }));
        }
      }
    }

    if (appObj.tvroRegData) {
      appObj.tvroRegData.applicantName = displayName;
      appObj.tvroRegData.email = email;
      appObj.tvroRegData.contactNo = contactNo;
      appObj.tvroRegData.address = address;
      appObj.tvroRegData.years = years;
    }

    if (appObj.vasData) {
      appObj.vasData.businessName = displayName;
      appObj.vasData.email = email;
      appObj.vasData.contactNo = contactNo;
      appObj.vasData.address = address;
      appObj.vasData.years = years;
      const entityType = getVal("typeofentity", "entitytype", "businessentitytype");
      if (entityType) {
        appObj.vasData.serviceType = entityType as "Single Proprietorship" | "Corporation" | "Partnership" | "Others";
      }
      const cpcnNo = getVal("cpcnpacano", "cpcnlicenseno", "cpcnno", "cpcn");
      if (cpcnNo) {
        appObj.vasData.serviceNo = cpcnNo;
      }
      const cpcnExp = getVal("cpcnpacanodateofexpiry", "cpcnpacanoateofexpiry", "cpcnexpirydate", "cpcndateofexpiry", "cpcndate");
      if (cpcnExp) {
        appObj.vasData.cpcnPaCaDateOfExpiry = cpcnExp;
      }
      const corNo = getVal("corvasno", "existingcorvasno", "corno", "vasno", "certificateno", "certificatenumber");
      if (corNo) {
        appObj.vasData.certificateNumber = corNo;
      }
      const corExp = getVal("corvasnodateofexpiry", "corvasexpirydate", "corvasdateofexpiry", "vasexpirydate", "expirydate", "dateofexpiry");
      if (corExp) {
        appObj.vasData.expiryDate = corExp;
      }
      const tradeName = getVal("tradename", "othertradename", "pleasespecify");
      if (tradeName) {
        appObj.vasData.isKnownByOtherName = true;
        appObj.vasData.otherTradeName = tradeName;
      }
      const vasSvcs = getVal("valueaddedservices", "valueaddedservice", "services");
      if (vasSvcs) {
        appObj.vasData.valueAddedServices = vasSvcs.split(/[;,]/).map((s) => s.trim()).filter(Boolean);
      }
    }

    const isValid = remarks.length === 0;

    results.push({
      rowNumber: i,
      name: displayName,
      email: email || "N/A",
      status: isValid ? "Valid" : "Invalid",
      remarks,
      applicantData: appObj,
    });

    if (isValid) {
      applicants.push(appObj);
    }
  }

  const validCount = results.filter((r) => r.status === "Valid").length;
  const invalidCount = results.length - validCount;

  return {
    totalRows: results.length,
    validCount,
    invalidCount,
    results,
    applicants,
  };
}
