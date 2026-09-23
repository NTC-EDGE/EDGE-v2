import React, { useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { COLORS, SHADOWS, Icon as Lucide } from '@edge/ui';
import { Employee } from '../types/employeeTypes';
import { employeeCardStyles as styles } from '../styles/employeeCardStyles';

interface EmployeeCardProps {
  employee: Employee;
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onChangeEmail?: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export function EmployeeCard({
  employee,
  onView,
  onEdit,
  onChangeEmail,
  onDelete,
}: EmployeeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showPopover, setShowPopover] = useState(false);

  const getInitials = (first: string, last: string): string => {
    const f = first.trim().length > 0 ? first.trim().charAt(0) : '';
    const l = last.trim().length > 0 ? last.trim().charAt(0) : '';
    return `${f}${l}`.toUpperCase();
  };

  const initials = getInitials(employee.firstName, employee.lastName);

  const handleAction = (action: 'view' | 'edit' | 'change-email' | 'delete') => {
    setShowPopover(false);
    if (action === 'view') {
      onView(employee);
    } else if (action === 'edit') {
      onEdit(employee);
    } else if (action === 'change-email') {
      onChangeEmail?.(employee);
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

          {/* Popover Dropdown */}
          {showPopover && (
            <View style={[styles.popoverMenu, SHADOWS.modal]}>
              <Pressable style={styles.popoverItem} onPress={() => handleAction('view')}>
                <Lucide name="eye" size={15} color={COLORS.brand[700]} style={styles.popoverIcon} />
                <Text style={styles.popoverItemText}>View Details</Text>
              </Pressable>

              <Pressable style={styles.popoverItem} onPress={() => handleAction('edit')}>
                <Lucide name="edit-2" size={15} color={COLORS.brand[700]} style={styles.popoverIcon} />
                <Text style={styles.popoverItemText}>Edit Employee</Text>
              </Pressable>

              <Pressable style={styles.popoverItem} onPress={() => handleAction('change-email')}>
                <Lucide name="mail" size={15} color={COLORS.brand[700]} style={styles.popoverIcon} />
                <Text style={styles.popoverItemText}>Change Email</Text>
              </Pressable>

              <View style={styles.popoverDivider} />

              <Pressable style={styles.popoverItemDanger} onPress={() => handleAction('delete')}>
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
