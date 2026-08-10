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
    const lastName = getVal("lastname", "last", "surname");
    const email = getVal("email", "emailaddress");
    const contactNo = getVal("contactnumber", "contactno", "phone", "mobile");
    const address = getVal("address", "physicaladdress", "street", "city", "province");
    const birthDate = getVal("dateofbirth", "birthdate", "dob");
    const appType = getVal("applicationtype", "apptype", "examcategory") || "NEW";
    const years = getVal("noofyears", "numberofyears", "years") || "1";
    const notes = getVal("notes", "remarks", "specialneeds") || "";

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

    const appObj: GeneralApplicantData = {
      ...initialGeneralApplicant(i),
      firstName: firstName || displayName,
      lastName: lastName,
      email: email,
      contactNo: contactNo,
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
      const serialsStr = getVal("equipmentserialnumbers", "serialnumbers", "serials");
      if (serialsStr) {
        const serialsList = serialsStr.split(/[;,]/).map((s) => s.trim()).filter((s) => s.length > 0);
        if (serialsList.length > 0 && appObj.deviceRegData.particulars[0]) {
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
