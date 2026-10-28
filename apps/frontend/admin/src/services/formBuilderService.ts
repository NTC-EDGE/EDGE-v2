import { useApi } from './api';

export interface FormFieldApiDto {
  fieldId: string;
  label: string;
  type: string;
  isRequired: boolean;
  orderIndex: number;
  validationRules?: string;
  visibilityCondition?: string;
}

export interface FormSectionApiDto {
  key: string;
  title: string;
  required: boolean;
  orderIndex: number;
  fields: FormFieldApiDto[];
}

export interface FormVersionSummaryApiDto {
  formId: string;
  key?: string;
  serviceVariantId?: string;
  version: string;
  name?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  sectionsCount: number;
  fieldsCount: number;
}

export interface FormApiDto {
  formId: string;
  key?: string;
  serviceId: string;
  serviceName?: string;
  serviceCode?: string;
  serviceVariantId?: string;
  serviceVariantName?: string;
  baseFormId?: string;
  baseFormKey?: string;
  name?: string;
  version: string;
  isActive?: boolean;
  categorySelectionRequired?: boolean;
  createdAt?: string;
  updatedAt?: string;
  sections: FormSectionApiDto[];
  availableVersions?: FormVersionSummaryApiDto[];
}

export interface CreateFormRequest {
  serviceId: string;
  key?: string;
  serviceVariantId?: string;
  baseFormId?: string;
  name?: string;
  version: string;
  isActive?: boolean;
  categorySelectionRequired: boolean;
  sections?: FormSectionApiDto[];
}

export interface UpdateFormRequest {
  id: string;
  serviceId: string;
  key?: string;
  serviceVariantId?: string;
  baseFormId?: string;
  name?: string;
  version: string;
  isActive?: boolean;
  categorySelectionRequired: boolean;
  sections?: FormSectionApiDto[];
}

export interface DuplicateFormRequest {
  id: string;
  version?: string;
}

export interface FormApiResponse<T> {
  succeeded: boolean;
  message?: string;
  data: T;
}

export interface PaginatedFormApiResponse<T> {
  succeeded: boolean;
  message?: string;
  data: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

export function useFormBuilderService() {
  const { useQuery, get, post, put, del } = useApi();

  const useForms = (
    pageNumber = 1,
    pageSize = 50,
    searchTerm?: string,
    serviceId?: string,
    serviceVariantId?: string,
    formKey?: string
  ) => {
    const params = new URLSearchParams();
    params.append('pageNumber', pageNumber.toString());
    params.append('pageSize', pageSize.toString());
    if (searchTerm !== undefined && searchTerm !== null && searchTerm.trim().length > 0) {
      params.append('searchTerm', searchTerm.trim());
    }
    if (serviceId !== undefined && serviceId !== null && serviceId.trim().length > 0) {
      params.append('serviceId', serviceId.trim());
    }
    if (serviceVariantId !== undefined && serviceVariantId !== null && serviceVariantId.trim().length > 0) {
      params.append('serviceVariantId', serviceVariantId.trim());
    }
    if (formKey !== undefined && formKey !== null && formKey.trim().length > 0) {
      params.append('formKey', formKey.trim());
    }
    return useQuery<PaginatedFormApiResponse<FormApiDto>>(`/api/v2/forms?${params.toString()}`);
  };

  const useFormById = (id?: string) => {
    return useQuery<FormApiResponse<FormApiDto>>(id ? `/api/v2/forms/${id}` : null);
  };

  const useFormByServiceId = (serviceId?: string, variantId?: string, formKey?: string) => {
    const params = new URLSearchParams();
    if (variantId) params.append('variantId', variantId);
    if (formKey) params.append('formKey', formKey);
    const qs = params.toString();
    return useQuery<FormApiResponse<FormApiDto>>(
      serviceId ? `/api/v2/services/${serviceId}/form${qs ? `?${qs}` : ''}` : null
    );
  };

  const getFormById = async (id: string): Promise<FormApiResponse<FormApiDto>> => {
    return get<FormApiResponse<FormApiDto>>(`/api/v2/forms/${id}`);
  };

  const getFormByServiceId = async (
    serviceId: string,
    variantId?: string,
    formKey?: string
  ): Promise<FormApiResponse<FormApiDto>> => {
    const params = new URLSearchParams();
    if (variantId) params.append('variantId', variantId);
    if (formKey) params.append('formKey', formKey);
    const qs = params.toString();
    return get<FormApiResponse<FormApiDto>>(`/api/v2/services/${serviceId}/form${qs ? `?${qs}` : ''}`);
  };

  const createForm = async (request: CreateFormRequest): Promise<FormApiDto> => {
    return post<FormApiDto, CreateFormRequest>('/api/v2/forms', request);
  };

  const updateForm = async (id: string, request: UpdateFormRequest): Promise<FormApiResponse<FormApiDto>> => {
    return put<FormApiResponse<FormApiDto>, UpdateFormRequest>(`/api/v2/forms/${id}`, request);
  };

  const deleteForm = async (id: string): Promise<FormApiResponse<boolean>> => {
    return del<FormApiResponse<boolean>>(`/api/v2/forms/${id}`);
  };

  const duplicateForm = async (id: string, version?: string): Promise<FormApiResponse<FormApiDto>> => {
    return post<FormApiResponse<FormApiDto>, DuplicateFormRequest>(`/api/v2/forms/${id}/duplicate`, { id, version });
  };

  const activateForm = async (id: string): Promise<FormApiResponse<FormApiDto>> => {
    return post<FormApiResponse<FormApiDto>, Record<string, never>>(`/api/v2/forms/${id}/activate`, {});
  };

  return {
    useForms,
    useFormById,
    useFormByServiceId,
    getFormById,
    getFormByServiceId,
    createForm,
    updateForm,
    deleteForm,
    duplicateForm,
    activateForm,
  };
}
