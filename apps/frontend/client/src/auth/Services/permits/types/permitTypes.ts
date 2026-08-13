// Permit Application Types for NTC-EDGE Client (NTC Form 1-09: Permits in the Amateur Service)

export type PermitApplicationType =
  | "Permit to Purchase"
  | "Purchase to Possess"
  | "Possess for storage"
  | "Permit to Sell/Transfer"
  | "Temporary Permit to Operate (Foreign Visitor)"
  | "Special Permit - Vanity Call Sign"
  | "Special Permit - Special Event Call Sign";

export type StationClassType = "RT" | "FX" | "FB" | "FX/FB" | "Other";
export type PurchaseClassOfStationType = "RT" | "FX" | "FB" | "ML";
export type BandwidthUnitType = "KHz" | "MHz" | "GHz";

export interface PermitPurchaseEquipmentItem {
  id: string;
  classOfStation: PurchaseClassOfStationType;
}

export interface PermitEquipmentItem {
  id: string;
  serialNumber: string;
  frequencyRange: string;
}

export interface PermitAntennaParticulars {
  type: string;
  heightCm: string;
  gainDb: string;
  directivity: string;
  diameter: string;
  polarization: string;
  beamwidth: string;
  remarks: string;
}

export interface PermitStationParticularItem {
  id: string;
  stationClass: StationClassType;
  exactLocation: string;
  longitude: string;
  latitude: string;
  configuration: string;
  dataRate: string;
  remarks: string;
  equipments: PermitEquipmentItem[];
  antenna: PermitAntennaParticulars;
}

export interface AmateurPermitData {
  id: number;
  applicationType: PermitApplicationType;

  // Basic Info
  applicant: string;
  callSign: string;
  contactNo: string;
  email: string;

  // Address
  region: string;
  province: string;
  city: string;
  barangay: string;
  street: string;
  room: string;
  zipCode: string;

  // Station & Technical Equipment
  serviceArea: string;
  frequency: string;

  // Bandwidth & Operating Specs
  bandwidth: string;
  unit: BandwidthUnitType;
  emission: string;
  powerOutput: string;
  hoursOfOperation: string;

  // For Purchase / Purchase to Possess: List of equipments with class of station
  purchaseEquipments: PermitPurchaseEquipmentItem[];

  // For Possess for Storage: Single station profile & equipments
  stationClass: StationClassType;
  exactLocation: string;
  longitude: string;
  latitude: string;
  configuration: string;
  dataRate: string;
  remarks: string;
  equipments: PermitEquipmentItem[];

  // For Permit to Sell/Transfer: Repeating list of station particulars with Antenna & Equipments
  stationParticulars: PermitStationParticularItem[];

  // Source of Equipment
  nameOfDealer: string;
  authorizedSellerBuyer: string;
  orInvoiceNo: string;
  permitRslNo: string;
  // Sell / Transfer specific source fields
  nameOfDealerOrSeller: string;
  amateurLicenseNoOrPermitToPossessNo: string;
  sellerAddress: string;

  // Intended Use of Equipment
  intendedUseAdditionalRadioEquipment: boolean;
  intendedUseNewRadioStation: boolean;
  newRadioStationSpecify: string;
  intendedUseChangeOfEquipment: boolean;
  intendedUseStorageAt: boolean;
  storageAtSpecify: string;
  intendedUseOthers: boolean;
  othersSpecify: string;

  // Uploads
  uploads: Record<string, { name: string; uri: string } | string>;
}

export const initialAntennaParticulars = (): PermitAntennaParticulars => ({
  type: "Directional / Yagi",
  heightCm: "",
  gainDb: "",
  directivity: "Directional",
  diameter: "",
  polarization: "Vertical / Horizontal",
  beamwidth: "",
  remarks: "",
});

export const initialStationParticularItem = (idSuffix: string = "1"): PermitStationParticularItem => ({
  id: `station-part-${Date.now()}-${idSuffix}`,
  stationClass: "FX/FB",
  exactLocation: "",
  longitude: "",
  latitude: "",
  configuration: "Simplex / Duplex",
  dataRate: "",
  remarks: "",
  equipments: [
    {
      id: `eq-${Date.now()}-${idSuffix}`,
      serialNumber: "",
      frequencyRange: "",
    },
  ],
  antenna: initialAntennaParticulars(),
});

export const initialAmateurPermitData = (id: number): AmateurPermitData => ({
  id,
  applicationType: "Possess for storage",
  applicant: "",
  callSign: "",
  contactNo: "",
  email: "",
  region: "",
  province: "",
  city: "",
  barangay: "",
  street: "",
  room: "",
  zipCode: "",
  serviceArea: "",
  frequency: "",
  bandwidth: "",
  unit: "MHz",
  emission: "",
  powerOutput: "",
  hoursOfOperation: "24 Hours / As Needed",
  purchaseEquipments: [
    {
      id: `peq-${Date.now()}-1`,
      classOfStation: "RT",
    },
  ],
  stationClass: "FX/FB",
  exactLocation: "",
  longitude: "",
  latitude: "",
  configuration: "Simplex / Duplex",
  dataRate: "",
  remarks: "",
  equipments: [
    {
      id: `eq-${Date.now()}-1`,
      serialNumber: "",
      frequencyRange: "",
    },
  ],
  stationParticulars: [initialStationParticularItem("1")],
  nameOfDealer: "",
  authorizedSellerBuyer: "",
  orInvoiceNo: "",
  permitRslNo: "",
  nameOfDealerOrSeller: "",
  amateurLicenseNoOrPermitToPossessNo: "",
  sellerAddress: "",
  intendedUseAdditionalRadioEquipment: false,
  intendedUseNewRadioStation: false,
  newRadioStationSpecify: "",
  intendedUseChangeOfEquipment: false,
  intendedUseStorageAt: true,
  storageAtSpecify: "",
  intendedUseOthers: false,
  othersSpecify: "",
  uploads: {},
});

export const derivePermitAppTypeFromStep3 = (
  variantIdOrStr?: string,
  variantName?: string
): PermitApplicationType => {
  const combined = `${variantIdOrStr || ""} ${variantName || ""}`.toUpperCase();

  if (
    combined.includes("60000000-0000-0000-0000-000000000064") ||
    combined.includes("FOREIGN") ||
    combined.includes("TEMPORARY")
  ) {
    return "Temporary Permit to Operate (Foreign Visitor)";
  }
  if (
    combined.includes("60000000-0000-0000-0000-000000000065") ||
    combined.includes("VANITY")
  ) {
    return "Special Permit - Vanity Call Sign";
  }
  if (
    combined.includes("60000000-0000-0000-0000-000000000066") ||
    combined.includes("SPECIAL EVENT")
  ) {
    return "Special Permit - Special Event Call Sign";
  }
  if (
    combined.includes("60000000-0000-0000-0000-000000000062") ||
    combined.includes("PURCHASE/POSSESS") ||
    combined.includes("PURCHASE / POSSESS") ||
    combined.includes("PURCHASE TO POSSESS")
  ) {
    return "Purchase to Possess";
  }
  if (
    combined.includes("60000000-0000-0000-0000-000000000060") ||
    (combined.includes("PURCHASE") && !combined.includes("POSSESS"))
  ) {
    return "Permit to Purchase";
  }
  if (
    combined.includes("60000000-0000-0000-0000-000000000063") ||
    combined.includes("SELL") ||
    combined.includes("TRANSFER")
  ) {
    return "Permit to Sell/Transfer";
  }
  if (
    combined.includes("60000000-0000-0000-0000-000000000061") ||
    combined.includes("STORAGE")
  ) {
    return "Possess for storage";
  }
  if (combined.includes("POSSESS")) {
    return "Possess for storage";
  }
  return "Possess for storage";
};
