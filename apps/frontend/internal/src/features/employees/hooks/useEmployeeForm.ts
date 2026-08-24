import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Employee,
  REGIONS_LIST,
  DEPARTMENTS,
} from '../data/mockEmployees';
import {
  employeeFormSchema,
  EmployeeFormData,
} from '../schemas/employeeSchema';

interface UseEmployeeFormParams {
  visible: boolean;
  initialEmployee?: Employee | null;
  onSave: (employeeData: Partial<Employee>) => void;
}

export function useEmployeeForm({
  visible,
  initialEmployee = null,
  onSave,
}: UseEmployeeFormParams) {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const defaultValues: EmployeeFormData = {
    role: 'Evaluator',
    lastName: '',
    firstName: '',
    middleName: '',
    suffix: '',
    email: '',
    region: REGIONS_LIST[0] || 'Central Office (Headquarters)',
    level: '',
    title: '',
    division: DEPARTMENTS[0] || 'Licensing & Registration Division',
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
        role: initialEmployee.role,
        lastName: initialEmployee.lastName,
        firstName: initialEmployee.firstName,
        middleName: initialEmployee.middleName ?? '',
        suffix: initialEmployee.suffix ?? '',
        email: initialEmployee.email,
        region: initialEmployee.region ?? (REGIONS_LIST[0] || ''),
        level: initialEmployee.level ?? 'Level II',
        title: initialEmployee.title ?? 'Evaluator II',
        division:
          initialEmployee.division ??
          initialEmployee.department ??
          (DEPARTMENTS[0] || ''),
        position: initialEmployee.position ?? 'Technical Evaluator',
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
    setIsRegionDropdownOpen(false);
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

  const handleFormSubmit: SubmitHandler<EmployeeFormData> = (data) => {
    onSave({
      role: data.role,
      lastName: data.lastName.trim(),
      firstName: data.firstName.trim(),
      middleName: data.middleName.trim(),
      suffix: data.suffix.trim(),
      email: data.email.trim().toLowerCase(),
      region: data.region.trim(),
      level: data.level.trim(),
      title: data.title.trim(),
      division: data.division.trim(),
      department: data.division.trim(),
      position: data.position.trim(),
      designation: data.designation.trim(),
      signatureDisplay: data.signatureDisplay,
      signatureUri:
        data.signatureFileName !== null ? 'mock_signature.png' : undefined,
    });
  };

  return {
    form,
    isRoleDropdownOpen,
    setIsRoleDropdownOpen,
    isRegionDropdownOpen,
    setIsRegionDropdownOpen,
    isCameraActive,
    setIsCameraActive,
    isUploadDialogOpen,
    setIsUploadDialogOpen,
    handleNativeFileUpload,
    handleCaptureSignature,
    onSubmit: form.handleSubmit(handleFormSubmit),
  };
}
