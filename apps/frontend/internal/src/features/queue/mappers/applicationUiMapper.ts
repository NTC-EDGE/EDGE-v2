import { ApplicantDto, ApplicationDetailDto, ApplicationFeedDto } from '@edge/api';
import { ApplicationData } from '../../../types/application';
import {
  mapAddress,
  mapApplicantItem,
  mapBasicInfo,
  mapContactDetails,
  mapFilingUser,
  resolvePrimaryApplicantName,
} from './applicantMapper';
import { mapCorrectionAuditTrail, mapHistory } from './auditMapper';
import { mapCompanyDetails } from './companyMapper';
import {
  mapDueDate,
  mapPaymentDetails,
  mapSoaItems,
  mapStatementsOfAccount,
  mapTotalAmountDue,
} from './financialMapper';
import { deriveServiceName, deriveServiceNameFromFeed, mapApplicationServices } from './serviceMapper';
import { deriveQueueTab, formatDateLabel, mapBEStatusToFE } from './statusMapper';

/**
 * Maps an Application DTO (ApplicationDetailDto or ApplicationFeedDto) with optional applicants to the UI model ApplicationData.
 * Follows SOLID principles by orchestrating specialized domain sub-mappers.
 */
export function mapToApplicationData(
  dto: ApplicationDetailDto | ApplicationFeedDto,
  applicants?: ApplicantDto[]
): ApplicationData {
  const rawFilingUser = dto.filingUser;
  const isGuest = Boolean(dto.isGuest) || rawFilingUser === undefined || rawFilingUser === null;

  const effectiveApplicants = applicants ?? [];

  // Guest fallback: only resolve first applicant details if application is from a guest
  const guestApplicant = isGuest ? effectiveApplicants[0] : undefined;
  const guestDetail = guestApplicant?.details;

  const isCompanySubmission =
    rawFilingUser?.accountType === 'Company' ||
    guestApplicant?.applicantType === 'Company' ||
    dto.submissionMode === 'Bulk';

  const companyObj = rawFilingUser?.company ?? guestDetail?.company ?? guestApplicant?.company;
  const companyDetails = mapCompanyDetails(companyObj);
  const filingUser = mapFilingUser(rawFilingUser);

  const applicantName = resolvePrimaryApplicantName(
    rawFilingUser,
    guestDetail,
    companyObj,
    isCompanySubmission
  );

  const applicantsList = effectiveApplicants.map((appItem, idx) =>
    mapApplicantItem(appItem, idx)
  );

  const applicantCount =
    'applicantCount' in dto && typeof dto.applicantCount === 'number'
      ? dto.applicantCount
      : effectiveApplicants.length;

  const feStatus = mapBEStatusToFE(dto.status);
  const isBulk = dto.submissionMode === 'Bulk' || applicantCount > 1;

  const genericServiceName =
    'services' in dto && Array.isArray(dto.services) && dto.services.length > 0
      ? deriveServiceNameFromFeed(dto.services, isBulk)
      : deriveServiceName(effectiveApplicants, isBulk);

  const statementsOfAccount = 'statementsOfAccount' in dto ? dto.statementsOfAccount : undefined;
  const ordersOfPayment = 'ordersOfPayment' in dto ? dto.ordersOfPayment : undefined;
  const correctionAuditTrails = 'correctionAuditTrails' in dto ? dto.correctionAuditTrails : undefined;
  const histories = 'histories' in dto ? dto.histories : undefined;
  const tenantId = 'tenantId' in dto ? dto.tenantId : '';

  return {
    id: dto.id,
    tenantId,
    referenceNumber: dto.referenceNumber ?? dto.id.slice(0, 8),
    applicationNumber: dto.applicationNumber ?? '',
    filingUser,
    applicant: applicantName,
    applicantType: isCompanySubmission ? 'Company' : 'Individual',
    serviceName: genericServiceName,
    category: 'Permits',
    status: feStatus,
    queueTab: deriveQueueTab(feStatus),
    applicationType: isBulk ? 'BULK' : 'SINGLE',
    applicantCount,
    applicantsList,
    services: mapApplicationServices(applicantsList),
    createdAt: dto.createdAt,
    dateLabel: formatDateLabel(dto.createdAt),
    assignedTo: dto.office ?? '',
    isBeingViewed: false,
    isUrgent: false,
    isPinned: Boolean(dto.isPinned),
    isArchived: Boolean(dto.isArchived),
    address: mapAddress(guestDetail, companyObj),
    companyDetails,
    contactDetails: mapContactDetails(rawFilingUser, guestDetail, companyObj),
    basicInfo: mapBasicInfo(rawFilingUser, guestDetail),
    applicationDetails: {
      noOfYears: 0,
      permitCategory: '',
      formType: '',
      submittedAt: dto.createdAt,
    },
    requirements: [],
    forms: [],
    statementsOfAccount: mapStatementsOfAccount(statementsOfAccount, applicantsList),
    soaItems: mapSoaItems(statementsOfAccount),
    totalAmountDue: mapTotalAmountDue(statementsOfAccount),
    dueDate: mapDueDate(statementsOfAccount),
    payment: mapPaymentDetails(ordersOfPayment),
    correctionAuditTrail: mapCorrectionAuditTrail(correctionAuditTrails),
    history: mapHistory(histories),
    note: dto.remarks ?? '',
  };
}

/**
 * Backward compatibility alias for mapToApplicationData.
 */
export const mapApplicationDtoToUI = mapToApplicationData;
