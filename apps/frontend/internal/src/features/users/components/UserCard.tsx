import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide, StatusBadge } from '@edge/ui';
import { User } from '../types';

interface UserCardProps {
  user: User;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UserCard({ user, onView, onEdit, onDelete }: UserCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showPopover, setShowPopover] = useState(false);

  const handleAction = (action: 'view' | 'edit' | 'delete') => {
    setShowPopover(false);
    if (action === 'view') {
      onView(user);
    } else if (action === 'edit') {
      onEdit(user);
    } else if (action === 'delete') {
      onDelete(user);
    }
  };

  const formattedAmount =
    user.totalPaidAmount !== undefined && user.totalPaidAmount !== null && user.totalPaidAmount > 0
      ? `₱${(user.totalPaidAmount ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
      : null;

  return (
    <View
      style={[
        styles.cardContainer,
        SHADOWS.card,
        isHovered && styles.cardHovered,
        showPopover && styles.cardActivePopover,
      ]}
      {...(Platform.OS === 'web'
        ? {
            onMouseEnter: () => setIsHovered(true),
            onMouseLeave: () => setIsHovered(false),
          }
        : {})}
    >
      {/* Click Outside Overlay for Popover */}
      {showPopover && (
        <Pressable
          style={styles.popoverBackdrop}
          onPress={() => setShowPopover(false)}
        />
      )}

      {/* Header Row: Avatar, Identity & Status */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarWrapper}>
          {user.avatarType === 'icon' ? (
            <View style={styles.avatarIconCircle}>
              <Lucide name="user" size={22} color={COLORS.neutral[500]} />
            </View>
          ) : (
            <View
              style={[
                styles.avatarInitialsCircle,
                { backgroundColor: user.avatarBgColor || COLORS.brand.royalBlue },
              ]}
            >
              <Text style={styles.avatarInitialsText}>
                {user.avatarInitials || ((user.name || 'Permittee').slice(0, 2).toUpperCase() || 'NT')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.identityGroup}>
          <View style={styles.idAndTypeRow}>
            <Text style={styles.clientIdText}>ID: {(user.id || '').slice(0, 10)}</Text>
            <View
              style={
                user.accountType === 'Company' ? styles.companyBadge : styles.individualBadge
              }
            >
              <Text
                style={
                  user.accountType === 'Company'
                    ? styles.companyBadgeText
                    : styles.individualBadgeText
                }
              >
                {user.accountType}
              </Text>
            </View>
          </View>

          <Text style={styles.userName} numberOfLines={1}>
            {user.name || 'Permittee'}
          </Text>

          {user.organization && user.organization !== 'Individual Permittee' && (
            <Text style={styles.orgText} numberOfLines={1}>
              {user.organization}
            </Text>
          )}
        </View>

        {/* Action Button */}
        <View style={styles.actionSection}>
          <Pressable
            style={[styles.threeDotsBtn, showPopover && styles.threeDotsBtnActive]}
            onPress={() => setShowPopover((prev) => !prev)}
            accessibilityLabel="Client Options"
          >
            <Lucide name="more-vertical" size={18} color={COLORS.neutral[600]} />
          </Pressable>

          {/* Action Popover Menu */}
          {showPopover && (
            <View style={[styles.popoverMenu, SHADOWS.modal]}>
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
      </View>

      {/* Middle Section: Service Category & Status */}
      <View style={styles.categoryAndStatusRow}>
        <View style={styles.categoryChip}>
          <Lucide name="radio" size={12} color={COLORS.brand[700]} style={styles.chipIcon} />
          <Text style={styles.categoryChipText} numberOfLines={1}>
            {user.licenseCategory || 'Telecommunications'}
          </Text>
        </View>

        <StatusBadge status={user.status} />
      </View>

      {/* Contact & Location Info */}
      <View style={styles.contactSection}>
        <View style={styles.contactRow}>
          <Lucide name="mail" size={13} color={COLORS.neutral[400]} style={styles.iconMargin} />
          <Text style={styles.emailText} numberOfLines={1}>
            {user.email}
          </Text>
        </View>

        <View style={styles.contactRow}>
          <Lucide name="phone" size={13} color={COLORS.neutral[400]} style={styles.iconMargin} />
          <Text style={styles.phoneText} numberOfLines={1}>
            {user.phone || '+63 900 000 0000'}
          </Text>
        </View>
      </View>

      {/* Footer Summary: Tenant Transactions Metric & Action */}
      <View style={styles.cardFooter}>
        <View style={styles.metricsGroup}>
          <View style={styles.metricItem}>
            <Lucide name="file-text" size={13} color={COLORS.brand[700]} style={styles.iconMargin} />
            <Text style={styles.metricText}>
              <Text style={styles.metricBold}>{user.applicationsCount}</Text>{' '}
              {user.applicationsCount === 1 ? 'Filing' : 'Filings'}
            </Text>
          </View>

          {formattedAmount && (
            <>
              <View style={styles.metaDivider} />
              <View style={styles.metricItem}>
                <Lucide name="credit-card" size={13} color={COLORS.semantic.success} style={styles.iconMargin} />
                <Text style={styles.metricTextSuccess}>{formattedAmount}</Text>
              </View>
            </>
          )}
        </View>

        <Pressable
          style={styles.viewDetailsBtn}
          onPress={() => onView(user)}
          accessibilityLabel="Inspect Client Dossier"
        >
          <Text style={styles.viewDetailsBtnText}>Inspect</Text>
          <Lucide name="chevron-right" size={14} color={COLORS.brand[700]} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[16],
    marginBottom: SPACING[12],
    position: 'relative',
    flex: 1,
    minWidth: 320,
  },
  cardHovered: {
    borderColor: COLORS.brand.blueSoft,
    ...SHADOWS.panel,
  },
  cardActivePopover: {
    zIndex: 99,
  },
  popoverBackdrop: {
    position: 'absolute',
    top: -500,
    bottom: -500,
    left: -500,
    right: -500,
    zIndex: 90,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING[10],
  },
  avatarWrapper: {
    marginRight: SPACING[12],
  },
  avatarIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  avatarInitialsCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialsText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: 15,
    color: COLORS.neutral.white,
  },

  identityGroup: {
    flex: 1,
  },
  idAndTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[6],
    marginBottom: 2,
  },
  clientIdText: {
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'Courier',
    fontSize: 11,
    color: COLORS.neutral[500],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  individualBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    backgroundColor: COLORS.neutral[100],
  },
  individualBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[600],
  },
  companyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    backgroundColor: COLORS.brand.light,
  },
  companyBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand.royalBlue,
  },

  userName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  orgText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[600],
    marginTop: 1,
  },

  actionSection: {
    position: 'relative',
    marginLeft: SPACING[4],
  },
  threeDotsBtn: {
    padding: 6,
    borderRadius: RADIUS.button,
  },
  threeDotsBtnActive: {
    backgroundColor: COLORS.neutral[100],
  },

  popoverMenu: {
    position: 'absolute',
    top: 28,
    right: 0,
    width: 150,
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    paddingVertical: SPACING[4],
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
    marginVertical: SPACING[4],
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

  categoryAndStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.neutral[50],
    borderRadius: RADIUS.button,
    paddingHorizontal: SPACING[10],
    paddingVertical: 6,
    marginBottom: SPACING[10],
    gap: SPACING[8],
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chipIcon: {
    marginRight: 5,
  },
  categoryChipText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.neutral[800],
    flex: 1,
  },

  contactSection: {
    gap: 4,
    marginBottom: SPACING[12],
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconMargin: {
    marginRight: 6,
  },
  emailText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[600],
    flex: 1,
  },
  phoneText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[600],
    flex: 1,
  },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[100],
    paddingTop: SPACING[10],
  },
  metricsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[700],
  },
  metricBold: {
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[700],
  },
  metricTextSuccess: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.semantic.success,
  },
  metaDivider: {
    width: 1,
    height: 12,
    backgroundColor: COLORS.neutral[300],
    marginHorizontal: SPACING[8],
  },

  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[10],
    paddingVertical: 5,
    borderRadius: RADIUS.button,
    backgroundColor: COLORS.brand.light,
    gap: 2,
  },
  viewDetailsBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[700],
  },
});

