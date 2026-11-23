import React from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { Icon as Lucide } from "@edge/ui";
import { COLORS, SHADOWS, SPACING, TYPOGRAPHY } from "../../theme/tokens";
import {
  CLIENT_FOOTER_POLICIES,
  ClientPolicyKey,
} from "../schemas/feedbackSchema";

export interface ClientPolicyModalProps {
  policyKey: ClientPolicyKey | null;
  onClose: () => void;
}

export function ClientPolicyModal({
  policyKey,
  onClose,
}: ClientPolicyModalProps): React.ReactElement | null {
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;

  if (policyKey === null) return null;
  const policy = CLIENT_FOOTER_POLICIES[policyKey];
  if (!policy) return null;

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={[styles.overlay, isMobile && { padding: SPACING[12] }]}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={[
            styles.modalCard,
            SHADOWS.modal,
            {
              maxWidth: isMobile ? 440 : isTablet ? 640 : 760,
              borderRadius: isMobile ? 20 : 24,
            },
          ]}
          activeOpacity={1}
          onPress={() => {}}
        >
          {/* Window Header Bar */}
          <View style={styles.headerBar}>
            <View style={styles.windowDotsRow}>
              <View style={[styles.windowDot, { backgroundColor: "#EF4444" }]} />
              <View style={[styles.windowDot, { backgroundColor: "#F59E0B" }]} />
              <View style={[styles.windowDot, { backgroundColor: "#10B981" }]} />
            </View>
            <View style={styles.headerBadge}>
              <Lucide name="shield" size={12} color={COLORS.brand[800]} />
              <Text style={styles.headerBadgeText}>
                NTC-EDGE Governance Policy
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Lucide name="x" size={18} color={COLORS.neutral[500]} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ maxHeight: isMobile ? 480 : 580 }}
            contentContainerStyle={[
              styles.bodyContent,
              isMobile && { padding: 20 },
            ]}
            showsVerticalScrollIndicator={true}
          >
            <View style={styles.titleRow}>
              <View style={styles.iconCircle}>
                <Lucide name="file-text" size={20} color="#2563EB" />
              </View>
              <Text style={[styles.title, isMobile && { fontSize: 19 }]}>
                {policy.title}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.introBox}>
              <Lucide
                name="info"
                size={18}
                color="#2563EB"
                style={{ marginRight: 10, marginTop: 2 }}
              />
              <Text style={styles.introText}>{policy.intro}</Text>
            </View>

            {policy.sections.map((sec, idx) => (
              <View key={idx} style={[styles.sectionCard, SHADOWS.card]}>
                <Text style={styles.sectionTitle}>{sec.title}</Text>
                <Text style={styles.sectionBody}>{sec.body}</Text>
                {sec.highlight ? (
                  <View style={styles.highlightBadge}>
                    <Lucide
                      name="mail"
                      size={14}
                      color="#2563EB"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.highlightText}>{sec.highlight}</Text>
                  </View>
                ) : null}
              </View>
            ))}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING[20],
  },
  modalCard: {
    width: "100%",
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1.5,
    borderColor: "rgba(18, 54, 168, 0.14)",
    overflow: "hidden",
    alignSelf: "center",
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  windowDotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  windowDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.neutral[600],
  },
  closeBtn: {
    padding: 4,
    borderRadius: 12,
  },
  bodyContent: {
    padding: 28,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 22,
    fontWeight: "800",
    color: "#0F2042",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.neutral[200],
    marginBottom: 18,
    width: "100%",
  },
  introBox: {
    flexDirection: "row",
    backgroundColor: "#EEF2FF",
    borderColor: "#C7D2FE",
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    alignItems: "flex-start",
  },
  introText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.brand[800],
    fontWeight: "500",
    lineHeight: 21,
  },
  sectionCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 18,
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.brand[800],
    marginBottom: 6,
  },
  sectionBody: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[700],
    lineHeight: 21,
  },
  highlightBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutral.white,
    borderColor: "#C7D2FE",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  highlightText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.brand[800],
  },
});
