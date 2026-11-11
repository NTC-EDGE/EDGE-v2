import React from "react";
import { View, TouchableOpacity, Text, StyleSheet, useWindowDimensions } from "react-native";
import { COLORS, TYPOGRAPHY, Icon } from "@edge/ui";

interface GeneralWizardNavigationProps {
  step: number;
  totalSteps?: number;
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
}

export function GeneralWizardNavigation({
  step,
  totalSteps = 5,
  onBack,
  onNext,
  nextDisabled = false,
}: GeneralWizardNavigationProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const getNextButtonLabel = () => {
    if (step === 5) return "Submit Application";
    if (step === 4) return "Proceed to Review";
    return "Continue";
  };

  return (
    <View style={[styles.fixedBottomBar, isMobile && { paddingHorizontal: 12, paddingVertical: 10 }]}>
      <View style={[styles.innerContainer, isMobile && { gap: 8 }]}>
        {/* Step Indicator Pill */}
        <View style={styles.stepInfoContainer}>
          <View style={[styles.stepBadge, isMobile && { paddingHorizontal: 8, paddingVertical: 6 }]}>
            <Text style={styles.stepBadgeText}>
              {isMobile ? `STEP ${step}/${totalSteps}` : `STEP ${step} OF ${totalSteps}`}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={[styles.actionsContainer, isMobile && { flex: 1, gap: 8 }]}>
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.7}
            style={[styles.backButton, isMobile && { flex: 1, minWidth: 0, paddingHorizontal: 10 }]}
          >
            <Icon name="arrow-left" size={15} color={COLORS.neutral[700]} />
            <Text style={styles.backButtonText}>
              {step === 1 ? "Cancel" : "Back"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onNext}
            activeOpacity={0.8}
            disabled={nextDisabled}
            style={[
              styles.nextButton,
              nextDisabled && styles.nextButtonDisabled,
              isMobile && { flex: 1.4, minWidth: 0, paddingHorizontal: 12 },
            ]}
          >
            <Text style={styles.nextButtonText}>
              {getNextButtonLabel()}
            </Text>
            <Icon
              name={step === 5 ? "check-circle" : "arrow-right"}
              size={15}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fixedBottomBar: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 50,
  },
  innerContainer: {
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  stepInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepBadge: {
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  stepBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
    letterSpacing: 0.5,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 110,
  },
  backButtonText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.neutral[700],
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0F2C59",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 24,
    minWidth: 140,
    shadowColor: "#0F2C59",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  nextButtonDisabled: {
    backgroundColor: "#94A3B8",
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

