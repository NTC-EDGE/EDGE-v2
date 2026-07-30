import React from 'react';
import { StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useTheme, PageHeader, AnimatedCard, SPACING } from '@edge/ui';
import { AuditLogsTab } from '../../settings/components/AuditLogsTab';

export function AuditLogsScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <PageHeader
          title="Audit Logs"
          subtitle="Mobile Admin • System event logs"
        />

        <AnimatedCard padding={12} style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}>
          <AuditLogsTab />
        </AnimatedCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    padding: SPACING[16],
    gap: SPACING[16],
  },
});
