import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { COLORS, TYPOGRAPHY } from "@edge/ui";

interface NtcLogoProps {
  size?: "small" | "medium" | "large";
  variant?: "light" | "dark";
  showSubtext?: boolean;
}

export function NtcLogo({
  size = "medium",
  variant = "light",
  showSubtext = true,
}: NtcLogoProps) {
  const isDark = variant === "dark";
  
  const scale = size === "small" ? 0.75 : size === "large" ? 1.35 : 1.0;
  const sealSize = 38 * scale;
  const edgeFontSize = 26 * scale;
  const subtextFontSize = 8 * scale;

  return (
    <View style={styles.container}>
      {/* NTC Round Seal Badge */}
      <View
        style={[
          styles.sealOuter,
          {
            width: sealSize,
            height: sealSize,
            borderRadius: sealSize / 2,
          },
        ]}
      >
        <View style={styles.sealTopArc} />
        <View style={styles.sealBottomArc} />
        <View
          style={[
            styles.sealInnerCircle,
            {
              width: sealSize * 0.52,
              height: sealSize * 0.52,
              borderRadius: (sealSize * 0.52) / 2,
            },
          ]}
        >
          <View style={styles.sealCenterDot} />
        </View>
      </View>

      {/* EDGE Typography */}
      <View style={styles.textContainer}>
        <View style={styles.brandRow}>
          <View style={styles.circuitLineContainer}>
            <View style={styles.circuitDotRed} />
            <View style={styles.circuitBarRed} />
          </View>
          <Text
            style={[
              styles.edgeTitle,
              { fontSize: edgeFontSize },
              isDark ? styles.textDark : styles.textLight,
            ]}
          >
            EDGE
          </Text>
        </View>

        {showSubtext && (
          <Text
            style={[
              styles.subtext,
              { fontSize: subtextFontSize },
              isDark ? styles.subtextDark : styles.subtextLight,
            ]}
          >
            ELECTRONIC DATA GOVERNANCE AND EVALUATION
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sealOuter: {
    backgroundColor: COLORS.neutral.white,
    borderWidth: 2,
    borderColor: "#1E3A8A",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sealTopArc: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "#DC2626", // Red NTC top half
  },
  sealBottomArc: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "#1D4ED8", // Blue NTC bottom half
  },
  sealInnerCircle: {
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1.5,
    borderColor: "#F59E0B", // Gold ring
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  sealCenterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#DC2626",
  },
  textContainer: {
    justifyContent: "center",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  circuitLineContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 2,
  },
  circuitDotRed: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#DC2626",
  },
  circuitBarRed: {
    width: 8,
    height: 2,
    backgroundColor: "#DC2626",
  },
  edgeTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  textLight: {
    color: "#0B1953", // Deep navy
  },
  textDark: {
    color: COLORS.neutral.white,
  },
  subtext: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.6,
    marginTop: -2,
  },
  subtextLight: {
    color: COLORS.neutral[600],
  },
  subtextDark: {
    color: COLORS.neutral[300],
  },
});
