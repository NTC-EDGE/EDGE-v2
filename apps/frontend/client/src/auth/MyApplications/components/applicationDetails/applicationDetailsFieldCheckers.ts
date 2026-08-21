export const isUnrelatedSection = (titleOrKey: string): boolean => {
  const lower = titleOrKey.toLowerCase().replace(/['']/g, '').replace(/[-_]/g, ' ').trim();
  return (
    lower.includes('payment') || lower.includes('fee') || lower.includes('office use') ||
    lower.includes('official use') || lower.includes('ntc use') || lower.includes('evaluation') ||
    lower.includes('processing note') || lower.includes('personal information') ||
    lower.includes('personal detail') || lower.includes('personal data') ||
    lower.includes('personal particular') || lower.includes('personal info') ||
    lower.includes('applicant information') || lower.includes('applicant detail') ||
    lower.includes('applicant particular') || lower.includes('applicant person') ||
    lower.includes('applicant contact') || lower.includes('applicantperson') ||
    lower.includes('applicantinfo') || lower.includes('basic information') ||
    lower.includes('basic detail') || lower.includes('contact information') ||
    lower.includes('contact detail') || lower.includes('contact particular') ||
    lower === 'declaration' || lower === 'declaration of applicant' ||
    lower === 'acknowledgement' || lower === 'acknowledgement & applicant signature' ||
    lower === 'signature' || lower === 'typeofcertificate' || lower === 'permittype' ||
    lower === 'apptype' || lower === 'applicationtype' || lower === 'typeofapplication' ||
    lower === 'type of certificate / application' || lower === 'type of application & permit category' ||
    lower === 'type of application & category' || lower === 'type of certificate' ||
    lower === 'type of application' || lower === 'application type' ||
    lower === 'permit type / application type' || lower === 'permit type' || lower === 'permit category'
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

export const isApplicantParticularField = (labelOrId: string): boolean => {
  if (!labelOrId) return false;
  const lower = labelOrId.toLowerCase().replace(/['']/g, '').replace(/[-_]/g, ' ').trim();
  if (
    lower.includes('dealer') || lower.includes('seller') || lower.includes('buyer') ||
    lower.includes('equipment') || lower.includes('school') || lower.includes('institution') ||
    lower.includes('course') || lower.includes('degree') || lower.includes('station') ||
    lower.includes('satellite') || lower.includes('vessel') || lower.includes('ship') ||
    lower.includes('aircraft') || lower.includes('exam') || lower.includes('seminar') ||
    lower.includes('known') || lower.includes('trade') || lower.includes('specify')
  ) return false;
  return (
    lower.includes('full name') || lower.includes('legal name') || lower.includes('applicant name') ||
    lower === 'name' || lower === 'first name' || lower === 'fname' || lower === 'firstname' ||
    lower === 'middle name' || lower === 'mname' || lower === 'middlename' ||
    lower === 'last name' || lower === 'surname' || lower === 'lname' || lower === 'lastname' ||
    lower === 'suffix' || lower.includes('company name') || lower.includes('business name') ||
    lower.includes('corporate name') || lower.includes('representative name') ||
    lower.includes('email') || lower.includes('contact') || lower.includes('phone') ||
    lower.includes('mobile') || lower.includes('cellphone') || lower.includes('telephone') ||
    lower.includes('nationality') || lower.includes('citizenship') ||
    lower.includes('civil status') || lower.includes('civilstatus') || lower.includes('marital') ||
    lower.includes('birth') || lower.includes('dob') || lower === 'dob' ||
    lower === 'sex' || lower === 'gender' || lower.includes('sex / gender') ||
    lower.includes('address') || lower.includes('street') || lower.includes('barangay') ||
    lower.includes('city') || lower.includes('municipality') || lower.includes('province') ||
    lower.includes('region') || lower.includes('zip') || lower.includes('postal')
  );
};

export const isSignatureOrDeclarationField = (labelOrId: string): boolean => {
  if (!labelOrId) return false;
  const lower = labelOrId.toLowerCase().trim();
  return lower.includes('signature') || lower.includes('declare') || lower.includes('declaration') || lower.includes('affirm') || lower.includes('certify');
};

export const isJurisdictionOrVariantField = (labelOrId: string): boolean => {
  if (!labelOrId) return false;
  const lower = labelOrId.toLowerCase().replace(/['']/g, '').replace(/[-_]/g, ' ').trim();
  return (
    lower === 'service category' ||
    lower === 'service name' || lower === 'type of application' || lower === 'application type' ||
    lower === 'permit type' || lower === 'permittype' || lower === 'license type' ||
    lower === 'licensetype' || lower === 'certificate type' || lower === 'certificatetype' ||
    lower === 'filing mode' || lower === 'application mode' ||
    lower.includes('permit / license type') || lower.includes('permit/license type') ||
    lower.includes('permit / certificate type') || lower.includes('permit/certificate type') ||
    lower.includes('permit category') ||
    lower.includes('type of certificate')
  );
};

export const isRemovedAmateurField = (label: string, fieldId: string): boolean => {
  const labelLower = label.toLowerCase();
  const idLower = fieldId.toLowerCase();
  return (
    labelLower.includes('employment') || labelLower.includes('class of station') ||
    labelLower.includes('classofstation') || labelLower.includes('club') ||
    labelLower.includes('equipment') || labelLower.includes('permit') ||
    labelLower.includes('license type') || labelLower.includes('certificate type') ||
    labelLower.includes('nationality') || labelLower.includes('citizenship') ||
    labelLower.includes('civil status') || labelLower.includes('civilstatus') ||
    idLower.includes('employment') || idLower.includes('classofstation') ||
    idLower.includes('club') || idLower.includes('equipment') ||
    idLower.includes('permittype') || idLower.includes('nationality') ||
    idLower.includes('civilstatus')
  );
};

export const isRemovedVasField = (label: string, fieldId: string): boolean => {
  const labelLower = label.toLowerCase();
  const idLower = fieldId.toLowerCase();
  return (
    labelLower.includes('radio operator') || labelLower.includes('employment') ||
    labelLower.includes('class of station') || labelLower.includes('classofstation') ||
    labelLower.includes('club') || labelLower.includes('equipment') ||
    labelLower.includes('permit') || labelLower.includes('license type') ||
    labelLower.includes('certificate type') || labelLower.includes('exam') ||
    labelLower.includes('rating') || labelLower.includes('seminar') ||
    labelLower.includes('invoice') || labelLower.includes('device') ||
    idLower.includes('radiooperator') || idLower.includes('employment') ||
    idLower.includes('classofstation') || idLower.includes('club') ||
    idLower.includes('equipment') || idLower.includes('permittype')
  );
};

export const isExamEducationField = (fieldLabel: string, fieldId: string): boolean => {
  const lbl = fieldLabel.toLowerCase();
  const id = fieldId.toLowerCase();
  return (
    lbl.includes('school') || lbl.includes('course') || lbl.includes('degree') || lbl.includes('educat') ||
    lbl.includes('attain') || lbl.includes('graduat') || lbl.includes('year') || id.includes('school') ||
    id.includes('course') || id.includes('degree') || id.includes('educat') || id.includes('graduat')
  );
};

export const isExamAssistanceField = (fieldLabel: string, fieldId: string): boolean => {
  const lbl = fieldLabel.toLowerCase();
  const id = fieldId.toLowerCase();
  return (
    lbl.includes('assist') || lbl.includes('special') || lbl.includes('pwd') ||
    lbl.includes('accommodat') || lbl.includes('needs') || id.includes('assist') ||
    id.includes('special') || id.includes('pwd') || id.includes('needs')
  );
};
