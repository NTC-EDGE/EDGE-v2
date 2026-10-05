import { NTCService } from '../../../data/servicesData';
import { GeneralApplicantData } from '../../hooks/useGeneralServiceWizard';
import { FIELD_ID_SIGNATURE, FIELD_ID_ADDRESS, FIELD_ID_STREET } from '../../../../../shared/constants/fieldIds';
import { isApplicantParticularField, formatCompositeAddress } from '../../../../../shared/formPreview';

export function resolveServiceCategoryFlags(service: NTCService) {
  const serviceCategoryLower = (service.category || '').toLowerCase().trim();
  const serviceTitleLower = (service.title || '').toLowerCase().trim();

  const isExamService =
    serviceCategoryLower.includes('exam') ||
    serviceTitleLower.includes('exam') ||
    serviceTitleLower.includes('admission') ||
    serviceTitleLower.includes('operator examination');

  const isLicenseService =
    !isExamService &&
    (serviceCategoryLower.includes('licen') ||
      serviceTitleLower.includes('license') ||
      serviceTitleLower.includes('licence'));

  const isPermitService =
    !isExamService &&
    (serviceCategoryLower.includes('permit') ||
      serviceTitleLower.includes('permit'));

  const isCertificateService =
    !isExamService &&
    (serviceCategoryLower.includes('cert') ||
      serviceTitleLower.includes('certificate') ||
      serviceTitleLower.includes('radio operator certificate') ||
      serviceTitleLower.includes('roc') ||
      serviceTitleLower.includes('tvro') ||
      serviceTitleLower.includes('vas'));

  const isAmateurCertService =
    (service.category || '').toLowerCase().includes('certificate') &&
    ((service.title || '').toLowerCase().includes('amateur') ||
      (service.id || '').toLowerCase().includes('103') ||
      (service.id || '').toLowerCase().includes('ntc_1_03'));

  return { isExamService, isLicenseService, isPermitService, isCertificateService, isAmateurCertService };
}

export function resolveApplicantParticulars(
  activeApplicant: GeneralApplicantData
) {
  const formFieldValues = activeApplicant.formFieldValues || [];

  const fullNameParts = [
    activeApplicant.firstName,
    activeApplicant.middleName,
    activeApplicant.lastName,
    activeApplicant.suffix,
  ].filter(Boolean);

  const resolvedFullName =
    fullNameParts.length > 0
      ? fullNameParts.join(' ')
      : formFieldValues.find((fv: { fieldId: string; fieldLabel: string; value: string }) => isApplicantParticularField(fv.fieldId) && fv.fieldLabel.toLowerCase().includes('name'))?.value ||
        null;

  const resolvedAddress =
    formatCompositeAddress({
      street: activeApplicant.street,
      address: activeApplicant.address,
      barangay: activeApplicant.barangay,
      city: activeApplicant.city,
      province: activeApplicant.province,
      region: activeApplicant.region,
      zipCode: activeApplicant.zipCode,
    }) || formFieldValues.find(
          (fv: { fieldId: string; fieldLabel: string; value: string }) =>
            (fv.fieldId === 'address' ||
              fv.fieldId === FIELD_ID_ADDRESS ||
              fv.fieldId === FIELD_ID_STREET ||
              fv.fieldLabel.toLowerCase().includes('address') ||
              fv.fieldLabel.toLowerCase().includes('street')) &&
            !fv.fieldLabel.toLowerCase().includes('email') &&
            !fv.fieldLabel.toLowerCase().includes('exam') &&
            !fv.fieldLabel.toLowerCase().includes('seminar') &&
            !fv.fieldLabel.toLowerCase().includes('station') &&
            !fv.fieldLabel.toLowerCase().includes('installation') &&
            !fv.fieldLabel.toLowerCase().includes('seller') &&
            !fv.fieldLabel.toLowerCase().includes('dealer')
        )?.value || null;

  const resolvedBirthDate =
    activeApplicant.birthMonth && activeApplicant.birthDay && activeApplicant.birthYear
      ? `${activeApplicant.birthMonth} ${activeApplicant.birthDay}, ${activeApplicant.birthYear}`
      : (activeApplicant.birthDate && activeApplicant.birthDate !== 'N/A' ? activeApplicant.birthDate : null) ||
        formFieldValues.find((fv: { fieldId: string; fieldLabel: string; value: string }) => fv.fieldId === 'birthDate' || fv.fieldLabel.toLowerCase().includes('birth'))?.value ||
        null;

  const resolvedEmail =
    (activeApplicant.email && activeApplicant.email !== 'N/A' ? activeApplicant.email : '') ||
    formFieldValues.find((fv: { fieldId: string; fieldLabel: string; value: string }) => fv.fieldId === 'email' || fv.fieldLabel.toLowerCase().includes('email'))?.value ||
    '';

  const resolvedContactNo =
    (activeApplicant.contactNo && activeApplicant.contactNo !== 'N/A' ? activeApplicant.contactNo : '') ||
    formFieldValues.find((fv: { fieldId: string; fieldLabel: string; value: string }) => fv.fieldId === 'contactNo' || fv.fieldId === 'contactNumber' || fv.fieldLabel.toLowerCase().includes('contact') || fv.fieldLabel.toLowerCase().includes('phone') || fv.fieldLabel.toLowerCase().includes('mobile'))?.value ||
    '';

  const resolvedSex =
    (activeApplicant.sex && activeApplicant.sex !== 'N/A' ? activeApplicant.sex : null) ||
    formFieldValues.find((fv: { fieldId: string; fieldLabel: string; value: string }) => fv.fieldId === 'sex' || fv.fieldLabel.toLowerCase().includes('sex') || fv.fieldLabel.toLowerCase().includes('gender'))?.value ||
    null;

  const resolvedCivilStatus =
    (activeApplicant.civilStatus && activeApplicant.civilStatus !== 'N/A' ? activeApplicant.civilStatus : null) ||
    formFieldValues.find((fv: { fieldId: string; fieldLabel: string; value: string }) => fv.fieldId === 'civilStatus' || fv.fieldLabel.toLowerCase().includes('civil') || fv.fieldLabel.toLowerCase().includes('marital'))?.value ||
    null;

  const resolvedNationality =
    (activeApplicant.nationality && activeApplicant.nationality !== 'N/A' ? activeApplicant.nationality : null) ||
    formFieldValues.find((fv: { fieldId: string; fieldLabel: string; value: string }) => fv.fieldId === 'nationality' || fv.fieldLabel.toLowerCase().includes('nationality') || fv.fieldLabel.toLowerCase().includes('citizenship'))?.value ||
    null;

  const signatureEntry = formFieldValues.find(
    (fv: { fieldId: string; fieldLabel: string; value: string }) =>
      fv.fieldId === FIELD_ID_SIGNATURE ||
      fv.fieldLabel.toLowerCase().includes('signature') ||
      fv.value.startsWith('data:image') ||
      fv.value.startsWith('typed:cursive:')
  ) || (activeApplicant.signatureUrl ? {
    fieldId: FIELD_ID_SIGNATURE,
    fieldLabel: 'Applicant Signature',
    value: activeApplicant.signatureUrl,
  } : undefined);

  return {
    formFieldValues,
    resolvedFullName,
    resolvedAddress,
    resolvedBirthDate,
    resolvedEmail,
    resolvedContactNo,
    resolvedSex,
    resolvedCivilStatus,
    resolvedNationality,
    signatureEntry,
  };
}
