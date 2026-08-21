import { DynamicSectionGroup } from './generalReviewTypes';
import {
  isUnrelatedSection,
  isApplicantParticularField,
  isSignatureOrDeclarationField,
  isJurisdictionOrVariantField,
  getSectionIcon,
  getSectionAccentColor,
} from './generalReviewHelpers';

export function buildDynamicSectionsToRender(
  form: { sections?: Array<{ id?: string; key?: string; title?: string; fields?: Array<{ id?: string; fieldId?: string; label?: string }> }> } | null | undefined,
  formFieldValues: Array<{ fieldId: string; fieldLabel: string; value: string }>,
  renderedFieldIds: Set<string>,
  isAmateurCertService: boolean
): DynamicSectionGroup[] {
  if (!form?.sections || !Array.isArray(form.sections) || form.sections.length === 0) return [];
  const result: DynamicSectionGroup[] = [];

  form.sections.forEach((section, sIdx) => {
    const sectionKey = section.key || section.id || '';
    const sectionTitle = section.title || `Section ${sIdx + 1}`;

    if (isUnrelatedSection(sectionTitle) || isUnrelatedSection(sectionKey)) {
      (section.fields || []).forEach((field) => {
        if (field.fieldId) renderedFieldIds.add(field.fieldId);
        if (field.id) renderedFieldIds.add(field.id);
        if (field.label) renderedFieldIds.add(field.label);
      });
      return;
    }

    if (isAmateurCertService) {
      const keyLower = sectionKey.toLowerCase();
      const titleLower = sectionTitle.toLowerCase();
      const isRemoved =
        keyLower.includes('employment') ||
        keyLower.includes('classofstation') ||
        keyLower.includes('class_of_station') ||
        keyLower.includes('club') ||
        keyLower.includes('equipment') ||
        titleLower.includes('employment') ||
        titleLower.includes('class of station') ||
        titleLower.includes('club') ||
        titleLower.includes('equipment');
      if (isRemoved) {
        (section.fields || []).forEach((field) => {
          if (field.fieldId) renderedFieldIds.add(field.fieldId);
          if (field.id) renderedFieldIds.add(field.id);
          if (field.label) renderedFieldIds.add(field.label);
        });
        return;
      }
    }

    const sectionFields: Array<{ fieldId: string; label: string; value: string }> = [];

    (section.fields || []).forEach((field) => {
      const fieldId = field.fieldId || field.id || '';
      const fieldLabel = field.label || '';
      if (
        isApplicantParticularField(fieldLabel) || isApplicantParticularField(fieldId) ||
        isSignatureOrDeclarationField(fieldLabel) || isSignatureOrDeclarationField(fieldId) ||
        isJurisdictionOrVariantField(fieldLabel) || isJurisdictionOrVariantField(fieldId)
      ) {
        renderedFieldIds.add(fieldId);
        renderedFieldIds.add(fieldLabel);
        return;
      }

      const matchedFv = formFieldValues.find(
        (fv) => fv.fieldId === fieldId || fv.fieldLabel.toLowerCase().trim() === fieldLabel.toLowerCase().trim()
      );

      if (matchedFv?.value && matchedFv.value.trim() !== '') {
        const val = matchedFv.value.trim();
        const valUpper = val.toUpperCase();
        if (
          valUpper !== 'N/A' &&
          valUpper !== 'NA' &&
          val !== '-' &&
          val !== '[]' &&
          val !== '{}' &&
          !valUpper.includes('TO BE ASSIGNED BY NTC') &&
          !valUpper.includes('TO BE ASSIGNED')
        ) {
          sectionFields.push({ fieldId, label: fieldLabel || matchedFv.fieldLabel, value: val });
          renderedFieldIds.add(fieldId);
          renderedFieldIds.add(matchedFv.fieldId);
          renderedFieldIds.add(fieldLabel);
          renderedFieldIds.add(matchedFv.fieldLabel);
        }
      }
    });

    if (sectionFields.length > 0) {
      result.push({
        id: section.id || sectionKey || `sec-${sIdx}`,
        title: sectionTitle,
        icon: getSectionIcon(sectionTitle),
        accentColor: getSectionAccentColor(result.length),
        fields: sectionFields,
      });
    }
  });

  return result;
}

export function filterRemainingReviewFields(
  formFieldValues: Array<{ fieldId: string; fieldLabel: string; value: string }>,
  renderedFieldIds: Set<string>,
  isAmateurCertService: boolean
) {
  return formFieldValues.filter((fv) => {
    const fieldId = fv.fieldId || '';
    const label = fv.fieldLabel || '';
    const idLower = fieldId.toLowerCase().trim();
    const labelLower = label.toLowerCase().trim();

    if (
      renderedFieldIds.has(fieldId) ||
      renderedFieldIds.has(label) ||
      renderedFieldIds.has(idLower) ||
      renderedFieldIds.has(labelLower)
    ) {
      return false;
    }
    if (isApplicantParticularField(label) || isApplicantParticularField(fieldId)) return false;
    if (isSignatureOrDeclarationField(label) || isSignatureOrDeclarationField(fieldId)) return false;
    if (isJurisdictionOrVariantField(label) || isJurisdictionOrVariantField(fieldId)) return false;

    // Filter out individual repeater subfields and device fields from leaking into remaining fields
    const isRepeaterSubField =
      idLower === 'devicesdetails' ||
      idLower.includes('devicesdetails') ||
      idLower.includes('equipmentdetails') ||
      idLower.includes('antennadetails') ||
      idLower.includes('radioofficers') ||
      labelLower.includes('registered devices') ||
      labelLower.includes('devices details') ||
      idLower === 'serialnumber' ||
      idLower === 'serial_number' ||
      idLower === 'serial number' ||
      idLower === 'serialnumbers' ||
      idLower === 'serial number(s)' ||
      idLower === 'frequencyrange' ||
      idLower === 'frequency_range' ||
      idLower === 'frequency range' ||
      idLower === 'poweroutput' ||
      idLower === 'power_output' ||
      idLower === 'power output' ||
      idLower === 'make' ||
      idLower === 'model' ||
      idLower === 'type/model' ||
      idLower === 'maketypeModel' ||
      idLower === 'make / type / model' ||
      idLower === 'devicetype' ||
      idLower === 'device / equipment type' ||
      idLower === 'fd000000-0000-0000-0000-000000000084' ||
      idLower === 'fd000000-0000-0000-0000-000000000085' ||
      idLower === 'fd000000-0000-0000-0000-000000000087';
    if (isRepeaterSubField) return false;

    if (isAmateurCertService) {
      const isRemoved =
        labelLower.includes('employment') ||
        labelLower.includes('class of station') ||
        labelLower.includes('classofstation') ||
        labelLower.includes('club') ||
        labelLower.includes('equipment') ||
        labelLower.includes('permit') ||
        labelLower.includes('license type') ||
        labelLower.includes('certificate type') ||
        labelLower.includes('nationality') ||
        labelLower.includes('citizenship') ||
        labelLower.includes('civil status') ||
        labelLower.includes('civilstatus') ||
        idLower.includes('employment') ||
        idLower.includes('classofstation') ||
        idLower.includes('club') ||
        idLower.includes('equipment') ||
        idLower.includes('permittype') ||
        idLower.includes('nationality') ||
        idLower.includes('civilstatus');
      if (isRemoved) return false;
    }
    const val = (fv.value || '').trim();
    const valUpper = val.toUpperCase();
    if (
      val === '' ||
      valUpper === 'N/A' ||
      valUpper === 'NA' ||
      val === '-' ||
      val === '[]' ||
      val === '{}' ||
      valUpper.includes('TO BE ASSIGNED BY NTC') ||
      valUpper.includes('TO BE ASSIGNED')
    ) {
      return false;
    }
    return true;
  });
}
