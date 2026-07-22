import React, { useState, useMemo, useEffect } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Icon } from '@edge/ui';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useUser, useAuth } from '@clerk/expo';
import { AuthParamList } from '../../routes/auth';
import {
  mockApplications,
  Application,
  ModeFilterOption,
  StatusFilterOption,
  SingleApplication,
  BulkApplication,
  getAppDocuments,
  getStatusLabel,
  ApplicationDocument,
} from './data/applicationsData';
import { ApplicationCard, ApplicationDetailsPage } from './components';
import { styles } from './MyApplications.styles';

const LIST_PAGE_SIZE = 6;

export function MyApplications() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const navigation = useNavigation<NavigationProp<AuthParamList>>();

  // Clerk auth
  const { user: clerkUser } = useUser();
  const { signOut } = useAuth();

  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Filter & Search state
  const [filterText, setFilterText] = useState('');
  const [selectedMode, setSelectedMode] = useState<ModeFilterOption>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilterOption>('ALL');
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST'>('NEWEST');
  const [currentPage, setCurrentPage] = useState(1);

  // Dropdown open state
  const [openDropdown, setOpenDropdown] = useState<'TYPE' | 'STATUS' | 'SORT' | null>(null);

  // Selected Modal Application Detail state
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search focus state
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // User Profile
  const userProfile = useMemo(() => {
    if (clerkUser !== null && clerkUser !== undefined) {
      return {
        name:
          clerkUser.fullName ??
          clerkUser.primaryEmailAddress?.emailAddress?.split('@')[0] ??
          'Client User',
        email: clerkUser.primaryEmailAddress?.emailAddress ?? '',
      };
    }
    return null;
  }, [clerkUser]);

  const handleSignOut = async () => {
    await signOut();
  };

  // Filtered & Sorted Applications
  const filteredApps = useMemo<Application[]>(() => {
    const list = mockApplications.filter((app) => {
      // Search text match
      const q = filterText.toLowerCase();
      const primaryName = app.mode === 'BULK' ? app.companyName : app.applicantName;
      const matchesSearch =
        q === '' ||
        app.referenceNumber.toLowerCase().includes(q) ||
        app.serviceName.toLowerCase().includes(q) ||
        primaryName.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // Mode filter
      if (selectedMode !== 'ALL' && app.mode !== selectedMode) return false;

      // Status filter
      if (selectedStatus !== 'ALL' && app.status !== selectedStatus) return false;

      return true;
    });

    // Sort order
    return list.sort((a, b) => {
      const timeA = new Date(a.submittedAt).getTime();
      const timeB = new Date(b.submittedAt).getTime();
      return sortOrder === 'NEWEST' ? timeB - timeA : timeA - timeB;
    });
  }, [filterText, selectedMode, selectedStatus, sortOrder]);

  // Statistics
  const stats = useMemo(() => {
    const totalCount = mockApplications.length;
    const singleCount = mockApplications.filter((a) => a.mode === 'SINGLE').length;
    const bulkCount = mockApplications.filter((a) => a.mode === 'BULK').length;
    const readyDocsCount = mockApplications.reduce(
      (acc, app) => acc + getAppDocuments(app).length,
      0,
    );

    return { totalCount, singleCount, bulkCount, readyDocsCount };
  }, []);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterText, selectedMode, selectedStatus, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredApps.length / LIST_PAGE_SIZE));
  const pagedApps = filteredApps.slice(
    (currentPage - 1) * LIST_PAGE_SIZE,
    currentPage * LIST_PAGE_SIZE,
  );

  // Download Handler
  const handleDownloadDoc = (doc: ApplicationDocument) => {
    setToastMessage(`Downloading document "${doc.name}"...`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleQuickDownloadAppDocs = (app: Application) => {
    const docs = getAppDocuments(app);
    if (docs.length > 0) {
      handleDownloadDoc(docs[0]);
    }
  };

  const toggleDropdown = (key: 'TYPE' | 'STATUS' | 'SORT') => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  return (
    <View style={styles.rootContainer}>
      {/* ── Top Header ─────────────────────────────────────────────────── */}
      <View style={styles.topHeader}>
        <View style={styles.logoWrapper}>
          <View style={styles.circularLogo}>
            <Icon name="globe" size={16} color="#1E40AF" />
          </View>
          <Text style={styles.brandTitle}>NTC EDGE</Text>
          <Text style={styles.brandSubtitle}>PORTAL</Text>
        </View>

        {userProfile !== null && (
          <View style={styles.headerRight}>
            {!isMobile && (
              <Text style={styles.headerUserName}>{userProfile.name}</Text>
            )}
            <TouchableOpacity onPress={handleSignOut} style={styles.topLogoutBtn} activeOpacity={0.8}>
              <Icon name="log-out" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              {!isMobile && <Text style={styles.topLogoutText}>Sign Out</Text>}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Main Layout (Left Sidebar + Content Column) ────────────────── */}
      <View style={styles.mainLayout}>
        {/* Left Sidebar Panel (Restored to original location) */}
        {!isMobile && (
          <View style={[styles.sidebar, isSidebarCollapsed && styles.sidebarCollapsed]}>
            <TouchableOpacity
              onPress={() => setIsSidebarCollapsed((prev) => !prev)}
              style={styles.collapseToggle}
            >
              <Icon
                name={isSidebarCollapsed ? 'chevron-right' : 'chevron-left'}
                size={16}
                color="#64748B"
              />
            </TouchableOpacity>

            <View style={styles.sidebarItems}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Services')}
                style={styles.sidebarItem}
              >
                <Icon name="radio" size={20} color="#94A3B8" />
                {!isSidebarCollapsed && <Text style={styles.sidebarItemText}>Services</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={[styles.sidebarItem, styles.sidebarItemActive]}>
                <Icon name="credit-card" size={20} color="#1D4ED8" />
                {!isSidebarCollapsed && (
                  <Text style={styles.sidebarItemTextActive}>My Applications</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Content Column */}
        <View style={styles.contentColumn}>
          {selectedApp !== null ? (
            <ApplicationDetailsPage
              app={selectedApp}
              onBack={() => setSelectedApp(null)}
              onDownloadDoc={handleDownloadDoc}
            />
          ) : (
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              onScrollBeginDrag={() => setOpenDropdown(null)}
            >
            {/* ── Hero Section ───────────────────────────────────────────── */}
            <View style={styles.heroHeader}>
              <Text style={styles.heroTitle}>My Applications Dashboard</Text>
              <Text style={styles.heroSubtitle}>
                View details, check status timelines, and download official documents for your single and bulk applications.
              </Text>
            </View>

            {/* ── 4 Stat Metric Cards ────────────────────────────────────── */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={[styles.statIconWrap, { backgroundColor: '#EFF6FF' }]}>
                  <Icon name="file-text" size={20} color="#2563EB" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statLabel}>TOTAL APPLICATIONS</Text>
                  <Text style={styles.statValue}>{stats.totalCount}</Text>
                  <Text style={styles.statSubtext}>Submitted records</Text>
                </View>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIconWrap, { backgroundColor: '#EEF2FF' }]}>
                  <Icon name="user" size={20} color="#2F56E8" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statLabel}>SINGLE APPLICATIONS</Text>
                  <Text style={styles.statValue}>{stats.singleCount}</Text>
                  <Text style={styles.statSubtext}>1 Applicant per app</Text>
                </View>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIconWrap, { backgroundColor: '#FFFBEB' }]}>
                  <Icon name="users" size={20} color="#D97706" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statLabel}>BULK APPLICATIONS</Text>
                  <Text style={styles.statValue}>{stats.bulkCount}</Text>
                  <Text style={styles.statSubtext}>Multiple applicants batch</Text>
                </View>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIconWrap, { backgroundColor: '#DCFCE7' }]}>
                  <Icon name="download" size={20} color="#16A34A" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statLabel}>READY DOCUMENTS</Text>
                  <Text style={[styles.statValue, { color: '#16A34A' }]}>{stats.readyDocsCount}</Text>
                  <Text style={styles.statSubtext}>Permits & receipts</Text>
                </View>
              </View>
            </View>

            {/* ── Search Bar & Dropdown Select Filters Toolbar ─────────────── */}
            <View style={styles.toolbarPanel}>
              {/* Standard Premium Search Bar Input */}
              <View
                style={[
                  styles.searchInputContainer,
                  isSearchFocused && styles.searchInputContainerFocused,
                  filterText.length > 0 && styles.searchInputContainerActive,
                ]}
              >
                <Icon
                  name="search"
                  size={18}
                  color={isSearchFocused || filterText.length > 0 ? '#2563EB' : '#64748B'}
                  style={styles.searchIcon}
                />
                <TextInput
                  placeholder="Search by application #, applicant name, company, or service..."
                  placeholderTextColor="#94A3B8"
                  value={filterText}
                  onChangeText={setFilterText}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  style={styles.searchInput}
                />
                {filterText.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setFilterText('')}
                    style={styles.clearSearchBtn}
                    activeOpacity={0.7}
                  >
                    <Icon name="x" size={15} color="#64748B" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Dropdown Filters Group */}
              <View style={styles.dropdownsGroup}>
                {/* Dropdown 1: Application Type */}
                <View style={styles.dropdownWrap}>
                  <TouchableOpacity
                    onPress={() => toggleDropdown('TYPE')}
                    style={[
                      styles.dropdownTrigger,
                      selectedMode !== 'ALL' && styles.dropdownTriggerActive,
                    ]}
                    activeOpacity={0.85}
                  >
                    <Icon name="layers" size={14} color={selectedMode !== 'ALL' ? '#1D4ED8' : '#64748B'} />
                    <Text style={styles.dropdownLabelText}>
                      {selectedMode === 'ALL'
                        ? 'Type: All'
                        : selectedMode === 'SINGLE'
                          ? 'Type: Single'
                          : 'Type: Bulk'}
                    </Text>
                    <Icon name="chevron-down" size={14} color="#64748B" />
                  </TouchableOpacity>

                  {openDropdown === 'TYPE' && (
                    <View style={styles.dropdownMenu}>
                      {(['ALL', 'SINGLE', 'BULK'] as ModeFilterOption[]).map((mode) => (
                        <TouchableOpacity
                          key={mode}
                          onPress={() => {
                            setSelectedMode(mode);
                            setOpenDropdown(null);
                          }}
                          style={[
                            styles.dropdownOption,
                            selectedMode === mode && styles.dropdownOptionSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.dropdownOptionText,
                              selectedMode === mode && styles.dropdownOptionTextSelected,
                            ]}
                          >
                            {mode === 'ALL'
                              ? 'All Application Types'
                              : mode === 'SINGLE'
                                ? 'Single Applications'
                                : 'Bulk Applications'}
                          </Text>
                          {selectedMode === mode && (
                            <Icon name="check" size={14} color="#1D4ED8" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Dropdown 2: Application Status */}
                <View style={styles.dropdownWrap}>
                  <TouchableOpacity
                    onPress={() => toggleDropdown('STATUS')}
                    style={[
                      styles.dropdownTrigger,
                      selectedStatus !== 'ALL' && styles.dropdownTriggerActive,
                    ]}
                    activeOpacity={0.85}
                  >
                    <Icon name="filter" size={14} color={selectedStatus !== 'ALL' ? '#1D4ED8' : '#64748B'} />
                    <Text style={styles.dropdownLabelText}>
                      {selectedStatus === 'ALL'
                        ? 'Status: All'
                        : `Status: ${getStatusLabel(selectedStatus)}`}
                    </Text>
                    <Icon name="chevron-down" size={14} color="#64748B" />
                  </TouchableOpacity>

                  {openDropdown === 'STATUS' && (
                    <View style={styles.dropdownMenu}>
                      {(
                        [
                          ['ALL', 'All Statuses'],
                          ['FOR_APPROVAL', 'For Approval'],
                          ['FOR_EVALUATION', 'For Evaluation'],
                          ['APPROVED', 'Approved'],
                          ['EXPIRING_SOON', 'Expiring Soon'],
                          ['PENDING', 'Pending'],
                        ] as [StatusFilterOption, string][]
                      ).map(([val, label]) => (
                        <TouchableOpacity
                          key={val}
                          onPress={() => {
                            setSelectedStatus(val);
                            setOpenDropdown(null);
                          }}
                          style={[
                            styles.dropdownOption,
                            selectedStatus === val && styles.dropdownOptionSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.dropdownOptionText,
                              selectedStatus === val && styles.dropdownOptionTextSelected,
                            ]}
                          >
                            {label}
                          </Text>
                          {selectedStatus === val && (
                            <Icon name="check" size={14} color="#1D4ED8" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Dropdown 3: Sort Order */}
                <View style={styles.dropdownWrap}>
                  <TouchableOpacity
                    onPress={() => toggleDropdown('SORT')}
                    style={styles.dropdownTrigger}
                    activeOpacity={0.85}
                  >
                    <Icon name={sortOrder === 'NEWEST' ? 'arrow-down' : 'arrow-up'} size={14} color="#64748B" />
                    <Text style={styles.dropdownLabelText}>
                      {sortOrder === 'NEWEST' ? 'Sort: Newest' : 'Sort: Oldest'}
                    </Text>
                    <Icon name="chevron-down" size={14} color="#64748B" />
                  </TouchableOpacity>

                  {openDropdown === 'SORT' && (
                    <View style={styles.dropdownMenu}>
                      {[
                        { key: 'NEWEST', label: 'Newest First' },
                        { key: 'OLDEST', label: 'Oldest First' },
                      ].map((opt) => (
                        <TouchableOpacity
                          key={opt.key}
                          onPress={() => {
                            setSortOrder(opt.key as 'NEWEST' | 'OLDEST');
                            setOpenDropdown(null);
                          }}
                          style={[
                            styles.dropdownOption,
                            sortOrder === opt.key && styles.dropdownOptionSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.dropdownOptionText,
                              sortOrder === opt.key && styles.dropdownOptionTextSelected,
                            ]}
                          >
                            {opt.label}
                          </Text>
                          {sortOrder === opt.key && (
                            <Icon name="check" size={14} color="#1D4ED8" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* ── Applications Cards Container ────────────────────────────── */}
            <View style={styles.cardsContainer}>
              {pagedApps.length === 0 ? (
                <View style={styles.emptyStateCard}>
                  <Icon name="file-text" size={36} color="#CBD5E1" />
                  <Text style={styles.emptyStateTitle}>No applications match your filter</Text>
                  <Text style={styles.emptyStateSub}>
                    Try selecting a different type or status from the dropdown menus above.
                  </Text>
                </View>
              ) : (
                pagedApps.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    app={app}
                    onPress={() => setSelectedApp(app)}
                    onDownloadDoc={handleDownloadDoc}
                  />
                ))
              )}
            </View>

            {/* ── Pagination Bar ────────────────────────────────────────────── */}
            {totalPages > 1 && (
              <View style={styles.paginationBar}>
                <Text style={styles.paginationSummary}>
                  Showing {(currentPage - 1) * LIST_PAGE_SIZE + 1} to{' '}
                  {Math.min(currentPage * LIST_PAGE_SIZE, filteredApps.length)} of{' '}
                  {filteredApps.length} applications
                </Text>

                <View style={styles.paginationBtns}>
                  <TouchableOpacity
                    onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={[
                      styles.pageNavBtn,
                      currentPage === 1 && styles.pageNavBtnDisabled,
                    ]}
                  >
                    <Icon
                      name="chevron-left"
                      size={16}
                      color={currentPage === 1 ? '#CBD5E1' : '#334155'}
                    />
                  </TouchableOpacity>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <TouchableOpacity
                      key={pg}
                      onPress={() => setCurrentPage(pg)}
                      style={[
                        styles.pageNumberBtn,
                        pg === currentPage && styles.pageNumberBtnActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.pageNumberBtnText,
                          pg === currentPage && styles.pageNumberBtnTextActive,
                        ]}
                      >
                        {pg}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  <TouchableOpacity
                    onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={[
                      styles.pageNavBtn,
                      currentPage === totalPages && styles.pageNavBtnDisabled,
                    ]}
                  >
                    <Icon
                      name="chevron-right"
                      size={16}
                      color={currentPage === totalPages ? '#CBD5E1' : '#334155'}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
          )}
        </View>
      </View>

      {/* ── Toast Feedback Notification ─────────────────────────────────── */}
      {toastMessage !== null && (
        <View style={styles.toastContainer}>
          <Icon name="check-circle" size={18} color="#22C55E" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </View>
  );
}
