export type PaperSize = 'letter' | 'a4' | 'legal' | 'folio' | 'custom';

export type PrintOutputMode = 'plain_paper' | 'accountable_form' | 'alignment_test';

export type PageOrientation = 'portrait' | 'landscape';

export interface PaperDimensions {
  name: string;
  widthMm: number;
  heightMm: number;
  description: string;
}

export const PAPER_DIMENSIONS: Record<PaperSize, PaperDimensions> = {
  letter: {
    name: 'Letter (Short Bond)',
    widthMm: 215.9,
    heightMm: 279.4,
    description: '8.5" x 11" (Standard Certificates & Slips)',
  },
  a4: {
    name: 'A4 (ISO Standard)',
    widthMm: 210,
    heightMm: 297,
    description: '210 x 297 mm (Official SOA & International Permits)',
  },
  folio: {
    name: 'Folio (Short Legal / 8.5" x 13")',
    widthMm: 215.9,
    heightMm: 330.2,
    description: '8.5" x 13" (Philippine Government Standard Long Bond)',
  },
  legal: {
    name: 'Legal (8.5" x 14")',
    widthMm: 215.9,
    heightMm: 355.6,
    description: '8.5" x 14" (Commercial Station Licenses)',
  },
  custom: {
    name: 'Custom Dimensions',
    widthMm: 215.9,
    heightMm: 279.4,
    description: 'Custom Width x Height in Millimeters',
  },
};

export interface PrinterCalibration {
  offsetXmm: number;
  offsetYmm: number;
  scalePercent: number;
}

export interface DocumentPrintOptions {
  paperSize: PaperSize;
  outputMode: PrintOutputMode;
  orientation: PageOrientation;
  customWidthMm?: number;
  customHeightMm?: number;
  calibration: PrinterCalibration;
  showGhostWatermark?: boolean;
  selectedTemplateId?: string;
  issuedDocumentType?: string;
  formNumber?: string;
  licenseNumber?: string;
  callSign?: string;
  stationClass?: string;
  frequencyBand?: string;
  issueDate?: string;
  expiryDate?: string;
  officialReceiptNumber?: string;
  orDate?: string;
  signatoryName?: string;
  signatoryTitle?: string;
  remarks?: string;
}

export interface AccountableFormFieldCoordinate {
  id: string;
  label: string;
  topMm: number;
  leftMm: number;
  widthMm?: number;
  heightMm?: number;
  fontSizePt?: number;
  fontWeight?: 'normal' | 'bold' | '600' | '700';
  textAlign?: 'left' | 'center' | 'right';
  isMonospace?: boolean;
  uppercase?: boolean;
}

export interface AccountableFormTemplate {
  id: string;
  code: string;
  title: string;
  category: 'Licenses' | 'Permits' | 'Certificates' | 'Receipts' | 'General';
  defaultPaperSize: PaperSize;
  defaultOrientation: PageOrientation;
  dimensions: {
    widthMm: number;
    heightMm: number;
  };
  fields: AccountableFormFieldCoordinate[];
}

export const ACCOUNTABLE_FORM_TEMPLATES: AccountableFormTemplate[] = [
  {
    id: 'NTC-FORM-101',
    code: 'NTC Form No. 101',
    title: 'Radio Station License (RSL)',
    category: 'Licenses',
    defaultPaperSize: 'folio',
    defaultOrientation: 'portrait',
    dimensions: { widthMm: 215.9, heightMm: 330.2 },
    fields: [
      { id: 'licenseNumber', label: 'License No.', topMm: 42, leftMm: 145, widthMm: 55, fontSizePt: 11, fontWeight: 'bold', textAlign: 'right', isMonospace: true },
      { id: 'formNumber', label: 'Form Serial No.', topMm: 48, leftMm: 145, widthMm: 55, fontSizePt: 10, textAlign: 'right', isMonospace: true },
      { id: 'applicantName', label: 'Name of Licensee', topMm: 62, leftMm: 30, widthMm: 155, fontSizePt: 12, fontWeight: 'bold', uppercase: true },
      { id: 'address', label: 'Postal / Station Address', topMm: 73, leftMm: 30, widthMm: 155, fontSizePt: 9.5 },
      { id: 'callSign', label: 'Call Sign', topMm: 92, leftMm: 30, widthMm: 45, fontSizePt: 12, fontWeight: 'bold', isMonospace: true, uppercase: true },
      { id: 'stationClass', label: 'Class of Station', topMm: 92, leftMm: 85, widthMm: 50, fontSizePt: 10 },
      { id: 'serviceCategory', label: 'Service Type', topMm: 92, leftMm: 140, widthMm: 45, fontSizePt: 10 },
      { id: 'frequencyBand', label: 'Authorized Frequencies', topMm: 112, leftMm: 30, widthMm: 155, fontSizePt: 9.5, isMonospace: true },
      { id: 'equipmentDetails', label: 'Transceiver Make / Model / Power', topMm: 130, leftMm: 30, widthMm: 155, fontSizePt: 9.5 },
      { id: 'issueDate', label: 'Date Issued', topMm: 195, leftMm: 30, widthMm: 45, fontSizePt: 9.5 },
      { id: 'expiryDate', label: 'Date of Expiration', topMm: 195, leftMm: 85, widthMm: 45, fontSizePt: 10, fontWeight: 'bold' },
      { id: 'orNumber', label: 'Official Receipt No.', topMm: 195, leftMm: 140, widthMm: 45, fontSizePt: 9.5, isMonospace: true },
      { id: 'signatoryName', label: 'Authorized Signatory', topMm: 245, leftMm: 120, widthMm: 70, fontSizePt: 11, fontWeight: 'bold', textAlign: 'center', uppercase: true },
      { id: 'signatoryTitle', label: 'Signatory Position', topMm: 251, leftMm: 120, widthMm: 70, fontSizePt: 9, textAlign: 'center' },
      { id: 'qrCode', label: 'Verification QR Code (Upper Right)', topMm: 16, leftMm: 172, widthMm: 24, heightMm: 24 },
    ],
  },
  {
    id: 'NTC-FORM-102',
    code: 'NTC Form No. 102',
    title: 'Radio Operator Certificate / Amateur License',
    category: 'Certificates',
    defaultPaperSize: 'letter',
    defaultOrientation: 'portrait',
    dimensions: { widthMm: 215.9, heightMm: 279.4 },
    fields: [
      { id: 'formNumber', label: 'Certificate No.', topMm: 38, leftMm: 140, widthMm: 55, fontSizePt: 11, fontWeight: 'bold', textAlign: 'right', isMonospace: true },
      { id: 'applicantName', label: 'Operator Full Name', topMm: 58, leftMm: 28, widthMm: 160, fontSizePt: 13, fontWeight: 'bold', uppercase: true },
      { id: 'address', label: 'Home Address', topMm: 68, leftMm: 28, widthMm: 160, fontSizePt: 9.5 },
      { id: 'callSign', label: 'Amateur Call Sign', topMm: 86, leftMm: 28, widthMm: 50, fontSizePt: 12, fontWeight: 'bold', isMonospace: true, uppercase: true },
      { id: 'stationClass', label: 'Operator Class / Level', topMm: 86, leftMm: 88, widthMm: 50, fontSizePt: 10.5, fontWeight: '600' },
      { id: 'birthDate', label: 'Date of Birth', topMm: 86, leftMm: 142, widthMm: 45, fontSizePt: 9.5 },
      { id: 'issueDate', label: 'Issued Date', topMm: 155, leftMm: 28, widthMm: 45, fontSizePt: 9.5 },
      { id: 'expiryDate', label: 'Valid Until', topMm: 155, leftMm: 85, widthMm: 45, fontSizePt: 10, fontWeight: 'bold' },
      { id: 'orNumber', label: 'OR Reference', topMm: 155, leftMm: 140, widthMm: 45, fontSizePt: 9.5, isMonospace: true },
      { id: 'signatoryName', label: 'Regional Director / Officer', topMm: 210, leftMm: 115, widthMm: 75, fontSizePt: 11, fontWeight: 'bold', textAlign: 'center', uppercase: true },
      { id: 'signatoryTitle', label: 'Official Designation', topMm: 216, leftMm: 115, widthMm: 75, fontSizePt: 9, textAlign: 'center' },
      { id: 'qrCode', label: 'QR Authenticator (Upper Right)', topMm: 16, leftMm: 172, widthMm: 24, heightMm: 24 },
    ],
  },
  {
    id: 'NTC-FORM-301',
    code: 'NTC Form No. 301',
    title: 'Certificate of Registration & Permits',
    category: 'Permits',
    defaultPaperSize: 'letter',
    defaultOrientation: 'portrait',
    dimensions: { widthMm: 215.9, heightMm: 279.4 },
    fields: [
      { id: 'formNumber', label: 'Permit / Cert No.', topMm: 40, leftMm: 135, widthMm: 60, fontSizePt: 11, fontWeight: 'bold', textAlign: 'right', isMonospace: true },
      { id: 'applicantName', label: 'Registrant / Company Name', topMm: 60, leftMm: 28, widthMm: 160, fontSizePt: 12, fontWeight: 'bold', uppercase: true },
      { id: 'address', label: 'Registered Business Address', topMm: 71, leftMm: 28, widthMm: 160, fontSizePt: 9.5 },
      { id: 'serviceName', label: 'Service / Equipment Description', topMm: 88, leftMm: 28, widthMm: 160, fontSizePt: 10 },
      { id: 'remarks', label: 'Conditions & Authorizations', topMm: 108, leftMm: 28, widthMm: 160, fontSizePt: 9 },
      { id: 'issueDate', label: 'Issued On', topMm: 165, leftMm: 28, widthMm: 45, fontSizePt: 9.5 },
      { id: 'expiryDate', label: 'Expiry Date', topMm: 165, leftMm: 85, widthMm: 45, fontSizePt: 10, fontWeight: 'bold' },
      { id: 'orNumber', label: 'OR Number', topMm: 165, leftMm: 140, widthMm: 45, fontSizePt: 9.5, isMonospace: true },
      { id: 'signatoryName', label: 'Commissioner / Director', topMm: 215, leftMm: 115, widthMm: 75, fontSizePt: 11, fontWeight: 'bold', textAlign: 'center', uppercase: true },
      { id: 'signatoryTitle', label: 'Official Title', topMm: 221, leftMm: 115, widthMm: 75, fontSizePt: 9, textAlign: 'center' },
      { id: 'qrCode', label: 'Digital Seal QR (Upper Right)', topMm: 16, leftMm: 172, widthMm: 24, heightMm: 24 },
    ],
  },
  {
    id: 'AF-51',
    code: 'Accountable Form No. 51',
    title: 'Official Receipt (General)',
    category: 'Receipts',
    defaultPaperSize: 'letter',
    defaultOrientation: 'portrait',
    dimensions: { widthMm: 215.9, heightMm: 279.4 },
    fields: [
      { id: 'orNumber', label: 'OR Serial No.', topMm: 32, leftMm: 145, widthMm: 50, fontSizePt: 12, fontWeight: 'bold', textAlign: 'right', isMonospace: true },
      { id: 'issueDate', label: 'Payment Date', topMm: 32, leftMm: 35, widthMm: 50, fontSizePt: 10 },
      { id: 'agency', label: 'Agency / Office', topMm: 45, leftMm: 35, widthMm: 140, fontSizePt: 9.5 },
      { id: 'applicantName', label: 'Payor Full Name', topMm: 54, leftMm: 35, widthMm: 140, fontSizePt: 11, fontWeight: 'bold', uppercase: true },
      { id: 'totalAmount', label: 'Total Amount (PHP)', topMm: 120, leftMm: 135, widthMm: 45, fontSizePt: 11, fontWeight: 'bold', textAlign: 'right' },
      { id: 'amountInWords', label: 'Amount in Words', topMm: 132, leftMm: 35, widthMm: 145, fontSizePt: 9, uppercase: true },
      { id: 'signatoryName', label: 'Collecting Officer', topMm: 160, leftMm: 115, widthMm: 65, fontSizePt: 10, fontWeight: 'bold', textAlign: 'center', uppercase: true },
    ],
  },
  {
    id: 'NTC-FORM-SOA',
    code: 'NTC Form - SOA Assessment',
    title: 'Statement of Account / Cashier Assessment (Assesment-SOA.pdf)',
    category: 'General',
    defaultPaperSize: 'a4',
    defaultOrientation: 'portrait',
    dimensions: { widthMm: 210, heightMm: 297 },
    fields: [
      { id: 'monthOf', label: 'Month of Assessment', topMm: 24, leftMm: 155, widthMm: 45, fontSizePt: 10, fontWeight: 'bold' },
      { id: 'licenseFee', label: 'License Fee (4-02-01-060)', topMm: 62, leftMm: 155, widthMm: 45, fontSizePt: 10, textAlign: 'right' },
      { id: 'filingFee', label: 'Filing Fee (4-02-01-130)', topMm: 42, leftMm: 155, widthMm: 45, fontSizePt: 10, textAlign: 'right' },
      { id: 'inspectionFee', label: 'Inspection Fee (4-02-01-100)', topMm: 68, leftMm: 155, widthMm: 45, fontSizePt: 10, textAlign: 'right' },
      { id: 'sufFee', label: "Spectrum User's Fee (4-02-01-080)", topMm: 74, leftMm: 155, widthMm: 45, fontSizePt: 10, textAlign: 'right' },
      { id: 'dstFee', label: 'DST (4-01-04-010)', topMm: 232, leftMm: 155, widthMm: 45, fontSizePt: 10, textAlign: 'right' },
      { id: 'totalAmount', label: 'Total Amount Due', topMm: 252, leftMm: 155, widthMm: 45, fontSizePt: 11, fontWeight: 'bold', textAlign: 'right' },
    ],
  },
];

export interface ReportPrintProfile {
  id: string;
  name: string;
  category: 'Cashier' | 'Licensing' | 'Permits' | 'Billing' | 'General';
  description: string;
  defaultPaperSize: PaperSize;
  defaultOutputMode: PrintOutputMode;
  defaultOrientation: PageOrientation;
  defaultCustomWidthMm?: number;
  defaultCustomHeightMm?: number;
  associatedTemplateId?: string;
}

export const REPORT_PRINT_PROFILES: ReportPrintProfile[] = [
  {
    id: 'AF-51',
    name: 'Official Receipt (Accountable Form 51)',
    category: 'Cashier',
    description: 'Cashier & Collection Officer receipts for verified payments',
    defaultPaperSize: 'letter',
    defaultOutputMode: 'accountable_form',
    defaultOrientation: 'portrait',
    associatedTemplateId: 'AF-51',
  },
  {
    id: 'NTC-FORM-101',
    name: 'Radio Station License (RSL - Form 101)',
    category: 'Licensing',
    description: 'Commercial & Amateur Radio Station Licenses (Folio Long Bond)',
    defaultPaperSize: 'folio',
    defaultOutputMode: 'accountable_form',
    defaultOrientation: 'portrait',
    associatedTemplateId: 'NTC-FORM-101',
  },
  {
    id: 'NTC-FORM-102',
    name: 'Radio Operator Certificate (Form 102)',
    category: 'Licensing',
    description: 'Commercial & Amateur Radio Operator Certificate of Authority',
    defaultPaperSize: 'letter',
    defaultOutputMode: 'accountable_form',
    defaultOrientation: 'portrait',
    associatedTemplateId: 'NTC-FORM-102',
  },
  {
    id: 'NTC-FORM-301',
    name: 'Permits & Certificates of Registration (Form 301)',
    category: 'Permits',
    description: 'Equipment registration, dealer permits, and clearances',
    defaultPaperSize: 'letter',
    defaultOutputMode: 'accountable_form',
    defaultOrientation: 'portrait',
    associatedTemplateId: 'NTC-FORM-301',
  },
  {
    id: 'soa',
    name: 'Statement of Account (Assesment-SOA.pdf)',
    category: 'Billing',
    description: 'Official statutory fee calculation and cashier assessment template',
    defaultPaperSize: 'a4',
    defaultOutputMode: 'plain_paper',
    defaultOrientation: 'portrait',
    associatedTemplateId: 'NTC-FORM-SOA',
  },
  {
    id: 'op',
    name: 'Order of Payment (OP)',
    category: 'Billing',
    description: 'Order of Payment voucher for cashier collection',
    defaultPaperSize: 'letter',
    defaultOutputMode: 'plain_paper',
    defaultOrientation: 'portrait',
  },
  {
    id: 'general_statutory',
    name: 'General Statutory License (Plain Bond Paper)',
    category: 'General',
    description: 'Full statutory document layout with official seal watermark & QR',
    defaultPaperSize: 'folio',
    defaultOutputMode: 'plain_paper',
    defaultOrientation: 'portrait',
  },
];

const STORAGE_PROFILE_PREFIX = 'ntc_edge_printer_profile_';

export function getReportProfileStorageKey(profileId: string, userId?: string | null): string {
  const userSegment = userId && userId.trim() ? `${userId.trim()}_` : '';
  return `${STORAGE_PROFILE_PREFIX}${userSegment}${profileId}`;
}

export function loadUserReportPrintConfig(
  profileId: string,
  userId?: string | null
): Partial<DocumentPrintOptions> | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const key = getReportProfileStorageKey(profileId, userId);
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
    if (userId) {
      const globalSaved = localStorage.getItem(getReportProfileStorageKey(profileId));
      if (globalSaved) return JSON.parse(globalSaved);
    }
  } catch {
    // ignore
  }
  return null;
}

export function saveUserReportPrintConfig(
  profileId: string,
  options: {
    paperSize: PaperSize;
    outputMode: PrintOutputMode;
    orientation: PageOrientation;
    customWidthMm?: number;
    customHeightMm?: number;
    offsetXmm: number;
    offsetYmm: number;
  },
  userId?: string | null
): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const key = getReportProfileStorageKey(profileId, userId);
    localStorage.setItem(
      key,
      JSON.stringify({
        ...options,
        updatedAt: new Date().toISOString(),
      })
    );
  } catch {
    // ignore
  }
}
