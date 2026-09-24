import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SPACING, useTheme } from '@edge/ui';
import { EmployeesScreenContent } from './EmployeesScreenContent';

export function EmployeesScreen() {
  const { colors, isDark } = useTheme();

  return (
    <ScrollView
      style={[styles.shell, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={true}
    >
      <View style={styles.inner}>
        <EmployeesScreenContent isWeb={true} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING[40],
  },
  inner: {
    flex: 1,
    width: '100%',
    padding: SPACING[24],
  },
});
