import { useState, useMemo, useEffect } from 'react';
import { useTenantMembers, useAdminRoles, useAdminFieldOffices } from '@edge/api';
import { useAuthContext } from '../../auth/context/AuthContext';
import { Employee } from '../types/employeeTypes';
import { mapTenantMemberToEmployee } from '../utils/employeeMappers';
import { useEmployeeActions } from './useEmployeeActions';

const ITEMS_PER_PAGE = 10;

export function useEmployeesData() {
  const { user } = useAuthContext();
  const currentTenantId = user?.tenantId;

  // Live tenant members dataset from API
  const { members, isLoading, refetch } = useTenantMembers(currentTenantId);
  const { roles: liveRoles } = useAdminRoles();
  const { fieldOffices: liveFieldOffices } = useAdminFieldOffices(currentTenantId);

  const employees = useMemo<Employee[]>(() => {
    return members.map(mapTenantMemberToEmployee);
  }, [members]);

  const filterRoleOptions = useMemo(() => {
    if (liveRoles && liveRoles.length > 0) {
      return Array.from(new Set(liveRoles.map((r) => r.name)));
    }
    return Array.from(new Set(employees.map((e) => e.role)));
  }, [liveRoles, employees]);

  // View state
  const [subView, setSubView] = useState<'list' | 'details'>('list');
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Pagination state (10 items per page)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);

  const [isChangeEmailModalOpen, setIsChangeEmailModalOpen] = useState(false);
  const [changingEmailEmployee, setChangingEmailEmployee] = useState<Employee | null>(null);

  const [activePopoverId, setActivePopoverId] = useState<string | null>(null);

  // Toast notification state
  const [toastState, setToastState] = useState<{
    message: string;
    variant: 'success' | 'error' | 'info';
  } | null>(null);

  const showToast = (msg: string, variant: 'success' | 'error' | 'info' = 'success') => {
    setToastState({ message: msg, variant });
  };

  useEffect(() => {
    if (toastState !== null) {
      const timer = setTimeout(() => {
        setToastState(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastState]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedRole]);

  // Filtered employees logic
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (selectedRole !== 'All' && emp.role !== selectedRole) {
        return false;
      }
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
        return (
          fullName.includes(q) ||
          emp.email.toLowerCase().includes(q) ||
          emp.id.toLowerCase().includes(q) ||
          emp.department.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [employees, searchQuery, selectedRole]);

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredEmployees.length);

  const paginatedEmployees = useMemo(() => {
    return filteredEmployees.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredEmployees, startIndex]);

  const stats = useMemo(() => {
    const total = filteredEmployees.length;
    const departments = new Set(filteredEmployees.map((e) => e.department)).size;
    const evaluators = filteredEmployees.filter((e) => e.role === 'Evaluator').length;
    const admins = filteredEmployees.filter((e) => e.role === 'Admin' || e.role === 'Manager').length;

    return { total, departments, evaluators, admins };
  }, [filteredEmployees]);

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setIsFormModalOpen(true);
  };

  const handleOpenChangeEmailModal = (emp: Employee) => {
    setChangingEmailEmployee(emp);
    setIsChangeEmailModalOpen(true);
  };

  const handleOpenDetailsPage = (emp: Employee) => {
    setViewingEmployee(emp);
    setSubView('details');
  };

  const handleOpenDeleteModal = (emp: Employee) => {
    setDeletingEmployee(emp);
    setIsDeleteModalOpen(true);
  };

  const {
    handleSaveEmployee: executeSaveEmployee,
    handleConfirmDelete,
    handleChangeEmailSuccess,
  } = useEmployeeActions({
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
  });

  const handleSaveEmployee = (formData: Partial<Employee>) => {
    return executeSaveEmployee(formData, editingEmployee);
  };

  return {
    currentTenantId,
    isLoading,
    subView,
    setSubView,
    viewingEmployee,
    setViewingEmployee,
    searchQuery,
    setSearchQuery,
    selectedRole,
    setSelectedRole,
    filterRoleOptions,
    viewMode,
    setViewMode,
    currentPage,
    setCurrentPage,
    totalPages,
    startIndex,
    endIndex,
    filteredEmployees,
    paginatedEmployees,
    stats,
    isRoleDropdownOpen,
    setIsRoleDropdownOpen,
    activePopoverId,
    setActivePopoverId,
    isFormModalOpen,
    setIsFormModalOpen,
    editingEmployee,
    setEditingEmployee,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    deletingEmployee,
    setDeletingEmployee,
    isChangeEmailModalOpen,
    setIsChangeEmailModalOpen,
    changingEmailEmployee,
    setChangingEmailEmployee,
    toastState,
    setToastState,
    handleOpenAddModal,
    handleOpenEditModal,
    handleOpenChangeEmailModal,
    handleChangeEmailSuccess,
    handleOpenDetailsPage,
    handleOpenDeleteModal,
    handleSaveEmployee,
    handleConfirmDelete,
  };
}
