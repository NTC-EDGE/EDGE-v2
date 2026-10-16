/**
 * formPreviewHelpers.ts
 *
 * UI helpers shared across all preview surfaces.
 * Source: generalReview/generalReviewHelpers.ts + generalReviewFormatters.ts (wizard)
 */
import { Icon } from '@edge/ui';

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
    makemodel: 'Make / Model',
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

  // Determine base street/building segment without duplicate repetition
  let primaryStreet: string | null = null;
  if (cleanStreet && cleanRawAddress && cleanStreet !== cleanRawAddress) {
    primaryStreet = cleanRawAddress.toLowerCase().includes(cleanStreet.toLowerCase())
      ? cleanRawAddress
      : cleanStreet.toLowerCase().includes(cleanRawAddress.toLowerCase())
      ? cleanStreet
      : `${cleanStreet}, ${cleanRawAddress}`;
  } else {
    primaryStreet = cleanStreet || cleanRawAddress;
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
  if (Array.isArray(val) && val.length > 0 && val.every((item) => typeof item === 'string' || typeof item === 'number')) {
    const list = val.map(String).map((s) => s.trim()).filter((s) => s.length > 0 && s !== 'null' && s !== 'undefined');
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
        serials.push(String(sn).trim());
      } else {
        const nonIdVals = Object.entries(obj)
          .filter(
            ([k, sv]) =>
              k !== 'id' &&
              k !== '_id' &&
              k !== 'key' &&
              sv !== null &&
              sv !== undefined &&
              String(sv).trim().length > 0
          )
          .map(([, sv]) => String(sv).trim());
        if (nonIdVals.length === 1 && nonIdVals[0]) {
          serials.push(nonIdVals[0]);
        }
      }
    }
    if (serials.length > 0) return serials;
  }

  // If string, check if it's JSON or separated list
  if (typeof val === 'string') {
    const trimmed = val.trim();
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
      const parts = trimmed.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
      if (parts.length > 1) return parts;
    }
  }

  return null;
}


