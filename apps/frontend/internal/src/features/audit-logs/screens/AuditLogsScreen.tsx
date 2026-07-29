import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '@edge/ui';
import { AuditLogsTab } from '../../settings/components/AuditLogsTab';

export function AuditLogsScreen() {
  const { width } = useWindowDimensions();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {/* Page Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerTextGroup}>
          <Text style={styles.pageTitle}>System Audit Logs</Text>
          <Text style={styles.pageSubtitle}>
            Complete immutable audit trail of administrative activities, user modifications, and security events.
          </Text>
        </View>
      </View>

      {/* Audit Logs Tab View Component */}
      <AuditLogsTab />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    padding: SPACING[20],
    gap: SPACING[20],
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING[12],
    flexWrap: 'wrap',
  },
  headerTextGroup: {
    flex: 1,
    minWidth: 280,
  },
  pageTitle: {
    fontSize: 28,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: '700',
    color: COLORS.neutral[900],
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[500],
    marginTop: 2,
  },
});
