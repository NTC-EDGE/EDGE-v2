import React from "react";
import { StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { useTheme, AnimatedCard, SPACING } from "@edge/ui";
import { EmployeesScreenContent } from "./EmployeesScreenContent";

export function EmployeesScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.nativeSafeArea, { backgroundColor: colors.bg }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <AnimatedCard delay={0} padding={0} hoverEffect={false} style={styles.cardWrapper}>
          <EmployeesScreenContent isMobileNative={true} />
        </AnimatedCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  nativeSafeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING[32],
  },
  cardWrapper: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 0,
  },
});
