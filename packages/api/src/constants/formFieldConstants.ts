/**
 * Canonical form field identifiers for dynamic service variant elements and station classes.
 * 
 * Note: Applicant details (Name, DOB, Address, Contact Number, Education, E-Signature, etc.)
 * are NOT form fields; they are persisted directly in the strongly-typed Applicant and ApplicantDetail entities.
 */
export const FORM_FIELD_IDS = {
  EXAM_ELEMENTS: 'fd000000-0000-0000-0000-000000000009',
  CLASS_OF_STATION: 'fd000000-0000-0000-0000-000000000025',
  STATION_CLASS: 'fd000000-0000-0000-0000-000000000101',
} as const;

export const ELEMENT_FIELD_IDS: ReadonlySet<string> = new Set([
  FORM_FIELD_IDS.EXAM_ELEMENTS,
  FORM_FIELD_IDS.CLASS_OF_STATION,
  FORM_FIELD_IDS.STATION_CLASS,
]);
