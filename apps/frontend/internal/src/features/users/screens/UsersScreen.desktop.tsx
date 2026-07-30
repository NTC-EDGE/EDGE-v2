import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme, AnimatedCard } from "@edge/ui";
import { UsersScreenContent } from "./UsersScreenContent";

export function UsersScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.desktopShell, { backgroundColor: colors.bg }]}>
      <View style={styles.container}>
        <AnimatedCard delay={0} padding={0} hoverEffect={false} style={styles.cardWrapper}>
          <UsersScreenContent isDesktop={true} />
        </AnimatedCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  desktopShell: {
    flex: 1,
  },
  container: {
    flex: 1,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  cardWrapper: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 0,
  },
});
