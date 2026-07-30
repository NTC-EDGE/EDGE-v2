import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SPACING, useTheme } from '@edge/ui';
import { EmployeesScreenContent } from './EmployeesScreenContent';

export function EmployeesScreen() {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.shell, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
      <View style={styles.inner}>
        <EmployeesScreenContent isWeb={true} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  inner: {
    flex: 1,
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
    padding: SPACING[24],
  },
});
