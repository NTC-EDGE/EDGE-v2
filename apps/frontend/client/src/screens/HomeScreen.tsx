import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAppNavigation } from "../navigation";
import { COLORS, SPACING, TYPOGRAPHY } from "@edge/ui";

export default function HomeScreen() {
  const navigation = useAppNavigation();

  const handlePressDetails = () => {
    navigation.navigate("Services");
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome to NTC EDGE</Text>
        <Text style={styles.subtitle}>
          Cross-platform services, licensing, and communications portal.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handlePressDetails}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>View Details</Text>
        </TouchableOpacity>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.heading,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[900],
    marginBottom: SPACING[8],
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.body,
    color: "#64748B",
    marginBottom: SPACING[24],
    lineHeight: 22,
  },
  button: {
    backgroundColor: COLORS.brand[700],
    paddingVertical: SPACING[12],
    paddingHorizontal: SPACING[24],
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
