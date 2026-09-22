import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userService } from '@edge/api';
import { changeEmailSchema, ChangeEmailFormData } from '../schemas/changeEmailSchema';
import { Employee } from '../data/mockEmployees';

interface UseChangeEmailFormParams {
  visible: boolean;
  employee: Employee | null;
  onSuccess: (updatedEmployee: Employee) => void;
  onClose: () => void;
}

export function useChangeEmailForm({
  visible,
  employee,
  onSuccess,
  onClose,
}: UseChangeEmailFormParams) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<ChangeEmailFormData>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      newEmail: '',
      confirmEmail: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (visible) {
      form.reset({
        newEmail: '',
        confirmEmail: '',
      });
      setErrorMessage(null);
    }
  }, [visible, form]);

  const onSubmit = form.handleSubmit(async (data: ChangeEmailFormData) => {
    if (employee === null || employee === undefined) {
      return;
    }

    setErrorMessage(null);

    const [result, error] = await userService.changeUserEmail(employee.id, data.newEmail);

    if (error !== null || result === null || result === undefined) {
      const msg = typeof error === 'string' ? error : 'Failed to change login email. Please try again.';
      setErrorMessage(msg);
      return;
    }

    onSuccess({
      ...employee,
      email: result.email ?? data.newEmail,
    });
    onClose();
  });

  return {
    form,
    errorMessage,
    setErrorMessage,
    onSubmit,
    isSubmitting: form.formState.isSubmitting,
  };
}
