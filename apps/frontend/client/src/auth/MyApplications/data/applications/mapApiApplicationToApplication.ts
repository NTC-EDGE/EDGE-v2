import { resolvePreviewElements } from '../../../../shared/formPreview/core/formPreviewHelpers';
import { FormFieldValueEntry, RawRequirement } from './applicationBaseTypes';
import { BulkApplicant } from './applicationApplicantTypes';
import { Application, BulkApplication, SingleApplication } from './applicationModelTypes';
import { ApiApplicantDto } from './applicationApiItemTypes';
import { ApiApplicationDto } from './applicationApiTypes';
import { normalizeApplicationStatus } from './applicationStatusHelpers';
import { resolvePrimaryApplicantName } from './applicationNameHelpers';
import { mapApiApplicantToBulkApplicant } from './applicationApplicantMapper';
import { mapApplicationHistories } from './applicationHistorySoaHelpers';
import { mapApplicationBilling } from './applicationBillingMapper';

function resolveVariantAndElementMetadata(
  dto: ApiApplicationDto,
  rawApplicants: ApiApplicantDto[],
  mappedApplicants: BulkApplicant[],
  firstApplicant: ApiApplicantDto | undefined,
  primaryFormFieldValues: FormFieldValueEntry[]
) {
  const rawVariantName =
    dto.serviceVariantName || (rawApplicants.length > 0 ? rawApplicants[0]?.serviceVariantName : undefined);

  const variantFromFields = primaryFormFieldValues.find(
    (fv) =>
      fv.fieldLabel?.toLowerCase().includes('permit / license type') ||
      fv.fieldLabel?.toLowerCase().includes('type of certificate') ||
      fv.fieldLabel?.toLowerCase().includes('application variant') ||
      fv.fieldLabel?.toLowerCase().includes('application type') ||
      fv.fieldId === 'fd000000-0000-0000-0000-000000000024' ||
      fv.fieldId === 'fd000000-0000-0000-0000-000000000014'
  )?.value;

  const resolvedVariantType =
    dto.serviceVariantType ||
    (rawApplicants.length > 0 ? rawApplicants[0]?.applicationType : undefined) ||
    (mappedApplicants.length > 0 ? mappedApplicants[0]?.applicationType : undefined);
  const resolvedVariantName = rawVariantName || variantFromFields || resolvedVariantType || '';

  const elementFromFields = primaryFormFieldValues.find(
    (fv) =>
      fv.fieldId === 'fd000000-0000-0000-0000-000000000009' ||
      fv.fieldId === 'fd000000-0000-0000-0000-000000000025' ||
      fv.fieldId === 'fd000000-0000-0000-0000-000000000101' ||
      fv.fieldLabel?.toLowerCase().includes('selected exam element') ||
      fv.fieldLabel?.toLowerCase().includes('element') ||
      fv.fieldLabel?.toLowerCase().includes('station class')
  )?.value;

  const rawElement =
    (typeof dto.element === 'string' && dto.element.trim().length > 0 ? dto.element.trim() : undefined) ||
    (typeof dto.elements === 'string' && dto.elements.trim().length > 0 ? dto.elements.trim() : undefined) ||
    (typeof firstApplicant?.element === 'string' && firstApplicant.element.trim().length > 0 ? firstApplicant.element.trim() : undefined) ||
    (typeof firstApplicant?.elements === 'string' && firstApplicant.elements.trim().length > 0 ? firstApplicant.elements.trim() : undefined) ||
    elementFromFields ||
    undefined;

  const resolvedElement =
    resolvePreviewElements({ element: rawElement, formFieldValues: primaryFormFieldValues }) || rawElement || 'New';

  return { resolvedVariantName, resolvedVariantType, resolvedElement };
}

export function mapApiApplicationToApplication(dto: ApiApplicationDto): Application {
  const isBulk = (dto.submissionMode || dto.mode || '').toString().toUpperCase() === 'BULK';
  const rawStatus = dto.status || 'PENDING';
  const initialStatus = normalizeApplicationStatus(rawStatus);
  const rawApplicants = dto.applicants || dto.Applicants || [];
  const filingUser = dto.filingUser;
  const companyName =
    dto.companyName ||
    filingUser?.company?.name ||
    (rawApplicants.length > 0 ? rawApplicants[0]?.company?.name : undefined) ||
    filingUser?.name ||
    'Company Applicant';

  const firstApplicant = rawApplicants.length > 0 ? rawApplicants[0] : undefined;
  const firstDetails = firstApplicant?.details || firstApplicant;
  const applicantName = resolvePrimaryApplicantName(dto, firstApplicant, companyName);
  const refNumber =
    dto.referenceNumber || dto.applicationNumber || (dto.id ? String(dto.id).slice(0, 8).toUpperCase() : 'REF-PENDING');

  const serviceFromList = dto.services && dto.services.length > 0 ? dto.services[0]?.name : undefined;
  const serviceName = dto.serviceName || serviceFromList || dto.remarks || dto.office || 'NTC Service Application';
  const categoryFromList = dto.services && dto.services.length > 0 ? dto.services[0]?.category : undefined;
  const serviceCategory = dto.serviceCategory || categoryFromList || 'General';
  const submittedAt =
    dto.updatedAt || dto.lastModifiedAt || dto.createdAt || dto.submittedAt || new Date().toISOString();

  const mappedApplicants: BulkApplicant[] = rawApplicants.map((ap, idx) =>
    mapApiApplicantToBulkApplicant(ap, idx, dto, isBulk, rawStatus, companyName)
  );
  const reqDocs: RawRequirement[] =
    dto.requirements || dto.Requirements || dto.applicationRequirements || dto.ApplicationRequirements || dto.documents || dto.Documents || [];

  mappedApplicants.forEach((candidate) => {
    const matched = reqDocs.filter(
      (r) => r.applicantId === candidate.id || (mappedApplicants.length === 1 && (!r.applicantId || r.applicantId === dto.id))
    );
    if (matched.length > 0 && (!candidate.requirements || candidate.requirements.length === 0)) {
      candidate.requirements = matched;
      candidate.documents = matched;
    }
  });

  const primaryFormFieldValues = firstApplicant?.formFieldValues || [];
  const { resolvedVariantName, resolvedVariantType, resolvedElement } = resolveVariantAndElementMetadata(
    dto, rawApplicants, mappedApplicants, firstApplicant, primaryFormFieldValues
  );

  const mappedHistories = mapApplicationHistories(dto, firstApplicant);
  const billing = mapApplicationBilling(
    dto, initialStatus, refNumber, serviceName, serviceCategory, isBulk, mappedApplicants.length, mappedHistories
  );

  const rawIntentStr = (dto.intent || dto.Intent || '').toString().toLowerCase();
  const isAssessmentOnly = rawIntentStr === 'assessmentonly' || rawIntentStr === 'assessment_only' || rawIntentStr === 'assessment';
  const intent: 'Regular' | 'AssessmentOnly' = isAssessmentOnly ? 'AssessmentOnly' : 'Regular';
  const resolvedServiceId =
    dto.serviceId || firstApplicant?.serviceId || mappedApplicants[0]?.serviceId || (dto.services && dto.services[0]?.serviceId);
  const resolvedServiceVariantId =
    dto.serviceVariantId || firstApplicant?.serviceVariantId || mappedApplicants[0]?.serviceVariantId || (dto.services && dto.services[0]?.serviceVariantId);

  const sharedFields = {
    issuedDocumentDetails: dto.issuedDocumentDetails || dto.IssuedDocumentDetails || [],
    renewedFromApplicationId: dto.renewedFromApplicationId || dto.RenewedFromApplicationId,
    hasActiveRenewal: Boolean(dto.hasActiveRenewal ?? dto.HasActiveRenewal),
    activeRenewalApplicationId: dto.activeRenewalApplicationId || dto.ActiveRenewalApplicationId,
    activeRenewalReferenceNumber: dto.activeRenewalReferenceNumber || dto.ActiveRenewalReferenceNumber,
    id: dto.id || '',
    referenceNumber: refNumber,
    intent,
    isAssessmentOnly,
    assessedAt: dto.assessedAt || dto.AssessedAt,
    convertedToRegularAt: dto.convertedToRegularAt || dto.ConvertedToRegularAt,
    assessmentVersion: dto.assessmentVersion || dto.AssessmentVersion || 1,
    assessmentRemarks: dto.assessmentRemarks || dto.AssessmentRemarks,
    serviceName,
    serviceCategory,
    element: resolvedElement,
    status: billing.status,
    submittedAt,
    applicants: mappedApplicants,
    soaNumber: billing.resolvedSoaNumber,
    soa: billing.mappedSoa,
    op: billing.mappedOp,
    soaItems: billing.mappedSoaItems,
    totalAmountDue: billing.calculatedTotalDue,
    dueDate: billing.resolvedDueDate,
    opNumber: billing.resolvedOpNumber,
    officialReceiptNumber: billing.resolvedOrNumber,
    amountPaid: billing.resolvedAmountPaid,
    paidAt: billing.resolvedPaidAt,
    documents: reqDocs,
    requirements: reqDocs,
    formFieldValues: primaryFormFieldValues,
    office: dto.office,
    remarks: dto.remarks,
    serviceVariantName: resolvedVariantName,
    serviceVariantType: resolvedVariantType,
    tenantId: dto.tenantId,
    serviceId: resolvedServiceId,
    serviceVariantId: resolvedServiceVariantId,
    histories: mappedHistories,
    history: mappedHistories,
    evaluatingOfficer: billing.primarySoaDto?.preparedByName || dto.evaluatingOfficer,
    issuingOfficer: billing.primarySoaDto?.approvedByName || dto.issuingOfficer,
    filingUser: dto.filingUser,
    rawStatus,
  };

  if (isBulk) {
    const bulkApp: BulkApplication = { ...sharedFields, mode: 'BULK', submissionMode: 'BULK', companyName };
    return bulkApp;
  }

  const singleApp: SingleApplication = {
    ...sharedFields,
    mode: 'SINGLE',
    submissionMode: 'SINGLE',
    applicantType: firstApplicant?.applicantType || dto.applicantType || 'Individual',
    applicantName,
    sex: firstDetails?.sex === 'Female' ? 'Female' : 'Male',
    nationality: firstDetails?.nationality || 'Filipino',
    streetAddress: firstDetails?.address || firstDetails?.streetAddress || 'N/A',
    barangay: firstDetails?.barangayName || firstDetails?.barangay || '',
    cityMunicipality: firstDetails?.cityMunicipality || 'N/A',
    province: firstDetails?.province || 'N/A',
    region: firstDetails?.region || 'N/A',
    zipCode: firstDetails?.zipCode || '',
    mobileNumber: firstDetails?.contactNumber || firstDetails?.mobileNumber || 'N/A',
    email: firstDetails?.emailAddress || firstDetails?.email || 'N/A',
    birthDate: mappedApplicants[0]?.birthDate,
    civilStatus: mappedApplicants[0]?.civilStatus,
    examineeType: mappedApplicants[0]?.examineeType || resolvedVariantType || resolvedVariantName || 'New',
    schedule: { date: 'TBD', time: 'TBD', venue: dto.office || 'NTC Regional Office' },
  };
  return singleApp;
}
