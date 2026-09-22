import React from 'react';
import { View } from 'react-native';
import { Employee } from '../data/mockEmployees';
import { EmployeeDetailsScreen } from './EmployeeDetailsScreen';
import { EmployeeFormModal } from './EmployeeFormModal';
import { ChangeEmployeeEmailModal } from './ChangeEmployeeEmailModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { employeesScreenStyles as styles } from '../styles/employeesScreenStyles';

interface EmployeesDetailsSubViewProps {
  employee: Employee;
  currentTenantId?: string;
  isFormModalOpen: boolean;
  editingEmployee: Employee | null;
  isChangeEmailModalOpen: boolean;
  changingEmailEmployee: Employee | null;
  isDeleteModalOpen: boolean;
  deletingEmployee: Employee | null;
  onBack: () => void;
  onEdit: (emp: Employee) => void;
  onDelete: (emp: Employee) => void;
  onSaveEmployee: (data: Partial<Employee>) => Promise<void>;
  onCloseFormModal: () => void;
  onChangeEmailSuccess: (updatedEmp: Employee) => void;
  onCloseChangeEmailModal: () => void;
  onConfirmDelete: (emp: Employee) => Promise<void>;
  onCloseDeleteModal: () => void;
}

export function EmployeesDetailsSubView({
  employee,
  currentTenantId,
  isFormModalOpen,
  editingEmployee,
  isChangeEmailModalOpen,
  changingEmailEmployee,
  isDeleteModalOpen,
  deletingEmployee,
  onBack,
  onEdit,
  onDelete,
  onSaveEmployee,
  onCloseFormModal,
  onChangeEmailSuccess,
  onCloseChangeEmailModal,
  onConfirmDelete,
  onCloseDeleteModal,
}: EmployeesDetailsSubViewProps) {
  return (
    <View style={styles.container}>
      <EmployeeDetailsScreen
        employee={employee}
        onBack={onBack}
        onEdit={onEdit}
        onDelete={onDelete}
      />

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
    </View>
  );
}
