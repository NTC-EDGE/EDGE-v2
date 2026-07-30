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
  User,
  INITIAL_USERS,
  ACCOUNT_TYPES,
  REGIONS_LIST,
} from '../data/mockUsers';
import { UserCard } from '../components/UserCard';
import { UserFormModal } from '../components/UserFormModal';
import { UserDetailsScreen } from '../components/UserDetailsScreen';
import { DeleteUserConfirmModal } from '../components/DeleteUserConfirmModal';

type ViewMode = 'table' | 'cards';
type SubViewMode = 'list' | 'details';

const ITEMS_PER_PAGE = 10;

// Helper Table Action Menu Cell
function TableActionCell({
  user,
  activePopoverId,
  setActivePopoverId,
  onEdit,
  onDelete,
}: {
  user: User;
  activePopoverId: string | null;
  setActivePopoverId: (id: string | null) => void;
  onEdit: (u: User) => void;
  onDelete: (u: User) => void;
}) {
  const isPopoverOpen = activePopoverId === user.id;

  const handleAction = (action: 'edit' | 'delete') => {
    setActivePopoverId(null);
    if (action === 'edit') {
      onEdit(user);
    } else if (action === 'delete') {
      onDelete(user);
    }
  };

  return (
    <View style={styles.tableActionWrapper}>
      {isPopoverOpen && (
        <Pressable style={styles.popoverBackdrop} onPress={() => setActivePopoverId(null)} />
      )}
      <Pressable
        style={[styles.tableThreeDotsBtn, isPopoverOpen && styles.tableThreeDotsBtnActive]}
        onPress={() => setActivePopoverId(isPopoverOpen ? null : user.id)}
        accessibilityLabel="Actions Menu"
      >
        <Lucide name="more-vertical" size={16} color={COLORS.neutral[700]} />
      </Pressable>

      {isPopoverOpen && (
        <View style={[styles.tablePopoverMenu, SHADOWS.modal]}>
          <Pressable style={styles.popoverItem} onPress={() => handleAction('edit')}>
            <Lucide name="edit-2" size={14} color={COLORS.brand[700]} style={styles.popoverIcon} />
            <Text style={styles.popoverItemText}>Edit User</Text>
          </Pressable>

          <View style={styles.popoverDivider} />

          <Pressable style={styles.popoverItemDanger} onPress={() => handleAction('delete')}>
            <Lucide name="trash-2" size={14} color={COLORS.semantic.error} style={styles.popoverIcon} />
            <Text style={styles.popoverItemTextDanger}>Delete User</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export function UsersScreenContent({
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

  // Primary users dataset in state
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);

  // View state
  const [subView, setSubView] = useState<SubViewMode>('list');
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccountType, setSelectedAccountType] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Pagination state (10 items per page)
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Dropdown open states
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active popover row id (to close others when one is open)
  const [activePopoverId, setActivePopoverId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Reset pagination to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedAccountType, selectedRegion]);

  // Filtered users logic
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Account Type Filter
      if (selectedAccountType !== 'All' && user.accountType !== selectedAccountType) {
        return false;
      }
      // Region Filter
      if (selectedRegion !== 'All' && user.region !== selectedRegion) {
        return false;
      }
      // Search Query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = user.name.toLowerCase().includes(q);
        const matchesEmail = user.email.toLowerCase().includes(q);
        const matchesId = user.id.toLowerCase().includes(q);
        const matchesRegion = user.region.toLowerCase().includes(q);

        return matchesName || matchesEmail || matchesId || matchesRegion;
      }
      return true;
    });
  }, [users, searchQuery, selectedAccountType, selectedRegion]);

  // Pagination calculations (10 entries per page)
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length);

  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredUsers, startIndex]);

  // Executive KPI summary metrics
  const stats = useMemo(() => {
    const total = users.length;
    const individual = users.filter((u) => u.accountType === 'Individual').length;
    const company = users.filter((u) => u.accountType === 'Company').length;
    const totalApps = users.reduce((acc, u) => acc + u.applicationsCount, 0);

    return { total, individual, company, totalApps };
  }, [users]);

  // Handlers for CRUD
  const handleOpenAddModal = () => {
    setEditingUser(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setIsFormModalOpen(true);
  };

  const handleOpenDetailsPage = (user: User) => {
    setViewingUser(user);
    setSubView('details');
  };

  const handleOpenDeleteModal = (user: User) => {
    setDeletingUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleSaveUser = (data: Omit<User, 'id'> & { id?: string }) => {
    if (editingUser !== null && editingUser !== undefined) {
      // Edit mode
      setUsers((prev) =>
        prev.map((item) => {
          if (item.id === editingUser.id) {
            const updated: User = {
              ...item,
              ...data,
              id: item.id,
            };
            if (viewingUser !== null && viewingUser.id === item.id) {
              setViewingUser(updated);
            }
            return updated;
          }
          return item;
        })
      );
      showToast(`Updated client account for ${data.name}`);
    } else {
      // Create mode
      const nextNum = users.length + 1;
      const formattedId = nextNum < 10 ? `000${nextNum}` : nextNum < 100 ? `00${nextNum}` : `${nextNum}`;

      const newUser: User = {
        id: formattedId,
        name: data.name,
        email: data.email,
        accountType: data.accountType,
        avatarType: data.avatarType,
        avatarInitials: data.avatarInitials,
        avatarBgColor: data.avatarBgColor,
        region: data.region,
        applicationsCount: data.applicationsCount,
        status: data.status,
        phone: data.phone,
        address: data.address,
        createdDate: data.createdDate,
        description: data.description,
      };
      setUsers((prev) => [newUser, ...prev]);
      showToast(`Created new client account for ${newUser.name}`);
    }

    setIsFormModalOpen(false);
    setEditingUser(null);
  };

  const handleConfirmDelete = () => {
    if (deletingUser !== null && deletingUser !== undefined) {
      const targetUser = deletingUser;
      setUsers((prev) => prev.filter((item) => item.id !== targetUser.id));
      showToast(`Deleted client account ${targetUser.name}`);
      setIsDeleteModalOpen(false);
      setDeletingUser(null);
      if (subView === 'details' && viewingUser !== null && viewingUser.id === targetUser.id) {
        setSubView('list');
        setViewingUser(null);
      }
    }
  };

  // TanStack DataTable Columns definition matching Screenshot 1
  const tableColumns: ColumnDef<User, unknown>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'Client ID',
        cell: (info) => <Text style={styles.tableIdText}>{String(info.getValue())}</Text>,
        meta: { flex: 1 },
      },
      {
        accessorKey: 'accountType',
        header: 'Account Type',
        cell: (info) => <Text style={styles.tableTypeText}>{String(info.getValue())}</Text>,
        meta: { flex: 1.2 },
      },
      {
        accessorKey: 'avatar',
        header: 'Avatar',
        cell: (info) => {
          const user = info.row.original;
          if (user.avatarType === 'icon') {
            return (
              <View style={styles.tableAvatarIconCircle}>
                <Lucide name="user" size={18} color={COLORS.neutral[500]} />
              </View>
            );
          }
          return (
            <View style={[styles.tableAvatarInitialsCircle, { backgroundColor: user.avatarBgColor || COLORS.brand.royalBlue }]}>
              <Text style={styles.tableAvatarInitialsText}>
                {user.avatarInitials || user.name.slice(0, 2).toUpperCase()}
              </Text>
            </View>
          );
        },
        meta: { flex: 1 },
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: (info) => <Text style={styles.tableNameText}>{String(info.getValue())}</Text>,
        meta: { flex: 2.2 },
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: (info) => <Text style={styles.tableEmailText}>{String(info.getValue())}</Text>,
        meta: { flex: 2.2 },
      },
      {
        accessorKey: 'region',
        header: 'Region',
        cell: (info) => <Text style={styles.tableRegionText}>{String(info.getValue())}</Text>,
        meta: { flex: 1.5 },
      },
      {
        accessorKey: 'applicationsCount',
        header: 'Applications',
        cell: (info) => <Text style={styles.tableAppsText}>{String(info.getValue())}</Text>,
        meta: { flex: 1 },
      },
      {
        id: 'actions',
        header: 'Action',
        cell: (info) => (
          <TableActionCell
            user={info.row.original}
            activePopoverId={activePopoverId}
            setActivePopoverId={setActivePopoverId}
            onEdit={handleOpenEditModal}
            onDelete={handleOpenDeleteModal}
          />
        ),
        meta: { flex: 0.8 },
      },
    ],
    [activePopoverId]
  );

  // If subView is 'details', render the full UserDetailsScreen component
  if (subView === 'details' && viewingUser !== null && viewingUser !== undefined) {
    return (
      <UserDetailsScreen
        user={viewingUser}
        onBack={() => {
          setSubView('list');
          setViewingUser(null);
        }}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteModal}
      />
    );
  }

  return (
    <View style={styles.screenContainer}>
      {/* Toast Notification Banner */}
      {toastMessage !== null && (
        <View style={[styles.toastContainer, SHADOWS.card]}>
          <Lucide name="check-circle" size={16} color={COLORS.semantic.success} style={styles.toastIcon} />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Main Header */}
      <View style={[styles.headerSection, isMobile && styles.headerSectionMobile]}>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.pageTitle}>Users Portal</Text>
          <Text style={styles.pageSubtitle}>
            Manage client accounts, view account types, regions, and application status across regional offices.
          </Text>
        </View>
      </View>

      {/* Executive KPI Stats Cards */}
      <View style={[styles.kpiGrid, isMobile && styles.kpiGridMobile]}>
        <View style={[styles.kpiCard, SHADOWS.card]}>
          <View style={[styles.kpiIconBg, { backgroundColor: COLORS.brand.light }]}>
            <Lucide name="users" size={20} color={COLORS.brand.secondary} />
          </View>
          <View style={styles.kpiTextGroup}>
            <Text style={styles.kpiLabel}>Total Client Users</Text>
            <Text style={styles.kpiValue}>{stats.total}</Text>
          </View>
        </View>

        <View style={[styles.kpiCard, SHADOWS.card]}>
          <View style={[styles.kpiIconBg, { backgroundColor: COLORS.semantic.successBg }]}>
            <Lucide name="user" size={20} color={COLORS.semantic.success} />
          </View>
          <View style={styles.kpiTextGroup}>
            <Text style={styles.kpiLabel}>Individual Accounts</Text>
            <Text style={styles.kpiValue}>{stats.individual}</Text>
          </View>
        </View>

        <View style={[styles.kpiCard, SHADOWS.card]}>
          <View style={[styles.kpiIconBg, { backgroundColor: COLORS.semantic.warningBg }]}>
            <Lucide name="briefcase" size={20} color={COLORS.semantic.warningText} />
          </View>
          <View style={styles.kpiTextGroup}>
            <Text style={styles.kpiLabel}>Company Accounts</Text>
            <Text style={styles.kpiValue}>{stats.company}</Text>
          </View>
        </View>

        <View style={[styles.kpiCard, SHADOWS.card]}>
          <View style={[styles.kpiIconBg, { backgroundColor: COLORS.brand.purpleLight }]}>
            <Lucide name="file-text" size={20} color={COLORS.brand.purpleDark} />
          </View>
          <View style={styles.kpiTextGroup}>
            <Text style={styles.kpiLabel}>Total Applications</Text>
            <Text style={styles.kpiValue}>{stats.totalApps}</Text>
          </View>
        </View>
      </View>

      {/* Filter Toolbar */}
      <View style={[styles.toolbarSection, SHADOWS.card]}>
        {/* Search Input */}
        <View style={styles.searchWrapper}>
          <Lucide name="search" size={16} color={COLORS.neutral[400]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Client ID, Name, Email, Region..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.neutral[400]}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <Lucide name="x" size={14} color={COLORS.neutral[500]} />
            </Pressable>
          )}
        </View>

        {/* Dropdown Filters */}
        <View style={styles.filterGroup}>
          {/* View Mode Toggle (Table / Cards) */}
          <View style={styles.viewModeToggle}>
            <Pressable
              style={[styles.toggleBtn, viewMode === 'table' && styles.toggleBtnActive]}
              onPress={() => setViewMode('table')}
              accessibilityLabel="Table View"
            >
              <Lucide name="list" size={16} color={viewMode === 'table' ? COLORS.brand[700] : COLORS.neutral[500]} />
            </Pressable>

            <Pressable
              style={[styles.toggleBtn, viewMode === 'cards' && styles.toggleBtnActive]}
              onPress={() => setViewMode('cards')}
              accessibilityLabel="Cards View"
            >
              <Lucide name="grid" size={16} color={viewMode === 'cards' ? COLORS.brand[700] : COLORS.neutral[500]} />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Main Content List / Table */}
      {filteredUsers.length === 0 ? (
        <View style={[styles.emptyContainer, SHADOWS.card]}>
          <Lucide name="users" size={40} color={COLORS.neutral[300]} style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>No Client Users Found</Text>
          <Text style={styles.emptySubtitle}>No records match your search criteria or active filters.</Text>
          <Pressable
            style={styles.resetFiltersBtn}
            onPress={() => {
              setSearchQuery('');
              setSelectedAccountType('All');
              setSelectedRegion('All');
            }}
          >
            <Text style={styles.resetFiltersBtnText}>Reset All Filters</Text>
          </Pressable>
        </View>
      ) : viewMode === 'table' ? (
        <View style={[styles.tableContainer, SHADOWS.card]}>
          <DataTable data={paginatedUsers} columns={tableColumns} />
        </View>
      ) : (
        <View style={styles.cardsGrid}>
          {paginatedUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onView={handleOpenDetailsPage}
              onEdit={handleOpenEditModal}
              onDelete={handleOpenDeleteModal}
            />
          ))}
        </View>
      )}

      {/* Pagination Footer */}
      {filteredUsers.length > 0 && (
        <View style={styles.paginationSection}>
          <Text style={styles.paginationInfoText}>
            Showing <Text style={styles.paginationBold}>{startIndex + 1}</Text> to{' '}
            <Text style={styles.paginationBold}>{endIndex}</Text> of{' '}
            <Text style={styles.paginationBold}>{filteredUsers.length}</Text> client accounts
          </Text>

          <View style={styles.paginationControls}>
            <Pressable
              style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
              disabled={currentPage === 1}
              onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            >
              <Lucide name="chevron-left" size={16} color={currentPage === 1 ? COLORS.neutral[300] : COLORS.neutral[700]} />
              <Text style={[styles.pageBtnText, currentPage === 1 && styles.pageBtnTextDisabled]}>Previous</Text>
            </Pressable>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <Pressable
                key={page}
                style={[styles.pageNumberBtn, currentPage === page && styles.pageNumberBtnActive]}
                onPress={() => setCurrentPage(page)}
              >
                <Text style={[styles.pageNumberText, currentPage === page && styles.pageNumberTextActive]}>
                  {page}
                </Text>
              </Pressable>
            ))}

            <Pressable
              style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
              disabled={currentPage === totalPages}
              onPress={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            >
              <Text style={[styles.pageBtnText, currentPage === totalPages && styles.pageBtnTextDisabled]}>Next</Text>
              <Lucide
                name="chevron-right"
                size={16}
                color={currentPage === totalPages ? COLORS.neutral[300] : COLORS.neutral[700]}
              />
            </Pressable>
          </View>
        </View>
      )}

      {/* Add / Edit Form Modal */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingUser(null);
        }}
        onSubmit={handleSaveUser}
        userToEdit={editingUser}
      />

      {/* Delete Confirmation Modal */}
      <DeleteUserConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingUser(null);
        }}
        onConfirm={handleConfirmDelete}
        user={deletingUser}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    width: '100%',
    position: 'relative',
  },

  toastContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.white,
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[12],
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.semantic.success,
  },
  toastIcon: {
    marginRight: SPACING[8],
  },
  toastText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[800],
  },

  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING[20],
  },
  headerSectionMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: SPACING[12],
  },
  headerTitleGroup: {
    flex: 1,
  },
  pageTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  pageSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[600],
    marginTop: 4,
  },

  addUserBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brand[700],
    paddingHorizontal: SPACING[16],
    paddingVertical: 10,
    borderRadius: RADIUS.button,
  },
  addIcon: {
    marginRight: 6,
  },
  addUserBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
  },

  kpiGrid: {
    flexDirection: 'row',
    gap: SPACING[16],
    marginBottom: SPACING[20],
  },
  kpiGridMobile: {
    flexDirection: 'column',
  },
  kpiCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[16],
  },
  kpiIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING[12],
  },
  kpiTextGroup: {
    flex: 1,
  },
  kpiLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
  },
  kpiValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    marginTop: 2,
  },

  toolbarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[12],
    marginBottom: SPACING[16],
    flexWrap: 'wrap',
    gap: SPACING[12],
  },
  searchWrapper: {
    flex: 1,
    minWidth: 260,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[50],
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    borderRadius: RADIUS.input,
    paddingHorizontal: 10,
    height: 38,
  },
  searchIcon: {
    marginRight: SPACING[8],
  },
  searchInput: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[900],
    height: '100%',
  },
  clearSearchBtn: {
    padding: 4,
  },

  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
  },

  dropdownContainer: {
    position: 'relative',
    zIndex: 50,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[50],
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    borderRadius: RADIUS.button,
    paddingHorizontal: SPACING[12],
    height: 38,
    minWidth: 150,
  },
  dropdownIcon: {
    marginRight: 6,
  },
  dropdownTriggerText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[700],
    marginRight: 6,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 42,
    left: 0,
    right: 0,
    minWidth: 180,
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    paddingVertical: 4,
    zIndex: 100,
  },
  dropdownMenuItem: {
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
  },
  dropdownMenuItemActive: {
    backgroundColor: COLORS.brand.light,
  },
  dropdownMenuText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[700],
  },
  dropdownMenuTextActive: {
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.neutral[100],
    borderRadius: RADIUS.button,
    padding: 2,
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.neutral.white,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },

  tableContainer: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    overflow: 'hidden',
  },
  tableIdText: {
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'Courier',
    fontSize: 13,
    color: COLORS.neutral[600],
  },
  tableTypeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[800],
  },
  tableAvatarIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableAvatarInitialsCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableAvatarInitialsText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: 13,
    color: COLORS.neutral.white,
  },
  tableNameText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  tableEmailText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.brand.secondary,
  },
  tableRegionText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[700],
  },
  tableAppsText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },

  tableActionWrapper: {
    position: 'relative',
  },
  tableThreeDotsBtn: {
    padding: 6,
    borderRadius: 6,
  },
  tableThreeDotsBtnActive: {
    backgroundColor: COLORS.neutral[100],
  },
  popoverBackdrop: {
    position: 'absolute',
    top: -500,
    bottom: -500,
    left: -500,
    right: -500,
    zIndex: 90,
  },
  tablePopoverMenu: {
    position: 'absolute',
    top: 30,
    right: 0,
    width: 150,
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    paddingVertical: 4,
    zIndex: 100,
  },
  popoverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
  },
  popoverItemText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[700],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  popoverIcon: {
    marginRight: SPACING[8],
  },
  popoverDivider: {
    height: 1,
    backgroundColor: COLORS.neutral[200],
    marginVertical: 4,
  },
  popoverItemDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
  },
  popoverItemTextDanger: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.semantic.error,
    fontWeight: TYPOGRAPHY.weights.medium,
  },

  cardsGrid: {
    marginBottom: SPACING[16],
  },

  emptyContainer: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[40],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    marginBottom: SPACING[12],
  },
  emptyTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[500],
    textAlign: 'center',
    marginBottom: SPACING[16],
  },
  resetFiltersBtn: {
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.brand.light,
    borderWidth: 1,
    borderColor: COLORS.brand.blueSoft,
  },
  resetFiltersBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[700],
  },

  paginationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING[16],
    flexWrap: 'wrap',
    gap: SPACING[12],
  },
  paginationInfoText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[600],
  },
  paginationBold: {
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    backgroundColor: COLORS.neutral.white,
  },
  pageBtnDisabled: {
    borderColor: COLORS.neutral[200],
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
  pageNumberBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    backgroundColor: COLORS.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageNumberBtnActive: {
    backgroundColor: COLORS.brand[700],
    borderColor: COLORS.brand[700],
  },
  pageNumberText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[700],
  },
  pageNumberTextActive: {
    color: COLORS.neutral.white,
  },
});
