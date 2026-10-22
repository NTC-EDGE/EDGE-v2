/**
 * applicationDetailsHelpers.ts — backward-compat re-export bridge
 *
 * Data-extraction helpers remain here (extractApplicantFullName, resolveBirthDate,
 * resolveCivilStatus). Everything else is now re-exported from the shared
 * formPreview module so changes in one place propagate everywhere.
 */

import { Application } from '../../data/applicationsData';
import { FIELD_ID_FULL_NAME, FIELD_ID_BIRTH_DATE, FIELD_ID_CIVIL_STATUS } from '../../../../shared/constants/fieldIds';
import { RawFormFieldItem, RawApplicantDetails, RawApplicantHolder } from './applicationDetailsTypes';

// ─── Re-exports from shared module (single source of truth) ──────────────────

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
  isRepeaterSubField,
  isSuppressedValue,
} from '../../../../shared/formPreview';

export {
  getSectionIcon,
  getSectionAccentColor,
  isRecord,
  formatFieldKey,
} from '../../../../shared/formPreview/core/formPreviewHelpers';

// ─── My Application-specific data extraction helpers ─────────────────────────

const GENERIC_NAMES = new Set([
  'applicant details',
  'applicant detail',
  'applicant',
  'unnamed applicant',
  'unnamed',
  'n/a',
  'na',
  'none',
  'juan dela cruz',
]);

function isGenericNameString(val: string): boolean {
  const trimmed = val.trim().toLowerCase();
  if (GENERIC_NAMES.has(trimmed)) return true;
  if (/^applicant(\s*#?\s*\d+)?$/i.test(trimmed)) return true;
  if (/^draft(\s+applicant)?(\s*#?\s*\d+)?$/i.test(trimmed)) return true;
  return false;
}

function isValidName(val: unknown): val is string {
  if (typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (!trimmed) return false;
  return !isGenericNameString(trimmed);
}

export function formatProperName(name?: string | null): string {
  if (!name || typeof name !== 'string') return '';
  const trimmed = name.trim();
  if (!trimmed) return '';

  return trimmed
    .split(/\s+/)
    .map((word) => {
      if (!word) return '';
      if (word.includes('-')) {
        return word
          .split('-')
          .map((part) => {
            if (!part) return '';
            if (part === part.toLowerCase()) {
              return part.charAt(0).toUpperCase() + part.slice(1);
            }
            return part;
          })
          .join('-');
      }
      if (word === word.toLowerCase()) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(' ');
}

export function extractApplicantFullName(
  app: Application | null | undefined,
  details: RawApplicantDetails | null | undefined,
  first: RawApplicantHolder | null | undefined
): string {
  if (isValidName(first?.name)) return formatProperName(first.name);
  if (isValidName(first?.applicantName)) return formatProperName(first.applicantName);
  if (isValidName(details?.fullName)) return formatProperName(details.fullName);
  if (isValidName(details?.applicantName)) return formatProperName(details.applicantName);

  const firstName = details?.firstName || details?.first_name || '';
  const middleName = details?.middleName || '';
  const lastName = details?.lastName || details?.last_name || '';
  const combined = [firstName, middleName, lastName].filter(Boolean).join(' ').trim();
  if (isValidName(combined)) return formatProperName(combined);

  if (isValidName(app?.applicantName)) {
    return formatProperName(app.applicantName);
  }

  const detailsFvList = Array.isArray(details?.formFieldValues) ? details.formFieldValues : [];
  const firstFvList = Array.isArray(first?.formFieldValues) ? first.formFieldValues : [];
  const appFvList = Array.isArray(app?.formFieldValues) ? app.formFieldValues : [];
  const fvList: RawFormFieldItem[] =
    detailsFvList.length > 0 ? detailsFvList : firstFvList.length > 0 ? firstFvList : appFvList;

  if (fvList.length > 0) {
    const knownFv = fvList.find((fv) => fv.fieldId === FIELD_ID_FULL_NAME);
    if (isValidName(knownFv?.value)) return formatProperName(knownFv.value);

    const matchedFv = fvList.find((fv) => {
      const lbl = (fv.fieldLabel || fv.label || fv.key || fv.fieldId || '').toLowerCase();
      return (
        lbl.includes('full name') ||
        lbl.includes('applicant name') ||
        lbl.includes('name of applicant') ||
        lbl.includes('business name') ||
        lbl.includes('company name') ||
        lbl.includes('corporate name') ||
        lbl.includes('registered name')
      );
    });
    if (isValidName(matchedFv?.value)) return formatProperName(matchedFv.value);
  }

  if (isValidName(details?.companyName)) return formatProperName(details.companyName);
  if (isValidName(first?.companyName)) return formatProperName(first.companyName);
  if (isValidName(details?.representativeName)) return formatProperName(details.representativeName);
  if (isValidName(first?.representativeName)) return formatProperName(first.representativeName);

  const filingUserName = app?.filingUser?.name;
  if (isValidName(filingUserName)) return formatProperName(filingUserName);

  const filingUserComp = app?.filingUser?.company?.name;
  if (isValidName(filingUserComp)) return formatProperName(filingUserComp);

  const appComp = app?.companyName;
  if (isValidName(appComp)) return formatProperName(appComp);

  const appRep = app?.representativeName;
  if (isValidName(appRep)) return formatProperName(appRep);

  return 'Applicant';
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function formatFullDateOfBirth(val: string | null | undefined): string | null {
  if (!val || typeof val !== 'string') return null;
  const trimmed = val.trim();
  if (!trimmed) return null;

  const shortMonthMatch = trimmed.match(/^([A-Za-z]+)\.?\s+(\d{1,2}),?\s+(\d{4})$/);
  if (shortMonthMatch) {
    const rawMonth = shortMonthMatch[1].toLowerCase();
    const day = parseInt(shortMonthMatch[2], 10);
    const year = shortMonthMatch[3];
    const foundIndex = MONTH_NAMES.findIndex((m) => m.toLowerCase().startsWith(rawMonth.slice(0, 3)));
    if (foundIndex !== -1) {
      return `${MONTH_NAMES[foundIndex]} ${day}, ${year}`;
    }
  }

  const isoMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    const year = isoMatch[1];
    const monthNum = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);
    if (monthNum >= 1 && monthNum <= 12 && day >= 1 && day <= 31) {
      return `${MONTH_NAMES[monthNum - 1]} ${day}, ${year}`;
    }
  }

  const slashMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (slashMatch) {
    const p1 = parseInt(slashMatch[1], 10);
    const p2 = parseInt(slashMatch[2], 10);
    const year = slashMatch[3];
    if (p1 >= 1 && p1 <= 12 && p2 >= 1 && p2 <= 31) {
      return `${MONTH_NAMES[p1 - 1]} ${p2}, ${year}`;
    }
  }

  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const m = MONTH_NAMES[parsed.getUTCMonth()];
    const d = parsed.getUTCDate();
    const y = parsed.getUTCFullYear();
    return `${m} ${d}, ${y}`;
  }

  return trimmed;
}

export function resolveBirthDate(
  details: RawApplicantDetails | null,
  rawFormFields: Array<{ fieldId?: string; fieldLabel?: string; value?: string }>
): string | null {
  const rawDate =
    details?.birthDate ||
    (details?.birthMonth && details?.birthDay && details?.birthYear
      ? `${details.birthMonth} ${details.birthDay}, ${details.birthYear}`
      : rawFormFields.find((fv) => fv.fieldId === FIELD_ID_BIRTH_DATE || fv.fieldId === 'birthDate' || (fv.fieldLabel || '').toLowerCase().includes('birth'))?.value || null);

  return formatFullDateOfBirth(rawDate);
}

export function resolveCivilStatus(
  details: RawApplicantDetails | null,
  rawFormFields: Array<{ fieldId?: string; fieldLabel?: string; value?: string }>
): string | null {
  return details?.civilStatus ||
    rawFormFields.find((fv) => fv.fieldId === FIELD_ID_CIVIL_STATUS || fv.fieldId === 'civilStatus' || (fv.fieldLabel || '').toLowerCase().includes('civil') || (fv.fieldLabel || '').toLowerCase().includes('marital'))?.value || null;
}
