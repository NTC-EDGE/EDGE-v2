import { useState, useMemo, useEffect } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Icon } from '@edge/ui';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser, useAuth } from '@clerk/expo';
import {
  mockApplications,
  Application,
  ModeFilterOption,
  StatusFilterOption,
  DensityOption,
  SingleApplication,
  BulkApplication,
} from './data/applicationsData';
import { ApplicationCard, SinglePreview, BulkPreview } from './components';
import { styles } from './MyApplications.styles';

// ─── Local nav type ────────────────────────────────────────────────────────
type AuthParamList = {
  Services: undefined;
  MyApplications: undefined;
};

// ─── Pagination constant ───────────────────────────────────────────────────
const LIST_PAGE_SIZE = 5;

// ─── Mode dot colours ─────────────────────────────────────────────────────
const MODE_DOT_COLORS: Record<Exclude<ModeFilterOption, 'ALL'>, string> = {
  SINGLE: '#2F56E8',
  BULK: '#D97706',
};

export function MyApplications() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const navigation: NativeStackNavigationProp<AuthParamList> = useNavigation<NativeStackNavigationProp<AuthParamList>>();

  // Clerk
  const { user: clerkUser } = useUser();
  const { signOut } = useAuth();

  // ── UI state ──────────────────────────────────────────────────────────
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Left-pane filter state
  const [filterText, setFilterText] = useState('');
  const [selectedMode, setSelectedMode] = useState<ModeFilterOption>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilterOption>('ALL');
  const [density, setDensity] = useState<DensityOption>('std');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Right-pane preview state
  const [previewApp, setPreviewApp] = useState<Application | null>(null);

  // User profile
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

  // ── Filtering ─────────────────────────────────────────────────────────
  const filteredApps = useMemo<Application[]>(() => {
    return mockApplications.filter((app) => {
      // Text search
      const q = filterText.toLowerCase();
      const primaryName =
        app.mode === 'BULK' ? app.companyName : app.applicantName;
      const matchesSearch =
        q === '' ||
        app.serviceName.toLowerCase().includes(q) ||
        primaryName.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // Mode filter
      if (selectedMode !== 'ALL' && app.mode !== selectedMode) return false;

      // Status filter
      if (selectedStatus === 'FOR_APPROVAL' && app.status !== 'FOR_APPROVAL') return false;
      if (selectedStatus === 'APPROVED' && app.status !== 'APPROVED') return false;
      if (selectedStatus === 'EXPIRING_SOON' && app.status !== 'EXPIRING_SOON') return false;

      return true;
    });
  }, [filterText, selectedMode, selectedStatus]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterText, selectedMode, selectedStatus]);

  // ── Pagination ────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredApps.length / LIST_PAGE_SIZE));
  const pagedApps = filteredApps.slice(
    (currentPage - 1) * LIST_PAGE_SIZE,
    currentPage * LIST_PAGE_SIZE,
  );
  const showingCount = pagedApps.length;

  // ── Card expand / preview handlers ───────────────────────────────────
  const handleCardPress = (appId: string) => {
    setExpandedCardId((prev) => (prev === appId ? null : appId));
  };

  const handlePreview = (app: Application) => {
    setPreviewApp(app);
    // On mobile, we navigate into the detail pane
  };

  const handleBackFromPreview = () => {
    setPreviewApp(null);
  };

  // ── Mobile layout helpers ─────────────────────────────────────────────
  const isLeftHiddenOnMobile = isMobile && previewApp !== null;

  // ── Right pane renderer ───────────────────────────────────────────────
  const renderRightPane = () => {
    if (previewApp === null) {
      return (
        <View style={styles.emptyPlaceholder}>
          <View style={styles.placeholderIllustration}>
            <Icon name="file" size={48} color="#d1d5db" />
            <Icon
              name="mouse-pointer"
              size={24}
              color="#1d4ed8"
              style={styles.pointerOverlay}
            />
          </View>
          <Text style={styles.placeholderTitleText}>No application selected</Text>
          <Text style={styles.placeholderSubtitleText}>
            Select an application card from the list on the left to view
            detailed status logs and information.
          </Text>
        </View>
      );
    }

    if (previewApp.mode === 'SINGLE') {
      return (
        <SinglePreview
          app={previewApp as SingleApplication}
          onBack={handleBackFromPreview}
        />
      );
    }

    // previewApp.mode === 'BULK'
    return (
      <BulkPreview
        app={previewApp as BulkApplication}
        onBack={handleBackFromPreview}
      />
    );
  };

  return (
    <View style={styles.rootContainer}>
      {/* ── Top header ─────────────────────────────────────────────── */}
      <View style={styles.topHeader}>
        <View style={styles.logoWrapper}>
          <View style={styles.circularLogo}>
            <Icon name="globe" size={16} color="#1e40af" />
          </View>
          <Text style={styles.brandTitle}>NTC EDGE</Text>
          <Text style={styles.brandSubtitle}>PORTAL</Text>
        </View>

        {userProfile !== null && (
          <View style={styles.headerRight}>
            {!isMobile && (
              <Text style={styles.headerUserName}>{userProfile.name}</Text>
            )}
            <TouchableOpacity onPress={handleSignOut} style={styles.topLogoutBtn}>
              <Icon name="log-out" size={14} color="#ffffff" style={{ marginRight: 6 }} />
              {!isMobile && (
                <Text style={styles.topLogoutText}>Sign Out</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Main body ──────────────────────────────────────────────── */}
      <View style={styles.mainLayout}>

        {/* Left mini sidebar – hidden on mobile */}
        {!isMobile && (
          <View style={[styles.sidebar, isSidebarCollapsed && styles.sidebarCollapsed]}>
            <TouchableOpacity
              onPress={() => setIsSidebarCollapsed((prev) => !prev)}
              style={styles.collapseToggle}
            >
              <Icon
                name={isSidebarCollapsed ? 'chevron-right' : 'chevron-left'}
                size={16}
                color="#6b7280"
              />
            </TouchableOpacity>

            <View style={styles.sidebarItems}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Services')}
                style={styles.sidebarItem}
              >
                <Icon name="radio" size={20} color="#9ca3af" />
                {!isSidebarCollapsed && (
                  <Text style={styles.sidebarItemText}>Services</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={[styles.sidebarItem, styles.sidebarItemActive]}>
                <Icon name="credit-card" size={20} color="#1d4ed8" />
                {!isSidebarCollapsed && (
                  <Text style={styles.sidebarItemTextActive}>My Applications</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Left content column (application list) ───────────────── */}
        {!isLeftHiddenOnMobile && (
          <View style={styles.contentColumn}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Search bar */}
              <View style={styles.searchContainer}>
                <Icon name="search" size={16} color="#9ca3af" style={styles.searchIcon} />
                <TextInput
                  placeholder="Type to filter..."
                  placeholderTextColor="#9ca3af"
                  value={filterText}
                  onChangeText={setFilterText}
                  style={styles.searchInput}
                />
                {filterText.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setFilterText('')}
                    style={styles.clearSearch}
                  >
                    <Icon name="x" size={14} color="#9ca3af" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Meta row: count + Refresh + density */}
              <View style={styles.metaRow}>
                <Text style={styles.metaSummary}>
                  <Text style={styles.metaBold}>{filteredApps.length}</Text>
                  {' item(s) found'}
                  {filteredApps.length > 0 && (
                    <Text style={styles.metaShowing}>
                      {' · Showing '}
                      <Text style={styles.metaBold}>{showingCount}</Text>
                    </Text>
                  )}
                </Text>

                <View style={styles.metaActions}>
                  <TouchableOpacity style={styles.actionChip}>
                    <Icon name="refresh-cw" size={12} color="#475569" style={{ marginRight: 4 }} />
                    <Text style={styles.actionChipText}>Refresh</Text>
                  </TouchableOpacity>

                  {(['std', 'cozy', 'compact'] as DensityOption[]).map((d) => (
                    <TouchableOpacity
                      key={d}
                      onPress={() => setDensity(d)}
                      style={[
                        styles.actionChip,
                        density === d && styles.actionChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.actionChipText,
                          density === d && styles.actionChipTextActive,
                        ]}
                      >
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Mode filter pills */}
              <View style={styles.filterRow}>
                {(['ALL', 'SINGLE', 'BULK'] as ModeFilterOption[]).map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    onPress={() => setSelectedMode(mode)}
                    style={[
                      styles.filterPill,
                      selectedMode === mode && styles.filterPillActive,
                    ]}
                  >
                    {mode !== 'ALL' && (
                      <View
                        style={[
                          styles.filterDot,
                          { backgroundColor: MODE_DOT_COLORS[mode] },
                        ]}
                      />
                    )}
                    <Text
                      style={[
                        styles.filterPillText,
                        selectedMode === mode && styles.filterPillTextActive,
                      ]}
                    >
                      {mode === 'ALL' ? 'All' : mode.charAt(0) + mode.slice(1).toLowerCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Status filter chips */}
              <View style={styles.statusFilterRow}>
                {(
                  [
                    ['ALL', 'All Statuses'],
                    ['FOR_APPROVAL', 'For Approval'],
                    ['APPROVED', 'Approved'],
                    ['EXPIRING_SOON', 'Expiring Soon'],
                  ] as [StatusFilterOption, string][]
                ).map(([val, label]) => (
                  <TouchableOpacity
                    key={val}
                    onPress={() => setSelectedStatus(val)}
                    style={[
                      styles.statusChip,
                      selectedStatus === val && styles.statusChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusChipText,
                        selectedStatus === val && styles.statusChipTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Application cards */}
              {pagedApps.length === 0 ? (
                <View style={styles.emptyList}>
                  <Icon name="info" size={24} color="#9ca3af" style={{ marginBottom: 8 }} />
                  <Text style={styles.emptyListText}>No applications found.</Text>
                </View>
              ) : (
                pagedApps.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    app={app}
                    isExpanded={expandedCardId === app.id}
                    isSelected={previewApp?.id === app.id}
                    density={density}
                    onPress={() => handleCardPress(app.id)}
                    onPreview={() => handlePreview(app)}
                  />
                ))
              )}

              {/* List Pagination */}
              {totalPages > 1 && (
                <View style={styles.listPagination}>
                  <TouchableOpacity
                    onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={[
                      styles.listPageBtn,
                      currentPage === 1 && styles.listPageBtnDisabled,
                    ]}
                  >
                    <Icon
                      name="chevron-left"
                      size={14}
                      color={currentPage === 1 ? '#cbd5e1' : '#334155'}
                    />
                  </TouchableOpacity>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <TouchableOpacity
                      key={pg}
                      onPress={() => setCurrentPage(pg)}
                      style={[
                        styles.listPageBtn,
                        pg === currentPage && styles.listPageBtnCurrent,
                      ]}
                    >
                      <Text
                        style={[
                          styles.listPageBtnText,
                          pg === currentPage && styles.listPageBtnTextCurrent,
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
                      styles.listPageBtn,
                      currentPage === totalPages && styles.listPageBtnDisabled,
                    ]}
                  >
                    <Icon
                      name="chevron-right"
                      size={14}
                      color={currentPage === totalPages ? '#cbd5e1' : '#334155'}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        )}

        {/* ── Right pane (details / preview) ───────────────────────── */}
        {(!isMobile || previewApp !== null) && (
          <View style={[styles.detailsColumn, isMobile && styles.mobileDetailsColumn]}>
            {renderRightPane()}
          </View>
        )}
      </View>

      {/* ── Footer banner ──────────────────────────────────────────── */}
      <View style={styles.footerBanner}>
        <Text style={styles.footerText}>National Telecommunications Commission</Text>
        <Text style={styles.footerButtonText}>I'm done!</Text>
      </View>
    </View>
  );
}
