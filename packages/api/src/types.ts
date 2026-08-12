export interface ApiResponse<T> {
  succeeded: boolean;
  message: string | null;
  data: T | null;
  errors: Record<string, string[]> | null;
}

export interface PaginatedApiResponse<T> {
  succeeded: boolean;
  message: string | null;
  data: T[] | null;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

export interface Region {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface Province {
  id: string;
  regionId: string;
  region?: Region;
  code: string;
  name: string;
  isActive: boolean;
}

export interface Municipality {
  id: string;
  provinceId: string;
  province?: Province;
  code: string;
  name: string;
  isActive: boolean;
}

export interface Barangay {
  id: string;
  municipalityId: string;
  municipality?: Municipality;
  code: string;
  name: string;
  isActive: boolean;
}

export interface CreateRegionCommand {
  code: string;
  name: string;
}

export interface UpdateRegionCommand {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface CreateProvinceCommand {
  regionId: string;
  code: string;
  name: string;
}

export interface UpdateProvinceCommand {
  id: string;
  regionId: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface CreateMunicipalityCommand {
  provinceId: string;
  code: string;
  name: string;
}

export interface UpdateMunicipalityCommand {
  id: string;
  provinceId: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface CreateBarangayCommand {
  municipalityId: string;
  code: string;
  name: string;
}

export interface UpdateBarangayCommand {
  id: string;
  municipalityId: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface ExamSchedule {
  id: string;
  title: string;
  examType: string;
  regionId: string;
  regionName: string;
  venue: string;
  examDate: string;
  applicationDeadline: string;
  maxSlots: number;
  maximumSlots?: number | null;
  registeredSlots: number;
  isPublished: boolean;
  description?: string | null;
  remarks?: string | null;
  createdAt?: string;
  // Connected Service Fields
  serviceId?: string | null;
  serviceName?: string | null;
  serviceCode?: string | null;
  tenantId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  startApplication?: string | null;
  endApplication?: string | null;
}

export interface CreateExamScheduleCommand {
  title: string;
  examType: string;
  regionId: string;
  venue: string;
  examDate: string;
  applicationDeadline: string;
  maxSlots: number;
  maximumSlots?: number | null;
  isPublished: boolean;
  description?: string | null;
  remarks?: string | null;
  // Connected Service Fields
  serviceId?: string | null;
  tenantId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  startApplication?: string | null;
  endApplication?: string | null;
}

export interface UpdateExamScheduleCommand {
  id: string;
  title: string;
  examType: string;
  regionId: string;
  venue: string;
  examDate: string;
  applicationDeadline: string;
  maxSlots: number;
  maximumSlots?: number | null;
  isPublished: boolean;
  description?: string | null;
  remarks?: string | null;
}

// Tenant and Member Management Types
export interface Tenant {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
  regionId: string;
  createdAt?: string;
  createdBy?: string | null;
  lastModifiedAt?: string | null;
  lastModifiedBy?: string | null;
  tenantMembersTotal?: number;
  clientTotal?: number;
  fieldOfficesCount?: number;
}

export interface CreateTenantCommand {
  name: string;
  code: string;
  description?: string | null;
  regionId: string;
}

export interface UpdateTenantCommand {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
  regionId: string;
}

export interface TenantMember {
  id: string;
  tenantId: string;
  tenantName: string;
  userId: string;
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  roleId: string;
  fieldOfficeId?: string | null;
  fieldOfficeName?: string | null;
  jobTitle?: string | null;
  level?: string | null;
  division: string;
  position: string;
  designation?: string | null;
  isDeleted?: boolean;
  createdAt?: string;
  createdBy?: string | null;
  lastModifiedAt?: string | null;
  lastModifiedBy?: string | null;
}

export interface AssignUserToTenantCommand {
  tenantId: string;
  userId: string;
  roleId: string;
  fieldOfficeId?: string | null;
  jobTitle?: string | null;
  level?: string | null;
  division: string;
  position: string;
  designation?: string | null;
}

export interface UpdateMemberDetailsCommand {
  memberId: string;
  tenantId: string;
  roleId: string;
  fieldOfficeId?: string | null;
  jobTitle?: string | null;
  level?: string | null;
  division: string;
  position: string;
  designation?: string | null;
}

export interface FieldOffice {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  description?: string | null;
  regionId: string;
  regionName?: string | null;
  provinceId?: string | null;
  provinceName?: string | null;
  address: string;
  contactPhone: string;
  contactEmail: string;
  officerInChargeId: string;
  officerInChargeName?: string | null;
  officerInChargeEmail?: string | null;
  isActive: boolean;
  allowSpectrumInspection: boolean;
  allowPermitIssuance: boolean;
  allowComplaintReception: boolean;
  assignedMemberCount?: number;
  createdAt?: string;
}

export interface CreateFieldOfficeCommand {
  tenantId: string;
  name: string;
  code: string;
  description?: string | null;
  regionId: string;
  provinceId?: string | null;
  address: string;
  contactPhone: string;
  contactEmail: string;
  officerInChargeId: string;
  allowSpectrumInspection: boolean;
  allowPermitIssuance: boolean;
  allowComplaintReception: boolean;
}

export interface UpdateFieldOfficeCommand {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  description?: string | null;
  regionId: string;
  provinceId?: string | null;
  address: string;
  contactPhone: string;
  contactEmail: string;
  officerInChargeId: string;
  isActive: boolean;
  allowSpectrumInspection: boolean;
  allowPermitIssuance: boolean;
  allowComplaintReception: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt?: string;
}

export type AccountStatus =
  | "active"
  | "locked"
  | "suspended"
  | "pending_verification";

export interface GlobalSupportUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  regionId: string;
  regionName: string;
  tenantId?: string | null;
  tenantName?: string | null;
  fieldOfficeName?: string | null;
  status: AccountStatus;
  isSuperAdmin?: boolean;
  isLockedOut: boolean;
  mfaEnabled: boolean;
  mfaMethod?: string | null;
  lastLoginAt?: string | null;
  failedLoginAttempts: number;
  authProvider: "Clerk" | "Local" | "AzureAD" | "GovSSO";
  assignedRoles: string[];
  createdAt: string;
  openTicketsCount: number;
  totalTicketsCount: number;
}

export interface UserSession {
  id: string;
  userId: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface LoginAuditLog {
  id: string;
  userId: string;
  timestamp: string;
  status: "success" | "failed";
  ipAddress: string;
  location: string;
  deviceInfo: string;
  authProvider: string;
  failureReason?: string | null;
}

export interface SupportTicketSummary {
  id: string;
  ticketNumber: string;
  subject: string;
  category:
    | "Login Issue"
    | "Access Rights"
    | "MFA Problem"
    | "Region Scope"
    | "General Troubleshooting";
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  priority: "Low" | "Medium" | "High" | "Urgent";
  createdAt: string;
  lastUpdatedAt: string;
}

export interface SupportDiagnosticNote {
  id: string;
  userId: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
  note: string;
  actionTaken?: string | null;
}

export interface UserDiagnosticDetails {
  user: GlobalSupportUser;
  activeSessions: UserSession[];
  loginHistory: LoginAuditLog[];
  effectivePermissions: string[];
  supportTickets: SupportTicketSummary[];
  diagnosticNotes: SupportDiagnosticNote[];
}

export interface UpdateUserStatusRequest {
  userId: string;
  status: AccountStatus;
  reason: string;
}

export interface AddSupportNoteRequest {
  userId: string;
  note: string;
  actionTaken?: string | null;
}

export interface Role {
  id: string;
  tenantId?: string | null;
  isSystemRole: boolean;
  name: string;
  key: string;
  description?: string | null;
}

export interface CreateRoleCommand {
  tenantId?: string | null;
  isSystemRole: boolean;
  name: string;
  key: string;
  description?: string | null;
}

export interface UpdateRoleCommand {
  id: string;
  tenantId?: string | null;
  isSystemRole: boolean;
  name: string;
  key: string;
  description?: string | null;
}

export interface Permission {
  id: string;
  code: string;
  name: string;
  category: string;
  description?: string | null;
}

export interface RegionFeeSchedule {
  applicationFee: number;
  inspectionFee: number;
  permitRenewalFee: number;
  lateSurchargeRatePercent: number;
  maxProcessingFeeCap: number;
  emergencyProcessingFee: number;
}

export interface RegionSettings {
  regionId: string;
  regionCode: string;
  regionName: string;
  regionalDirector: string;
  contactEmail: string;
  contactPhone: string;
  officeAddress: string;
  isActive: boolean;
  fees: RegionFeeSchedule;
}

export interface Fee {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export interface ServiceFee {
  id: string;
  serviceId: string;
  serviceName?: string | null;
  serviceCode?: string | null;
  feeId: string;
  feeCode?: string | null;
  feeName?: string | null;
  amount: number;
  isActive?: boolean;
  createdAt?: string;
}

export interface Element {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  createdAt?: string;
}

export interface ServiceVariantDetail {
  id: string;
  serviceId: string;
  serviceName?: string | null;
  type?: string | null;
}

export interface ServiceVariantFee {
  id: string;
  serviceVariantId: string;
  serviceVariant?: ServiceVariantDetail | null;
  feeId: string;
  feeCode?: string | null;
  feeName?: string | null;
  amount: number;
  createdAt?: string;
}

export interface ServiceVariantElementFee {
  id: string;
  serviceVariantId: string;
  serviceVariant?: ServiceVariantDetail | null;
  elementId: string;
  elementCode?: string | null;
  elementName?: string | null;
  feeId: string;
  feeCode?: string | null;
  feeName?: string | null;
  amount: number;
  createdAt?: string;
}

export interface Note {
  id: string;
  notes: string;
  serviceId: string;
  serviceVariantId?: string | null;
  serviceName?: string | null;
  serviceVariantName?: string | null;
}

export interface Requirement {
  id: string;
  name: string;
  description?: string | null;
}

export interface ServiceVariant {
  id: string;
  serviceId: string;
  serviceName?: string | null;
  type: string;
  description?: string | null;
}

export interface ServiceVariantRequirement {
  id: string;
  requirementId: string;
  requirement?: Requirement;
  serviceVariantId: string;
  serviceVariantType?: string;
  serviceName?: string;
  serviceCode?: string;
  contextKey?: string | null;
  isRequired: boolean;
}

export interface StoredFileDto {
  id: string;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  category: string;
  tenantId: string;
  uploadedByUserId: string;
  createdAt: string;
}

export interface FeedbackDto {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  rating: number;
  status: string;
  isAnonymous?: boolean;
  createdAt: string;
}

export interface SystemAnnouncementDto {
  id: string;
  title: string;
  message: string;
  type: 'Info' | 'Warning' | 'Maintenance' | 'Emergency';
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
  targetAudience: string;
  createdAt: string;
}

export interface AuditLogDto {
  id: string;
  event: string;
  action: string;
  entityName: string;
  entityId: string;
  actor: string;
  userId?: string;
  resource: string;
  ipAddress: string;
  status: 'Success' | 'Warning' | 'Error';
  type: 'Auth' | 'Data' | 'System' | 'Security' | 'User';
  changes: string;
  keyValues?: string | null;
  oldValues?: string | null;
  newValues?: string | null;
  timestamp: string;
}

export interface ActivityLogDto {
  id: string;
  activityType: string;
  description: string;
  userId: string;
  ipAddress: string;
  timestamp: string;
}

// ─── Application Domain DTOs ───────────────────────────────────────────────

export type ApplicationStatusDto =
  | 'Draft'
  | 'Submitted'
  | 'Evaluating'
  | 'Returned'
  | 'Approved'
  | 'Completed';

export type SoaStatusDto = 'Pending' | 'Approved' | 'Returned';
export type OpStatusDto = 'Billed' | 'Processing' | 'Returned' | 'Paid';
export type IssuedToTypeDto = 'Individual' | 'Company' | 'AccountOwner';
export type PaymentMethodDto = 'Cash' | 'Check' | 'Online';

export interface SoaLineItemDto {
  id: string;
  particular: string;
  itemCode: string;
  description?: string;
  periodOfCoverageStart?: string;
  periodOfCoverageEnd?: string;
  validityYears: number;
  noOfUnits: number;
  feeRate: number;
  amount: number;
}

export interface SoaHistoryDto {
  id: string;
  action: string;
  fromStatus?: SoaStatusDto;
  toStatus: SoaStatusDto;
  staffName: string;
  staffRole: string;
  remarks?: string;
  timestamp: string;
}

export interface StatementOfAccountDto {
  id: string;
  applicationId: string;
  applicantId?: string;
  soaNumber: string;
  status: SoaStatusDto;
  issuedToType: IssuedToTypeDto;
  issuedToName: string;
  issuedToAddress?: string;
  totalAmount: number;
  dueDate: string;
  preparedByUserId?: string;
  approvedByUserId?: string;
  approvedAt?: string;
  remarks?: string;
  lineItems: SoaLineItemDto[];
  histories: SoaHistoryDto[];
}

export interface OpHistoryDto {
  id: string;
  action: string;
  fromStatus?: OpStatusDto;
  toStatus: OpStatusDto;
  staffName: string;
  staffRole: string;
  officialReceiptNumber?: string;
  remarks?: string;
  timestamp: string;
}

export interface OrderOfPaymentDto {
  id: string;
  applicationId: string;
  statementOfAccountId: string;
  opNumber: string;
  status: OpStatusDto;
  amountDue: number;
  amountReceived: number;
  paymentMethod?: PaymentMethodDto;
  officialReceiptNumber?: string;
  checkNumber?: string;
  checkName?: string;
  checkBank?: string;
  checkDate?: string;
  verifiedByCashierId?: string;
  paidAt?: string;
  remarks?: string;
  histories: OpHistoryDto[];
}

export interface ApplicationHistoryDto {
  id: string;
  action: string;
  fromStatus?: ApplicationStatusDto;
  toStatus: ApplicationStatusDto;
  staffName: string;
  staffRole: string;
  remarks?: string;
  timestamp: string;
}

export interface CorrectionAuditTrailDto {
  id: string;
  category: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  correctedByStaff: string;
  correctedAt: string;
}

export interface ApplicationServiceDto {
  id: string;
  serviceCategoryId: string;
  serviceId: string;
  serviceVariantId?: string;
  applicationTypeKey?: string;
  dynamicDataJson?: string;
}

export interface FormFieldValueDto {
  fieldId: string;
  fieldLabel: string;
  value?: string;
}

export interface CompanyDetailDto {
  id: string;
  barangayId?: string;
  barangayName?: string;
  address: string;
  name: string;
  registrationNumber: string;
  contactNumber: string;
  email?: string;
  entityType?: string;
}

export interface ApplicantDetailDto {
  id: string;
  barangayId?: string;
  address: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  nationality: string;
  sex: string;
  height?: number;
  weight?: number;
  birthDate?: string;
  contactNumber: string;
  email?: string;
  emailAddress?: string;
  zipCode?: string;
  company?: CompanyDetailDto;
}

export interface ApplicantDto {
  id: string;
  tenantId: string;
  userId?: string;
  isGuest: boolean;
  applicantType: string;
  status?: string;
  evaluationRemarks?: string;
  details?: ApplicantDetailDto;
  company?: CompanyDetailDto;
  formFieldValues?: FormFieldValueDto[];
}

export interface FilingUserDto {
  id: string;
  name: string;
  email: string;
  accountType: string;
  company?: CompanyDetailDto;
}

export interface ApplicationDto {
  id: string;
  tenantId: string;
  scheduleId?: string;
  regionId?: string;
  userId?: string;
  office?: string;
  applicationNumber?: string;
  referenceNumber?: string;
  remarks?: string;
  status: ApplicationStatusDto;
  submissionMode: string;
  dataEntryMethod?: string;
  isGuest: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  createdAt: string;
  filingUser?: FilingUserDto;
  services: ApplicationServiceDto[];
  applicants: ApplicantDto[];
  statementsOfAccount: StatementOfAccountDto[];
  ordersOfPayment: OrderOfPaymentDto[];
  histories: ApplicationHistoryDto[];
  correctionAuditTrails: CorrectionAuditTrailDto[];
}

export interface ApplicantSummaryDto {
  id: string;
  tenantId: string;
  userId?: string;
  isGuest: boolean;
  applicantType: string;
  status?: string;
  evaluationRemarks?: string;
  name: string;
  contactNumber?: string;
  emailAddress?: string;
  company?: CompanyDetailDto;
  details?: ApplicantDetailDto;
  formFieldValues?: FormFieldValueDto[];
}

export interface StatementOfAccountSummaryDto {
  id: string;
  soaNumber: string;
  status: string;
  totalAmount: number;
  dueDate: string;
  lineItems?: SoaLineItemDto[];
}

export interface OrderOfPaymentSummaryDto {
  id: string;
  opNumber: string;
  status: string;
  amountDue: number;
  amountReceived: number;
  officialReceiptNumber?: string;
  paymentMethod?: string;
  checkNumber?: string;
  checkName?: string;
  paidAt?: string;
}

export interface ApplicationSummaryDto {
  id: string;
  tenantId: string;
  scheduleId?: string;
  regionId?: string;
  office?: string;
  applicationNumber?: string;
  referenceNumber?: string;
  status: ApplicationStatusDto;
  submissionMode: string;
  dataEntryMethod?: string;
  remarks?: string;
  userId?: string;
  isGuest: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  createdAt: string;
  filingUser?: FilingUserDto;
  services: ApplicationServiceDto[];
  applicants: ApplicantSummaryDto[];
  statementsOfAccount: StatementOfAccountSummaryDto[];
  ordersOfPayment: OrderOfPaymentSummaryDto[];
  histories?: ApplicationHistoryDto[];
  correctionAuditTrails?: CorrectionAuditTrailDto[];
}

export interface UpdateApplicationStatusRequest {
  status: string;
  remarks?: string;
}

export interface CreateSoaLineItemRequest {
  particular: string;
  itemCode: string;
  description?: string;
  periodOfCoverageStart?: string;
  periodOfCoverageEnd?: string;
  validityYears: number;
  noOfUnits: number;
  feeRate: number;
  amount: number;
}

export interface CreateSoaRequest {
  applicantId?: string;
  issuedToType: IssuedToTypeDto;
  issuedToName: string;
  issuedToAddress?: string;
  dueDate: string;
  lineItems: CreateSoaLineItemRequest[];
}

export interface VerifyPaymentRequest {
  officialReceiptNumber: string;
  amountReceived: number;
}

export type ReturnTargetDto = 'Accountant' | 'Evaluator';

export interface ReturnOpRequest {
  remarks: string;
  returnTo: ReturnTargetDto;
}
