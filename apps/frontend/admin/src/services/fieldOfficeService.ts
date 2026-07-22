import { useApi } from './api';
import { FieldOffice, CreateFieldOfficeCommand, UpdateFieldOfficeCommand } from '@edge/api';

export function useFieldOfficeService() {
  const { useQuery, post, put, del } = useApi();

  const useFieldOffices = (tenantId: string | null, regionId?: string | null) => {
    if (tenantId === null || tenantId.length === 0) return useQuery<FieldOffice[]>(null);
    const queryStr = regionId !== undefined && regionId !== null && regionId.length > 0 
      ? `?tenantId=${tenantId}&regionId=${regionId}` 
      : `?tenantId=${tenantId}`;
    return useQuery<FieldOffice[]>(`/api/v2/field-offices${queryStr}`);
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

  return {
    useFieldOffices,
    useFieldOffice,
    createFieldOffice,
    updateFieldOffice,
    deleteFieldOffice,
  };
}
