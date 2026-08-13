// Permit Application Types for NTC-EDGE Client (NTC Form 1-09: Permits in the Amateur Service)

export type PermitApplicationType =
  | "Possess for storage"
  | "Purchase"
  | "Possess"
  | "Sell/Transfer"
  | "Purchase/Possess";

export type StationClassType = "RT" | "FX" | "FB" | "FX/FB" | "Other";
export type BandwidthUnitType = "KHz" | "MHz" | "GHz";

export interface PermitEquipmentItem {
  id: string;
  serialNumber: string;
  frequencyRange: string;
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

  // Particulars - Class Station & Location
  stationClass: StationClassType;
  exactLocation: string;
  longitude: string;
  latitude: string;
  configuration: string;
  dataRate: string;
  remarks: string;

  // Particulars of Equipment (Repeater)
  equipments: PermitEquipmentItem[];

  // Source of Equipment
  nameOfDealer: string;
  authorizedSellerBuyer: string;
  orInvoiceNo: string;
  permitRslNo: string;

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
  nameOfDealer: "",
  authorizedSellerBuyer: "",
  orInvoiceNo: "",
  permitRslNo: "",
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

export const derivePermitAppTypeFromStep3 = (variantStr?: string): PermitApplicationType => {
  const upper = (variantStr || "").toUpperCase();
  if (upper.includes("STORAGE")) return "Possess for storage";
  if (upper.includes("PURCHASE/POSSESS") || upper.includes("PURCHASE / POSSESS")) return "Purchase/Possess";
  if (upper.includes("PURCHASE")) return "Purchase";
  if (upper.includes("SELL") || upper.includes("TRANSFER")) return "Sell/Transfer";
  if (upper.includes("POSSESS")) return "Possess";
  return "Possess for storage";
};

