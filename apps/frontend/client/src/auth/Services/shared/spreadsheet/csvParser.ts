import { GeneralApplicantData, initialGeneralApplicant } from "../hooks/useGeneralServiceWizard";
import { NTCService } from "../../data/servicesData";

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
  service: NTCService
): CsvParseResult {
  const lines = csvContent
    .split(/\r\n|\n|\r/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

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
  const headers = rawHeaders.map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));

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
        const normalized = k.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (rowDict[normalized] !== undefined && rowDict[normalized] !== "") {
          return rowDict[normalized] || "";
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
    const sex = getVal("sex", "gender") || "Male";
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
    const examineeType = getVal("examineetype", "takertype", "applicantcategory") || "First Taker";
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

    const isExamService = (service.code || "").toUpperCase() === "NTC_1_01" ||
      (service.title || "").toUpperCase().includes("EXAM") ||
      (service.title || "").toUpperCase().includes("RADIO OPERATOR");

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

    const isValid = remarks.length === 0;
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

    const isComp = applicantTypeVal.toLowerCase().includes("comp") || applicantTypeVal.toLowerCase().includes("org") || Boolean(companyName);

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

    results.push({
      rowNumber: i,
      name: displayName,
      email: email || "N/A",
      status: isValid ? "Valid" : "Invalid",
      remarks,
      applicantData: appObj,
    });

    applicants.push(appObj);
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
