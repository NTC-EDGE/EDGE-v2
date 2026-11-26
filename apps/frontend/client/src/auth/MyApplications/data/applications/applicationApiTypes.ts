import { IssuedDocumentSummary, RawRequirement } from './applicationBaseTypes';
import {
  ApiApplicantDto,
  ApiApplicationServiceDto,
  ApiHistoryDto,
  ApiOpDto,
  ApiSoaDto,
} from './applicationApiItemTypes';

export interface ApiApplicationDto {
  id?: string;
  tenantId?: string;
  applicationNumber?: string;
  referenceNumber?: string;
  status?: string;
  submissionMode?: string;
  mode?: string;
  applicantType?: string;
  office?: string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
  lastModifiedAt?: string;
  submittedAt?: string;
  serviceName?: string;
  serviceCategory?: string;
  serviceId?: string;
  serviceVariantId?: string;
  serviceVariantName?: string;
  serviceVariantType?: string;
  element?: string;
  elements?: string;
  soaNumber?: string | null;
  officialReceiptNumber?: string;
  OfficialReceiptNumber?: string;
  amountPaid?: number;
  AmountPaid?: number;
  paidAt?: string;
  PaidAt?: string;
  opStatus?: string;
  OpStatus?: string;
  orderOfPaymentId?: string;
  OrderOfPaymentId?: string;
  opNumber?: string;
  OpNumber?: string;
  paymentMethod?: string;
  PaymentMethod?: string;
  checkNumber?: string;
  checkName?: string;
  checkBank?: string;
  checkDate?: string;
  payorName?: string;
  paymentRemarks?: string;
  totalAmountDue?: number;
  TotalAmountDue?: number;
  intent?: string;
  Intent?: string;
  assessedAt?: string;
  AssessedAt?: string;
  convertedToRegularAt?: string;
  ConvertedToRegularAt?: string;
  assessmentVersion?: number;
  AssessmentVersion?: number;
  assessmentRemarks?: string;
  AssessmentRemarks?: string;
  evaluatingOfficer?: string;
  issuingOfficer?: string;
  filingUser?: {
    id?: string;
    name?: string;
    email?: string;
    accountType?: string;
    company?: { name?: string; address?: string };
  };
  services?: ApiApplicationServiceDto[];
  applicants?: ApiApplicantDto[];
  Applicants?: ApiApplicantDto[];
  applicationApplicants?: ApiApplicantDto[];
  ApplicationApplicants?: ApiApplicantDto[];
  requirements?: RawRequirement[];
  Requirements?: RawRequirement[];
  applicationRequirements?: RawRequirement[];
  ApplicationRequirements?: RawRequirement[];
  documents?: RawRequirement[];
  Documents?: RawRequirement[];
  companyName?: string;
  applicantName?: string;
  histories?: ApiHistoryDto[];
  Histories?: ApiHistoryDto[];
  statementsOfAccount?: ApiSoaDto[];
  StatementsOfAccount?: ApiSoaDto[];
  ordersOfPayment?: ApiOpDto[];
  OrdersOfPayment?: ApiOpDto[];
  issuedDocumentDetails?: IssuedDocumentSummary[];
  IssuedDocumentDetails?: IssuedDocumentSummary[];
  renewedFromApplicationId?: string;
  RenewedFromApplicationId?: string;
  hasActiveRenewal?: boolean;
  HasActiveRenewal?: boolean;
  activeRenewalApplicationId?: string;
  ActiveRenewalApplicationId?: string;
  activeRenewalReferenceNumber?: string;
  ActiveRenewalReferenceNumber?: string;
}
