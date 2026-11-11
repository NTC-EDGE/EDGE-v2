import { RepeaterColumn } from "../types";

export const DEFAULT_EQUIPMENT_COLUMNS: RepeaterColumn[] = [
  { id: "col-1", key: "equipmentType", label: "Equipment Type", type: "text", placeholder: "e.g. Transmitter / Transceiver", required: true },
  { id: "col-2", key: "make", label: "Make / Brand", type: "text", placeholder: "e.g. Motorola, Icom", required: true },
  { id: "col-3", key: "model", label: "Model No.", type: "text", placeholder: "e.g. IC-7300", required: true },
  { id: "col-4", key: "serialNumber", label: "Serial Number", type: "text", placeholder: "e.g. SN-12345678", required: true },
  { id: "col-5", key: "powerOutput", label: "Power (Watts)", type: "number", placeholder: "e.g. 50", required: false },
  { id: "col-6", key: "frequency", label: "Frequency (MHz)", type: "text", placeholder: "e.g. 144-148 MHz", required: false },
];

export const DEFAULT_REQUEST_DEVICE_COLUMNS: RepeaterColumn[] = [
  { id: "col-1", key: "make_model_type", label: "Make / Type / Model", type: "text", placeholder: "e.g. Apple iPhone 15 Pro / Samsung Galaxy S24", required: true },
  { id: "col-2", key: "imei_number", label: "IMEI Number (15 Digits)", type: "number", placeholder: "e.g. 356789012345678", required: true },
];

export const DEFAULT_REQUEST_SIM_COLUMNS: RepeaterColumn[] = [
  { id: "col-1", key: "mobile_number", label: "Mobile Number", type: "text", placeholder: "09XXXXXXXXX or +639XXXXXXXXX", required: true },
  {
    id: "col-2",
    key: "telco_provider",
    label: "Network / Telco Provider",
    type: "select",
    required: false,
    options: [
      { id: "opt-1", label: "Smart / TNT", value: "Smart / TNT" },
      { id: "opt-2", label: "Globe / TM", value: "Globe / TM" },
      { id: "opt-3", label: "DITO", value: "DITO" },
      { id: "opt-4", label: "Others", value: "Others" },
    ],
  },
];

export const DEFAULT_COMPLAINT_ATTACHMENT_COLUMNS: RepeaterColumn[] = [
  { id: "col-1", key: "document_description", label: "Document Description", type: "text", placeholder: "e.g. Screenshot of Spam / Billing Statement / Official Receipt", required: true },
  { id: "col-2", key: "attachment_file", label: "Attached Document / File", type: "file", placeholder: "Upload file", required: true },
];

export const DEFAULT_STATION_PARTICULARS_COLUMNS: RepeaterColumn[] = [
  {
    id: "col-1",
    key: "stationClass",
    label: "Station Class",
    type: "select",
    required: true,
    options: [
      { id: "sc-1", label: "RT", value: "RT" },
      { id: "sc-2", label: "FX", value: "FX" },
      { id: "sc-3", label: "FB", value: "FB" },
      { id: "sc-4", label: "FX/FB", value: "FX/FB" },
      { id: "sc-5", label: "ML", value: "ML" },
      { id: "sc-6", label: "P", value: "P" },
      { id: "sc-7", label: "Others", value: "Others" },
    ],
  },
  { id: "col-2", key: "exactLocation", label: "Exact Location", type: "text", placeholder: "Enter Exact Station Location...", required: true },
  { id: "col-3", key: "longitude", label: "Longitude", type: "text", placeholder: `e.g. 121° 02' 35" E`, required: false },
  { id: "col-4", key: "latitude", label: "Latitude", type: "text", placeholder: `e.g. 14° 38' 20" N`, required: false },
  { id: "col-5", key: "configuration", label: "Configuration", type: "text", placeholder: "e.g. Simplex, Duplex, Repeater", required: false },
  { id: "col-6", key: "dataRate", label: "Data Rate", type: "text", placeholder: "e.g. 1200 bps, 9600 bps", required: false },
  { id: "col-7", key: "remarks", label: "Remarks", type: "text", placeholder: "e.g. Station remarks", required: false },
  { id: "col-8", key: "makeTypeModel", label: "Particulars of Equipment (Make / Type / Model)", type: "text", placeholder: "e.g. ICOM IC-7300 / Kenwood TS-590SG", required: true },
  { id: "col-9", key: "equipments", label: "Equipment Units (Unique Frequency & Serial Number)", type: "equipments", required: true },
];

export const DEFAULT_DEVICE_REGISTRATION_COLUMNS: RepeaterColumn[] = [
  {
    id: "col-1",
    key: "deviceType",
    label: "Equipment Type",
    type: "select",
    required: true,
    options: [
      { id: "dt-1", label: "Wireless Data Network (WDN) - Indoor", value: "Wireless Data Network (WDN) - Indoor" },
      { id: "dt-2", label: "Short Range Devices (SRD)", value: "Short Range Devices (SRD)" },
      { id: "dt-3", label: "Radio Frequency Identification (RFID) Devices", value: "Radio Frequency Identification (RFID) Devices" },
      { id: "dt-4", label: "Short Range Radio Services (SRRS) Devices", value: "Short Range Radio Services (SRRS) Devices" },
      { id: "dt-5", label: "Public Trunked Radio Equipment (Mobile/Portable)", value: "Public Trunked Radio Equipment (Mobile/Portable)" },
    ],
  },
  { id: "col-2", key: "makeTypeModel", label: "Make/Type/Model", type: "text", placeholder: "e.g. Cisco Catalyst 9120AXI / Zebra FX9600", required: true },
  { id: "col-3", key: "serialNumbers", label: "Serial Number(s)", type: "serials", placeholder: "Enter Serial Number", required: true },
];

export const DEFAULT_TVRO_EQUIPMENT_COLUMNS: RepeaterColumn[] = [
  { id: "col-1", key: "makeTypeModel", label: "Make/Type/Model", type: "text", placeholder: "e.g. Harmonic ProView 8100", required: true },
  { id: "col-2", key: "serialNumbers", label: "Serial Number(s)", type: "serials", placeholder: "Enter Serial Number", required: true },
  { id: "col-3", key: "frequencyRange", label: "Frequency Range", type: "text", placeholder: "e.g. 3.4 - 4.2 GHz (C-Band)", required: true },
];

export const DEFAULT_TVRO_ANTENNA_COLUMNS: RepeaterColumn[] = [
  { id: "col-1", key: "antennaType", label: "Type", type: "text", placeholder: "e.g. Parabolic Dish", required: true },
  { id: "col-2", key: "diameter", label: "Diameter (m)", type: "text", placeholder: "e.g. 3.7m", required: false },
  { id: "col-3", key: "gain", label: "Gain (dBi)", type: "text", placeholder: "e.g. 41.5 dBi", required: false },
  { id: "col-4", key: "directivity", label: "Directivity", type: "text", placeholder: "e.g. Directional", required: false },
  { id: "col-5", key: "heightAboveGround", label: "Height Above Ground (m)", type: "text", placeholder: "e.g. 15m", required: false },
  { id: "col-6", key: "azimuthAngle", label: "Azimuth Angle (deg)", type: "text", placeholder: "e.g. 142.5°", required: false },
  { id: "col-7", key: "elevationAngle", label: "Elevation Angle (deg)", type: "text", placeholder: "e.g. 58.2°", required: false },
  { id: "col-8", key: "polarization", label: "Polarization", type: "text", placeholder: "e.g. Linear (H/V) or Circular", required: false },
  { id: "col-9", key: "horBeamwidth", label: "Hor. Beamwidth", type: "text", placeholder: "e.g. 1.4°", required: false },
  { id: "col-10", key: "verBeamwidth", label: "Ver. Beamwidth", type: "text", placeholder: "e.g. 1.4°", required: false },
];

export const DEFAULT_TVRO_SIGNAL_COLUMNS: RepeaterColumn[] = [
  { id: "col-1", key: "satelliteName", label: "Name of Satellite", type: "text", placeholder: "e.g. Measat-3a / Apstar-7", required: true },
  { id: "col-2", key: "orbitalLocation", label: "Orbital Location (deg)", type: "text", placeholder: "e.g. 91.5° E", required: false },
  { id: "col-3", key: "transponderNo", label: "Transponder No.", type: "text", placeholder: "e.g. TP-12", required: false },
  { id: "col-4", key: "downlinkFreq", label: "Downlink Freq (MHz)", type: "text", placeholder: "e.g. 3960 MHz", required: false },
  { id: "col-5", key: "bandwidth", label: "Bandwidth (MHz)", type: "text", placeholder: "e.g. 36 MHz", required: false },
  { id: "col-6", key: "polarity", label: "Polarity", type: "text", placeholder: "e.g. Horizontal / Vertical", required: false },
  { id: "col-7", key: "symbolRate", label: "Symbol Rate", type: "text", placeholder: "e.g. 27500 Msps", required: false },
  { id: "col-8", key: "programName", label: "Program / Channel Name", type: "text", placeholder: "e.g. HBO Asia / CNN International", required: true },
  { id: "col-9", key: "programProvider", label: "Program Provider", type: "text", placeholder: "e.g. Warner Bros. Discovery", required: false },
];

export const DEFAULT_OFFICER_REPEATER_COLUMNS: RepeaterColumn[] = [
  { id: "col-1", key: "officerName", label: "Full Name of Officer / Engineer", type: "text", placeholder: "e.g. Engr. Juan Dela Cruz", required: true },
  { id: "col-2", key: "certificateType", label: "License / Certificate Type", type: "text", placeholder: "e.g. PECE / ECE / 1PHN / GOC", required: true },
  { id: "col-3", key: "registrationNo", label: "PRC / NTC License No.", type: "text", placeholder: "e.g. 0012345", required: true },
  { id: "col-4", key: "expiryDate", label: "Validity / Expiry Date", type: "date", placeholder: "YYYY-MM-DD", required: false },
];

export function resolveDefaultRepeaterColumns(label?: string, fieldId?: string): RepeaterColumn[] {
  const lbl = (label || "").toLowerCase();
  const fid = (fieldId || "").toLowerCase();
  if (fid.includes("device_particulars") || lbl.includes("device particulars") || lbl.includes("imei") || lbl.includes("handset")) {
    return [...DEFAULT_REQUEST_DEVICE_COLUMNS];
  }
  if (lbl.includes("sim") || fid.includes("sim_mobile_numbers") || lbl.includes("mobile number")) {
    return [...DEFAULT_REQUEST_SIM_COLUMNS];
  }
  if (lbl.includes("proof") || lbl.includes("attachment") || fid.includes("attached_proof_documents")) {
    return [...DEFAULT_COMPLAINT_ATTACHMENT_COLUMNS];
  }
  if (fid === "particulars" || fid === "fd000000-0000-0000-0000-000000000340" || lbl === "particulars") {
    return [...DEFAULT_STATION_PARTICULARS_COLUMNS];
  }
  if (fid.includes("devicesdetails") || lbl.includes("registered devices") || lbl.includes("wdn") || lbl.includes("srd") || lbl.includes("rfid")) {
    return [...DEFAULT_DEVICE_REGISTRATION_COLUMNS];
  }
  if (fid.includes("tvroequipment") || (lbl.includes("particulars of equipment") && fid.includes("223"))) {
    return [...DEFAULT_TVRO_EQUIPMENT_COLUMNS];
  }
  if (fid.includes("tvroantenna") || lbl.includes("antenna")) {
    return [...DEFAULT_TVRO_ANTENNA_COLUMNS];
  }
  if (fid.includes("tvrosignal") || lbl.includes("signal")) {
    return [...DEFAULT_TVRO_SIGNAL_COLUMNS];
  }
  if (fid.includes("officer") || fid.includes("personnel") || lbl.includes("officer") || lbl.includes("personnel")) {
    return [...DEFAULT_OFFICER_REPEATER_COLUMNS];
  }
  return [...DEFAULT_EQUIPMENT_COLUMNS];
}
