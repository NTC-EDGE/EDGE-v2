import React from "react";
import { View, Text, Pressable } from "react-native";
import { useTheme, COLORS, SPACING, RADIUS, Icon as Lucide } from "@edge/ui";
import { ApplicationData } from "../../../../types/application";
import { SectionHeader, InfoRow } from "./reviewComponents";
import { reviewStyles as styles } from "./reviewStyles";

interface PrimaryApplicantDetailsSectionProps {
  app: ApplicationData;
  isCompanyApplication: boolean;
  isEditingSection: boolean;
  emailDraft: string;
  setEmailDraft: (val: string) => void;
  nameDraft?: string;
  setNameDraft?: (val: string) => void;
  contactDraft?: string;
  setContactDraft?: (val: string) => void;
  addressDraft?: string;
  setAddressDraft?: (val: string) => void;
  editAction: React.ReactNode;
  onInspectApplicant?: (index: number) => void;
}

export function PrimaryApplicantDetailsSection({
  app,
  isCompanyApplication,
  isEditingSection,
  emailDraft,
  setEmailDraft,
  nameDraft,
  setNameDraft,
  contactDraft,
  setContactDraft,
  addressDraft,
  setAddressDraft,
  editAction,
  onInspectApplicant,
}: PrimaryApplicantDetailsSectionProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={{ paddingHorizontal: SPACING[16], marginTop: SPACING[12] }}>
      <SectionHeader
        title="PRIMARY APPLICANT DETAILS"
        rightAction={!isCompanyApplication ? editAction : undefined}
      />
      <View
        style={[
          styles.infoBlock,
          { backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral.white },
        ]}
      >
        <InfoRow
          label="Applicant Name:"
          value={app.applicant || "—"}
          isEditing={!isCompanyApplication ? isEditingSection : false}
          editValue={nameDraft ?? app.applicant ?? ""}
          onEditChange={setNameDraft}
        />
        <InfoRow label="Applicant Type:" value={app.applicantType || "Individual"} />
        <InfoRow
          label="Email Address:"
          value={app.contactDetails?.email || app.filingUser?.email || "—"}
          isEditing={!isCompanyApplication ? isEditingSection : false}
          editValue={emailDraft}
          onEditChange={setEmailDraft}
        />
        <InfoRow
          label="Contact Number:"
          value={app.contactDetails?.contactNumber || app.companyDetails?.contactNumber || "—"}
          isEditing={!isCompanyApplication ? isEditingSection : false}
          editValue={contactDraft ?? app.contactDetails?.contactNumber ?? ""}
          onEditChange={setContactDraft}
        />
        <InfoRow
          label="Address:"
          value={app.address?.address || app.address?.streetAddress || "—"}
          isEditing={!isCompanyApplication ? isEditingSection : false}
          editValue={addressDraft ?? app.address?.address ?? app.address?.streetAddress ?? ""}
          onEditChange={setAddressDraft}
        />
        <Pressable
          style={{
            marginTop: SPACING[8],
            padding: SPACING[12],
            borderRadius: RADIUS.card,
            backgroundColor: isDark ? colors.brand[900] : colors.brand[50],
            borderWidth: 1,
            borderColor: isDark ? colors.brand[700] : colors.brand[200],
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
          onPress={() => onInspectApplicant?.(0)}
        >
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: isDark ? colors.brand[300] : colors.brand[900],
              }}
            >
              Application Form Submissions & Requirements
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: isDark ? colors.brand[400] : colors.brand[700],
                marginTop: 2,
              }}
            >
              Switch to the Applicant Records tab to view full form fields, specs, and uploaded documents.
            </Text>
          </View>
          <Lucide
            name="arrow-right"
            size={16}
            color={isDark ? colors.brand[300] : colors.brand[700]}
          />
        </Pressable>
      </View>
    </View>
  );
}
