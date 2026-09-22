import React from 'react';
import { ScrollView } from 'react-native';
import { useWatch } from 'react-hook-form';
import { useAdminRoles, useAdminFieldOffices } from '@edge/api';
import { useEmployeeForm } from '../hooks/useEmployeeForm';
import { SystemRoleSection } from '../components/SystemRoleSection';
import { BasicInfoSection } from '../components/BasicInfoSection';
import { AccountProvisioningSection } from '../components/AccountProvisioningSection';
import { AssignmentSection } from '../components/AssignmentSection';
import { SignatureSection } from '../components/SignatureSection';
import { modalStyles } from '../styles/employeeModalStyles';

interface EmployeeFormProps {
  formState: ReturnType<typeof useEmployeeForm>;
  isMobile: boolean;
  tenantId?: string;
  isEditing?: boolean;
}

export function EmployeeForm({ formState, isMobile, tenantId, isEditing = false }: EmployeeFormProps) {
  const {
    form,
    isRoleDropdownOpen,
    setIsRoleDropdownOpen,
    isFieldOfficeDropdownOpen,
    setIsFieldOfficeDropdownOpen,
    setIsUploadDialogOpen,
  } = formState;

  // Real data from live backend endpoints: /api/v2/roles and /api/v2/field-offices
  const { roles, isLoading: isRolesLoading } = useAdminRoles(tenantId);
  const { fieldOffices, isLoading: isOfficesLoading } = useAdminFieldOffices(tenantId);

  const currentRole = useWatch({ control: form.control, name: 'role' });
  const currentFieldOffice = useWatch({ control: form.control, name: 'fieldOffice' });
  const provisioningMethod = useWatch({
    control: form.control,
    name: 'provisioningMethod',
  }) ?? 'email';
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
      {/* 1. System Role Section (Live Backend Roles) */}
      <SystemRoleSection
        role={currentRole}
        roles={roles}
        isLoading={isRolesLoading}
        isOpen={isRoleDropdownOpen}
        onToggleOpen={() => {
          setIsRoleDropdownOpen((prev) => !prev);
          setIsFieldOfficeDropdownOpen(false);
        }}
        onSelectRole={(r) => {
          form.setValue('role', r, { shouldValidate: true });
          setIsRoleDropdownOpen(false);
        }}
      />

      {/* 2. Basic Info Section */}
      <BasicInfoSection control={form.control} isMobile={isMobile} isEditing={isEditing} />

      {/* 3. Account Provisioning & Signup Method (Create mode only) */}
      {!isEditing && (
        <AccountProvisioningSection
          control={form.control}
          isMobile={isMobile}
          provisioningMethod={provisioningMethod}
          onSelectMethod={(method) =>
            form.setValue('provisioningMethod', method, { shouldValidate: true })
          }
        />
      )}

      {/* 4. Assignment & Details Section (Live Backend Field Offices) */}
      <AssignmentSection
        control={form.control}
        fieldOfficeValue={currentFieldOffice}
        fieldOffices={fieldOffices}
        isLoading={isOfficesLoading}
        isFieldOfficeDropdownOpen={isFieldOfficeDropdownOpen}
        onToggleFieldOfficeDropdown={() => {
          setIsFieldOfficeDropdownOpen((prev) => !prev);
          setIsRoleDropdownOpen(false);
        }}
        onSelectFieldOffice={(fo) => {
          form.setValue('fieldOffice', fo, { shouldValidate: true });
          setIsFieldOfficeDropdownOpen(false);
        }}
        isMobile={isMobile}
      />

      {/* 5. Signature Section */}
      <SignatureSection
        signatureDisplay={signatureDisplay ?? 'beside'}
        onChangeSignatureDisplay={(val) =>
          form.setValue('signatureDisplay', val, { shouldValidate: true })
        }
        signatureFileName={signatureFileName ?? null}
        onOpenUploadDialog={() => setIsUploadDialogOpen(true)}
        onDeleteSignature={() =>
          form.setValue('signatureFileName', null, { shouldValidate: true })
        }
      />
    </ScrollView>
  );
}
