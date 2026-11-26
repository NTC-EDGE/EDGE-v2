import { FormFieldValueEntry, RawRequirement } from './applicationBaseTypes';

export interface ApiApplicantDetailsDto {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  sex?: string;
  nationality?: string;
  address?: string;
  streetAddress?: string;
  barangay?: string;
  barangayName?: string;
  cityMunicipality?: string;
  province?: string;
  region?: string;
  zipCode?: string;
  contactNumber?: string;
  mobileNumber?: string;
  emailAddress?: string;
  email?: string;
  birthDate?: string;
  birthMonth?: string;
  birthDay?: string;
  birthYear?: string;
  civilStatus?: string;
  companyName?: string;
  representativeName?: string;
  notes?: string;
  examineeType?: string;
  schoolAttended?: string;
  schoolName?: string;
  courseTaken?: string;
  courseDegree?: string;
  yearGraduated?: string;
  specialOrderNo?: string;
  eSignature?: string;
  signatureUrl?: string;
  serviceVariantName?: string;
  element?: string;
  elements?: string;
  formFieldValues?: FormFieldValueEntry[];
}

export interface ApiApplicantDto extends ApiApplicantDetailsDto {
  id?: string;
  name?: string;
  applicantType?: string;
  applicationType?: string;
  status?: string;
  includedInSOA?: boolean;
  company?: { name?: string; address?: string };
  evaluationRemarks?: string;
  details?: ApiApplicantDetailsDto;
  suffix?: string;
  serviceId?: string;
  serviceVariantId?: string;
  serviceVariantType?: string;
  requirements?: RawRequirement[];
  Requirements?: RawRequirement[];
  applicationRequirements?: RawRequirement[];
  ApplicationRequirements?: RawRequirement[];
  documents?: RawRequirement[];
  Documents?: RawRequirement[];
}

export interface ApiSoaLineItemDto {
  id?: string;
  particular?: string;
  itemCode?: string;
  description?: string;
  validityYears?: number;
  noOfUnits?: number;
  feeRate?: number;
  amount?: number;
}

export interface ApiSoaDto {
  id?: string;
  soaNumber?: string;
  status?: string;
  issuedToType?: string;
  issuedToName?: string;
  issuedToAddress?: string;
  totalAmount?: number;
  dueDate?: string;
  remarks?: string;
  createdAt?: string;
  preparedByName?: string;
  preparedByTitle?: string;
  approvedByName?: string;
  approvedByTitle?: string;
  lineItems?: ApiSoaLineItemDto[];
}

export interface ApiOpDto {
  id?: string;
  statementOfAccountId?: string;
  opNumber?: string;
  status?: string;
  amountDue?: number;
  amountReceived?: number;
  paymentMethod?: string;
  officialReceiptNumber?: string;
  paidAt?: string;
  remarks?: string;
  createdAt?: string;
}

export interface ApiHistoryDto {
  id?: string;
  action?: string;
  fromStatus?: string;
  toStatus?: string;
  staffName?: string;
  staffRole?: string;
  remarks?: string;
  timestamp?: string;
}

export interface ApiApplicationServiceDto {
  id?: string;
  applicantId?: string;
  serviceId?: string;
  serviceName?: string;
  name?: string;
  category?: string;
  serviceCategory?: string;
  serviceVariantId?: string;
  serviceVariantName?: string;
  applicationType?: string;
  element?: string;
}
