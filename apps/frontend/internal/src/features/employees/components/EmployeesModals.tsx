import React from 'react';
import { Employee } from '../data/mockEmployees';
import { EmployeeFormModal } from './EmployeeFormModal';
import { ChangeEmployeeEmailModal } from './ChangeEmployeeEmailModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface EmployeesModalsProps {
  isFormModalOpen: boolean;
  editingEmployee: Employee | null;
  currentTenantId?: string;
  onCloseFormModal: () => void;
  onSaveEmployee: (data: Partial<Employee>) => Promise<void>;
  isChangeEmailModalOpen: boolean;
  changingEmailEmployee: Employee | null;
  onCloseChangeEmailModal: () => void;
  onChangeEmailSuccess: (updatedEmp: Employee) => void;
  isDeleteModalOpen: boolean;
  deletingEmployee: Employee | null;
  onCloseDeleteModal: () => void;
  onConfirmDelete: (emp: Employee) => Promise<void>;
}

export function EmployeesModals({
  isFormModalOpen,
  editingEmployee,
  currentTenantId,
  onCloseFormModal,
  onSaveEmployee,
  isChangeEmailModalOpen,
  changingEmailEmployee,
  onCloseChangeEmailModal,
  onChangeEmailSuccess,
  isDeleteModalOpen,
  deletingEmployee,
  onCloseDeleteModal,
  onConfirmDelete,
}: EmployeesModalsProps) {
  return (
    <>
      <EmployeeFormModal
        visible={isFormModalOpen}
        onClose={onCloseFormModal}
        onSave={onSaveEmployee}
        initialEmployee={editingEmployee}
        tenantId={currentTenantId}
      />

      <ChangeEmployeeEmailModal
        visible={isChangeEmailModalOpen}
        employee={changingEmailEmployee}
        onClose={onCloseChangeEmailModal}
        onSuccess={onChangeEmailSuccess}
      />

      <DeleteConfirmModal
        visible={isDeleteModalOpen}
        employee={deletingEmployee}
        onClose={onCloseDeleteModal}
        onConfirm={onConfirmDelete}
      />
    </>
  );
}
