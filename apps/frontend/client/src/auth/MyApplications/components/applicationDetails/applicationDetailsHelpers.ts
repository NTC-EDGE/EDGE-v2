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
