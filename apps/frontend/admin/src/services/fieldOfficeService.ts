import { useApi } from './api';
import { FieldOffice, CreateFieldOfficeCommand, UpdateFieldOfficeCommand } from '@edge/api';

export function useFieldOfficeService() {
  const { useQuery, post, put, del } = useApi();

  const useFieldOffices = (regionId?: string | null) => {
    const queryStr = regionId !== undefined && regionId !== null && regionId.length > 0 ? `?regionId=${regionId}` : '';
    return useQuery<FieldOffice[]>(`/api/v2/field-offices${queryStr}`);
  };

  const useFieldOffice = (id: string | null) => {
    return useQuery<FieldOffice>(id !== null && id.length > 0 ? `/api/v2/field-offices/${id}` : null);
  };

  const createFieldOffice = async (command: CreateFieldOfficeCommand): Promise<FieldOffice> => {
    return post<FieldOffice, CreateFieldOfficeCommand>('/api/v2/field-offices', command);
  };

  const updateFieldOffice = async (id: string, command: UpdateFieldOfficeCommand): Promise<FieldOffice> => {
    return put<FieldOffice, UpdateFieldOfficeCommand>(`/api/v2/field-offices/${id}`, command);
  };

  const deleteFieldOffice = async (id: string): Promise<void> => {
    return del<void>(`/api/v2/field-offices/${id}`);
  };

  return {
    useFieldOffices,
    useFieldOffice,
    createFieldOffice,
    updateFieldOffice,
    deleteFieldOffice,
  };
}
