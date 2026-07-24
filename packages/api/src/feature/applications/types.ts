import { ApiResponse } from '../../types';

export interface ApplicationRequirementDto {
  id: string;
  applicantId: string;
  requirementId: string;
  serviceVariantRequirementId?: string | null;
  url: string;
  isApproved: boolean;
}

export interface ApplicationServiceDto {
  id: string;
  serviceCategoryId?: string | null;
  serviceId?: string | null;
  serviceVariantId?: string | null;
  applicationTypeKey?: string | null;
  dynamicDataJson?: string | null;
}

export interface ApplicantDto {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  email: string;
  phoneNumber?: string | null;
  accountType?: string | null;
}

export interface ApplicationDto {
  id: string;
  tenantId: string;
  scheduleId?: string | null;
  regionId?: string | null;
  office?: string | null;
  applicationNumber?: string | null;
  referenceNumber?: string | null;
  status: string;
  submissionMode: string;
  dataEntryMethod?: string | null;
  remarks?: string | null;
  userId?: string | null;
  isGuest: boolean;
  createdAt: string;
  services: ApplicationServiceDto[];
  applicants: ApplicantDto[];
  requirements: ApplicationRequirementDto[];
}

export interface SubmitApplicationCommand {
  tenantId: string;
  submissionMode?: string;
  dataEntryMethod?: string | null;
  status?: string;
  serviceCategoryId?: string | null;
  serviceId?: string | null;
  serviceVariantId?: string | null;
  applicationTypeKey?: string | null;
  regionId?: string | null;
  scheduleId?: string | null;
  office?: string | null;
  dynamicDataJson?: string | null;
  accountType?: string;
  applicantIds?: string[];
}

export interface UpdateApplicationCommand {
  id: string;
  submissionMode?: string;
  dataEntryMethod?: string | null;
  status?: string;
  serviceCategoryId?: string | null;
  serviceId?: string | null;
  serviceVariantId?: string | null;
  applicationTypeKey?: string | null;
  regionId?: string | null;
  scheduleId?: string | null;
  office?: string | null;
  dynamicDataJson?: string | null;
  accountType?: string;
  applicantIds?: string[];
}

export interface UploadApplicantRequirementCommand {
  tenantId?: string | null;
  applicationId: string;
  applicantId: string;
  requirementId: string;
  serviceVariantRequirementId?: string | null;
  fileUrl: string;
}

export interface GetApplicationsParams {
  tenantId?: string;
  status?: string;
  search?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface CsvPreviewRowDto {
  rowNumber: number;
  isValid: boolean;
  errors: string[];
  data: Record<string, string>;
}

export interface PreviewCsvImportResultDto {
  totalRows: number;
  validRowsCount: number;
  invalidRowsCount: number;
  rows: CsvPreviewRowDto[];
}
