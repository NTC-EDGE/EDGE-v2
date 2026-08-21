/**
 * applicationDetailsFieldCheckers.ts — backward-compat re-export bridge
 *
 * All predicate functions are now maintained in the shared formPreview module.
 * This file re-exports them so existing My Application imports continue to work.
 */
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
} from '../../../../shared/formPreview/core/formPreviewFieldCheckers';
