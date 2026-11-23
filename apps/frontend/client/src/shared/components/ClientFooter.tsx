import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { Icon as Lucide } from "@edge/ui";
import { TYPOGRAPHY, SPACING } from "../theme/tokens";
import { useClientSupportModals } from "../support/hooks/useClientSupportModals";
import { SendFeedbackModal } from "../support/components/SendFeedbackModal";
import { HelpCenterModal } from "../support/components/HelpCenterModal";
import { ClientPolicyModal } from "../support/components/ClientPolicyModal";

export function ClientFooter() {
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  const currentYear = new Date().getFullYear();

  const support = useClientSupportModals();

  return (
    <>
      {isMobile ? (
        <View style={styles.mobileFooterContainer}>
          <View style={styles.mobileTopLinksRow}>
            <TouchableOpacity
              style={styles.mobileActionPillPrimary}
              onPress={() => support.openFeedbackModal()}
              activeOpacity={0.8}
            >
              <Lucide name="message-square" size={12} color="#93C5FD" />
              <Text style={styles.mobileActionPillPrimaryText}>
                Send Feedback
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mobileActionPillPrimary}
              onPress={() => support.openHelpCenterModal()}
              activeOpacity={0.8}
            >
              <Lucide name="help-circle" size={12} color="#93C5FD" />
              <Text style={styles.mobileActionPillPrimaryText}>
                Help Center
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mobileActionLink}
              onPress={() => support.openPolicyModal("privacy-policy")}
              activeOpacity={0.75}
            >
              <Text style={styles.mobileActionLinkText}>Privacy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mobileActionLink}
              onPress={() => support.openPolicyModal("user-agreement")}
              activeOpacity={0.75}
            >
              <Text style={styles.mobileActionLinkText}>Terms</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mobileBottomRow}>
            <Text style={styles.mobileCopyrightText}>
              © {currentYear} NTC Philippines • EDGE Portal
            </Text>
            <View style={styles.mobileStatusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.mobileStatusText}>Operational</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.footerContainer}>
          <View
            style={[
              styles.footerContent,
              isTablet && { flexDirection: "column", alignItems: "flex-start" },
            ]}
          >
            {/* Left Section: Branding & Copyright */}
            <View style={styles.leftSection}>
              <Text style={styles.brandTitle}>
                Republic of the Philippines • National Telecommunications
                Commission
              </Text>
              <Text style={styles.copyrightText}>
                © {currentYear} NTC EDGE Licensing & Spectrum Portal. All Rights
                Reserved. RA 7925 Official System.
              </Text>
            </View>

            {/* Right Section: Support Buttons, Policy Links & Status Badge */}
            <View
              style={[
                styles.rightSection,
                isTablet && { alignItems: "flex-start", width: "100%" },
              ]}
            >
              <View style={styles.supportButtonsRow}>
                <TouchableOpacity
                  style={styles.supportButtonPill}
                  onPress={() => support.openFeedbackModal()}
                  activeOpacity={0.8}
                >
                  <Lucide name="message-square" size={12} color="#93C5FD" />
                  <Text style={styles.supportButtonText}>Send Feedback</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.supportButtonPill}
                  onPress={() => support.openHelpCenterModal()}
                  activeOpacity={0.8}
                >
                  <Lucide name="help-circle" size={12} color="#93C5FD" />
                  <Text style={styles.supportButtonText}>Help Center</Text>
                </TouchableOpacity>

                <View style={styles.badgeContainer}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>
                    NTC EDGE • System Operational
                  </Text>
                </View>
              </View>

              <View style={styles.policyLinksRow}>
                <TouchableOpacity
                  onPress={() => support.openPolicyModal("privacy-policy")}
                >
                  <Text style={styles.footerLinkItem}>Privacy Policy</Text>
                </TouchableOpacity>
                <Text style={styles.footerDotSeparator}>•</Text>
                <TouchableOpacity
                  onPress={() => support.openPolicyModal("user-agreement")}
                >
                  <Text style={styles.footerLinkItem}>User Agreement</Text>
                </TouchableOpacity>
                <Text style={styles.footerDotSeparator}>•</Text>
                <TouchableOpacity
                  onPress={() =>
                    support.openPolicyModal("community-guidelines")
                  }
                >
                  <Text style={styles.footerLinkItem}>
                    Community Guidelines
                  </Text>
                </TouchableOpacity>
                <Text style={styles.footerDotSeparator}>•</Text>
                <TouchableOpacity
                  onPress={() => support.openPolicyModal("cookie-policy")}
                >
                  <Text style={styles.footerLinkItem}>Cookie Policy</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Interactive Regional Send Feedback, Help Center & Governance Policy Modals */}
      <SendFeedbackModal support={support} />
      <HelpCenterModal support={support} />
      <ClientPolicyModal
        policyKey={support.activePolicyKey}
        onClose={support.closePolicyModal}
      />
    </>
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
    gap: 10,
  },
  mobileTopLinksRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  mobileActionPillPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(37, 99, 235, 0.25)",
    borderColor: "rgba(147, 197, 253, 0.3)",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  mobileActionPillPrimaryText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "700",
    color: "#E0F2FE",
  },
  mobileActionLink: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  mobileActionLinkText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
  },
  mobileBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mobileCopyrightText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "600",
    color: "#CBD5E1",
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
    maxWidth: 1400,
    width: "100%",
    alignSelf: "center",
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
    gap: 8,
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
  supportButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  supportButtonPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(37, 99, 235, 0.24)",
    borderColor: "rgba(147, 197, 253, 0.3)",
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
  },
  supportButtonText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "700",
    color: "#E0F2FE",
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderColor: "rgba(16, 185, 129, 0.25)",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
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
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#34D399",
  },
  policyLinksRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  footerLinkItem: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
  },
  footerDotSeparator: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.35)",
  },
});
