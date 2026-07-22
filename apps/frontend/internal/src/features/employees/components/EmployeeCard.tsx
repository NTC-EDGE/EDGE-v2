import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide, StatusBadge } from '@edge/ui';
import { Employee } from '../data/mockEmployees';

interface EmployeeCardProps {
  employee: Employee;
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export function EmployeeCard({ employee, onView, onEdit, onDelete }: EmployeeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const getInitials = (first: string, last: string): string => {
    const f = first.trim().length > 0 ? first.trim().charAt(0) : '';
    const l = last.trim().length > 0 ? last.trim().charAt(0) : '';
    return `${f}${l}`.toUpperCase();
  };

  const initials = getInitials(employee.firstName, employee.lastName);

  return (
    <View
      style={[
        styles.cardContainer,
        SHADOWS.card,
        isHovered && styles.cardHovered,
      ]}
      {...(Platform.OS === 'web'
        ? {
            onMouseEnter: () => setIsHovered(true),
            onMouseLeave: () => {
              setIsHovered(false);
              setShowMenu(false);
            },
          }
        : {})}
    >
      <View style={styles.cardMain}>
        {/* Left Section: Avatar with Status Indicator */}
        <View style={styles.avatarWrapper}>
          <View style={[styles.avatarCircle, { backgroundColor: employee.avatarColor }]}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
          <View
            style={[
              styles.statusDot,
              employee.status === 'Active'
                ? styles.statusDotActive
                : employee.status === 'On Leave'
                ? styles.statusDotLeave
                : styles.statusDotInactive,
            ]}
          />
        </View>

        {/* Middle Section: Employee Details */}
        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <Text style={styles.employeeName}>
              {employee.firstName} {employee.lastName}
            </Text>
            <StatusBadge status={employee.status} />
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

        {/* Right Section: Quick Action Buttons / Dropdown */}
        <View style={styles.actionsSection}>
          <Pressable
            style={styles.iconBtn}
            onPress={() => onView(employee)}
            accessibilityLabel="View Employee Profile"
          >
            <Lucide name="eye" size={15} color={COLORS.brand[700]} />
          </Pressable>
          <Pressable
            style={styles.iconBtn}
            onPress={() => onEdit(employee)}
            accessibilityLabel="Edit Employee"
          >
            <Lucide name="edit-2" size={15} color={COLORS.brand[700]} />
          </Pressable>
          <Pressable
            style={styles.iconBtnDanger}
            onPress={() => onDelete(employee)}
            accessibilityLabel="Delete Employee"
          >
            <Lucide name="trash-2" size={15} color={COLORS.semantic.error} />
          </Pressable>
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
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING[16],
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
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.neutral.white,
  },
  statusDotActive: {
    backgroundColor: COLORS.semantic.success,
  },
  statusDotLeave: {
    backgroundColor: COLORS.semantic.warning,
  },
  statusDotInactive: {
    backgroundColor: COLORS.neutral[400],
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
  actionsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
  },
  iconBtn: {
    width: 34,
    height: 34,
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
  iconBtnDanger: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.semantic.errorBorder,
    backgroundColor: COLORS.semantic.errorBg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 150ms ease',
      },
    }),
  },
});
