import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  Switch,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide, useTheme } from '@edge/ui';
import { RegionalConfigCard, BranchOffice, BranchOfficeStats } from '../data/mockAdminSettings';
import { DeleteAdminItemModal } from './DeleteAdminItemModal';

interface RegionalConfigTabProps {
  configs: RegionalConfigCard[];
  branchOffices: BranchOffice[];
  stats: BranchOfficeStats;
  mode?: 'details' | 'branches' | 'all';
  onEditConfig: (config: RegionalConfigCard) => void;
  onDeleteConfig: (id: string, name: string) => void;
  onAddBranchOffice: () => void;
  onEditBranchOffice: (branch: BranchOffice) => void;
  onDeleteBranchOffice: (id: string, name: string) => void;
}

type IconName = keyof typeof Lucide.glyphMap;

function isIconName(icon: string): icon is IconName {
  return icon in Lucide.glyphMap;
}

const BRANCH_FILTERS: readonly ('All' | 'Main Office' | 'Field Office')[] = ['All', 'Main Office', 'Field Office'];

export function RegionalConfigTab({
  configs,
  branchOffices,
  stats,
  mode = 'all',
  onEditConfig,
  onDeleteConfig,
  onAddBranchOffice,
  onEditBranchOffice,
  onDeleteBranchOffice,
}: RegionalConfigTabProps) {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [isEmailNotificationActive, setIsEmailNotificationActive] = useState(false);
  const [toggleConfirmModal, setToggleConfirmModal] = useState<{ visible: boolean; nextState: boolean }>({
    visible: false,
    nextState: false,
  });
  const [branchSearchQuery, setBranchSearchQuery] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<'All' | 'Main Office' | 'Field Office'>('All');

  // Filter branch offices
  const filteredBranchOffices = useMemo(() => {
    return branchOffices.filter((b) => {
      if (selectedBranchFilter !== 'All' && b.type !== selectedBranchFilter) {
        return false;
      }
      if (branchSearchQuery.trim().length > 0) {
        const q = branchSearchQuery.toLowerCase().trim();
        const matchesName = b.name.toLowerCase().includes(q);
        const matchesCode = b.code.toLowerCase().includes(q);
        const matchesType = b.type.toLowerCase().includes(q);
        return matchesName || matchesCode || matchesType;
      }
      return true;
    });
  }, [branchOffices, branchSearchQuery, selectedBranchFilter]);

  const showDetails = mode === 'all' || mode === 'details';
  const showBranches = mode === 'all' || mode === 'branches';

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[mode === 'all' ? styles.twoColumnContainer : styles.fullWidthContainer, isMobile && styles.twoColumnContainerMobile]}>
        {/* LEFT / FULL COLUMN: REGIONAL OFFICE DETAILS & SUPPORT CONTACTS */}
        {showDetails && (
          <View style={[mode === 'all' ? styles.leftDetailColumn : styles.fullWidthColumn, isMobile && styles.leftDetailColumnMobile]}>
          {/* 1. Regional Email Notification System Banner */}
          <View
            style={[
              styles.notificationBanner,
              {
                backgroundColor: isDark ? colors.neutral[900] : colors.brand.light,
                borderColor: isDark ? colors.neutral[800] : colors.border,
              },
            ]}
          >
            <View style={styles.bannerLeft}>
              <View
                style={[
                  styles.bannerIconWrapper,
                  { backgroundColor: isDark ? colors.neutral[800] : colors.cardBg },
                ]}
              >
                <Lucide name="mail" size={20} color={isDark ? colors.brand[500] : colors.brand.primary} />
              </View>
              <View style={styles.bannerTextWrapper}>
                <Text style={[styles.bannerTitle, { color: colors.text }]}>
                  Email Alerts System
                </Text>
                <Text style={[styles.bannerDescription, { color: colors.textMuted }]}>
                  Instant region notifications for application cycles.
                </Text>
              </View>
            </View>

            <View style={styles.bannerRight}>
              <Text
                style={[
                  styles.statusText,
                  {
                    color: isEmailNotificationActive
                      ? (isDark ? colors.brand[500] : colors.brand.primary)
                      : COLORS.semantic.error,
                  },
                ]}
              >
                {isEmailNotificationActive ? 'ACTIVE' : 'INACTIVE'}
              </Text>
              <Switch
                value={isEmailNotificationActive}
                onValueChange={(val) => setToggleConfirmModal({ visible: true, nextState: val })}
                trackColor={{
                  false: isDark ? colors.neutral[700] : colors.neutral[300],
                  true: isDark ? colors.brand[600] : colors.brand.primary,
                }}
                thumbColor={isDark ? colors.neutral[100] : COLORS.neutral.white}
              />
            </View>
          </View>

          {/* 2. Grid of Regional Configuration Cards */}
          <View style={styles.gridContainer}>
            {configs.map((card) => {
              const iconName: IconName = isIconName(card.icon) ? card.icon : 'help-circle';
              return (
                <View
                  key={card.id}
                  style={[
                    styles.card,
                    { backgroundColor: colors.cardBg, borderColor: colors.border },
                    SHADOWS.card,
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleRow}>
                      <View
                        style={[
                          styles.cardIconBox,
                          { backgroundColor: isDark ? colors.neutral[800] : card.iconBg },
                        ]}
                      >
                        <Lucide
                          name={iconName}
                          size={18}
                          color={isDark ? colors.brand[500] : card.iconColor}
                        />
                      </View>
                      <View style={styles.cardHeaderTitles}>
                        <Text style={[styles.cardCategoryText, { color: colors.text }]}>{card.category}</Text>
                        <Text style={[styles.cardSubtitleText, { color: colors.textMuted }]}>{card.subtitle}</Text>
                      </View>
                    </View>

                    {/* Edit & Delete Action Buttons */}
                    <View style={styles.actionButtonsRow}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.iconActionBtn,
                          { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] },
                          pressed && { opacity: 0.7 },
                          Platform.select({ web: { cursor: 'pointer' } }),
                        ]}
                        onPress={() => onEditConfig(card)}
                        accessibilityLabel={`Edit ${card.category}`}
                      >
                        <Lucide name="edit-2" size={14} color={colors.textMuted} />
                      </Pressable>
                      <Pressable
                        style={({ pressed }) => [
                          styles.iconActionBtn,
                          styles.iconDeleteBtn,
                          pressed && { opacity: 0.7 },
                          Platform.select({ web: { cursor: 'pointer' } }),
                        ]}
                        onPress={() => onDeleteConfig(card.id, card.category)}
                        accessibilityLabel={`Delete ${card.category}`}
                      >
                        <Lucide name="trash-2" size={14} color={COLORS.semantic.error} />
                      </Pressable>
                    </View>
                  </View>

                  {/* Card Main Info: Region Details + Commissioner + Support Contact */}
                  <View style={styles.cardBody}>
                    <Text style={[styles.cardNameText, { color: colors.text }]}>{card.name}</Text>

                    {/* Region Details Badges: RC Code & Office Code */}
                    <View style={styles.codesRow}>
                      <View style={[styles.codeBadgePill, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
                        <Lucide name="shield" size={10} color={isDark ? colors.brand[500] : colors.brand.primary} />
                        <Text style={[styles.codeBadgeText, { color: isDark ? colors.brand[500] : colors.brand.primary }]}>
                          RC CODE: {card.rcCode || 'RC-10'}
                        </Text>
                      </View>

                      <View style={[styles.codeBadgePill, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
                        <Lucide name="layers" size={10} color={colors.textMuted} />
                        <Text style={[styles.codeBadgeText, { color: colors.textMuted }]}>
                          OFFICE: {card.officeCode || 'R10-MAIN'}
                        </Text>
                      </View>
                    </View>

                    {/* Commissioner Name */}
                    <View style={styles.commissionerRow}>
                      <Lucide name="user-check" size={13} color={colors.textMuted} />
                      <Text style={[styles.commissionerText, { color: colors.text }]}>
                        {card.commissionerName || 'Comm. Ella Blanca B. Lopez'}{' '}
                        <Text style={{ color: colors.textMuted, fontSize: 11 }}>(NTC Commissioner)</Text>
                      </Text>
                    </View>

                    {/* Support Contact Fields */}
                    <View style={[styles.supportContactBox, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50], borderColor: colors.border }]}>
                      <Text style={[styles.supportTitle, { color: colors.textMuted }]}>SUPPORT CONTACT DETAILS</Text>
                      <View style={styles.supportLine}>
                        <Lucide name="mail" size={12} color={isDark ? colors.brand[500] : colors.brand.primary} />
                        <Text style={[styles.supportValue, { color: colors.text }]}>{card.supportEmail || 'region10@ntc.gov.ph'}</Text>
                      </View>
                      <View style={styles.supportLine}>
                        <Lucide name="phone" size={12} color={isDark ? colors.brand[500] : colors.brand.primary} />
                        <Text style={[styles.supportValue, { color: colors.text }]}>{card.supportPhone || '(088) 856-1234 / (02) 8924-4008'}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Optional Status Badge at bottom left */}
                  {card.badge !== undefined && card.badge !== null && (
                    <View style={styles.cardFooter}>
                      <View
                        style={[
                          styles.badge,
                          { backgroundColor: isDark ? colors.neutral[800] : colors.brand.light },
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            { color: isDark ? colors.brand[500] : colors.brand.primary },
                          ]}
                        >
                          {card.badge.text}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      )}

        {/* RIGHT / FULL COLUMN: BRANCH OFFICE DIRECTORY & STATS */}
        {showBranches && (
          <View style={[mode === 'all' ? styles.rightDirectoryColumn : styles.fullWidthColumn]}>

      {/* 3. Regional Branch Offices Header */}
      <View style={[styles.sectionHeaderRow, isMobile && styles.sectionHeaderMobile]}>
        <View style={styles.sectionTitleWrapper}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Regional Branch Offices</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
            Configure, update, and manage regional sub-branch office locations and contacts.
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.addBranchBtn,
            { backgroundColor: isDark ? colors.brand[600] : colors.brand.primary },
            pressed && { opacity: 0.8 },
            Platform.select({ web: { cursor: 'pointer' } }),
          ]}
          onPress={onAddBranchOffice}
          accessibilityLabel="Add Branch Office"
        >
          <Lucide name="plus" size={15} color={COLORS.neutral.white} />
          <Text style={styles.addBranchBtnText}>Add Branch Office</Text>
        </Pressable>
      </View>

      {/* 4. Statistics Cards */}
      <View style={[styles.statsContainer, isMobile && styles.statsContainerMobile]}>
        {/* Total Stat */}
        <View
          style={[
            styles.statCard,
            { backgroundColor: colors.cardBg, borderColor: colors.border },
            SHADOWS.card,
            isMobile && styles.statCardMobile,
          ]}
        >
          <Text style={[styles.statNumber, { color: colors.text }]}>{stats.total}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Branches</Text>
        </View>

        {/* Main Office Stat */}
        <View
          style={[
            styles.statCard,
            { backgroundColor: colors.cardBg, borderColor: colors.border },
            SHADOWS.card,
            isMobile && styles.statCardMobile,
          ]}
        >
          <Text style={[styles.statNumber, { color: colors.text }]}>{stats.mainOffice}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Main Regional Offices</Text>
        </View>

        {/* Field Office Stat */}
        <View
          style={[
            styles.statCard,
            { backgroundColor: colors.cardBg, borderColor: colors.border },
            SHADOWS.card,
            isMobile && styles.statCardMobile,
          ]}
        >
          <Text style={[styles.statNumber, { color: colors.text }]}>{stats.fieldOffice}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Field Offices</Text>
        </View>
      </View>

      {/* 5. Branch Offices Search & Filter Bar */}
      <View style={[styles.branchFilterBar, isMobile && styles.branchFilterBarMobile]}>
        <View
          style={[
            styles.branchSearchBox,
            { backgroundColor: colors.cardBg, borderColor: colors.border },
          ]}
        >
          <Lucide name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={[styles.branchSearchInput, { color: colors.text }]}
            placeholder="Search branch name, code, or type..."
            placeholderTextColor={colors.textMuted}
            value={branchSearchQuery}
            onChangeText={setBranchSearchQuery}
          />
          {branchSearchQuery.length > 0 && (
            <Pressable
              onPress={() => setBranchSearchQuery('')}
              style={Platform.select({ web: { cursor: 'pointer' } })}
            >
              <Lucide name="x" size={16} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        {/* Category Filter Pills */}
        <View style={styles.branchFilterGroup}>
          {BRANCH_FILTERS.map((filter) => {
            const isActive = selectedBranchFilter === filter;
            return (
              <Pressable
                key={filter}
                style={[
                  styles.filterPillBtn,
                  { borderColor: colors.border },
                  isActive && {
                    backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                    borderColor: isDark ? colors.brand[500] : colors.brand.primary,
                  },
                  Platform.select({ web: { cursor: 'pointer' } }),
                ]}
                onPress={() => setSelectedBranchFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    { color: isActive ? (isDark ? colors.brand[500] : colors.brand.primary) : colors.textMuted },
                    isActive && { fontWeight: TYPOGRAPHY.weights.semibold },
                  ]}
                >
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 6. Branch Offices List Rows */}
      <View style={styles.branchListContainer}>
        {filteredBranchOffices.length === 0 ? (
          <View
            style={[
              styles.emptyBranchCard,
              { backgroundColor: colors.cardBg, borderColor: colors.border },
              SHADOWS.card,
            ]}
          >
            <Lucide name="map-pin" size={32} color={colors.textMuted} />
            <Text style={[styles.emptyBranchTitle, { color: colors.text }]}>No matching branch offices</Text>
            <Text style={[styles.emptyBranchSubtitle, { color: colors.textMuted }]}>
              Try searching with a different office code or name.
            </Text>
          </View>
        ) : (
          filteredBranchOffices.map((branch) => (
            <View
              key={branch.id}
              style={[
                styles.branchCardRow,
                { backgroundColor: colors.cardBg, borderColor: colors.border },
                SHADOWS.card,
              ]}
            >
              <View style={styles.branchRowLeft}>
                <View
                  style={[
                    styles.branchPinBox,
                    { backgroundColor: isDark ? colors.neutral[800] : colors.brand.light },
                  ]}
                >
                  <Lucide name="map-pin" size={18} color={isDark ? colors.brand[500] : colors.brand.primary} />
                </View>
                <View style={styles.branchInfo}>
                  <View style={styles.branchTitleLine}>
                    <Text style={[styles.branchName, { color: colors.text }]}>{branch.name}</Text>
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          { color: isDark ? colors.brand[500] : colors.brand.primary },
                        ]}
                      >
                        {branch.type}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.branchDetailsRow}>
                    <Text style={[styles.branchCodeText, { color: colors.textMuted }]}>CODE: {branch.code}</Text>
                    {branch.address && (
                      <Text style={[styles.branchAddressText, { color: colors.textMuted }]}>
                        · {branch.address}
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtonsRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.iconActionBtn,
                    { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] },
                    pressed && { opacity: 0.7 },
                    Platform.select({ web: { cursor: 'pointer' } }),
                  ]}
                  onPress={() => onEditBranchOffice(branch)}
                  accessibilityLabel={`Edit ${branch.name}`}
                >
                  <Lucide name="edit-2" size={14} color={colors.textMuted} />
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.iconActionBtn,
                    styles.iconDeleteBtn,
                    pressed && { opacity: 0.7 },
                    Platform.select({ web: { cursor: 'pointer' } }),
                  ]}
                  onPress={() => onDeleteBranchOffice(branch.id, branch.name)}
                  accessibilityLabel={`Delete ${branch.name}`}
                >
                  <Lucide name="trash-2" size={14} color={COLORS.semantic.error} />
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>
        </View>
      )}
    </View>

      {/* Confirmation Modal for Email Notification Toggle */}
      <DeleteAdminItemModal
        visible={toggleConfirmModal.visible}
        itemTitle={`Regional Email Notification System (${toggleConfirmModal.nextState ? 'ENABLE' : 'DISABLE'})`}
        itemType="System Notification Status"
        onClose={() => setToggleConfirmModal((prev) => ({ ...prev, visible: false }))}
        onConfirm={() => {
          setIsEmailNotificationActive(toggleConfirmModal.nextState);
          setToggleConfirmModal((prev) => ({ ...prev, visible: false }));
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING[16],
    padding: SPACING[16],
  },
  twoColumnContainer: {
    flexDirection: 'row',
    gap: SPACING[16],
    alignItems: 'flex-start',
  },
  twoColumnContainerMobile: {
    flexDirection: 'column',
  },
  fullWidthContainer: {
    width: '100%',
    gap: SPACING[16],
  },
  fullWidthColumn: {
    width: '100%',
    gap: SPACING[16],
  },
  leftDetailColumn: {
    width: 380,
    gap: SPACING[16],
  },
  leftDetailColumnMobile: {
    width: '100%',
  },
  rightDirectoryColumn: {
    flex: 1,
    gap: SPACING[16],
    minWidth: 0,
  },

  // Notification Banner
  notificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: RADIUS.card,
    padding: SPACING[16],
    flexWrap: 'wrap',
    gap: SPACING[12],
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    flex: 1,
    minWidth: 260,
  },
  bannerIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.input,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTextWrapper: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  bannerDescription: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    marginTop: 2,
  },
  bannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },

  // Cards Grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[16],
  },
  gridContainerMobile: {
    flexDirection: 'column',
  },
  card: {
    flex: 1,
    minWidth: 280,
    borderRadius: RADIUS.card,
    padding: SPACING[16],
    borderWidth: 1,
    gap: SPACING[12],
  },
  cardMobile: {
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[10],
    flex: 1,
  },
  cardIconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.input,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeaderTitles: {
    flex: 1,
  },
  cardCategoryText: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  cardSubtitleText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  cardBody: {
    gap: SPACING[10],
  },
  cardNameText: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  codesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
  },
  codeBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING[8],
    paddingVertical: 3,
    borderRadius: RADIUS.button,
  },
  codeBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  commissionerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commissionerText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  supportContactBox: {
    padding: SPACING[10],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: 4,
  },
  supportTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.semibold,
    letterSpacing: 0.5,
  },
  supportLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  supportValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Buttons & Badges
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[6],
  },
  iconActionBtn: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconDeleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  badge: {
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[4],
    borderRadius: RADIUS.button,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  // Section Header
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING[12],
  },
  sectionHeaderMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: SPACING[10],
  },
  sectionTitleWrapper: {
    gap: 2,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.heading,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  addBranchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[6],
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.button,
  },
  addBranchBtnText: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.neutral.white,
  },

  // Stats Grid
  statsContainer: {
    flexDirection: 'row',
    gap: SPACING[12],
  },
  statsContainerMobile: {
    flexDirection: 'column',
  },
  statCard: {
    flex: 1,
    padding: SPACING[12],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: 2,
  },
  statCardMobile: {
    width: '100%',
  },
  statNumber: {
    fontSize: TYPOGRAPHY.sizes.heading,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },

  // Search & Filter
  branchFilterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
  },
  branchFilterBarMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  branchSearchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.input,
    borderWidth: 1,
  },
  branchSearchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fonts.primary,
    padding: 0,
  },
  branchFilterGroup: {
    flexDirection: 'row',
    gap: SPACING[6],
  },
  filterPillBtn: {
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[6],
    borderRadius: RADIUS.button,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },

  // Branch Rows
  branchListContainer: {
    gap: SPACING[10],
  },
  emptyBranchCard: {
    padding: SPACING[32],
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    gap: SPACING[8],
  },
  emptyBranchTitle: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  emptyBranchSubtitle: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  branchCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING[12],
    borderRadius: RADIUS.card,
    borderWidth: 1,
  },
  branchRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    flex: 1,
  },
  branchPinBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.input,
    justifyContent: 'center',
    alignItems: 'center',
  },
  branchInfo: {
    gap: 2,
    flex: 1,
  },
  branchTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
  },
  branchName: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  branchDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[6],
  },
  branchCodeText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  branchAddressText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
});
