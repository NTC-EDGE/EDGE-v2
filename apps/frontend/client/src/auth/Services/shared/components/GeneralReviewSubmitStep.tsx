import React, { useState } from 'react';
import { DocumentPreviewModal } from '../../../../shared/components/DocumentPreviewModal';
import { GeneralReviewSubmitStepProps, PreviewFileTarget } from './generalReview/generalReviewTypes';
import { useGeneralReviewData } from './generalReview/useGeneralReviewData';
import { useServiceForm } from '../hooks/useServiceForm';
import { BaseApplicationPreview } from '../../../../shared/formPreview';
import { HeroReviewHeader } from './generalReview/HeroReviewHeader';
import { JurisdictionParametersCard } from './generalReview/JurisdictionParametersCard';
import { BulkCohortReviewCard } from './generalReview/BulkCohortReviewCard';
import { AmateurStationLicenseReviewCard } from './generalReview/AmateurStationLicenseReviewCard';
import { LifetimeAmateurLicenseReviewCard } from './generalReview/LifetimeAmateurLicenseReviewCard';
import { RadioCertReviewCard } from './generalReview/RadioCertReviewCard';
import { DeviceRegReviewCard } from './generalReview/DeviceRegReviewCard';
import { TvroRegReviewCard } from './generalReview/TvroRegReviewCard';
import { VasReviewCard } from './generalReview/VasReviewCard';
import { CopyOfCertReviewCard } from './generalReview/CopyOfCertReviewCard';
import { PermitDataReviewCard } from './generalReview/PermitDataReviewCard';
import { PermitFeeSummaryCard } from './generalReview/PermitFeeSummaryCard';
import { UploadedDocumentsReviewCard } from './generalReview/UploadedDocumentsReviewCard';
import { FilingIntentReviewCard } from './generalReview/FilingIntentReviewCard';

export function GeneralReviewSubmitStep(props: GeneralReviewSubmitStepProps) {
  const {
    service,
    activeApplicant,
    applicants = [],
    currentApplicantIndex = 0,
    appMode,
    variantRequirements = [],
    filingIntent = 'Regular',
    onFilingIntentChange,
  } = props;

  const [previewFile, setPreviewFile] = useState<PreviewFileTarget>(null);
  const [previewLabel, setPreviewLabel] = useState<string>('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const reviewData = useGeneralReviewData(props);
  const { form } = useServiceForm(service.id, activeApplicant.selectedVariantId);

  const handlePreviewFile = (file: PreviewFileTarget, label: string) => {
    setPreviewFile(file);
    setPreviewLabel(label);
    setIsPreviewOpen(true);
  };

  return (
    <>
      <BaseApplicationPreview
        service={service}
        form={form}
        formFieldValues={reviewData.formFieldValues}
        activeApplicant={activeApplicant}
        resolvedFullName={reviewData.resolvedFullName}
        resolvedEmail={reviewData.resolvedEmail}
        resolvedContactNo={reviewData.resolvedContactNo}
        resolvedAddress={reviewData.resolvedAddress}
        resolvedBirthDate={reviewData.resolvedBirthDate}
        resolvedSex={reviewData.resolvedSex}
        resolvedCivilStatus={reviewData.resolvedCivilStatus}
        resolvedNationality={reviewData.resolvedNationality}
        isExamService={reviewData.isExamService}
        isAmateurCertService={reviewData.isAmateurCertService}
        onPreviewFile={(uri, lbl) => handlePreviewFile(uri, lbl)}
        headerSlot={
          <>
            <HeroReviewHeader />
            <FilingIntentReviewCard
              filingIntent={filingIntent}
              onFilingIntentChange={onFilingIntentChange}
            />
            <JurisdictionParametersCard
              service={service}
              isExamService={reviewData.isExamService}
              regionName={reviewData.regionName}
              officeName={reviewData.officeName}
              activeApplicant={activeApplicant}
              appModeLabel={reviewData.appModeLabel}
              variantLabel={reviewData.variantLabel}
              scheduleSummaryText={reviewData.scheduleSummaryText}
            />
            <BulkCohortReviewCard
              appMode={appMode}
              applicants={applicants}
              currentApplicantIndex={currentApplicantIndex}
            />
          </>
        }
        renderSpecializedCards={() => (
          <>
            <AmateurStationLicenseReviewCard
              isLicenseService={reviewData.isLicenseService}
              amateur={activeApplicant.amateurLicenseData}
            />

            <LifetimeAmateurLicenseReviewCard
              isLicenseService={reviewData.isLicenseService}
              lifetime={activeApplicant.lifetimeLicenseData}
            />

            <RadioCertReviewCard
              isCertificateService={reviewData.isCertificateService}
              isAmateurCertService={reviewData.isAmateurCertService}
              serviceTitle={service.title}
              radioCert={activeApplicant.radioCertData}
            />

            <DeviceRegReviewCard
              isCertificateService={reviewData.isCertificateService}
              deviceReg={activeApplicant.deviceRegData}
            />

            <TvroRegReviewCard
              isCertificateService={reviewData.isCertificateService}
              serviceTitle={service.title}
              tvroReg={activeApplicant.tvroRegData}
            />

            <VasReviewCard
              isCertificateService={reviewData.isCertificateService}
              serviceTitle={service.title}
              vasData={activeApplicant.vasData}
              formFieldValues={activeApplicant.formFieldValues}
            />

            <CopyOfCertReviewCard
              serviceTitle={service.title}
              copyOfCert={activeApplicant.copyOfCertData}
            />

            <PermitDataReviewCard
              isPermitService={reviewData.isPermitService}
              permitData={activeApplicant.permitData}
            />
          </>
        )}
        footerSlot={
          <>
            {reviewData.permitFeeComputation && (
              <PermitFeeSummaryCard
                computation={reviewData.permitFeeComputation}
                isAssessmentOnly={filingIntent === 'AssessmentOnly'}
              />
            )}
            <UploadedDocumentsReviewCard
              activeApplicant={activeApplicant}
              variantRequirements={variantRequirements}
              service={service}
              onPreviewFile={handlePreviewFile}
            />
          </>
        }
        signatureEntry={reviewData.signatureEntry}
      />

      <DocumentPreviewModal
        visible={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        file={previewFile}
        label={previewLabel}
      />
    </>
  );
}
