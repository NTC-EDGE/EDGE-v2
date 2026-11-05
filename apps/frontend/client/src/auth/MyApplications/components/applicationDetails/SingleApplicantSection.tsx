import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon, TYPOGRAPHY } from '@edge/ui';
import { applicationService } from '@edge/api';
import { Application, ApplicationDocument } from '../../data/applicationsData';
import {
  resolvePreviewApplicationType,
  resolvePreviewElements,
} from '../../../../shared/formPreview';
import { SubmittedFormStructuredView } from './SubmittedFormStructuredView';
import { ApplicantParticularsCard } from './ApplicantParticularsCard';
import { ApplicantRequirementsCard } from './ApplicantRequirementsCard';

import { DocumentPreviewFile } from '../../../../shared/components/DocumentPreviewModal';

interface SingleApplicantSectionProps {
  app: Application;
  singleApplicant: {
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
}: SingleApplicantSectionProps) {
  const serviceNameLower = (app.serviceName || '').toLowerCase();
  const serviceCategoryLower = (app.serviceCategory || '').toLowerCase();
  const isRequestOrComplaint =
    serviceNameLower.includes('request') ||
    serviceNameLower.includes('complaint') ||
    serviceCategoryLower.includes('request') ||
    serviceCategoryLower.includes('complaint') ||
    serviceNameLower.includes('blocking') ||
    serviceNameLower.includes('unblocking') ||
    serviceNameLower.includes('spam') ||
    serviceNameLower.includes('scam') ||
    serviceNameLower.includes('tape preservation');

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

  const handlePreviewForm = () => {
    if (typeof app.id !== 'string' || app.id.trim().length === 0) return;
    const isBlocking = serviceNameLower.includes('blocking') || serviceNameLower.includes('unblocking');
    const formDocName = isBlocking
      ? 'Official Application Form (NTC 1-24).pdf'
      : 'Official Complaint Form (NTC 1-25).pdf';
    const formUrl = applicationService.getApplicationFormPrintUrl(app.id);

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

  return (
    <View style={{ gap: 20 }}>
      {/* Schedule & Venue or Processing Office Banner */}
      {(scheduleSummaryText || isRequestOrComplaint) && (
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
          {scheduleSummaryText ? (
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
          ) : (
            <View style={{ flex: 1 }} />
          )}

          {isRequestOrComplaint && (
            <TouchableOpacity
              onPress={handlePreviewForm}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: '#EFF6FF',
                borderWidth: 1,
                borderColor: '#BFDBFE',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
              activeOpacity={0.8}
            >
              <Icon name="file-text" size={14} color="#1D4ED8" />
              <Text
                style={{
                  fontFamily: TYPOGRAPHY.fonts.primary,
                  fontSize: 12,
                  fontWeight: '700',
                  color: '#1D4ED8',
                }}
              >
                View Official Form
              </Text>
            </TouchableOpacity>
          )}
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
        serviceId={app.serviceId}
        serviceVariantId={app.serviceVariantId}
        singleApplicant={singleApplicant}
        variantLabel={variantLabel}
        applicationType={effectiveAppType}
        elements={effectiveElements}
        isExamService={isExamService}
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
      />
    </View>
  );
}
