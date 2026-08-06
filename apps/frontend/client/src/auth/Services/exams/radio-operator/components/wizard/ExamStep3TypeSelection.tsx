import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { COLORS } from "@edge/ui";
import { Select } from "../../../../../../shared/components/Select";
import { ValidatedInput } from "../../../../../../shared/components/ValidatedInput";
import { ExamApplicantData } from "../../types/examTypes";
import { styles } from "../ExamFilingWizard.styles";

interface ExamStep3TypeSelectionProps {
  activeApplicant: ExamApplicantData;
  updateActiveApplicant: (fields: Partial<ExamApplicantData>) => void;
  variants: any[];
  variantElements: any[];
  isLoadingElements: boolean;
  dbRequirements: any[];
  serviceName?: string | null;
}

export function ExamStep3TypeSelection({
  activeApplicant,
  updateActiveApplicant,
  variants,
  variantElements,
  isLoadingElements,
  dbRequirements,
  serviceName,
}: ExamStep3TypeSelectionProps) {
  const selectedVariantId = activeApplicant?.selectedVariantId || "";
  const hasElements = variantElements && variantElements.length > 0;

  return (
    <View>
      <Text style={styles.stepSubtitle}>Specify your application concern and view the required documents:</Text>

      <Text style={styles.selectLabel}>Selected Service</Text>
      <ValidatedInput
        value={serviceName || "Exam Filing"}
        editable={false}
        onChangeText={() => {}}
      />

      <Text style={styles.selectLabel}>Examinee type</Text>
      <Select
        placeholder="Select Examinee type"
        value={selectedVariantId}
        onValueChange={(val: string) => {
          const matchedVariant = variants.find((v) => v.id === val);
          let examType = "";
          if (matchedVariant) {
            const desc = (matchedVariant.description || "").toLowerCase();
            if (desc.includes("radiotelegraphy")) examType = "Radiotelegraphy";
            else if (desc.includes("radiotelephony")) examType = "Radiotelephony";
            else if (desc.includes("amateur")) examType = "Amateur";
            else if (desc.includes("rroc") || desc.includes("aircraft")) examType = "RROC-Aircraft";
          }
          updateActiveApplicant({
            examType,
            examineeType: matchedVariant ? (matchedVariant.type === "FirstTaker" ? "First Taker" : (matchedVariant.type === "Retaker" ? "Repeater" : "Upgrader")) : "",
            selectedVariantId: val as string,
            selectedOption: "",
            selectedElementId: ""
          });
        }}
        options={variants.map((v) => {
          const label = v.description || (
            v.type === "FirstTaker" ? "First Taker" 
            : v.type === "Retaker" ? "Repeater" 
            : v.type === "Upgrade" ? "Upgrader" 
            : v.type
          );
          return { label, value: v.id };
        })}
      />

      {/* Radio Options List */}
      {selectedVariantId !== "" && (
        isLoadingElements ? (
          <Text style={{ fontSize: 12, color: COLORS.neutral[500], fontStyle: "italic", marginTop: 8, marginBottom: 12 }}>
            Loading available elements...
          </Text>
        ) : hasElements ? (
          <View style={styles.radioGroup}>
            {variantElements.map((elem) => {
              const optText = `${elem.code} - ${elem.description}`;
              const isSelected = activeApplicant.selectedElementId === elem.id;
              return (
                <TouchableOpacity
                  key={elem.id}
                  onPress={() => updateActiveApplicant({
                    selectedOption: optText,
                    selectedElementId: elem.id
                  })}
                  style={[styles.radioOption, isSelected && styles.radioOptionSelected]}
                >
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                    {isSelected && <View style={styles.radioCircleInner} />}
                  </View>
                  <Text style={[styles.radioText, isSelected && styles.radioTextSelected]}>{optText}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null
      )}

      {/* Requirements Box */}
      <View style={styles.reqBox}>
        <Text style={styles.reqTitle}>Requirements</Text>
        {dbRequirements.length === 0 ? (
          <Text style={styles.reqItem}>Select Examinee Type to load requirements.</Text>
        ) : (
          dbRequirements.map((req, idx) => (
            <Text key={req.requirementId} style={styles.reqItem}>
              {idx + 1}. {req.name}{req.isRequired ? " *" : ""}
            </Text>
          ))
        )}
      </View>
    </View>
  );
}
