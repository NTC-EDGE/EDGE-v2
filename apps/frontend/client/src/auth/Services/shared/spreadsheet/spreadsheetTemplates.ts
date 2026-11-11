import { NTCService } from "../../data/servicesData";
import { FormDto, FieldDto } from "../../../../shared/components/dynamic-form/dynamicFormTypes";
import { parseOptions } from "../../../../shared/components/dynamic-form/dynamicFormUtils";

export interface DropdownFieldValidation {
  fieldId?: string;
  header: string;
  label: string;
  allowedOptions: string[];
}

export interface SpreadsheetTemplateConfig {
  filename: string;
  headers: string[];
  sampleRows: string[][];
  description: string;
  dropdownValidations?: DropdownFieldValidation[];
}

export function normalizeHeaderSlug(raw: string): string {
  if (!raw || typeof raw !== "string") return "";
  return raw
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/\s*\[[^\]]*\]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function enrichStaticTemplate(config: SpreadsheetTemplateConfig): SpreadsheetTemplateConfig {
  if (config.dropdownValidations && config.dropdownValidations.length > 0) {
    return config;
  }

  const dropdowns: DropdownFieldValidation[] = [];
  const knownDropdowns: Record<string, { label: string; options: string[] }> = {
    sex: { label: "Sex", options: ["Male", "Female"] },
    gender: { label: "Sex", options: ["Male", "Female"] },
    entitytype: {
      label: "Entity Type",
      options: [
        "Corporation",
        "Single Proprietorship",
        "Partnership",
        "Government",
        "Cooperative",
        "Association",
        "Non-Profit",
      ],
    },
    examineetype: {
      label: "Examinee Type",
      options: ["First Taker", "Retaker", "Upgrade", "Removal"],
    },
    applicationtype: {
      label: "Application Type",
      options: ["NEW", "RENEWAL", "MODIFICATION"],
    },
    variation: {
      label: "Variation",
      options: ["Mobile", "Non-Mobile"],
    },
    registrationtype: {
      label: "Registration Type",
      options: ["Dealers", "Non-Dealers"],
    },
  };

  for (const h of config.headers) {
    const slug = normalizeHeaderSlug(h);
    const match = knownDropdowns[slug];
    if (match) {
      dropdowns.push({
        header: h,
        label: match.label,
        allowedOptions: match.options,
      });
    }
  }

  return {
    ...config,
    dropdownValidations: dropdowns,
  };
}

function generateSampleValueForField(field: FieldDto, rowIndex: number): string {
  const lbl = typeof field.label === "string" ? field.label.toLowerCase() : "";
  const fType = typeof field.type === "string" ? field.type.toLowerCase() : "";

  // If select, dropdown, or radio with options, pick one of the options
  const parsed = parseOptions(field);
  if (parsed.length > 0) {
    const opt = parsed[rowIndex % parsed.length];
    if (opt !== undefined && opt !== null) {
      if (typeof opt.label === "string" && opt.label.length > 0) {
        return opt.label;
      }
      if (typeof opt.value === "string" && opt.value.length > 0) {
        return opt.value;
      }
    }
  }

  if (fType === "date") {
    return rowIndex === 0 ? "2026-12-31" : "2027-06-30";
  }
  if (fType === "number" || fType === "integer") {
    return rowIndex === 0 ? "1" : "2";
  }
  if (fType === "email") {
    return rowIndex === 0 ? "engineer1@example.ph" : "technician2@example.ph";
  }
  if (fType === "tel" || fType === "phone" || lbl.includes("contact") || lbl.includes("mobile") || lbl.includes("phone")) {
    return rowIndex === 0 ? "09171234567" : "09189876543";
  }
  if (fType === "checkbox" || fType === "boolean") {
    return rowIndex === 0 ? "Yes" : "No";
  }

  // Smart label keyword matching
  if (lbl.includes("engineer") || lbl.includes("supervisor")) {
    return rowIndex === 0 ? "Engr. Roberto Dela Cruz" : "Engr. Maria Santos";
  }
  if (lbl.includes("technician")) {
    return rowIndex === 0 ? "Juan Santos" : "Pedro Reyes";
  }
  if (lbl.includes("ece") || (lbl.includes("license") && lbl.includes("no"))) {
    return rowIndex === 0 ? "PECE-0012948" : "PECE-0044912";
  }
  if (lbl.includes("call sign") || lbl.includes("callsign")) {
    return rowIndex === 0 ? "DX1ABC" : "DW1XYZ";
  }
  if (lbl.includes("power") || lbl.includes("watt")) {
    return rowIndex === 0 ? "100W" : "50W";
  }
  if (lbl.includes("school") || lbl.includes("university")) {
    return rowIndex === 0 ? "University of the Philippines" : "Polytechnic University of the Philippines";
  }
  if (lbl.includes("course") || lbl.includes("degree")) {
    return rowIndex === 0 ? "BS Electronics Engineering" : "BS Information Technology";
  }
  if (lbl.includes("graduat")) {
    return rowIndex === 0 ? "2022" : "2020";
  }
  if (lbl.includes("special order") || lbl.includes("so no")) {
    return rowIndex === 0 ? "SO-2022-00412" : "SO-2020-00891";
  }
  if (lbl.includes("vessel") || lbl.includes("ship")) {
    return rowIndex === 0 ? "MV Emerald Sea" : "MV Pacific Star";
  }
  if (lbl.includes("serial")) {
    return rowIndex === 0 ? "SN-849201" : "SN-849202";
  }
  if (lbl.includes("model")) {
    return rowIndex === 0 ? "TX-5000" : "RX-200";
  }
  if (lbl.includes("brand") || lbl.includes("manufacturer")) {
    return rowIndex === 0 ? "Motorola" : "Icom";
  }
  if (lbl.includes("frequency")) {
    return rowIndex === 0 ? "144.000 MHz" : "430.000 MHz";
  }
  if (lbl.includes("year")) {
    return rowIndex === 0 ? "1" : "3";
  }

  const baseLabel = typeof field.label === "string" && field.label.trim().length > 0 ? field.label.trim() : "Field";
  return rowIndex === 0 ? `Sample ${baseLabel}` : `Example ${baseLabel}`;
}

export function buildDynamicSpreadsheetTemplate(
  service: NTCService,
  form: FormDto
): SpreadsheetTemplateConfig | null {
  if (!Array.isArray(form.sections) || form.sections.length === 0) {
    return null;
  }

  const excludedTypes = new Set([
    "file",
    "upload",
    "attachment",
    "document",
    "signature",
    "header",
    "divider",
    "button",
    "label_only",
    "static_text",
  ]);

  const sortedSections = [...form.sections].sort(
    (a, b) => (typeof a.orderIndex === "number" ? a.orderIndex : 0) - (typeof b.orderIndex === "number" ? b.orderIndex : 0)
  );

  const dynamicFields: FieldDto[] = [];
  const seenDynamicLabels = new Set<string>();

  for (const sec of sortedSections) {
    const secKey = typeof sec.key === "string" ? sec.key.toLowerCase() : "";
    const secTitle = typeof sec.title === "string" ? sec.title.toLowerCase() : "";
    if (
      secKey.includes("upload") ||
      secKey.includes("document") ||
      secKey.includes("file") ||
      secKey.includes("signature") ||
      secTitle.includes("upload") ||
      secTitle.includes("document") ||
      secTitle.includes("signature")
    ) {
      continue;
    }

    const fields = Array.isArray(sec.fields) ? sec.fields : [];
    const sortedFields = [...fields].sort(
      (a, b) => (typeof a.orderIndex === "number" ? a.orderIndex : 0) - (typeof b.orderIndex === "number" ? b.orderIndex : 0)
    );

    for (const f of sortedFields) {
      const fType = typeof f.type === "string" ? f.type.toLowerCase().trim() : "";
      if (excludedTypes.has(fType)) continue;

      const fLabel = typeof f.label === "string" ? f.label.trim() : "";
      if (fLabel.length === 0) continue;

      const norm = fLabel.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!seenDynamicLabels.has(norm)) {
        seenDynamicLabels.add(norm);
        dynamicFields.push(f);
      }
    }
  }

  if (dynamicFields.length === 0) {
    return null;
  }

  const code = typeof service.code === "string" ? service.code.toUpperCase() : "";
  const title = typeof service.title === "string" ? service.title.toUpperCase() : "";
  const cat = typeof service.category === "string" ? service.category.toUpperCase() : "";

  const isCorporateService =
    code === "NTC_1_18" ||
    title.includes("CUSTOMER PREMISES") ||
    title.includes("ACCREDITATION") ||
    title.includes("VALUE-ADDED") ||
    title.includes("VAS") ||
    title.includes("DEALER") ||
    title.includes("MANUFACTURER") ||
    cat.includes("ACCREDIT");

  const baseCols: Array<{ header: string; sample1: string; sample2: string }> = isCorporateService
    ? [
        { header: "Business Name", sample1: "Acme Communications Corp.", sample2: "Metro Radio Supplies" },
        { header: "Entity Type", sample1: "Corporation", sample2: "Single Proprietorship" },
        { header: "DTI/SEC No", sample1: "SEC-CS202100982", sample2: "DTI-0981284" },
        { header: "Contact Number", sample1: "09171234567", sample2: "09189876543" },
        { header: "Email", sample1: "regulatory@acme.ph", sample2: "sales@metroradio.ph" },
        { header: "Province", sample1: "Metro Manila", sample2: "Cebu" },
        { header: "City", sample1: "Quezon City", sample2: "Cebu City" },
        { header: "Barangay", sample1: "Diliman", sample2: "Mabolo" },
        { header: "Street", sample1: "Commonwealth Ave", sample2: "MJ Cuenco Ave" },
        { header: "Zip Code", sample1: "1101", sample2: "6000" },
        { header: "Authorized Representative", sample1: "Juan Dela Cruz", sample2: "Maria Santos" },
        { header: "Representative Position", sample1: "Managing Director", sample2: "General Manager" },
      ]
    : [
        { header: "First Name", sample1: "Juan", sample2: "Maria" },
        { header: "Middle Name", sample1: "Reyes", sample2: "Santos" },
        { header: "Last Name", sample1: "Dela Cruz", sample2: "Aquino" },
        { header: "Suffix", sample1: "", sample2: "Jr." },
        { header: "Date of Birth", sample1: "1995-05-12", sample2: "1998-11-20" },
        { header: "Sex", sample1: "Male", sample2: "Female" },
        { header: "Nationality", sample1: "Filipino", sample2: "Filipino" },
        { header: "Contact Number", sample1: "09171234567", sample2: "09189876543" },
        { header: "Email", sample1: "juan.delacruz@example.ph", sample2: "maria.aquino@example.ph" },
        { header: "Province", sample1: "Metro Manila", sample2: "Cebu" },
        { header: "City", sample1: "Quezon City", sample2: "Cebu City" },
        { header: "Barangay", sample1: "Diliman", sample2: "Mabolo" },
        { header: "Street", sample1: "Commonwealth Ave", sample2: "MJ Cuenco Ave" },
        { header: "Zip Code", sample1: "1101", sample2: "6000" },
      ];

  const headers: string[] = [];
  const sampleRow1: string[] = [];
  const sampleRow2: string[] = [];
  const seenHeaderSlugs = new Set<string>();

  for (const base of baseCols) {
    const slug = normalizeHeaderSlug(base.header);
    headers.push(base.header);
    sampleRow1.push(base.sample1);
    sampleRow2.push(base.sample2);
    seenHeaderSlugs.add(slug);
  }

  const isExamService =
    code === "NTC_1_01" ||
    title.includes("RADIO OPERATOR EXAM") ||
    title.includes("EXAMINATION");

  const dropdownValidations: DropdownFieldValidation[] = [];

  if (!isCorporateService) {
    dropdownValidations.push({
      header: "Sex",
      label: "Sex",
      allowedOptions: ["Male", "Female"],
    });
  }

  if (isCorporateService) {
    dropdownValidations.push({
      header: "Entity Type",
      label: "Entity Type",
      allowedOptions: [
        "Corporation",
        "Single Proprietorship",
        "Partnership",
        "Government",
        "Cooperative",
        "Association",
        "Non-Profit",
      ],
    });
  }

  if (isExamService) {
    dropdownValidations.push({
      header: "Examinee Type",
      label: "Examinee Type",
      allowedOptions: ["First Taker", "Retaker", "Upgrade", "Removal"],
    });
  }

  for (const f of dynamicFields) {
    const rawLabel = typeof f.label === "string" ? f.label.trim() : "";
    const slug = normalizeHeaderSlug(rawLabel);

    if (seenHeaderSlugs.has(slug)) {
      continue;
    }

    seenHeaderSlugs.add(slug);

    const opts = parseOptions(f);
    let headerText = rawLabel;
    if (opts.length > 0) {
      const optLabels: string[] = [];
      for (const opt of opts) {
        const oLabel = typeof opt.label === "string" && opt.label.trim().length > 0
          ? opt.label.trim()
          : (typeof opt.value === "string" ? opt.value.trim() : "");
        if (oLabel.length > 0 && !optLabels.includes(oLabel)) {
          optLabels.push(oLabel);
        }
      }

      if (optLabels.length > 0) {
        dropdownValidations.push({
          fieldId: typeof f.fieldId === "string" ? f.fieldId : f.id,
          header: rawLabel,
          label: rawLabel,
          allowedOptions: optLabels,
        });

        if (optLabels.length <= 5) {
          headerText = `${rawLabel} (${optLabels.join(" | ")})`;
        } else {
          headerText = `${rawLabel} (Options: ${optLabels.slice(0, 3).join(" | ")} | ...)`;
        }
      }
    }

    headers.push(headerText);
    sampleRow1.push(generateSampleValueForField(f, 0));
    sampleRow2.push(generateSampleValueForField(f, 1));
  }

  const rawFilename = (code || title || "NTC_Service").replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `${rawFilename}_Bulk_Template.csv`;

  return {
    filename,
    headers,
    sampleRows: [sampleRow1, sampleRow2],
    description: `Official batch filing template for ${service.title || "NTC Service"} generated dynamically from configured Form Builder fields.`,
    dropdownValidations,
  };
}

function getStaticSpreadsheetTemplateForService(service: NTCService): SpreadsheetTemplateConfig {
  const code = (service.code || "").toUpperCase();
  const title = (service.title || "").toUpperCase();

  // 1. CPE Supplier Accreditation (NTC 1-18)
  if (code === "NTC_1_18" || title.includes("CUSTOMER PREMISES") || title.includes("ACCREDITATION")) {
    return {
      filename: "NTC_CPE_Supplier_Accreditation_Template.csv",
      headers: [
        "Business Name",
        "Entity Type",
        "DTI/SEC No",
        "Contact Number",
        "Email",
        "Province",
        "City",
        "Barangay",
        "Street",
        "Zone",
        "Unit/Bldg No",
        "Zip Code",
        "No of Years",
        "Variation",
        "Application Type",
        "Accreditation No",
        "Supervising Engineer Name",
        "ECE License No",
        "Radio Technician Name",
        "Technician License No",
      ],
      sampleRows: [
        [
          "Acme Communications Corp.",
          "Corporation",
          "SEC-CS202100982",
          "09171234567",
          "regulatory@acme.ph",
          "Metro Manila",
          "Quezon City",
          "Diliman",
          "Commonwealth Ave",
          "Zone 1",
          "Unit 402",
          "1101",
          "3",
          "Mobile",
          "NEW",
          "",
          "Engr. Roberto Dela Cruz",
          "PECE-0012948",
          "Juan Santos",
          "ECT-009812",
        ],
        [
          "Metro Radio Supplies",
          "Single Proprietorship",
          "DTI-0981284",
          "09189876543",
          "sales@metroradio.ph",
          "Cebu",
          "Cebu City",
          "Mabolo",
          "MJ Cuenco Ave",
          "Zone 2",
          "Bldg A",
          "6000",
          "1",
          "Non-Mobile",
          "RENEWAL",
          "CPE-2023-00481",
          "Engr. Maria Santos",
          "PECE-0044912",
          "Pedro Reyes",
          "ECT-003412",
        ],
      ],
      description: "Use this template for bulk filing of Customer Premises Equipment (CPE) Supplier Accreditation.",
    };
  }

  // 2. Radio Operator Exam (NTC 1-01)
  if (code === "NTC_1_01" || title.includes("RADIO OPERATOR EXAM") || title.includes("EXAMINATION")) {
    return {
      filename: "NTC_Radio_Operator_Exam_Template.csv",
      headers: [
        "First Name",
        "Middle Name",
        "Last Name",
        "Suffix",
        "Date of Birth",
        "Sex",
        "Nationality",
        "Region",
        "Province",
        "City",
        "Barangay",
        "Street",
        "Zip Code",
        "School Name",
        "Course / Degree",
        "Year Graduated",
        "Special Order (SO) Number",
        "Email",
        "Contact Number",
        "Exam Type",
        "Examinee Type",
        "Class/Element",
      ],
      sampleRows: [
        [
          "Juan",
          "Manuel",
          "Dela Cruz",
          "Jr.",
          "1995-05-15",
          "Male",
          "Filipino",
          "National Capital Region (NCR)",
          "Metro Manila",
          "Quezon City",
          "Diliman",
          "123 Agham Road",
          "1101",
          "Technological University of the Philippines",
          "BS Electronics Engineering",
          "2018",
          "SO-2018-0912",
          "juan.delacruz@email.com",
          "09171234567",
          "Radiotelephony",
          "First Taker",
          "1PHN - Elements 1, 2, 3 & 4",
        ],
        [
          "Maria",
          "Santos",
          "Reyes",
          "",
          "1998-08-22",
          "Female",
          "Filipino",
          "Region VII (Central Visayas)",
          "Cebu",
          "Cebu City",
          "Mabolo",
          "456 Osmeña Blvd",
          "6000",
          "University of San Carlos",
          "BS Information Technology",
          "2020",
          "",
          "maria.reyes@email.com",
          "09189876543",
          "Amateur",
          "Upgrader",
          "Class B - Elements 5, 6 & 7",
        ],
      ],
      description: "Use this template for batch filing of Radio Operator Examination admission slips.",
    };
  }

  // 3. Commercial Radio Operator Certificates (NTC 1-02) / Amateur (NTC 1-03)
  if (
    code === "NTC_1_02" ||
    code === "NTC_1_03" ||
    code === "NTC_AMA_LICENSES" ||
    title.includes("RADIO OPERATOR CERTIFICATES") ||
    title.includes("AMATEUR SERVICE")
  ) {
    return {
      filename: "NTC_Radio_Operator_Certificates_Template.csv",
      headers: [
        "Applicant Name",
        "Email",
        "Contact Number",
        "Address",
        "Application Type",
        "Number of Years",
        "Type of Certificate / Class",
        "Existing Certificate No",
        "Date of Expiry",
        "Modification Reason",
        "Employment Status",
        "Employment Location",
        "Place of Exam/Seminar",
        "Exam Date",
        "Ratings",
      ],
      sampleRows: [
        [
          "Capt. Gabriel Aquino",
          "gabriel.aquino@shipping.ph",
          "09171112233",
          "Manila Port Area, Manila",
          "NEW",
          "3",
          "GROC",
          "",
          "",
          "",
          "Employed",
          "M/V Archipelago Express",
          "NTC Central Office",
          "2026-01-10",
          "Passed (92%)",
        ],
        [
          "Carlos Mendoza",
          "carlos.mendoza@amateur.ph",
          "09185556677",
          "Davao City, Davao del Sur",
          "RENEWAL",
          "2",
          "Class A",
          "ROC-2023-8891",
          "2026-03-31",
          "",
          "Self-Employed",
          "Davao Amateur Radio Club",
          "DX Seminar Manila",
          "2024-02-15",
          "Passed Element 8, 9, 10",
        ],
      ],
      description: "Template for Radio Operator and Amateur Radio Certificate applications.",
    };
  }

  // 4. Permits in the Amateur Service (NTC 1-09)
  if (
    code === "NTC_1_09" ||
    title.includes("PERMITS IN THE AMATEUR SERVICE") ||
    (title.includes("PERMIT") && title.includes("AMATEUR"))
  ) {
    return {
      filename: "NTC_Permits_In_The_Amateur_Service_Template.csv",
      headers: [
        "Applicant Name",
        "Call Sign",
        "Contact Number",
        "Email",
        "Region",
        "Province",
        "City",
        "Barangay",
        "Street",
        "Room / Unit / Bldg",
        "Zip Code",
        "Service Area",
        "Frequency",
        "Bandwidth",
        "Bandwidth Unit",
        "Emission",
        "Power Output",
        "Hours of Operation",
        "Station Class",
        "Exact Location",
        "Longitude",
        "Latitude",
        "Configuration",
        "Data Rate",
        "Equipment Serial Numbers",
        "Equipment Frequency Ranges",
        "Antenna Type",
        "Antenna Height (cm)",
        "Antenna Gain (dB)",
        "Name of Dealer / Seller",
        "Authorized Seller / Buyer",
        "Amateur License No / Permit No",
        "Seller Address",
        "OR / Invoice No",
        "Permit / RSL No",
        "Intended Use",
        "Storage Location Details",
      ],
      sampleRows: [
        [
          "Juan Dela Cruz",
          "DU1ABC",
          "09171234567",
          "juandelacruz@example.ph",
          "NCR",
          "Metro Manila",
          "Quezon City",
          "Central",
          "123 Agham Road",
          "Unit 402",
          "1100",
          "Nationwide",
          "144.000 - 146.000 MHz",
          "25",
          "MHz",
          "16K0F3E",
          "50W",
          "24 Hours / As Needed",
          "FX/FB",
          "Transmitter Site Bldg B, Quezon City",
          "121.0437 E",
          "14.6507 N",
          "Simplex / Duplex",
          "9600 bps",
          "SN-IC7300-88192; SN-FT991A-10294",
          "144-148 MHz; 430-440 MHz",
          "Yagi / Directional",
          "1500",
          "12 dB",
          "Manila Amateur Radio Supplies Inc.",
          "Authorized Distributor",
          "ARSL-2023-00918",
          "456 Quezon Ave, Quezon City",
          "OR-2024-88910",
          "RSL-AMA-2023-0091",
          "Storage At",
          "Secure Storage Facility, Warehouse 3, Pasig City",
        ],
      ],
      description: "Use this template for bulk filing of applicants under the selected Permit application type.",
    };
  }

  // 5. RFID, SRD, WDN Devices (NTC 1-19)
  if (code === "NTC_1_19" || title.includes("RFID") || title.includes("WDN")) {
    return {
      filename: "NTC_Device_Registration_Template.csv",
      headers: [
        "Business Name",
        "Entity Type",
        "DTI/SEC No",
        "Contact Number",
        "Email",
        "Address",
        "Registration Type",
        "Invoice Number",
        "Device Type",
        "Make / Type / Model",
        "Equipment Serial Numbers",
      ],
      sampleRows: [
        [
          "Pacific Network Solutions Inc.",
          "Corporation",
          "SEC-2022091823",
          "09173334455",
          "telecom@pacific.ph",
          "BGC, Taguig City",
          "Dealers",
          "",
          "Wireless Data Network (WDN) - Indoor",
          "Ubiquiti UniFi U6-Pro",
          "SN-UBQ-882109; SN-UBQ-882110; SN-UBQ-882111",
        ],
        [
          "Apex Retail Warehouse Corp.",
          "Corporation",
          "SEC-2023081102",
          "09185556677",
          "logistics@apex.ph",
          "Pasig City, Metro Manila",
          "Non-Dealers",
          "INV-2026-00481",
          "Radio Frequency Identification (RFID) Devices",
          "Zebra FX9600 RFID Reader",
          "SN-ZBR-440192; SN-ZBR-440193",
        ],
      ],
      description: "Template for registration of RFID, SRD, and indoor WDN devices with serial numbers and invoice details.",
    };
  }

  // 5. TVRO Registration Certificate (NTC 1-22)
  if (code === "NTC_1_22" || code === "NTC_TVRO_CATV_LICENSES" || title.includes("TVRO")) {
    return {
      filename: "NTC_TVRO_Registration_Template.csv",
      headers: [
        "Applicant Name",
        "Email",
        "Contact Number",
        "Address",
        "Classification",
        "Number of Years",
        "Equipment Type",
        "Equipment Make/Model",
        "Equipment Serial No",
        "Frequency Range",
        "Antenna Make/Model",
        "Dish Diameter",
        "Polarization",
        "Satellite Name",
        "Downlink Frequency",
        "Programs List",
      ],
      sampleRows: [
        [
          "Luzon Cable Network Inc.",
          "tvro@luzoncable.ph",
          "09174445566",
          "San Fernando, Pampanga",
          "Commercial",
          "3",
          "Satellite Receiver",
          "Harmonic ProView 7100",
          "SN-HM-778129",
          "3.7 - 4.2 GHz",
          "Patriot Prime Focus",
          "3.8m",
          "Dual Linear (H/V)",
          "Asiasat 7 (105.5°E)",
          "3840 MHz",
          "News, Sports, Educational Channels",
        ],
      ],
      description: "Template for TVRO satellite receiver station registration.",
    };
  }

  // 6. VAS Provider Registration (NTC 1-20)
  if (code === "NTC_1_20" || title.includes("VALUE-ADDED") || title.includes("VAS")) {
    return {
      filename: "NTC_VAS_Provider_Registration_Template.csv",
      headers: [
        "Company Name",
        "Type of Entity",
        "Contact Number",
        "Email",
        "Address",
        "Application Type",
        "Number of Years",
        "CPCN / PA / CA No.",
        "CPCN / PA / CA No. Date of Expiry",
        "COR / VAS No.",
        "COR / VAS No. Date of Expiry",
        "Trade Name",
        "Value Added Services",
      ],
      sampleRows: [
        [
          "CloudVoice Philippines Corp.",
          "Corporation",
          "09178889900",
          "compliance@cloudvoice.ph",
          "Makati City, Metro Manila",
          "RENEWAL",
          "1",
          "CPCN-2020-0019",
          "2030-12-31",
          "COR-VAS-2022-0045",
          "2026-12-31",
          "CloudConnect",
          "Messaging Service; Audio Conferencing; Audio and Video Conferencing",
        ],
      ],
      description: "Template for Certificate of Registration as Value-Added Service (VAS) Provider.",
    };
  }

  // Default Standard General Template
  return {
    filename: `${(service.code || "NTC_Service").replace(/\s+/g, "_")}_Bulk_Template.csv`,
    headers: [
      "First Name",
      "Last Name",
      "Email",
      "Contact Number",
      "Date of Birth",
      "Physical Address",
      "Application Type",
      "Number of Years",
      "Notes / Remarks",
    ],
    sampleRows: [
      [
        "Juan",
        "Dela Cruz",
        "juan.delacruz@example.com",
        "09171234567",
        "1990-01-01",
        "Quezon City, Metro Manila",
        "NEW",
        "1",
        "Standard batch filing entry",
      ],
      [
        "Maria",
        "Santos",
        "maria.santos@example.com",
        "09189876543",
        "1992-06-15",
        "Cebu City, Cebu",
        "NEW",
        "1",
        "Standard batch filing entry",
      ],
    ],
    description: `Batch applicant intake template for ${service.title}.`,
  };
}

export function getSpreadsheetTemplateForService(
  service: NTCService,
  form?: FormDto | null
): SpreadsheetTemplateConfig {
  if (form && Array.isArray(form.sections) && form.sections.length > 0) {
    const dynamicTemplate = buildDynamicSpreadsheetTemplate(service, form);
    if (dynamicTemplate) {
      return dynamicTemplate;
    }
  }

  const staticConfig = getStaticSpreadsheetTemplateForService(service);
  return enrichStaticTemplate(staticConfig);
}

export function generateCsvContent(config: SpreadsheetTemplateConfig): string {
  const escapeCell = (val: string): string => {
    if (val.includes(",") || val.includes("\"") || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const headerLine = config.headers.map(escapeCell).join(",");
  const rowLines = config.sampleRows.map((row) => row.map(escapeCell).join(","));

  return [headerLine, ...rowLines].join("\r\n");
}
