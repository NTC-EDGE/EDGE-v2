import React, { useMemo } from 'react';
import { View } from 'react-native';
import {
  FormFieldValue,
  ServiceIdentifier,
  ActiveApplicantSnapshot,
} from '../core/formPreviewTypes';
import { detectCanonicalForm } from '../core/canonicalFormDefinitions';
import { buildDynamicSections } from '../core/buildDynamicSections';
import {
  isExamEducationField,
  isExamAssistanceField,
} from '../core/formPreviewFieldCheckers';
import { getPreviewExtension } from '../extensions';
import { EquivalentFormHeaderCard } from './EquivalentFormHeaderCard';
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
      visibilityCondition?: string | null;
      fields?: Array<{ id?: string; fieldId?: string; label?: string; visibilityCondition?: string | null }>;
    }>;
    serviceCode?: string;
    version?: string;
  } | null;
  formFieldValues: FormFieldValue[];
  activeApplicant?: ActiveApplicantSnapshot;
  // Resolved Applicant Details
  resolvedFullName?: string | null;
  resolvedEmail?: string;
  resolvedContactNo?: string;
  resolvedAddress?: string | null;
  resolvedBirthDate?: string | null;
  resolvedSex?: string | null;
  resolvedCivilStatus?: string | null;
  resolvedNationality?: string | null;
  schoolAttended?: string | null;
  schoolName?: string | null;
  courseTaken?: string | null;
  courseDegree?: string | null;
  yearGraduated?: string | null;
  specialOrderNo?: string | null;
  applicantType?: string;
  companyName?: string | null;
  representativeName?: string | null;
  notes?: string | null;
  // Service Variant Parameters
  selectedVariantName?: string | null;
  selectedVariantId?: string | null;
  selectedVariantDescription?: string | null;
  applicationType?: string | null;
  showEquivalentFormHeader?: boolean;
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
  schoolAttended,
  schoolName,
  courseTaken,
  courseDegree,
  yearGraduated,
  specialOrderNo,
  applicantType,
  companyName,
  representativeName,
  notes,
  selectedVariantName,
  selectedVariantId,
  selectedVariantDescription,
  applicationType,
  showEquivalentFormHeader = true,
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

  const effectiveVariantName =
    selectedVariantName ||
    activeApplicant?.selectedVariantName ||
    activeApplicant?.selectedVariant ||
    null;

  const effectiveVariantId =
    selectedVariantId ||
    activeApplicant?.selectedVariantId ||
    null;

  // Detect equivalent statutory application form from service + variant
  const canonicalForm = useMemo(() => {
    return detectCanonicalForm(service, effectiveVariantName);
  }, [service, effectiveVariantName]);

  const isExam =
    isExamService ??
    (serviceCategoryLower.includes('exam') ||
      serviceTitleLower.includes('exam') ||
      serviceTitleLower.includes('admission') ||
      serviceTitleLower.includes('operator examination') ||
      canonicalForm?.viewType === 'exam');

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
    (service.id || '').toLowerCase().includes('f20') ||
    canonicalForm?.viewType === 'vas_provider';

  const extension = getPreviewExtension(service);

  const { dynamicSectionsToRender, remainingFields } = useMemo(() => {
    return buildDynamicSections(form, formFieldValues, {
      isAmateurCertService: isAmateur,
      isVasCertService: isVas,
      skipFieldIds: extension?.skipFieldIds,
      skipFieldLabels: extension?.skipFieldLabels,
      showApplicantCard,
      selectedVariantName: effectiveVariantName,
      selectedVariantId: effectiveVariantId,
      serviceTitle: service.title,
      serviceName: service.name,
      serviceCode: form?.serviceCode,
      applicationType: applicationType || activeApplicant?.applicationType,
      applicantType: (applicantType || activeApplicant?.applicantType || '').toLowerCase() === 'company' ? 'company' : 'individual',
    });
  }, [
    form,
    formFieldValues,
    isAmateur,
    isVas,
    extension,
    showApplicantCard,
    effectiveVariantName,
    effectiveVariantId,
    service.title,
    service.name,
    form?.serviceCode,
    applicationType,
    activeApplicant?.applicationType,
    applicantType,
    activeApplicant?.applicantType,
  ]);

  const schoolAttendedVal =
    schoolAttended ||
    schoolName ||
    activeApplicant?.schoolAttended ||
    activeApplicant?.schoolName ||
    formFieldValues.find(
      (fv) =>
        fv.fieldId === 'fd000000-0000-0000-0000-000000000006' ||
        fv.fieldId === 'fd000000-0000-0000-0000-000000000061' ||
        fv.fieldLabel.toLowerCase().includes('school') ||
        fv.fieldLabel.toLowerCase().includes('university')
    )?.value ||
    null;

  const courseTakenVal =
    courseTaken ||
    courseDegree ||
    activeApplicant?.courseTaken ||
    activeApplicant?.courseDegree ||
    formFieldValues.find(
      (fv) =>
        fv.fieldId === 'fd000000-0000-0000-0000-000000000062' ||
        fv.fieldLabel.toLowerCase().includes('course') ||
        fv.fieldLabel.toLowerCase().includes('degree') ||
        fv.fieldLabel.toLowerCase().includes('program')
    )?.value ||
    null;

  const yearGraduatedVal =
    yearGraduated ||
    activeApplicant?.yearGraduated ||
    formFieldValues.find(
      (fv) =>
        fv.fieldId === 'fd000000-0000-0000-0000-000000000063' ||
        fv.fieldLabel.toLowerCase().includes('year graduated') ||
        fv.fieldLabel.toLowerCase().includes('yeargraduated')
    )?.value ||
    null;

  const specialOrderNoVal =
    specialOrderNo ||
    activeApplicant?.specialOrderNo ||
    formFieldValues.find(
      (fv) =>
        fv.fieldLabel.toLowerCase().includes('special order') ||
        fv.fieldLabel.toLowerCase().includes('so number')
    )?.value ||
    null;

  const hasEducationInApplicantCard = Boolean(
    schoolAttendedVal || courseTakenVal || yearGraduatedVal || specialOrderNoVal
  );

  const examEducationFields = useMemo(() => {
    if (!isExam) return [];
    return remainingFields.filter((f) => isExamEducationField(f.fieldLabel, f.fieldId));
  }, [isExam, remainingFields]);

  const examAssistanceFields = useMemo(() => {
    if (!isExam) return [];
    return remainingFields.filter((f) => isExamAssistanceField(f.fieldLabel, f.fieldId));
  }, [isExam, remainingFields]);

  const nonExamRemainingFields = useMemo(() => {
    if (isExam) return [];
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

  const applicantData: ActiveApplicantSnapshot = activeApplicant || {
    applicantType,
    companyName,
    representativeName,
    notes,
    schoolAttended: schoolAttendedVal,
    schoolName: schoolAttendedVal,
    courseTaken: courseTakenVal,
    courseDegree: courseTakenVal,
    yearGraduated: yearGraduatedVal,
    specialOrderNo: specialOrderNoVal,
    selectedVariantName: effectiveVariantName || undefined,
    selectedVariantId: effectiveVariantId || undefined,
  };

  return (
    <View style={{ gap: 16 }}>
      {/* Top Header Slot (e.g. Hero banner, Jurisdiction, Bulk Cohort) */}
      {headerSlot}

      {/* Equivalent Statutory Application Form Card */}
      {showEquivalentFormHeader && canonicalForm && (
        <EquivalentFormHeaderCard
          canonicalForm={canonicalForm}
          serviceTitle={service.title || service.name}
          serviceVariantName={effectiveVariantName}
          version={form?.version || '1.0'}
        />
      )}

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
          schoolAttended={schoolAttendedVal}
          courseTaken={courseTakenVal}
          yearGraduated={yearGraduatedVal}
          specialOrderNo={specialOrderNoVal}
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
        suppressEducationSection={hasEducationInApplicantCard}
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
