import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { ColumnDef } from '@tanstack/react-table';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, DataTable, Icon as Lucide, useTheme } from '@edge/ui';
import {
  Employee,
  EmployeeRole,
  EmployeeStatus,
  INITIAL_EMPLOYEES,
  ROLES_LIST,
} from '../data/mockEmployees';
import { EmployeeCard } from '../components/EmployeeCard';
import { EmployeeFormModal } from '../components/EmployeeFormModal';
import { EmployeeDetailsScreen } from '../components/EmployeeDetailsScreen';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

type ViewMode = 'cards' | 'table';
type SubViewMode = 'list' | 'details';

const ITEMS_PER_PAGE = 10;

// Helper Table Action Menu Cell
function TableActionCell({
  employee,
  activePopoverId,
  setActivePopoverId,
  onView,
  onEdit,
  onDelete,
}: {
  employee: Employee;
  activePopoverId: string | null;
  setActivePopoverId: (id: string | null) => void;
  onView: (emp: Employee) => void;
  onEdit: (emp: Employee) => void;
  onDelete: (emp: Employee) => void;
}) {
  const isPopoverOpen = activePopoverId === employee.id;

  const handleAction = (action: 'view' | 'edit' | 'delete') => {
    setActivePopoverId(null);
    if (action === 'view') {
      onView(employee);
    } else if (action === 'edit') {
      onEdit(employee);
    } else if (action === 'delete') {
      onDelete(employee);
    }
  };

  return (
    <View style={styles.tableActionWrapper}>
      {isPopoverOpen && (
        <Pressable style={styles.popoverBackdrop} onPress={() => setActivePopoverId(null)} />
      )}
      <Pressable
        style={[styles.tableThreeDotsBtn, isPopoverOpen && styles.tableThreeDotsBtnActive]}
        onPress={() => setActivePopoverId(isPopoverOpen ? null : employee.id)}
        accessibilityLabel="Actions Menu"
      >
        <Lucide name="more-vertical" size={16} color={COLORS.neutral[700]} />
      </Pressable>

      {isPopoverOpen && (
        <View style={[styles.tablePopoverMenu, SHADOWS.modal]}>
          <Pressable style={styles.popoverItem} onPress={() => handleAction('view')}>
            <Lucide name="eye" size={14} color={COLORS.brand[700]} style={styles.popoverIcon} />
            <Text style={styles.popoverItemText}>View Details</Text>
          </Pressable>

          <Pressable style={styles.popoverItem} onPress={() => handleAction('edit')}>
            <Lucide name="edit-2" size={14} color={COLORS.brand[700]} style={styles.popoverIcon} />
            <Text style={styles.popoverItemText}>Edit Employee</Text>
          </Pressable>

          <View style={styles.popoverDivider} />

          <Pressable style={styles.popoverItemDanger} onPress={() => handleAction('delete')}>
            <Lucide name="trash-2" size={14} color={COLORS.semantic.error} style={styles.popoverIcon} />
            <Text style={styles.popoverItemTextDanger}>Delete Employee</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export function EmployeesScreenContent({
  isWeb,
  isMobileNative,
  isDesktop,
}: {
  isWeb?: boolean;
  isMobileNative?: boolean;
  isDesktop?: boolean;
}) {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // Primary employee dataset in state
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);

  // View state
  const [subView, setSubView] = useState<SubViewMode>('list');
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  // Pagination state (10 items per page)
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Dropdown open states
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);

  // Active popover row id (to close others when one is open)
  const [activePopoverId, setActivePopoverId] = useState<string | null>(null);

  // Notification Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Reset pagination to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedRole]);

  // Filtered employees logic
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Role Filter
      if (selectedRole !== 'All' && emp.role !== selectedRole) {
        return false;
      }
      // Search Query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
        const matchesName = fullName.includes(q);
        const matchesEmail = emp.email.toLowerCase().includes(q);
        const matchesId = emp.id.toLowerCase().includes(q);
        const matchesDept = emp.department.toLowerCase().includes(q);

        return matchesName || matchesEmail || matchesId || matchesDept;
      }
      return true;
    });
  }, [employees, searchQuery, selectedRole]);

  // Pagination calculations (10 entries per page)
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredEmployees.length);

  const paginatedEmployees = useMemo(() => {
    return filteredEmployees.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredEmployees, startIndex]);

  // Executive KPI summary metrics
  const stats = useMemo(() => {
    const total = filteredEmployees.length;
    const departments = new Set(filteredEmployees.map((e) => e.department)).size;
    const evaluators = filteredEmployees.filter((e) => e.role === 'Evaluator').length;
    const admins = filteredEmployees.filter((e) => e.role === 'Admin' || e.role === 'Manager').length;

    return { total, departments, evaluators, admins };
  }, [filteredEmployees]);

  // Handlers for CRUD
  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setIsFormModalOpen(true);
  };

  const handleOpenDetailsPage = (emp: Employee) => {
    setViewingEmployee(emp);
    setSubView('details');
  };

  const handleOpenDeleteModal = (emp: Employee) => {
    setDeletingEmployee(emp);
    setIsDeleteModalOpen(true);
  };

  const handleSaveEmployee = (data: Partial<Employee>) => {
    if (editingEmployee !== null && editingEmployee !== undefined) {
      // Edit mode
      setEmployees((prev) =>
        prev.map((item) => {
          if (item.id === editingEmployee.id) {
            const updated = {
              ...item,
              ...data,
              firstName: data.firstName ?? item.firstName,
              lastName: data.lastName ?? item.lastName,
              middleName: data.middleName ?? item.middleName,
              suffix: data.suffix ?? item.suffix,
              email: data.email ?? item.email,
              phone: data.phone ?? item.phone,
              role: data.role ?? item.role,
              region: data.region ?? item.region,
              department: data.department ?? item.department,
              division: data.division ?? item.division,
              level: data.level ?? item.level,
              title: data.title ?? item.title,
              position: data.position ?? item.position,
              designation: data.designation ?? item.designation,
              signatureDisplay: data.signatureDisplay ?? item.signatureDisplay,
              status: data.status ?? item.status,
              location: data.location ?? item.location,
            };
            if (viewingEmployee !== null && viewingEmployee.id === item.id) {
              setViewingEmployee(updated);
            }
            return updated;
          }
          return item;
        })
      );
      showToast(`Updated employee ${data.firstName} ${data.lastName}`);
    } else {
      // Create mode
      const nextNum = employees.length + 1;
      const formattedNum = nextNum < 10 ? `00${nextNum}` : nextNum < 100 ? `0${nextNum}` : `${nextNum}`;
      const newEmp: Employee = {
        id: `EMP-2026-${formattedNum}`,
        firstName: data.firstName ?? 'New',
        lastName: data.lastName ?? 'User',
        middleName: data.middleName ?? '',
        suffix: data.suffix ?? '',
        email: data.email ?? 'user@example.com',
        phone: data.phone ?? '+63 900 000 0000',
        role: data.role ?? 'Evaluator',
        region: data.region ?? 'Central Office (Headquarters)',
        department: data.department ?? 'Licensing & Registration Division',
        division: data.division ?? 'Licensing & Registration Division',
        level: data.level ?? 'Level II',
        title: data.title ?? 'Evaluator II',
        position: data.position ?? 'Technical Evaluator',
        designation: data.designation ?? '',
        signatureDisplay: data.signatureDisplay ?? 'beside',
        signatureUri: 'mock_signature_new.png',
        status: data.status ?? 'Active',
        avatarColor: COLORS.brand.secondary,
        dateJoined: 'Today',
        location: data.location ?? 'Central Office - Quezon City',
      };
      setEmployees((prev) => [newEmp, ...prev]);
      showToast(`Added new employee ${newEmp.firstName} ${newEmp.lastName}`);
    }

    setIsFormModalOpen(false);
    setEditingEmployee(null);
  };

  const handleConfirmDelete = (emp: Employee) => {
    setEmployees((prev) => prev.filter((item) => item.id !== emp.id));
    showToast(`Deleted employee ${emp.firstName} ${emp.lastName}`);
    setIsDeleteModalOpen(false);
    setDeletingEmployee(null);
    if (subView === 'details' && viewingEmployee !== null && viewingEmployee.id === emp.id) {
      setSubView('list');
      setViewingEmployee(null);
    }
  };

  // TanStack DataTable Columns definition
  const tableColumns: ColumnDef<Employee, unknown>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'Employee ID',
        cell: (info) => <Text style={styles.tableIdText}>{String(info.getValue())}</Text>,
        meta: { flex: 1.2 },
      },
      {
        accessorKey: 'name',
        header: 'Name & Email',
        cell: (info) => {
          const emp = info.row.original;
          return (
            <View style={styles.tableNameCell}>
              <View style={[styles.miniAvatar, { backgroundColor: emp.avatarColor }]}>
                <Text style={styles.miniAvatarText}>
                  {emp.firstName.charAt(0)}
                  {emp.lastName.charAt(0)}
                </Text>
              </View>
              <View>
                <Text style={styles.tableNameText}>
                  {emp.firstName} {emp.lastName}
                </Text>
                <Text style={styles.tableEmailText}>{emp.email}</Text>
              </View>
            </View>
          );
        },
        meta: { flex: 2.4 },
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: (info) => (
          <View style={styles.roleTagTable}>
            <Text style={styles.roleTagTableText}>{String(info.getValue())}</Text>
          </View>
        ),
        meta: { flex: 1.5 },
      },
      {
        accessorKey: 'department',
        header: 'Department',
        cell: (info) => <Text style={styles.tableCellText}>{String(info.getValue())}</Text>,
        meta: { flex: 2.2 },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: (info) => {
          const emp = info.row.original;
          return (
            <TableActionCell
              employee={emp}
              activePopoverId={activePopoverId}
              setActivePopoverId={setActivePopoverId}
              onView={handleOpenDetailsPage}
              onEdit={handleOpenEditModal}
              onDelete={handleOpenDeleteModal}
            />
          );
        },
        meta: { flex: 1.0 },
      },
    ],
    [activePopoverId]
  );

  // If in 'details' subView mode, render EmployeeDetailsScreen
  if (subView === 'details' && viewingEmployee !== null && viewingEmployee !== undefined) {
    return (
      <View style={styles.container}>
        {toastMessage !== null && (
          <View style={[styles.toastContainer, SHADOWS.modal]}>
            <Lucide name="check-circle" size={16} color={COLORS.semantic.success} style={{ marginRight: 8 }} />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        )}

        <EmployeeDetailsScreen
          employee={viewingEmployee}
          onBack={() => {
            setSubView('list');
            setViewingEmployee(null);
          }}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteModal}
        />

        <EmployeeFormModal
          visible={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingEmployee(null);
          }}
          onSave={handleSaveEmployee}
          initialEmployee={editingEmployee}
        />

        <DeleteConfirmModal
          visible={isDeleteModalOpen}
          employee={deletingEmployee}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setDeletingEmployee(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      </View>
    );
  }

  // Main Employee List View
  return (
    <View style={styles.container}>
      {/* Toast Notification */}
      {toastMessage !== null && (
        <View style={[styles.toastContainer, SHADOWS.modal]}>
          <Lucide name="check-circle" size={16} color={COLORS.semantic.success} style={{ marginRight: 8 }} />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* TOP SECTION (Breadcrumb, Header, KPI Stats, Toolbar) */}
      <View style={styles.topSection}>
        {/* Breadcrumb Navigation: ADMIN -> DASHBOARD -> EMPLOYEE ACCOUNTS */}
        <View style={styles.breadcrumb}>
          <Text style={[styles.breadcrumbText, { color: colors.textMuted }]}>Admin</Text>
          <Lucide name="chevron-right" size={12} color={colors.textMuted} style={styles.breadcrumbDivider} />
          <Text style={[styles.breadcrumbText, { color: colors.textMuted }]}>Dashboard</Text>
          <Lucide name="chevron-right" size={12} color={colors.textMuted} style={styles.breadcrumbDivider} />
          <Text style={[styles.breadcrumbText, { color: isDark ? colors.brand[400] : colors.brand[700] }]}>Employee Accounts</Text>
        </View>

        {/* Header Banner Section */}
        <View style={[styles.headerBanner, isMobile && styles.headerBannerMobile]}>
          <View style={styles.headerTitleArea}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Employee Accounts</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
              Manage staff roles, evaluator assignments, and system administrative access.
            </Text>
          </View>

          <View style={[styles.headerActions, isMobile && styles.headerActionsMobile]}>
            {/* View Mode Toggle */}
            <View style={[styles.viewToggleGroup, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: colors.border }]}>
              <Pressable
                style={[styles.toggleBtn, viewMode === 'cards' && [styles.toggleBtnActive, { backgroundColor: isDark ? colors.neutral[700] : colors.cardBg }]]}
                onPress={() => setViewMode('cards')}
              >
                <Lucide
                  name="grid"
                  size={16}
                  color={viewMode === 'cards' ? (isDark ? colors.brand[400] : colors.brand[800]) : colors.textMuted}
                />
              </Pressable>
              <Pressable
                style={[styles.toggleBtn, viewMode === 'table' && [styles.toggleBtnActive, { backgroundColor: isDark ? colors.neutral[700] : colors.cardBg }]]}
                onPress={() => setViewMode('table')}
              >
                <Lucide
                  name="list"
                  size={16}
                  color={viewMode === 'table' ? (isDark ? colors.brand[400] : colors.brand[800]) : colors.textMuted}
                />
              </Pressable>
            </View>

            {/* Add Employee Button */}
            <Pressable style={styles.addEmployeeBtn} onPress={handleOpenAddModal}>
              <Lucide name="plus" size={18} color={COLORS.neutral.white} style={{ marginRight: 6 }} />
              <Text style={styles.addEmployeeBtnText}>Add Employee</Text>
            </Pressable>
          </View>
        </View>

        {/* KPI Stats Strip */}
        <View style={[styles.statsStrip, isMobile && styles.statsStripMobile]}>
          <View style={[styles.statCard, SHADOWS.card, { backgroundColor: isDark ? colors.neutral[900] : colors.cardBg, borderColor: colors.border }]}>
            <View style={[styles.statIconBadge, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
              <Lucide name="users" size={18} color={isDark ? colors.brand[400] : colors.brand[700]} />
            </View>
            <View>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.total}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Staff</Text>
            </View>
          </View>

          <View style={[styles.statCard, SHADOWS.card, { backgroundColor: isDark ? colors.neutral[900] : colors.cardBg, borderColor: colors.border }]}>
            <View style={[styles.statIconBadge, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
              <Lucide name="briefcase" size={18} color={isDark ? colors.brand[400] : colors.brand[700]} />
            </View>
            <View>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.departments}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Departments</Text>
            </View>
          </View>

          <View style={[styles.statCard, SHADOWS.card, { backgroundColor: isDark ? colors.neutral[900] : colors.cardBg, borderColor: colors.border }]}>
            <View style={[styles.statIconBadge, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
              <Lucide name="award" size={18} color={isDark ? colors.brand[400] : colors.brand[700]} />
            </View>
            <View>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.evaluators}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Evaluators</Text>
            </View>
          </View>

          <View style={[styles.statCard, SHADOWS.card, { backgroundColor: isDark ? colors.neutral[900] : colors.cardBg, borderColor: colors.border }]}>
            <View style={[styles.statIconBadge, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : COLORS.semantic.warningBg }]}>
              <Lucide name="shield" size={18} color={isDark ? '#FBBF24' : COLORS.semantic.warning} />
            </View>
            <View>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.admins}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Admins & Managers</Text>
            </View>
          </View>
        </View>

        {/* Toolbar: Search and Dropdown Filter Row */}
        <View style={[styles.toolbarCard, SHADOWS.card, { backgroundColor: isDark ? colors.neutral[900] : colors.cardBg, borderColor: colors.border }]}>
          <View style={[styles.toolbarRow, isMobile && styles.toolbarRowMobile]}>
            {/* Search Bar */}
            <View style={[styles.searchBox, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], borderColor: colors.border }]}>
              <Lucide name="search" size={16} color={colors.textMuted} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search employees by name, email, or department..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
                  <Lucide name="x" size={14} color={colors.textMuted} />
                </Pressable>
              )}
            </View>

            {/* Role Dropdown */}
            <View style={styles.dropdownContainer}>
              <Text style={[styles.dropdownLabel, { color: colors.textMuted }]}>Role:</Text>
              <Pressable
                style={[styles.dropdownTrigger, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], borderColor: colors.border }, isRoleDropdownOpen && { borderColor: isDark ? colors.brand[400] : colors.brand[700] }]}
                onPress={() => {
                  setIsRoleDropdownOpen((prev) => !prev);
                }}
              >
                <Text style={[styles.dropdownTriggerText, { color: colors.text }]} numberOfLines={1}>
                  {selectedRole === 'All' ? 'All Roles' : selectedRole}
                </Text>
                <Lucide
                  name={isRoleDropdownOpen ? 'chevron-up' : 'chevron-down'}
                  size={14}
                  color={colors.textMuted}
                />
              </Pressable>

              {isRoleDropdownOpen && (
                <View style={[styles.dropdownMenu, SHADOWS.modal, { backgroundColor: isDark ? colors.neutral[800] : colors.cardBg, borderColor: colors.border }]}>
                  <Pressable
                    style={[styles.dropdownOption, selectedRole === 'All' && { backgroundColor: isDark ? colors.brand[800] : colors.brand[500] }]}
                    onPress={() => {
                      setSelectedRole('All');
                      setIsRoleDropdownOpen(false);
                    }}
                  >
                    <Text style={[styles.dropdownOptionText, { color: selectedRole === 'All' ? '#FFFFFF' : colors.text }]}>
                      All Roles
                    </Text>
                  </Pressable>
                  {ROLES_LIST.map((r) => (
                    <Pressable
                      key={r}
                      style={[styles.dropdownOption, selectedRole === r && { backgroundColor: isDark ? colors.brand[800] : colors.brand[500] }]}
                      onPress={() => {
                        setSelectedRole(r);
                        setIsRoleDropdownOpen(false);
                      }}
                    >
                      <Text style={[styles.dropdownOptionText, { color: selectedRole === r ? '#FFFFFF' : colors.text }]}>
                        {r}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Reset Filters Option */}
            {(selectedRole !== 'All' || searchQuery.length > 0) && (
              <Pressable
                style={[styles.resetFiltersBtn, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: colors.border }]}
                onPress={() => {
                  setSelectedRole('All');
                  setSearchQuery('');
                  setIsRoleDropdownOpen(false);
                }}
              >
                <Lucide name="rotate-ccw" size={13} color={isDark ? colors.brand[400] : colors.brand[700]} style={{ marginRight: 4 }} />
                <Text style={[styles.resetFiltersText, { color: isDark ? colors.brand[400] : colors.brand[700] }]}>Reset</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {/* MIDDLE LIST SECTION (Renders Card Grid or Data Table) */}
      <View style={styles.listArea}>
        {viewMode === 'cards' ? (
          <View style={styles.cardsGrid}>
            {paginatedEmployees.length > 0 ? (
              paginatedEmployees.map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  onView={handleOpenDetailsPage}
                  onEdit={handleOpenEditModal}
                  onDelete={handleOpenDeleteModal}
                />
              ))
            ) : (
              <View style={[styles.emptyState, { backgroundColor: isDark ? colors.neutral[900] : colors.cardBg, borderColor: colors.border }]}>
                <Lucide name="users" size={40} color={colors.textMuted} style={{ marginBottom: 12 }} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No Employees Found</Text>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  No employee records match your search criteria. Try adjusting your search query or filters.
                </Text>
                <Pressable
                  style={[styles.resetFilterBtn, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: colors.border }]}
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedRole('All');
                  }}
                >
                  <Text style={[styles.resetFilterText, { color: isDark ? colors.brand[400] : colors.brand[700] }]}>Reset Filters</Text>
                </Pressable>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.tableSection}>
            <DataTable
              data={filteredEmployees}
              columns={tableColumns}
              searchPlaceholder="Filter table results..."
            />
          </View>
        )}
      </View>

      {/* BOTTOM FOOTER SECTION (PAGINATION BAR) */}
      {viewMode === 'cards' && filteredEmployees.length > 0 && (
        <View style={[styles.bottomPagination, SHADOWS.card, { backgroundColor: isDark ? colors.neutral[900] : colors.cardBg, borderColor: colors.border }]}>
          <Text style={[styles.paginationText, { color: colors.textMuted }]}>
            Showing <Text style={[styles.boldText, { color: colors.text }]}>{startIndex + 1}</Text> to{' '}
            <Text style={[styles.boldText, { color: colors.text }]}>{endIndex}</Text> of{' '}
            <Text style={[styles.boldText, { color: colors.text }]}>{filteredEmployees.length}</Text> employees (Page{' '}
            {currentPage} of {totalPages})
          </Text>

          <View style={styles.paginationActions}>
            <Pressable
              disabled={currentPage <= 1}
              onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              style={[styles.pageBtn, { backgroundColor: isDark ? colors.neutral[800] : colors.cardBg, borderColor: colors.border }, currentPage <= 1 && styles.pageBtnDisabled]}
            >
              <Lucide
                name="chevron-left"
                size={16}
                color={currentPage > 1 ? colors.text : colors.textMuted}
              />
              <Text style={[styles.pageBtnText, { color: colors.text }, currentPage <= 1 && styles.pageBtnTextDisabled]}>
                Previous
              </Text>
            </Pressable>

            <Pressable
              disabled={currentPage >= totalPages}
              onPress={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              style={[styles.pageBtn, { backgroundColor: isDark ? colors.neutral[800] : colors.cardBg, borderColor: colors.border }, currentPage >= totalPages && styles.pageBtnDisabled]}
            >
              <Text style={[styles.pageBtnText, { color: colors.text }, currentPage >= totalPages && styles.pageBtnTextDisabled]}>
                Next
              </Text>
              <Lucide
                name="chevron-right"
                size={16}
                color={currentPage < totalPages ? colors.text : colors.textMuted}
              />
            </Pressable>
          </View>
        </View>
      )}

      {/* Modals */}
      <EmployeeFormModal
        visible={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingEmployee(null);
        }}
        onSave={handleSaveEmployee}
        initialEmployee={editingEmployee}
      />

      <DeleteConfirmModal
        visible={isDeleteModalOpen}
        employee={deletingEmployee}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingEmployee(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  toastContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: COLORS.neutral.white,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.semantic.success,
    borderRadius: RADIUS.button,
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[12],
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  toastText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[900],
  },
  topSection: {
    width: '100%',
    zIndex: 50,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[12],
  },
  breadcrumbText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  breadcrumbDivider: {
    marginHorizontal: 8,
  },
  breadcrumbActive: {
    color: COLORS.brand[700],
  },
  headerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING[20],
    flexWrap: 'wrap',
    gap: SPACING[16],
  },
  headerBannerMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  headerTitleArea: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 32,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    color: COLORS.neutral[500],
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
  },
  headerActionsMobile: {
    width: '100%',
    justifyContent: 'space-between',
  },
  viewToggleGroup: {
    flexDirection: 'row',
    backgroundColor: COLORS.neutral[100],
    borderRadius: RADIUS.button,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  toggleBtn: {
    width: 36,
    height: 34,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: COLORS.neutral.white,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 2px rgba(15,23,42,.08)',
      },
    }),
  },
  addEmployeeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brand[800],
    paddingHorizontal: SPACING[16],
    paddingVertical: 10,
    borderRadius: RADIUS.button,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
      },
    }),
  },
  addEmployeeBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
  },
  statsStrip: {
    flexDirection: 'row',
    gap: SPACING[16],
    marginBottom: SPACING[20],
    flexWrap: 'wrap',
  },
  statsStripMobile: {
    flexDirection: 'column',
  },
  statCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[16],
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[16],
  },
  statIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  statLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  toolbarCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[16],
    marginBottom: SPACING[16],
    zIndex: 60,
  },
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[16],
    flexWrap: 'wrap',
  },
  toolbarRowMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  searchBox: {
    flex: 1,
    minWidth: 260,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[50],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: RADIUS.input,
    height: 40,
    paddingHorizontal: SPACING[12],
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[900],
    height: '100%',
    padding: 0,
    ...Platform.select({
      web: {
        outlineWidth: 0,
      },
    }),
  },
  clearSearchBtn: {
    padding: 4,
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    gap: 8,
    zIndex: 80,
  },
  dropdownLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[500],
    textTransform: 'uppercase',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.neutral[50],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: RADIUS.button,
    paddingHorizontal: SPACING[12],
    height: 40,
    minWidth: 150,
    gap: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  dropdownTriggerActive: {
    borderColor: COLORS.brand[700],
    backgroundColor: COLORS.neutral.white,
  },
  dropdownTriggerText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[800],
  },
  dropdownMenu: {
    position: 'absolute',
    top: 46,
    left: 45,
    width: 190,
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    maxHeight: 240,
    overflow: 'hidden',
    zIndex: 999,
  },
  dropdownOption: {
    paddingHorizontal: SPACING[16],
    paddingVertical: 10,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  dropdownOptionActive: {
    backgroundColor: COLORS.brand[500],
  },
  dropdownOptionText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[700],
  },
  dropdownOptionTextActive: {
    color: COLORS.neutral.white,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  resetFiltersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[12],
    height: 40,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.neutral[100],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  resetFiltersText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[700],
  },
  listArea: {
    width: '100%',
    zIndex: 10,
  },
  cardsGrid: {
    width: '100%',
  },
  emptyState: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[40],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[800],
    marginBottom: 4,
  },
  emptyText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[500],
    textAlign: 'center',
    maxWidth: 400,
    marginBottom: SPACING[16],
  },
  resetFilterBtn: {
    backgroundColor: COLORS.neutral[100],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    paddingHorizontal: SPACING[16],
    paddingVertical: 8,
    borderRadius: RADIUS.button,
  },
  resetFilterText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[700],
  },
  bottomPagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[12],
    marginTop: SPACING[8],
    marginBottom: SPACING[8],
    flexWrap: 'wrap',
    gap: SPACING[12],
    zIndex: 50,
  },
  paginationText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[600],
  },
  boldText: {
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  paginationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[12],
    paddingVertical: 7,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    backgroundColor: COLORS.neutral.white,
    gap: 4,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  pageBtnDisabled: {
    opacity: 0.5,
    backgroundColor: COLORS.neutral[50],
  },
  pageBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.neutral[700],
  },
  pageBtnTextDisabled: {
    color: COLORS.neutral[400],
  },
  tableSection: {
    width: '100%',
    zIndex: 10,
  },
  tableIdText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[700],
  },
  tableNameCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
  },
  miniAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniAvatarText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
  },
  tableNameText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[900],
  },
  tableEmailText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
  },
  roleTagTable: {
    backgroundColor: COLORS.neutral[100],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  roleTagTableText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[700],
  },
  tableCellText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[700],
  },
  tableActionWrapper: {
    position: 'relative',
    alignItems: 'flex-end',
  },
  tableThreeDotsBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    backgroundColor: COLORS.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableThreeDotsBtnActive: {
    backgroundColor: COLORS.neutral[100],
    borderColor: COLORS.neutral[300],
  },
  tablePopoverMenu: {
    position: 'absolute',
    top: 34,
    right: 0,
    width: 160,
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    paddingVertical: 4,
    zIndex: 300,
  },
  popoverBackdrop: {
    ...StyleSheet.absoluteFill,
    zIndex: 90,
  },
  popoverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[12],
    paddingVertical: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  popoverItemDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[12],
    paddingVertical: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  popoverIcon: {
    marginRight: 8,
  },
  popoverItemText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[700],
  },
  popoverItemTextDanger: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.semantic.error,
  },
  popoverDivider: {
    height: 1,
    backgroundColor: COLORS.neutral[200],
    marginVertical: 4,
  },
});
