import React from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { TYPOGRAPHY, SPACING } from "../theme/tokens";

export function ClientFooter() {
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const currentYear = new Date().getFullYear();

  if (isMobile) {
    return (
      <View style={styles.mobileFooterContainer}>
        <Text style={styles.mobileCopyrightText}>
          © {currentYear} NTC Philippines
        </Text>
        <View style={styles.mobileStatusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.mobileStatusText}>Operational</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.footerContainer}>
      <View style={styles.footerContent}>
        {/* Left Section: Branding & Copyright */}
        <View style={styles.leftSection}>
          <Text style={styles.brandTitle}>
            Republic of the Philippines • National Telecommunications Commission
          </Text>
          <Text style={styles.copyrightText}>
            © {currentYear} NTC EDGE Licensing & Spectrum Portal. All Rights Reserved. RA 7925 Official System.
          </Text>
        </View>

        {/* Right Section: System Metadata & Status Badge */}
        <View style={styles.rightSection}>
          <View style={styles.badgeContainer}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>NTC EDGE v2.4 • System Operational</Text>
          </View>

          <Text style={styles.footerLinks}>
            Official NTC Portal • Privacy Policy • Terms of Service • Guidelines
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mobileFooterContainer: {
    width: "100%",
    backgroundColor: "#0A192F",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.12)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mobileCopyrightText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "600",
    color: "#E2E8F0",
  },
  mobileStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderColor: "rgba(16, 185, 129, 0.25)",
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  mobileStatusText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: "700",
    color: "#34D399",
  },
  footerContainer: {
    width: "100%",
    backgroundColor: "#0A192F",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.12)",
    paddingVertical: SPACING[16],
    paddingHorizontal: SPACING[24],
  },
  footerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING[16],
  },
  leftSection: {
    flex: 1,
    gap: 4,
  },
  rightSection: {
    alignItems: "flex-end",
    gap: 6,
  },
  brandTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#E2E8F0",
    letterSpacing: 0.3,
  },
  copyrightText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.6)",
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderColor: "rgba(16, 185, 129, 0.25)",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  statusText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: "700",
    color: "#34D399",
  },
  footerLinks: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.5)",
  },
});
