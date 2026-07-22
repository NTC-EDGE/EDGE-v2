import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { ColumnDef } from '@tanstack/react-table';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, DataTable, StatusBadge, Icon as Lucide } from '@edge/ui';
import {
  Employee,
  EmployeeRole,
  EmployeeStatus,
  INITIAL_EMPLOYEES,
  ROLES_LIST,
} from '../data/mockEmployees';
import { EmployeeCard } from '../components/EmployeeCard';
import { EmployeeFormModal } from '../components/EmployeeFormModal';
import { EmployeeDetailModal } from '../components/EmployeeDetailModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

type ViewMode = 'cards' | 'table';

export function EmployeesScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // Primary employee dataset in state
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);

  // Notification Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Filtered employees logic
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Role Filter
      if (selectedRole !== 'All' && emp.role !== selectedRole) {
        return false;
      }
      // Status Filter
      if (selectedStatus !== 'All' && emp.status !== selectedStatus) {
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
  }, [employees, searchQuery, selectedRole, selectedStatus]);

  // Executive KPI summary metrics
  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((e) => e.status === 'Active').length;
    const evaluators = employees.filter((e) => e.role === 'Evaluator').length;
    const admins = employees.filter((e) => e.role === 'Admin' || e.role === 'Manager').length;

    return { total, active, evaluators, admins };
  }, [employees]);

  // Handlers for CRUD
  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setIsFormModalOpen(true);
  };

  const handleOpenDetailModal = (emp: Employee) => {
    setViewingEmployee(emp);
    setIsDetailModalOpen(true);
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
            return {
              ...item,
              ...data,
              firstName: data.firstName ?? item.firstName,
              lastName: data.lastName ?? item.lastName,
              email: data.email ?? item.email,
              phone: data.phone ?? item.phone,
              role: (data.role as EmployeeRole) ?? item.role,
              department: data.department ?? item.department,
              status: (data.status as EmployeeStatus) ?? item.status,
              location: data.location ?? item.location,
            };
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
        email: data.email ?? 'user@example.com',
        phone: data.phone ?? '+63 900 000 0000',
        role: (data.role as EmployeeRole) ?? 'Evaluator',
        department: data.department ?? 'Licensing & Registration Division',
        status: (data.status as EmployeeStatus) ?? 'Active',
        avatarColor: '#2563EB',
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
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => <StatusBadge status={String(info.getValue())} />,
        meta: { flex: 1.2 },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: (info) => {
          const emp = info.row.original;
          return (
            <View style={styles.tableActions}>
              <Pressable
                style={styles.tableActionBtn}
                onPress={() => handleOpenDetailModal(emp)}
                accessibilityLabel="View details"
              >
                <Lucide name="eye" size={14} color={COLORS.brand[800]} />
              </Pressable>
              <Pressable
                style={styles.tableActionBtn}
                onPress={() => handleOpenEditModal(emp)}
                accessibilityLabel="Edit employee"
              >
                <Lucide name="edit" size={14} color={COLORS.brand[800]} />
              </Pressable>
              <Pressable
                style={styles.tableActionBtnDanger}
                onPress={() => handleOpenDeleteModal(emp)}
                accessibilityLabel="Delete employee"
              >
                <Lucide name="trash-2" size={14} color={COLORS.semantic.error} />
              </Pressable>
            </View>
          );
        },
        meta: { flex: 1.4 },
      },
    ],
    []
  );

  return (
    <View style={styles.container}>
      {/* Toast Notification */}
      {toastMessage !== null && (
        <View style={[styles.toastContainer, SHADOWS.modal]}>
          <Lucide name="check-circle" size={16} color={COLORS.semantic.success} style={{ marginRight: 8 }} />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Breadcrumb Navigation */}
      <View style={styles.breadcrumb}>
        <Text style={styles.breadcrumbText}>Dashboard</Text>
        <Lucide name="chevron-right" size={12} color={COLORS.neutral[400]} style={styles.breadcrumbDivider} />
        <Text style={styles.breadcrumbText}>Admin</Text>
        <Lucide name="chevron-right" size={12} color={COLORS.neutral[400]} style={styles.breadcrumbDivider} />
        <Text style={[styles.breadcrumbText, styles.breadcrumbActive]}>Employee Accounts</Text>
      </View>

      {/* Header Banner Section */}
      <View style={[styles.headerBanner, isMobile && styles.headerBannerMobile]}>
        <View style={styles.headerTitleArea}>
          <Text style={styles.headerTitle}>Employee Accounts</Text>
          <Text style={styles.headerSubtitle}>
            Manage staff roles, evaluator assignments, and system administrative access.
          </Text>
        </View>

        <View style={[styles.headerActions, isMobile && styles.headerActionsMobile]}>
          {/* View Mode Toggle */}
          <View style={styles.viewToggleGroup}>
            <Pressable
              style={[styles.toggleBtn, viewMode === 'cards' && styles.toggleBtnActive]}
              onPress={() => setViewMode('cards')}
            >
              <Lucide
                name="grid"
                size={16}
                color={viewMode === 'cards' ? COLORS.brand[800] : COLORS.neutral[500]}
              />
            </Pressable>
            <Pressable
              style={[styles.toggleBtn, viewMode === 'table' && styles.toggleBtnActive]}
              onPress={() => setViewMode('table')}
            >
              <Lucide
                name="list"
                size={16}
                color={viewMode === 'table' ? COLORS.brand[800] : COLORS.neutral[500]}
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
        <View style={[styles.statCard, SHADOWS.card]}>
          <View style={[styles.statIconBadge, { backgroundColor: COLORS.neutral[100] }]}>
            <Lucide name="users" size={18} color={COLORS.brand[700]} />
          </View>
          <View>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Staff</Text>
          </View>
        </View>

        <View style={[styles.statCard, SHADOWS.card]}>
          <View style={[styles.statIconBadge, { backgroundColor: COLORS.semantic.successBg }]}>
            <Lucide name="check-circle" size={18} color={COLORS.semantic.success} />
          </View>
          <View>
            <Text style={styles.statValue}>{stats.active}</Text>
            <Text style={styles.statLabel}>Active Employees</Text>
          </View>
        </View>

        <View style={[styles.statCard, SHADOWS.card]}>
          <View style={[styles.statIconBadge, { backgroundColor: COLORS.neutral[100] }]}>
            <Lucide name="award" size={18} color={COLORS.brand[700]} />
          </View>
          <View>
            <Text style={styles.statValue}>{stats.evaluators}</Text>
            <Text style={styles.statLabel}>Evaluators</Text>
          </View>
        </View>

        <View style={[styles.statCard, SHADOWS.card]}>
          <View style={[styles.statIconBadge, { backgroundColor: COLORS.semantic.warningBg }]}>
            <Lucide name="shield" size={18} color={COLORS.semantic.warning} />
          </View>
          <View>
            <Text style={styles.statValue}>{stats.admins}</Text>
            <Text style={styles.statLabel}>Admins & Managers</Text>
          </View>
        </View>
      </View>

      {/* Toolbar: Search and Filter Row */}
      <View style={[styles.toolbarCard, SHADOWS.card]}>
        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Lucide name="search" size={16} color={COLORS.neutral[400]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search employees by name, email, or department..."
            placeholderTextColor={COLORS.neutral[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <Lucide name="x" size={14} color={COLORS.neutral[500]} />
            </Pressable>
          )}
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          {/* Role Filter Chips */}
          <View style={styles.filterChipGroup}>
            <Text style={styles.filterChipLabel}>Role:</Text>
            {['All', ...ROLES_LIST].map((roleName) => (
              <Pressable
                key={roleName}
                onPress={() => setSelectedRole(roleName)}
                style={[
                  styles.filterChip,
                  selectedRole === roleName && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedRole === roleName && styles.filterChipTextActive,
                  ]}
                >
                  {roleName}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Status Filter Chips */}
          <View style={styles.filterChipGroup}>
            <Text style={styles.filterChipLabel}>Status:</Text>
            {['All', 'Active', 'On Leave', 'Inactive'].map((statusName) => (
              <Pressable
                key={statusName}
                onPress={() => setSelectedStatus(statusName)}
                style={[
                  styles.filterChip,
                  selectedStatus === statusName && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedStatus === statusName && styles.filterChipTextActive,
                  ]}
                >
                  {statusName}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Main Content Area: Cards or Table */}
      {viewMode === 'cards' ? (
        <View style={styles.cardsGrid}>
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                onView={handleOpenDetailModal}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Lucide name="users" size={40} color={COLORS.neutral[300]} style={{ marginBottom: 12 }} />
              <Text style={styles.emptyTitle}>No Employees Found</Text>
              <Text style={styles.emptyText}>
                No employee records match your search criteria. Try adjusting your search query or filters.
              </Text>
              <Pressable
                style={styles.resetFilterBtn}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedRole('All');
                  setSelectedStatus('All');
                }}
              >
                <Text style={styles.resetFilterText}>Reset Filters</Text>
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

      <EmployeeDetailModal
        visible={isDetailModalOpen}
        employee={viewingEmployee}
        onClose={() => {
          setIsDetailModalOpen(false);
          setViewingEmployee(null);
        }}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteModal}
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
    zIndex: 999,
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
    marginBottom: SPACING[24],
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
    marginBottom: SPACING[24],
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
    marginBottom: SPACING[20],
    gap: SPACING[12],
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[50],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: RADIUS.input,
    height: 42,
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
  filtersScroll: {
    flexDirection: 'row',
  },
  filterChipGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING[20],
    gap: 6,
  },
  filterChipLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[400],
    textTransform: 'uppercase',
    marginRight: 4,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: COLORS.neutral[100],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  filterChipActive: {
    backgroundColor: COLORS.brand[800],
    borderColor: COLORS.brand[800],
  },
  filterChipText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.neutral[600],
  },
  filterChipTextActive: {
    color: COLORS.neutral.white,
    fontWeight: TYPOGRAPHY.weights.bold,
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
  tableSection: {
    width: '100%',
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
  tableActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tableActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    backgroundColor: COLORS.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableActionBtnDanger: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.semantic.errorBorder,
    backgroundColor: COLORS.semantic.errorBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
