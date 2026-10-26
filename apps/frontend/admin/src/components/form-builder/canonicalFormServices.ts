import { FormSchema, FormField, LinkedServiceItem, ServiceVariantToolbarItem } from "./types";
import { parseFieldCondition } from "./utils";
import { NTC_CATALOG } from "./ntcCatalogConstants";
import { ServiceItem } from "@/services/catalogService";

export interface CanonicalFormDef {
  code: string;
  name: string;
  category: string;
  canonicalServiceCode: string;
  associatedServiceCodes: string[];
  defaultVariants: Array<{
    name: string;
    serviceCode: string;
    serviceName: string;
  }>;
}

export const CANONICAL_FORM_DEFS: Record<string, CanonicalFormDef> = {
  NTC_1_01: {
    code: "NTC_1_01",
    name: "NTC 1-01: Radio Operator Examination",
    category: "Exams",
    canonicalServiceCode: "NTC_1_01",
    associatedServiceCodes: ["NTC_1_01"],
    defaultVariants: [
      { name: "Commercial Radio Operator Examination (First Taker)", serviceCode: "NTC_1_01", serviceName: "Radio Operator Examination" },
      { name: "Commercial Radio Operator Examination (Retaker)", serviceCode: "NTC_1_01", serviceName: "Radio Operator Examination" },
      { name: "Commercial Radio Operator Examination (Upgrade)", serviceCode: "NTC_1_01", serviceName: "Radio Operator Examination" },
      { name: "Amateur Radio Operator Examination (First Taker)", serviceCode: "NTC_1_01", serviceName: "Radio Operator Examination" },
      { name: "Amateur Radio Operator Examination (Retaker)", serviceCode: "NTC_1_01", serviceName: "Radio Operator Examination" },
      { name: "Amateur Radio Operator Examination (Upgrade)", serviceCode: "NTC_1_01", serviceName: "Radio Operator Examination" },
      { name: "Restricted Radio Operator Certificate - Aircraft", serviceCode: "NTC_1_01", serviceName: "Radio Operator Examination" },
    ],
  },
  NTC_1_02: {
    code: "NTC_1_02",
    name: "NTC 1-02: Commercial Radio Operator Certificate",
    category: "Certificates",
    canonicalServiceCode: "NTC_1_02",
    associatedServiceCodes: ["NTC_1_02"],
    defaultVariants: [
      { name: "First Class Radiotelegraph (1RTG) - New", serviceCode: "NTC_1_02", serviceName: "Commercial Radio Operator Certificate" },
      { name: "First Class Radiotelegraph (1RTG) - Renewal", serviceCode: "NTC_1_02", serviceName: "Commercial Radio Operator Certificate" },
      { name: "Second Class Radiotelegraph (2RTG) - New", serviceCode: "NTC_1_02", serviceName: "Commercial Radio Operator Certificate" },
      { name: "Second Class Radiotelegraph (2RTG) - Renewal", serviceCode: "NTC_1_02", serviceName: "Commercial Radio Operator Certificate" },
      { name: "General Operator Certificate (GOC) - New", serviceCode: "NTC_1_02", serviceName: "Commercial Radio Operator Certificate" },
      { name: "General Operator Certificate (GOC) - Renewal", serviceCode: "NTC_1_02", serviceName: "Commercial Radio Operator Certificate" },
      { name: "Restricted Radiotelephone Operator (RROC Aircraft)", serviceCode: "NTC_1_02", serviceName: "Commercial Radio Operator Certificate" },
    ],
  },
  NTC_1_03: {
    code: "NTC_1_03",
    name: "NTC 1-03: Amateur Radio Operator Certificate & License",
    category: "Certificates & Licenses",
    canonicalServiceCode: "NTC_1_03",
    associatedServiceCodes: ["NTC_1_03", "NTC_AMA_LICENSES"],
    defaultVariants: [
      { name: "Class A (Extra Class) - New", serviceCode: "NTC_1_03", serviceName: "Amateur Radio Operator Certificate & License" },
      { name: "Class A (Extra Class) - Renewal", serviceCode: "NTC_1_03", serviceName: "Amateur Radio Operator Certificate & License" },
      { name: "Class B (General Class) - New", serviceCode: "NTC_1_03", serviceName: "Amateur Radio Operator Certificate & License" },
      { name: "Class B (General Class) - Renewal", serviceCode: "NTC_1_03", serviceName: "Amateur Radio Operator Certificate & License" },
      { name: "Class C (Technician Class) - New", serviceCode: "NTC_1_03", serviceName: "Amateur Radio Operator Certificate & License" },
      { name: "Class C (Technician Class) - Renewal", serviceCode: "NTC_1_03", serviceName: "Amateur Radio Operator Certificate & License" },
      { name: "Class D (Novice Class) - New", serviceCode: "NTC_1_03", serviceName: "Amateur Radio Operator Certificate & License" },
      { name: "Class D (Novice Class) - Renewal", serviceCode: "NTC_1_03", serviceName: "Amateur Radio Operator Certificate & License" },
      { name: "Amateur Club Station License", serviceCode: "NTC_AMA_LICENSES", serviceName: "License in the Amateur Service" },
      { name: "Lifetime Amateur Radio Station License", serviceCode: "NTC_AMA_LICENSES", serviceName: "License in the Amateur Service" },
    ],
  },
  NTC_1_04: {
    code: "NTC_1_04",
    name: "NTC 1-04: Ship Station License",
    category: "Licenses",
    canonicalServiceCode: "NTC_1_04",
    associatedServiceCodes: ["NTC_1_04", "NTC_MAR_LICENSES"],
    defaultVariants: [
      { name: "Ship Station License Domestic Trade - Passenger", serviceCode: "NTC_1_04", serviceName: "Ship Station License" },
      { name: "Ship Station License Domestic Trade - Cargo", serviceCode: "NTC_1_04", serviceName: "Ship Station License" },
      { name: "Ship Station License Domestic Trade - Fishing", serviceCode: "NTC_1_04", serviceName: "Ship Station License" },
      { name: "Ship Station License International Trade", serviceCode: "NTC_1_04", serviceName: "Ship Station License" },
      { name: "Ship Earth Station License International Trade", serviceCode: "NTC_1_04", serviceName: "Ship Station License" },
      { name: "Private Coastal Station License", serviceCode: "NTC_MAR_LICENSES", serviceName: "License in the Maritime Service" },
      { name: "Public Coastal Station License", serviceCode: "NTC_MAR_LICENSES", serviceName: "License in the Maritime Service" },
    ],
  },
  NTC_1_09: {
    code: "NTC_1_09",
    name: "NTC 1-09: Permits (Amateur, Aero, Maritime, FLM, PTE)",
    category: "Permits",
    canonicalServiceCode: "NTC_1_09",
    associatedServiceCodes: [
      "NTC_1_09",
      "NTC_AERO_PERMITS",
      "NTC_MAR_PERMITS",
      "NTC_FLM_PERMITS",
      "NTC_PTE_PERMITS",
    ],
    defaultVariants: [
      // Amateur Service
      { name: "Amateur Radio Station Permit to Purchase", serviceCode: "NTC_1_09", serviceName: "Permits in the Amateur Service" },
      { name: "Amateur Radio Station Permit to Possess for Storage", serviceCode: "NTC_1_09", serviceName: "Permits in the Amateur Service" },
      { name: "Amateur Radio Station Permit to Purchase/Possess", serviceCode: "NTC_1_09", serviceName: "Permits in the Amateur Service" },
      { name: "Amateur Radio Station Permit to Sell/Transfer", serviceCode: "NTC_1_09", serviceName: "Permits in the Amateur Service" },
      { name: "Temporary Permit to Operate an Amateur Radio Station - Foreign Visitor", serviceCode: "NTC_1_09", serviceName: "Permits in the Amateur Service" },
      { name: "Special Permit for Use of Vanity Call Sign (New)", serviceCode: "NTC_1_09", serviceName: "Permits in the Amateur Service" },
      { name: "Special Permit for Use of Vanity Call Sign (Renewal)", serviceCode: "NTC_1_09", serviceName: "Permits in the Amateur Service" },
      { name: "Special Permit for the Use of Special Event Call Sign", serviceCode: "NTC_1_09", serviceName: "Permits in the Amateur Service" },
      // Aeronautical Service
      { name: "Aeronautical Station Permit to Purchase", serviceCode: "NTC_AERO_PERMITS", serviceName: "Permits in the Aeronautical Service" },
      { name: "Aeronautical Station Permit to Possess", serviceCode: "NTC_AERO_PERMITS", serviceName: "Permits in the Aeronautical Service" },
      { name: "Aeronautical Station Permit to Purchase/Possess", serviceCode: "NTC_AERO_PERMITS", serviceName: "Permits in the Aeronautical Service" },
      { name: "Aeronautical Station Permit to Possess for Storage", serviceCode: "NTC_AERO_PERMITS", serviceName: "Permits in the Aeronautical Service" },
      { name: "Aeronautical Station Permit to Sell/Transfer", serviceCode: "NTC_AERO_PERMITS", serviceName: "Permits in the Aeronautical Service" },
      { name: "Aircraft Station Permit to Purchase", serviceCode: "NTC_AERO_PERMITS", serviceName: "Permits in the Aeronautical Service" },
      { name: "Aircraft Station Permit to Possess", serviceCode: "NTC_AERO_PERMITS", serviceName: "Permits in the Aeronautical Service" },
      { name: "Aircraft Station Permit to Purchase/Possess", serviceCode: "NTC_AERO_PERMITS", serviceName: "Permits in the Aeronautical Service" },
      { name: "Aircraft Station Permit to Sell/Transfer", serviceCode: "NTC_AERO_PERMITS", serviceName: "Permits in the Aeronautical Service" },
      // Maritime Service
      { name: "Ship Station Permit to Purchase (Domestic Trade)", serviceCode: "NTC_MAR_PERMITS", serviceName: "Permits in the Maritime Service" },
      { name: "Ship Station Permit to Possess (Domestic Trade)", serviceCode: "NTC_MAR_PERMITS", serviceName: "Permits in the Maritime Service" },
      { name: "Ship Station Permit to Possess (Storage)", serviceCode: "NTC_MAR_PERMITS", serviceName: "Permits in the Maritime Service" },
      { name: "Ship Station Permit to Purchase/Possess (Domestic Trade)", serviceCode: "NTC_MAR_PERMITS", serviceName: "Permits in the Maritime Service" },
      { name: "Ship Station Permit to Sell/Transfer", serviceCode: "NTC_MAR_PERMITS", serviceName: "Permits in the Maritime Service" },
      { name: "Private Coastal Station Permit to Purchase", serviceCode: "NTC_MAR_PERMITS", serviceName: "Permits in the Maritime Service" },
      { name: "Private Coastal Station Permit to Possess", serviceCode: "NTC_MAR_PERMITS", serviceName: "Permits in the Maritime Service" },
      { name: "Private Coastal Station Permit to Purchase/Possess", serviceCode: "NTC_MAR_PERMITS", serviceName: "Permits in the Maritime Service" },
      { name: "Public Coastal Station Permit to Purchase", serviceCode: "NTC_MAR_PERMITS", serviceName: "Permits in the Maritime Service" },
      { name: "Public Coastal Station Permit to Possess", serviceCode: "NTC_MAR_PERMITS", serviceName: "Permits in the Maritime Service" },
      { name: "Public Coastal Station Permit to Purchase/Possess", serviceCode: "NTC_MAR_PERMITS", serviceName: "Permits in the Maritime Service" },
      { name: "Public Coastal Station Permit to Sell/Transfer", serviceCode: "NTC_MAR_PERMITS", serviceName: "Permits in the Maritime Service" },
      // Fixed & Land Mobile
      { name: "Permit to Purchase (VSAT)", serviceCode: "NTC_FLM_PERMITS", serviceName: "Permits for Fixed & Land Mobile" },
      { name: "Permit to Purchase (Private)", serviceCode: "NTC_FLM_PERMITS", serviceName: "Permits for Fixed & Land Mobile" },
      { name: "Permit to Purchase (Civic Action Group)", serviceCode: "NTC_FLM_PERMITS", serviceName: "Permits for Fixed & Land Mobile" },
      { name: "Permit to Purchase (Government)", serviceCode: "NTC_FLM_PERMITS", serviceName: "Permits for Fixed & Land Mobile" },
      { name: "Permit to Possess (VSAT)", serviceCode: "NTC_FLM_PERMITS", serviceName: "Permits for Fixed & Land Mobile" },
      { name: "Permit to Possess (Private)", serviceCode: "NTC_FLM_PERMITS", serviceName: "Permits for Fixed & Land Mobile" },
      { name: "Permit to Possess (Civic Action Group)", serviceCode: "NTC_FLM_PERMITS", serviceName: "Permits for Fixed & Land Mobile" },
      { name: "Permit to Possess (Government)", serviceCode: "NTC_FLM_PERMITS", serviceName: "Permits for Fixed & Land Mobile" },
      { name: "Permit to Purchase/Possess (VSAT)", serviceCode: "NTC_FLM_PERMITS", serviceName: "Permits for Fixed & Land Mobile" },
      { name: "Permit to Purchase/Possess (Private)", serviceCode: "NTC_FLM_PERMITS", serviceName: "Permits for Fixed & Land Mobile" },
      { name: "Permit to Purchase/Possess (Civic Action Group)", serviceCode: "NTC_FLM_PERMITS", serviceName: "Permits for Fixed & Land Mobile" },
      { name: "Permit to Purchase/Possess (Government)", serviceCode: "NTC_FLM_PERMITS", serviceName: "Permits for Fixed & Land Mobile" },
      { name: "Permit to Possess for Storage", serviceCode: "NTC_FLM_PERMITS", serviceName: "Permits for Fixed & Land Mobile" },
      { name: "Permit to Sell/Transfer", serviceCode: "NTC_FLM_PERMITS", serviceName: "Permits for Fixed & Land Mobile" },
      { name: "Construction Permit (New)", serviceCode: "NTC_FLM_PERMITS", serviceName: "Permits for Fixed & Land Mobile" },
      { name: "Construction Permit (Modification)", serviceCode: "NTC_FLM_PERMITS", serviceName: "Permits for Fixed & Land Mobile" },
      { name: "Temporary Permit to Demonstrate and Propagate", serviceCode: "NTC_FLM_PERMITS", serviceName: "Permits for Fixed & Land Mobile" },
      // PTE
      { name: "Permit to Possess for Storage (PTEs)", serviceCode: "NTC_PTE_PERMITS", serviceName: "Permits for PTEs" },
    ],
  },
  NTC_1_11: {
    code: "NTC_1_11",
    name: "NTC 1-11: Radio Station License",
    category: "Licenses",
    canonicalServiceCode: "NTC_1_11",
    associatedServiceCodes: [
      "NTC_1_11",
      "NTC_FLM_LICENSES",
      "NTC_AERO_LICENSES",
      "NTC_OTHER_LICENSES",
    ],
    defaultVariants: [
      { name: "Fixed Point-to-Point Radio Station License", serviceCode: "NTC_1_11", serviceName: "Radio Station License" },
      { name: "Land Mobile Base Station License", serviceCode: "NTC_1_11", serviceName: "Radio Station License" },
      { name: "Land Mobile Portable Station License", serviceCode: "NTC_1_11", serviceName: "Radio Station License" },
      { name: "Fixed Aeronautical Station License", serviceCode: "NTC_AERO_LICENSES", serviceName: "License in the Aeronautical Service" },
      { name: "Aircraft Station License", serviceCode: "NTC_AERO_LICENSES", serviceName: "License in the Aeronautical Service" },
      { name: "Radio Station License - Microwave", serviceCode: "NTC_OTHER_LICENSES", serviceName: "Other Radio Station Licenses" },
      { name: "Radio Station License - VSAT", serviceCode: "NTC_OTHER_LICENSES", serviceName: "Other Radio Station Licenses" },
      { name: "Radio Station License - Public Trunked", serviceCode: "NTC_OTHER_LICENSES", serviceName: "Other Radio Station Licenses" },
      { name: "Radio Station License - BWA", serviceCode: "NTC_OTHER_LICENSES", serviceName: "Other Radio Station Licenses" },
      { name: "Radio Station License - WDN", serviceCode: "NTC_OTHER_LICENSES", serviceName: "Other Radio Station Licenses" },
      { name: "Radio Station License - BTS", serviceCode: "NTC_OTHER_LICENSES", serviceName: "Other Radio Station Licenses" },
    ],
  },
  NTC_1_18: {
    code: "NTC_1_18",
    name: "NTC 1-18: CPE Supplier Accreditation & Equipment/Mobile Phone Permits",
    category: "Accreditations & Permits",
    canonicalServiceCode: "NTC_1_18",
    associatedServiceCodes: [
      "NTC_1_18",
      "NTC_EQUIP_PERMITS",
      "NTC_MP_PERMITS",
    ],
    defaultVariants: [
      // Equipment
      { name: "Permit to Transport", serviceCode: "NTC_EQUIP_PERMITS", serviceName: "Radio Communications Equipment Permits" },
      { name: "RCE Dealer Permit (New)", serviceCode: "NTC_EQUIP_PERMITS", serviceName: "Radio Communications Equipment Permits" },
      { name: "RCE Dealer Permit (Renewal)", serviceCode: "NTC_EQUIP_PERMITS", serviceName: "Radio Communications Equipment Permits" },
      { name: "RCE Dealer Permit (Modification)", serviceCode: "NTC_EQUIP_PERMITS", serviceName: "Radio Communications Equipment Permits" },
      { name: "RCE Manufacturer Permit (New)", serviceCode: "NTC_EQUIP_PERMITS", serviceName: "Radio Communications Equipment Permits" },
      { name: "RCE Manufacturer Permit (Renewal)", serviceCode: "NTC_EQUIP_PERMITS", serviceName: "Radio Communications Equipment Permits" },
      { name: "RCE Manufacturer Permit (Modification)", serviceCode: "NTC_EQUIP_PERMITS", serviceName: "Radio Communications Equipment Permits" },
      { name: "RCE Service Center Permit (New)", serviceCode: "NTC_EQUIP_PERMITS", serviceName: "Radio Communications Equipment Permits" },
      { name: "RCE Service Center Permit (Renewal)", serviceCode: "NTC_EQUIP_PERMITS", serviceName: "Radio Communications Equipment Permits" },
      { name: "RCE Service Center Permit (Modification)", serviceCode: "NTC_EQUIP_PERMITS", serviceName: "Radio Communications Equipment Permits" },
      // Mobile Phone
      { name: "Mobile Phone Dealer Permit (New)", serviceCode: "NTC_MP_PERMITS", serviceName: "Mobile Phone Permits" },
      { name: "Mobile Phone Dealer Permit (Renewal)", serviceCode: "NTC_MP_PERMITS", serviceName: "Mobile Phone Permits" },
      { name: "Mobile Phone Dealer Permit (Modification)", serviceCode: "NTC_MP_PERMITS", serviceName: "Mobile Phone Permits" },
      { name: "Mobile Phone Retailer/Reseller Permit (New)", serviceCode: "NTC_MP_PERMITS", serviceName: "Mobile Phone Permits" },
      { name: "Mobile Phone Retailer/Reseller Permit (Renewal)", serviceCode: "NTC_MP_PERMITS", serviceName: "Mobile Phone Permits" },
      { name: "Mobile Phone Retailer/Reseller Permit (Modification)", serviceCode: "NTC_MP_PERMITS", serviceName: "Mobile Phone Permits" },
      { name: "Mobile Phone Service Center Permit (New)", serviceCode: "NTC_MP_PERMITS", serviceName: "Mobile Phone Permits" },
      { name: "Mobile Phone Service Center Permit (Renewal)", serviceCode: "NTC_MP_PERMITS", serviceName: "Mobile Phone Permits" },
      { name: "Mobile Phone Service Center Permit (Modification)", serviceCode: "NTC_MP_PERMITS", serviceName: "Mobile Phone Permits" },
      // CPE
      { name: "CPE Supplier Accreditation (New)", serviceCode: "NTC_1_18", serviceName: "CPE Supplier Accreditation" },
      { name: "CPE Supplier Accreditation (Renewal)", serviceCode: "NTC_1_18", serviceName: "CPE Supplier Accreditation" },
    ],
  },
  NTC_1_19: {
    code: "NTC_1_19",
    name: "NTC 1-19: RFID / SRD / WDN Registration",
    category: "Accreditations",
    canonicalServiceCode: "NTC_1_19",
    associatedServiceCodes: ["NTC_1_19"],
    defaultVariants: [
      { name: "Wireless Data Network (WDN) - Indoor Devices", serviceCode: "NTC_1_19", serviceName: "RFID, SRD, WDN Registration" },
      { name: "Short Range Devices (SRD)", serviceCode: "NTC_1_19", serviceName: "RFID, SRD, WDN Registration" },
      { name: "Radio Frequency Identification (RFID) Devices", serviceCode: "NTC_1_19", serviceName: "RFID, SRD, WDN Registration" },
      { name: "Short Range Radio Services (SRRS) Devices", serviceCode: "NTC_1_19", serviceName: "RFID, SRD, WDN Registration" },
    ],
  },
  NTC_1_20: {
    code: "NTC_1_20",
    name: "NTC 1-20: VAS Provider Registration",
    category: "Accreditations",
    canonicalServiceCode: "NTC_1_20",
    associatedServiceCodes: ["NTC_1_20"],
    defaultVariants: [
      { name: "Content Provider (New)", serviceCode: "NTC_1_20", serviceName: "VAS Provider Registration" },
      { name: "Content Provider (Renewal)", serviceCode: "NTC_1_20", serviceName: "VAS Provider Registration" },
      { name: "Telecommunications Reseller (New)", serviceCode: "NTC_1_20", serviceName: "VAS Provider Registration" },
      { name: "Telecommunications Reseller (Renewal)", serviceCode: "NTC_1_20", serviceName: "VAS Provider Registration" },
      { name: "Voice over Internet Protocol (VoIP) Provider (New)", serviceCode: "NTC_1_20", serviceName: "VAS Provider Registration" },
      { name: "Voice over Internet Protocol (VoIP) Provider (Renewal)", serviceCode: "NTC_1_20", serviceName: "VAS Provider Registration" },
    ],
  },
  NTC_1_21: {
    code: "NTC_1_21",
    name: "NTC 1-21: Certified True Copy / Duplicate Copy",
    category: "Certificates, Permits & Licenses",
    canonicalServiceCode: "NTC_1_21",
    associatedServiceCodes: [
      "NTC_1_21",
      "NTC_COPY_PERMITS",
      "NTC_COPY_LICENSES",
    ],
    defaultVariants: [
      { name: "Certified True Copy (Permit)", serviceCode: "NTC_COPY_PERMITS", serviceName: "Copy of Permits" },
      { name: "Duplicate Copy (Permit)", serviceCode: "NTC_COPY_PERMITS", serviceName: "Copy of Permits" },
      { name: "Certified True Copy (License)", serviceCode: "NTC_COPY_LICENSES", serviceName: "Copy of Licenses" },
      { name: "Duplicate Copy (License)", serviceCode: "NTC_COPY_LICENSES", serviceName: "Copy of Licenses" },
    ],
  },
  NTC_1_22: {
    code: "NTC_1_22",
    name: "NTC 1-22: TVRO Registration & Station License",
    category: "Licenses",
    canonicalServiceCode: "NTC_1_22",
    associatedServiceCodes: ["NTC_1_22", "NTC_TVRO_CATV_LICENSES"],
    defaultVariants: [
      { name: "TVRO Registration Certificate (Commercial)", serviceCode: "NTC_1_22", serviceName: "TVRO Registration Certificate" },
      { name: "TVRO Registration Certificate (Non-Commercial)", serviceCode: "NTC_1_22", serviceName: "TVRO Registration Certificate" },
      { name: "TVRO Station License", serviceCode: "NTC_TVRO_CATV_LICENSES", serviceName: "TVRO/CATV Station License" },
      { name: "CATV Station License", serviceCode: "NTC_TVRO_CATV_LICENSES", serviceName: "TVRO/CATV Station License" },
    ],
  },
  NTC_1_24: {
    code: "NTC_1_24",
    name: "NTC 1-24: Request for Blocking / Unblocking of IMEI and SIM",
    category: "Requests & Complaints",
    canonicalServiceCode: "NTC_1_24",
    associatedServiceCodes: ["NTC_1_24"],
    defaultVariants: [
      { name: "Requests for Blocking of IMEI and SIM of Lost/Stolen Mobile Phone", serviceCode: "NTC_1_24", serviceName: "Requests for Blocking / Unblocking" },
      { name: "Requests for Unblocking of IMEI and SIM of Lost/Stolen Mobile Phone", serviceCode: "NTC_1_24", serviceName: "Requests for Blocking / Unblocking" },
    ],
  },
  NTC_1_25: {
    code: "NTC_1_25",
    name: "NTC 1-25: Consumer Complaints & Tape Preservation",
    category: "Requests & Complaints",
    canonicalServiceCode: "NTC_1_25",
    associatedServiceCodes: ["NTC_1_25"],
    defaultVariants: [
      { name: "Complaints on Text Spam, Text Scam, or Illegal/Obscene/Threat Text Messages", serviceCode: "NTC_1_25", serviceName: "Complaints and Tape Preservation" },
      { name: "Complaints on Services Offered by Telecommunications or Broadcast Service Providers", serviceCode: "NTC_1_25", serviceName: "Complaints and Tape Preservation" },
      { name: "Request for Mandatory Tape Preservation", serviceCode: "NTC_1_25", serviceName: "Complaints and Tape Preservation" },
    ],
  },
};

export function detectCanonicalFormCode(form: FormSchema): string | null {
  const code = (form.serviceCode ?? "").toUpperCase().trim();
  const name = (form.name ?? "").toUpperCase().trim();
  const serviceName = (form.serviceName ?? "").toUpperCase().trim();

  // Try exact regex match on form code (e.g. NTC_1_09)
  const codeMatch = code.match(/NTC_1_\d{2}/);
  if (codeMatch && CANONICAL_FORM_DEFS[codeMatch[0]]) {
    return codeMatch[0];
  }

  // Try exact regex match in form name (e.g. "NTC 1-09" or "NTC_1_09")
  const nameNormalized = name.replace(/[- ]/g, "_");
  const nameMatch = nameNormalized.match(/NTC_1_\d{2}/);
  if (nameMatch && CANONICAL_FORM_DEFS[nameMatch[0]]) {
    return nameMatch[0];
  }

  // Check alias codes
  if (code === "NTC_AERO_PERMITS" || code === "NTC_MAR_PERMITS" || code === "NTC_FLM_PERMITS" || code === "NTC_PTE_PERMITS") {
    return "NTC_1_09";
  }
  if (code === "NTC_EQUIP_PERMITS" || code === "NTC_MP_PERMITS") {
    return "NTC_1_18";
  }
  if (code === "NTC_COPY_PERMITS" || code === "NTC_COPY_LICENSES") {
    return "NTC_1_21";
  }
  if (code === "NTC_AERO_LICENSES" || code === "NTC_OTHER_LICENSES" || code === "NTC_FLM_LICENSES") {
    return "NTC_1_11";
  }
  if (code === "NTC_AMA_LICENSES") {
    return "NTC_1_03";
  }
  if (code === "NTC_MAR_LICENSES") {
    return "NTC_1_04";
  }
  if (code === "NTC_TVRO_CATV_LICENSES") {
    return "NTC_1_22";
  }

  // Keyword searches
  if (name.includes("1-09") || name.includes("1_09")) return "NTC_1_09";
  if (name.includes("1-18") || name.includes("1_18") || name.includes("CPE")) return "NTC_1_18";
  if (name.includes("1-21") || name.includes("1_21") || name.includes("CERTIFIED TRUE COPY")) return "NTC_1_21";
  if (name.includes("1-11") || name.includes("1_11") || name.includes("RADIO STATION LICENSE")) return "NTC_1_11";
  if (name.includes("1-04") || name.includes("1_04") || name.includes("SHIP STATION")) return "NTC_1_04";
  if (name.includes("1-03") || name.includes("1_03") || name.includes("AMATEUR")) return "NTC_1_03";
  if (name.includes("1-01") || name.includes("1_01") || name.includes("EXAMINATION")) return "NTC_1_01";
  if (name.includes("1-02") || name.includes("1_02") || name.includes("COMMERCIAL RADIO OPERATOR")) return "NTC_1_02";
  if (name.includes("1-19") || name.includes("1_19") || name.includes("RFID")) return "NTC_1_19";
  if (name.includes("1-20") || name.includes("1_20") || name.includes("VAS")) return "NTC_1_20";
  if (name.includes("1-22") || name.includes("1_22") || name.includes("TVRO")) return "NTC_1_22";
  if (name.includes("1-24") || name.includes("1_24") || name.includes("BLOCKING")) return "NTC_1_24";
  if (name.includes("1-25") || name.includes("1_25") || name.includes("COMPLAINT") || serviceName.includes("COMPLAINT")) return "NTC_1_25";

  return null;
}

export function getDefaultLinkedServicesForForm(
  form: FormSchema,
  catalogServices: ServiceItem[] = []
): LinkedServiceItem[] {
  const canonicalCode = detectCanonicalFormCode(form);
  const def = canonicalCode ? CANONICAL_FORM_DEFS[canonicalCode] : null;

  const result: LinkedServiceItem[] = [];
  const addedCodes = new Set<string>();

  // 1. Always include the form's primary service if available
  if (form.serviceId && form.serviceName) {
    result.push({
      id: form.serviceId,
      name: form.serviceName,
      code: form.serviceCode,
    });
    if (form.serviceCode) {
      addedCodes.add(form.serviceCode.toUpperCase());
    }
  }

  // 2. If canonical definition exists, look up all associated services from catalog
  if (def) {
    for (const associatedCode of def.associatedServiceCodes) {
      const codeUpper = associatedCode.toUpperCase();
      if (addedCodes.has(codeUpper)) continue;

      const matchingService = catalogServices.find(
        (s) => (s.code && s.code.toUpperCase() === codeUpper) || (s.group && s.group.toUpperCase() === codeUpper)
      );

      if (matchingService) {
        result.push({
          id: matchingService.id,
          name: matchingService.name,
          code: matchingService.code,
          categoryName: matchingService.serviceCategoryType || matchingService.serviceCategoryCode,
        });
        addedCodes.add(codeUpper);
      } else {
        // Fallback placeholder item
        result.push({
          id: `canonical-svc-${associatedCode.toLowerCase()}`,
          name: `${associatedCode.replace(/_/g, " ")} Service`,
          code: associatedCode,
        });
        addedCodes.add(codeUpper);
      }
    }
  }

  return result;
}

export function getEffectiveLinkedServices(
  form: FormSchema,
  catalogServices: ServiceItem[] = []
): LinkedServiceItem[] {
  if (form.linkedServices && form.linkedServices.length > 0) {
    // If form has custom linkedServices saved, ensure the primary service is also included
    const hasPrimary = form.serviceId
      ? form.linkedServices.some((s) => s.id === form.serviceId)
      : true;

    if (!hasPrimary && form.serviceId && form.serviceName) {
      return [
        {
          id: form.serviceId,
          name: form.serviceName,
          code: form.serviceCode,
        },
        ...form.linkedServices,
      ];
    }
    return form.linkedServices;
  }

  return getDefaultLinkedServicesForForm(form, catalogServices);
}

export function collectAllFormVariants(
  form: FormSchema,
  catalogServices: ServiceItem[] = [],
  apiVariants: ServiceVariantToolbarItem[] = []
): ServiceVariantToolbarItem[] {
  const result: ServiceVariantToolbarItem[] = [];
  const seenNames = new Set<string>();

  const addVariant = (
    name: string,
    serviceId?: string,
    serviceName?: string,
    serviceCode?: string,
    source: ServiceVariantToolbarItem["source"] = "service"
  ) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const key = trimmed.toLowerCase();
    if (seenNames.has(key)) return;
    seenNames.add(key);

    result.push({
      id: `var-${result.length + 1}-${key.replace(/[^a-z0-9]/g, "-").slice(0, 20)}`,
      name: trimmed,
      serviceId,
      serviceName,
      serviceCode,
      source,
    });
  };

  // 1. API variants provided from parent (if any)
  for (const v of apiVariants) {
    addVariant(v.name, v.serviceId, v.serviceName, v.serviceCode, "service");
  }

  // 2. Canonical default variants if this is a known canonical form
  const canonicalCode = detectCanonicalFormCode(form);
  const def = canonicalCode ? CANONICAL_FORM_DEFS[canonicalCode] : null;
  if (def) {
    for (const v of def.defaultVariants) {
      addVariant(v.name, undefined, v.serviceName, v.serviceCode, "catalog");
    }
  }

  // 3. Variants from effective linked services in catalog
  const effectiveServices = getEffectiveLinkedServices(form, catalogServices);
  for (const svc of effectiveServices) {
    const svcNameUpper = (svc.name ?? "").toUpperCase().trim();
    const catItem = NTC_CATALOG[svc.name] ?? NTC_CATALOG[svcNameUpper];
    if (catItem) {
      if (Array.isArray(catItem.applicationTypes)) {
        for (const appType of catItem.applicationTypes) {
          addVariant(appType, svc.id, svc.name, svc.code, "catalog");
        }
      }
      if (Array.isArray(catItem.variants)) {
        for (const variantName of catItem.variants) {
          addVariant(variantName, svc.id, svc.name, svc.code, "catalog");
        }
      }
    }
  }

  // 4. Variants declared in form fields' condition rules (variants and applicationTypes)
  for (const field of form.fields) {
    const cond = field.condition ?? (field.visibilityCondition ? parseFieldCondition(field.visibilityCondition) : undefined);
    if (cond) {
      if (Array.isArray(cond.variants)) {
        for (const v of cond.variants) {
          addVariant(v, undefined, form.serviceName, form.serviceCode, "field-condition");
        }
      }
      if (Array.isArray(cond.applicationTypes)) {
        for (const appType of cond.applicationTypes) {
          addVariant(appType, undefined, form.serviceName, form.serviceCode, "field-condition");
        }
      }
    }
  }

  // 5. Custom variants manually linked to this form schema
  if (Array.isArray(form.linkedVariants)) {
    for (const customVar of form.linkedVariants) {
      addVariant(customVar, undefined, form.serviceName, form.serviceCode, "custom");
    }
  }

  return result;
}
