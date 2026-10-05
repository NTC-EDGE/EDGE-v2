/**
 * formPreviewFieldCheckers.ts
 *
 * Single source of truth for all field/section predicate functions used by:
 *  - Wizard Step 5 Review & Submit (generalReview/)
 *  - My Application Details preview (applicationDetails/)
 *
 * Source of truth: generalReview/generalReviewHelpers.ts (wizard)
 * Additional predicates merged from: applicationDetails/applicationDetailsFieldCheckers.ts
 */

// ─── Section-level predicates ─────────────────────────────────────────────────

/**
 * Returns true for form sections that should be entirely skipped in the
 * preview summary (payment, personal info, declaration, etc.)
 */
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
    lower.includes('accounting use')
  );
};

/**
 * Formerly dropped amateur-cert-specific sections. Preserved as false
 * so all equipment, station, club, and permit sections are displayed.
 */
export const isRemovedAmateurSection = (_titleOrKey: string): boolean => {
  return false;
};


// ─── Field-level predicates ───────────────────────────────────────────────────

/**
 * Returns true for fields that are rendered inside the Applicant Details card
 * and should NOT appear again in the dynamic form sections.
 */
export const isApplicantParticularField = (labelOrId: string): boolean => {
  if (!labelOrId) return false;
  const lower = labelOrId.toLowerCase().replace(/['']/g, '').replace(/[-_]/g, ' ').trim();

  // DTI / SEC registration — always suppress from form sections
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

  // These keywords indicate service-specific / technical / equipment / address details — don't suppress
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
    lower.includes('remarks') ||
    lower.includes('street') ||
    lower.includes('barangay') ||
    lower.includes('city') ||
    lower.includes('municipality') ||
    lower.includes('province') ||
    lower.includes('region') ||
    lower.includes('zip') ||
    lower.includes('postal')
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
    lower.includes('gender')
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

// ─── Amateur / VAS / Exam-specific predicates ─────────────────────────────────

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

// ─── Repeater subfield predicate ──────────────────────────────────────────────

/**
 * Returns false so that individual device/antenna/serial number fields that are
 * entered by the applicant are preserved and rendered in the preview summary.
 */
export const isRepeaterSubField = (_label: string, _fieldId: string): boolean => {
  return false;
};


// ─── Value filter ─────────────────────────────────────────────────────────────

/** Returns true if the value should be suppressed from any preview card */
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
