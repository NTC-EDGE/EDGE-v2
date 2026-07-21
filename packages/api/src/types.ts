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
  regionName?: string;
  venue: string;
  examDate: string;
  applicationDeadline: string;
  maxSlots?: number | null;
  maximumSlots?: number | null;
  registeredSlots?: number;
  isPublished: boolean;
  description?: string | null;
  remarks?: string | null;
  seatNumber?: string | null;
  createdAt?: string;
}

export interface CreateExamScheduleCommand {
  title: string;
  examType: string;
  regionId: string;
  venue: string;
  examDate: string;
  applicationDeadline: string;
  maxSlots?: number | null;
  maximumSlots?: number | null;
  isPublished?: boolean;
  description?: string;
  remarks?: string;
  seatNumber?: string;
}

export interface UpdateExamScheduleCommand {
  id: string;
  title: string;
  examType: string;
  regionId: string;
  venue: string;
  examDate: string;
  applicationDeadline: string;
  maxSlots?: number | null;
  maximumSlots?: number | null;
  isPublished?: boolean;
  description?: string;
  remarks?: string;
  seatNumber?: string;
}
