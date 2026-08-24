import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ExamApplicantData } from "../../types/examTypes";
import { ExamStep4BasicInfo } from "./ExamStep4BasicInfo";
import { ExamStep4AddressInfo } from "./ExamStep4AddressInfo";
import { ExamStep4EducationInfo } from "./ExamStep4EducationInfo";
import { ExamStep4ContactInfo } from "./ExamStep4ContactInfo";
import { FormSignatureInput } from "../../../../../../shared/components/FormSignatureInput";
import { styles } from "../ExamFilingWizard.styles";

interface ExamStep4FormProps {
  activeApplicant: ExamApplicantData;
  updateActiveApplicant: (fields: Partial<ExamApplicantData>) => void;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  activeFormTab: "BASIC" | "ADDRESS" | "EDUCATION" | "CONTACT" | "SIGNATURE";
  handleFieldChange: (field: keyof ExamApplicantData, value: string) => void;
  handleScrollToSection: (tab: "BASIC" | "ADDRESS" | "EDUCATION" | "CONTACT" | "SIGNATURE") => void;
  sectionOffsets: React.MutableRefObject<Record<string, number>>;
  appMode?: "SINGLE" | "BULK" | "";
}

export function ExamStep4Form(props: ExamStep4FormProps) {
  return (
    <View>
      <View style={styles.formHeaderTabs}>
        {(["BASIC", "ADDRESS", "EDUCATION", "CONTACT", "SIGNATURE"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => props.handleScrollToSection(tab)}
            style={[styles.formTab, props.activeFormTab === tab && styles.formTabActive]}
          >
            <Text style={[styles.formTabText, props.activeFormTab === tab && styles.formTabTextActive]}>
              {tab === "BASIC" ? "Basic Info" : tab === "ADDRESS" ? "Address" : tab === "EDUCATION" ? "Education" : tab === "CONTACT" ? "Contact" : "Signature"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ExamStep4BasicInfo
        activeApplicant={props.activeApplicant}
        updateActiveApplicant={props.updateActiveApplicant}
        errors={props.errors}
        touched={props.touched}
        handleFieldChange={props.handleFieldChange}
        sectionOffsets={props.sectionOffsets}
      />

      <ExamStep4AddressInfo
        activeApplicant={props.activeApplicant}
        updateActiveApplicant={props.updateActiveApplicant}
        errors={props.errors}
        touched={props.touched}
        handleFieldChange={props.handleFieldChange}
        sectionOffsets={props.sectionOffsets}
      />

      <ExamStep4EducationInfo
        activeApplicant={props.activeApplicant}
        updateActiveApplicant={props.updateActiveApplicant}
        errors={props.errors}
        touched={props.touched}
        handleFieldChange={props.handleFieldChange}
        sectionOffsets={props.sectionOffsets}
      />

      <ExamStep4ContactInfo
        activeApplicant={props.activeApplicant}
        errors={props.errors}
        touched={props.touched}
        handleFieldChange={props.handleFieldChange}
        sectionOffsets={props.sectionOffsets}
      />

      {/* ── Section: Acknowledgement & Applicant Signature ── */}
      <View
        onLayout={(e) => {
          props.sectionOffsets.current["SIGNATURE"] = e.nativeEvent.layout.y;
        }}
        style={styles.formSection}
      >
        <Text style={styles.formSectionHeading}>Acknowledgement & Applicant Signature</Text>
        <FormSignatureInput
          label="Applicant Signature / Declaration"
          isRequired={true}
          value={props.activeApplicant.signature || ""}
          onChange={(sig) => props.handleFieldChange("signature", sig)}
          applicantName={`${props.activeApplicant.firstName || ""} ${props.activeApplicant.lastName || ""}`.trim()}
          isBulk={props.appMode === "BULK"}
          appMode={props.appMode}
          error={props.errors.signature}
        />
      </View>
    </View>
  );
}
