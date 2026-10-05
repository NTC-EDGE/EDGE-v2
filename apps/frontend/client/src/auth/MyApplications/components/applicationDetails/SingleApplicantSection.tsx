import React from 'react';
import { View } from 'react-native';
import { Application, ApplicationDocument } from '../../data/applicationsData';
import { SectionCard, SummaryRow } from '../../../../shared/formPreview';
import { SubmittedFormStructuredView } from './SubmittedFormStructuredView';
import { ApplicantParticularsCard } from './ApplicantParticularsCard';
import { ApplicantRequirementsCard } from './ApplicantRequirementsCard';
import { HeroReviewHeader } from './HeroReviewHeader';

import { DocumentPreviewFile } from '../../../../shared/components/DocumentPreviewModal';

interface SingleApplicantSectionProps {
  app: Application;
  singleApplicant: {
    applicantName: string;
    sex: string;
    nationality: string;
    streetAddress: string;
    barangay: string;
    cityMunicipality: string;
    province: string;
    region: string;
    zipCode: string;
    mobileNumber: string;
    email: string;
    examineeType: string;
    birthDate: string | null;
    civilStatus: string | null;
    companyName: string | null;
    representativeName: string | null;
    notes: string | null;
  } | null;
  primaryName: string;
  formFieldValues: Array<{ fieldId: string; fieldLabel: string; value: string }>;
  isExamService: boolean;
  scheduleSummaryText: string | null;
  variantLabel: string;
  isDesktop: boolean;
  docs: ApplicationDocument[];
  onPreviewFile: (uri: string, name: string) => void;
  onPreviewDoc: (doc: ApplicationDocument) => void;
  onPreviewCustomDoc: (doc: DocumentPreviewFile) => void;
  onDownloadDoc?: (doc: ApplicationDocument) => void;
  previewLoadingId?: string | null;
  setPreviewLoadingId: (id: string | null) => void;
}

export function SingleApplicantSection({
  app,
  singleApplicant,
  primaryName,
  formFieldValues,
  isExamService,
  scheduleSummaryText,
  variantLabel,
  isDesktop,
  docs,
  onPreviewFile,
  onPreviewDoc,
  onPreviewCustomDoc,
  onDownloadDoc,
  previewLoadingId,
  setPreviewLoadingId,
}: SingleApplicantSectionProps) {
  return (
    <View style={{ gap: 20 }}>
      <HeroReviewHeader
        serviceName={app.serviceName}
        isExamService={isExamService}
        variantLabel={variantLabel}
        scheduleSummaryText={scheduleSummaryText}
        isDesktop={isDesktop}
      />

      {/* Section 1: Examination Details / Service & Jurisdiction Parameters */}
      <SectionCard
        icon="sliders"
        title="Application & Service Parameters"
        accentColor="#0F2C59"
      >
        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <SummaryRow label="Selected Service" value={app.serviceName} />
            </View>
            <View style={{ flex: 1 }}>
              <SummaryRow label="Service Category" value={app.serviceCategory || 'Standard Licensing'} />
            </View>
          </View>

          <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <SummaryRow label="License / Permit Variant" value={variantLabel} />
            </View>
            <View style={{ flex: 1 }}>
              <SummaryRow label="Filing Mode" value={app.mode || 'Single Application'} />
            </View>
          </View>

          {isExamService && singleApplicant?.examineeType && (
            <SummaryRow label="Examinee Classification" value={singleApplicant.examineeType} />
          )}

          {scheduleSummaryText && (
            <SummaryRow
              label={isExamService ? 'Assigned Examination Schedule & Venue' : 'Assigned Processing Office'}
              value={scheduleSummaryText}
            />
          )}
        </View>
      </SectionCard>

      {/* Section 2: Applicant Details */}
      <ApplicantParticularsCard singleApplicant={singleApplicant} isDesktop={isDesktop} />

      {/* Section 3+: Submitted Form & Technical Specifications */}
      <SubmittedFormStructuredView
        app={app}
        primaryName={primaryName}
        formFieldValues={formFieldValues}
        onPreviewFile={onPreviewFile}
        sectionNumber="3"
        serviceId={app.serviceId}
        serviceVariantId={app.serviceVariantId}
        singleApplicant={singleApplicant}
      />

      {/* Section 4: Attached Requirements & Document Proofs */}
      <ApplicantRequirementsCard
        app={app}
        docs={docs}
        onPreviewDoc={onPreviewDoc}
        onPreviewCustomDoc={onPreviewCustomDoc}
        onDownloadDoc={onDownloadDoc}
        previewLoadingId={previewLoadingId}
        setPreviewLoadingId={setPreviewLoadingId}
      />
    </View>
  );
}
