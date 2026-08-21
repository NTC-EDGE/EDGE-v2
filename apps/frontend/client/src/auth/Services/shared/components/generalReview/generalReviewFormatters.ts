import { NTCService } from '../../../data/servicesData';
import { ServiceRequirementItem } from '../../hooks/useGeneralServiceWizard';
import { PreviewFileObject } from './generalReviewTypes';

export function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

export function isPreviewFileObject(file: unknown): file is PreviewFileObject {
  if (typeof file !== 'object' || file === null || !('name' in file)) return false;
  const candidate = file as { name: unknown };
  return typeof candidate.name === 'string';
}

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
  };

  const lower = key.toLowerCase().replace(/[-_]/g, '');
  if (map[lower]) return map[lower];

  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export const getRequirementLabel = (
  key: string,
  variantRequirements: Array<ServiceRequirementItem | string> = [],
  service: NTCService
): string => {
  const cleanKey = key.replace(/^req-/, '');
  const matched = (variantRequirements || []).find((r: ServiceRequirementItem | string) => {
    if (typeof r === 'string') return false;
    return r.id === cleanKey || r.key === key || r.key === cleanKey;
  });
  if (matched && typeof matched === 'object') {
    return (matched.name || matched.label || matched.title || matched.description || cleanKey).replace(/\*$/, '').trim();
  }
  if (service.requirements && Array.isArray(service.requirements)) {
    const matchedFromSvc = service.requirements.find((r) => {
      if (typeof r === 'string') return false;
      const rObj = r as unknown as { id?: string; name?: string; label?: string; description?: string };
      return rObj.id === cleanKey;
    });
    if (matchedFromSvc && typeof matchedFromSvc === 'object') {
      const rObj = matchedFromSvc as unknown as { id?: string; name?: string; label?: string; description?: string };
      return (rObj.name || rObj.label || rObj.description || cleanKey).replace(/\*$/, '').trim();
    }
  }
  return cleanKey.replace(/[-_]/g, ' ').toUpperCase();
};
