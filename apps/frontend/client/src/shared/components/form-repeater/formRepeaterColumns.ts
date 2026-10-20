import { FormRepeaterColumn } from "./formRepeaterTypes";
import { FIELD_ID_DEVICES } from "../../constants/fieldIds";

export const DEFAULT_PERMIT_EQUIPMENT_COLUMNS: FormRepeaterColumn[] = [
  { key: "makeTypeModel", label: "Make / Type / Model", placeholder: "e.g. ICOM IC-7300 / Motorola XiR P8668i", required: true },
  { key: "equipments", label: "Equipment Units (Unique Frequency & Serial Number)", type: "equipments", required: true },
];

export const DEFAULT_EQUIPMENT_REPEATER_COLUMNS: FormRepeaterColumn[] = [
  { key: "makeTypeModel", label: "Make / Type / Model", placeholder: "e.g. ICOM IC-7300 / Motorola XiR P8668i", required: true },
  { key: "equipments", label: "Equipment Units (Unique Frequency & Serial Number)", type: "equipments", required: true },
];

export const DEFAULT_AMATEUR_EQUIPMENT_REPEATER_COLUMNS: FormRepeaterColumn[] = [
  { key: "makeTypeModel", label: "Make / Type / Model", placeholder: "e.g. ICOM IC-7300 / Yaesu FT-991A", required: true },
  { key: "equipments", label: "Equipment Units (Unique Frequency & Serial Number)", type: "equipments", required: true },
];

export const DEFAULT_AMATEUR_PROPOSED_EQUIPMENT_COLUMNS: FormRepeaterColumn[] = [
  { key: "makeTypeModel", label: "Make / Type / Model", placeholder: "e.g. ICOM IC-7300 / Kenwood TS-590SG", required: true },
  { key: "equipments", label: "Equipment Units (Unique Frequency & Serial Number)", type: "equipments", required: true },
];

export const DEFAULT_AMATEUR_PURCHASE_PARTICULARS_COLUMNS: FormRepeaterColumn[] = [
  {
    key: "classOfStation",
    label: "Class of Station",
    type: "select",
    required: true,
    placeholder: "Select Class of Station...",
    options: [
      { label: "RT", value: "RT" },
      { label: "FX", value: "FX" },
      { label: "FB", value: "FB" },
      { label: "FX/FB", value: "FX/FB" },
      { label: "ML", value: "ML" },
      { label: "P", value: "P" },
      { label: "Others", value: "Others" },
    ],
  },
];

export const DEFAULT_AERO_PURCHASE_PARTICULARS_COLUMNS: FormRepeaterColumn[] = [
  {
    key: "classOfStation",
    label: "Class of Station",
    type: "select",
    required: true,
    placeholder: "Select Class of Station...",
    options: [
      { label: "FA", value: "FA" },
      { label: "MA", value: "MA" },
    ],
  },
];

export const DEFAULT_AMATEUR_ANTENNA_REPEATER_COLUMNS: FormRepeaterColumn[] = [
  { key: "antennaType", label: "Type", placeholder: "e.g. Yagi-Uda, Dipole, Vertical", required: true },
  { key: "height", label: "Height (cm.)", placeholder: "e.g. 1500 cm", required: false },
  { key: "gain", label: "Gain (dB)", placeholder: "e.g. 9 dB", required: false },
  { key: "directivity", label: "Directivity", placeholder: "e.g. Directional", required: false },
  { key: "diameter", label: "Diameter", placeholder: "e.g. 2.5m", required: false },
  { key: "polarization", label: "Polarization", placeholder: "e.g. Vertical", required: false },
  { key: "bandwidth", label: "Bandwidth", placeholder: "e.g. 4 MHz", required: false },
  { key: "remarks", label: "Remarks", placeholder: "e.g. Base station antenna", required: false },
];

export const DEFAULT_ANTENNA_REPEATER_COLUMNS: FormRepeaterColumn[] = [
  { key: "antennaType", label: "Antenna Type", placeholder: "e.g. Yagi-Uda, Dipole, Vertical", required: true },
  { key: "height", label: "Height (m)", placeholder: "e.g. 15m", required: false },
  { key: "gain", label: "Gain (dBi)", placeholder: "e.g. 9 dBi", required: false },
  { key: "polarization", label: "Directivity / Polarization", placeholder: "e.g. Directional / Vertical", required: false },
];

export const DEFAULT_DEVICE_REPEATER_COLUMNS: FormRepeaterColumn[] = [
  {
    key: "deviceType",
    label: "Device / Equipment Type",
    type: "select",
    required: true,
    options: [
      { label: "Wireless Data Network (WDN) - Indoor", value: "Wireless Data Network (WDN) - Indoor" },
      { label: "Short Range Devices (SRD)", value: "Short Range Devices (SRD)" },
      { label: "Radio Frequency Identification (RFID) Devices", value: "Radio Frequency Identification (RFID) Devices" },
      { label: "Short Range Radio Services (SRRS) Devices", value: "Short Range Radio Services (SRRS) Devices" },
      { label: "Public Trunked Radio Equipment (Mobile/Portable)", value: "Public Trunked Radio Equipment (Mobile/Portable)" },
    ],
  },
  { key: "makeTypeModel", label: "Make / Type / Model", placeholder: "e.g. Cisco Catalyst 9120AX / Zebra FX9600", required: true },
  {
    key: "equipmentSerials",
    label: "Equipment Serial Numbers",
    type: "serials",
    placeholder: "e.g. SN-00123",
    required: true,
  },
];

export const DEFAULT_OFFICER_REPEATER_COLUMNS: FormRepeaterColumn[] = [
  { key: "name", label: "Officer Full Name", placeholder: "e.g. Juan dela Cruz", required: true },
  { key: "licenseNo", label: "Certificate / License No.", placeholder: "e.g. 1RTG-10293", required: true },
  { key: "rating", label: "Class / Rating", placeholder: "e.g. First Class Commercial", required: false },
  { key: "expiryDate", label: "Validity / Expiry Date", type: "date", required: false },
];

export const DEFAULT_TVRO_EQUIPMENT_COLUMNS: FormRepeaterColumn[] = [
  {
    key: "type",
    label: "Type",
    type: "select",
    required: true,
    options: [
      { label: "LNA/LNB", value: "LNA/LNB" },
      { label: "Receivers", value: "Receivers" },
      { label: "Combiner/s", value: "Combiner/s" },
      { label: "Modulators", value: "Modulators" },
    ],
  },
  { key: "makeTypeModel", label: "Make/Type/Model", placeholder: "e.g. Harmonic ProView 7100", required: true },
  { key: "serialNumber", label: "Serial Number", placeholder: "e.g. SN-8920194", required: true },
  { key: "frequencyRange", label: "Frequency Range", placeholder: "e.g. 3.7 - 4.2 GHz (C-Band)", required: true },
];

export const DEFAULT_TVRO_ANTENNA_COLUMNS: FormRepeaterColumn[] = [
  { key: "makeTypeModel", label: "Make/Type/Model", placeholder: "e.g. Patriot 3.8m Prime Focus", required: false },
  { key: "dishDiameter", label: "Dish Diameter", placeholder: "e.g. 3.8 meters", required: false },
  { key: "polarization", label: "Polarization", placeholder: "e.g. Dual Linear (H/V) / Circular", required: false },
  { key: "azimuth", label: "Azimuth", placeholder: "e.g. 142.5° True", required: false },
];

export const DEFAULT_TVRO_SIGNAL_COLUMNS: FormRepeaterColumn[] = [
  { key: "satellite", label: "Satellite", placeholder: "e.g. Asiasat 7 (105.5°E)", required: false },
  { key: "receivedFrequency", label: "Received Frequency", placeholder: "e.g. 3840 MHz", required: false },
  { key: "polarization", label: "Polarization", placeholder: "e.g. Vertical / Horizontal", required: false },
  { key: "nameOfPrograms", label: "Name of Programs", placeholder: "e.g. News, Educational Feeds", required: false },
];

export const DEFAULT_REQUEST_DEVICE_REPEATER_COLUMNS: FormRepeaterColumn[] = [
  { key: "make_model_type", label: "Make / Type / Model", placeholder: "e.g. Apple iPhone 15 Pro / Samsung Galaxy S24", required: true },
  { key: "imei_number", label: "IMEI Number (15 Digits)", type: "number", placeholder: "e.g. 356789012345678", required: true },
];

export const DEFAULT_REQUEST_SIM_REPEATER_COLUMNS: FormRepeaterColumn[] = [
  { key: "mobile_number", label: "Mobile Number", placeholder: "09XXXXXXXXX or +639XXXXXXXXX", required: true },
  {
    key: "telco_provider",
    label: "Network / Telco Provider",
    type: "select",
    placeholder: "Select provider...",
    required: false,
    options: [
      { label: "Smart / TNT", value: "Smart / TNT" },
      { label: "Globe / TM", value: "Globe / TM" },
      { label: "DITO", value: "DITO" },
      { label: "Others", value: "Others" },
    ],
  },
];

export const DEFAULT_COMPLAINT_ATTACHMENT_REPEATER_COLUMNS: FormRepeaterColumn[] = [
  { key: "document_description", label: "Document Description", placeholder: "e.g. Screenshot of Spam / Billing Statement / Official Receipt", required: true },
  { key: "attachment_file", label: "Attached Document / File", type: "file", placeholder: "Upload file", required: true },
];

export function resolveRepeaterColumns(
  fieldKey?: string,
  fieldLabel?: string,
  customColumns?: FormRepeaterColumn[]
): FormRepeaterColumn[] {
  if (customColumns && customColumns.length > 0) {
    return customColumns;
  }

  const keyLower = (fieldKey || "").toLowerCase();
  const labelLower = (fieldLabel || "").toLowerCase();

  // Requests: SIM Card / Mobile Numbers
  if (
    keyLower.includes("sim_mobile_numbers") ||
    keyLower.includes("simmobilenumbers") ||
    keyLower.includes("sim_details") ||
    keyLower.includes("simcard") ||
    labelLower.includes("sim card") ||
    labelLower.includes("mobile number")
  ) {
    return DEFAULT_REQUEST_SIM_REPEATER_COLUMNS;
  }

  // Complaints / General: Attached Proof Documents
  if (
    keyLower.includes("attached_proof_documents") ||
    keyLower.includes("attachedproof") ||
    keyLower.includes("complaint_proof") ||
    labelLower.includes("attached proof") ||
    labelLower.includes("supporting document")
  ) {
    return DEFAULT_COMPLAINT_ATTACHMENT_REPEATER_COLUMNS;
  }

  // Requests: Blocking / Unblocking GSM Handset Device Particulars
  if (
    keyLower.includes("device_particulars") ||
    keyLower.includes("deviceparticulars") ||
    keyLower.includes("imei") ||
    labelLower.includes("device particulars") ||
    labelLower.includes("imei") ||
    labelLower.includes("handset")
  ) {
    return DEFAULT_REQUEST_DEVICE_REPEATER_COLUMNS;
  }

  // TVRO specific matchers
  if (
    keyLower.includes("tvro_signal") ||
    keyLower.includes("tvrosignal") ||
    keyLower.includes("signalreception") ||
    keyLower.includes("tvrosignaldetails") ||
    labelLower.includes("signal to be received") ||
    labelLower.includes("particulars of signal")
  ) {
    return DEFAULT_TVRO_SIGNAL_COLUMNS;
  }
  if (
    keyLower.includes("tvro_antenna") ||
    keyLower.includes("tvroantenna") ||
    keyLower.includes("antennasystem") ||
    keyLower.includes("tvroantennadetails") ||
    (keyLower.includes("antenna") && labelLower.includes("tvro")) ||
    labelLower.includes("particulars of antenna system") ||
    labelLower.includes("antenna system")
  ) {
    return DEFAULT_TVRO_ANTENNA_COLUMNS;
  }
  if (
    keyLower.includes("tvro_equipment") ||
    keyLower.includes("tvroequipment") ||
    keyLower.includes("tvroequipmentdetails") ||
    keyLower.includes("tvrodetails") ||
    (keyLower.includes("equipment") && keyLower.includes("tvro")) ||
    (labelLower.includes("equipment") && labelLower.includes("tvro"))
  ) {
    return DEFAULT_TVRO_EQUIPMENT_COLUMNS;
  }

  if (
    keyLower.includes("aeroparticulars") ||
    keyLower.includes("aerostationparticulars") ||
    keyLower.includes("aeropurchase") ||
    (keyLower.includes("particulars") && (keyLower.includes("aero") || labelLower.includes("aero")))
  ) {
    return DEFAULT_AERO_PURCHASE_PARTICULARS_COLUMNS;
  }

  if (
    keyLower === "particulars" ||
    keyLower.includes("purchaseparticulars") ||
    keyLower.includes("classofstationparticulars") ||
    keyLower.includes("purchaseequipments")
  ) {
    return DEFAULT_AMATEUR_PURCHASE_PARTICULARS_COLUMNS;
  }

  if (
    keyLower.includes("equipment") ||
    keyLower.includes("equipmentdetails") ||
    keyLower.includes("proposedequipment") ||
    keyLower.includes("proposed_equipment") ||
    labelLower.includes("proposed equipment") ||
    labelLower.includes("particulars of equipment")
  ) {
    return DEFAULT_PERMIT_EQUIPMENT_COLUMNS;
  }

  if (keyLower.includes("antenna") || labelLower.includes("antenna")) {
    return DEFAULT_AMATEUR_ANTENNA_REPEATER_COLUMNS;
  }
  if (
    keyLower.includes("device") ||
    keyLower.includes("devicesdetails") ||
    keyLower === FIELD_ID_DEVICES.toLowerCase() ||
    labelLower.includes("device") ||
    labelLower.includes("registered devices") ||
    labelLower.includes("wdn") ||
    labelLower.includes("srd") ||
    labelLower.includes("rfid")
  ) {
    return DEFAULT_DEVICE_REPEATER_COLUMNS;
  }
  if (keyLower.includes("officer") || keyLower.includes("personnel") || labelLower.includes("officer")) {
    return DEFAULT_OFFICER_REPEATER_COLUMNS;
  }

  return DEFAULT_PERMIT_EQUIPMENT_COLUMNS;
}
