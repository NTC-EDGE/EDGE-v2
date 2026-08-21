/**
 * generalReviewHelpers.ts — backward-compat re-export bridge
 *
 * All predicate functions are now maintained in the shared formPreview module.
 * This file re-exports them so all existing wizard imports continue to work.
 */
export {
  isUnrelatedSection,
  isApplicantParticularField,
  isSignatureOrDeclarationField,
  isJurisdictionOrVariantField,
  isRemovedAmateurSection,
  isRemovedAmateurField,
  isRemovedVasField,
  isExamEducationField,
  isExamAssistanceField,
  isRepeaterSubField,
  isSuppressedValue,
} from '../../../../../shared/formPreview/core/formPreviewFieldCheckers';

export {
  getSectionIcon,
  getSectionAccentColor,
  isRecord,
  isPreviewFileObject,
  formatFieldKey,
} from '../../../../../shared/formPreview/core/formPreviewHelpers';

// getRequirementLabel depends on NTCService — stays in the local wizard formatter
export { getRequirementLabel } from './generalReviewFormatters';
