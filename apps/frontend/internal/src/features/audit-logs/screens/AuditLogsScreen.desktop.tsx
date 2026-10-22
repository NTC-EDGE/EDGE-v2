import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { useTheme, PageHeader, AnimatedCard, SPACING } from '@edge/ui';
import { AuditLogsTab } from '../../settings/components/AuditLogsTab';

export function AuditLogsScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.container}
    >
      <PageHeader
        title="System Audit Logs"
        subtitle="Desktop Shell • Real-time stream of audit entries, administrative events, and security access logs."
      />

      <AnimatedCard padding={16} style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>
        <AuditLogsTab />
      </AnimatedCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    padding: SPACING[24],
    gap: SPACING[20],
    width: '100%',
  },
});
