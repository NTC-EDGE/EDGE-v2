import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Icon, COLORS, TYPOGRAPHY } from "@edge/ui";
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
    <View style={{ flex: 1 }}>
      {/* Back to Services Navigation Button (Mobile, iPad & Desktop Views) */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, backgroundColor: "#FFFFFF" }}>
        <TouchableOpacity
          onPress={onBackToServices}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            alignSelf: "flex-start",
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 8,
            backgroundColor: "#EFF6FF",
            borderColor: "#BFDBFE",
            borderWidth: 1,
          }}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={16} color="#1E40AF" />
          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: "#1E40AF" }}>
            Back to Services
          </Text>
        </TouchableOpacity>
      </View>

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

          {/* 3. Apply Now Action Button */}
          <TouchableOpacity
            onPress={onApplyPress}
            style={[originalStyles.applyBtn, { marginTop: 16 }]}
          >
            <Text style={originalStyles.applyBtnText}>Apply Now</Text>
            <Icon name="arrow-right" size={16} color="#ffffff" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
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
    whiteSpace: "pre-line",
  } as any,
  availBodyText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: "#047857",
    lineHeight: 20,
    whiteSpace: "pre-line",
  } as any,
});
