import { NTCService } from "../../data/servicesData";

export interface SpreadsheetTemplateConfig {
  filename: string;
  headers: string[];
  sampleRows: string[][];
  description: string;
}

export function getSpreadsheetTemplateForService(service: NTCService): SpreadsheetTemplateConfig {
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
        "Last Name",
        "Email",
        "Contact Number",
        "Date of Birth",
        "Address",
        "Education / School Attended",
        "Application Type",
        "Examinee Type",
        "Class/Element",
        "Special Needs",
      ],
      sampleRows: [
        [
          "Juan",
          "Dela Cruz",
          "juan.delacruz@email.com",
          "09171234567",
          "1995-05-15",
          "Quezon City, Metro Manila",
          "Technological University of the Philippines",
          "Radiotelephony",
          "FirstTaker",
          "1PHN - Elements 1, 2, 3 & 4",
          "None",
        ],
        [
          "Maria",
          "Santos",
          "maria.santos@email.com",
          "09189876543",
          "1998-08-22",
          "Cebu City, Cebu",
          "University of San Carlos",
          "Amateur",
          "Upgrade",
          "Class B - Elements 5, 6 & 7",
          "None",
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
        "Name of Dealer",
        "Authorized Seller / Buyer",
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
          "Manila Amateur Radio Supplies Inc.",
          "Authorized Distributor",
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
        "Commercial Invoice No",
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
          "Wireless Data Network (WDN) Devices - Indoor",
          "Ubiquiti UniFi U6-Pro",
          "SN-UBQ-882109; SN-UBQ-882110; SN-UBQ-882111",
        ],
      ],
      description: "Template for registration of RFID, SRD, and indoor WDN devices with serial numbers.",
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
        "Business Entity Type",
        "Contact Number",
        "Email",
        "Address",
        "Application Type",
        "Number of Years",
        "Existing COR/VAS No",
        "COR/VAS Expiry Date",
        "CPCN License No",
        "CPCN Expiry Date",
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
          "NEW",
          "3",
          "",
          "",
          "CPCN-2020-0019",
          "2030-12-31",
          "CloudConnect",
          "Messaging service; Audio conferencing; Audio and Video Conferencing; VPN service",
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
