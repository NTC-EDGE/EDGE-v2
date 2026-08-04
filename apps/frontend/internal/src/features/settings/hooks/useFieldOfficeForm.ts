import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { safeAsync, createFieldOffice, updateFieldOffice, CreateFieldOfficePayload, UpdateFieldOfficePayload } from '@edge/api';
import { fieldOfficeSchema, FieldOfficeFormValues } from '../schemas/fieldOffice.schema';

interface UseFieldOfficeFormProps {
  initialValues?: Partial<FieldOfficeFormValues> & { id?: string; regionId?: string; tenantId?: string };
  onSuccess?: () => void;
}

export function useFieldOfficeForm({ initialValues, onSuccess }: UseFieldOfficeFormProps = {}) {
  const form = useForm<FieldOfficeFormValues>({
    resolver: zodResolver(fieldOfficeSchema),
    defaultValues: {
      name: initialValues?.name ?? '',
      code: initialValues?.code ?? '',
      category: initialValues?.category === 'Extension' ? 'Extension' : 'Main',
      address: initialValues?.address ?? '',
      contactPhone: initialValues?.contactPhone ?? '',
      contactEmail: initialValues?.contactEmail ?? '',
      officerName: initialValues?.officerName ?? '',
      officerEmail: initialValues?.officerEmail ?? '',
      description: initialValues?.description ?? '',
      isActive: initialValues?.isActive ?? true,
      allowSpectrumInspection: initialValues?.allowSpectrumInspection ?? true,
      allowPermitIssuance: initialValues?.allowPermitIssuance ?? true,
      allowComplaintReception: initialValues?.allowComplaintReception ?? true,
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    if (initialValues?.id) {
      const payload: UpdateFieldOfficePayload = {
        id: initialValues.id,
        tenantId: initialValues.tenantId ?? '00000000-0000-0000-0000-000000000000',
        name: data.name,
        code: data.code,
        category: data.category,
        description: data.description,
        regionId: initialValues.regionId ?? '00000000-0000-0000-0000-000000000000',
        address: data.address ?? '',
        contactPhone: data.contactPhone ?? '',
        contactEmail: data.contactEmail ?? '',
      };
      const [resData, err] = await safeAsync(updateFieldOffice(initialValues.id, payload));
      if (err === null && resData !== null && onSuccess) {
        onSuccess();
      }
      return { data: resData, error: err };
    } else {
      const payload: CreateFieldOfficePayload = {
        tenantId: initialValues?.tenantId ?? '00000000-0000-0000-0000-000000000000',
        name: data.name,
        code: data.code,
        category: data.category,
        description: data.description,
        regionId: initialValues?.regionId ?? '00000000-0000-0000-0000-000000000000',
        address: data.address ?? '',
        contactPhone: data.contactPhone ?? '',
        contactEmail: data.contactEmail ?? '',
      };
      const [resData, err] = await safeAsync(createFieldOffice(payload));
      if (err === null && resData !== null && onSuccess) {
        onSuccess();
      }
      return { data: resData, error: err };
    }
  });

  return {
    form,
    onSubmit,
  };
}
