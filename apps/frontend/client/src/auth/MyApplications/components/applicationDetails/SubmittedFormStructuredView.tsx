import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useApi } from '../../../../shared/hooks/useApi';
import { useServiceForm } from '../../../Services/shared/hooks/useServiceForm';
import { Application } from '../../data/applicationsData';
import { formatFieldKey } from './applicationDetailsHelpers';
import { isGuid } from './applicationDetailsTypes';
import { SectionCard } from './SectionCard';
import { SummaryRow } from './SummaryRow';
import { useDynamicFormSections } from './useDynamicFormSections';
import { DigitalSignatureCard } from './DigitalSignatureCard';

export interface SubmittedFormStructuredViewProps {
  app: Application;
  primaryName: string;
  formFieldValues: Array<{ fieldId: string; fieldLabel: string; value: string }>;
  onPreviewFile?: (uri: string, name: string) => void;
  sectionNumber?: string;
  serviceId?: string;
  serviceVariantId?: string | null;
}

export function SubmittedFormStructuredView({
  app,
  primaryName,
  formFieldValues,
  onPreviewFile,
  serviceId,
  serviceVariantId,
}: SubmittedFormStructuredViewProps) {
  const api = useApi();
  const { data: allServicesRes } = api.useQuery<{ succeeded?: boolean; data?: Array<{ id: string; name?: string; title?: string }> }>('/api/v2/services?pageSize=9999');

  const resolvedServiceId = useMemo(() => {
    if (isGuid(serviceId)) return serviceId;
    if (isGuid(app.serviceId)) return app.serviceId;

    const serviceList = allServicesRes?.data || [];
    const targetName = (app.serviceName || '').toLowerCase().trim();
    if (!targetName) return undefined;

    const matched = serviceList.find(
      (s) => (s.name || s.title || '').toLowerCase().trim() === targetName
    );
    return matched?.id;
  }, [serviceId, app.serviceId, app.serviceName, allServicesRes]);

  const effectiveServiceId = resolvedServiceId || serviceId || app.serviceId;
  const effectiveVariantId = serviceVariantId || app.serviceVariantId;
  const { form } = useServiceForm(effectiveServiceId, effectiveVariantId);

  const {
    isExamService,
    dynamicSectionsToRender,
    declarations,
    signatures,
    examEducationFields,
    examAssistanceFields,
    nonExamRemainingFields,
  } = useDynamicFormSections(form, formFieldValues, app);

  return (
    <View style={{ gap: 16 }}>
      {/* Dynamic Form Schema Sections */}
      {dynamicSectionsToRender.map((sec) => (
        <SectionCard
          key={sec.id}
          icon={sec.icon}
          title={sec.title}
          accentColor={sec.accentColor}
        >
          <View style={{ gap: 8 }}>
            {sec.fields.map((fld) => (
              <SummaryRow
                key={fld.fieldId}
                label={fld.label}
                value={fld.value}
                onPreviewFile={onPreviewFile}
              />
            ))}
          </View>
        </SectionCard>
      ))}

      {/* Exam-Specific Sections */}
      {isExamService && examEducationFields.length > 0 && (
        <SectionCard icon="book-open" title="Educational Background & Qualifications" accentColor="#0284C7">
          <View style={{ gap: 8 }}>
            {examEducationFields.map((fv) => (
              <SummaryRow
                key={fv.fieldId}
                label={fv.fieldLabel || formatFieldKey(fv.fieldId)}
                value={fv.value}
                onPreviewFile={onPreviewFile}
              />
            ))}
          </View>
        </SectionCard>
      )}

      {isExamService && examAssistanceFields.length > 0 && (
        <SectionCard icon="info" title="Special Needs & Assistance Request" accentColor="#0D9488">
          <View style={{ gap: 8 }}>
            {examAssistanceFields.map((fv) => (
              <SummaryRow
                key={fv.fieldId}
                label={fv.fieldLabel || formatFieldKey(fv.fieldId)}
                value={fv.value}
                onPreviewFile={onPreviewFile}
              />
            ))}
          </View>
        </SectionCard>
      )}

      {/* Non-Exam Unmapped Form Fields */}
      {!isExamService && dynamicSectionsToRender.length === 0 && nonExamRemainingFields.length > 0 && (
        <SectionCard
          icon="file-text"
          title="Application Particulars & Technical Details"
          accentColor="#0284C7"
        >
          <View style={{ gap: 8 }}>
            {nonExamRemainingFields.map((field, idx) => (
              <SummaryRow
                key={field.fieldId || `fld-${idx}`}
                label={field.fieldLabel || formatFieldKey(field.fieldId)}
                value={field.value}
                onPreviewFile={onPreviewFile}
              />
            ))}
          </View>
        </SectionCard>
      )}

      {/* Legal Declarations */}
      {declarations.length > 0 && (
        <SectionCard
          icon="check-circle"
          title="Legal Declarations & Affirmations"
          accentColor="#16A34A"
        >
          <View style={{ gap: 8 }}>
            {declarations.map((dec, idx) => (
              <SummaryRow
                key={dec.fieldId || `dec-${idx}`}
                label={dec.fieldLabel || dec.fieldId}
                value={dec.value}
              />
            ))}
          </View>
        </SectionCard>
      )}

      {/* Digital Signature */}
      <DigitalSignatureCard signatures={signatures} primaryName={primaryName} />
    </View>
  );
}
