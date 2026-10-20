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
    lower.includes('office use') ||
    lower.includes('official use') ||
    lower.includes('ntc use') ||
    lower.includes('for ntc use') ||
    lower.includes('for official use') ||
    lower.includes('evaluation note') ||
    lower.includes('evaluation remark') ||
    lower.includes('processing note') ||
    lower.includes('cashier use') ||
    lower.includes('accounting use') ||
    lower === 'assistancerequest' ||
    lower === 'assistance request' ||
    lower.includes('special needs')
  );
};

export const isRemovedAmateurSection = (_titleOrKey: string): boolean => {
  return false;
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

  // These keywords indicate service-specific / technical / equipment details — don't suppress
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
    lower.includes('specify') ||
    lower.includes('frequency') ||
    lower.includes('power') ||
    lower.includes('serial') ||
    lower.includes('model') ||
    lower.includes('make') ||
    lower.includes('call sign') ||
    lower.includes('callsign') ||
    lower.includes('class') ||
    lower.includes('license') ||
    lower.includes('permit') ||
    lower.includes('certificate') ||
    lower.includes('antenna') ||
    lower.includes('emission') ||
    lower.includes('bandwidth') ||
    lower.includes('remarks')
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
    lower.includes('representative position') ||
    lower.includes('representative email') ||
    lower.includes('representative contact') ||
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
    lower.includes('postal')
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

export const isRemovedAmateurField = (_label: string, _fieldId: string): boolean => {
  return false;
};

export const isRemovedVasField = (_label: string, _fieldId: string): boolean => {
  return false;
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

export const isRepeaterSubField = (label: string, fieldId?: string): boolean => {
  const lbl = (label || '').toLowerCase().trim();
  const id = (fieldId || '').toLowerCase().trim();

  if (/^device\s*#\d+/i.test(lbl) || /^device\s*#\d+/i.test(id)) return true;
  if (/^tvro\s*equipment\s*#\d+/i.test(lbl) || /^tvro\s*equipment\s*#\d+/i.test(id)) return true;
  if (/^equipment\s*(unit)?\s*#\d+/i.test(lbl) || /^equipment\s*(unit)?\s*#\d+/i.test(id)) return true;
  if (/^radio\s*officer\s*#\d+/i.test(lbl) || /^radio\s*officer\s*#\d+/i.test(id)) return true;

  return false;
};


export const isSuppressedValue = (value: string): boolean => {
  const v = (value || '').trim();
  const u = v.toUpperCase();
  return (
    v === '' ||
    u === 'N/A' ||
    u === 'NA' ||
    u === 'NONE' ||
    u === 'NOT APPLICABLE' ||
    u === 'NULL' ||
    u === 'UNDEFINED' ||
    v === '—' ||
    v === '--' ||
    v === '[{}]' ||
    v === '-' ||
    v === '[]' ||
    v === '{}' ||
    u.includes('TO BE ASSIGNED BY NTC') ||
    u.includes('TO BE ASSIGNED')
  );
};
