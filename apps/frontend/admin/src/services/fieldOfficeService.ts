import { useApi } from './api';
import { FieldOffice, CreateFieldOfficeCommand, UpdateFieldOfficeCommand } from '@edge/api';

export function useFieldOfficeService() {
  const { useQuery, post, put, del } = useApi();

  const useFieldOffices = (tenantId: string | null, regionId?: string | null) => {
    const key = tenantId !== null && tenantId.length > 0
      ? (regionId !== undefined && regionId !== null && regionId.length > 0
          ? `/api/v2/field-offices?tenantId=${tenantId}&regionId=${regionId}`
          : `/api/v2/field-offices?tenantId=${tenantId}`)
      : null;
    return useQuery<FieldOffice[]>(key);
  };

  const useFieldOffice = (id: string | null, tenantId: string | null) => {
    const isValid = id !== null && id.length > 0 && tenantId !== null && tenantId.length > 0;
    return useQuery<FieldOffice>(isValid ? `/api/v2/field-offices/${id}?tenantId=${tenantId}` : null);
  };

  const createFieldOffice = async (command: CreateFieldOfficeCommand): Promise<FieldOffice> => {
    return post<FieldOffice, CreateFieldOfficeCommand>('/api/v2/field-offices', command);
  };

  const updateFieldOffice = async (id: string, command: UpdateFieldOfficeCommand): Promise<FieldOffice> => {
    return put<FieldOffice, UpdateFieldOfficeCommand>(`/api/v2/field-offices/${id}`, command);
  };

  const deleteFieldOffice = async (id: string, tenantId: string): Promise<void> => {
    return del<void>(`/api/v2/field-offices/${id}?tenantId=${tenantId}`);
  };

  const toggleFieldOfficeActive = async (id: string, tenantId?: string): Promise<FieldOffice> => {
    const url = tenantId ? `/api/v2/field-offices/${id}/toggle-active?tenantId=${tenantId}` : `/api/v2/field-offices/${id}/toggle-active`;
    return put<FieldOffice, Record<string, never>>(url, {});
  };

  return {
    useFieldOffices,
    useFieldOffice,
    createFieldOffice,
    updateFieldOffice,
    deleteFieldOffice,
    toggleFieldOfficeActive,
  };
}
