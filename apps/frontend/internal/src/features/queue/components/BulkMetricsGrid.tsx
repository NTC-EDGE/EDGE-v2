import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon, TYPOGRAPHY, useTheme } from '@edge/ui';

interface BulkMetricsGridProps {
  totalSubmitted: number;
  approvedCount: number;
  declinedCount: number;
  pendingCount: number;
}

export function BulkMetricsGrid({
  totalSubmitted,
  approvedCount,
  declinedCount,
  pendingCount,
}: BulkMetricsGridProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.metricsGrid}>
      <View style={[styles.metricCard, { backgroundColor: isDark ? colors.neutral[800] : '#FFFFFF', borderColor: isDark ? colors.neutral[700] : '#E2E8F0' }]}>
        <View style={styles.metricHeader}>
          <Text style={[styles.metricLabel, { color: isDark ? colors.neutral[400] : '#64748B' }]}>TOTAL APPLICANTS</Text>
          <Icon name="users" size={16} color={isDark ? colors.neutral[400] : '#64748B'} />
        </View>
        <Text style={[styles.metricValue, { color: isDark ? colors.neutral[100] : '#0F172A' }]}>{totalSubmitted}</Text>
        <Text style={[styles.metricSub, { color: isDark ? colors.neutral[500] : '#94A3B8' }]}>Submitted in bulk batch</Text>
      </View>

      <View style={[styles.metricCard, { backgroundColor: isDark ? colors.neutral[800] : '#FFFFFF', borderColor: isDark ? colors.neutral[700] : '#E2E8F0' }]}>
        <View style={styles.metricHeader}>
          <Text style={[styles.metricLabel, { color: isDark ? colors.neutral[400] : '#64748B' }]}>COMPLETE</Text>
          <Icon name="check-circle" size={16} color="#16A34A" />
        </View>
        <Text style={[styles.metricValue, { color: '#16A34A' }]}>{approvedCount}</Text>
        <Text style={[styles.metricSub, { color: isDark ? colors.neutral[500] : '#94A3B8' }]}>Verified / approved</Text>
      </View>

      <View style={[styles.metricCard, { backgroundColor: isDark ? colors.neutral[800] : '#FFFFFF', borderColor: isDark ? colors.neutral[700] : '#E2E8F0' }]}>
        <View style={styles.metricHeader}>
          <Text style={[styles.metricLabel, { color: isDark ? colors.neutral[400] : '#64748B' }]}>FOR EVALUATION</Text>
          <Icon name="clock" size={16} color="#D97706" />
        </View>
        <Text style={[styles.metricValue, { color: '#D97706' }]}>{pendingCount}</Text>
        <Text style={[styles.metricSub, { color: isDark ? colors.neutral[500] : '#94A3B8' }]}>Pending review</Text>
      </View>

      {declinedCount > 0 && (
        <View style={[styles.metricCard, { backgroundColor: isDark ? colors.neutral[800] : '#FFFFFF', borderColor: isDark ? colors.neutral[700] : '#E2E8F0' }]}>
          <View style={styles.metricHeader}>
            <Text style={[styles.metricLabel, { color: isDark ? colors.neutral[400] : '#64748B' }]}>INCOMPLETE / RETURNED</Text>
            <Icon name="x-circle" size={16} color="#DC2626" />
          </View>
          <Text style={[styles.metricValue, { color: '#DC2626' }]}>{declinedCount}</Text>
          <Text style={[styles.metricSub, { color: isDark ? colors.neutral[500] : '#94A3B8' }]}>Needs compliance</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: 140,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metricLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
  },
  metricSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
  },
});
