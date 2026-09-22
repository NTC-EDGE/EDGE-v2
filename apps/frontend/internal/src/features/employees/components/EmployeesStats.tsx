import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide, useTheme } from '@edge/ui';

interface EmployeesStatsProps {
  isMobile: boolean;
  stats: {
    total: number;
    departments: number;
    evaluators: number;
    admins: number;
  };
}

export function EmployeesStats({ isMobile, stats }: EmployeesStatsProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.statsStrip, isMobile && styles.statsStripMobile]}>
      {/* Total Staff */}
      <View
        style={[
          styles.statCard,
          SHADOWS.card,
          { backgroundColor: isDark ? colors.neutral[900] : colors.cardBg, borderColor: colors.border },
        ]}
      >
        <View style={[styles.statIconBadge, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
          <Lucide name="users" size={18} color={isDark ? colors.brand[400] : colors.brand[700]} />
        </View>
        <View>
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.total}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Staff</Text>
        </View>
      </View>

      {/* Departments */}
      <View
        style={[
          styles.statCard,
          SHADOWS.card,
          { backgroundColor: isDark ? colors.neutral[900] : colors.cardBg, borderColor: colors.border },
        ]}
      >
        <View style={[styles.statIconBadge, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
          <Lucide name="briefcase" size={18} color={isDark ? colors.brand[400] : colors.brand[700]} />
        </View>
        <View>
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.departments}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Departments</Text>
        </View>
      </View>

      {/* Evaluators */}
      <View
        style={[
          styles.statCard,
          SHADOWS.card,
          { backgroundColor: isDark ? colors.neutral[900] : colors.cardBg, borderColor: colors.border },
        ]}
      >
        <View style={[styles.statIconBadge, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
          <Lucide name="award" size={18} color={isDark ? colors.brand[400] : colors.brand[700]} />
        </View>
        <View>
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.evaluators}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Evaluators</Text>
        </View>
      </View>

      {/* Admins & Managers */}
      <View
        style={[
          styles.statCard,
          SHADOWS.card,
          { backgroundColor: isDark ? colors.neutral[900] : colors.cardBg, borderColor: colors.border },
        ]}
      >
        <View
          style={[
            styles.statIconBadge,
            { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : COLORS.semantic.warningBg },
          ]}
        >
          <Lucide name="shield" size={18} color={isDark ? '#FBBF24' : COLORS.semantic.warning} />
        </View>
        <View>
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.admins}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Admins & Managers</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsStrip: {
    flexDirection: 'row',
    gap: SPACING[16],
    marginBottom: SPACING[20],
    flexWrap: 'wrap',
  },
  statsStripMobile: {
    flexDirection: 'column',
  },
  statCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[16],
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[16],
  },
  statIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  statLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[500],
    marginTop: 2,
  },
});
