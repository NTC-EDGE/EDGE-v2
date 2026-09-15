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
  'n/a',
  'na',
  'none',
  'juan dela cruz',
]);

function isValidName(val: unknown): val is string {
  if (typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (!trimmed) return false;
  return !GENERIC_NAMES.has(trimmed.toLowerCase());
}

export function extractApplicantFullName(
  app: Application | null | undefined,
  details: RawApplicantDetails | null | undefined,
  first: RawApplicantHolder | null | undefined
): string {
  if (isValidName(first?.name)) return first.name.trim();
  if (isValidName(first?.applicantName)) return first.applicantName.trim();
  if (isValidName(details?.fullName)) return details.fullName.trim();
  if (isValidName(details?.applicantName)) return details.applicantName.trim();

  const firstName = details?.firstName || details?.first_name || '';
  const lastName = details?.lastName || details?.last_name || '';
  const combined = `${firstName} ${lastName}`.trim();
  if (isValidName(combined)) return combined;

  if (isValidName(app?.applicantName)) {
    return app.applicantName.trim();
  }

  const fvList: RawFormFieldItem[] =
    (Array.isArray(details?.formFieldValues) && details.formFieldValues.length > 0 ? details.formFieldValues :
      Array.isArray(first?.formFieldValues) && first.formFieldValues.length > 0 ? first.formFieldValues :
      Array.isArray(app?.formFieldValues) && app.formFieldValues.length > 0 ? (app.formFieldValues as RawFormFieldItem[]) : []);

  if (fvList.length > 0) {
    const knownFv = fvList.find((fv) => fv.fieldId === FIELD_ID_FULL_NAME);
    if (isValidName(knownFv?.value)) return knownFv.value.trim();

    const matchedFv = fvList.find((fv) => {
      const lbl = (fv.fieldLabel || fv.label || fv.key || fv.fieldId || '').toLowerCase();
      return (
        lbl.includes('full name') ||
        lbl.includes('applicant name') ||
        lbl.includes('name of applicant') ||
        lbl.includes('business name') ||
        lbl.includes('company name')
      );
    });
    if (isValidName(matchedFv?.value)) return matchedFv.value.trim();
  }

  if (isValidName(app?.filingUser?.name)) return app.filingUser.name.trim();
  if (isValidName(app?.filingUser?.company?.name)) return app.filingUser.company.name.trim();
  if (isValidName(app?.companyName)) return app.companyName.trim();

  return 'Applicant';
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
