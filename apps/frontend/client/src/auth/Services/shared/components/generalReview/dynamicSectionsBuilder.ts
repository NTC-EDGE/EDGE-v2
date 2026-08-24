/**
 * dynamicSectionsBuilder.ts — backward-compat bridge
 *
 * buildDynamicSections is now maintained in the shared formPreview module.
 * This file provides compatible wrapper functions so any remaining callers continue to work.
 */
import { DynamicSectionGroup, FormFieldValue } from '../../../../../shared/formPreview/core/formPreviewTypes';
import { buildDynamicSections } from '../../../../../shared/formPreview/core/buildDynamicSections';

export function buildDynamicSectionsToRender(
  form: { sections?: Array<{ id?: string; key?: string; title?: string; fields?: Array<{ id?: string; fieldId?: string; label?: string }> }> } | null | undefined,
  formFieldValues: FormFieldValue[],
  _renderedFieldIds?: Set<string>,
  isAmateurCertService = false
): DynamicSectionGroup[] {
  const result = buildDynamicSections(form, formFieldValues, { isAmateurCertService });
  return result.dynamicSectionsToRender;
}

export function filterRemainingReviewFields(
  formFieldValues: FormFieldValue[],
  _renderedFieldIds?: Set<string>,
  isAmateurCertService = false
): FormFieldValue[] {
  const result = buildDynamicSections(null, formFieldValues, { isAmateurCertService });
  return result.remainingFields;
}
