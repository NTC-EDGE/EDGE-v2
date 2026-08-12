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
      {/* Mobile Navbar Back Button Header */}
      {isMobile && (
        <View style={originalStyles.mobileNavbar}>
          <TouchableOpacity onPress={onBackToServices} style={originalStyles.mobileBackBtn}>
            <Icon name="arrow-left" size={18} color="#1f2937" style={{ marginRight: 6 }} />
            <Text style={originalStyles.mobileBackBtnText}>Back to Services</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={originalStyles.detailsContent} showsVerticalScrollIndicator={false}>
        <View style={originalStyles.detailsCard}>
          {/* Back button (Web only) */}
          {!isMobile && (
            <TouchableOpacity onPress={onBackToServices} style={originalStyles.backLink}>
              <Icon name="chevron-left" size={14} color="#1d4ed8" />
              <Text style={originalStyles.backLinkText}>Back to Services List</Text>
            </TouchableOpacity>
          )}

          <Text style={originalStyles.detailsTitle}>{selectedService.title}</Text>

          {/* 1. Official Service Information Card */}
          <View style={localStyles.infoCard}>
            <View style={localStyles.cardHeader}>
              <Icon name="info" size={16} color="#0F2C59" style={{ marginRight: 8 }} />
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
    borderLeftColor: "#0F2C59",
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
    color: "#0F2C59",
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
