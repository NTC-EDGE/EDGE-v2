import React from 'react';
import { ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { SPACING, useTheme } from '@edge/ui';
import { UsersScreenContent } from './UsersScreenContent';

export function UsersScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.nativeSafeArea, { backgroundColor: colors.bg }]}>
      <ScrollView
        style={styles.nativeScroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <UsersScreenContent isMobileNative={true} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  nativeSafeArea: {
    flex: 1,
  },
  nativeScroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING[16],
    paddingBottom: SPACING[40],
  },
});
