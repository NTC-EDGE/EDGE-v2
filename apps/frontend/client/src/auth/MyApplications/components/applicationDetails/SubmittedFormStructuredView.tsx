import React, { useMemo } from 'react';
import { useApi } from '../../../../shared/hooks/useApi';
import { useServiceForm } from '../../../Services/shared/hooks/useServiceForm';
import { Application } from '../../data/applicationsData';
import { isGuid } from './applicationDetailsTypes';
import { BaseApplicationPreview, formatCompositeAddress } from '../../../../shared/formPreview';

export interface SubmittedApplicantData {
  applicantName?: string;
  name?: string;
  sex?: string;
  nationality?: string;
  streetAddress?: string;
  barangay?: string;
  cityMunicipality?: string;
  province?: string;
  region?: string;
  zipCode?: string;
  mobileNumber?: string;
  email?: string;
  examineeType?: string;
  birthDate?: string | null;
  civilStatus?: string | null;
  companyName?: string | null;
  representativeName?: string | null;
  notes?: string | null;
}

export interface SubmittedFormStructuredViewProps {
  app: Application;
  primaryName: string;
  formFieldValues: Array<{ fieldId: string; fieldLabel: string; value: string }>;
  onPreviewFile?: (uri: string, name: string) => void;
  sectionNumber?: string;
  serviceId?: string;
  serviceVariantId?: string | null;
  singleApplicant?: SubmittedApplicantData | null;
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

  const applicantName = singleApplicant?.applicantName || singleApplicant?.name || primaryName;
  const fullAddress = formatCompositeAddress(
    singleApplicant
      ? {
          streetAddress: singleApplicant.streetAddress,
          barangay: singleApplicant.barangay,
          cityMunicipality: singleApplicant.cityMunicipality,
          province: singleApplicant.province,
          region: singleApplicant.region,
          zipCode: singleApplicant.zipCode,
        }
      : null
  );

  return (
    <BaseApplicationPreview
      service={{
        id: effectiveServiceId || app.serviceId || '',
        title: app.serviceName || '',
        category: app.serviceCategory || '',
      }}
      form={form}
      formFieldValues={formFieldValues}
      resolvedFullName={applicantName}
      resolvedEmail={singleApplicant?.email && singleApplicant.email !== 'N/A' ? singleApplicant.email : undefined}
      resolvedContactNo={singleApplicant?.mobileNumber && singleApplicant.mobileNumber !== 'N/A' ? singleApplicant.mobileNumber : undefined}
      resolvedAddress={fullAddress}
      resolvedBirthDate={singleApplicant?.birthDate && singleApplicant.birthDate !== 'N/A' ? singleApplicant.birthDate : null}
      resolvedSex={singleApplicant?.sex && singleApplicant.sex !== 'N/A' ? singleApplicant.sex : null}
      resolvedCivilStatus={singleApplicant?.civilStatus && singleApplicant.civilStatus !== 'N/A' ? singleApplicant.civilStatus : null}
      resolvedNationality={singleApplicant?.nationality && singleApplicant.nationality !== 'N/A' ? singleApplicant.nationality : null}
      companyName={singleApplicant?.companyName}
      representativeName={singleApplicant?.representativeName}
      notes={singleApplicant?.notes}
      showApplicantCard={showApplicantCard}
      showSignatureCard={true}
      onPreviewFile={onPreviewFile}
    />
  );
}
