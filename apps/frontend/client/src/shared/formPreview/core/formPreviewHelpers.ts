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
    serialnumber: 'Serial Number',
    serial_number: 'Serial Number',
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
