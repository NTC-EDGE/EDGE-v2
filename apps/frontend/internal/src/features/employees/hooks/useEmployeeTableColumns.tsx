import React, { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ColumnDef } from '@tanstack/react-table';
import { COLORS, SPACING, TYPOGRAPHY } from '@edge/ui';
import { Employee } from '../data/mockEmployees';
import { TableActionCell } from '../components/TableActionCell';

interface UseEmployeeTableColumnsParams {
  activePopoverId: string | null;
  setActivePopoverId: (id: string | null) => void;
  onView: (emp: Employee) => void;
  onEdit: (emp: Employee) => void;
  onChangeEmail: (emp: Employee) => void;
  onDelete: (emp: Employee) => void;
}

export function useEmployeeTableColumns({
  activePopoverId,
  setActivePopoverId,
  onView,
  onEdit,
  onChangeEmail,
  onDelete,
}: UseEmployeeTableColumnsParams): ColumnDef<Employee, unknown>[] {
  return useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'Employee ID',
        cell: (info) => <Text style={styles.tableIdText}>{String(info.getValue())}</Text>,
        meta: { flex: 1.2 },
      },
      {
        accessorKey: 'name',
        header: 'Name & Email',
        cell: (info) => {
          const emp = info.row.original;
          return (
            <View style={styles.tableNameCell}>
              <View style={[styles.miniAvatar, { backgroundColor: emp.avatarColor }]}>
                <Text style={styles.miniAvatarText}>
                  {emp.firstName.charAt(0)}
                  {emp.lastName.charAt(0)}
                </Text>
              </View>
              <View>
                <Text style={styles.tableNameText}>
                  {emp.firstName} {emp.lastName}
                </Text>
                <Text style={styles.tableEmailText}>{emp.email}</Text>
              </View>
            </View>
          );
        },
        meta: { flex: 2.4 },
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: (info) => (
          <View style={styles.roleTagTable}>
            <Text style={styles.roleTagTableText}>{String(info.getValue())}</Text>
          </View>
        ),
        meta: { flex: 1.5 },
      },
      {
        accessorKey: 'department',
        header: 'Department',
        cell: (info) => <Text style={styles.tableCellText}>{String(info.getValue())}</Text>,
        meta: { flex: 2.2 },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: (info) => {
          const emp = info.row.original;
          return (
            <TableActionCell
              employee={emp}
              activePopoverId={activePopoverId}
              setActivePopoverId={setActivePopoverId}
              onView={onView}
              onEdit={onEdit}
              onChangeEmail={onChangeEmail}
              onDelete={onDelete}
            />
          );
        },
        meta: { flex: 1.0 },
      },
    ],
    [activePopoverId, setActivePopoverId, onView, onEdit, onChangeEmail, onDelete]
  );
}

const styles = StyleSheet.create({
  tableIdText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[700],
  },
  tableNameCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
  },
  miniAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniAvatarText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral.white,
  },
  tableNameText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[900],
  },
  tableEmailText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
  },
  roleTagTable: {
    backgroundColor: COLORS.neutral[100],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  roleTagTableText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[700],
  },
  tableCellText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[700],
  },
});
