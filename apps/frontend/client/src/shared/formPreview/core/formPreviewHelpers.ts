/**
 * formPreviewHelpers.ts
 *
 * UI helpers shared across all preview surfaces.
 * Source: generalReview/generalReviewHelpers.ts + generalReviewFormatters.ts (wizard)
 */
import { Icon } from '@edge/ui';
import { isSuppressedValue } from './formPreviewFieldCheckers';

// ─── Section icon & color ─────────────────────────────────────────────────────

export const getSectionIcon = (title: string): React.ComponentProps<typeof Icon>['name'] => {
  const lower = title.toLowerCase();
  if (lower.includes('applicant') || lower.includes('personal') || lower.includes('contact')) return 'user';
  if (lower.includes('education') || lower.includes('school') || lower.includes('training') || lower.includes('seminar') || lower.includes('exam')) return 'book-open';
  if (lower.includes('assistance') || lower.includes('special') || lower.includes('pwd') || lower.includes('accommodation')) return 'info';
  if (lower.includes('station') || lower.includes('location') || lower.includes('site') || lower.includes('address')) return 'map-pin';
  if (lower.includes('equipment') || lower.includes('device') || lower.includes('transceiver') || lower.includes('technical')) return 'cpu';
  if (lower.includes('antenna') || lower.includes('mast') || lower.includes('tower') || lower.includes('radio')) return 'radio';
  if (lower.includes('personnel') || lower.includes('engineer') || lower.includes('technician') || lower.includes('pece') || lower.includes('ece')) return 'award';
  if (lower.includes('vessel') || lower.includes('ship') || lower.includes('maritime')) return 'anchor';
  if (lower.includes('aircraft') || lower.includes('aero')) return 'navigation';
  if (lower.includes('document') || lower.includes('upload') || lower.includes('attachment')) return 'paperclip';
  return 'file-text';
};

export const getSectionAccentColor = (idx: number): string => {
  const colors = ['#7C3AED', '#0284C7', '#0D9488', '#4F46E5', '#D97706', '#2563EB', '#9333EA'];
  return colors[idx % colors.length] || '#0F2C59';
};

// ─── Field key formatter ──────────────────────────────────────────────────────

export const formatFieldKey = (key: string): string => {
  if (!key) return '';
  const map: Record<string, string> = {
    make: 'Make',
    typemodel: 'Type / Model',
    type_model: 'Type / Model',
    devicetype: 'Device Type',
    device_type: 'Device Type',
    deviceequipmenttype: 'Device / Equipment Type',
    device_equipment_type: 'Device / Equipment Type',
    typeofequipmentdevice: 'Device / Equipment Type',
    type_of_equipment_device: 'Device / Equipment Type',
    maketypemodel: 'Make / Type / Model',
    make_type_model: 'Make / Type / Model',
    makemodeltype: 'Make / Type / Model',
    makemodel: 'Make / Model',
    imeinumber: 'IMEI Number (15 Digits)',
    imei_number: 'IMEI Number (15 Digits)',
    imei: 'IMEI Number',
        mobile_number: 'Mobile Number',
    telcoprovider: 'Network / Telco Provider',
    telco_provider: 'Network / Telco Provider',
    documentdescription: 'Document Description',
    document_description: 'Document Description',
    attachmentfile: 'Attached Document / File',
    attachment_file: 'Attached Document / File',
    make_model: 'Make / Model',
    equipmentserials: 'Equipment Serial',
    equipment_serials: 'Equipment Serial',
    equipmentserial: 'Equipment Serial',
    equipment_serial: 'Equipment Serial',
    equipmentserialnumbers: 'Equipment Serial Numbers',
    equipment_serial_numbers: 'Equipment Serial Numbers',
    serialnumbers: 'Serial Number',
    serial_numbers: 'Serial Number',
    serialnumber: 'Serial Number',
    serial_number: 'Serial Number',
    serialno: 'Serial No.',
    serial_no: 'Serial No.',
    frequencyrange: 'Frequency Range',
    frequency_range: 'Frequency Range',
    outputpower: 'Output Power',
    output_power: 'Output Power',
    powerwatts: 'Power (Watts)',
    power_watts: 'Power (Watts)',
    fullname: 'Full Name',
    full_name: 'Full Name',
    prclicenseno: 'PRC License No.',
    prc_no: 'PRC License No.',
    prcno: 'PRC License No.',
    ptrno: 'PTR No.',
    ptr_no: 'PTR No.',
    peceno: 'PECE / ECE No.',
    pece_no: 'PECE / ECE No.',
    validuntil: 'Valid Until',
    valid_until: 'Valid Until',
    datehired: 'Date Hired',
    date_hired: 'Date Hired',
    position: 'Position / Designation',
    grosstonnage: 'Gross Tonnage',
    gross_tonnage: 'Gross Tonnage',
    nettonnage: 'Net Tonnage',
    net_tonnage: 'Net Tonnage',
    callsign: 'Call Sign',
    call_sign: 'Call Sign',
    dishdiameter: 'Dish Diameter',
    dish_diameter: 'Dish Diameter',
    polarization: 'Polarization',
    azimuth: 'Azimuth',
    location: 'Location',
    elevation: 'Elevation (m)',
    height: 'Height (m)',
    gain: 'Gain (dBi)',
    type: 'Type',
    power: 'Power',
    frequency: 'Frequency',
    bandwidth: 'Bandwidth',
    emission: 'Emission / Modulation',
    channel: 'Channel No.',
    quantity: 'Quantity',
    tacnumber: 'TAC / Approval No.',
    tac_no: 'TAC / Approval No.',
    schoolname: 'School / Training Institution',
    school_name: 'School / Training Institution',
    coursedegree: 'Course / Degree',
    course_degree: 'Course / Degree',
    yeargraduated: 'Year Graduated',
    year_graduated: 'Year Graduated',
    educationalattainment: 'Educational Attainment',
    educational_attainment: 'Educational Attainment',
    specialneeds: 'Special Needs / Accommodation',
    special_needs: 'Special Needs / Accommodation',
    firstname: 'First Name',
    lastname: 'Last Name',
    middlename: 'Middle Name',
    email: 'Email Address',
    mobilenumber: 'Mobile Number',
    contactnumber: 'Contact Number',
    streetaddress: 'Street Address',
    barangay: 'Barangay',
    citymunicipality: 'City / Municipality',
    province: 'Province',
    region: 'Region',
    zipcode: 'Zip Code',
    nationality: 'Nationality',
    sex: 'Sex / Gender',
    civilstatus: 'Civil Status',
    schoolattended: 'School Attended',
    coursecompleted: 'Course / Degree Completed',
  };

  const lower = key.toLowerCase().replace(/[-_]/g, '');
  if (map[lower]) return map[lower];

  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

// ─── Type guards ──────────────────────────────────────────────────────────────

export function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

export function isPreviewFileObject(file: unknown): file is { name: string; uri?: string } {
  if (typeof file !== 'object' || file === null || !('name' in file)) return false;
  const candidate = file as { name: unknown };
  return typeof candidate.name === 'string';
}

// ─── Address formatting helpers ───────────────────────────────────────────────

export interface AddressComponentsInput {
  street?: string | null;
  address?: string | null;
  streetAddress?: string | null;
  barangay?: string | null;
  barangayName?: string | null;
  city?: string | null;
  cityMunicipality?: string | null;
  province?: string | null;
  region?: string | null;
  zipCode?: string | null;
}

/**
 * Safely sanitizes an address segment, returning null if empty or a placeholder token.
 */
export function sanitizeAddressSegment(val?: string | null): string | null {
  if (!val || typeof val !== 'string') return null;
  const trimmed = val.trim();
  if (
    trimmed === '' ||
    trimmed.toUpperCase() === 'N/A' ||
    trimmed.toUpperCase() === 'NA' ||
    trimmed === '-' ||
    trimmed === '[]' ||
    trimmed === '{}'
  ) {
    return null;
  }
  return trimmed;
}

/**
 * Builds a clean, comma-separated full address string from granular location components.
 * Handles missing optional segments (e.g., missing barangay, region, or zip) gracefully
 * without trailing/double commas or layout shifts.
 */
export function formatCompositeAddress(components?: AddressComponentsInput | null): string | null {
  if (!components) return null;

  const street = sanitizeAddressSegment(components.streetAddress || components.street);
  const rawAddress = sanitizeAddressSegment(components.address);

  const barangay = sanitizeAddressSegment(components.barangay || components.barangayName);
  const city = sanitizeAddressSegment(components.cityMunicipality || components.city);
  const province = sanitizeAddressSegment(components.province);
  const region = sanitizeAddressSegment(components.region);
  const zip = sanitizeAddressSegment(components.zipCode);

  const isDuplicateLocationSegment = (segment: string): boolean => {
    let clean = segment.trim();
    if (clean.startsWith('(') && clean.endsWith(')')) {
      clean = clean.slice(1, -1).trim();
    }
    const cleanLower = clean.toLowerCase();
    if (!cleanLower) return true;
    const cleanNoBrgy = cleanLower.replace(/^(brgy\.?|barangay)\s+/i, '').trim();
    const cleanNoZip = cleanLower.replace(/^zip\s+/i, '').trim();

    if (barangay) {
      const bLower = barangay.toLowerCase().replace(/^(brgy\.?|barangay)\s+/i, '').trim();
      if (cleanLower === barangay.toLowerCase() || cleanNoBrgy === bLower) return true;
    }
    if (city && cleanLower === city.toLowerCase()) return true;
    if (province && cleanLower === province.toLowerCase()) return true;
    if (region) {
      const rLower = region.toLowerCase();
      let rUnwrapped = rLower;
      if (rUnwrapped.startsWith('(') && rUnwrapped.endsWith(')')) {
        rUnwrapped = rUnwrapped.slice(1, -1).trim();
      }
      if (cleanLower === rLower || cleanLower === rUnwrapped) return true;
    }
    if (zip) {
      const zLower = zip.replace(/^zip\s+/i, '').trim().toLowerCase();
      if (cleanLower === zLower || cleanNoZip === zLower) return true;
    }
    return false;
  };

  const stripDuplicateLocationSegments = (val: string | null): string | null => {
    if (!val) return null;
    const filtered = val
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !isDuplicateLocationSegment(s));
    return filtered.length > 0 ? filtered.join(', ') : null;
  };

  const cleanStreet = stripDuplicateLocationSegments(street);
  const cleanRawAddress = stripDuplicateLocationSegments(rawAddress);

  // Determine base street/building segment:
  // Strictly prioritize cleanStreet (what the user entered in the form).
  // Only fall back to cleanRawAddress if cleanStreet was not provided.
  // Never concatenate two distinct street address strings together.
  let primaryStreet: string | null = null;
  if (cleanStreet) {
    primaryStreet = cleanStreet;
  } else if (cleanRawAddress) {
    primaryStreet = cleanRawAddress;
  }

  const parts: string[] = [];

  if (primaryStreet) {
    parts.push(primaryStreet);
  }

  if (barangay) {
    const lowerB = barangay.toLowerCase();
    parts.push(lowerB.startsWith('brgy') || lowerB.startsWith('barangay') ? barangay : `Brgy. ${barangay}`);
  }

  if (city) {
    parts.push(city);
  }

  if (province && (!city || city.toLowerCase() !== province.toLowerCase())) {
    parts.push(province);
  }

  if (region) {
    parts.push(`(${region})`);
  }

  if (zip) {
    const cleanZip = zip.replace(/zip/i, '').trim();
    parts.push(`ZIP ${cleanZip}`);
  }

  return parts.length > 0 ? parts.join(', ') : null;
}

export function extractSerialNumbers(val: unknown): string[] | null {
  if (val === null || val === undefined) return null;

  // If already array of strings or numbers
  if (
    Array.isArray(val) &&
    val.length > 0 &&
    val.every((item) => typeof item === 'string' || typeof item === 'number')
  ) {
    const list = Array.from(
      new Set(
        val
          .map(String)
          .map((s) => s.trim())
          .filter((s) => s.length > 0 && s !== 'null' && s !== 'undefined' && !isSuppressedValue(s))
      )
    );
    return list.length > 0 ? list : null;
  }

  // If array of objects (e.g. [{ id: 'serial-1', serialNumber: 'SN-001' }])
  if (Array.isArray(val) && val.length > 0 && val.every(isRecord)) {
    const serials: string[] = [];
    for (const obj of val) {
      const sn =
        obj.serialNumber ??
        obj.serial_number ??
        obj.serial ??
        obj.sn ??
        obj.serialNo ??
        obj.serial_no ??
        obj.equipmentSerial ??
        obj.equipment_serial ??
        obj.number ??
        obj.value;
      if (sn !== undefined && sn !== null && String(sn).trim().length > 0) {
        const sStr = String(sn).trim();
        if (!isSuppressedValue(sStr) && !serials.includes(sStr)) {
          serials.push(sStr);
        }
      } else {
        const nonIdVals = Object.entries(obj)
          .filter(
            ([k, sv]) =>
              k !== 'id' &&
              k !== '_id' &&
              k !== 'key' &&
              sv !== null &&
              sv !== undefined &&
              String(sv).trim().length > 0 &&
              !isSuppressedValue(String(sv))
          )
          .map(([, sv]) => String(sv).trim());
        if (nonIdVals.length === 1 && nonIdVals[0] && !serials.includes(nonIdVals[0])) {
          serials.push(nonIdVals[0]);
        }
      }
    }
    return serials.length > 0 ? Array.from(new Set(serials)) : null;
  }

  // If string, check if it's JSON or separated list
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (isSuppressedValue(trimmed)) return null;

    if (
      (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
      (trimmed.startsWith('{') && trimmed.endsWith('}'))
    ) {
      try {
        const parsed: unknown = JSON.parse(trimmed);
        return extractSerialNumbers(parsed);
      } catch {
        // Not valid JSON
      }
    }
    if (trimmed.includes(',') && !trimmed.includes('{') && !trimmed.includes('[')) {
      const parts = Array.from(
        new Set(
          trimmed
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s.length > 0 && !isSuppressedValue(s))
        )
      );
      if (parts.length > 1) return parts;
    }
  }

  return null;
}

/**
 * Normalizes repeater table row entries, deduplicating alias columns
 * (e.g. deviceType vs typeOfEquipmentDevice, makeTypeModel vs nameTypeModel,
 * equipmentSerials vs serialNumbers vs serialNumber) and consolidating serial numbers.
 */
export function normalizeRepeaterRowEntries(
  row: Record<string, unknown>
): Array<[string, unknown]> {
  if (!row || typeof row !== 'object') return [];

  // Filter out internal metadata keys and null/empty values
  const validKeys = Object.keys(row).filter((k) => {
    if (!k || k === 'id' || k === '_id' || k === 'key' || k.startsWith('__')) return false;
    const v = row[k];
    if (v === null || v === undefined) return false;
    if (typeof v === 'string') {
      const str = v.trim();
      if (str === '' || isSuppressedValue(str)) return false;
    }
    return true;
  });

  const keyMap = new Map<string, string>();
  for (const k of validKeys) {
    keyMap.set(k.toLowerCase().replace(/[-_\s]/g, ''), k);
  }

  const handledKeys = new Set<string>();
  const normalizedEntries: Array<[string, unknown]> = [];

  // 1. Device Type
  const deviceTypeAliases = [
    'devicetype',
    'typeofequipmentdevice',
    'deviceequipmenttype',
    'deviceequipment',
    'equipmenttype',
  ];
  const matchedDeviceKey = deviceTypeAliases.find((a) => keyMap.has(a));
  if (matchedDeviceKey) {
    const originalKey = keyMap.get(matchedDeviceKey);
    if (originalKey !== undefined) {
      const val = row[originalKey];
      normalizedEntries.push(['deviceType', val]);
      for (const a of deviceTypeAliases) {
        const orig = keyMap.get(a);
        if (orig !== undefined) handledKeys.add(orig);
      }
    }
  }

  // 2. Make / Type / Model
  const makeModelAliases = ['maketypemodel', 'nametypemodel', 'makemodel'];
  const matchedMakeKey = makeModelAliases.find((a) => keyMap.has(a));
  if (matchedMakeKey) {
    const originalKey = keyMap.get(matchedMakeKey);
    if (originalKey !== undefined) {
      const val = row[originalKey];
      normalizedEntries.push(['makeTypeModel', val]);
      for (const a of makeModelAliases) {
        const orig = keyMap.get(a);
        if (orig !== undefined) handledKeys.add(orig);
      }
      // Also suppress standalone "make" and "typeModel" if they duplicate makeTypeModel
      const makeOrig = keyMap.get('make');
      if (makeOrig !== undefined && String(row[makeOrig]).trim() === String(val).trim()) {
        handledKeys.add(makeOrig);
      }
      const tmOrig = keyMap.get('typemodel');
      if (tmOrig !== undefined && String(row[tmOrig]).trim() === String(val).trim()) {
        handledKeys.add(tmOrig);
      }
    }
  }

  // 3. Serial Numbers (Equipment Serials)
  const serialAliases = [
    'equipmentserials',
    'serialnumbers',
    'serialnumber',
    'serials',
    'serialno',
    'equipmentserial',
    'equipmentserialnumbers',
  ];
  const presentSerialKeys = serialAliases
    .map((a) => keyMap.get(a))
    .filter((k): k is string => k !== undefined);

  if (presentSerialKeys.length > 0) {
    const collectedSerials: string[] = [];
    for (const sk of presentSerialKeys) {
      const rawVal = row[sk];
      const extracted = extractSerialNumbers(rawVal);
      if (extracted !== null && extracted.length > 0) {
        for (const sn of extracted) {
          if (!collectedSerials.includes(sn)) {
            collectedSerials.push(sn);
          }
        }
      } else if (
        typeof rawVal === 'string' &&
        rawVal.trim().length > 0 &&
        !isSuppressedValue(rawVal.trim())
      ) {
        const trimmed = rawVal.trim();
        if (trimmed.includes(',')) {
          const parts = trimmed
            .split(',')
            .map((p) => p.trim())
            .filter((p) => p.length > 0 && !isSuppressedValue(p));
          for (const p of parts) {
            if (!collectedSerials.includes(p)) collectedSerials.push(p);
          }
        } else if (!collectedSerials.includes(trimmed)) {
          collectedSerials.push(trimmed);
        }
      }
      handledKeys.add(sk);
    }

    if (collectedSerials.length > 0) {
      // Use original key if exactly one specific key existed (e.g. 'serialNumber' on TVRO), else 'equipmentSerials'
      const canonicalKey =
        presentSerialKeys.length === 1 && presentSerialKeys[0]
          ? presentSerialKeys[0]
          : 'equipmentSerials';
      normalizedEntries.push([canonicalKey, collectedSerials]);
    }
  }

  // 4. Equipments Units (for Equipment Repeater)
  const equipmentUnitAliases = ['equipments', 'equipmentunits'];
  const matchedEqKey = equipmentUnitAliases.find((a) => keyMap.has(a));
  if (matchedEqKey) {
    const originalKey = keyMap.get(matchedEqKey);
    if (originalKey !== undefined) {
      const val = row[originalKey];
      normalizedEntries.push([originalKey, val]);
      for (const a of equipmentUnitAliases) {
        const orig = keyMap.get(a);
        if (orig !== undefined) handledKeys.add(orig);
      }
      const freqOrig = keyMap.get('frequency') || keyMap.get('frequencyrange');
      if (freqOrig !== undefined) handledKeys.add(freqOrig);
      const snOrig = keyMap.get('serialnumber');
      if (snOrig !== undefined) handledKeys.add(snOrig);
    }
  }

  // 5. Add all remaining unhandled keys in original order
  for (const k of validKeys) {
    if (!handledKeys.has(k)) {
      normalizedEntries.push([k, row[k]]);
    }
  }

  return normalizedEntries;
}




// ─── Preview Parameters Resolvers ─────────────────────────────────────────────

export interface ResolvePreviewVariantParams {
  variantName?: string | null;
  serviceVariantName?: string | null;
  variant?: string | null;
  element?: string | null;
  examineeType?: string | null;
  formFieldValues?: Array<{ fieldId?: string; fieldLabel?: string; value?: string | null }>;
  fallback?: string;
}

export function resolvePreviewVariant(params: ResolvePreviewVariantParams): string {
  const isUuid = (v?: string | null) =>
    Boolean(v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v.trim()));

  const candidates = [params.variantName, params.serviceVariantName, params.variant];
  for (const c of candidates) {
    if (c && typeof c === 'string' && c.trim().length > 0) {
      const trimmed = c.trim();
      if (trimmed !== 'Standard' && !isUuid(trimmed)) {
        return trimmed;
      }
    }
  }

  // Also check formFieldValues
  if (params.formFieldValues && params.formFieldValues.length > 0) {
    const vField = params.formFieldValues.find((fv) => {
      const lbl = (fv.fieldLabel || '').toLowerCase().trim();
      const val = (fv.value || '').trim();
      if (!val || val === 'null' || val === 'undefined') return false;
      return lbl === 'service variant' || lbl === 'variant' || lbl.includes('variant name');
    });
    if (vField && vField.value && vField.value.trim().length > 0 && !isUuid(vField.value)) {
      return vField.value.trim();
    }
  }

  for (const c of candidates) {
    if (c && typeof c === 'string' && c.trim().length > 0 && !isUuid(c)) {
      return c.trim();
    }
  }
  return params.fallback !== undefined ? params.fallback : '';
}

export interface ResolvePreviewApplicationTypeParams {
  applicationType?: string | null;
  examineeType?: string | null;
  examType?: string | null;
  element?: string | null;
  formFieldValues?: Array<{ fieldId?: string; fieldLabel?: string; value?: string | null }>;
}

export function resolvePreviewApplicationType(params: ResolvePreviewApplicationTypeParams): string | null {
  const isFilingModeOnly = (v: string) => {
    const upper = v.toUpperCase().trim();
    return upper === 'SINGLE' || upper === 'BULK' || upper === 'SINGLE APPLICATION' || upper === 'BULK APPLICATION';
  };

  if (params.applicationType && params.applicationType.trim().length > 0) {
    const trimmed = params.applicationType.trim();
    if (!isFilingModeOnly(trimmed) && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
      return trimmed;
    }
  }
  if (params.examineeType && params.examineeType.trim().length > 0) {
    const trimmed = params.examineeType.trim();
    if (!isFilingModeOnly(trimmed)) return trimmed;
  }
  if (params.examType && params.examType.trim().length > 0) {
    const trimmed = params.examType.trim();
    if (!isFilingModeOnly(trimmed)) return trimmed;
  }
  if (params.formFieldValues && params.formFieldValues.length > 0) {
    const typeField = params.formFieldValues.find((fv) => {
      const id = (fv.fieldId || '').toLowerCase().trim();
      const lbl = (fv.fieldLabel || '').toLowerCase().trim();
      const val = (fv.value || '').trim();
      if (!val || val === 'null' || val === 'undefined') return false;
      return (
        id === 'fd000000-0000-0000-0000-000000000007' ||
        lbl === 'type of application' ||
        lbl === 'application type' ||
        lbl === 'examinee type' ||
        lbl === 'type of examinee' ||
        lbl === 'examinee classification'
      );
    });
    if (typeField && typeField.value && typeField.value.trim().length > 0) {
      const valTrimmed = typeField.value.trim();
      if (!isFilingModeOnly(valTrimmed)) return valTrimmed;
    }
  }
  if (params.element && params.element.trim().length > 0) {
    const trimmed = params.element.trim();
    const lower = trimmed.toLowerCase();
    const isExamineeType = ['new', 'renewal', 'modification', 'upgrading', 'additional'].includes(lower);
    if (isExamineeType) {
      return trimmed;
    }
  }
  return null;
}

export interface ResolvePreviewElementsParams {
  elements?: string | null;
  selectedElementTitle?: string | null;
  selectedOption?: string | null;
  formFieldValues?: Array<{ fieldId?: string; fieldLabel?: string; value?: string | null }>;
  element?: string | null;
  variantName?: string | null;
}

export function resolvePreviewElements(params: ResolvePreviewElementsParams): string | null {
  const isGuid = (val: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

  const isExamineeType = (val: string) =>
    ['new', 'renewal', 'modification', 'upgrading', 'additional', 'regular'].includes(val.toLowerCase());

  const isStrictVariant = (val: string) => {
    const lower = val.toLowerCase();
    const hasElementKeyword = lower.includes('element') || lower.includes('class') || lower.includes('code');
    if (hasElementKeyword) return false;
    return (
      lower === 'amateur' ||
      lower === 'amateur (firsttaker)' ||
      lower === 'amateur (first-time)' ||
      lower === 'amateur (first time)' ||
      lower === 'amateur (retaker)' ||
      lower === 'amateur (re-taker)' ||
      lower === 'firsttaker' ||
      lower === 'retaker' ||
      lower === 'commercial radiotelegraphy' ||
      lower === 'commercial radiotelephony' ||
      lower === 'radiotelegraphy' ||
      lower === 'radiotelephony' ||
      (Boolean(params.variantName) && lower === params.variantName?.trim().toLowerCase())
    );
  };

  if (params.elements && params.elements.trim().length > 0) {
    const trimmed = params.elements.trim();
    if (!isExamineeType(trimmed) && !isStrictVariant(trimmed) && !isGuid(trimmed)) {
      return trimmed;
    }
  }
  if (params.selectedElementTitle && params.selectedElementTitle.trim().length > 0) {
    const trimmed = params.selectedElementTitle.trim();
    if (!isExamineeType(trimmed) && !isStrictVariant(trimmed) && !isGuid(trimmed)) {
      return trimmed;
    }
  }
  if (params.selectedOption && params.selectedOption.trim().length > 0) {
    const trimmed = params.selectedOption.trim();
    if (!isExamineeType(trimmed) && !isStrictVariant(trimmed) && !isGuid(trimmed)) {
      return trimmed;
    }
  }
  if (params.formFieldValues && params.formFieldValues.length > 0) {
    const elemField = params.formFieldValues.find((fv) => {
      const id = (fv.fieldId || '').toLowerCase().trim();
      const lbl = (fv.fieldLabel || '').toLowerCase().trim();
      const val = (fv.value || '').trim();
      if (!val || val === 'null' || val === 'undefined' || val === '[]' || val === '{}') return false;
      return (
        id === 'fd000000-0000-0000-0000-000000000009' ||
        id === 'fd000000-0000-0000-0000-000000000025' ||
        id === 'fd000000-0000-0000-0000-000000000101' ||
        lbl === 'selected exam elements' ||
        lbl === 'exam elements' ||
        lbl === 'elements' ||
        lbl === 'selected elements' ||
        lbl === 'element / class' ||
        lbl === 'class / element' ||
        lbl === 'element' ||
        lbl === 'station class' ||
        lbl === 'class of station' ||
        lbl.includes('exam element') ||
        lbl.includes('selected element') ||
        lbl.includes('station class') ||
        lbl.includes('service variant & station class') ||
        lbl.includes('variant element')
      );
    });
    if (elemField && elemField.value && elemField.value.trim().length > 0) {
      const trimmed = elemField.value.trim();
      if (!isExamineeType(trimmed) && !isStrictVariant(trimmed) && !isGuid(trimmed)) {
        return trimmed;
      }
    }
  }
  if (params.element && params.element.trim().length > 0) {
    const trimmed = params.element.trim();
    if (!isExamineeType(trimmed) && !isStrictVariant(trimmed) && !isGuid(trimmed)) {
      return trimmed;
    }
  }
  return null;
}
