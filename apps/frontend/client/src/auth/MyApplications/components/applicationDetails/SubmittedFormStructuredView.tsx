import React, { useMemo } from 'react';
import { useApi } from '../../../../shared/hooks/useApi';
import { useServiceForm } from '../../../Services/shared/hooks/useServiceForm';
import { Application } from '../../data/applicationsData';
import { isGuid } from './applicationDetailsTypes';
import { BaseApplicationPreview } from '../../../../shared/formPreview';

export interface SubmittedFormStructuredViewProps {
  app: Application;
  primaryName: string;
  formFieldValues: Array<{ fieldId: string; fieldLabel: string; value: string }>;
  onPreviewFile?: (uri: string, name: string) => void;
  sectionNumber?: string;
  serviceId?: string;
  serviceVariantId?: string | null;
  singleApplicant?: {
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
  showApplicantCard?: boolean;
}

export function SubmittedFormStructuredView({
  app,
  primaryName,
  formFieldValues,
  onPreviewFile,
  serviceId,
  serviceVariantId,
  singleApplicant,
  showApplicantCard = false,
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

  const addressComponents = singleApplicant
    ? [
        singleApplicant.streetAddress,
        singleApplicant.barangay ? `Brgy. ${singleApplicant.barangay}` : '',
        singleApplicant.cityMunicipality,
        singleApplicant.province,
        singleApplicant.region && singleApplicant.region !== 'N/A' ? `(${singleApplicant.region})` : '',
        singleApplicant.zipCode,
      ].filter(Boolean)
    : [];
  const fullAddress = addressComponents.join(', ');

  return (
    <BaseApplicationPreview
      service={{
        id: effectiveServiceId || app.serviceId || '',
        title: app.serviceName || '',
        category: app.serviceCategory || '',
      }}
      form={form}
      formFieldValues={formFieldValues}
      resolvedFullName={singleApplicant?.applicantName || primaryName}
      resolvedEmail={singleApplicant?.email}
      resolvedContactNo={singleApplicant?.mobileNumber}
      resolvedAddress={fullAddress.length > 0 ? fullAddress : null}
      resolvedBirthDate={singleApplicant?.birthDate}
      resolvedSex={singleApplicant?.sex}
      resolvedCivilStatus={singleApplicant?.civilStatus}
      resolvedNationality={singleApplicant?.nationality}
      companyName={singleApplicant?.companyName}
      representativeName={singleApplicant?.representativeName}
      notes={singleApplicant?.notes}
      showApplicantCard={showApplicantCard}
      showSignatureCard={true}
      onPreviewFile={onPreviewFile}
    />
  );
}
