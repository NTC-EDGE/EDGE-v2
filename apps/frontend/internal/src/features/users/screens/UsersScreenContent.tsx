import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { ColumnDef } from '@tanstack/react-table';
import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
  DataTable,
  Icon as Lucide,
  useTheme,
  toast,
  StatusBadge,
} from '@edge/ui';
import { User, CATEGORIES_LIST, STATUS_LIST } from '../types';
import { mapTenantClientToUser } from '../mappers/userMapper';
import { UserCard } from '../components/UserCard';
import { UserFormModal } from '../components/UserFormModal';
import { UserDetailsScreen } from '../components/UserDetailsScreen';
import { DeleteUserConfirmModal } from '../components/DeleteUserConfirmModal';
import { useTenantClients, useTenantTransactions } from '@edge/api';
import { useAuthContext } from '../../auth/context/AuthContext';

type ViewMode = 'table' | 'cards';
type SubViewMode = 'list' | 'details';

const ITEMS_PER_PAGE = 10;

function TableActionCell({
  user,
  activePopoverId,
  setActivePopoverId,
  onView,
  onEdit,
  onDelete,
}: {
  user: User;
  activePopoverId: string | null;
  setActivePopoverId: (id: string | null) => void;
  onView: (u: User) => void;
  onEdit: (u: User) => void;
  onDelete: (u: User) => void;
}) {
  const isPopoverOpen = activePopoverId === user.id;

  const handleAction = (action: 'view' | 'edit' | 'delete') => {
    setActivePopoverId(null);
    if (action === 'view') {
      onView(user);
    } else if (action === 'edit') {
      onEdit(user);
    } else if (action === 'delete') {
      onDelete(user);
    }
  };

  return (
    <View style={[styles.tableActionWrapper, isPopoverOpen && { zIndex: 99999 }]}>
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
          <Pressable style={styles.popoverItem} onPress={() => handleAction('view')}>
            <Lucide name="eye" size={14} color={COLORS.brand[700]} style={styles.popoverIcon} />
            <Text style={styles.popoverItemText}>View Dossier</Text>
          </Pressable>

          <Pressable style={styles.popoverItem} onPress={() => handleAction('edit')}>
            <Lucide name="edit-2" size={14} color={COLORS.brand[700]} style={styles.popoverIcon} />
            <Text style={styles.popoverItemText}>Edit Permittee</Text>
          </Pressable>

          <View style={styles.popoverDivider} />

          <Pressable style={styles.popoverItemDanger} onPress={() => handleAction('delete')}>
            <Lucide name="trash-2" size={14} color={COLORS.semantic.error} style={styles.popoverIcon} />
            <Text style={styles.popoverItemTextDanger}>Archive Record</Text>
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
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const { user: authUser } = useAuthContext();
  const currentTenantId = authUser?.tenantId;
  const currentTenantName = authUser?.tenantName || 'NTC Regional Office X (Northern Mindanao)';

  const {
    clients: apiClients,
    isLoading: isClientsLoading,
    refetch: refetchClients,
  } = useTenantClients(currentTenantId);

  const {
    refetch: refetchTransactions,
  } = useTenantTransactions(currentTenantId);

  const [isSyncing, setIsSyncing] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (apiClients && apiClients.length > 0) {
      const mappedUsers = apiClients.map((client) =>
        mapTenantClientToUser(client, currentTenantName)
      );
      setUsers(mappedUsers);
    } else {
      setUsers([]);
    }
  }, [apiClients, currentTenantName]);

  const [subView, setSubView] = useState<SubViewMode>('list');
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccountType, setSelectedAccountType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  const [currentPage, setCurrentPage] = useState<number>(1);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const [activePopoverId, setActivePopoverId] = useState<string | null>(null);

  const showToast = (msg: string, variant: 'success' | 'error' | 'info' = 'success') => {
    if (variant === 'error') {
      toast.error(msg);
    } else if (variant === 'info') {
      toast.info(msg);
    } else {
      toast.success(msg);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedAccountType, selectedStatus, selectedCategory]);

  const handleSyncWithBackend = async () => {
    setIsSyncing(true);
    try {
      await Promise.all([refetchClients(), refetchTransactions()]);
      showToast(`Synchronized with ${currentTenantName} regulatory database`, 'success');
    } catch {
      showToast('Failed to synchronize regulatory records with database.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (selectedAccountType !== 'All' && user.accountType !== selectedAccountType) return false;
      if (selectedStatus !== 'All' && user.status !== selectedStatus) return false;
      if (selectedCategory !== 'All' && user.licenseCategory !== selectedCategory) return false;
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        return (
          user.name.toLowerCase().includes(q) ||
          user.email.toLowerCase().includes(q) ||
          user.id.toLowerCase().includes(q) ||
          (user.organization || '').toLowerCase().includes(q) ||
          (user.licenseCategory || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [users, searchQuery, selectedAccountType, selectedStatus, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length);

  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredUsers, startIndex]);

  const stats = useMemo(() => {
    const total = users.length;
    const individual = users.filter((u) => u.accountType === 'Individual').length;
    const company = users.filter((u) => u.accountType === 'Company').length;
    const totalApps = users.reduce((acc, u) => acc + (u.applicationsCount || 0), 0);
    return { total, individual, company, totalApps };
  }, [users]);

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
    if (editingUser) {
      setUsers((prev) => prev.map((item) => (item.id === editingUser.id ? { ...item, ...data, id: item.id } : item)));
      showToast(`Updated regulatory record for ${data.name}`);
    } else {
      const nextId = `CL-${(users.length + 8801).toString()}`;
      const newUser: User = {
        ...data,
        id: nextId,
        region: currentTenantName,
        tenantName: currentTenantName,
      };
      setUsers((prev) => [newUser, ...prev]);
      showToast(`Registered new permittee: ${newUser.name}`);
    }
    setIsFormModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deletingUser) {
      setUsers((prev) => prev.filter((item) => item.id !== deletingUser.id));
      showToast(`Archived regulatory record for ${deletingUser.name}`);
      setIsDeleteModalOpen(false);
      if (subView === 'details' && viewingUser?.id === deletingUser.id) {
        setSubView('list');
      }
    }
  };

  const tableColumns: ColumnDef<User, unknown>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'Permittee ID',
        cell: (info) => (
          <View style={styles.tableIdBadge}>
            <Text style={styles.tableIdText}>{String(info.getValue() || '').slice(0, 10)}</Text>
          </View>
        ),
        meta: { flex: 0.9 },
      },
      {
        accessorKey: 'accountType',
        header: 'Entity Type',
        cell: (info) => {
          const type = String(info.getValue() || 'Individual');
          return (
            <View style={type === 'Company' ? styles.companyBadge : styles.individualBadge}>
              <Text style={type === 'Company' ? styles.companyBadgeText : styles.individualBadgeText}>
                {type}
              </Text>
            </View>
          );
        },
        meta: { flex: 0.9 },
      },
      {
        accessorKey: 'name',
        header: 'Permittee / Organization',
        cell: (info) => {
          const user = info.row.original;
          const uName = user.name || 'Permittee';
          const initials = user.avatarInitials || (uName.slice(0, 2).toUpperCase() || 'NT');
          return (
            <View style={styles.tableClientCell}>
              {user.avatarType === 'icon' ? (
                <View style={styles.tableAvatarIconCircle}>
                  <Lucide name="user" size={16} color={COLORS.neutral[500]} />
                </View>
              ) : (
                <View style={[styles.tableAvatarInitialsCircle, { backgroundColor: user.avatarBgColor || COLORS.brand.royalBlue }]}>
                  <Text style={styles.tableAvatarInitialsText}>{initials}</Text>
                </View>
              )}
              <View style={styles.tableClientTextGroup}>
                <Text style={styles.tableNameText} numberOfLines={1}>{uName}</Text>
                {user.organization && user.organization !== 'Individual Permittee' && (
                  <Text style={styles.tableOrgSubtitle} numberOfLines={1}>{user.organization}</Text>
                )}
              </View>
            </View>
          );
        },
        meta: { flex: 2.2 },
      },
      {
        accessorKey: 'email',
        header: 'Official Contact',
        cell: (info) => {
          const user = info.row.original;
          return (
            <View style={styles.tableContactGroup}>
              <Text style={styles.tableEmailText} numberOfLines={1}>{user.email || '—'}</Text>
              <Text style={styles.tablePhoneText} numberOfLines={1}>{user.phone || '+63 (88) 856-4200'}</Text>
            </View>
          );
        },
        meta: { flex: 1.8 },
      },
      {
        accessorKey: 'licenseCategory',
        header: 'Service Category',
        cell: (info) => (
          <View style={styles.tableCategoryChip}>
            <Lucide name="radio" size={11} color={COLORS.brand[700]} style={styles.chipIcon} />
            <Text style={styles.tableCategoryText} numberOfLines={1}>{String(info.getValue() || 'Fixed & Land Mobile Radio Network')}</Text>
          </View>
        ),
        meta: { flex: 1.7 },
      },
      {
        accessorKey: 'applicationsCount',
        header: 'Regional Filings',
        cell: (info) => (
          <View style={styles.tableFilingsPill}>
            <Lucide name="file-text" size={12} color={COLORS.brand[700]} style={styles.chipIcon} />
            <Text style={styles.tableFilingsText}>{String(info.getValue() ?? '0')} Filings</Text>
          </View>
        ),
        meta: { flex: 1.1 },
      },
      {
        accessorKey: 'status',
        header: 'Regulatory Status',
        cell: (info) => <StatusBadge status={String(info.getValue() || 'Under Review')} />,
        meta: { flex: 1.2 },
      },
      {
        id: 'actions',
        header: 'Action',
        cell: (info) => (
          <TableActionCell
            user={info.row.original}
            activePopoverId={activePopoverId}
            setActivePopoverId={setActivePopoverId}
            onView={handleOpenDetailsPage}
            onEdit={handleOpenEditModal}
            onDelete={handleOpenDeleteModal}
          />
        ),
        meta: { flex: 0.7 },
      },
    ],
    [activePopoverId]
  );

  if (subView === 'details' && viewingUser) {
    return (
      <UserDetailsScreen
        user={viewingUser}
        onBack={() => { setSubView('list'); setViewingUser(null); }}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteModal}
      />
    );
  }

  return (
    <View style={styles.screenContainer}>
      <View style={[styles.headerSection, isMobile && styles.headerSectionMobile]}>
        <View style={styles.headerTitleGroup}>
          <View style={styles.tenantTagRow}>
            <View style={styles.tenantTag}>
              <Lucide name="map-pin" size={12} color={COLORS.brand[700]} style={styles.tagIcon} />
              <Text style={styles.tenantTagText}>{currentTenantName}</Text>
            </View>
            <View style={styles.syncStatusBadge}>
              <View style={styles.livePulseDot} />
              <Text style={styles.syncStatusText}>Live Regulatory Database Sync</Text>
            </View>
          </View>
          <Text style={styles.pageTitle}>Regional Permittees & Regulatory Roll</Text>
          <Text style={styles.pageSubtitle}>
            National Telecommunications Commission — Active registry of licensed operators, broadcast stations, and transacting entities in this regional office.
          </Text>
        </View>

        <View style={styles.headerActionsGroup}>
          <Pressable
            style={[styles.syncBtn, isSyncing && styles.syncBtnDisabled]}
            onPress={handleSyncWithBackend}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color={COLORS.brand[700]} style={styles.addIcon} />
            ) : (
              <Lucide name="refresh-cw" size={14} color={COLORS.brand[700]} style={styles.addIcon} />
            )}
            <Text style={styles.syncBtnText}>{isSyncing ? 'Syncing...' : 'Sync Server'}</Text>
          </Pressable>

          <Pressable style={styles.addUserBtn} onPress={handleOpenAddModal}>
            <Lucide name="plus" size={16} color={COLORS.neutral.white} style={styles.addIcon} />
            <Text style={styles.addUserBtnText}>Register Permittee</Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.kpiGrid, isMobile && styles.kpiGridMobile]}>
        <View style={[styles.kpiCard, SHADOWS.card]}>
          <View style={[styles.kpiIconBg, { backgroundColor: COLORS.brand.light }]}><Lucide name="users" size={20} color={COLORS.brand.secondary} /></View>
          <View style={styles.kpiTextGroup}>
            <Text style={styles.kpiLabel}>Registered Permittees</Text>
            <Text style={styles.kpiValue}>{stats.total}</Text>
          </View>
        </View>
        <View style={[styles.kpiCard, SHADOWS.card]}>
          <View style={[styles.kpiIconBg, { backgroundColor: COLORS.brand.purpleLight }]}><Lucide name="briefcase" size={20} color={COLORS.brand.purpleDark} /></View>
          <View style={styles.kpiTextGroup}>
            <Text style={styles.kpiLabel}>Corporate Entities</Text>
            <Text style={styles.kpiValue}>{stats.company}</Text>
          </View>
        </View>
        <View style={[styles.kpiCard, SHADOWS.card]}>
          <View style={[styles.kpiIconBg, { backgroundColor: COLORS.neutral[100] }]}><Lucide name="user" size={20} color={COLORS.neutral[700]} /></View>
          <View style={styles.kpiTextGroup}>
            <Text style={styles.kpiLabel}>Individual Operators</Text>
            <Text style={styles.kpiValue}>{stats.individual}</Text>
          </View>
        </View>
        <View style={[styles.kpiCard, SHADOWS.card]}>
          <View style={[styles.kpiIconBg, { backgroundColor: COLORS.semantic.successBg }]}><Lucide name="credit-card" size={20} color={COLORS.semantic.success} /></View>
          <View style={styles.kpiTextGroup}>
            <Text style={styles.kpiLabel}>Station Filings & Volume</Text>
            <Text style={styles.kpiValue}>{stats.totalApps} <Text style={styles.kpiValueSub}>filings</Text></Text>
          </View>
        </View>
      </View>

      <View style={[styles.toolbarSection, SHADOWS.card]}>
        <View style={styles.searchWrapper}>
          <Lucide name="search" size={16} color={COLORS.neutral[400]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by ID, Permittee Name, Organization, License Category..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.neutral[400]}
          />
        </View>

        <View style={styles.filtersWrapper}>
          <View style={styles.chipFilterRow}>
            <Text style={styles.filterGroupLabel}>Type:</Text>
            {['All', 'Individual', 'Company'].map((type) => (
              <Pressable key={type} style={[styles.filterChip, selectedAccountType === type && styles.filterChipActive]} onPress={() => setSelectedAccountType(type)}>
                <Text style={[styles.filterChipText, selectedAccountType === type && styles.filterChipTextActive]}>{type}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.chipFilterRow}>
            <Text style={styles.filterGroupLabel}>Status:</Text>
            {['All', 'Active License', 'Under Review', 'Returned for Correction'].map((st) => (
              <Pressable key={st} style={[styles.filterChip, selectedStatus === st && styles.filterChipActive]} onPress={() => setSelectedStatus(st)}>
                <Text style={[styles.filterChipText, selectedStatus === st && styles.filterChipTextActive]}>
                  {st === 'Returned for Correction' ? 'Returned' : st}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.viewModeToggle}>
            <Pressable style={[styles.toggleBtn, viewMode === 'table' && styles.toggleBtnActive]} onPress={() => setViewMode('table')}>
              <Lucide name="list" size={16} color={viewMode === 'table' ? COLORS.brand[700] : COLORS.neutral[500]} />
            </Pressable>
            <Pressable style={[styles.toggleBtn, viewMode === 'cards' && styles.toggleBtnActive]} onPress={() => setViewMode('cards')}>
              <Lucide name="grid" size={16} color={viewMode === 'cards' ? COLORS.brand[700] : COLORS.neutral[500]} />
            </Pressable>
          </View>
        </View>
      </View>

      {isClientsLoading && users.length === 0 ? (
        <View style={[styles.loadingContainer, SHADOWS.card]}><ActivityIndicator size="large" color={COLORS.brand[700]} /><Text style={styles.loadingText}>Loading...</Text></View>
      ) : filteredUsers.length === 0 ? (
        <View style={[styles.emptyContainer, SHADOWS.card]}><Text>No results found</Text></View>
      ) : viewMode === 'table' ? (
        <View style={[styles.tableContainer, SHADOWS.card]}><DataTable data={paginatedUsers} columns={tableColumns} /></View>
      ) : (
        <View style={styles.cardsGrid}>{paginatedUsers.map((u) => <UserCard key={u.id} user={u} onView={handleOpenDetailsPage} onEdit={handleOpenEditModal} onDelete={handleOpenDeleteModal} />)}</View>
      )}

      <UserFormModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} onSubmit={handleSaveUser} userToEdit={editingUser} />
      <DeleteUserConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} user={deletingUser} />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    width: '100%',
    position: 'relative',
  },

  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING[20],
    gap: SPACING[16],
  },
  headerSectionMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: SPACING[12],
  },
  headerTitleGroup: {
    flex: 1,
  },
  tenantTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    marginBottom: SPACING[6],
    flexWrap: 'wrap',
  },
  tenantTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brand.light,
    paddingHorizontal: SPACING[10],
    paddingVertical: 3,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.brand.blueSoft,
  },
  tagIcon: {
    marginRight: 5,
  },
  tenantTagText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[700],
  },
  syncStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.semantic.successBg,
    paddingHorizontal: SPACING[8],
    paddingVertical: 3,
    borderRadius: RADIUS.button,
    gap: 5,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.semantic.success,
  },
  syncStatusText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.semantic.success,
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
    lineHeight: 18,
  },

  headerActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    flexWrap: 'wrap',
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.brand.blueSoft,
    paddingHorizontal: SPACING[12],
    paddingVertical: 9,
    borderRadius: RADIUS.button,
  },
  syncBtnDisabled: {
    opacity: 0.6,
  },
  syncBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[700],
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
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
  },

  kpiGrid: {
    flexDirection: 'row',
    gap: SPACING[12],
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
  kpiValueSub: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.regular,
    color: COLORS.neutral[500],
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

  filtersWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING[12],
  },
  chipFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterGroupLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    marginRight: 2,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.neutral[100],
  },
  filterChipActive: {
    backgroundColor: COLORS.brand.light,
    borderWidth: 1,
    borderColor: COLORS.brand.blueSoft,
  },
  filterChipText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[600],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  filterChipTextActive: {
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.bold,
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
    ...SHADOWS.card,
  },

  tableContainer: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    overflow: 'hidden',
  },
  tableIdBadge: {
    backgroundColor: COLORS.neutral[100],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  tableIdText: {
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'Courier',
    fontSize: 12,
    color: COLORS.neutral[700],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  individualBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: COLORS.neutral[100],
    alignSelf: 'flex-start',
  },
  individualBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.neutral[600],
  },
  companyBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: COLORS.brand.light,
    alignSelf: 'flex-start',
  },
  companyBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.brand.royalBlue,
  },

  tableClientCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tableAvatarIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING[8],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  tableAvatarInitialsCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING[8],
  },
  tableAvatarInitialsText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: 12,
    color: COLORS.neutral.white,
  },
  tableClientTextGroup: {
    flex: 1,
  },
  tableNameText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  tableOrgSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[500],
    marginTop: 1,
  },

  tableContactGroup: {
    gap: 1,
  },
  tableEmailText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.brand[700],
  },
  tablePhoneText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[500],
  },

  tableCategoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[50],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.button,
    alignSelf: 'flex-start',
  },
  chipIcon: {
    marginRight: 4,
  },
  tableCategoryText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[700],
    fontWeight: TYPOGRAPHY.weights.medium,
  },

  tableFilingsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brand.light,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  tableFilingsText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[700],
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
    zIndex: 99999,
    elevation: 99,
    ...Platform.select({
      web: {
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.18), 0 8px 10px -6px rgba(15, 23, 42, 0.1)',
      },
    }),
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[16],
    marginBottom: SPACING[16],
    width: '100%',
  },

  loadingContainer: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[40],
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[600],
    marginTop: SPACING[12],
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
});
