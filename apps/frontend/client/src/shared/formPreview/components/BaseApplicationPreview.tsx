import React, { useMemo } from 'react';
import { View } from 'react-native';
import {
  FormFieldValue,
  ServiceIdentifier,
  ActiveApplicantSnapshot,
} from '../core/formPreviewTypes';
import { buildDynamicSections } from '../core/buildDynamicSections';
import {
  isExamEducationField,
  isExamAssistanceField,
} from '../core/formPreviewFieldCheckers';
import { getPreviewExtension } from '../extensions';
import { ApplicantDetailsReviewCard } from './ApplicantDetailsReviewCard';
import { DynamicFormSectionsReview } from './DynamicFormSectionsReview';
import { ExamEducationReviewSection } from './ExamEducationReviewSection';
import { DigitalSignatureReviewCard } from './DigitalSignatureReviewCard';

export interface BaseApplicationPreviewProps {
  service: ServiceIdentifier;
  form?: {
    sections?: Array<{
      id?: string;
      key?: string;
      title?: string;
      fields?: Array<{ id?: string; fieldId?: string; label?: string }>;
    }>;
  } | null;
  formFieldValues: FormFieldValue[];
  activeApplicant?: ActiveApplicantSnapshot;
  // Resolved Applicant Particulars
  resolvedFullName?: string | null;
  resolvedEmail?: string;
  resolvedContactNo?: string;
  resolvedAddress?: string | null;
  resolvedBirthDate?: string | null;
  resolvedSex?: string | null;
  resolvedCivilStatus?: string | null;
  resolvedNationality?: string | null;
  applicantType?: string;
  companyName?: string | null;
  representativeName?: string | null;
  notes?: string | null;
  // Flags (optional, derived if not passed)
  isExamService?: boolean;
  isLicenseService?: boolean;
  isPermitService?: boolean;
  isCertificateService?: boolean;
  isAmateurCertService?: boolean;
  // File preview callback
  onPreviewFile?: (uri: string, label: string) => void;
  // Slots
  headerSlot?: React.ReactNode;
  footerSlot?: React.ReactNode;
  showApplicantCard?: boolean;
  showSignatureCard?: boolean;
  signatureEntry?: FormFieldValue | null;
  renderSpecializedCards?: () => React.ReactNode;
}

export function BaseApplicationPreview({
  service,
  form,
  formFieldValues,
  activeApplicant,
  resolvedFullName,
  resolvedEmail,
  resolvedContactNo,
  resolvedAddress,
  resolvedBirthDate,
  resolvedSex,
  resolvedCivilStatus,
  resolvedNationality,
  applicantType,
  companyName,
  representativeName,
  notes,
  isExamService,
  isAmateurCertService,
  onPreviewFile = () => {},
  headerSlot,
  footerSlot,
  showApplicantCard = true,
  showSignatureCard = true,
  signatureEntry,
  renderSpecializedCards,
}: BaseApplicationPreviewProps) {
  const serviceCategoryLower = (service.category || '').toLowerCase().trim();
  const serviceTitleLower = (service.title || '').toLowerCase().trim();

  const isExam =
    isExamService ??
    (serviceCategoryLower.includes('exam') ||
      serviceTitleLower.includes('exam') ||
      serviceTitleLower.includes('admission') ||
      serviceTitleLower.includes('operator examination'));

  const isAmateur =
    isAmateurCertService ??
    ((service.category || '').toLowerCase().includes('certificate') &&
      ((service.title || '').toLowerCase().includes('amateur') ||
        (service.id || '').toLowerCase().includes('103') ||
        (service.id || '').toLowerCase().includes('ntc_1_03')));

  const isVas =
    serviceCategoryLower.includes('vas') ||
    serviceTitleLower.includes('vas') ||
    serviceTitleLower.includes('value-added') ||
    (service.id || '').toLowerCase().includes('120') ||
    (service.id || '').toLowerCase().includes('f20');

  const extension = getPreviewExtension(service);

  const { dynamicSectionsToRender, remainingFields } = useMemo(() => {
    return buildDynamicSections(form, formFieldValues, {
      isAmateurCertService: isAmateur,
      isVasCertService: isVas,
      skipFieldIds: extension?.skipFieldIds,
      skipFieldLabels: extension?.skipFieldLabels,
      showApplicantCard,
    });
  }, [form, formFieldValues, isAmateur, isVas, extension, showApplicantCard]);

  const examEducationFields = useMemo(() => {
    if (!isExam) return [];
    return remainingFields.filter((f) => isExamEducationField(f.fieldLabel, f.fieldId));
  }, [isExam, remainingFields]);

  const examAssistanceFields = useMemo(() => {
    if (!isExam) return [];
    return remainingFields.filter((f) => isExamAssistanceField(f.fieldLabel, f.fieldId));
  }, [isExam, remainingFields]);

  const nonExamRemainingFields = useMemo(() => {
    if (!isExam) return remainingFields;
    return remainingFields.filter(
      (f) =>
        !examEducationFields.some((ef) => ef.fieldId === f.fieldId || ef.fieldLabel === f.fieldLabel) &&
        !examAssistanceFields.some((af) => af.fieldId === f.fieldId || af.fieldLabel === f.fieldLabel)
    );
  }, [isExam, remainingFields, examEducationFields, examAssistanceFields]);


  const resolvedSig =
    signatureEntry ||
    formFieldValues.find(
      (fv) =>
        fv.fieldId.toLowerCase().includes('signature') ||
        fv.fieldLabel.toLowerCase().includes('signature') ||
        fv.value.startsWith('data:image') ||
        fv.value.startsWith('typed:cursive:') ||
        fv.value.startsWith('blob:')
    ) ||
    (activeApplicant?.signatureUrl
      ? {
          fieldId: 'signature',
          fieldLabel: 'Applicant Signature',
          value: activeApplicant.signatureUrl,
        }
      : null);

  const applicantData = activeApplicant || {
    applicantType,
    companyName,
    representativeName,
    notes,
  };

  return (
    <View style={{ gap: 16 }}>
      {/* Top Header Slot (e.g. Hero banner, Jurisdiction, Bulk Cohort) */}
      {headerSlot}

      {/* Extension Before Sections */}
      {extension?.sections
        ?.filter((s) => s.position === 'before')
        .map((s, idx) => (
          <React.Fragment key={`ext-before-${idx}`}>
            {s.render({ service, formFieldValues, activeApplicant, onPreviewFile })}
          </React.Fragment>
        ))}

      {/* Applicant Details */}
      {showApplicantCard && (
        <ApplicantDetailsReviewCard
          activeApplicant={applicantData}
          resolvedFullName={resolvedFullName ?? null}
          resolvedEmail={resolvedEmail ?? ''}
          resolvedContactNo={resolvedContactNo ?? ''}
          resolvedAddress={resolvedAddress ?? null}
          resolvedBirthDate={resolvedBirthDate ?? null}
          resolvedSex={resolvedSex ?? null}
          resolvedCivilStatus={resolvedCivilStatus ?? null}
          resolvedNationality={resolvedNationality ?? null}
        />
      )}

      {/* Dynamic Form Sections from Schema */}
      <DynamicFormSectionsReview
        dynamicSectionsToRender={dynamicSectionsToRender}
        isExamService={isExam}
        remainingFields={nonExamRemainingFields}
        onPreviewFile={onPreviewFile}
      />

      {/* Exam-Specific Education & Assistance */}
      <ExamEducationReviewSection
        isExamService={isExam}
        examEducationFields={examEducationFields}
        examAssistanceFields={examAssistanceFields}
        onPreviewFile={onPreviewFile}
      />

      {/* Extension After Sections */}
      {extension?.sections
        ?.filter((s) => s.position === 'after')
        .map((s, idx) => (
          <React.Fragment key={`ext-after-${idx}`}>
            {s.render({ service, formFieldValues, activeApplicant, onPreviewFile })}
          </React.Fragment>
        ))}

      {/* Fallback Specialized Cards when dynamic sections are empty */}
      {dynamicSectionsToRender.length === 0 && renderSpecializedCards ? renderSpecializedCards() : null}

      {/* Footer Slot (e.g. Attached Requirements / Documents) */}
      {footerSlot}

      {/* Digital Signature */}
      {showSignatureCard && resolvedSig && (
        <DigitalSignatureReviewCard signatureEntry={resolvedSig} />
      )}
    </View>
  );
}
