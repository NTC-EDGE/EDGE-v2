import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { Icon, COLORS, TYPOGRAPHY, SPACING } from "@edge/ui";
import { NTCService } from "../../data/servicesData";
import { styles as originalStyles } from "./ServiceDetails.styles";

interface ServiceDetailsProps {
  selectedService: NTCService;
  onBackToServices: () => void;
  onApplyPress: () => void;
  isMobile: boolean;
}

export function ServiceDetails({
  selectedService,
  onBackToServices,
  onApplyPress,
  isMobile,
}: ServiceDetailsProps) {
  const displayInformation = selectedService.description;
  const displayWhoMayAvail = selectedService.whoMayAvail || null;

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <ScrollView contentContainerStyle={originalStyles.detailsContent} showsVerticalScrollIndicator={false}>
        <View style={originalStyles.detailsCard}>
          <Text style={originalStyles.detailsTitle}>{selectedService.title}</Text>

          {/* 1. Official Service Information Card */}
          <View style={localStyles.infoCard}>
            <View style={localStyles.cardHeader}>
              <Icon name="info" size={16} color="#031A6E" style={{ marginRight: 8 }} />
              <Text style={localStyles.cardHeaderTitle}>Service Information</Text>
            </View>
            <Text style={localStyles.infoBodyText}>{displayInformation}</Text>
          </View>

          {/* 2. Who May Avail Section Card */}
          {displayWhoMayAvail && (
            <View style={localStyles.availCard}>
              <View style={localStyles.cardHeader}>
                <Icon name="users" size={16} color="#065F46" style={{ marginRight: 8 }} />
                <Text style={localStyles.availHeaderTitle}>Who May Avail</Text>
              </View>
              <Text style={localStyles.availBodyText}>
                {displayWhoMayAvail.replace("WHO MAY AVAIL:", "").trim()}
              </Text>
            </View>
          )}

          {/* 3. Bottom Action Bar: Back to Services & Apply Now side-by-side */}
          <View style={localStyles.actionsRow}>
            <TouchableOpacity
              onPress={onBackToServices}
              style={localStyles.backBtn}
              activeOpacity={0.7}
            >
              <Icon name="arrow-left" size={16} color="#475569" />
              <Text style={localStyles.backBtnText}>Back to Services</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onApplyPress}
              style={localStyles.applyBtn}
              activeOpacity={0.8}
            >
              <Text style={localStyles.applyBtnText}>Apply Now</Text>
              <Icon name="arrow-right" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
  infoCard: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    borderWidth: 1,
    borderLeftWidth: 4,
    borderLeftColor: "#031A6E",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  availCard: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
    borderWidth: 1,
    borderLeftWidth: 4,
    borderLeftColor: "#059669",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cardHeaderTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: "700",
    color: "#031A6E",
  },
  availHeaderTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: "700",
    color: "#065F46",
  },
  infoBodyText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: "#334155",
    lineHeight: 20,
  },
  availBodyText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: "#047857",
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 24,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    borderColor: "#CBD5E1",
    borderWidth: 1,
    ...Platform.select({
      web: {
        cursor: "pointer",
        transition: "all 150ms ease",
      },
    }),
  },
  backBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  applyBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#031A6E",
    ...Platform.select({
      web: {
        cursor: "pointer",
        transition: "all 150ms ease",
        boxShadow: "0 2px 6px rgba(3, 26, 110, 0.2)",
      },
    }),
  },
  applyBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
