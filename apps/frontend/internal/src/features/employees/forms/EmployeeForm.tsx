import React from 'react';
import { ScrollView } from 'react-native';
import { useWatch } from 'react-hook-form';
import { useEmployeeForm } from '../hooks/useEmployeeForm';
import { SystemRoleSection } from '../components/SystemRoleSection';
import { BasicInfoSection } from '../components/BasicInfoSection';
import { AssignmentSection } from '../components/AssignmentSection';
import { SignatureSection } from '../components/SignatureSection';
import { modalStyles } from '../styles/employeeModalStyles';

interface EmployeeFormProps {
  formState: ReturnType<typeof useEmployeeForm>;
  isMobile: boolean;
}

export function EmployeeForm({ formState, isMobile }: EmployeeFormProps) {
  const {
    form,
    isRoleDropdownOpen,
    setIsRoleDropdownOpen,
    isRegionDropdownOpen,
    setIsRegionDropdownOpen,
    setIsUploadDialogOpen,
  } = formState;

  const currentRole = useWatch({ control: form.control, name: 'role' });
  const currentRegion = useWatch({ control: form.control, name: 'region' });
  const signatureDisplay = useWatch({
    control: form.control,
    name: 'signatureDisplay',
  });
  const signatureFileName = useWatch({
    control: form.control,
    name: 'signatureFileName',
  });

  return (
    <ScrollView
      style={modalStyles.scrollBody}
      contentContainerStyle={modalStyles.formContent}
      keyboardShouldPersistTaps="handled"
    >
      {/* 1. System Role Section */}
      <SystemRoleSection
        role={currentRole}
        isOpen={isRoleDropdownOpen}
        onToggleOpen={() => {
          setIsRoleDropdownOpen((prev) => !prev);
          setIsRegionDropdownOpen(false);
        }}
        onSelectRole={(r) => {
          form.setValue('role', r, { shouldValidate: true });
          setIsRoleDropdownOpen(false);
        }}
      />

      {/* 2. Basic Info Section */}
      <BasicInfoSection control={form.control} isMobile={isMobile} />

      {/* 3. Assignment & Details Section */}
      <AssignmentSection
        control={form.control}
        regionValue={currentRegion}
        isRegionDropdownOpen={isRegionDropdownOpen}
        onToggleRegionDropdown={() => {
          setIsRegionDropdownOpen((prev) => !prev);
          setIsRoleDropdownOpen(false);
        }}
        onSelectRegion={(reg) => {
          form.setValue('region', reg, { shouldValidate: true });
          setIsRegionDropdownOpen(false);
        }}
        isMobile={isMobile}
      />

      {/* 4. Signature Section */}
      <SignatureSection
        signatureDisplay={signatureDisplay}
        onChangeSignatureDisplay={(val) =>
          form.setValue('signatureDisplay', val, { shouldValidate: true })
        }
        signatureFileName={signatureFileName}
        onOpenUploadDialog={() => setIsUploadDialogOpen(true)}
        onDeleteSignature={() =>
          form.setValue('signatureFileName', null, { shouldValidate: true })
        }
      />
    </ScrollView>
  );
}
