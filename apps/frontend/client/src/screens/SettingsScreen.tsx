import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, SPACING, TYPOGRAPHY } from "@edge/ui";

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>
          Configure your preferences, account details, and notification options.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING[24],
  },
  card: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: SPACING[32],
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.section,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[900],
    marginBottom: SPACING[8],
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.body,
    color: "#64748B",
  },
});
