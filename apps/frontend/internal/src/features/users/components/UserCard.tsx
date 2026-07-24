import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';
import { User } from '../data/mockUsers';

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

      <View style={styles.cardMain}>
        {/* Left Section: Avatar */}
        <View style={styles.avatarWrapper}>
          {user.avatarType === 'icon' ? (
            <View style={styles.avatarIconCircle}>
              <Lucide name="user" size={20} color="#64748B" />
            </View>
          ) : (
            <View style={[styles.avatarInitialsCircle, { backgroundColor: user.avatarBgColor || '#1D4ED8' }]}>
              <Text style={styles.avatarInitialsText}>{user.avatarInitials || user.name.slice(0, 2).toUpperCase()}</Text>
            </View>
          )}
        </View>

        {/* Middle Section: Info */}
        <View style={styles.infoSection}>
          <View style={styles.headerRow}>
            <Text style={styles.clientIdText}>ID: {user.id}</Text>
            <View style={user.accountType === 'Company' ? styles.companyBadge : styles.individualBadge}>
              <Text style={user.accountType === 'Company' ? styles.companyBadgeText : styles.individualBadgeText}>
                {user.accountType}
              </Text>
            </View>
          </View>

          <Text style={styles.userName} numberOfLines={1}>
            {user.name}
          </Text>

          <View style={styles.emailRow}>
            <Lucide name="mail" size={13} color={COLORS.neutral[400]} style={styles.iconMargin} />
            <Text style={styles.emailText} numberOfLines={1}>
              {user.email}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Lucide name="map-pin" size={12} color={COLORS.neutral[500]} style={styles.iconMargin} />
              <Text style={styles.metaText}>{user.region}</Text>
            </View>

            <View style={styles.metaDivider} />

            <View style={styles.metaItem}>
              <Lucide name="file-text" size={12} color={COLORS.neutral[500]} style={styles.iconMargin} />
              <Text style={styles.metaText}>{user.applicationsCount} Apps</Text>
            </View>
          </View>
        </View>

        {/* Right Section: Action Button */}
        <View style={styles.actionSection}>
          <Pressable
            style={[styles.threeDotsBtn, showPopover && styles.threeDotsBtnActive]}
            onPress={() => setShowPopover((prev) => !prev)}
            accessibilityLabel="User Menu Options"
          >
            <Lucide name="more-vertical" size={18} color={COLORS.neutral[700]} />
          </Pressable>

          {/* Action Popover Menu */}
          {showPopover && (
            <View style={[styles.popoverMenu, SHADOWS.modal]}>
              <Pressable style={styles.popoverItem} onPress={() => handleAction('view')}>
                <Lucide name="eye" size={14} color={COLORS.brand[700]} style={styles.popoverIcon} />
                <Text style={styles.popoverItemText}>View Details</Text>
              </Pressable>

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
  },
  cardHovered: {
    borderColor: '#93C5FD',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
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
  cardMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  avatarWrapper: {
    marginRight: SPACING[12],
  },
  avatarIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#FFFFFF',
  },

  infoSection: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    marginBottom: SPACING[4],
  },
  clientIdText: {
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'Courier',
    fontSize: 12,
    color: COLORS.neutral[500],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  individualBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  individualBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: '#475569',
  },
  companyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
  },
  companyBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: '#1D4ED8',
  },

  userName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    marginBottom: SPACING[4],
  },

  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[8],
  },
  iconMargin: {
    marginRight: 4,
  },
  emailText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.brand[700],
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[600],
  },
  metaDivider: {
    width: 1,
    height: 12,
    backgroundColor: COLORS.neutral[200],
    marginHorizontal: SPACING[8],
  },

  actionSection: {
    position: 'relative',
    marginLeft: SPACING[8],
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
});
