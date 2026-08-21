import React from 'react';
import { View, Text } from 'react-native';
import { Icon } from '@edge/ui';
import { styles } from './applicationDetailsStyles';

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
  return (
    <View style={styles.metricsGrid}>
      <View style={styles.metricCard}>
        <View style={styles.metricHeader}>
          <Text style={styles.metricLabel}>TOTAL APPLICANTS</Text>
          <Icon name="users" size={16} color="#64748B" />
        </View>
        <Text style={styles.metricValue}>{totalSubmitted}</Text>
        <Text style={styles.metricSub}>Submitted in bulk batch</Text>
      </View>

      <View style={styles.metricCard}>
        <View style={styles.metricHeader}>
          <Text style={styles.metricLabel}>APPROVED</Text>
          <Icon name="check-circle" size={16} color="#16A34A" />
        </View>
        <Text style={[styles.metricValue, { color: '#16A34A' }]}>{approvedCount}</Text>
        <Text style={styles.metricSub}>Ready for issuance</Text>
      </View>

      <View style={styles.metricCard}>
        <View style={styles.metricHeader}>
          <Text style={styles.metricLabel}>IN EVALUATION</Text>
          <Icon name="clock" size={16} color="#D97706" />
        </View>
        <Text style={[styles.metricValue, { color: '#D97706' }]}>{pendingCount}</Text>
        <Text style={styles.metricSub}>Pending review</Text>
      </View>

      {declinedCount > 0 && (
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>DECLINED</Text>
            <Icon name="x-circle" size={16} color="#DC2626" />
          </View>
          <Text style={[styles.metricValue, { color: '#DC2626' }]}>{declinedCount}</Text>
          <Text style={styles.metricSub}>Returned / rejected</Text>
        </View>
      )}
    </View>
  );
}
