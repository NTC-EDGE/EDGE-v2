import React from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide } from '@edge/ui';
import { usePermissions } from '../../shell/context/PermissionContext';
import { Employee } from '../types/employeeTypes';

interface TableActionCellProps {
  employee: Employee;
  activePopoverId: string | null;
  setActivePopoverId: (id: string | null) => void;
  onView: (emp: Employee) => void;
  onEdit: (emp: Employee) => void;
  onChangeEmail?: (emp: Employee) => void;
  onDelete: (emp: Employee) => void;
}

export function TableActionCell({
  employee,
  activePopoverId,
  setActivePopoverId,
  onView,
  onEdit,
  onChangeEmail,
  onDelete,
}: TableActionCellProps) {
  const isPopoverOpen = activePopoverId === employee.id;
  const { hasPermission, isSuperAdmin, isAdmin } = usePermissions();

  const canEdit = isSuperAdmin || isAdmin || hasPermission('tenants.members_manage') || hasPermission('users.update');
  const canDelete = isSuperAdmin || isAdmin || hasPermission('tenants.members_manage') || hasPermission('users.delete');

  const handleAction = (action: 'view' | 'edit' | 'change-email' | 'delete') => {
    setActivePopoverId(null);
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
    <View style={[styles.tableActionWrapper, isPopoverOpen && { zIndex: 99999 }]}>
      {isPopoverOpen && (
        <Pressable style={styles.popoverBackdrop} onPress={() => setActivePopoverId(null)} />
      )}
      <Pressable
        style={[styles.tableThreeDotsBtn, isPopoverOpen && styles.tableThreeDotsBtnActive]}
        onPress={() => setActivePopoverId(isPopoverOpen ? null : employee.id)}
        accessibilityLabel="Actions Menu"
      >
        <Lucide name="more-vertical" size={16} color={COLORS.neutral[700]} />
      </Pressable>

      {isPopoverOpen && (
        <View style={[styles.tablePopoverMenu, SHADOWS.modal]}>
          <Pressable style={styles.popoverItem} onPress={() => handleAction('view')}>
            <Lucide name="eye" size={14} color={COLORS.brand[700]} style={styles.popoverIcon} />
            <Text style={styles.popoverItemText}>View Details</Text>
          </Pressable>

          {canEdit && (
            <>
              <Pressable style={styles.popoverItem} onPress={() => handleAction('edit')}>
                <Lucide name="edit-2" size={14} color={COLORS.brand[700]} style={styles.popoverIcon} />
                <Text style={styles.popoverItemText}>Edit Employee</Text>
              </Pressable>

              <Pressable style={styles.popoverItem} onPress={() => handleAction('change-email')}>
                <Lucide name="mail" size={14} color={COLORS.brand[700]} style={styles.popoverIcon} />
                <Text style={styles.popoverItemText}>Change Email</Text>
              </Pressable>
            </>
          )}

          {canDelete && (
            <>
              <View style={styles.popoverDivider} />
              <Pressable style={styles.popoverItemDanger} onPress={() => handleAction('delete')}>
                <Lucide name="trash-2" size={14} color={COLORS.semantic.error} style={styles.popoverIcon} />
                <Text style={styles.popoverItemTextDanger}>Delete Employee</Text>
              </Pressable>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tableActionWrapper: {
    position: 'relative',
    alignItems: 'flex-end',
  },
  tableThreeDotsBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    backgroundColor: COLORS.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableThreeDotsBtnActive: {
    backgroundColor: COLORS.neutral[100],
    borderColor: COLORS.neutral[300],
  },
  tablePopoverMenu: {
    position: 'absolute',
    top: 34,
    right: 0,
    width: 160,
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    paddingVertical: 4,
    zIndex: 99999,
    elevation: 99,
    ...Platform.select({
      web: {
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.18), 0 8px 10px -6px rgba(15, 23, 42, 0.1)',
      },
    }),
  },
  popoverBackdrop: {
    ...StyleSheet.absoluteFill,
    zIndex: 90,
  },
  popoverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[12],
    paddingVertical: 8,
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
    paddingVertical: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  popoverIcon: {
    marginRight: 8,
  },
  popoverItemText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
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
