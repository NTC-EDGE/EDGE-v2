import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Switch,
  useWindowDimensions,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';
import { RegionalConfigCard, BranchOfficeStats } from '../data/mockAdminSettings';

interface RegionalConfigTabProps {
  configs: RegionalConfigCard[];
  stats: BranchOfficeStats;
  onEditConfig: (config: RegionalConfigCard) => void;
  onDeleteConfig: (id: string) => void;
  onAddBranchOffice: () => void;
}

export function RegionalConfigTab({
  configs,
  stats,
  onEditConfig,
  onDeleteConfig,
  onAddBranchOffice,
}: RegionalConfigTabProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [isEmailNotificationActive, setIsEmailNotificationActive] = useState(false);

  return (
    <View style={styles.container}>
      {/* 1. Regional Email Notification System Banner */}
      <View style={styles.notificationBanner}>
        <View style={styles.bannerLeft}>
          <View style={styles.bannerIconWrapper}>
            <Lucide name="mail" size={20} color="#4F46E5" />
          </View>
          <View style={styles.bannerTextWrapper}>
            <Text style={styles.bannerTitle}>Regional Email Notification System</Text>
            <Text style={styles.bannerDescription}>
              Instantly alert personnel and administrators in Region-XIV when application cycles update or forms are triggered.
            </Text>
          </View>
        </View>

        <View style={styles.bannerRight}>
          <Text
            style={[
              styles.statusText,
              isEmailNotificationActive ? styles.statusActive : styles.statusInactive,
            ]}
          >
            {isEmailNotificationActive ? 'ACTIVE' : 'INACTIVE'}
          </Text>
          <Switch
            value={isEmailNotificationActive}
            onValueChange={setIsEmailNotificationActive}
            trackColor={{ false: '#CBD5E1', true: '#818CF8' }}
            thumbColor={isEmailNotificationActive ? '#4F46E5' : '#FFFFFF'}
          />
        </View>
      </View>

      {/* 2. 2x2 Grid of Regional Configuration Cards */}
      <View style={[styles.gridContainer, isMobile && styles.gridContainerMobile]}>
        {configs.map((card) => (
          <View
            key={card.id}
            style={[styles.card, SHADOWS.card, isMobile && styles.cardMobile]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <View style={[styles.cardIconBox, { backgroundColor: card.iconBg }]}>
                  <Lucide name={card.icon as keyof typeof Lucide.glyphMap} size={18} color={card.iconColor} />
                </View>
                <View style={styles.cardHeaderTitles}>
                  <Text style={styles.cardCategoryText}>{card.category}</Text>
                  <Text style={styles.cardSubtitleText}>{card.subtitle}</Text>
                </View>
              </View>

              {/* Edit & Delete Action Buttons */}
              <View style={styles.actionButtonsRow}>
                <Pressable
                  style={styles.iconActionBtn}
                  onPress={() => onEditConfig(card)}
                  accessibilityLabel={`Edit ${card.category}`}
                >
                  <Lucide name="edit-2" size={15} color={COLORS.neutral[600]} />
                </Pressable>
                <Pressable
                  style={[styles.iconActionBtn, styles.iconDeleteBtn]}
                  onPress={() => onDeleteConfig(card.id)}
                  accessibilityLabel={`Delete ${card.category}`}
                >
                  <Lucide name="trash-2" size={15} color="#EF4444" />
                </Pressable>
              </View>
            </View>

            {/* Card Main Info */}
            <View style={styles.cardBody}>
              <Text style={styles.cardNameText}>{card.name}</Text>
              <Text style={styles.cardSubLabelText}>{card.subLabel}</Text>
            </View>

            {/* Optional Status Badge at bottom left */}
            {card.badge !== undefined && card.badge !== null && (
              <View style={styles.cardFooter}>
                <View
                  style={[
                    styles.badge,
                    card.badge.type === 'commissioner' && styles.badgeCommissioner,
                    card.badge.type === 'primary' && styles.badgePrimary,
                    card.badge.type === 'active' && styles.badgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      card.badge.type === 'commissioner' && styles.badgeTextCommissioner,
                      card.badge.type === 'primary' && styles.badgeTextPrimary,
                      card.badge.type === 'active' && styles.badgeTextActive,
                    ]}
                  >
                    {card.badge.text}
                  </Text>
                </View>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* 3. Regional Branch Offices Header */}
      <View style={[styles.sectionHeaderRow, isMobile && styles.sectionHeaderMobile]}>
        <View style={styles.sectionTitleWrapper}>
          <Text style={styles.sectionTitle}>Regional Branch Offices</Text>
          <Text style={styles.sectionSubtitle}>
            Configure, update, and manage regional sub-branch offices.
          </Text>
        </View>
        <Pressable
          style={styles.addBranchBtn}
          onPress={onAddBranchOffice}
          accessibilityLabel="Add Branch Office"
        >
          <Lucide name="plus" size={16} color={COLORS.neutral.white} />
          <Text style={styles.addBranchBtnText}>Add Branch Office</Text>
        </Pressable>
      </View>

      {/* 4. Statistics Cards at Bottom */}
      <View style={[styles.statsContainer, isMobile && styles.statsContainerMobile]}>
        {/* Total Stat */}
        <View style={[styles.statCard, SHADOWS.card, isMobile && styles.statCardMobile]}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
          <View style={[styles.badge, styles.badgeYellowPill]}>
            <Text style={[styles.badgeText, styles.badgeTextYellow]}>Total</Text>
          </View>
        </View>

        {/* Main Office Stat */}
        <View style={[styles.statCard, SHADOWS.card, isMobile && styles.statCardMobile]}>
          <Text style={styles.statNumber}>{stats.mainOffice}</Text>
          <Text style={styles.statLabel}>Main Office</Text>
          <View style={[styles.badge, styles.badgeGreenPill]}>
            <Text style={[styles.badgeText, styles.badgeTextGreen]}>Main Office</Text>
          </View>
        </View>

        {/* Field Office Stat */}
        <View style={[styles.statCard, SHADOWS.card, isMobile && styles.statCardMobile]}>
          <Text style={styles.statNumber}>{stats.fieldOffice}</Text>
          <Text style={styles.statLabel}>Field Office</Text>
          <View style={[styles.badge, styles.badgeBluePill]}>
            <Text style={[styles.badgeText, styles.badgeTextBlue]}>Field Office</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING[24],
    paddingBottom: SPACING[32],
  },

  // Notification Banner
  notificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EEF2FF',
    borderColor: '#E0E7FF',
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
    width: 42,
    height: 42,
    borderRadius: RADIUS.input,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTextWrapper: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  bannerDescription: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[600],
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
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusActive: {
    color: '#10B981',
  },
  statusInactive: {
    color: '#EF4444',
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
    width: '48.5%',
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    padding: SPACING[16],
    borderColor: COLORS.neutral[200],
    borderWidth: 1,
    justifyContent: 'space-between',
    minHeight: 160,
  },
  cardMobile: {
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    flex: 1,
  },
  cardIconBox: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.input,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeaderTitles: {
    flex: 1,
  },
  cardCategoryText: {
    fontSize: TYPOGRAPHY.sizes.cardTitle,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  cardSubtitleText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[500],
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[4],
  },
  iconActionBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.input,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  iconDeleteBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  cardBody: {
    marginTop: SPACING[12],
  },
  cardNameText: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  cardSubLabelText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[600],
    marginTop: 2,
  },
  cardFooter: {
    marginTop: SPACING[12],
    alignItems: 'flex-start',
  },

  // Badges
  badge: {
    paddingHorizontal: SPACING[8],
    paddingVertical: 3,
    borderRadius: RADIUS.circle,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
  },
  badgeCommissioner: {
    backgroundColor: '#FEE2E2',
  },
  badgeTextCommissioner: {
    color: '#DC2626',
  },
  badgePrimary: {
    backgroundColor: '#FEF3C7',
  },
  badgeTextPrimary: {
    color: '#D97706',
  },
  badgeActive: {
    backgroundColor: '#DCFCE7',
  },
  badgeTextActive: {
    color: '#16A34A',
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
    gap: SPACING[12],
  },
  sectionTitleWrapper: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.section,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  addBranchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[4],
    backgroundColor: COLORS.brand[600],
    paddingHorizontal: SPACING[16],
    paddingVertical: 10,
    borderRadius: RADIUS.button,
  },
  addBranchBtnText: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral.white,
    fontWeight: '600',
  },

  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    gap: SPACING[16],
  },
  statsContainerMobile: {
    flexDirection: 'column',
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    padding: SPACING[16],
    borderColor: COLORS.neutral[200],
    borderWidth: 1,
    gap: SPACING[4],
  },
  statCardMobile: {
    width: '100%',
  },
  statNumber: {
    fontSize: TYPOGRAPHY.sizes.heading,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '800',
    color: COLORS.neutral[900],
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[500],
    fontWeight: '500',
  },
  badgeYellowPill: {
    backgroundColor: '#FEF3C7',
  },
  badgeTextYellow: {
    color: '#D97706',
  },
  badgeGreenPill: {
    backgroundColor: '#DCFCE7',
  },
  badgeTextGreen: {
    color: '#16A34A',
  },
  badgeBluePill: {
    backgroundColor: '#DBEAFE',
  },
  badgeTextBlue: {
    color: '#2563EB',
  },
});
