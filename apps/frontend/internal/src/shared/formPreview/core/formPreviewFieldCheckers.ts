/**
 * formPreviewFieldCheckers.ts
 *
 * Single source of truth for all field/section predicate functions used by
 * Application Review and Form Previews.
 */

// ─── Section-level predicates ─────────────────────────────────────────────────

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

export const isRemovedAmateurSection = (titleOrKey: string): boolean => {
  const lower = titleOrKey.toLowerCase().replace(/['']/g, '').replace(/[-_]/g, ' ').trim();
  return (
    lower.includes('employment') ||
    lower.includes('class of station') ||
    lower.includes('classofstation') ||
    lower.includes('club') ||
    lower.includes('equipment')
  );
};

// ─── Field-level predicates ───────────────────────────────────────────────────

export const isApplicantParticularField = (labelOrId: string): boolean => {
  if (!labelOrId) return false;
  const lower = labelOrId.toLowerCase().replace(/['']/g, '').replace(/[-_]/g, ' ').trim();

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

export const isRemovedAmateurField = (label: string, fieldId: string): boolean => {
  const lbl = label.toLowerCase();
  const id = fieldId.toLowerCase();
  return (
    lbl.includes('employment') ||
    lbl.includes('class of station') ||
    lbl.includes('classofstation') ||
    lbl.includes('club') ||
    lbl.includes('equipment') ||
    lbl.includes('permit') ||
    lbl.includes('license type') ||
    lbl.includes('certificate type') ||
    lbl.includes('nationality') ||
    lbl.includes('citizenship') ||
    lbl.includes('civil status') ||
    lbl.includes('civilstatus') ||
    id.includes('employment') ||
    id.includes('classofstation') ||
    id.includes('club') ||
    id.includes('equipment') ||
    id.includes('permittype') ||
    id.includes('nationality') ||
    id.includes('civilstatus')
  );
};

export const isRemovedVasField = (label: string, fieldId: string): boolean => {
  const lbl = label.toLowerCase();
  const id = fieldId.toLowerCase();
  return (
    lbl.includes('radio operator') ||
    lbl.includes('employment') ||
    lbl.includes('class of station') ||
    lbl.includes('classofstation') ||
    lbl.includes('club') ||
    lbl.includes('equipment') ||
    lbl.includes('permit') ||
    lbl.includes('license type') ||
    lbl.includes('certificate type') ||
    lbl.includes('exam') ||
    lbl.includes('rating') ||
    lbl.includes('seminar') ||
    lbl.includes('invoice') ||
    lbl.includes('device') ||
    id.includes('radiooperator') ||
    id.includes('employment') ||
    id.includes('classofstation') ||
    id.includes('club') ||
    id.includes('equipment') ||
    id.includes('permittype')
  );
};

export const isExamEducationField = (label: string, fieldId: string): boolean => {
  const lbl = label.toLowerCase();
  const id = fieldId.toLowerCase();
  return (
    lbl.includes('school') ||
    lbl.includes('course') ||
    lbl.includes('degree') ||
    lbl.includes('educat') ||
    lbl.includes('attain') ||
    lbl.includes('graduat') ||
    lbl.includes('year') ||
    id.includes('school') ||
    id.includes('course') ||
    id.includes('degree') ||
    id.includes('educat') ||
    id.includes('graduat')
  );
};

export const isExamAssistanceField = (label: string, fieldId: string): boolean => {
  const lbl = label.toLowerCase();
  const id = fieldId.toLowerCase();
  return (
    lbl.includes('assist') ||
    lbl.includes('special') ||
    lbl.includes('pwd') ||
    lbl.includes('accommodat') ||
    lbl.includes('needs') ||
    id.includes('assist') ||
    id.includes('special') ||
    id.includes('pwd') ||
    id.includes('needs')
  );
};

export const isRepeaterSubField = (label: string, fieldId: string): boolean => {
  const lbl = label.toLowerCase().trim();
  const id = fieldId.toLowerCase().trim();
  return (
    id === 'fd000000-0000-0000-0000-000000000084' ||
    id === 'fd000000-0000-0000-0000-000000000085' ||
    id === 'fd000000-0000-0000-0000-000000000087' ||
    id === 'serialnumber' ||
    id === 'serial_number' ||
    id === 'serialnumbers' ||
    id === 'frequencyrange' ||
    id === 'frequency_range' ||
    id === 'poweroutput' ||
    id === 'power_output' ||
    id === 'make' ||
    id === 'model' ||
    id === 'typemodel' ||
    id === 'maketypemodel' ||
    id === 'devicetype' ||
    id.includes('devicesdetails') ||
    id.includes('equipmentdetails') ||
    id.includes('antennadetails') ||
    id.includes('radioofficers') ||
    lbl === 'serial number' ||
    lbl === 'serial numbers' ||
    lbl === 'serial number(s)' ||
    lbl === 'frequency range' ||
    lbl === 'power output' ||
    lbl === 'make' ||
    lbl === 'type/model' ||
    lbl === 'make / type / model' ||
    lbl === 'device / equipment type' ||
    lbl === 'device type' ||
    lbl.includes('registered devices') ||
    lbl.includes('devices details')
  );
};

export const isSuppressedValue = (value: string): boolean => {
  const v = (value || '').trim();
  const u = v.toUpperCase();
  return (
    v === '' ||
    u === 'N/A' ||
    u === 'NA' ||
    v === '-' ||
    v === '[]' ||
    v === '{}' ||
    u.includes('TO BE ASSIGNED BY NTC') ||
    u.includes('TO BE ASSIGNED')
  );
};
