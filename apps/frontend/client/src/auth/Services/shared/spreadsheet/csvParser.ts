import { GeneralApplicantData, initialGeneralApplicant } from "../types/generalApplicantTypes";
import { NTCService } from "../../data/servicesData";
import { FormDto, FieldDto, FormSectionDto } from "../../../../shared/components/dynamic-form/dynamicFormTypes";
import {
  parseOptions,
  FormEvaluationContext,
  evaluateContextOnlyVisibility,
  isFieldContextVisible,
  isFieldRowVisible,
  extractFieldDependencyRules,
  hasExplicitVariantCondition,
} from "../../../../shared/components/dynamic-form/dynamicFormUtils";
import { isServiceVariantIndividual } from "../helpers/applicantDisplayHelper";
import {
  PHILIPPINE_REGION_OPTIONS,
  SUFFIX_DROPDOWN_OPTIONS,
} from "./spreadsheetTemplates";
import {
  isPersonalInfoSection,
  isNonInputSystemSection,
  isStandardApplicantSyncField,
  isExcludedNonEditableField,
  isObsoleteCopyOfPermitField,
  isFormFieldRepeater,
  resolveRepeaterSubColumnsForField,
  ExpandedRepeaterSubColumn,
  resolveEffectiveFieldOptions,
  isMultiSelectCheckboxField,
  cleanSectionPrefix,
} from "./formSpreadsheetHelper";

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

const MONTHS_ARRAY = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function parseFlexibleBirthDate(rawDate: string): {
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  isoDate: string;
} {
  const fallback = {
    birthYear: "2000",
    birthMonth: "January",
    birthDay: "1",
    isoDate: "2000-01-01",
  };
  if (!rawDate || !rawDate.trim()) return fallback;

  const trimmed = rawDate.trim();

  // Check YYYY-MM-DD or MM/DD/YYYY or DD/MM/YYYY
  const slashOrDashParts = trimmed.split(/[-/.]/).map((p) => p.trim());
  if (slashOrDashParts.length === 3) {
    const p0 = slashOrDashParts[0] || "";
    const p1 = slashOrDashParts[1] || "";
    const p2 = slashOrDashParts[2] || "";

    let yearNum = 2000;
    let monthIdx = 0; // 0-11
    let dayNum = 1;

    if (p0.length === 4 && /^\d{4}$/.test(p0)) {
      // YYYY-MM-DD
      yearNum = parseInt(p0, 10);
      const m = parseInt(p1, 10);
      const d = parseInt(p2, 10);
      if (!isNaN(m) && m >= 1 && m <= 12) {
        monthIdx = m - 1;
      } else {
        const matchedM = MONTHS_ARRAY.findIndex((mn) =>
          mn.toLowerCase().startsWith(p1.toLowerCase().slice(0, 3))
        );
        if (matchedM !== -1) monthIdx = matchedM;
      }
      if (!isNaN(d) && d >= 1 && d <= 31) dayNum = d;
    } else if (p2.length === 4 && /^\d{4}$/.test(p2)) {
      // MM/DD/YYYY or DD/MM/YYYY or DD-MMM-YYYY
      yearNum = parseInt(p2, 10);
      const n0 = parseInt(p0, 10);
      const n1 = parseInt(p1, 10);
      if (isNaN(n1)) {
        // DD-MMM-YYYY (e.g. 15-May-1995)
        const matchedM = MONTHS_ARRAY.findIndex((mn) =>
          mn.toLowerCase().startsWith(p1.toLowerCase().slice(0, 3))
        );
        if (matchedM !== -1) monthIdx = matchedM;
        if (!isNaN(n0) && n0 >= 1 && n0 <= 31) dayNum = n0;
      } else if (!isNaN(n0) && !isNaN(n1)) {
        if (n0 > 12 && n1 >= 1 && n1 <= 12) {
          // DD/MM/YYYY
          dayNum = Math.min(31, Math.max(1, n0));
          monthIdx = n1 - 1;
        } else {
          // MM/DD/YYYY (standard Excel US date format)
          monthIdx = Math.min(11, Math.max(0, n0 - 1));
          dayNum = Math.min(31, Math.max(1, n1));
        }
      }
    }

    const birthMonth = MONTHS_ARRAY[monthIdx] || "January";
    const birthYear = String(yearNum);
    const birthDay = String(dayNum);
    const mm = String(monthIdx + 1).padStart(2, "0");
    const dd = String(dayNum).padStart(2, "0");
    return {
      birthYear,
      birthMonth,
      birthDay,
      isoDate: `${birthYear}-${mm}-${dd}`,
    };
  }

  // Fallback Date.parse for "May 12, 1995"
  const parsedMs = Date.parse(trimmed);
  if (!isNaN(parsedMs)) {
    const dObj = new Date(parsedMs);
    const y = dObj.getFullYear();
    const m = dObj.getMonth();
    const d = dObj.getDate();
    if (y >= 1900 && y <= 2100) {
      return {
        birthYear: String(y),
        birthMonth: MONTHS_ARRAY[m] || "January",
        birthDay: String(d),
        isoDate: `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      };
    }
  }

  return fallback;
}

export function parseSpreadsheetContent(
  csvContent: string,
  service: NTCService,
  form?: FormDto | null,
  evaluationContext?: FormEvaluationContext
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

  const isIndividualService = isServiceVariantIndividual(
    service,
    undefined,
    evaluationContext?.variantId || form?.serviceVariantId,
    evaluationContext?.variantName ||
      evaluationContext?.variantDescription ||
      evaluationContext?.applicationType ||
      form?.serviceVariantName
  );
  const isCorporateService = !isIndividualService;

  const effectiveContext: FormEvaluationContext = {
    serviceCategory: evaluationContext?.serviceCategory || service.category,
    serviceTitle: evaluationContext?.serviceTitle || service.title,
    serviceName: evaluationContext?.serviceName || form?.serviceName || service.title,
    serviceCode: evaluationContext?.serviceCode || form?.serviceCode || service.code,
    applicationType: evaluationContext?.applicationType || form?.serviceVariantName,
    variantType: evaluationContext?.variantType,
    variantId: evaluationContext?.variantId || form?.serviceVariantId,
    variantName: evaluationContext?.variantName || form?.serviceVariantName,
    variantDescription:
      evaluationContext?.variantDescription ||
      evaluationContext?.variantName ||
      form?.serviceVariantName,
    elementCodes: evaluationContext?.elementCodes,
    elementNames: evaluationContext?.elementNames,
    applicantType: isIndividualService ? "individual" : "company",
    formValues: evaluationContext?.formValues,
  };

  const rawHeaders = parseCsvLine(lines[0] || "");
  const headers = rawHeaders.map((h) => normalizeHeaderKey(h));

  // Identify base applicant column indices so non-applicant fields don't accidentally bind to them
  const baseHeaderSlugs = new Set([
    "firstname",
    "middlename",
    "lastname",
    "suffix",
    "dateofbirth",
    "birthdate",
    "sex",
    "gender",
    "civilstatus",
    "nationality",
    "contactnumber",
    "email",
    "region",
    "province",
    "city",
    "citymunicipality",
    "barangay",
    "street",
    "streetaddress",
    "zipcode",
    "businessname",
    "companyname",
    "entitytype",
    "dtisecno",
    "representativefirstname",
    "representativemiddlename",
    "representativelastname",
    "representativesuffix",
    "authorizedrepresentative",
    "representativeposition",
  ]);
  const baseColIndices = new Set<number>();
  for (let h = 0; h < headers.length; h++) {
    const hKey = headers[h];
    if (hKey && baseHeaderSlugs.has(hKey)) {
      baseColIndices.add(h);
    }
  }

  // Extract any custom dropdown options configured by admin for personal info fields
  let customSexOptions: string[] | null = null;
  let customCivilStatusOptions: string[] | null = null;
  let customEntityTypeOptions: string[] | null = null;

  interface ScopedFormField {
    field: FieldDto;
    section: FormSectionDto;
    hasVariantRule: boolean;
  }

  const formFields: ScopedFormField[] = [];
  const repeaterFields: Array<{
    field: FieldDto;
    section: FormSectionDto;
    subColumns: Array<{
      subCol: ExpandedRepeaterSubColumn;
      colIndex: number;
    }>;
    directColIndex: number;
  }> = [];

  if (form && Array.isArray(form.sections)) {
    const sortedSections = [...form.sections].sort(
      (a, b) =>
        (typeof a.orderIndex === "number" ? a.orderIndex : 0) -
        (typeof b.orderIndex === "number" ? b.orderIndex : 0)
    );

    for (const sec of sortedSections) {
      if (!evaluateContextOnlyVisibility(sec.visibilityCondition, effectiveContext)) {
        continue;
      }

      // Check personal info overrides first
      for (const f of sec.fields || []) {
        if (!isFieldContextVisible(f, sec, effectiveContext)) continue;
        const opts = parseOptions(f);
        if (opts.length > 0) {
          const optLabels = opts
            .map((o) => (typeof o.label === "string" && o.label.trim().length > 0 ? o.label.trim() : o.value.trim()))
            .filter(Boolean);
          const idLower = (f.fieldId || f.id || "").toLowerCase();
          const lblSlug = normalizeHeaderKey(f.label || "");
          if (idLower.includes("sex") || idLower.includes("gender") || lblSlug === "sex" || lblSlug === "gender") {
            customSexOptions = optLabels;
          } else if (idLower.includes("civilstatus") || idLower.includes("civil_status") || lblSlug === "civilstatus") {
            customCivilStatusOptions = optLabels;
          } else if (idLower.includes("entitytype") || lblSlug === "entitytype") {
            customEntityTypeOptions = optLabels;
          }
        }
      }

      if (isPersonalInfoSection(sec) || isNonInputSystemSection(sec)) {
        continue;
      }

      const secFields = Array.isArray(sec.fields) ? sec.fields : [];
      const sortedFields = [...secFields].sort(
        (a, b) =>
          (typeof a.orderIndex === "number" ? a.orderIndex : 0) -
          (typeof b.orderIndex === "number" ? b.orderIndex : 0)
      );

      const sectionHasEquipmentRepeater = sortedFields.some(
        (f) =>
          isFormFieldRepeater(f) &&
          isFieldContextVisible(f, sec, effectiveContext) &&
          resolveRepeaterSubColumnsForField(f, effectiveContext).some(
            (sc) => sc.type === "equipments_serial" || sc.type === "serials"
          )
      );

      for (const f of sortedFields) {
        if (isExcludedNonEditableField(f)) continue;
        if (isObsoleteCopyOfPermitField(f, effectiveContext)) continue;
        if (isStandardApplicantSyncField(f, sec)) continue;

        if (typeof f.label === "string" && f.label.trim().length > 0) {
          if (!isFieldContextVisible(f, sec, effectiveContext)) {
            continue;
          }

          const fIdLower = (f.fieldId || f.id || "").toLowerCase().trim();
          if (
            sectionHasEquipmentRepeater &&
            !isFormFieldRepeater(f) &&
            (fIdLower === "fd000000-0000-0000-0000-000000000111" ||
              fIdLower === "fd000000-0000-0000-0000-000000000112" ||
              fIdLower === "fd000000-0000-0000-0000-000000000270" ||
              fIdLower === "fd000000-0000-0000-0000-000000000084" ||
              fIdLower === "fd000000-0000-0000-0000-000000000087")
          ) {
            continue;
          }

          if (isFormFieldRepeater(f)) {
            const subCols = resolveRepeaterSubColumnsForField(f, effectiveContext);
            const repeaterPrefix = cleanSectionPrefix(f.label || sec.title);
            const mappedSubCols: Array<{ subCol: ExpandedRepeaterSubColumn; colIndex: number }> = [];

            for (const subCol of subCols) {
              const rawSubNorm = normalizeHeaderKey(subCol.label);
              const qualSubNorm =
                repeaterPrefix.length > 0
                  ? normalizeHeaderKey(`${repeaterPrefix} - ${subCol.label}`)
                  : "";
              const subKeyNorm = normalizeHeaderKey(subCol.subKey);

              let subIdx = -1;
              if (qualSubNorm.length > 0) {
                subIdx = headers.findIndex((h) => h === qualSubNorm);
              }
              if (subIdx === -1 && rawSubNorm.length > 0) {
                subIdx = headers.findIndex((h, idx) => !baseColIndices.has(idx) && h === rawSubNorm);
              }
              if (subIdx === -1 && subKeyNorm.length > 0) {
                subIdx = headers.findIndex((h, idx) => !baseColIndices.has(idx) && h === subKeyNorm);
              }
              if (subIdx === -1 && rawSubNorm.length > 3) {
                subIdx = headers.findIndex(
                  (h, idx) =>
                    !baseColIndices.has(idx) &&
                    h.length > 3 &&
                    (h.includes(rawSubNorm) || rawSubNorm.includes(h))
                );
              }

              if (subIdx !== -1) {
                mappedSubCols.push({ subCol, colIndex: subIdx });
              }
            }

            const directNorm = normalizeHeaderKey(f.label);
            const directColIndex =
              directNorm.length > 0
                ? headers.findIndex((h, idx) => !baseColIndices.has(idx) && h === directNorm)
                : -1;

            repeaterFields.push({
              field: f,
              section: sec,
              subColumns: mappedSubCols,
              directColIndex,
            });
            continue;
          }

          formFields.push({
            field: f,
            section: sec,
            hasVariantRule: hasExplicitVariantCondition(f, sec),
          });
        }
      }
    }
  }

  interface HeaderFieldCandidate {
    colIndex: number;
    field: FieldDto;
    section: FormSectionDto;
    normalizedLabel: string;
    hasVariantRule: boolean;
  }

  const rawMappingsByCol = new Map<number, HeaderFieldCandidate[]>();
  const colOrder: number[] = [];

  for (const sf of formFields) {
    const f = sf.field;
    const rawLabel = typeof f.label === "string" ? f.label.trim() : "";
    const normLabel = normalizeHeaderKey(rawLabel);
    const secPrefix = cleanSectionPrefix(sf.section.title);
    const qualNormLabel =
      secPrefix.length > 0 ? normalizeHeaderKey(`${secPrefix} - ${rawLabel}`) : "";
    const normId =
      typeof f.fieldId === "string"
        ? f.fieldId.toLowerCase().replace(/[^a-z0-9]/g, "")
        : typeof f.id === "string"
        ? f.id.toLowerCase().replace(/[^a-z0-9]/g, "")
        : "";

    let foundIndex = -1;

    // 1. Prefer section-qualified header match first (e.g. "Particulars of Service Provider - Contact Number")
    if (qualNormLabel.length > 0) {
      for (let h = 0; h < headers.length; h++) {
        if (headers[h] === qualNormLabel) {
          foundIndex = h;
          break;
        }
      }
    }

    // 2. Exact match on non-base columns first
    if (foundIndex === -1) {
      for (let h = 0; h < headers.length; h++) {
        if (baseColIndices.has(h)) continue;
        const hNorm = headers[h];
        if (!hNorm) continue;
        if (hNorm === normLabel || (normId.length > 0 && hNorm === normId)) {
          foundIndex = h;
          break;
        }
      }
    }

    // 3. Partial match on non-base columns
    if (foundIndex === -1 && normLabel.length > 3) {
      for (let h = 0; h < headers.length; h++) {
        if (baseColIndices.has(h)) continue;
        const hNorm = headers[h];
        if (!hNorm || hNorm.length <= 3) continue;
        if (normLabel.includes(hNorm) || hNorm.includes(normLabel)) {
          foundIndex = h;
          break;
        }
      }
    }

    if (foundIndex !== -1) {
      const existing = rawMappingsByCol.get(foundIndex);
      const candidate: HeaderFieldCandidate = {
        colIndex: foundIndex,
        field: f,
        section: sf.section,
        normalizedLabel: normLabel,
        hasVariantRule: sf.hasVariantRule,
      };
      if (!existing) {
        rawMappingsByCol.set(foundIndex, [candidate]);
        colOrder.push(foundIndex);
      } else {
        existing.push(candidate);
      }
    }
  }

  for (const [colIdx, candidates] of rawMappingsByCol.entries()) {
    if (candidates.length > 1) {
      const variantSpecific = candidates.filter((c) => c.hasVariantRule);
      if (variantSpecific.length > 0) {
        rawMappingsByCol.set(colIdx, variantSpecific);
      }
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
      if (headerKey && rowDict[headerKey] === undefined) {
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
            if (
              dictKey.includes(normalized) ||
              (dictKey.length >= 4 && normalized.includes(dictKey))
            ) {
              if (rowDict[dictKey] !== undefined && rowDict[dictKey] !== "") {
                return rowDict[dictKey] || "";
              }
            }
          }
        }
      }
      return "";
    };

    const rawFirstName = getVal("firstname", "first", "applicantname");
    const middleName = getVal("middlename", "middle", "middleinitial", "mi");
    const lastName = getVal("lastname", "last", "surname");
    const rawSuffix = getVal("suffix", "ext", "extension");
    const email = getVal("email", "emailaddress");
    const rawContactNo = getVal("contactnumber", "contactno", "phone", "mobile", "cellphone").trim();
    const contactNo = /^9\d{9}$/.test(rawContactNo) ? `0${rawContactNo}` : rawContactNo;
    const rawBirthDate = getVal("dateofbirth", "birthdate", "dob");
    const nationality = getVal("nationality", "citizenship") || "Filipino";
    const rawRegion = getVal("region", "regionname");
    const province = getVal("province", "state");
    const city = getVal("citymunicipality", "city", "municipality");
    const barangay = getVal("barangay", "brgy", "bgy");
    const street = getVal("streetaddress", "street", "addressline1", "streetzone", "unitbldgno");
    const zipCode = getVal("zipcode", "zip", "postalcode", "postal");
    const schoolName = getVal(
      "schooluniversityattended",
      "schoolname",
      "school",
      "university",
      "schoolattended",
      "education"
    );
    const courseDegree = getVal("coursedegreeprogram", "coursedegree", "course", "degree", "program");
    const yearGraduated = getVal("yeargraduated", "graduatedyear", "graduationyear", "yeargrad");
    const specialOrderNo = getVal("specialorderno", "specialorder", "sono", "so", "specialordernumber");
    const examType =
      getVal("examtype", "examcategory", "applicationtype", "apptype", "category") ||
      "Radiotelephony";
    const selectedOption =
      getVal("selectedoption", "classelement", "elements", "element", "class", "optionclass", "radiooption") ||
      "1PHN - Elements 1, 2, 3 & 4";
    const appType = getVal("applicationtype", "apptype", "examcategory") || "NEW";
    const years = getVal("noofyears", "numberofyears", "years") || "1";
    const notes = getVal("notes", "remarks", "specialneeds", "assistance") || "";

    let repFirstName = getVal("representativefirstname", "repfirstname", "repfirst");
    let repMiddleName = getVal("representativemiddlename", "repmiddlename", "repmiddle");
    let repLastName = getVal("representativelastname", "replastname", "replast");
    const repSuffix = getVal("representativesuffix", "repsuffix");
    const rawRepFullName = getVal("authorizedrepresentative", "representativename", "representative", "repname");

    if (!repFirstName && !repLastName && rawRepFullName) {
      const nameParts = rawRepFullName.trim().split(/\s+/);
      if (nameParts.length === 1) {
        repFirstName = nameParts[0] || "";
      } else if (nameParts.length === 2) {
        repFirstName = nameParts[0] || "";
        repLastName = nameParts[1] || "";
      } else if (nameParts.length >= 3) {
        repFirstName = nameParts[0] || "";
        repMiddleName = nameParts.slice(1, -1).join(" ");
        repLastName = nameParts[nameParts.length - 1] || "";
      }
    }

    const repName =
      [repFirstName, repMiddleName, repLastName, repSuffix].filter(Boolean).join(" ") ||
      rawRepFullName;
    const repPosition = getVal("representativeposition", "designation", "position", "repposition");
    const companyName = getVal(
      "businessname",
      "companyname",
      "registeredbusinesscompanyname",
      "corporatename",
      "organizationname",
      "entityname"
    );
    const dtiSecRegistration = getVal(
      "dtisecno",
      "dtisecregistration",
      "dtisec",
      "secno",
      "dtino",
      "registrationno",
      "registrationnumber"
    );

    // Split full name if only Applicant Name was provided on an individual service
    let firstName = rawFirstName;
    let resolvedLastName = lastName;
    let resolvedMiddleName = middleName;
    if (!isCorporateService && firstName && !resolvedLastName && firstName.includes(" ")) {
      const parts = firstName.trim().split(/\s+/);
      if (parts.length === 2) {
        firstName = parts[0] || "";
        resolvedLastName = parts[1] || "";
      } else if (parts.length >= 3) {
        firstName = parts[0] || "";
        if (!resolvedMiddleName) {
          resolvedMiddleName = parts.slice(1, -1).join(" ");
        }
        resolvedLastName = parts[parts.length - 1] || "";
      }
    }

    const addressParts = [street, barangay, city, province, zipCode].filter(Boolean);
    const address =
      addressParts.length > 0 ? addressParts.join(", ") : getVal("address", "physicaladdress");

    const remarks: string[] = [];

    // Suffix normalization & validation
    let suffix = "";
    if (rawSuffix.trim().length > 0 && rawSuffix.trim().toLowerCase() !== "none") {
      const sNorm = rawSuffix.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      const matchedSuffix = SUFFIX_DROPDOWN_OPTIONS.find(
        (opt) => opt.toLowerCase().replace(/[^a-z0-9]/g, "") === sNorm
      );
      if (matchedSuffix !== undefined) {
        suffix = matchedSuffix;
      } else {
        remarks.push(
          `Invalid Suffix "${rawSuffix}". Must be one of: ${SUFFIX_DROPDOWN_OPTIONS.join(", ")}.`
        );
        suffix = rawSuffix.trim();
      }
    }

    // Region normalization & validation
    let region = rawRegion.trim();
    if (region.length > 0) {
      const rNorm = region.toLowerCase().replace(/[^a-z0-9]/g, "");
      const matchedRegion = PHILIPPINE_REGION_OPTIONS.find((opt) => {
        const optNorm = opt.toLowerCase().replace(/[^a-z0-9]/g, "");
        return optNorm === rNorm || optNorm.includes(rNorm) || rNorm.includes(optNorm);
      });
      if (matchedRegion !== undefined) {
        region = matchedRegion;
      } else {
        remarks.push(
          `Invalid Region "${rawRegion}". Please select a valid region from the dropdown list.`
        );
      }
    }

    // Sex validation
    const rawSex = getVal("sex", "gender");
    let sex = "Male";
    if (rawSex.length > 0) {
      const sLower = rawSex.trim().toLowerCase();
      if (sLower === "male" || sLower === "m") {
        sex = "Male";
      } else if (sLower === "female" || sLower === "f") {
        sex = "Female";
      } else if (customSexOptions && customSexOptions.some((o) => o.toLowerCase() === sLower)) {
        const matched = customSexOptions.find((o) => o.toLowerCase() === sLower);
        sex = matched || rawSex.trim();
      } else if (!isCorporateService) {
        remarks.push(`Invalid Sex "${rawSex}". Must strictly be either "Male" or "Female".`);
        sex = rawSex;
      }
    }

    // Civil Status validation
    const rawCivilStatus = getVal("civilstatus", "maritalstatus");
    const allowedCivilStatuses =
      customCivilStatusOptions && customCivilStatusOptions.length > 0
        ? customCivilStatusOptions
        : ["Single", "Married", "Widowed", "Separated"];
    let civilStatus = "Single";
    if (rawCivilStatus.length > 0) {
      const csNorm = rawCivilStatus.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      const matchedCs = allowedCivilStatuses.find(
        (cs) => cs.toLowerCase().replace(/[^a-z0-9]/g, "") === csNorm
      );
      if (matchedCs !== undefined) {
        civilStatus = matchedCs;
      } else if (!isCorporateService) {
        remarks.push(
          `Invalid Civil Status "${rawCivilStatus}". Must be one of: ${allowedCivilStatuses.join(", ")}.`
        );
        civilStatus = rawCivilStatus.trim();
      }
    }

    const isExamService =
      (service.code || "").toUpperCase() === "NTC_1_01" ||
      (service.title || "").toUpperCase().includes("EXAM") ||
      (service.title || "").toUpperCase().includes("RADIO OPERATOR EXAM");

    const validExamineeTypes = ["First Taker", "Retaker", "Upgrade", "Removal"];
    const rawExamineeType = getVal("examineetype", "takertype", "applicantcategory");
    let examineeType = "First Taker";
    if (rawExamineeType.length > 0) {
      const normExaminee = rawExamineeType.toLowerCase().replace(/[^a-z0-9]/g, "");
      const matchedExaminee = validExamineeTypes.find(
        (t) => t.toLowerCase().replace(/[^a-z0-9]/g, "") === normExaminee
      );
      if (matchedExaminee !== undefined) {
        examineeType = matchedExaminee;
      } else {
        examineeType = rawExamineeType.trim();
      }
    }

    const isComp = isCorporateService;

    const validEntityTypes =
      customEntityTypeOptions && customEntityTypeOptions.length > 0
        ? customEntityTypeOptions
        : [
            "Corporation",
            "Single Proprietorship",
            "Partnership",
            "Government",
            "Cooperative",
            "Association",
            "Non-Profit",
            "Others",
          ];
    const rawEntityType = getVal("entitytype", "businesstype", "companytype");
    if (rawEntityType.length > 0 && isComp) {
      const normEntity = rawEntityType.toLowerCase().replace(/[^a-z0-9]/g, "");
      const matchedEntity = validEntityTypes.find(
        (t) => t.toLowerCase().replace(/[^a-z0-9]/g, "") === normEntity
      );
      if (matchedEntity === undefined) {
        remarks.push(
          `Invalid Entity Type "${rawEntityType}". Must strictly match one of: ${validEntityTypes.join(", ")}.`
        );
      }
    }

    if (isComp) {
      if (!companyName && !firstName) {
        remarks.push("Business / Company Name is required.");
      }
    } else {
      if (!firstName && !resolvedLastName) {
        remarks.push("First Name and Last Name are required.");
      } else {
        if (!firstName) remarks.push("First Name is required.");
        if (!resolvedLastName) remarks.push("Last Name is required.");
      }
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
      if (!province) remarks.push("Province is required.");
      if (!city) remarks.push("City / Municipality is required.");
      if (!barangay) remarks.push("Barangay is required.");
      if (!street && !address) remarks.push("Street address is required.");
      if (!schoolName) remarks.push("School / University Attended is required.");
      if (!courseDegree) remarks.push("Course / Degree Program is required.");
      if (!yearGraduated) remarks.push("Year Graduated is required.");
    }

    const displayName = isComp
      ? companyName || firstName || `Row ${i} Company`
      : [firstName, resolvedMiddleName, resolvedLastName, suffix].filter(Boolean).join(" ") ||
        `Row ${i} Applicant`;

    const { birthYear, birthMonth, birthDay, isoDate } = parseFlexibleBirthDate(rawBirthDate);

    const appObj: GeneralApplicantData = {
      ...initialGeneralApplicant(i),
      applicantType: isComp ? "company" : "individual",
      companyName: isComp ? companyName || firstName || displayName : "",
      representativeFirstName: repFirstName,
      representativeMiddleName: repMiddleName,
      representativeLastName: repLastName,
      representativeSuffix: repSuffix,
      representativeName: repName,
      representativePosition: repPosition,
      dtiSecRegistration: dtiSecRegistration,
      firstName: isComp ? "" : firstName,
      middleName: isComp ? "" : resolvedMiddleName,
      lastName: isComp ? "" : resolvedLastName,
      suffix: isComp ? "" : suffix,
      email: email,
      contactNo: contactNo,
      sex: sex,
      civilStatus: civilStatus,
      nationality: nationality,
      region: region,
      province: province,
      city: city,
      barangay: barangay,
      street: street || address,
      zipCode: zipCode,
      schoolName: schoolName,
      courseDegree: courseDegree,
      yearGraduated: yearGraduated,
      specialOrderNo: specialOrderNo,
      examType: examType,
      examineeType: examineeType,
      selectedOption: selectedOption,
      address: address || street,
      birthMonth,
      birthDay,
      birthYear,
      birthDate: isoDate,
      notes: notes,
    };

    // Build row-level formValues dictionary for evaluating inter-field visibility conditions
    const rowFormValues: Record<string, string> = { ...rowDict };
    for (let h = 0; h < rawHeaders.length && h < cols.length; h++) {
      const rawH = rawHeaders[h];
      const cellV = cols[h] || "";
      if (rawH) {
        rowFormValues[rawH] = cellV;
        rowFormValues[rawH.toLowerCase().trim()] = cellV;
        const baseHeader = rawH.replace(/\s*\([^)]*\)/g, "").trim();
        if (baseHeader) {
          rowFormValues[baseHeader] = cellV;
          rowFormValues[baseHeader.toLowerCase()] = cellV;
        }
      }
    }
    for (const colIdx of colOrder) {
      const candidates = rawMappingsByCol.get(colIdx) || [];
      const cellV = (cols[colIdx] || "").trim();
      for (const c of candidates) {
        if (c.field.fieldId) rowFormValues[c.field.fieldId] = cellV;
        if (c.field.id) rowFormValues[c.field.id] = cellV;
        if (c.field.label) {
          rowFormValues[c.field.label] = cellV;
          rowFormValues[c.field.label.toLowerCase().trim()] = cellV;
        }
      }
    }

    const rowContext: FormEvaluationContext = {
      ...effectiveContext,
      applicantType: isComp ? "company" : "individual",
      formValues: rowFormValues,
    };

    const dynamicFieldValues: Array<{ fieldId: string; fieldLabel: string; value: string }> = [];

    // 1. Parse non-repeater Form Builder fields
    for (const colIdx of colOrder) {
      const candidates = rawMappingsByCol.get(colIdx);
      if (!candidates || candidates.length === 0) continue;

      const cellRaw = cols[colIdx];
      let cellVal = typeof cellRaw === "string" ? cellRaw.trim() : "";

      const visibleCandidates = candidates.filter((c) =>
        isFieldRowVisible(c.field, c.section, rowContext)
      );

      if (visibleCandidates.length === 0) {
        continue;
      }

      const activeMapping =
        visibleCandidates.find(
          (c) => extractFieldDependencyRules(c.field, c.section).length > 0
        ) || visibleCandidates[0];
      if (!activeMapping) continue;

      const fieldId =
        typeof activeMapping.field.fieldId === "string" &&
        activeMapping.field.fieldId.trim().length > 0
          ? activeMapping.field.fieldId.trim()
          : typeof activeMapping.field.id === "string" &&
            activeMapping.field.id.trim().length > 0
          ? activeMapping.field.id.trim()
          : `field-${activeMapping.normalizedLabel}`;

      const fieldLabel =
        typeof activeMapping.field.label === "string" &&
        activeMapping.field.label.trim().length > 0
          ? activeMapping.field.label.trim()
          : activeMapping.normalizedLabel;

      if (cellVal.length > 0) {
        const fieldOptions: Array<{ label: string; value: string }> = [];
        for (const vc of visibleCandidates) {
          for (const opt of resolveEffectiveFieldOptions(vc.field, rowContext, rowFormValues)) {
            const exists = fieldOptions.some(
              (existing) => existing.label === opt.label && existing.value === opt.value
            );
            if (!exists) {
              fieldOptions.push(opt);
            }
          }
        }

        if (fieldOptions.length > 0) {
          if (isMultiSelectCheckboxField(activeMapping.field)) {
            // Multi-select checkbox group (e.g. Intended Use, VAS Services, Nature of Complaint)
            const parts = cellVal
              .split(/[;,]/)
              .map((s) => s.trim())
              .filter(Boolean);
            const normalizedSelected: string[] = [];
            for (const part of parts) {
              const normPart = part.toLowerCase().replace(/[^a-z0-9]/g, "");
              const matchedOpt = fieldOptions.find((opt) => {
                const oLbl = (opt.label || "").trim();
                const oVal = (opt.value || "").trim();
                return (
                  normPart === oLbl.toLowerCase().replace(/[^a-z0-9]/g, "") ||
                  normPart === oVal.toLowerCase().replace(/[^a-z0-9]/g, "") ||
                  part.toLowerCase().startsWith("storage at") ||
                  part.toLowerCase().startsWith("others")
                );
              });
              if (matchedOpt) {
                normalizedSelected.push(
                  part.toLowerCase().startsWith("storage at:") ||
                    part.toLowerCase().startsWith("others:")
                    ? part
                    : matchedOpt.label || matchedOpt.value
                );
              } else {
                normalizedSelected.push(part);
              }
            }
            cellVal = normalizedSelected.join(", ");
          } else {
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
              cellVal =
                typeof matchedOpt.value === "string" && matchedOpt.value.trim().length > 0
                  ? matchedOpt.value.trim()
                  : typeof matchedOpt.label === "string" && matchedOpt.label.trim().length > 0
                  ? matchedOpt.label.trim()
                  : cellVal;
              rowFormValues[fieldId] = cellVal;
              rowFormValues[fieldLabel] = cellVal;
              rowFormValues[fieldLabel.toLowerCase()] = cellVal;
            } else {
              const allowedLabels = fieldOptions
                .map((o) => (typeof o.label === "string" && o.label.length > 0 ? o.label : o.value))
                .filter(Boolean)
                .join(", ");
              remarks.push(
                `Invalid value "${cellVal}" for "${fieldLabel}". Must strictly match one of the allowed options: ${allowedLabels}.`
              );
            }
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
        }
      }

      const isMandatory = visibleCandidates.some((vc) => vc.field.isRequired === true);
      if (isMandatory && cellVal.length === 0) {
        remarks.push(`${fieldLabel} is required.`);
      }
    }

    // 2. Parse Repeater Form Builder fields from their expanded sub-columns
    for (const rep of repeaterFields) {
      if (!isFieldRowVisible(rep.field, rep.section, rowContext)) {
        continue;
      }

      const fieldId =
        typeof rep.field.fieldId === "string" && rep.field.fieldId.trim().length > 0
          ? rep.field.fieldId.trim()
          : typeof rep.field.id === "string" && rep.field.id.trim().length > 0
          ? rep.field.id.trim()
          : `repeater-${normalizeHeaderKey(rep.field.label || "")}`;
      const fieldLabel = (rep.field.label || "Particulars").trim();

      if (rep.subColumns.length > 0) {
        const repeaterRowObj: Record<string, string> = {
          _id: `row-${i}-1`,
        };
        let eqSerial = "";
        let eqFrequency = "";
        let hasAnySubVal = false;

        for (const { subCol, colIndex } of rep.subColumns) {
          const rawSubVal = cols[colIndex];
          let subVal = typeof rawSubVal === "string" ? rawSubVal.trim() : "";

          if (subVal.length > 0) {
            hasAnySubVal = true;

            if (subCol.options && subCol.options.length > 0) {
              const normSub = subVal.toLowerCase().replace(/[^a-z0-9]/g, "");
              const matchedOpt = subCol.options.find(
                (o) =>
                  (o.label || "").toLowerCase().replace(/[^a-z0-9]/g, "") === normSub ||
                  (o.value || "").toLowerCase().replace(/[^a-z0-9]/g, "") === normSub
              );
              if (matchedOpt) {
                subVal = matchedOpt.value || matchedOpt.label || subVal;
              } else {
                const allowed = subCol.options.map((o) => o.label || o.value).join(", ");
                remarks.push(
                  `Invalid value "${subVal}" for "${subCol.label}". Allowed options: ${allowed}.`
                );
              }
            }
          } else if (rep.field.isRequired && subCol.required) {
            remarks.push(`${subCol.label} is required.`);
          }

          if (subCol.type === "equipments_serial") {
            eqSerial = subVal;
            repeaterRowObj.serialNumber = subVal;
          } else if (subCol.type === "equipments_frequency") {
            eqFrequency = subVal;
            repeaterRowObj.frequency = subVal;
            repeaterRowObj.frequencyRange = subVal;
          } else if (subCol.type === "serials") {
            const serialParts = subVal
              .split(/[;,]/)
              .map((s) => s.trim())
              .filter(Boolean);
            const serialEntries =
              serialParts.length > 0
                ? serialParts.map((s, sIdx) => ({ id: `serial-${i}-${sIdx}`, serialNumber: s }))
                : [{ id: `serial-${i}-0`, serialNumber: "" }];
            const serializedSerials = JSON.stringify(serialEntries);
            repeaterRowObj[subCol.subKey] = serializedSerials;
            repeaterRowObj.equipmentSerials = serializedSerials;
            repeaterRowObj.serialNumbers = serializedSerials;
            repeaterRowObj.serialNumber = serialParts.join(", ");
          } else {
            repeaterRowObj[subCol.subKey] = subVal;
            if (subCol.subKey === "deviceType") {
              repeaterRowObj.typeOfEquipmentDevice = subVal;
            } else if (subCol.subKey === "makeTypeModel") {
              repeaterRowObj.nameTypeModel = subVal;
            } else if (subCol.subKey === "stationClass") {
              repeaterRowObj.classOfStation = subVal;
            } else if (subCol.subKey === "classOfStation") {
              repeaterRowObj.stationClass = subVal;
            }
          }
        }

        if (
          rep.subColumns.some(
            (sc) =>
              sc.subCol.type === "equipments_serial" ||
              sc.subCol.type === "equipments_frequency"
          )
        ) {
          const serialList = eqSerial
            .split(/[;,]/)
            .map((s) => s.trim())
            .filter(Boolean);
          const freqList = eqFrequency
            .split(/[;,]/)
            .map((s) => s.trim())
            .filter(Boolean);
          const maxUnits = Math.max(serialList.length, freqList.length, 1);
          const units = Array.from({ length: maxUnits }, (_, uIdx) => ({
            id: `eq-${i}-${uIdx + 1}`,
            serialNumber: serialList[uIdx] || serialList[0] || "",
            frequency: freqList[uIdx] || freqList[0] || "",
          }));
          repeaterRowObj.equipments = JSON.stringify(units);
        }

        if (hasAnySubVal) {
          dynamicFieldValues.push({
            fieldId,
            fieldLabel,
            value: JSON.stringify([repeaterRowObj]),
          });
        }
      } else if (rep.directColIndex !== -1) {
        const rawDirect = (cols[rep.directColIndex] || "").trim();
        if (rawDirect.length > 0) {
          dynamicFieldValues.push({
            fieldId,
            fieldLabel,
            value: rawDirect,
          });
        } else if (rep.field.isRequired) {
          remarks.push(`${fieldLabel} is required.`);
        }
      }
    }

    // Pre-fill educational fields into dynamicFieldValues if parsed from standard columns and not already added
    if (
      appObj.schoolName &&
      !dynamicFieldValues.some((fv) => fv.fieldLabel.toLowerCase().includes("school"))
    ) {
      dynamicFieldValues.push({
        fieldId: "fd000000-0000-0000-0000-000000000061",
        fieldLabel: "School / University Attended",
        value: appObj.schoolName,
      });
    }
    if (
      appObj.courseDegree &&
      !dynamicFieldValues.some((fv) => fv.fieldLabel.toLowerCase().includes("course"))
    ) {
      dynamicFieldValues.push({
        fieldId: "fd000000-0000-0000-0000-000000000062",
        fieldLabel: "Course / Degree Program",
        value: appObj.courseDegree,
      });
    }
    if (
      appObj.yearGraduated &&
      !dynamicFieldValues.some((fv) => fv.fieldLabel.toLowerCase().includes("graduated"))
    ) {
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
      appObj.radioCertData.appType =
        appType.toUpperCase() === "RENEWAL"
          ? "RENEWAL"
          : appType.toUpperCase() === "MODIFICATION"
          ? "MODIFICATION"
          : "NEW";
      appObj.radioCertData.years = years;
    }

    if (appObj.deviceRegData) {
      appObj.deviceRegData.businessName = displayName;
      appObj.deviceRegData.email = email;
      appObj.deviceRegData.contactNo = contactNo;
      appObj.deviceRegData.address = address;
      const regType = getVal("registrationtype", "regtype", "dealerornondealer");
      if (regType) {
        appObj.deviceRegData.registrationType = regType.toLowerCase().includes("non")
          ? "Non-Dealers"
          : "Dealers";
      }
      const invNo = getVal(
        "invoicenumber",
        "invoiceno",
        "commercialinvoiceno",
        "commercialinvoicenumber",
        "invoice"
      );
      if (invNo) {
        appObj.deviceRegData.invoiceNo = invNo;
      }
      const serialsStr = getVal("equipmentserialnumbers", "serialnumbers", "serials");
      if (serialsStr) {
        const serialsList = serialsStr
          .split(/[;,]/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
        if (serialsList.length > 0 && appObj.deviceRegData?.particulars?.[0]) {
          appObj.deviceRegData.particulars[0].equipmentSerials = serialsList.map(
            (sn, sIdx) => ({
              id: `s-${i}-${sIdx}`,
              serialNumber: sn,
            })
          );
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
      if (
        entityType === "Single Proprietorship" ||
        entityType === "Corporation" ||
        entityType === "Partnership" ||
        entityType === "Others"
      ) {
        appObj.vasData.serviceType = entityType;
      }
      const cpcnNo = getVal("cpcnpacano", "cpcnlicenseno", "cpcnno", "cpcn");
      if (cpcnNo) {
        appObj.vasData.serviceNo = cpcnNo;
      }
      const cpcnExp = getVal(
        "cpcnpacanodateofexpiry",
        "cpcnpacanoateofexpiry",
        "cpcnexpirydate",
        "cpcndateofexpiry",
        "cpcndate"
      );
      if (cpcnExp) {
        appObj.vasData.cpcnPaCaDateOfExpiry = cpcnExp;
      }
      const corNo = getVal(
        "corvasno",
        "existingcorvasno",
        "corno",
        "vasno",
        "certificateno",
        "certificatenumber"
      );
      if (corNo) {
        appObj.vasData.certificateNumber = corNo;
      }
      const corExp = getVal(
        "corvasnodateofexpiry",
        "corvasexpirydate",
        "corvasdateofexpiry",
        "vasexpirydate",
        "expirydate",
        "dateofexpiry"
      );
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
        appObj.vasData.valueAddedServices = vasSvcs
          .split(/[;,]/)
          .map((s) => s.trim())
          .filter(Boolean);
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
