import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScheduleItemDto } from '@edge/api';
import {
  scheduleFormSchema,
  ScheduleFormData,
} from '../schemas/scheduleSchema';

interface UseScheduleFormParams {
  visible: boolean;
  initialSchedule?: ScheduleItemDto | null;
  defaultTenantId?: string;
  onSave: (data: ScheduleFormData) => Promise<void> | void;
}

export function useScheduleForm({
  visible,
  initialSchedule = null,
  defaultTenantId = '',
  onSave,
}: UseScheduleFormParams) {
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: ScheduleFormData = {
    serviceId: '',
    tenantId: defaultTenantId,
    venue: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    startApplication: new Date().toISOString().slice(0, 10),
    endApplication: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
    maximumSlots: '50',
    remarks: '',
    isPublished: false,
  };

  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  useEffect(() => {
    if (visible && initialSchedule !== null && initialSchedule !== undefined) {
      const formatDateForInput = (isoDate?: string | null): string => {
        if (typeof isoDate !== 'string' || isoDate.length === 0) {
          return '';
        }
        try {
          const d = new Date(isoDate);
          if (isNaN(d.getTime())) return '';
          return d.toISOString().slice(0, 10);
        } catch {
          return '';
        }
      };

      form.reset({
        serviceId: initialSchedule.serviceId ?? '',
        tenantId: initialSchedule.tenantId ?? defaultTenantId,
        venue: initialSchedule.venue ?? '',
        startDate: formatDateForInput(initialSchedule.startDate),
        endDate: formatDateForInput(initialSchedule.endDate),
        startApplication: formatDateForInput(initialSchedule.startApplication),
        endApplication: formatDateForInput(initialSchedule.endApplication),
        maximumSlots:
          typeof initialSchedule.maximumSlots === 'number'
            ? String(initialSchedule.maximumSlots)
            : '',
        remarks: initialSchedule.remarks ?? '',
        isPublished: initialSchedule.isPublished ?? false,
      });
    } else if (visible) {
      form.reset({
        ...defaultValues,
        tenantId: defaultTenantId,
      });
    }
    setErrorMessage(null);
    setIsServiceDropdownOpen(false);
  }, [visible, initialSchedule, defaultTenantId]);

  const handleFormSubmit: SubmitHandler<ScheduleFormData> = async (data) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await onSave(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else if (typeof err === 'string') {
        setErrorMessage(err);
      } else {
        setErrorMessage('An unexpected error occurred while saving schedule.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isServiceDropdownOpen,
    setIsServiceDropdownOpen,
    errorMessage,
    setErrorMessage,
    isSubmitting,
    onSubmit: form.handleSubmit(handleFormSubmit),
  };
}
