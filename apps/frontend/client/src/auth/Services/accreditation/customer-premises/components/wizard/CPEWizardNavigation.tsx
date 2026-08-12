import React from "react";
import { View, TouchableOpacity, Text } from "react-native";

interface CPEWizardNavigationProps {
  step: number;
  onBack: () => void;
  onNext: () => void;
  isNextDisabled: boolean;
  styles: any;
}

export function CPEWizardNavigation({
  step,
  onBack,
  onNext,
  isNextDisabled,
  styles,
}: CPEWizardNavigationProps) {
  if (step >= 6) return null;

  return (
    <View style={styles.footerControls}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onNext}
        disabled={isNextDisabled}
        style={[
          styles.nextButton,
          isNextDisabled && styles.nextButtonDisabled,
        ]}
      >
        <Text style={[styles.nextButtonText, isNextDisabled && styles.nextButtonTextDisabled]}>
          {step === 5 ? "Submit" : "Next"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
