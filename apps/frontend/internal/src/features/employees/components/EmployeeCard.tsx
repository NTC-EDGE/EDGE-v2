import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';
import { Employee } from '../data/mockEmployees';

interface EmployeeCardProps {
  employee: Employee;
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export function EmployeeCard({ employee, onView, onEdit, onDelete }: EmployeeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showPopover, setShowPopover] = useState(false);

  const getInitials = (first: string, last: string): string => {
    const f = first.trim().length > 0 ? first.trim().charAt(0) : '';
    const l = last.trim().length > 0 ? last.trim().charAt(0) : '';
    return `${f}${l}`.toUpperCase();
  };

  const initials = getInitials(employee.firstName, employee.lastName);

  const handleAction = (action: 'view' | 'edit' | 'delete') => {
    setShowPopover(false);
    if (action === 'view') {
      onView(employee);
    } else if (action === 'edit') {
      onEdit(employee);
    } else if (action === 'delete') {
      onDelete(employee);
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
            onMouseLeave: () => {
              setIsHovered(false);
            },
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
          <View style={[styles.avatarCircle, { backgroundColor: employee.avatarColor }]}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
        </View>

        {/* Middle Section: Employee Details */}
        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <Text style={styles.employeeName}>
              {employee.firstName} {employee.lastName}
            </Text>
          </View>

          <View style={styles.roleDeptRow}>
            <View style={styles.roleTag}>
              <Text style={styles.roleTagText}>{employee.role}</Text>
            </View>
            <Text style={styles.deptDivider}>•</Text>
            <Text style={styles.deptText} numberOfLines={1}>
              {employee.department}
            </Text>
          </View>

          <View style={styles.emailRow}>
            <Lucide name="mail" size={13} color={COLORS.neutral[400]} style={styles.emailIcon} />
            <Text style={styles.emailText} numberOfLines={1}>
              {employee.email}
            </Text>
          </View>
        </View>

        {/* Right Section: 3-Dotted Vertical Action Button & Popover Menu */}
        <View style={[styles.actionMenuWrapper, showPopover && { zIndex: 99999 }]}>
          <Pressable
            style={[styles.threeDotsBtn, showPopover && styles.threeDotsBtnActive]}
            onPress={() => setShowPopover((prev) => !prev)}
            accessibilityLabel="More Options"
          >
            <Lucide name="more-vertical" size={18} color={COLORS.neutral[600]} />
          </Pressable>

          {/* Popover Dropdown (Always rendered on top of card stack) */}
          {showPopover && (
            <View style={[styles.popoverMenu, SHADOWS.modal]}>
              <Pressable
                style={styles.popoverItem}
                onPress={() => handleAction('view')}
              >
                <Lucide name="eye" size={15} color={COLORS.brand[700]} style={styles.popoverIcon} />
                <Text style={styles.popoverItemText}>View Details</Text>
              </Pressable>

              <Pressable
                style={styles.popoverItem}
                onPress={() => handleAction('edit')}
              >
                <Lucide name="edit-2" size={15} color={COLORS.brand[700]} style={styles.popoverIcon} />
                <Text style={styles.popoverItemText}>Edit Employee</Text>
              </Pressable>

              <View style={styles.popoverDivider} />

              <Pressable
                style={styles.popoverItemDanger}
                onPress={() => handleAction('delete')}
              >
                <Lucide name="trash-2" size={15} color={COLORS.semantic.error} style={styles.popoverIcon} />
                <Text style={styles.popoverItemTextDanger}>Delete Employee</Text>
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
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[16],
    marginBottom: SPACING[12],
    width: '100%',
    position: 'relative',
    zIndex: 1,
    ...Platform.select({
      web: {
        transition: 'all 200ms ease-in-out',
      },
    }),
  },
  cardHovered: {
    borderColor: COLORS.brand[500],
    ...Platform.select({
      web: {
        boxShadow: '0 8px 24px -4px rgba(37, 99, 235, 0.12)',
        transform: 'translateY(-2px)',
      },
    }),
  },
  cardActivePopover: {
    zIndex: 99999,
    elevation: 99,
  },
  popoverBackdrop: {
    ...StyleSheet.absoluteFill,
    zIndex: 90,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING[16],
    position: 'relative',
    zIndex: 95,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
    letterSpacing: 0.5,
  },

  infoSection: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    flexWrap: 'wrap',
  },
  employeeName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  roleDeptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  roleTag: {
    backgroundColor: COLORS.neutral[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleTagText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[700],
  },
  deptDivider: {
    color: COLORS.neutral[400],
    fontSize: 12,
  },
  deptText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[500],
    flexShrink: 1,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  emailIcon: {
    marginRight: 6,
  },
  emailText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[500],
  },
  actionMenuWrapper: {
    position: 'relative',
    zIndex: 100,
  },
  threeDotsBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    backgroundColor: COLORS.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 150ms ease',
      },
    }),
  },
  threeDotsBtnActive: {
    backgroundColor: COLORS.neutral[200],
    borderColor: COLORS.neutral[300],
  },
  popoverMenu: {
    position: 'absolute',
    top: 42,
    right: 0,
    width: 170,
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    paddingVertical: 6,
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
    paddingVertical: 9,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  popoverItemDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[12],
    paddingVertical: 9,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  popoverIcon: {
    marginRight: 10,
  },
  popoverItemText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.neutral[700],
  },
  popoverItemTextDanger: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.semantic.error,
  },
  popoverDivider: {
    height: 1,
    backgroundColor: COLORS.neutral[200],
    marginVertical: 4,
  },
});
