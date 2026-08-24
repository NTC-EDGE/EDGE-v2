import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Employee } from '../data/mockEmployees';
import {
  employeeFormSchema,
  EmployeeFormData,
} from '../schemas/employeeSchema';

interface UseEmployeeFormParams {
  visible: boolean;
  initialEmployee?: Employee | null;
  onSave: (employeeData: Partial<Employee>) => Promise<void> | void;
}

export function useEmployeeForm({
  visible,
  initialEmployee = null,
  onSave,
}: UseEmployeeFormParams) {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isFieldOfficeDropdownOpen, setIsFieldOfficeDropdownOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const defaultValues: EmployeeFormData = {
    role: '',
    lastName: '',
    firstName: '',
    middleName: '',
    suffix: '',
    email: '',
    fieldOffice: '',
    region: '',
    level: '',
    title: '',
    division: '',
    position: '',
    designation: '',
    signatureDisplay: 'beside',
    signatureFileName: null,
  };

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  useEffect(() => {
    if (initialEmployee !== null && initialEmployee !== undefined) {
      form.reset({
        role: initialEmployee.role ?? '',
        lastName: initialEmployee.lastName ?? '',
        firstName: initialEmployee.firstName ?? '',
        middleName: initialEmployee.middleName ?? '',
        suffix: initialEmployee.suffix ?? '',
        email: initialEmployee.email ?? '',
        fieldOffice: initialEmployee.fieldOffice ?? '',
        region: initialEmployee.region ?? '',
        level: initialEmployee.level ?? '',
        title: initialEmployee.title ?? '',
        division: initialEmployee.division ?? initialEmployee.department ?? '',
        position: initialEmployee.position ?? '',
        designation: initialEmployee.designation ?? '',
        signatureDisplay: initialEmployee.signatureDisplay ?? 'beside',
        signatureFileName: initialEmployee.signatureUri
          ? 'Uploaded_Signature.png'
          : null,
      });
    } else {
      form.reset(defaultValues);
    }
    setIsRoleDropdownOpen(false);
    setIsFieldOfficeDropdownOpen(false);
  }, [initialEmployee, visible]);

  const handleNativeFileUpload = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/png, image/jpeg, image/svg+xml';
      input.onchange = () => {
        const file = input.files?.[0];
        if (file) {
          form.setValue('signatureFileName', file.name, { shouldValidate: true });
          setIsUploadDialogOpen(false);
        }
      };
      input.click();
    } else {
      form.setValue(
        'signatureFileName',
        'Uploaded_Signature_' + Math.floor(Math.random() * 1000) + '.png',
        { shouldValidate: true }
      );
      setIsUploadDialogOpen(false);
    }
  };

  const handleCaptureSignature = () => {
    form.setValue(
      'signatureFileName',
      'Captured_Signature_' + Math.floor(Math.random() * 1000) + '.png',
      { shouldValidate: true }
    );
    setIsCameraActive(false);
  };

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setErrorMessage(null);
    }
  }, [visible]);

  const handleFormSubmit: SubmitHandler<EmployeeFormData> = async (data) => {
    setErrorMessage(null);
    try {
      await onSave({
        role: data.role,
        lastName: (data.lastName ?? '').trim(),
        firstName: (data.firstName ?? '').trim(),
        middleName: (data.middleName ?? '').trim(),
        suffix: (data.suffix ?? '').trim(),
        email: (data.email ?? '').trim().toLowerCase(),
        fieldOffice: (data.fieldOffice ?? '').trim(),
        region: (data.region ?? '').trim(),
        level: (data.level ?? '').trim(),
        title: (data.title ?? '').trim(),
        division: (data.division ?? '').trim(),
        department: (data.division ?? '').trim(),
        position: (data.position ?? '').trim(),
        designation: (data.designation ?? '').trim(),
        signatureDisplay: data.signatureDisplay,
        signatureUri:
          data.signatureFileName !== null && data.signatureFileName !== undefined
            ? 'mock_signature.png'
            : undefined,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else if (typeof err === 'string') {
        setErrorMessage(err);
      }
    }
  };

  return {
    form,
    isRoleDropdownOpen,
    setIsRoleDropdownOpen,
    isFieldOfficeDropdownOpen,
    setIsFieldOfficeDropdownOpen,
    isCameraActive,
    setIsCameraActive,
    isUploadDialogOpen,
    setIsUploadDialogOpen,
    errorMessage,
    setErrorMessage,
    handleNativeFileUpload,
    handleCaptureSignature,
    onSubmit: form.handleSubmit(handleFormSubmit),
  };
}
