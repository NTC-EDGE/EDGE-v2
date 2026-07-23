import React from "react";
import { View, Text } from "react-native";
import { Icon, COLORS, TYPOGRAPHY } from "@edge/ui";
import { ApplicantData } from "../../types/cpeTypes";
import { CPESteps1To3 } from "./CPESteps1To3";
import { CPEStep4BulkMethod } from "./CPEStep4BulkMethod";
import { CPEStep5ApplicationForm } from "./CPEStep5ApplicationForm";
import { CPEStep6DocumentUpload } from "./CPEStep6DocumentUpload";
import { CPEStep7Review } from "./CPEStep7Review";

interface CPEWizardStepsProps {
  step: number;
  selectedRegionId: string;
  setSelectedRegionId: (id: string) => void;
  selectedOfficeId: string;
  setSelectedOfficeId: (id: string) => void;
  tenants: any[];
  officesList: any[];
  appMode: "SINGLE" | "BULK" | "";
  setAppMode: (mode: "SINGLE" | "BULK" | "") => void;
  activeApplicant: ApplicantData;
  updateActiveApplicant: (fields: Partial<ApplicantData>) => void;
  setApplicants: React.Dispatch<React.SetStateAction<ApplicantData[]>>;
  setCurrentApplicantIndex: (idx: number) => void;
  initialApplicant: (id: number) => ApplicantData;
  bulkMethod: "MANUAL" | "EXCEL";
  setBulkMethod: (val: "MANUAL" | "EXCEL") => void;
  isFileUploaded: boolean;
  handleMockFileUpload: () => void;
  handleFieldChange: (field: keyof ApplicantData, value: string) => void;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  handleScrollToSection: (offset: number) => void;
  handleDocumentPick: (key: string) => void;
  activeRegionObj: any;
  styles: any;
}

export function CPEWizardSteps({
  step,
  selectedRegionId,
  setSelectedRegionId,
  selectedOfficeId,
  setSelectedOfficeId,
  tenants,
  officesList,
  appMode,
  setAppMode,
  activeApplicant,
  updateActiveApplicant,
  setApplicants,
  setCurrentApplicantIndex,
  initialApplicant,
  bulkMethod,
  setBulkMethod,
  isFileUploaded,
  handleMockFileUpload,
  handleFieldChange,
  errors,
  touched,
  handleScrollToSection,
  handleDocumentPick,
  activeRegionObj,
  styles,
}: CPEWizardStepsProps) {
  if (step >= 1 && step <= 3) {
    return (
      <CPESteps1To3
        step={step}
        selectedRegionId={selectedRegionId}
        setSelectedRegionId={setSelectedRegionId}
        selectedOfficeId={selectedOfficeId}
        setSelectedOfficeId={setSelectedOfficeId}
        tenants={tenants}
        offices={officesList}
        appMode={appMode}
        setAppMode={setAppMode}
        activeApplicant={activeApplicant}
        updateActiveApplicant={updateActiveApplicant}
        setApplicants={setApplicants}
        setCurrentApplicantIndex={setCurrentApplicantIndex}
        initialApplicant={initialApplicant}
        styles={styles}
      />
    );
  }

  if (step === 4) {
    return (
      <CPEStep4BulkMethod
        appMode={appMode}
        setAppMode={setAppMode}
        bulkMethod={bulkMethod}
        setBulkMethod={setBulkMethod}
        isFileUploaded={isFileUploaded}
        handleMockFileUpload={handleMockFileUpload}
        styles={styles}
      />
    );
  }

  if (step === 5) {
    return (
      <CPEStep5ApplicationForm
        activeApplicant={activeApplicant}
        updateActiveApplicant={updateActiveApplicant}
        handleFieldChange={handleFieldChange}
        errors={errors}
        touched={touched}
        handleScrollToSection={handleScrollToSection}
        styles={styles}
      />
    );
  }

  if (step === 6) {
    return (
      <CPEStep6DocumentUpload
        activeApplicant={activeApplicant}
        updateActiveApplicant={updateActiveApplicant}
        handleDocumentPick={handleDocumentPick}
        styles={styles}
      />
    );
  }

  if (step === 7) {
    return (
      <CPEStep7Review
        appMode={appMode}
        applicants={[activeApplicant]}
        activeRegionObj={activeRegionObj}
        styles={styles}
      />
    );
  }

  if (step === 8) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 40 }}>
        <Icon name="check-circle" size={64} color="#10b981" style={{ marginBottom: 16 }} />
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 20, fontWeight: "700", color: COLORS.neutral[900], marginBottom: 8 }}>
          Application Successfully Filed!
        </Text>
        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, color: COLORS.neutral[500], textAlign: "center", marginBottom: 32, maxHeight: 80, overflow: "hidden" }}>
          Your CPE supplier accreditation filing was registered.
        </Text>
      </View>
    );
  }

  return null;
}
