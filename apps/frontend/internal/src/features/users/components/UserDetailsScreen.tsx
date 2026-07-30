import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide, StatusBadge } from '@edge/ui';
import { User } from '../data/mockUsers';

interface UserDetailsScreenProps {
  user: User;
  onBack: () => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UserDetailsScreen({ user, onBack, onEdit, onDelete }: UserDetailsScreenProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.innerWrapper}>
        {/* Back Button Header */}
        <View style={styles.topNav}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <Lucide name="arrow-left" size={16} color={COLORS.brand[700]} style={styles.backIcon} />
            <Text style={styles.backBtnText}>Back to Users</Text>
          </Pressable>
        </View>

        {/* Hero Header Card */}
        <View style={[styles.heroCard, SHADOWS.card]}>
          <View style={[styles.heroMain, isMobile && styles.heroMainMobile]}>
            {/* Avatar */}
            <View style={styles.avatarSection}>
              {user.avatarType === 'icon' ? (
                <View style={styles.avatarIconCircle}>
                  <Lucide name="user" size={32} color={COLORS.neutral[500]} />
                </View>
              ) : (
                <View style={[styles.avatarInitialsCircle, { backgroundColor: user.avatarBgColor || COLORS.brand.royalBlue }]}>
                  <Text style={styles.avatarInitialsText}>
                    {user.avatarInitials || user.name.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            {/* Profile Info */}
            <View style={styles.profileSection}>
              <View style={styles.titleRow}>
                <Text style={styles.userName}>{user.name}</Text>
                <StatusBadge status={user.status} />
              </View>

              <View style={styles.badgesRow}>
                <View style={styles.clientIdBadge}>
                  <Text style={styles.clientIdText}>Client ID: {user.id}</Text>
                </View>
                <View style={user.accountType === 'Company' ? styles.companyBadge : styles.individualBadge}>
                  <Text style={user.accountType === 'Company' ? styles.companyBadgeText : styles.individualBadgeText}>
                    {user.accountType}
                  </Text>
                </View>
                <View style={styles.regionBadge}>
                  <Text style={styles.regionBadgeText}>{user.region}</Text>
                </View>
              </View>

              <Text style={styles.userDesc}>{user.description || 'Client account registered under NTC Edge Portal.'}</Text>
            </View>

            {/* Action Buttons */}
            <View style={[styles.actionButtons, isMobile && styles.actionButtonsMobile]}>
              <Pressable style={styles.editBtn} onPress={() => onEdit(user)}>
                <Lucide name="edit-2" size={14} color={COLORS.brand[700]} style={styles.btnIcon} />
                <Text style={styles.editBtnText}>Edit User</Text>
              </Pressable>

              <Pressable style={styles.deleteBtn} onPress={() => onDelete(user)}>
                <Lucide name="trash-2" size={14} color={COLORS.semantic.error} style={styles.btnIcon} />
                <Text style={styles.deleteBtnText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={[styles.statsGrid, isMobile && styles.statsGridMobile]}>
          <View style={[styles.statCard, SHADOWS.card]}>
            <View style={[styles.statIconBg, { backgroundColor: COLORS.brand.light }]}>
              <Lucide name="file-text" size={20} color={COLORS.brand.secondary} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Applications</Text>
              <Text style={styles.statValue}>{user.applicationsCount}</Text>
            </View>
          </View>

          <View style={[styles.statCard, SHADOWS.card]}>
            <View style={[styles.statIconBg, { backgroundColor: COLORS.semantic.successBg }]}>
              <Lucide name="briefcase" size={20} color={COLORS.semantic.success} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Account Type</Text>
              <Text style={styles.statValue}>{user.accountType}</Text>
            </View>
          </View>

          <View style={[styles.statCard, SHADOWS.card]}>
            <View style={[styles.statIconBg, { backgroundColor: COLORS.semantic.warningBg }]}>
              <Lucide name="map-pin" size={20} color={COLORS.semantic.warningText} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Region</Text>
              <Text style={styles.statValue}>{user.region}</Text>
            </View>
          </View>

          <View style={[styles.statCard, SHADOWS.card]}>
            <View style={[styles.statIconBg, { backgroundColor: COLORS.brand.purpleLight }]}>
              <Lucide name="calendar" size={20} color={COLORS.brand.purpleDark} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Registration Date</Text>
              <Text style={styles.statValue}>{user.createdDate}</Text>
            </View>
          </View>
        </View>

        {/* Information Grid */}
        <View style={[styles.detailsGrid, isMobile && styles.detailsGridMobile]}>
          {/* Contact Details Card */}
          <View style={[styles.infoCard, SHADOWS.card]}>
            <Text style={styles.cardHeaderTitle}>Contact & Location Information</Text>

            <View style={styles.infoRow}>
              <View style={styles.infoIconWrapper}>
                <Lucide name="mail" size={16} color={COLORS.neutral[500]} />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconWrapper}>
                <Lucide name="phone" size={16} color={COLORS.neutral[500]} />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>{user.phone}</Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconWrapper}>
                <Lucide name="map-pin" size={16} color={COLORS.neutral[500]} />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>Complete Address</Text>
                <Text style={styles.infoValue}>{user.address}</Text>
              </View>
            </View>
          </View>

          {/* Applications Summary Card */}
          <View style={[styles.infoCard, SHADOWS.card]}>
            <Text style={styles.cardHeaderTitle}>Applications Overview</Text>

            <View style={styles.appItemRow}>
              <View style={styles.appItemIcon}>
                <Lucide name="radio" size={16} color={COLORS.brand[600]} />
              </View>
              <View style={styles.appItemTextGroup}>
                <Text style={styles.appItemTitle}>Radio Station Permit Application</Text>
                <Text style={styles.appItemSubtitle}>Submitted on Jan 18, 2024 • Status: In Review</Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.appItemRow}>
              <View style={styles.appItemIcon}>
                <Lucide name="check-circle" size={16} color={COLORS.semantic.success} />
              </View>
              <View style={styles.appItemTextGroup}>
                <Text style={styles.appItemTitle}>Spectrum Frequency Authorization</Text>
                <Text style={styles.appItemSubtitle}>Approved on Feb 02, 2024 • License Active</Text>
              </View>
            </View>

            {user.applicationsCount > 2 && (
              <>
                <View style={styles.infoDivider} />
                <View style={styles.appItemRow}>
                  <View style={styles.appItemIcon}>
                    <Lucide name="clock" size={16} color={COLORS.neutral[600]} />
                  </View>
                  <View style={styles.appItemTextGroup}>
                    <Text style={styles.appItemTitle}>Equipment Compliance Certificate</Text>
                    <Text style={styles.appItemSubtitle}>Submitted on Mar 10, 2024 • Pending Evaluation</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  contentContainer: {
    padding: SPACING[20],
    paddingBottom: SPACING[40],
  },
  innerWrapper: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },

  topNav: {
    marginBottom: SPACING[16],
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: SPACING[12],
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  backIcon: {
    marginRight: 6,
  },
  backBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[700],
  },

  heroCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[24],
    marginBottom: SPACING[20],
  },
  heroMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  heroMainMobile: {
    flexDirection: 'column',
  },

  avatarSection: {
    marginRight: SPACING[20],
    marginBottom: SPACING[12],
  },
  avatarIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialsCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialsText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: 22,
    color: COLORS.neutral.white,
  },

  profileSection: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    marginBottom: SPACING[8],
  },
  userName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },

  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING[8],
    marginBottom: SPACING[12],
  },
  clientIdBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: COLORS.neutral[100],
  },
  clientIdText: {
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'Courier',
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[700],
  },
  individualBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: COLORS.neutral[100],
  },
  individualBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.neutral[600],
  },
  companyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: COLORS.brand.light,
  },
  companyBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.brand.royalBlue,
  },
  regionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: COLORS.neutral[100],
  },
  regionBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.neutral[700],
  },

  userDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[600],
    lineHeight: 20,
  },

  actionButtons: {
    flexDirection: 'row',
    gap: SPACING[8],
  },
  actionButtonsMobile: {
    marginTop: SPACING[16],
    width: '100%',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.brand.light,
    borderWidth: 1,
    borderColor: COLORS.brand.blueSoft,
  },
  editBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[700],
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.semantic.errorBg,
    borderWidth: 1,
    borderColor: COLORS.semantic.errorBorder,
  },
  deleteBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.semantic.error,
  },
  btnIcon: {
    marginRight: 6,
  },

  statsGrid: {
    flexDirection: 'row',
    gap: SPACING[12],
    marginBottom: SPACING[20],
  },
  statsGridMobile: {
    flexDirection: 'column',
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[16],
  },
  statIconBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING[12],
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
  },
  statValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    marginTop: 2,
  },

  detailsGrid: {
    flexDirection: 'row',
    gap: SPACING[20],
  },
  detailsGridMobile: {
    flexDirection: 'column',
  },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[20],
  },
  cardHeaderTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    marginBottom: SPACING[16],
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING[12],
  },
  infoTextGroup: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
  },
  infoValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[800],
    marginTop: 2,
  },
  infoDivider: {
    height: 1,
    backgroundColor: COLORS.neutral[100],
    marginVertical: SPACING[12],
  },

  appItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  appItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING[12],
    marginTop: 2,
  },
  appItemTextGroup: {
    flex: 1,
  },
  appItemTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[900],
  },
  appItemSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    marginTop: 2,
  },
});
