/**
 * canonicalFormDefinitions.ts
 *
 * Single source of truth for the 13 canonical NTC application forms,
 * their associated services, canonical GUIDs, and view types.
 * Used across Wizard Review, My Applications preview, and the Internal Evaluator Queue.
 */

export type CanonicalFormViewType =
  | 'exam'
  | 'commercial_roc'
  | 'amateur_license'
  | 'ship_station'
  | 'permits'
  | 'radio_station_license'
  | 'cpe_equipment'
  | 'rfid_srd_wdn'
  | 'vas_provider'
  | 'certified_copy'
  | 'tvro_station'
  | 'imei_sim_blocking'
  | 'consumer_complaints';

export interface CanonicalFormMetadata {
  code: string;
  formNumber: string;
  title: string;
  shortTitle: string;
  category: string;
  viewType: CanonicalFormViewType;
  description: string;
  canonicalServiceId: string;
  associatedServiceCodes: string[];
  associatedServiceIds: string[];
}

export const CANONICAL_FORM_METADATA: Record<string, CanonicalFormMetadata> = {
  NTC_1_01: {
    code: 'NTC_1_01',
    formNumber: 'NTC Form 1-01',
    title: 'Application for Radio Operator Examination',
    shortTitle: 'Radio Operator Examination',
    category: 'Examinations',
    viewType: 'exam',
    description: 'Statutory application form for Commercial and Amateur Radio Operator Examinations, admission slips, and examination elements.',
    canonicalServiceId: '50000000-0000-0000-0000-000000000001',
    associatedServiceCodes: ['NTC_1_01'],
    associatedServiceIds: ['50000000-0000-0000-0000-000000000001'],
  },
  NTC_1_02: {
    code: 'NTC_1_02',
    formNumber: 'NTC Form 1-02',
    title: 'Application for Commercial Radio Operator Certificate',
    shortTitle: 'Commercial Radio Operator Certificate',
    category: 'Certificates',
    viewType: 'commercial_roc',
    description: 'Application for First/Second Class Radiotelegraph (1RTG/2RTG), General Operator Certificate (GOC), and Restricted Radiotelephone Operator Certificate.',
    canonicalServiceId: '50000000-0000-0000-0000-000000000002',
    associatedServiceCodes: ['NTC_1_02'],
    associatedServiceIds: ['50000000-0000-0000-0000-000000000002'],
  },
  NTC_1_03: {
    code: 'NTC_1_03',
    formNumber: 'NTC Form 1-03',
    title: 'Application for Amateur Radio Operator Certificate & License',
    shortTitle: 'Amateur Certificate & License',
    category: 'Certificates & Licenses',
    viewType: 'amateur_license',
    description: 'Application for Class A, B, C, and D Amateur Radio Operator Certificates, Amateur Radio Station Licenses, and Club Station Licenses.',
    canonicalServiceId: '50000000-0000-0000-0000-000000000003',
    associatedServiceCodes: ['NTC_1_03', 'NTC_AMA_LICENSES'],
    associatedServiceIds: [
      '50000000-0000-0000-0000-000000000003',
      '50000000-0000-0000-0000-000000000070',
      '50000000-0000-0000-0000-000000000011',
    ],
  },
  NTC_1_04: {
    code: 'NTC_1_04',
    formNumber: 'NTC Form 1-04',
    title: 'Application for Ship Station License',
    shortTitle: 'Ship Station License',
    category: 'Licenses',
    viewType: 'ship_station',
    description: 'Application for Ship Station Licenses (Domestic Trade, International Trade, Fishing, Passenger, Cargo) and Coastal Stations.',
    canonicalServiceId: '50000000-0000-0000-0000-000000000072',
    associatedServiceCodes: ['NTC_1_04', 'NTC_MAR_LICENSES'],
    associatedServiceIds: [
      '50000000-0000-0000-0000-000000000072',
      '50000000-0000-0000-0000-000000000013',
    ],
  },
  NTC_1_09: {
    code: 'NTC_1_09',
    formNumber: 'NTC Form 1-09',
    title: 'Application for Permits in the Radio Service',
    shortTitle: 'Radio Service Permits (Amateur / Aero / Maritime / FLM / PTE)',
    category: 'Permits',
    viewType: 'permits',
    description: 'Application for Permit to Purchase, Possess, Storage, Sell/Transfer, Construction, and Demonstration for Amateur, Aeronautical, Maritime, Land Mobile, and PTE Services.',
    canonicalServiceId: '50000000-0000-0000-0000-000000000009',
    associatedServiceCodes: [
      'NTC_1_09',
      'NTC_AERO_PERMITS',
      'NTC_MAR_PERMITS',
      'NTC_FLM_PERMITS',
      'NTC_PTE_PERMITS',
    ],
    associatedServiceIds: [
      '50000000-0000-0000-0000-000000000009',
      '50000000-0000-0000-0000-000000000060',
      '50000000-0000-0000-0000-000000000061',
      '50000000-0000-0000-0000-000000000062',
      '50000000-0000-0000-0000-000000000063',
    ],
  },
  NTC_1_11: {
    code: 'NTC_1_11',
    formNumber: 'NTC Form 1-11',
    title: 'Application for Radio Station License',
    shortTitle: 'Radio Station License (FLM / Aero / Other)',
    category: 'Licenses',
    viewType: 'radio_station_license',
    description: 'Application for Fixed Point-to-Point, Land Mobile Base/Portable, Aeronautical Station, Aircraft Station, Microwave, VSAT, Public Trunked, and BWA Licenses.',
    canonicalServiceId: '50000000-0000-0000-0000-000000000073',
    associatedServiceCodes: [
      'NTC_1_11',
      'NTC_FLM_LICENSES',
      'NTC_AERO_LICENSES',
      'NTC_OTHER_LICENSES',
    ],
    associatedServiceIds: [
      '50000000-0000-0000-0000-000000000073',
      '50000000-0000-0000-0000-000000000071',
      '50000000-0000-0000-0000-000000000074',
      '50000000-0000-0000-0000-000000000012',
      '50000000-0000-0000-0000-000000000014',
      '50000000-0000-0000-0000-000000000015',
    ],
  },
  NTC_1_18: {
    code: 'NTC_1_18',
    formNumber: 'NTC Form 1-18',
    title: 'Application for CPE Supplier Accreditation & Equipment/Mobile Phone Permits',
    shortTitle: 'CPE Accreditation & Equipment Permits',
    category: 'Accreditations & Permits',
    viewType: 'cpe_equipment',
    description: 'Application for Customer Premises Equipment (CPE) Supplier Accreditation, Radio Communications Equipment (RCE) Dealer/Manufacturer/Service Center Permits, and Mobile Phone Permits.',
    canonicalServiceId: '50000000-0000-0000-0000-000000000018',
    associatedServiceCodes: [
      'NTC_1_18',
      'NTC_EQUIP_PERMITS',
      'NTC_MP_PERMITS',
    ],
    associatedServiceIds: [
      '50000000-0000-0000-0000-000000000018',
      '50000000-0000-0000-0000-000000000064',
      '50000000-0000-0000-0000-000000000065',
    ],
  },
  NTC_1_19: {
    code: 'NTC_1_19',
    formNumber: 'NTC Form 1-19',
    title: 'Application for RFID, SRD, and WDN Registration',
    shortTitle: 'RFID / SRD / WDN Registration',
    category: 'Accreditations & Registrations',
    viewType: 'rfid_srd_wdn',
    description: 'Application for Registration of Radio Frequency Identification (RFID) Devices, Short Range Devices (SRD), and Wireless Data Network (WDN) Indoor/Outdoor Equipment.',
    canonicalServiceId: '50000000-0000-0000-0000-000000000019',
    associatedServiceCodes: ['NTC_1_19'],
    associatedServiceIds: ['50000000-0000-0000-0000-000000000019'],
  },
  NTC_1_20: {
    code: 'NTC_1_20',
    formNumber: 'NTC Form 1-20',
    title: 'Application for Value Added Services (VAS) Provider Registration',
    shortTitle: 'VAS Provider Registration',
    category: 'Accreditations & Registrations',
    viewType: 'vas_provider',
    description: 'Application for Registration as a Value Added Services (VAS) Provider, Content Provider, Telecommunications Reseller, or VoIP Provider.',
    canonicalServiceId: '50000000-0000-0000-0000-000000000020',
    associatedServiceCodes: ['NTC_1_20'],
    associatedServiceIds: ['50000000-0000-0000-0000-000000000020'],
  },
  NTC_1_21: {
    code: 'NTC_1_21',
    formNumber: 'NTC Form 1-21',
    title: 'Application for Certified True Copy / Duplicate Copy',
    shortTitle: 'Certified True Copy / Duplicate Copy',
    category: 'Certificates, Permits & Licenses',
    viewType: 'certified_copy',
    description: 'Application for Certified True Copy or Duplicate Copy of issued Certificates, Permits, or Radio Station Licenses.',
    canonicalServiceId: '50000000-0000-0000-0000-000000000021',
    associatedServiceCodes: [
      'NTC_1_21',
      'NTC_COPY_PERMITS',
      'NTC_COPY_LICENSES',
    ],
    associatedServiceIds: [
      '50000000-0000-0000-0000-000000000021',
      '50000000-0000-0000-0000-000000000066',
      '50000000-0000-0000-0000-000000000076',
      '50000000-0000-0000-0000-000000000017',
    ],
  },
  NTC_1_22: {
    code: 'NTC_1_22',
    formNumber: 'NTC Form 1-22',
    title: 'Application for TVRO Registration & TVRO/CATV Station License',
    shortTitle: 'TVRO Registration & Station License',
    category: 'Licenses & Registrations',
    viewType: 'tvro_station',
    description: 'Application for Television Receive-Only (TVRO) Registration Certificate (Commercial & Non-Commercial) and TVRO/CATV Station Licenses.',
    canonicalServiceId: '50000000-0000-0000-0000-000000000022',
    associatedServiceCodes: ['NTC_1_22', 'NTC_TVRO_CATV_LICENSES'],
    associatedServiceIds: [
      '50000000-0000-0000-0000-000000000022',
      '50000000-0000-0000-0000-000000000075',
      '50000000-0000-0000-0000-000000000016',
    ],
  },
  NTC_1_24: {
    code: 'NTC_1_24',
    formNumber: 'NTC Form 1-24',
    title: 'Request for Blocking and Unblocking of IMEI and SIM',
    shortTitle: 'Blocking / Unblocking of IMEI and SIM',
    category: 'Requests & Complaints',
    viewType: 'imei_sim_blocking',
    description: 'Official consumer request for immediate blocking or unblocking of International Mobile Equipment Identity (IMEI) and SIM cards of lost or stolen mobile devices.',
    canonicalServiceId: '50000000-0000-0000-0000-000000000081',
    associatedServiceCodes: ['NTC_1_24'],
    associatedServiceIds: ['50000000-0000-0000-0000-000000000081'],
  },
  NTC_1_25: {
    code: 'NTC_1_25',
    formNumber: 'NTC Form 1-25',
    title: 'Application for Consumer Complaints & Mandatory Tape Preservation',
    shortTitle: 'Consumer Complaints & Tape Preservation',
    category: 'Requests & Complaints',
    viewType: 'consumer_complaints',
    description: 'Official consumer complaints against text scams/spam, telecommunications or broadcast service providers, and requests for mandatory broadcast tape preservation.',
    canonicalServiceId: '50000000-0000-0000-0000-000000000080',
    associatedServiceCodes: ['NTC_1_25'],
    associatedServiceIds: ['50000000-0000-0000-0000-000000000080'],
  },
};

/**
 * Detects the equivalent canonical form definition for a given service and/or variant.
 */
export function detectCanonicalForm(
  service?: {
    id?: string;
    code?: string;
    title?: string;
    name?: string;
    category?: string;
  } | null,
  variantName?: string | null
): CanonicalFormMetadata | null {
  const serviceIdLower = (service?.id ?? '').toLowerCase().trim();
  const serviceCodeUpper = (service?.code ?? '').toUpperCase().trim();
  const titleUpper = (service?.title ?? service?.name ?? '').toUpperCase().trim();
  const categoryUpper = (service?.category ?? '').toUpperCase().trim();
  const variantUpper = (variantName ?? '').toUpperCase().trim();

  // 1. Direct GUID lookup
  if (serviceIdLower) {
    for (const def of Object.values(CANONICAL_FORM_METADATA)) {
      if (def.associatedServiceIds.some((id) => id.toLowerCase() === serviceIdLower)) {
        return def;
      }
    }
  }

  // 2. Direct Service Code lookup
  if (serviceCodeUpper) {
    for (const def of Object.values(CANONICAL_FORM_METADATA)) {
      if (
        def.code === serviceCodeUpper ||
        def.associatedServiceCodes.some((c) => c.toUpperCase() === serviceCodeUpper)
      ) {
        return def;
      }
    }
  }

  // 3. Regex match on code or title (e.g. NTC_1_09 or NTC 1-09)
  const allText = `${serviceCodeUpper} ${titleUpper} ${categoryUpper} ${variantUpper}`.replace(/[- ]/g, '_');
  const codeMatch = allText.match(/NTC_1_\d{2}/);
  if (codeMatch && CANONICAL_FORM_METADATA[codeMatch[0]]) {
    return CANONICAL_FORM_METADATA[codeMatch[0]];
  }

  // 4. Characteristic keywords
  if (allText.includes('BLOCKING') || allText.includes('IMEI') || (allText.includes('LOST') && allText.includes('PHONE'))) {
    return CANONICAL_FORM_METADATA.NTC_1_24;
  }
  if (allText.includes('COMPLAINT') || allText.includes('TAPE_PRESERVATION') || allText.includes('SPAM') || allText.includes('SCAM')) {
    return CANONICAL_FORM_METADATA.NTC_1_25;
  }
  if (allText.includes('CERTIFIED_TRUE_COPY') || allText.includes('DUPLICATE_COPY') || (allText.includes('COPY') && allText.includes('PERMIT')) || (allText.includes('COPY') && allText.includes('LICENSE'))) {
    return CANONICAL_FORM_METADATA.NTC_1_21;
  }
  if (allText.includes('TVRO') || allText.includes('CATV')) {
    return CANONICAL_FORM_METADATA.NTC_1_22;
  }
  if (allText.includes('RFID') || allText.includes('SRD') || allText.includes('WDN')) {
    return CANONICAL_FORM_METADATA.NTC_1_19;
  }
  if (allText.includes('VAS') || allText.includes('VALUE_ADDED') || allText.includes('VALUEADDED')) {
    return CANONICAL_FORM_METADATA.NTC_1_20;
  }
  if (allText.includes('CPE') || allText.includes('CUSTOMER_PREMISES') || allText.includes('MOBILE_PHONE_DEALER') || allText.includes('MOBILE_PHONE_PERMIT') || allText.includes('EQUIP_PERMITS')) {
    return CANONICAL_FORM_METADATA.NTC_1_18;
  }
  if (allText.includes('SHIP_STATION') || allText.includes('VESSEL') || allText.includes('COASTAL_STATION')) {
    return CANONICAL_FORM_METADATA.NTC_1_04;
  }
  if (allText.includes('EXAMINATION') || allText.includes('EXAM') || allText.includes('ADMISSION_SLIP')) {
    return CANONICAL_FORM_METADATA.NTC_1_01;
  }
  if (allText.includes('COMMERCIAL_RADIO') || allText.includes('1RTG') || allText.includes('2RTG') || allText.includes('GOC') || allText.includes('RROC')) {
    return CANONICAL_FORM_METADATA.NTC_1_02;
  }
  if (allText.includes('AMATEUR_RADIO') || allText.includes('AMATEUR_CLUB') || allText.includes('CLASS_A') || allText.includes('CLASS_B') || allText.includes('CLASS_C') || allText.includes('CLASS_D')) {
    return CANONICAL_FORM_METADATA.NTC_1_03;
  }
  if (allText.includes('RADIO_STATION_LICENSE') || (allText.includes('STATION_LICENSE') && !allText.includes('AMATEUR') && !allText.includes('SHIP'))) {
    return CANONICAL_FORM_METADATA.NTC_1_11;
  }
  if (categoryUpper.includes('PERMIT') || titleUpper.includes('PERMIT') || variantUpper.includes('PERMIT')) {
    return CANONICAL_FORM_METADATA.NTC_1_09;
  }
  if (categoryUpper.includes('LICENSE') || titleUpper.includes('LICENSE') || variantUpper.includes('LICENSE')) {
    return CANONICAL_FORM_METADATA.NTC_1_11;
  }

  return null;
}
