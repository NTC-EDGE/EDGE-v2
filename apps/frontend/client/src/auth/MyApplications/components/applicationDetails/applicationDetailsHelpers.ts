import { Application } from '../../data/applicationsData';
import { FIELD_ID_FULL_NAME, FIELD_ID_BIRTH_DATE, FIELD_ID_CIVIL_STATUS } from '../../../../shared/constants/fieldIds';
import { RawFormFieldItem, RawApplicantDetails, RawApplicantHolder } from './applicationDetailsTypes';

export function extractApplicantFullName(
  app: Application | null | undefined,
  details: RawApplicantDetails | null | undefined,
  first: RawApplicantHolder | null | undefined
): string {
  if (first?.name && typeof first.name === 'string' && first.name.trim() && first.name !== 'Unnamed Applicant') return first.name.trim();
  if (first?.applicantName && typeof first.applicantName === 'string' && first.applicantName.trim()) return first.applicantName.trim();
  if (details?.fullName && typeof details.fullName === 'string' && details.fullName.trim()) return details.fullName.trim();
  if (details?.applicantName && typeof details.applicantName === 'string' && details.applicantName.trim()) return details.applicantName.trim();

  const firstName = details?.firstName || details?.first_name || '';
  const lastName = details?.lastName || details?.last_name || '';
  const combined = `${firstName} ${lastName}`.trim();
  if (combined.length > 0) return combined;

  if (app?.applicantName && typeof app.applicantName === 'string' && app.applicantName.trim() && app.applicantName !== 'Unnamed Applicant') {
    return app.applicantName.trim();
  }

  const fvList: RawFormFieldItem[] =
    (Array.isArray(details?.formFieldValues) && details?.formFieldValues ? details.formFieldValues :
      Array.isArray(first?.formFieldValues) && first?.formFieldValues ? first.formFieldValues :
      Array.isArray(app?.formFieldValues) && app?.formFieldValues ? (app.formFieldValues as RawFormFieldItem[]) : []);

  if (fvList.length > 0) {
    const knownFv = fvList.find((fv) => fv.fieldId === FIELD_ID_FULL_NAME);
    if (knownFv?.value?.trim()) return knownFv.value.trim();

    const matchedFv = fvList.find((fv) => {
      const lbl = (fv.fieldLabel || fv.label || fv.key || fv.fieldId || '').toLowerCase();
      return lbl.includes('full name') || lbl.includes('applicant name') || lbl.includes('name of applicant') || lbl.includes('business name') || lbl.includes('company name');
    });
    if (matchedFv?.value?.trim()) return matchedFv.value.trim();
  }

  if (app?.companyName && typeof app.companyName === 'string' && app.companyName.trim()) return app.companyName.trim();
  return 'Juan dela Cruz';
}

export function resolveBirthDate(
  details: RawApplicantDetails | null,
  rawFormFields: Array<{ fieldId?: string; fieldLabel?: string; value?: string }>
): string | null {
  return details?.birthDate ||
    (details?.birthMonth && details?.birthDay && details?.birthYear
      ? `${details.birthMonth} ${details.birthDay}, ${details.birthYear}`
      : rawFormFields.find((fv) => fv.fieldId === FIELD_ID_BIRTH_DATE || fv.fieldId === 'birthDate' || (fv.fieldLabel || '').toLowerCase().includes('birth'))?.value || null);
}

export function resolveCivilStatus(
  details: RawApplicantDetails | null,
  rawFormFields: Array<{ fieldId?: string; fieldLabel?: string; value?: string }>
): string | null {
  return details?.civilStatus ||
    rawFormFields.find((fv) => fv.fieldId === FIELD_ID_CIVIL_STATUS || fv.fieldId === 'civilStatus' || (fv.fieldLabel || '').toLowerCase().includes('civil') || (fv.fieldLabel || '').toLowerCase().includes('marital'))?.value || null;
}

export const formatFieldKey = (key: string): string => {
  const map: Record<string, string> = {
    firstname: 'First Name', lastname: 'Last Name', middlename: 'Middle Name',
    email: 'Email Address', mobilenumber: 'Mobile Number', contactnumber: 'Contact Number',
    streetaddress: 'Street Address', barangay: 'Barangay', citymunicipality: 'City / Municipality',
    province: 'Province', region: 'Region', zipcode: 'Zip Code', nationality: 'Nationality',
    sex: 'Sex / Gender', civilstatus: 'Civil Status', schoolattended: 'School Attended',
    coursecompleted: 'Course / Degree Completed', yeargraduated: 'Year Graduated',
    educationalattainment: 'Educational Attainment', specialneeds: 'Special Needs / Accommodation',
  };
  const lower = key.toLowerCase().replace(/[-_]/g, '');
  if (map[lower]) return map[lower];
  return key.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, (c) => c.toUpperCase());
};

export function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

export {
  isUnrelatedSection,
  isRemovedAmateurSection,
  isApplicantParticularField,
  isSignatureOrDeclarationField,
  isJurisdictionOrVariantField,
  isRemovedAmateurField,
  isRemovedVasField,
  isExamEducationField,
  isExamAssistanceField,
} from './applicationDetailsFieldCheckers';

export const getSectionIcon = (title: string): string => {
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
  return colors[idx % colors.length] ?? '#0F2C59';
};
