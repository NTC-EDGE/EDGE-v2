import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Icon as Lucide, useTheme } from '@edge/ui';
import { Employee } from '../types/employeeTypes';
import { EmployeeCard } from './EmployeeCard';
import { employeesScreenStyles as styles } from '../styles/employeesScreenStyles';

interface EmployeesCardGridProps {
  employees: Employee[];
  onView: (emp: Employee) => void;
  onEdit: (emp: Employee) => void;
  onChangeEmail: (emp: Employee) => void;
  onDelete: (emp: Employee) => void;
  onResetFilters: () => void;
}

export function EmployeesCardGrid({
  employees,
  onView,
  onEdit,
  onChangeEmail,
  onDelete,
  onResetFilters,
}: EmployeesCardGridProps) {
  const { colors, isDark } = useTheme();

  if (employees.length === 0) {
    return (
      <View
        style={[
          styles.emptyState,
          { backgroundColor: isDark ? colors.neutral[900] : colors.cardBg, borderColor: colors.border },
        ]}
      >
        <Lucide name="users" size={40} color={colors.textMuted} style={{ marginBottom: 12 }} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No Employees Found</Text>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          No employee records match your search criteria. Try adjusting your search query or filters.
        </Text>
        <Pressable
          style={[
            styles.resetFilterBtn,
            { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: colors.border },
          ]}
          onPress={onResetFilters}
        >
          <Text style={[styles.resetFilterText, { color: isDark ? colors.brand[400] : colors.brand[700] }]}>
            Reset Filters
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.cardsGrid}>
      {employees.map((employee) => (
        <EmployeeCard
          key={employee.id}
          employee={employee}
          onView={onView}
          onEdit={onEdit}
          onChangeEmail={onChangeEmail}
          onDelete={onDelete}
        />
      ))}
    </View>
  );
}
