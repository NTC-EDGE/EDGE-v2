import React from "react";
import { StyleSheet, SafeAreaView } from "react-native";
import { useTheme, AnimatedCard } from "@edge/ui";
import { UsersScreenContent } from "./UsersScreenContent";

export function UsersScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.nativeSafeArea, { backgroundColor: colors.bg }]}>
      <AnimatedCard delay={0} padding={0} hoverEffect={false} style={styles.cardWrapper}>
        <UsersScreenContent isMobileNative={true} />
      </AnimatedCard>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  nativeSafeArea: {
    flex: 1,
  },
  cardWrapper: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 0,
  },
});
