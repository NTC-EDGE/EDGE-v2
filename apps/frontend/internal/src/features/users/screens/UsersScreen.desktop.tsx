import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SPACING, useTheme } from '@edge/ui';
import { UsersScreenContent } from './UsersScreenContent';

export function UsersScreen() {
  const { colors, isDark } = useTheme();

  return (
    <ScrollView
      style={[styles.desktopShell, { backgroundColor: isDark ? colors.neutral[900] : colors.bg }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={true}
    >
      <View style={styles.container}>
        <UsersScreenContent isDesktop={true} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  desktopShell: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
    paddingBottom: SPACING[40],
  },
  container: {
    flex: 1,
    width: '100%',
    paddingHorizontal: SPACING[24],
    paddingTop: SPACING[20],
  },
});
