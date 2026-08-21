import { Icon } from '@edge/ui';
export { isRecord, isPreviewFileObject, formatFieldKey, getRequirementLabel } from './generalReviewFormatters';

export const isUnrelatedSection = (titleOrKey: string): boolean => {
  const lower = titleOrKey.toLowerCase().replace(/['']/g, '').replace(/[-_]/g, ' ').trim();
  return (
    lower.includes('payment') ||
    lower.includes('fee') ||
    lower.includes('office use') ||
    lower.includes('official use') ||
    lower.includes('ntc use') ||
    lower.includes('evaluation') ||
    lower.includes('processing note') ||
    lower.includes('personal information') ||
    lower.includes('personal detail') ||
    lower.includes('personal data') ||
    lower.includes('personal particular') ||
    lower.includes('personal info') ||
    lower.includes('applicant information') ||
    lower.includes('applicant detail') ||
    lower.includes('applicant particular') ||
    lower.includes('applicant person') ||
    lower.includes('applicant contact') ||
    lower.includes('applicant address') ||
    lower.includes('applicantperson') ||
    lower.includes('applicantinfo') ||
    lower.includes('applicant / company details') ||
    lower.includes('applicant company details') ||
    lower.includes('applicant & company details') ||
    lower.includes('applicant details') ||
    lower.includes('applicants details') ||
    lower.includes('company details') ||
    lower.includes('company / corporation details') ||
    lower.includes('company information') ||
    lower.includes('corporate details') ||
    lower.includes('representative details') ||
    lower.includes('authorized representative') ||
    lower.includes('basic information') ||
    lower.includes('basic detail') ||
    lower.includes('contact information') ||
    lower.includes('contact detail') ||
    lower.includes('contact particular') ||
    lower === 'applicant' ||
    lower === 'applicantaddress' ||
    lower === 'representative' ||
    lower === 'companydetails' ||
    lower === 'declaration' ||
    lower === 'declaration of applicant' ||
    lower === 'acknowledgement' ||
    lower === 'acknowledgement & applicant signature' ||
    lower === 'signature' ||
    lower === 'typeofcertificate' ||
    lower === 'permittype' ||
    lower === 'apptype' ||
    lower === 'applicationtype' ||
    lower === 'typeofapplication' ||
    lower === 'type of certificate / application' ||
    lower === 'type of application & permit category' ||
    lower === 'type of application & category' ||
    lower === 'type of certificate' ||
    lower === 'type of application' ||
    lower === 'application type' ||
    lower === 'permit type / application type' ||
    lower === 'permit type' ||
    lower === 'permit category'
  );
};

export const isApplicantParticularField = (labelOrId: string): boolean => {
  if (!labelOrId) return false;
  const lower = labelOrId.toLowerCase().replace(/['']/g, '').replace(/[-_]/g, ' ').trim();

  // DTI / SEC registration field
  if (
    lower.includes('sec / dti') ||
    lower.includes('sec/dti') ||
    lower.includes('dti / sec') ||
    lower.includes('dti/sec') ||
    lower.includes('dtisecregistration') ||
    lower.includes('dti_sec_registration') ||
    lower === 'fd000000 0000 0000 0000 000000000086' ||
    lower === 'fd000000-0000-0000-0000-000000000086'
  ) {
    return true;
  }

  if (
    lower.includes('dealer') ||
    lower.includes('seller') ||
    lower.includes('buyer') ||
    lower.includes('equipment') ||
    lower.includes('school') ||
    lower.includes('institution') ||
    lower.includes('course') ||
    lower.includes('degree') ||
    lower.includes('station') ||
    lower.includes('satellite') ||
    lower.includes('vessel') ||
    lower.includes('ship') ||
    lower.includes('aircraft') ||
    lower.includes('exam') ||
    lower.includes('seminar') ||
    lower.includes('known') ||
    lower.includes('trade') ||
    lower.includes('specify')
  ) {
    return false;
  }

  return (
    lower.includes('full name') ||
    lower.includes('legal name') ||
    lower.includes('applicant name') ||
    lower === 'name' ||
    lower === 'first name' ||
    lower === 'fname' ||
    lower === 'firstname' ||
    lower === 'middle name' ||
    lower === 'mname' ||
    lower === 'middlename' ||
    lower === 'last name' ||
    lower === 'surname' ||
    lower === 'lname' ||
    lower === 'lastname' ||
    lower === 'suffix' ||
    lower.includes('company name') ||
    lower.includes('business name') ||
    lower.includes('corporate name') ||
    lower.includes('representative name') ||
    lower.includes('email') ||
    lower.includes('contact') ||
    lower.includes('phone') ||
    lower.includes('mobile') ||
    lower.includes('cellphone') ||
    lower.includes('telephone') ||
    lower.includes('nationality') ||
    lower.includes('citizenship') ||
    lower.includes('civil status') ||
    lower.includes('civilstatus') ||
    lower.includes('marital') ||
    lower.includes('birth') ||
    lower === 'dob' ||
    lower === 'sex' ||
    lower === 'gender' ||
    lower.includes('sex / gender') ||
    lower.includes('gender') ||
    lower.includes('address') ||
    lower.includes('street') ||
    lower.includes('barangay') ||
    lower.includes('city') ||
    lower.includes('municipality') ||
    lower.includes('province') ||
    lower.includes('region') ||
    lower.includes('zip') ||
    lower.includes('postal') ||
    lower.includes('sec / dti') ||
    lower.includes('sec/dti') ||
    lower.includes('dti') ||
    lower.includes('sec')
  );
};

export const isSignatureOrDeclarationField = (labelOrId: string): boolean => {
  if (!labelOrId) return false;
  const lower = labelOrId.toLowerCase().trim();
  return (
    lower.includes('signature') ||
    lower.includes('declare') ||
    lower.includes('declaration') ||
    lower.includes('affirm') ||
    lower.includes('certify')
  );
};

export const isJurisdictionOrVariantField = (labelOrId: string): boolean => {
  if (!labelOrId) return false;
  const lower = labelOrId.toLowerCase().replace(/['']/g, '').replace(/[-_]/g, ' ').trim();
  return (
    lower === 'service category' ||
    lower === 'service name' ||
    lower === 'type of application' ||
    lower === 'application type' ||
    lower === 'permit type' ||
    lower === 'permittype' ||
    lower === 'license type' ||
    lower === 'licensetype' ||
    lower === 'certificate type' ||
    lower === 'certificatetype' ||
    lower === 'filing mode' ||
    lower === 'application mode' ||
    lower.includes('permit / license type') ||
    lower.includes('permit/license type') ||
    lower.includes('permit / certificate type') ||
    lower.includes('permit/certificate type') ||
    lower.includes('permit category') ||
    lower.includes('type of certificate')
  );
};

export const getSectionIcon = (title: string): React.ComponentProps<typeof Icon>['name'] => {
  const lower = title.toLowerCase();
  if (lower.includes('applicant') || lower.includes('personal') || lower.includes('contact')) return 'user';
  if (lower.includes('education') || lower.includes('school') || lower.includes('training') || lower.includes('seminar') || lower.includes('exam')) return 'book-open';
  if (lower.includes('assistance') || lower.includes('special') || lower.includes('pwd') || lower.includes('accommodation')) return 'info';
  if (lower.includes('station') || lower.includes('location') || lower.includes('site') || lower.includes('address')) return 'map-pin';
  if (lower.includes('equipment') || lower.includes('device') || lower.includes('transceiver') || lower.includes('technical')) return 'cpu';
  if (lower.includes('antenna') || lower.includes('mast') || lower.includes('tower') || lower.includes('radio')) return 'radio';
  if (lower.includes('personnel') || lower.includes('engineer') || lower.includes('technician') || lower.includes('pece') || lower.includes('ece')) return 'award';
  if (lower.includes('vessel') || lower.includes('ship') || lower.includes('maritime')) return 'anchor';
  if (lower.includes('aircraft') || lower.includes('aero')) return 'navigation';
  if (lower.includes('document') || lower.includes('upload') || lower.includes('attachment')) return 'paperclip';
  return 'file-text';
};

export const getSectionAccentColor = (idx: number): string => {
  const colors = ['#7C3AED', '#0284C7', '#0D9488', '#4F46E5', '#D97706', '#2563EB', '#9333EA'];
  return colors[idx % colors.length] || '#0F2C59';
};
