import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Icon, COLORS, TYPOGRAPHY } from "@edge/ui";

interface FilingIntentReviewCardProps {
  filingIntent?: "Regular" | "AssessmentOnly";
  onFilingIntentChange?: (intent: "Regular" | "AssessmentOnly") => void;
}

export function FilingIntentReviewCard({
  filingIntent = "Regular",
  onFilingIntentChange,
}: FilingIntentReviewCardProps) {
  const isAssessment = filingIntent === "AssessmentOnly";

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <Icon name="layers" size={16} color={COLORS.brand[700]} />
        </View>
        <View style={styles.headerTexts}>
          <Text style={styles.title}>Filing Mode &amp; Intent</Text>
          <Text style={styles.subtitle}>
            Choose whether to submit for formal processing or request a preliminary fee assessment.
          </Text>
        </View>
      </View>

      <View style={styles.cardsRow}>
        {/* Regular Application Option */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onFilingIntentChange?.("Regular")}
          style={[
            styles.optionCard,
            !isAssessment ? styles.optionCardSelected : styles.optionCardUnselected,
          ]}
        >
          <View style={styles.optionHeader}>
            <View
              style={[
                styles.radioDot,
                !isAssessment ? styles.radioDotSelected : styles.radioDotUnselected,
              ]}
            >
              {!isAssessment && <View style={styles.radioDotInner} />}
            </View>
            <View style={styles.optionTitleRow}>
              <Icon name="file-text" size={16} color={!isAssessment ? "#0F2C59" : "#64748B"} />
              <Text
                style={[
                  styles.optionTitle,
                  !isAssessment ? styles.optionTitleSelected : styles.optionTitleUnselected,
                ]}
              >
                Official Application
              </Text>
            </View>
          </View>
          <Text style={styles.optionDesc}>
            Standard filing for regulatory evaluation, payment processing, and certificate/license issuance.
          </Text>
        </TouchableOpacity>

        {/* Assessment Only Option */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onFilingIntentChange?.("AssessmentOnly")}
          style={[
            styles.optionCard,
            isAssessment ? styles.optionCardSelectedPurple : styles.optionCardUnselected,
          ]}
        >
          <View style={styles.optionHeader}>
            <View
              style={[
                styles.radioDot,
                isAssessment ? styles.radioDotSelectedPurple : styles.radioDotUnselected,
              ]}
            >
              {isAssessment && <View style={styles.radioDotInnerPurple} />}
            </View>
            <View style={styles.optionTitleRow}>
              <Icon name="search" size={16} color={isAssessment ? "#7C3AED" : "#64748B"} />
              <Text
                style={[
                  styles.optionTitle,
                  isAssessment ? styles.optionTitleSelectedPurple : styles.optionTitleUnselected,
                ]}
              >
                For Assessment Only
              </Text>
            </View>
          </View>
          <Text style={styles.optionDesc}>
            Submit details to receive an initial requirement review and official Statement of Account (SOA) before formal processing.
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerTexts: {
    flex: 1,
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: 14,
    color: "#0F2C59",
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  cardsRow: {
    gap: 10,
  },
  optionCard: {
    borderRadius: 10,
    borderWidth: 1.5,
    padding: 12,
  },
  optionCardSelected: {
    borderColor: "#0F2C59",
    backgroundColor: "#F8FAFC",
  },
  optionCardSelectedPurple: {
    borderColor: "#7C3AED",
    backgroundColor: "#FAF5FF",
  },
  optionCardUnselected: {
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  radioDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  radioDotSelected: {
    borderColor: "#0F2C59",
  },
  radioDotSelectedPurple: {
    borderColor: "#7C3AED",
  },
  radioDotUnselected: {
    borderColor: "#CBD5E1",
  },
  radioDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0F2C59",
  },
  radioDotInnerPurple: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#7C3AED",
  },
  optionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  optionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
    fontSize: 13,
  },
  optionTitleSelected: {
    color: "#0F2C59",
  },
  optionTitleSelectedPurple: {
    color: "#7C3AED",
  },
  optionTitleUnselected: {
    color: "#334155",
  },
  optionDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#64748B",
    lineHeight: 16,
    marginLeft: 26,
  },
});
