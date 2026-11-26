import { resolvePreviewElements } from '../../../../shared/formPreview/core/formPreviewHelpers';
import { ExamineeType } from './applicationBaseTypes';
import { BulkApplicant } from './applicationApplicantTypes';
import { ApiApplicantDto } from './applicationApiItemTypes';
import { ApiApplicationDto } from './applicationApiTypes';
import { normalizeApplicationStatus } from './applicationStatusHelpers';
import {
  formatVariantAppType,
  resolveBulkApplicantDisplayName,
} from './applicationNameHelpers';

export function mapApiApplicantToBulkApplicant(
  ap: ApiApplicantDto,
  idx: number,
  dto: ApiApplicationDto,
  isBulk: boolean,
  rawStatus: string,
  companyName: string
): BulkApplicant {
  const filingUser = dto.filingUser;
  const apDetails = ap.details || ap;
  const apFormFields = ap.formFieldValues || apDetails.formFieldValues || [];
  const findApFv = (predicate: (lbl: string, id: string) => boolean) =>
    apFormFields.find((f) => predicate((f.fieldLabel || '').toLowerCase(), f.fieldId || ''))?.value;

  const fnFromFv = findApFv((lbl) => lbl === 'first name' || lbl === 'given name' || lbl.includes('first name'));
  const mnFromFv = findApFv((lbl) => lbl === 'middle name' || lbl.includes('middle name'));
  const lnFromFv = findApFv((lbl) => lbl === 'last name' || lbl === 'surname' || lbl.includes('last name'));
  const combinedFromFv = [fnFromFv, mnFromFv, lnFromFv].filter(Boolean).join(' ').trim();

  const fvIndivNameCandidate = findApFv(
    (lbl) =>
      lbl.includes('full legal name') ||
      lbl.includes('full name') ||
      lbl.includes('applicant name') ||
      lbl.includes('name of applicant')
  );
  const fvCorpNameCandidate = findApFv(
    (lbl) => lbl.includes('business name') || lbl.includes('company name') || lbl.includes('corporate name')
  );
  const fvRepNameCandidate = findApFv(
    (lbl, id) =>
      id === 'fd000000-0000-0000-0000-000000000082' ||
      lbl.includes('representative name') ||
      lbl.includes('authorized representative')
  );

  const appType = ap.applicantType || 'Individual';
  const isIndividualAp = appType.toLowerCase() === 'individual';
  const appStatus = normalizeApplicationStatus(rawStatus);
  const compName =
    apDetails.companyName || ap.companyName || ap.company?.name || (!isIndividualAp ? companyName : undefined);
  const repName =
    apDetails.representativeName ||
    ap.representativeName ||
    fvRepNameCandidate ||
    (!isIndividualAp ? filingUser?.name || undefined : undefined);

  const name = resolveBulkApplicantDisplayName({
    ap,
    apDetails,
    idx,
    isBulk,
    isIndividualAp,
    compName,
    repName,
    filingUserName: filingUser?.name,
    combinedFromFv,
    fvIndivNameCandidate,
    fvCorpNameCandidate,
  });

  const birthDate =
    apDetails.birthDate ||
    (apDetails.birthMonth && apDetails.birthDay && apDetails.birthYear
      ? `${apDetails.birthMonth} ${apDetails.birthDay}, ${apDetails.birthYear}`
      : findApFv((lbl) => lbl.includes('birth')));
  const civilStatus =
    apDetails.civilStatus ||
    ap.civilStatus ||
    findApFv((lbl, id) => id === 'fd000000-0000-0000-0000-000000000042' || lbl.includes('civil') || lbl.includes('marital'));
  const barangay = apDetails.barangayName || apDetails.barangay || findApFv((lbl) => lbl.includes('barangay')) || '';
  const cityMunicipality =
    apDetails.cityMunicipality || findApFv((lbl) => lbl.includes('city') || lbl.includes('municipality')) || 'N/A';
  const province = apDetails.province || findApFv((lbl) => lbl.includes('province')) || 'N/A';
  const region = apDetails.region || findApFv((lbl) => lbl.includes('region')) || 'N/A';
  const zipCode = apDetails.zipCode || findApFv((lbl) => lbl.includes('zip')) || '';
  const schoolAttended =
    apDetails.schoolAttended || apDetails.schoolName || ap.schoolAttended || ap.schoolName || findApFv((lbl) => lbl.includes('school') || lbl.includes('university'));
  const courseTaken =
    apDetails.courseTaken || apDetails.courseDegree || ap.courseTaken || ap.courseDegree || findApFv((lbl) => lbl.includes('course') || lbl.includes('degree') || lbl.includes('program'));
  const yearGraduated = apDetails.yearGraduated || ap.yearGraduated || findApFv((lbl) => lbl.includes('graduat'));
  const specialOrderNo =
    apDetails.specialOrderNo || ap.specialOrderNo || findApFv((lbl) => lbl.includes('special order') || lbl.includes('so number'));
  const eSignature =
    apDetails.eSignature || apDetails.signatureUrl || ap.eSignature || ap.signatureUrl || findApFv((lbl) => lbl.includes('signature'));
  const notes = apDetails.notes || ap.notes || ap.evaluationRemarks;

  const rawVariantOrAppType =
    ap.applicationType ||
    dto.serviceVariantType ||
    apDetails.examineeType ||
    ap.examineeType ||
    findApFv(
      (lbl, id) =>
        id === 'fd000000-0000-0000-0000-000000000008' ||
        id === 'fd000000-0000-0000-0000-000000000007' ||
        lbl.includes('examinee type') ||
        lbl.includes('type of application') ||
        lbl.includes('application type')
    ) ||
    ap.serviceVariantName ||
    ap.details?.serviceVariantName ||
    dto.serviceVariantName ||
    'New';
  const resolvedApExamineeType: ExamineeType = formatVariantAppType(rawVariantOrAppType);
  const sexValue: 'Male' | 'Female' = apDetails.sex === 'Female' ? 'Female' : 'Male';
  const resolvedElement =
    ap.element || ap.elements || ap.details?.element || ap.details?.elements || dto.element || dto.elements || resolvePreviewElements({ formFieldValues: apFormFields }) || undefined;

  return {
    id: ap.id || `app-cand-${idx}`,
    name,
    applicantType: appType,
    applicationType: ap.applicationType
      ? formatVariantAppType(ap.applicationType)
      : dto.serviceVariantType
        ? formatVariantAppType(dto.serviceVariantType)
        : resolvedApExamineeType,
    status: appStatus,
    includedInSOA: ap.includedInSOA !== undefined ? ap.includedInSOA : true,
    sex: sexValue,
    nationality: apDetails.nationality || 'Filipino',
    streetAddress: apDetails.address || apDetails.streetAddress || 'N/A',
    barangay,
    cityMunicipality,
    province,
    region,
    zipCode,
    mobileNumber: apDetails.contactNumber || apDetails.mobileNumber || 'N/A',
    email: apDetails.emailAddress || apDetails.email || 'N/A',
    examineeType: resolvedApExamineeType,
    birthDate,
    civilStatus,
    companyName: compName,
    representativeName: repName,
    notes,
    schoolAttended,
    schoolName: schoolAttended,
    courseTaken,
    courseDegree: courseTaken,
    yearGraduated,
    specialOrderNo,
    eSignature,
    signatureUrl: eSignature,
    details: {
      firstName: apDetails.firstName || fnFromFv,
      middleName: apDetails.middleName || mnFromFv,
      lastName: apDetails.lastName || lnFromFv,
      sex: sexValue,
      nationality: apDetails.nationality,
      address: apDetails.address || apDetails.streetAddress,
      barangay,
      cityMunicipality,
      province,
      region,
      zipCode,
      contactNumber: apDetails.contactNumber || apDetails.mobileNumber,
      emailAddress: apDetails.emailAddress || apDetails.email,
      examineeType: resolvedApExamineeType,
      birthDate,
      civilStatus,
      companyName: compName,
      representativeName: repName,
      notes,
      schoolAttended,
      schoolName: schoolAttended,
      courseTaken,
      courseDegree: courseTaken,
      yearGraduated,
      specialOrderNo,
      eSignature,
      signatureUrl: eSignature,
      formFieldValues: apFormFields,
    },
    formFieldValues: apFormFields,
    serviceId: ap.serviceId || dto.serviceId,
    serviceVariantId: ap.serviceVariantId || dto.serviceVariantId,
    serviceVariantName: ap.serviceVariantName || ap.details?.serviceVariantName || dto.serviceVariantName,
    serviceVariantType: ap.applicationType || dto.serviceVariantType,
    element: resolvedElement,
  };
}
