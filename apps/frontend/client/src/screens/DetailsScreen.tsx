import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { COLORS, SPACING, TYPOGRAPHY } from "@edge/ui";

export default function DetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Details Screen</Text>
        <Text style={styles.subtitle}>
          Route Name: {route.name}
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleGoBack}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Go Back</Text>
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
    marginBottom: SPACING[24],
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
