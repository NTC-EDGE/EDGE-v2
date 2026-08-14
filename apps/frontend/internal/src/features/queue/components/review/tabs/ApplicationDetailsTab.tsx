import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
} from "react-native";
import {
  COLORS,
  RADIUS,
  SPACING,
  TYPOGRAPHY,
  useTheme,
} from "@edge/ui";
import {
  ApplicantItem,
  ApplicationData,
} from "../../../../../types/application";
import { AdminUpdateApplicationPayload } from "@edge/api";
import { SectionHeader } from "../common/SectionHeader";
import { InfoRow } from "../common/InfoRow";
import { getStatusStyle } from "../common/reviewUtils";

export interface ApplicationDetailsTabProps {
  app: ApplicationData;
  isEditable: boolean;
  updateApplication: (
    id: string,
    patch: Partial<ApplicationData> | AdminUpdateApplicationPayload
  ) => void;
  selectedApplicantIndex?: number;
  onSelectApplicantIndex?: (index: number) => void;
  onInspectApplicant?: (index: number) => void;
}

export function ApplicationDetailsTab({
  app,
  isEditable,
  updateApplication,
  selectedApplicantIndex,
  onSelectApplicantIndex,
  onInspectApplicant,
}: ApplicationDetailsTabProps) {
  const { colors, isDark } = useTheme();
  const [isEditingSection, setIsEditingSection] = useState(false);
  const [isEditingRoster, setIsEditingRoster] = useState(false);

  const [refDraft, setRefDraft] = useState(app.referenceNumber);
  const [applicationDraft, setApplicationDraft] = useState(app.applicationNumber);
  const [noteDraft, setNoteDraft] = useState(app.note);
  const [applicantDraft, setApplicantDraft] = useState(app.applicant);
  const [accountTypeDraft, setAccountTypeDraft] = useState(app.applicantType);
  const [emailDraft, setEmailDraft] = useState(app.contactDetails?.email ?? "");
  const [barangayDraft, setBarangayDraft] = useState(app.address?.barangay ?? "");
  const [provinceDraft, setProvinceDraft] = useState(app.address?.province ?? "");
  const [cityDraft, setCityDraft] = useState(app.address?.city ?? "");
  const [zipCodeDraft, setZipCodeDraft] = useState(app.address?.zipCode ?? "");

  const [compNameDraft, setCompNameDraft] = useState(
    app.companyDetails?.name ?? app.applicant
  );
  const [compRegNoDraft, setCompRegNoDraft] = useState(
    app.companyDetails?.registrationNumber ?? ""
  );
  const [compAddrDraft, setCompAddrDraft] = useState(
    app.companyDetails?.address ?? ""
  );
  const [compContactDraft, setCompContactDraft] = useState(
    app.companyDetails?.contactNumber ?? app.contactDetails?.contactNumber ?? ""
  );
  const [compEmailDraft, setCompEmailDraft] = useState(
    app.companyDetails?.email ?? app.contactDetails?.email ?? ""
  );

  const [lnDraft, setLnDraft] = useState(app.basicInfo?.lastName ?? "");
  const [fnDraft, setFnDraft] = useState(app.basicInfo?.firstName ?? "");
  const [mnDraft, setMnDraft] = useState(app.basicInfo?.middleName ?? "");
  const [extDraft, setExtDraft] = useState(app.basicInfo?.extensionName ?? "");
  const [pobDraft, setPobDraft] = useState(app.basicInfo?.placeOfBirth ?? "");
  const [dobDraft, setDobDraft] = useState(app.basicInfo?.dob ?? "");
  const [sexDraft, setSexDraft] = useState(app.basicInfo?.sex ?? "");
  const [weightDraft, setWeightDraft] = useState(
    String(app.basicInfo?.weight ?? "")
  );
  const [heightDraft, setHeightDraft] = useState(
    String(app.basicInfo?.height ?? "")
  );
  const [natDraft, setNatDraft] = useState(app.basicInfo?.nationality ?? "");
  const [empStatusDraft, setEmpStatusDraft] = useState(
    app.basicInfo?.employmentStatus ?? ""
  );

  const [editingNote, setEditingNote] = useState(false);

  const [localApplicants, setLocalApplicants] = useState<ApplicantItem[]>(
    app.applicantsList ?? []
  );

  useEffect(() => {
    if (app.applicantsList) {
      setLocalApplicants(app.applicantsList);
    }
  }, [app.applicantsList]);

  const handleSetStatus = (
    idx: number,
    newStatus: "Complete" | "Incomplete" | "ForEndorsement"
  ) => {
    const updated = [...localApplicants];
    const item = updated[idx];
    if (item !== undefined) {
      updated[idx] = { ...item, status: newStatus };
      setLocalApplicants(updated);
      if (!isEditingRoster) {
        updateApplication(app.id, { applicantsList: updated });
      }
    }
  };

  const handleUpdateRosterRow = (
    idx: number,
    patch: Partial<ApplicantItem>
  ) => {
    const updated = [...localApplicants];
    const currentItem = updated[idx];
    if (currentItem === undefined) return;

    let newApplicant = { ...currentItem, ...patch };

    // Synchronize basicInfo.firstName and basicInfo.lastName when full name changes for Individuals
    if (
      patch.name !== undefined &&
      newApplicant.applicantType === "Individual"
    ) {
      const parts = patch.name.trim().split(/\s+/);
      const firstName = parts[0] || "";
      const lastName = parts.length > 1 ? parts.slice(1).join(" ") : "";
      newApplicant.basicInfo = {
        ...(newApplicant.basicInfo ?? {
          lastName: "",
          firstName: "",
          middleName: "",
          extensionName: "",
          dob: "",
          placeOfBirth: "",
          sex: "",
          weight: 0,
          height: 0,
          nationality: "",
          employmentStatus: "",
          occupation: "",
        }),
        firstName,
        lastName,
      };
    }

    updated[idx] = newApplicant;
    setLocalApplicants(updated);
    if (!isEditingRoster) {
      updateApplication(app.id, { applicantsList: updated });
    }
  };

  const handleSaveAllBasicInfo = () => {
    const numWeight = parseFloat(weightDraft);
    const numHeight = parseFloat(heightDraft);
    updateApplication(app.id, {
      referenceNumber: refDraft,
      applicationNumber: applicationDraft,
      applicant: applicantDraft,
      applicantType: accountTypeDraft,
      contactDetails: { ...app.contactDetails, email: emailDraft },
      address: {
        ...app.address,
        barangay: barangayDraft,
        province: provinceDraft,
        city: cityDraft,
        zipCode: zipCodeDraft,
      },
      companyDetails:
        app.companyDetails !== undefined || app.applicantType === "Company"
          ? {
              ...(app.companyDetails ?? {
                name: "",
                registrationNumber: "",
                address: "",
                contactNumber: "",
                email: "",
              }),
              name: compNameDraft,
              registrationNumber: compRegNoDraft,
              address: compAddrDraft,
              contactNumber: compContactDraft,
              email: compEmailDraft,
            }
          : undefined,
      basicInfo: {
        ...app.basicInfo,
        lastName: lnDraft,
        firstName: fnDraft,
        middleName: mnDraft,
        extensionName: extDraft,
        placeOfBirth: pobDraft,
        dob: dobDraft,
        sex: sexDraft,
        weight: isNaN(numWeight) ? app.basicInfo.weight : numWeight,
        height: isNaN(numHeight) ? app.basicInfo.height : numHeight,
        nationality: natDraft,
        employmentStatus: empStatusDraft,
      },
    });
    setIsEditingSection(false);
  };

  const handleSaveAllRoster = () => {
    const synchronized = localApplicants.map((item) => {
      if (item.applicantType === "Individual" && item.name) {
        const parts = item.name.trim().split(/\s+/);
        const firstName = parts[0] || "";
        const lastName = parts.length > 1 ? parts.slice(1).join(" ") : "";
        return {
          ...item,
          basicInfo: {
            ...(item.basicInfo ?? {
              lastName: "",
              firstName: "",
              middleName: "",
              extensionName: "",
              dob: "",
              placeOfBirth: "",
              sex: "",
              weight: 0,
              height: 0,
              nationality: "",
              employmentStatus: "",
              occupation: "",
            }),
            firstName,
            lastName,
          },
        };
      }
      return item;
    });
    setLocalApplicants(synchronized);
    updateApplication(app.id, {
      applicantsList: synchronized.map((item) => ({
        id: item.id,
        status: item.status ?? "Incomplete",
        applicantType: item.applicantType ?? "Individual",
        evaluationRemarks: item.evaluationRemarks ?? "",
      })),
    });
    setIsEditingRoster(false);
  };

  const statusStyle = getStatusStyle(app.status);

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Top Section Header with Global Section Edit Mode Toggle */}
      <View
        style={[
          styles.statusBlock,
          {
            borderBottomColor: isDark
              ? colors.neutral[800]
              : colors.neutral[100],
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          },
        ]}
      >
        <View
          style={[styles.statusRow, { gap: SPACING[12], alignItems: "center" }]}
        >
          <View
            style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}
          >
            <Text style={[styles.statusPillText, { color: statusStyle.text }]}>
              {app.status.toLowerCase() === "submitted"
                ? "FOR EVALUATION"
                : app.status.toUpperCase()}
            </Text>
          </View>
          <Text
            style={[
              styles.statusActor,
              { color: isDark ? colors.neutral[500] : colors.neutral[400] },
            ]}
          >
            by ADMIN EDGE
          </Text>
        </View>

        {isEditable && (
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            {isEditingSection ? (
              <>
                <Pressable
                  style={[
                    styles.inspectBtn,
                    {
                      backgroundColor: isDark
                        ? colors.neutral[700]
                        : colors.neutral[200],
                      paddingHorizontal: 10,
                    },
                  ]}
                  onPress={() => setIsEditingSection(false)}
                >
                  <Text
                    style={[
                      styles.inspectBtnText,
                      {
                        color: isDark
                          ? colors.neutral[200]
                          : colors.neutral[800],
                      },
                    ]}
                  >
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.inspectBtn,
                    {
                      backgroundColor: isDark
                        ? colors.brand[500]
                        : colors.brand[700],
                      paddingHorizontal: 12,
                    },
                  ]}
                  onPress={handleSaveAllBasicInfo}
                >
                  <Text
                    style={[
                      styles.inspectBtnText,
                      { color: COLORS.neutral.white, fontWeight: "700" },
                    ]}
                  >
                    Save
                  </Text>
                </Pressable>
              </>
            ) : (
              <Pressable
                style={[
                  styles.inspectBtn,
                  {
                    backgroundColor: isDark
                      ? colors.neutral[800]
                      : colors.neutral[100],
                    borderColor: isDark
                      ? colors.brand[500]
                      : colors.brand[600],
                    borderWidth: 1,
                    paddingHorizontal: 12,
                  },
                ]}
                onPress={() => setIsEditingSection(true)}
              >
                <Text
                  style={[
                    styles.inspectBtnText,
                    {
                      color: isDark ? colors.brand[400] : colors.brand[800],
                      fontWeight: "600",
                    },
                  ]}
                >
                  Edit
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </View>

      <View style={styles.infoBlock}>
        <Text
          style={[
            styles.fieldGroupLabel,
            { color: isDark ? colors.neutral[500] : colors.neutral[400] },
          ]}
        >
          REFERENCE NUMBER
        </Text>
        <InfoRow
          label="Reference Number:"
          value={app.referenceNumber}
          isEditing={isEditingSection}
          editValue={refDraft}
          onEditChange={setRefDraft}
        />

        <Text
          style={[
            styles.fieldGroupLabel,
            {
              marginTop: SPACING[12],
              color: isDark ? colors.neutral[500] : colors.neutral[400],
            },
          ]}
        >
          DOCUMENT NUMBER
        </Text>
        <InfoRow
          label="Application Number:"
          value={app.applicationNumber}
          isEditing={isEditingSection}
          editValue={applicationDraft}
          onEditChange={setApplicationDraft}
        />
      </View>

      {/* FILING ENTITY & SUBMITTER DETAILS */}
      <SectionHeader title="FILING ENTITY & SUBMITTER DETAILS" />
      <View style={styles.infoBlock}>
        <InfoRow label="Submitted By:" value={app.filingUser?.name ?? "—"} />
        <InfoRow
          label="User Email:"
          value={app.filingUser?.email ?? "—"}
          isEditing={isEditingSection}
          editValue={emailDraft}
          onEditChange={setEmailDraft}
        />
        <View
          style={[
            styles.accountTypeRow,
            {
              borderBottomColor: isDark
                ? colors.neutral[800]
                : colors.neutral[100],
            },
          ]}
        >
          <Text
            style={[
              styles.accountTypeLabel,
              { color: isDark ? colors.neutral[400] : colors.neutral[500] },
            ]}
          >
            User Account Type:
          </Text>
          {isEditingSection ? (
            <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
              <Pressable
                style={{
                  backgroundColor:
                    accountTypeDraft === "Individual"
                      ? isDark
                        ? colors.brand[500]
                        : colors.brand[700]
                      : isDark
                      ? colors.neutral[800]
                      : colors.neutral[100],
                  borderColor: isDark ? colors.brand[500] : colors.brand[600],
                  borderWidth: 1,
                  paddingHorizontal: 16,
                  paddingVertical: 6,
                  borderRadius: RADIUS.button,
                }}
                onPress={() => setAccountTypeDraft("Individual")}
              >
                <Text
                  style={{
                    color:
                      accountTypeDraft === "Individual"
                        ? COLORS.neutral.white
                        : isDark
                        ? colors.neutral[300]
                        : colors.neutral[700],
                    fontWeight: "600",
                    fontSize: TYPOGRAPHY.sizes.body,
                  }}
                >
                  Individual
                </Text>
              </Pressable>
              <Pressable
                style={{
                  backgroundColor:
                    accountTypeDraft === "Company"
                      ? isDark
                        ? colors.brand[500]
                        : colors.brand[700]
                      : isDark
                      ? colors.neutral[800]
                      : colors.neutral[100],
                  borderColor: isDark ? colors.brand[500] : colors.brand[600],
                  borderWidth: 1,
                  paddingHorizontal: 16,
                  paddingVertical: 6,
                  borderRadius: RADIUS.button,
                }}
                onPress={() => setAccountTypeDraft("Company")}
              >
                <Text
                  style={{
                    color:
                      accountTypeDraft === "Company"
                        ? COLORS.neutral.white
                        : isDark
                        ? colors.neutral[300]
                        : colors.neutral[700],
                    fontWeight: "600",
                    fontSize: TYPOGRAPHY.sizes.body,
                  }}
                >
                  Company
                </Text>
              </Pressable>
            </View>
          ) : (
            <Text
              style={[
                styles.accountTypeValue,
                { color: isDark ? colors.neutral[100] : colors.neutral[900] },
              ]}
            >
              {app.filingUser?.accountType ?? "Individual"}
            </Text>
          )}
        </View>
        {(isEditingSection
          ? accountTypeDraft === "Company"
          : app.filingUser?.accountType === "Company") && (
          <>
            <InfoRow
              label="Filing Company Name:"
              value={app.filingUser?.company?.name ?? "—"}
              isEditing={isEditingSection}
              editValue={compNameDraft}
              onEditChange={setCompNameDraft}
            />
            <InfoRow
              label="Filing Company Reg No:"
              value={app.filingUser?.company?.registrationNumber ?? "—"}
              isEditing={isEditingSection}
              editValue={compRegNoDraft}
              onEditChange={setCompRegNoDraft}
            />
            <InfoRow
              label="Filing Company Address:"
              value={app.filingUser?.company?.address ?? "—"}
              isEditing={isEditingSection}
              editValue={compAddrDraft}
              onEditChange={setCompAddrDraft}
            />
          </>
        )}
      </View>

      {/* BULK BATCH SUMMARY TABLE */}
      {app.applicationType === "BULK" && localApplicants.length > 0 && (
        <>
          <SectionHeader
            title={`APPLICANTS BATCH SUMMARY (${localApplicants.length} APPLICANTS)`}
            rightAction={
              isEditable ? (
                <View
                  style={{ flexDirection: "row", gap: 6, alignItems: "center" }}
                >
                  {isEditingRoster ? (
                    <>
                      <Pressable
                        style={[
                          styles.inspectBtn,
                          {
                            backgroundColor: isDark
                              ? colors.neutral[700]
                              : colors.neutral[300],
                            paddingHorizontal: 10,
                          },
                        ]}
                        onPress={() => setIsEditingRoster(false)}
                      >
                        <Text
                          style={[
                            styles.inspectBtnText,
                            {
                              color: isDark
                                ? colors.neutral[200]
                                : colors.neutral[800],
                            },
                          ]}
                        >
                          Cancel
                        </Text>
                      </Pressable>
                      <Pressable
                        style={[
                          styles.inspectBtn,
                          {
                            backgroundColor: isDark
                              ? colors.brand[500]
                              : colors.brand[700],
                            paddingHorizontal: 12,
                          },
                        ]}
                        onPress={handleSaveAllRoster}
                      >
                        <Text
                          style={[
                            styles.inspectBtnText,
                            { color: COLORS.neutral.white, fontWeight: "700" },
                          ]}
                        >
                          Save
                        </Text>
                      </Pressable>
                    </>
                  ) : (
                    <Pressable
                      style={[
                        styles.inspectBtn,
                        {
                          backgroundColor: isDark
                            ? colors.brand[600]
                            : colors.brand[700],
                          paddingHorizontal: 10,
                        },
                      ]}
                      onPress={() => setIsEditingRoster(true)}
                    >
                      <Text
                        style={[
                          styles.inspectBtnText,
                          { color: COLORS.neutral.white },
                        ]}
                      >
                        Edit
                      </Text>
                    </Pressable>
                  )}
                </View>
              ) : null
            }
          />
          <View
            style={[
              styles.denseTableContainer,
              {
                backgroundColor: isDark
                  ? colors.neutral[900]
                  : COLORS.neutral.white,
                borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
              },
            ]}
          >
            {/* Table Header */}
            <View
              style={[
                styles.denseTableHeader,
                {
                  backgroundColor: isDark
                    ? colors.neutral[800]
                    : colors.neutral[100],
                  borderBottomColor: isDark
                    ? colors.neutral[700]
                    : colors.neutral[200],
                },
              ]}
            >
              <Text
                style={[
                  styles.denseHeaderCell,
                  {
                    width: 35,
                    textAlign: "center",
                    color: isDark ? colors.neutral[300] : colors.neutral[700],
                  },
                ]}
              >
                #
              </Text>
              <Text
                style={[
                  styles.denseHeaderCell,
                  {
                    flex: 2,
                    color: isDark ? colors.neutral[300] : colors.neutral[700],
                  },
                ]}
              >
                APPLICANT NAME
              </Text>
              <Text
                style={[
                  styles.denseHeaderCell,
                  {
                    flex: 1,
                    color: isDark ? colors.neutral[300] : colors.neutral[700],
                  },
                ]}
              >
                TYPE
              </Text>
              <Text
                style={[
                  styles.denseHeaderCell,
                  {
                    flex: 1.2,
                    color: isDark ? colors.neutral[300] : colors.neutral[700],
                  },
                ]}
              >
                STATUS VERDICT
              </Text>
              <Text
                style={[
                  styles.denseHeaderCell,
                  {
                    flex: 2,
                    color: isDark ? colors.neutral[300] : colors.neutral[700],
                  },
                ]}
              >
                EVALUATION REMARKS
              </Text>
              <Text
                style={[
                  styles.denseHeaderCell,
                  {
                    width: 100,
                    textAlign: "right",
                    color: isDark ? colors.neutral[300] : colors.neutral[700],
                  },
                ]}
              >
                ACTION
              </Text>
            </View>

            {/* Table Body Rows */}
            {localApplicants.map((item, idx) => {
              const isRowEditing = isEditingRoster;
              return (
                <View
                  key={item.id || idx}
                  style={[
                    styles.denseTableRow,
                    {
                      borderBottomColor: isDark
                        ? colors.neutral[800]
                        : colors.neutral[200],
                    },
                    isRowEditing && {
                      backgroundColor: isDark
                        ? colors.neutral[800]
                        : colors.brand[50],
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.denseRowIndex,
                      {
                        width: 35,
                        textAlign: "center",
                        color: isDark
                          ? colors.neutral[400]
                          : colors.neutral[500],
                      },
                    ]}
                  >
                    #{idx + 1}
                  </Text>

                  {isRowEditing ? (
                    <>
                      <View style={{ flex: 2 }}>
                        <Text
                          style={[
                            styles.denseRowName,
                            {
                              color: isDark
                                ? colors.neutral[100]
                                : colors.neutral[900],
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        {item.email ? (
                          <Text
                            style={[
                              styles.denseRowSub,
                              {
                                color: isDark
                                  ? colors.neutral[400]
                                  : colors.neutral[500],
                              },
                            ]}
                            numberOfLines={1}
                          >
                            {item.email}
                          </Text>
                        ) : null}
                      </View>
                      <View style={{ flex: 1, paddingRight: 6 }}>
                        <Pressable
                          style={[
                            styles.miniStatusBadge,
                            {
                              backgroundColor: isDark
                                ? colors.neutral[700]
                                : colors.neutral[200],
                              paddingVertical: 6,
                              alignItems: "center",
                            },
                          ]}
                          onPress={() =>
                            handleUpdateRosterRow(idx, {
                              applicantType:
                                item.applicantType === "Individual"
                                  ? "Company"
                                  : "Individual",
                            })
                          }
                        >
                          <Text
                            style={[
                              styles.miniStatusText,
                              {
                                color: isDark
                                  ? colors.neutral[100]
                                  : colors.neutral[900],
                              },
                            ]}
                          >
                            {item.applicantType || "Individual"}
                          </Text>
                        </Pressable>
                      </View>
                      <View style={{ flex: 1.2 }}>
                        <View style={{ flexDirection: "row", gap: 4 }}>
                          <Pressable
                            style={[
                              styles.miniStatusBadge,
                              {
                                backgroundColor:
                                  item.status === "Complete"
                                    ? "#DCFCE7"
                                    : isDark
                                    ? colors.neutral[700]
                                    : colors.neutral[200],
                                paddingHorizontal: 6,
                              },
                            ]}
                            onPress={() => handleSetStatus(idx, "Complete")}
                          >
                            <Text
                              style={[
                                styles.miniStatusText,
                                {
                                  color:
                                    item.status === "Complete"
                                      ? "#166534"
                                      : colors.neutral[500],
                                },
                              ]}
                            >
                              C
                            </Text>
                          </Pressable>
                          <Pressable
                            style={[
                              styles.miniStatusBadge,
                              {
                                backgroundColor:
                                  item.status === "Incomplete"
                                    ? "#FEE2E2"
                                    : isDark
                                    ? colors.neutral[700]
                                    : colors.neutral[200],
                                paddingHorizontal: 6,
                              },
                            ]}
                            onPress={() => handleSetStatus(idx, "Incomplete")}
                          >
                            <Text
                              style={[
                                styles.miniStatusText,
                                {
                                  color:
                                    item.status === "Incomplete"
                                      ? "#991B1B"
                                      : colors.neutral[500],
                                },
                              ]}
                            >
                              INC
                            </Text>
                          </Pressable>
                          <Pressable
                            style={[
                              styles.miniStatusBadge,
                              {
                                backgroundColor:
                                  item.status === "ForEndorsement"
                                    ? "#F3E8FF"
                                    : isDark
                                    ? colors.neutral[700]
                                    : colors.neutral[200],
                                paddingHorizontal: 6,
                              },
                            ]}
                            onPress={() =>
                              handleSetStatus(idx, "ForEndorsement")
                            }
                          >
                            <Text
                              style={[
                                styles.miniStatusText,
                                {
                                  color:
                                    item.status === "ForEndorsement"
                                      ? "#6B21A8"
                                      : colors.neutral[500],
                                },
                              ]}
                            >
                              END
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                      <View style={{ flex: 2, paddingRight: 6 }}>
                        <TextInput
                          style={[
                            styles.editInput,
                            {
                              color: isDark
                                ? colors.neutral[100]
                                : colors.neutral[900],
                              backgroundColor: isDark
                                ? colors.neutral[900]
                                : COLORS.neutral.white,
                            },
                          ]}
                          value={item.evaluationRemarks || ""}
                          onChangeText={(val) =>
                            handleUpdateRosterRow(idx, {
                              evaluationRemarks: val,
                            })
                          }
                          placeholder="Remarks..."
                          placeholderTextColor={COLORS.neutral[400]}
                        />
                      </View>
                      <View
                        style={{
                          width: 100,
                          flexDirection: "row",
                          justifyContent: "flex-end",
                          alignItems: "center",
                        }}
                      >
                        <Pressable
                          style={[
                            styles.inspectBtn,
                            {
                              backgroundColor: isDark
                                ? colors.brand[600]
                                : colors.brand[700],
                            },
                          ]}
                          onPress={() => onInspectApplicant?.(idx)}
                        >
                          <Text
                            style={[
                              styles.inspectBtnText,
                              { color: COLORS.neutral.white },
                            ]}
                          >
                            Inspect ►
                          </Text>
                        </Pressable>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={{ flex: 2 }}>
                        <Text
                          style={[
                            styles.denseRowName,
                            {
                              color: isDark
                                ? colors.neutral[100]
                                : colors.neutral[900],
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        {item.email ? (
                          <Text
                            style={[
                              styles.denseRowSub,
                              {
                                color: isDark
                                  ? colors.neutral[400]
                                  : colors.neutral[500],
                              },
                            ]}
                            numberOfLines={1}
                          >
                            {item.email}
                          </Text>
                        ) : null}
                      </View>
                      <Text
                        style={[
                          styles.denseRowType,
                          {
                            flex: 1,
                            color: isDark
                              ? colors.neutral[300]
                              : colors.neutral[700],
                          },
                        ]}
                      >
                        {item.applicantType}
                      </Text>
                      <View style={{ flex: 1.2 }}>
                        {item.status === "Incomplete" ? (
                          <View
                            style={[
                              styles.miniStatusBadge,
                              {
                                backgroundColor: "#FEE2E2",
                                alignSelf: "flex-start",
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.miniStatusText,
                                { color: "#991B1B" },
                              ]}
                            >
                              INCOMPLETE
                            </Text>
                          </View>
                        ) : item.status === "ForEndorsement" ? (
                          <View
                            style={[
                              styles.miniStatusBadge,
                              {
                                backgroundColor: "#F3E8FF",
                                alignSelf: "flex-start",
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.miniStatusText,
                                { color: "#6B21A8" },
                              ]}
                            >
                              FOR ENDORSEMENT
                            </Text>
                          </View>
                        ) : (
                          <View
                            style={[
                              styles.miniStatusBadge,
                              {
                                backgroundColor: "#DCFCE7",
                                alignSelf: "flex-start",
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.miniStatusText,
                                { color: "#166534" },
                              ]}
                            >
                              COMPLETE
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.denseRowRemarks,
                          {
                            flex: 2,
                            color: isDark
                              ? colors.neutral[400]
                              : colors.neutral[600],
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {item.evaluationRemarks || "—"}
                      </Text>
                      <View
                        style={{
                          width: 100,
                          flexDirection: "row",
                          justifyContent: "flex-end",
                          alignItems: "center",
                        }}
                      >
                        <Pressable
                          style={[
                            styles.inspectBtn,
                            {
                              backgroundColor: isDark
                                ? colors.brand[600]
                                : colors.brand[700],
                            },
                          ]}
                          onPress={() => onInspectApplicant?.(idx)}
                        >
                          <Text
                            style={[
                              styles.inspectBtnText,
                              { color: COLORS.neutral.white },
                            ]}
                          >
                            Inspect ►
                          </Text>
                        </Pressable>
                      </View>
                    </>
                  )}
                </View>
              );
            })}
          </View>
        </>
      )}

      {/* Application History section */}
      {app.history && app.history.length > 0 && (
        <>
          <SectionHeader title="APPLICATION HISTORY" />
          <View style={styles.infoBlock}>
            <View style={styles.historyList}>
              {app.history.map((entry, idx) => (
                <View key={entry.id} style={styles.historyItem}>
                  <View style={styles.historyLeft}>
                    <View
                      style={[
                        styles.historyCircle,
                        idx === 0 && styles.historyCircleActive,
                      ]}
                    />
                    {idx !== (app.history?.length ?? 0) - 1 && (
                      <View
                        style={[
                          styles.historyLine,
                          {
                            backgroundColor: isDark
                              ? colors.neutral[700]
                              : colors.neutral[200],
                          },
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.historyRight}>
                    <Text
                      style={[
                        styles.historyAction,
                        {
                          color: isDark
                            ? colors.neutral[100]
                            : colors.neutral[900],
                        },
                      ]}
                    >
                      {entry.action}
                    </Text>
                    <Text
                      style={[
                        styles.historyStaff,
                        {
                          color: isDark
                            ? colors.neutral[500]
                            : colors.neutral[400],
                        },
                      ]}
                    >
                      by {entry.staff}
                    </Text>
                    <Text
                      style={[
                        styles.historyDate,
                        {
                          color: isDark
                            ? colors.neutral[500]
                            : colors.neutral[400],
                        },
                      ]}
                    >
                      {entry.timestamp}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </>
      )}

      {/* NOTE */}
      <View
        style={[
          styles.noteBlock,
          {
            borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
          },
        ]}
      >
        <View style={styles.noteHeader}>
          <Text
            style={[
              styles.fieldGroupLabel,
              { color: isDark ? colors.neutral[500] : colors.neutral[400] },
            ]}
          >
            NOTE
          </Text>
          {isEditable && !editingNote && (
            <Pressable
              onPress={() => {
                setNoteDraft(app.note);
                setEditingNote(true);
              }}
            >
              <Text
                style={[
                  styles.editLinkBlue,
                  { color: isDark ? colors.brand[500] : colors.brand[700] },
                ]}
              >
                EDIT
              </Text>
            </Pressable>
          )}
        </View>
        {editingNote ? (
          <View style={{ gap: SPACING[8] }}>
            <TextInput
              style={[
                styles.noteInput,
                {
                  color: isDark ? colors.neutral[100] : colors.neutral[900],
                  backgroundColor: isDark
                    ? colors.neutral[900]
                    : colors.neutral[50],
                  borderColor: isDark ? colors.brand[500] : colors.brand[500],
                },
              ]}
              multiline
              value={noteDraft}
              onChangeText={setNoteDraft}
              textAlignVertical="top"
              autoFocus
            />
            <Pressable
              style={[
                styles.saveNoteBtn,
                {
                  backgroundColor: isDark
                    ? colors.brand[500]
                    : colors.brand[700],
                },
              ]}
              onPress={() => {
                setEditingNote(false);
                updateApplication(app.id, { note: noteDraft });
              }}
            >
              <Text
                style={[
                  styles.saveNoteBtnText,
                  {
                    color: isDark ? colors.neutral[800] : COLORS.neutral.white,
                  },
                ]}
              >
                Save Note
              </Text>
            </Pressable>
          </View>
        ) : (
          <Text
            style={[
              styles.noteText,
              { color: isDark ? colors.neutral[300] : colors.neutral[600] },
            ]}
          >
            {app.note}
          </Text>
        )}
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    padding: SPACING[16],
  },
  statusBlock: {
    paddingVertical: SPACING[12],
    borderBottomWidth: 1,
    marginBottom: SPACING[12],
  },
  statusRow: {
    flexDirection: "row",
  },
  statusPill: {
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[4],
    borderRadius: RADIUS.button,
  },
  statusPillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  statusActor: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
  },
  fieldGroupLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
    marginBottom: SPACING[4],
  },
  infoBlock: {
    marginBottom: SPACING[16],
  },
  accountTypeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: SPACING[8],
    borderBottomWidth: 1,
  },
  accountTypeLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    width: 160,
    flexShrink: 0,
  },
  accountTypeValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.medium,
    flex: 1,
  },
  denseTableContainer: {
    borderWidth: 1,
    borderRadius: RADIUS.card,
    overflow: "hidden",
    marginBottom: SPACING[16],
  },
  denseTableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    borderBottomWidth: 1,
  },
  denseHeaderCell: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  denseTableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    borderBottomWidth: 1,
  },
  denseRowIndex: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
  },
  denseRowName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  denseRowSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
  },
  denseRowType: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
  },
  denseRowRemarks: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
  },
  miniStatusBadge: {
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[2],
    borderRadius: RADIUS.button,
  },
  miniStatusText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  inspectBtn: {
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[4],
    borderRadius: RADIUS.button,
  },
  inspectBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  editInput: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    borderWidth: 1,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[4],
  },
  historyList: {
    paddingVertical: SPACING[8],
  },
  historyItem: {
    flexDirection: "row",
    gap: SPACING[12],
    marginBottom: SPACING[12],
  },
  historyLeft: {
    alignItems: "center",
    width: 16,
  },
  historyCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.neutral[400],
  },
  historyCircleActive: {
    backgroundColor: COLORS.brand[700],
  },
  historyLine: {
    width: 2,
    flex: 1,
    marginTop: SPACING[4],
  },
  historyRight: {
    flex: 1,
  },
  historyAction: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  historyStaff: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
  },
  historyDate: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
  },
  noteBlock: {
    borderWidth: 1,
    borderRadius: RADIUS.card,
    padding: SPACING[12],
    marginBottom: SPACING[16],
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING[8],
  },
  editLinkBlue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: RADIUS.input,
    padding: SPACING[8],
    height: 80,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
  },
  saveNoteBtn: {
    alignSelf: "flex-end",
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[6],
    borderRadius: RADIUS.button,
  },
  saveNoteBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  noteText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
  },
});
