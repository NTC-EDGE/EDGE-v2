import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Icon, COLORS } from "@edge/ui";
import { styles } from "../ExamFilingWizard.styles";

interface ExamWizardNavigationProps {
  step: number;
  appMode: "SINGLE" | "BULK" | "";
  isAgreedToTerms: boolean;
  isNextDisabled: boolean;
  handleBack: () => void;
  handleNext: () => void;
  getNextBtnText: () => string;
}

export function ExamWizardNavigation({
  step,
  appMode,
  isAgreedToTerms,
  isNextDisabled,
  handleBack,
  handleNext,
  getNextBtnText,
}: ExamWizardNavigationProps) {
  const isButtonActive = !isNextDisabled && (step < 6 || appMode === "BULK" || isAgreedToTerms);

  return (
    <View style={styles.footer}>
      <TouchableOpacity onPress={handleBack} style={styles.btnSecondary}>
        <Text style={styles.btnSecondaryText}>Back</Text>
      </TouchableOpacity>

      {step <= 6 && (
        <TouchableOpacity
          disabled={isNextDisabled || (step === 6 && appMode === "SINGLE" && !isAgreedToTerms)}
          onPress={handleNext}
          style={[styles.btnPrimary, isButtonActive && styles.btnPrimaryActive]}
        >
          <Text style={[styles.btnPrimaryText, isButtonActive && styles.btnPrimaryTextActive]}>
            {getNextBtnText()}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
