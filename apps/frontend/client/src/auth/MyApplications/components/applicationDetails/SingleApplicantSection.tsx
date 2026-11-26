import React, { useState, useMemo } from 'react';
import { View, Text, Platform, Linking } from 'react-native';
import { Icon, TYPOGRAPHY } from '@edge/ui';
import { applicationService } from '@edge/api';
import { Application, ApplicationDocument, RawRequirement } from '../../data/applicationsData';
import {
  resolvePreviewApplicationType,
  resolvePreviewElements,
  detectCanonicalForm,
  EquivalentFormHeaderCard,
  CanonicalFormMetadata,
} from '../../../../shared/formPreview';
import { triggerBrowserBlobDownload } from '../../helpers/applicationDocumentActions';
import { SubmittedFormStructuredView } from './SubmittedFormStructuredView';
import { ApplicantParticularsCard } from './ApplicantParticularsCard';
import { ApplicantRequirementsCard } from './ApplicantRequirementsCard';

import { DocumentPreviewFile } from '../../../../shared/components/DocumentPreviewModal';

interface SingleApplicantSectionProps {
  app: Application;
  singleApplicant: {
    id?: string;
    serviceId?: string;
    serviceVariantId?: string;
    serviceVariantName?: string;
    applicantName: string;
    applicantType?: string | null;
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
    schoolAttended?: string | null;
    schoolName?: string | null;
    courseTaken?: string | null;
    courseDegree?: string | null;
    yearGraduated?: string | null;
    specialOrderNo?: string | null;
    signatureUrl?: string | null;
    eSignature?: string | null;
  } | null;
  primaryName: string;
  formFieldValues: Array<{ fieldId: string; fieldLabel: string; value: string }>;
  isExamService: boolean;
  scheduleSummaryText: string | null;
  variantLabel: string;
  applicationType?: string | null;
  elements?: string | null;
  isDesktop: boolean;
  docs: ApplicationDocument[];
  onPreviewFile: (uri: string, name: string) => void;
  onPreviewDoc: (doc: ApplicationDocument) => void;
  onPreviewCustomDoc: (doc: DocumentPreviewFile) => void;
  onDownloadDoc?: (doc: ApplicationDocument) => void;
  previewLoadingId?: string | null;
  setPreviewLoadingId: (id: string | null) => void;
  canEditRequirements?: boolean;
  uploadingDocId?: string | null;
  onUploadRequirement?: (doc: ApplicationDocument, matchedReq?: RawRequirement) => void;
}

export function SingleApplicantSection({
  app,
  singleApplicant,
  primaryName,
  formFieldValues,
  isExamService,
  scheduleSummaryText,
  variantLabel,
  applicationType,
  elements,
  isDesktop,
  docs,
  onPreviewFile,
  onPreviewDoc,
  onPreviewCustomDoc,
  onDownloadDoc,
  previewLoadingId,
  setPreviewLoadingId,
  canEditRequirements,
  uploadingDocId,
  onUploadRequirement,
}: SingleApplicantSectionProps) {
  const [isDownloadingForm, setIsDownloadingForm] = useState(false);

  const effectiveAppType = resolvePreviewApplicationType({
    applicationType: applicationType || (singleApplicant?.applicantType === 'Company' ? undefined : singleApplicant?.examineeType),
    examineeType: singleApplicant?.examineeType,
    element: app.element,
    formFieldValues,
  });

  const effectiveElements = resolvePreviewElements({
    elements,
    element: app.element,
    formFieldValues,
  });

  const canonicalForm = useMemo<CanonicalFormMetadata>(() => {
    const detected = detectCanonicalForm(
      {
        id: singleApplicant?.serviceId || app.serviceId,
        title: app.serviceName,
        category: app.serviceCategory,
      },
      variantLabel
    );
    if (detected !== null) return detected;
    return {
      code: 'NTC_FORM',
      formNumber: 'Official Form',
      title: app.serviceName || 'NTC Official Application Form',
      shortTitle: app.serviceName || 'Application Form',
      category: app.serviceCategory || 'Application',
      viewType: 'permits',
      description: 'Official statutory application form and submitted particulars.',
      canonicalServiceId: singleApplicant?.serviceId || app.serviceId || '',
      associatedServiceCodes: [],
      associatedServiceIds: [],
    };
  }, [singleApplicant?.serviceId, app.serviceId, app.serviceName, app.serviceCategory, variantLabel]);

  const targetApplicantId =
    typeof singleApplicant?.id === 'string' && singleApplicant.id.trim().length > 0
      ? singleApplicant.id.trim()
      : undefined;

  const handlePreviewForm = () => {
    if (typeof app.id !== 'string' || app.id.trim().length === 0) return;
    const formDocName = canonicalForm
      ? `Official Application Form (${canonicalForm.formNumber}).pdf`
      : 'Official Application Form.pdf';
    const formUrl = applicationService.getApplicationFormPrintUrl(app.id.trim(), targetApplicantId);

    onPreviewCustomDoc({
      name: formDocName,
      uri: formUrl,
      type: 'PDF',
      category: 'ATTACHMENT',
      referenceNumber: app.referenceNumber,
      serviceName: app.serviceName,
      applicantName: primaryName,
      uploadedAt: app.submittedAt || new Date().toISOString(),
    });
  };

  const handleDownloadForm = async () => {
    if (typeof app.id !== 'string' || app.id.trim().length === 0 || isDownloadingForm) return;
    const safeRef = (app.referenceNumber || app.id.slice(0, 8)).replace(/[^a-zA-Z0-9_-]/g, '_');
    const formCodePart = canonicalForm ? canonicalForm.code : 'NTC_Application_Form';
    const targetFileName = `${formCodePart}_${safeRef}.pdf`;

    setIsDownloadingForm(true);
    try {
      const [blobData, blobErr] = await applicationService.downloadApplicationFormPdf(
        app.id.trim(),
        targetApplicantId
      );
      if (blobErr === null && blobData instanceof Blob && blobData.size > 0) {
        const typedBlob = new Blob([blobData], { type: 'application/pdf' });
        triggerBrowserBlobDownload(typedBlob, targetFileName);
        return;
      }

      const fallbackUrl = applicationService.getApplicationFormDownloadUrl(
        app.id.trim(),
        targetApplicantId
      );
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.open(fallbackUrl, '_blank');
      } else {
        void Linking.openURL(fallbackUrl);
      }
    } finally {
      setIsDownloadingForm(false);
    }
  };

  return (
    <View style={{ gap: 20 }}>
      {/* Official Application Form Header Card (Above Applicant Details) */}
      <EquivalentFormHeaderCard
        canonicalForm={canonicalForm}
        onPreviewFormPdf={handlePreviewForm}
        onDownloadFormPdf={handleDownloadForm}
        isDownloadingFormPdf={isDownloadingForm}
      />

      {/* Schedule & Venue or Processing Office Banner */}
      {Boolean(scheduleSummaryText) && (
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#E2E8F0',
            padding: 16,
            flexDirection: isDesktop ? 'row' : 'column',
            alignItems: isDesktop ? 'center' : 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: '#EFF6FF',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name={isExamService ? 'calendar' : 'map-pin'} size={18} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: TYPOGRAPHY.fonts.primary,
                  fontSize: 11,
                  fontWeight: '700',
                  color: '#64748B',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                {isExamService ? 'Assigned Examination Schedule & Venue' : 'Assigned Processing Office'}
              </Text>
              <Text
                style={{
                  fontFamily: TYPOGRAPHY.fonts.primary,
                  fontSize: 13,
                  fontWeight: '600',
                  color: '#0F172A',
                  marginTop: 2,
                }}
              >
                {scheduleSummaryText}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Applicant Details */}
      <ApplicantParticularsCard singleApplicant={singleApplicant} isDesktop={isDesktop} />

      {/* Submitted Form & Technical Specifications */}
      <SubmittedFormStructuredView
        app={app}
        primaryName={primaryName}
        formFieldValues={formFieldValues}
        onPreviewFile={onPreviewFile}
        serviceId={singleApplicant?.serviceId || app.serviceId}
        serviceVariantId={singleApplicant?.serviceVariantId || app.serviceVariantId || app.applicants?.[0]?.serviceVariantId}
        singleApplicant={singleApplicant}
        variantLabel={variantLabel}
        applicationType={effectiveAppType}
        elements={effectiveElements}
        isExamService={isExamService}
        onPreviewFormPdf={handlePreviewForm}
        onDownloadFormPdf={handleDownloadForm}
        isDownloadingFormPdf={isDownloadingForm}
      />

      {/* Attached Requirements & Document Proofs */}
      <ApplicantRequirementsCard
        app={app}
        docs={docs}
        onPreviewDoc={onPreviewDoc}
        onPreviewCustomDoc={onPreviewCustomDoc}
        onDownloadDoc={onDownloadDoc}
        previewLoadingId={previewLoadingId}
        setPreviewLoadingId={setPreviewLoadingId}
        canEditRequirements={canEditRequirements}
        uploadingDocId={uploadingDocId}
        onUploadRequirement={onUploadRequirement}
      />
    </View>
  );
}
