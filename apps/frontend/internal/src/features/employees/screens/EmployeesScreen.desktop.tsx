import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useTheme, AnimatedCard, SPACING } from "@edge/ui";
import { EmployeesScreenContent } from "./EmployeesScreenContent";

export function EmployeesScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[styles.desktopShell, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={true}
    >
      <View style={styles.container}>
        <AnimatedCard delay={0} padding={0} hoverEffect={false} style={styles.cardWrapper}>
          <EmployeesScreenContent isDesktop={true} />
        </AnimatedCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  desktopShell: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: SPACING[16],
    paddingBottom: SPACING[40],
  },
  container: {
    flex: 1,
    width: '100%',
  },
  cardWrapper: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 0,
  },
});
