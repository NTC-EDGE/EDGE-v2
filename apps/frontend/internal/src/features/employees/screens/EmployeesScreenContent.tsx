import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { DataTable } from '@edge/ui';
import { EmployeesHeader } from '../components/EmployeesHeader';
import { EmployeesStats } from '../components/EmployeesStats';
import { EmployeesToolbar } from '../components/EmployeesToolbar';
import { EmployeesPagination } from '../components/EmployeesPagination';
import { EmployeesDetailsSubView } from '../components/EmployeesDetailsSubView';
import { EmployeesCardGrid } from '../components/EmployeesCardGrid';
import { EmployeesModals } from '../components/EmployeesModals';
import { EmployeesToast } from '../components/EmployeesToast';
import { useEmployeesData } from '../hooks/useEmployeesData';
import { useEmployeeTableColumns } from '../hooks/useEmployeeTableColumns';
import { employeesScreenStyles as styles } from '../styles/employeesScreenStyles';

export function EmployeesScreenContent({
  isWeb,
  isMobileNative,
  isDesktop,
}: {
  isWeb?: boolean;
  isMobileNative?: boolean;
  isDesktop?: boolean;
}) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const data = useEmployeesData();

  const tableColumns = useEmployeeTableColumns({
    activePopoverId: data.activePopoverId,
    setActivePopoverId: data.setActivePopoverId,
    onView: data.handleOpenDetailsPage,
    onEdit: data.handleOpenEditModal,
    onChangeEmail: data.handleOpenChangeEmailModal,
    onDelete: data.handleOpenDeleteModal,
  });

  if (data.subView === 'details' && data.viewingEmployee !== null && data.viewingEmployee !== undefined) {
    return (
      <EmployeesDetailsSubView
        employee={data.viewingEmployee}
        currentTenantId={data.currentTenantId}
        isFormModalOpen={data.isFormModalOpen}
        editingEmployee={data.editingEmployee}
        isChangeEmailModalOpen={data.isChangeEmailModalOpen}
        changingEmailEmployee={data.changingEmailEmployee}
        isDeleteModalOpen={data.isDeleteModalOpen}
        deletingEmployee={data.deletingEmployee}
        onBack={() => {
          data.setSubView('list');
          data.setViewingEmployee(null);
        }}
        onEdit={data.handleOpenEditModal}
        onDelete={data.handleOpenDeleteModal}
        onSaveEmployee={data.handleSaveEmployee}
        onCloseFormModal={() => {
          data.setIsFormModalOpen(false);
          data.setEditingEmployee(null);
        }}
        onChangeEmailSuccess={data.handleChangeEmailSuccess}
        onCloseChangeEmailModal={() => {
          data.setIsChangeEmailModalOpen(false);
          data.setChangingEmailEmployee(null);
        }}
        onConfirmDelete={data.handleConfirmDelete}
        onCloseDeleteModal={() => {
          data.setIsDeleteModalOpen(false);
          data.setDeletingEmployee(null);
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <EmployeesToast
        toastState={data.toastState}
        onClose={() => data.setToastState(null)}
      />

      <View style={styles.topSection}>
        <EmployeesHeader
          isMobile={isMobile}
          viewMode={data.viewMode}
          onSetViewMode={data.setViewMode}
          onOpenAddModal={data.handleOpenAddModal}
        />

        <EmployeesStats isMobile={isMobile} stats={data.stats} />

        <EmployeesToolbar
          isMobile={isMobile}
          searchQuery={data.searchQuery}
          onSearchChange={data.setSearchQuery}
          selectedRole={data.selectedRole}
          onRoleSelect={data.setSelectedRole}
          roleOptions={data.filterRoleOptions}
          isRoleDropdownOpen={data.isRoleDropdownOpen}
          onToggleRoleDropdown={() => data.setIsRoleDropdownOpen((prev) => !prev)}
          onCloseRoleDropdown={() => data.setIsRoleDropdownOpen(false)}
        />
      </View>

      <View style={styles.listArea}>
        {data.viewMode === 'cards' ? (
          <EmployeesCardGrid
            employees={data.paginatedEmployees}
            onView={data.handleOpenDetailsPage}
            onEdit={data.handleOpenEditModal}
            onChangeEmail={data.handleOpenChangeEmailModal}
            onDelete={data.handleOpenDeleteModal}
            onResetFilters={() => {
              data.setSearchQuery('');
              data.setSelectedRole('All');
            }}
          />
        ) : (
          <View style={styles.tableSection}>
            <DataTable
              data={data.filteredEmployees}
              columns={tableColumns}
              searchPlaceholder="Filter table results..."
            />
          </View>
        )}
      </View>

      {data.viewMode === 'cards' && data.filteredEmployees.length > 0 && (
        <EmployeesPagination
          currentPage={data.currentPage}
          totalPages={data.totalPages}
          startIndex={data.startIndex}
          endIndex={data.endIndex}
          totalItems={data.filteredEmployees.length}
          onPrevPage={() => data.setCurrentPage((prev) => Math.max(1, prev - 1))}
          onNextPage={() => data.setCurrentPage((prev) => Math.min(data.totalPages, prev + 1))}
        />
      )}

      <EmployeesModals
        isFormModalOpen={data.isFormModalOpen}
        editingEmployee={data.editingEmployee}
        currentTenantId={data.currentTenantId}
        onCloseFormModal={() => {
          data.setIsFormModalOpen(false);
          data.setEditingEmployee(null);
        }}
        onSaveEmployee={data.handleSaveEmployee}
        isChangeEmailModalOpen={data.isChangeEmailModalOpen}
        changingEmailEmployee={data.changingEmailEmployee}
        onCloseChangeEmailModal={() => {
          data.setIsChangeEmailModalOpen(false);
          data.setChangingEmailEmployee(null);
        }}
        onChangeEmailSuccess={data.handleChangeEmailSuccess}
        isDeleteModalOpen={data.isDeleteModalOpen}
        deletingEmployee={data.deletingEmployee}
        onCloseDeleteModal={() => {
          data.setIsDeleteModalOpen(false);
          data.setDeletingEmployee(null);
        }}
        onConfirmDelete={data.handleConfirmDelete}
      />
    </View>
  );
}
