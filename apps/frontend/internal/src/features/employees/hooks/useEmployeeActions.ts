import { userService, Role, FieldOffice } from '@edge/api';
import { Employee } from '../data/mockEmployees';

interface UseEmployeeActionsParams {
  currentTenantId?: string;
  liveRoles: Role[];
  liveFieldOffices: FieldOffice[];
  refetch: () => Promise<unknown>;
  showToast: (msg: string, variant?: 'success' | 'error' | 'info') => void;
  subView: 'list' | 'details';
  viewingEmployee: Employee | null;
  setViewingEmployee: (emp: Employee | null) => void;
  setSubView: (view: 'list' | 'details') => void;
  setIsFormModalOpen: (open: boolean) => void;
  setEditingEmployee: (emp: Employee | null) => void;
  setIsDeleteModalOpen: (open: boolean) => void;
  setDeletingEmployee: (emp: Employee | null) => void;
  setIsChangeEmailModalOpen: (open: boolean) => void;
  setChangingEmailEmployee: (emp: Employee | null) => void;
}

export function useEmployeeActions({
  currentTenantId,
  liveRoles,
  liveFieldOffices,
  refetch,
  showToast,
  subView,
  viewingEmployee,
  setViewingEmployee,
  setSubView,
  setIsFormModalOpen,
  setEditingEmployee,
  setIsDeleteModalOpen,
  setDeletingEmployee,
  setIsChangeEmailModalOpen,
  setChangingEmailEmployee,
}: UseEmployeeActionsParams) {
  const handleChangeEmailSuccess = async (updatedEmp: Employee) => {
    await refetch();
    showToast(`Successfully updated login email for ${updatedEmp.firstName} ${updatedEmp.lastName}`, 'success');
    if (viewingEmployee !== null && viewingEmployee.id === updatedEmp.id) {
      setViewingEmployee({ ...viewingEmployee, email: updatedEmp.email });
    }
    setIsChangeEmailModalOpen(false);
    setChangingEmailEmployee(null);
  };

  const handleSaveEmployee = async (
    data: Partial<Employee>,
    editingEmployee: Employee | null
  ) => {
    if (editingEmployee !== null && editingEmployee !== undefined) {
      const selectedRoleName = (data.role ?? '').trim();
      const matchedRole = liveRoles.find(
        (r) =>
          r.name.toLowerCase() === selectedRoleName.toLowerCase() ||
          r.key.toLowerCase() === selectedRoleName.toLowerCase()
      );
      const roleKey = matchedRole?.key || (selectedRoleName.length > 0 ? selectedRoleName.toLowerCase().replace(/\s+/g, '-') : undefined);

      const matchedFieldOffice = liveFieldOffices.find(
        (f) => f.name.toLowerCase() === (data.fieldOffice ?? '').trim().toLowerCase()
      );

      const [res, err] = await userService.updateUser(editingEmployee.id, {
        id: editingEmployee.id,
        email: data.email ?? editingEmployee.email,
        firstName: data.firstName ?? editingEmployee.firstName,
        lastName: data.lastName ?? editingEmployee.lastName,
        middleName: data.middleName ?? editingEmployee.middleName,
        suffix: data.suffix ?? editingEmployee.suffix,
        contactNumber: data.phone ?? editingEmployee.phone,
        roleKey,
        tenantId: currentTenantId,
        fieldOfficeId: matchedFieldOffice?.id,
        jobTitle: data.title ?? editingEmployee.title,
        level: data.level ?? editingEmployee.level,
        division: data.division ?? editingEmployee.division,
        position: data.position ?? editingEmployee.position,
        designation: data.designation ?? editingEmployee.designation,
        eSignature: data.signatureUri ?? editingEmployee.signatureUri,
      });

      if (err !== null || res === null || res === undefined) {
        const errorMsg = typeof err === 'string' ? err : 'Failed to update employee account.';
        throw new Error(errorMsg);
      }

      await refetch();
      const updatedName = `${res.firstName || data.firstName || editingEmployee.firstName} ${res.lastName || data.lastName || editingEmployee.lastName}`.trim();
      showToast(`Successfully updated employee ${updatedName}`, 'success');
      if (viewingEmployee !== null && viewingEmployee.id === editingEmployee.id) {
        setViewingEmployee({
          ...viewingEmployee,
          ...data,
          firstName: data.firstName ?? viewingEmployee.firstName,
          lastName: data.lastName ?? viewingEmployee.lastName,
          role: data.role ?? viewingEmployee.role,
          fieldOffice: data.fieldOffice ?? viewingEmployee.fieldOffice,
        });
      }
      setIsFormModalOpen(false);
      setEditingEmployee(null);
    } else {
      const selectedRoleName = (data.role ?? '').trim();
      const matchedRole = liveRoles.find(
        (r) =>
          r.name.toLowerCase() === selectedRoleName.toLowerCase() ||
          r.key.toLowerCase() === selectedRoleName.toLowerCase()
      );
      const roleKey = matchedRole?.key || selectedRoleName.toLowerCase().replace(/\s+/g, '-');
      const redirectUrl = typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'http://localhost:8081';

      const isEmailInvitation = data.provisioningMethod !== 'manual';
      const manualPassword = data.password && data.password.trim().length > 0 ? data.password.trim() : undefined;

      const [res, err] = await userService.createUser({
        email: data.email ?? '',
        firstName: data.firstName ?? '',
        lastName: data.lastName ?? '',
        middleName: data.middleName,
        suffix: data.suffix,
        contactNumber: data.phone,
        password: !isEmailInvitation ? manualPassword : undefined,
        sendInvitation: isEmailInvitation,
        roleKey,
        tenantId: currentTenantId,
        jobTitle: data.title,
        level: data.level,
        division: data.division,
        position: data.position,
        designation: data.designation,
        eSignature: data.signatureUri,
        redirectUrl,
      });

      if (err !== null || res === null || res === undefined) {
        const errorMsg = typeof err === 'string' ? err : 'Failed to create employee account.';
        throw new Error(errorMsg);
      }

      await refetch();
      const employeeName = `${res?.firstName ?? data.firstName ?? ''} ${res?.lastName ?? data.lastName ?? ''}`.trim();
      const successMessage = isEmailInvitation
        ? `Account created for ${employeeName}. An invitation email was sent to ${data.email ?? 'the employee'}.`
        : `Account manually created for ${employeeName}.`;
      showToast(successMessage, 'success');
      setIsFormModalOpen(false);
      setEditingEmployee(null);
    }
  };

  const handleConfirmDelete = async (emp: Employee) => {
    const [_, err] = await userService.deleteUser(emp.id);
    if (err !== null) {
      const errorMsg = typeof err === 'string' ? err : 'Failed to delete employee';
      showToast(errorMsg, 'error');
    } else {
      showToast(`Successfully deleted employee ${emp.firstName} ${emp.lastName}`, 'success');
    }
    await refetch();
    setIsDeleteModalOpen(false);
    setDeletingEmployee(null);
    if (subView === 'details' && viewingEmployee !== null && viewingEmployee.id === emp.id) {
      setViewingEmployee(null);
      setSubView('list');
    }
  };

  return {
    handleSaveEmployee,
    handleConfirmDelete,
    handleChangeEmailSuccess,
  };
}
