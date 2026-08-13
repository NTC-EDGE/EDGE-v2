import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Image,
  Alert,
  Platform,
  Animated,
  useWindowDimensions,
} from "react-native";
import {
  useTheme,
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
  Icon as Lucide,
  SkeletonLoader,
} from "@edge/ui";
import {
  ApplicationData,
  ApplicationFormAttachment,
  ApplicantItem,
} from "../../../types/application";
import { useRole } from "../../shell/context/RoleContext";
import { usePermissions } from "../../shell/context/PermissionContext";
import { applicationService, useApplicationFormWithSubmission, useAdminApplicationDetails } from "@edge/api";
import { mapApplicationDtoToUI } from "../data/applicationMapper";
import { ApproveModal } from "../components/modals/ApproveModal";
import { DeclineModal } from "../components/modals/DeclineModal";
import { EndorseModal } from "../components/modals/EndorseModal";
import { CashierVerificationModal } from "../components/modals/CashierVerificationModal";
import { UserRole } from "../../shell/context/RoleContext";

type InnerTab = "details" | "applicant-record" | "soa";

const INNER_TABS: {
  key: InnerTab;
  label: string;
  icon: "file-text" | "user" | "credit-card";
}[] = [
    { key: "details", label: "Application Details", icon: "file-text" },
    { key: "applicant-record", label: "Applicant Records", icon: "user" },
    { key: "soa", label: "SOA & Payment", icon: "credit-card" },
  ];

function getStatusStyle(status: string): { bg: string; text: string } {
  const s = status.toLowerCase();
  if (s === "completed" || s === "approved")
    return { bg: COLORS.brand[800], text: COLORS.neutral.white };
  if (s === "for approval")
    return { bg: COLORS.semantic.warning, text: COLORS.neutral.white };
  if (s === "for verification")
    return { bg: COLORS.semantic.info, text: COLORS.neutral.white };
  if (s === "returned") return { bg: COLORS.semantic.error, text: COLORS.neutral.white };
  if (s === "declined") return { bg: COLORS.semantic.error, text: COLORS.neutral.white };
  if (s === "in process") return { bg: COLORS.brand.purple, text: COLORS.neutral.white };
  return { bg: COLORS.neutral[200], text: COLORS.neutral[700] };
}

function formatAmount(n: number): string {
  return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function amountToWords(n: number): string {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const intPart = Math.floor(n);
  if (intPart === 0) return "Zero Pesos Only";

  const toWords = (num: number): string => {
    if (num === 0) return "";
    if (num < 20) return (ones[num] ?? "") + " ";
    if (num < 100)
      return (tens[Math.floor(num / 10)] ?? "") + " " + toWords(num % 10);
    return (
      (ones[Math.floor(num / 100)] ?? "") + " Hundred " + toWords(num % 100)
    );
  };

  let result = "";
  if (intPart >= 1000) {
    result += toWords(Math.floor(intPart / 1000)) + "Thousand ";
  }
  result += toWords(intPart % 1000);
  return result.trim() + " Pesos Only";
}

interface SectionHeaderProps {
  title: string;
  rightAction?: React.ReactNode;
}
function SectionHeader({ title, rightAction }: SectionHeaderProps) {
  const { colors, isDark } = useTheme();
  return (
    <View style={[sectionStyles.header, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
      <Text style={[sectionStyles.title, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{title}</Text>
      {rightAction}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  header: {
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[8],
    marginVertical: SPACING[8],
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

interface InfoRowProps {
  label: string;
  value: string;
  onEdit?: () => void;
  isEditing?: boolean;
  editValue?: string;
  onEditChange?: (v: string) => void;
  onEditDone?: () => void;
  showRowSaveButton?: boolean;
}
function InfoRow({
  label,
  value,
  onEdit,
  isEditing,
  editValue,
  onEditChange,
  onEditDone,
  showRowSaveButton = false,
}: InfoRowProps) {
  const { colors, isDark } = useTheme();
  return (
    <View style={[infoStyles.row, { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100], }]}>
      <Text style={[infoStyles.label, { color: isDark ? colors.neutral[400] : colors.neutral[500], }]}>{label}</Text>
      {isEditing ? (
        <View style={infoStyles.editRow}>
          <TextInput
            style={[infoStyles.editInput, { color: isDark ? colors.neutral[100] : colors.neutral[900], backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50], borderColor: isDark ? colors.brand[500] : colors.brand[500], }]}
            value={editValue}
            onChangeText={onEditChange}
            onBlur={onEditDone}
          />
          {showRowSaveButton && onEditDone && (
            <Pressable style={[infoStyles.saveBtn, { backgroundColor: isDark ? colors.brand[500] : colors.brand[700], }]} onPress={onEditDone}>
              <Text style={[infoStyles.saveBtnText, { color: isDark ? colors.neutral[800] : COLORS.neutral.white, }]}>Save</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <View style={infoStyles.valueRow}>
          <Text style={[infoStyles.value, { color: isDark ? colors.neutral[100] : colors.neutral[900], }]}>{value}</Text>
          {onEdit !== undefined && (
            <Pressable onPress={onEdit}>
              <Text style={[infoStyles.editLink, { color: isDark ? colors.brand[500] : colors.brand[700], }]}>Edit</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}
const infoStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: SPACING[8],
    borderBottomWidth: 1,
  },
  label: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    width: 160,
    flexShrink: 0,
  },
  valueRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  value: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.medium,
    flex: 1,
  },
  editLink: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginLeft: SPACING[8],
  },
  editRow: {
    flex: 1,
    flexDirection: "row",
    gap: SPACING[8],
    alignItems: "center",
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
  saveBtn: {
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[4],
    borderRadius: RADIUS.button,
  },
  saveBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});

// ─── Tabs ────────────────────────────────────────────────────────────────────

function ApplicationDetailsTab({
  app,
  isEditable,
  updateApplication,
  selectedApplicantIndex,
  onSelectApplicantIndex,
  onInspectApplicant,
}: {
  app: ApplicationData;
  isEditable: boolean;
  updateApplication: (id: string, patch: Partial<ApplicationData>) => void;
  selectedApplicantIndex?: number;
  onSelectApplicantIndex?: (index: number) => void;
  onInspectApplicant?: (index: number) => void;
}) {
  const { colors, isDark } = useTheme();
  const [isEditingSection, setIsEditingSection] = useState(false);
  const [isEditingRoster, setIsEditingRoster] = useState(false);

  const [refDraft, setRefDraft] = useState(app.referenceNumber);
  const [applicationDraft, setApplicationDraft] = useState(app.applicationNumber);
  const [noteDraft, setNoteDraft] = useState(app.note);
  const [applicantDraft, setApplicantDraft] = useState(app.applicant);
  const [accountTypeDraft, setAccountTypeDraft] = useState(app.applicantType);
  const [emailDraft, setEmailDraft] = useState(app.contactDetails?.email ?? '');
  const [barangayDraft, setBarangayDraft] = useState(app.address?.barangay ?? '');
  const [provinceDraft, setProvinceDraft] = useState(app.address?.province ?? '');
  const [cityDraft, setCityDraft] = useState(app.address?.city ?? '');
  const [zipCodeDraft, setZipCodeDraft] = useState(app.address?.zipCode ?? '');

  const [compNameDraft, setCompNameDraft] = useState(app.companyDetails?.name ?? app.applicant);
  const [compRegNoDraft, setCompRegNoDraft] = useState(app.companyDetails?.registrationNumber ?? '');
  const [compAddrDraft, setCompAddrDraft] = useState(app.companyDetails?.address ?? '');
  const [compContactDraft, setCompContactDraft] = useState(app.companyDetails?.contactNumber ?? app.contactDetails?.contactNumber ?? '');
  const [compEmailDraft, setCompEmailDraft] = useState(app.companyDetails?.email ?? app.contactDetails?.email ?? '');

  const [lnDraft, setLnDraft] = useState(app.basicInfo?.lastName ?? '');
  const [fnDraft, setFnDraft] = useState(app.basicInfo?.firstName ?? '');
  const [mnDraft, setMnDraft] = useState(app.basicInfo?.middleName ?? '');
  const [extDraft, setExtDraft] = useState(app.basicInfo?.extensionName ?? '');
  const [pobDraft, setPobDraft] = useState(app.basicInfo?.placeOfBirth ?? '');
  const [dobDraft, setDobDraft] = useState(app.basicInfo?.dob ?? '');
  const [sexDraft, setSexDraft] = useState(app.basicInfo?.sex ?? '');
  const [weightDraft, setWeightDraft] = useState(String(app.basicInfo?.weight ?? ''));
  const [heightDraft, setHeightDraft] = useState(String(app.basicInfo?.height ?? ''));
  const [natDraft, setNatDraft] = useState(app.basicInfo?.nationality ?? '');
  const [empStatusDraft, setEmpStatusDraft] = useState(app.basicInfo?.employmentStatus ?? '');

  const [editingRef, setEditingRef] = useState(false);
  const [editingPermit, setEditingPermit] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState(false);
  const [editingAccountType, setEditingAccountType] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingBarangay, setEditingBarangay] = useState(false);
  const [editingProvince, setEditingProvince] = useState(false);
  const [editingCity, setEditingCity] = useState(false);
  const [editingZipCode, setEditingZipCode] = useState(false);
  const [editingCompName, setEditingCompName] = useState(false);
  const [editingCompRegNo, setEditingCompRegNo] = useState(false);
  const [editingCompAddr, setEditingCompAddr] = useState(false);
  const [editingCompContact, setEditingCompContact] = useState(false);
  const [editingCompEmail, setEditingCompEmail] = useState(false);
  const [editingLastName, setEditingLastName] = useState(false);
  const [editingFirstName, setEditingFirstName] = useState(false);
  const [editingMiddleName, setEditingMiddleName] = useState(false);
  const [editingExtName, setEditingExtName] = useState(false);
  const [editingPob, setEditingPob] = useState(false);
  const [editingDob, setEditingDob] = useState(false);
  const [editingSex, setEditingSex] = useState(false);
  const [editingWeight, setEditingWeight] = useState(false);
  const [editingHeight, setEditingHeight] = useState(false);
  const [editingNationality, setEditingNationality] = useState(false);
  const [editingEmpStatus, setEditingEmpStatus] = useState(false);

  const [localApplicants, setLocalApplicants] = useState<ApplicantItem[]>(app.applicantsList ?? []);

  useEffect(() => {
    if (app.applicantsList) {
      setLocalApplicants(app.applicantsList);
    }
  }, [app.applicantsList]);

  const handleSetStatus = (idx: number, newStatus: 'Complete' | 'Incomplete' | 'ForEndorsement') => {
    const updated = [...localApplicants];
    updated[idx] = { ...updated[idx], status: newStatus };
    setLocalApplicants(updated);
    if (!isEditingRoster) {
      updateApplication(app.id, { applicantsList: updated });
    }
  };

  const handleUpdateRosterRow = (idx: number, patch: Partial<ApplicantItem>) => {
    const updated = [...localApplicants];
    let newApplicant = { ...updated[idx], ...patch };

    // Synchronize basicInfo.firstName and basicInfo.lastName when full name changes for Individuals
    if (patch.name !== undefined && newApplicant.applicantType === 'Individual') {
      const parts = patch.name.trim().split(/\s+/);
      const firstName = parts[0] || '';
      const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
      newApplicant.basicInfo = {
        ...(newApplicant.basicInfo ?? {
          lastName: '',
          firstName: '',
          middleName: '',
          extensionName: '',
          dob: '',
          placeOfBirth: '',
          sex: '',
          weight: 0,
          height: 0,
          nationality: '',
          employmentStatus: '',
          occupation: '',
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
      applicantType: accountTypeDraft as 'Individual' | 'Company',
      contactDetails: { ...app.contactDetails, email: emailDraft },
      address: { ...app.address, barangay: barangayDraft, province: provinceDraft, city: cityDraft, zipCode: zipCodeDraft },
      companyDetails: (app.companyDetails !== undefined || app.applicantType === 'Company') ? {
        ...(app.companyDetails ?? { name: '', registrationNumber: '', address: '', contactNumber: '', email: '' }),
        name: compNameDraft,
        registrationNumber: compRegNoDraft,
        address: compAddrDraft,
        contactNumber: compContactDraft,
        email: compEmailDraft,
      } : undefined,
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
    // Synchronize basicInfo.firstName and basicInfo.lastName for all Individual applicants
    const synchronized = localApplicants.map((item) => {
      if (item.applicantType === 'Individual' && item.name) {
        const parts = item.name.trim().split(/\s+/);
        const firstName = parts[0] || '';
        const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
        return {
          ...item,
          basicInfo: {
            ...(item.basicInfo ?? {
              lastName: '',
              firstName: '',
              middleName: '',
              extensionName: '',
              dob: '',
              placeOfBirth: '',
              sex: '',
              weight: 0,
              height: 0,
              nationality: '',
              employmentStatus: '',
              occupation: '',
            }),
            firstName,
            lastName,
          },
        };
      }
      return item;
    });
    setLocalApplicants(synchronized);
    updateApplication(app.id, { applicantsList: synchronized });
    setIsEditingRoster(false);
  };

  const statusStyle = getStatusStyle(app.status);

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Top Section Header with Global Section Edit Mode Toggle */}
      <View style={[styles.statusBlock, { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100], flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
        <View style={[styles.statusRow, { gap: SPACING[12], alignItems: 'center' }]}>
          <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusPillText, { color: statusStyle.text }]}>
              {app.status.toLowerCase() === "submitted" ? "FOR EVALUATION" : app.status.toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.statusActor, { color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>by ADMIN EDGE</Text>
        </View>

        {isEditable && (
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            {isEditingSection ? (
              <>
                <Pressable
                  style={[styles.inspectBtn, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200], paddingHorizontal: 10 }]}
                  onPress={() => setIsEditingSection(false)}
                >
                  <Text style={[styles.inspectBtnText, { color: isDark ? colors.neutral[200] : colors.neutral[800] }]}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.inspectBtn, { backgroundColor: isDark ? colors.brand[500] : colors.brand[700], paddingHorizontal: 12 }]}
                  onPress={handleSaveAllBasicInfo}
                >
                  <Text style={[styles.inspectBtnText, { color: COLORS.neutral.white, fontWeight: '700' }]}>Save</Text>
                </Pressable>
              </>
            ) : (
              <Pressable
                style={[styles.inspectBtn, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: isDark ? colors.brand[500] : colors.brand[600], borderWidth: 1, paddingHorizontal: 12 }]}
                onPress={() => setIsEditingSection(true)}
              >
                <Text style={[styles.inspectBtnText, { color: isDark ? colors.brand[400] : colors.brand[800], fontWeight: '600' }]}>Edit</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>

      <View style={styles.infoBlock}>
        <Text style={[styles.fieldGroupLabel, { color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>REFERENCE NUMBER</Text>
        <InfoRow
          label="Reference Number:"
          value={app.referenceNumber}
          isEditing={isEditingSection}
          editValue={refDraft}
          onEditChange={setRefDraft}
        />

        <Text style={[styles.fieldGroupLabel, { marginTop: SPACING[12], color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>
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

      {/* ALWAYS SHOW FILING ENTITY & SUBMITTER DETAILS FOR ALL APPLICATION/ACCOUNT TYPES */}
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
        <View style={[infoStyles.row, { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
          <Text style={[infoStyles.label, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>User Account Type:</Text>
          {isEditingSection ? (
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Pressable
                style={{
                  backgroundColor: accountTypeDraft === 'Individual'
                    ? (isDark ? colors.brand[500] : colors.brand[700])
                    : (isDark ? colors.neutral[800] : colors.neutral[100]),
                  borderColor: isDark ? colors.brand[500] : colors.brand[600],
                  borderWidth: 1,
                  paddingHorizontal: 16,
                  paddingVertical: 6,
                  borderRadius: RADIUS.button,
                }}
                onPress={() => setAccountTypeDraft('Individual')}
              >
                <Text style={{
                  color: accountTypeDraft === 'Individual' ? COLORS.neutral.white : (isDark ? colors.neutral[300] : colors.neutral[700]),
                  fontWeight: '600',
                  fontSize: TYPOGRAPHY.sizes.body,
                }}>
                  Individual
                </Text>
              </Pressable>
              <Pressable
                style={{
                  backgroundColor: accountTypeDraft === 'Company'
                    ? (isDark ? colors.brand[500] : colors.brand[700])
                    : (isDark ? colors.neutral[800] : colors.neutral[100]),
                  borderColor: isDark ? colors.brand[500] : colors.brand[600],
                  borderWidth: 1,
                  paddingHorizontal: 16,
                  paddingVertical: 6,
                  borderRadius: RADIUS.button,
                }}
                onPress={() => setAccountTypeDraft('Company')}
              >
                <Text style={{
                  color: accountTypeDraft === 'Company' ? COLORS.neutral.white : (isDark ? colors.neutral[300] : colors.neutral[700]),
                  fontWeight: '600',
                  fontSize: TYPOGRAPHY.sizes.body,
                }}>
                  Company
                </Text>
              </Pressable>
            </View>
          ) : (
            <Text style={[infoStyles.value, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
              {app.filingUser?.accountType ?? "Individual"}
            </Text>
          )}
        </View>
        {((isEditingSection ? accountTypeDraft === 'Company' : app.filingUser?.accountType === 'Company')) && (
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
      {app.applicationType === 'BULK' && localApplicants.length > 0 && (
        <>
          {/* BULK BATCH APPLICANTS TABLE WITH FULL-TABLE TOGGLE EDIT */}
          <SectionHeader
            title={`APPLICANTS BATCH SUMMARY (${localApplicants.length} APPLICANTS)`}
            rightAction={
              isEditable ? (
                <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                  {isEditingRoster ? (
                    <>
                      <Pressable
                        style={[styles.inspectBtn, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[300], paddingHorizontal: 10 }]}
                        onPress={() => setIsEditingRoster(false)}
                      >
                        <Text style={[styles.inspectBtnText, { color: isDark ? colors.neutral[200] : colors.neutral[800] }]}>Cancel</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.inspectBtn, { backgroundColor: isDark ? colors.brand[500] : colors.brand[700], paddingHorizontal: 12 }]}
                        onPress={handleSaveAllRoster}
                      >
                        <Text style={[styles.inspectBtnText, { color: COLORS.neutral.white, fontWeight: '700' }]}>💾 Save Roster Changes</Text>
                      </Pressable>
                    </>
                  ) : (
                    <Pressable
                      style={[styles.inspectBtn, { backgroundColor: isDark ? colors.brand[600] : colors.brand[700], paddingHorizontal: 10 }]}
                      onPress={() => setIsEditingRoster(true)}
                    >
                      <Text style={[styles.inspectBtnText, { color: COLORS.neutral.white }]}>✏️ Edit Batch Roster</Text>
                    </Pressable>
                  )}
                </View>
              ) : null
            }
          />
          <View style={[styles.denseTableContainer, { backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral.white, borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
            {/* Table Header */}
            <View style={[styles.denseTableHeader, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderBottomColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
              <Text style={[styles.denseHeaderCell, { width: 35, textAlign: 'center', color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>#</Text>
              <Text style={[styles.denseHeaderCell, { flex: 2, color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>APPLICANT NAME</Text>
              <Text style={[styles.denseHeaderCell, { flex: 1, color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>TYPE</Text>
              <Text style={[styles.denseHeaderCell, { flex: 1.2, color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>STATUS VERDICT</Text>
              <Text style={[styles.denseHeaderCell, { flex: 2, color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>EVALUATION REMARKS</Text>
              <Text style={[styles.denseHeaderCell, { width: 100, textAlign: 'right', color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>ACTION</Text>
            </View>

            {/* Table Body Rows */}
            {localApplicants.map((item, idx) => {
              const isRowEditing = isEditingRoster;
              return (
                <View
                  key={item.id || idx}
                  style={[
                    styles.denseTableRow,
                    { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[200] },
                    isRowEditing && { backgroundColor: isDark ? colors.neutral[800] : colors.brand[50] }
                  ]}
                >
                  <Text style={[styles.denseRowIndex, { width: 35, textAlign: 'center', color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>#{idx + 1}</Text>

                  {isRowEditing ? (
                    <>
                      <View style={{ flex: 2 }}>
                        <Text style={[styles.denseRowName, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]} numberOfLines={1}>
                          {item.name}
                        </Text>
                        {item.email ? <Text style={[styles.denseRowSub, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]} numberOfLines={1}>{item.email}</Text> : null}
                      </View>
                      <View style={{ flex: 1, paddingRight: 6 }}>
                        <Pressable
                          style={[styles.miniStatusBadge, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200], paddingVertical: 6, alignItems: 'center' }]}
                          onPress={() => handleUpdateRosterRow(idx, { applicantType: item.applicantType === 'Individual' ? 'Company' : 'Individual' })}
                        >
                          <Text style={[styles.miniStatusText, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>{item.applicantType || 'Individual'}</Text>
                        </Pressable>
                      </View>
                      <View style={{ flex: 1.2 }}>
                        <View style={{ flexDirection: 'row', gap: 4 }}>
                          <Pressable
                            style={[styles.miniStatusBadge, { backgroundColor: item.status === 'Complete' ? '#DCFCE7' : (isDark ? colors.neutral[700] : colors.neutral[200]), paddingHorizontal: 6 }]}
                            onPress={() => handleSetStatus(idx, 'Complete')}
                          >
                            <Text style={[styles.miniStatusText, { color: item.status === 'Complete' ? '#166534' : colors.neutral[500] }]}>C</Text>
                          </Pressable>
                          <Pressable
                            style={[styles.miniStatusBadge, { backgroundColor: item.status === 'Incomplete' ? '#FEE2E2' : (isDark ? colors.neutral[700] : colors.neutral[200]), paddingHorizontal: 6 }]}
                            onPress={() => handleSetStatus(idx, 'Incomplete')}
                          >
                            <Text style={[styles.miniStatusText, { color: item.status === 'Incomplete' ? '#991B1B' : colors.neutral[500] }]}>INC</Text>
                          </Pressable>
                          <Pressable
                            style={[styles.miniStatusBadge, { backgroundColor: item.status === 'ForEndorsement' ? '#F3E8FF' : (isDark ? colors.neutral[700] : colors.neutral[200]), paddingHorizontal: 6 }]}
                            onPress={() => handleSetStatus(idx, 'ForEndorsement')}
                          >
                            <Text style={[styles.miniStatusText, { color: item.status === 'ForEndorsement' ? '#6B21A8' : colors.neutral[500] }]}>END</Text>
                          </Pressable>
                        </View>
                      </View>
                      <View style={{ flex: 2, paddingRight: 6 }}>
                        <TextInput
                          style={[infoStyles.editInput, { color: isDark ? colors.neutral[100] : colors.neutral[900], backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral.white }]}
                          value={item.evaluationRemarks || ''}
                          onChangeText={(val) => handleUpdateRosterRow(idx, { evaluationRemarks: val })}
                          placeholder="Remarks..."
                          placeholderTextColor={COLORS.neutral[400]}
                        />
                      </View>
                      <View style={{ width: 100, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Pressable
                          style={[styles.inspectBtn, { backgroundColor: isDark ? colors.brand[600] : colors.brand[700] }]}
                          onPress={() => onInspectApplicant?.(idx)}
                        >
                          <Text style={[styles.inspectBtnText, { color: COLORS.neutral.white }]}>
                            Inspect ►
                          </Text>
                        </Pressable>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={{ flex: 2 }}>
                        <Text style={[styles.denseRowName, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]} numberOfLines={1}>
                          {item.name}
                        </Text>
                        {item.email ? <Text style={[styles.denseRowSub, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]} numberOfLines={1}>{item.email}</Text> : null}
                      </View>
                      <Text style={[styles.denseRowType, { flex: 1, color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                        {item.applicantType}
                      </Text>
                      <View style={{ flex: 1.2 }}>
                        {item.status === 'Incomplete' ? (
                          <View style={[styles.miniStatusBadge, { backgroundColor: '#FEE2E2', alignSelf: 'flex-start' }]}>
                            <Text style={[styles.miniStatusText, { color: '#991B1B' }]}>INCOMPLETE</Text>
                          </View>
                        ) : item.status === 'ForEndorsement' ? (
                          <View style={[styles.miniStatusBadge, { backgroundColor: '#F3E8FF', alignSelf: 'flex-start' }]}>
                            <Text style={[styles.miniStatusText, { color: '#6B21A8' }]}>FOR ENDORSEMENT</Text>
                          </View>
                        ) : (
                          <View style={[styles.miniStatusBadge, { backgroundColor: '#DCFCE7', alignSelf: 'flex-start' }]}>
                            <Text style={[styles.miniStatusText, { color: '#166534' }]}>COMPLETE</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.denseRowRemarks, { flex: 2, color: isDark ? colors.neutral[400] : colors.neutral[600] }]} numberOfLines={1}>
                        {item.evaluationRemarks || '—'}
                      </Text>
                      <View style={{ width: 100, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Pressable
                          style={[styles.inspectBtn, { backgroundColor: isDark ? colors.brand[600] : colors.brand[700] }]}
                          onPress={() => onInspectApplicant?.(idx)}
                        >
                          <Text style={[styles.inspectBtnText, { color: COLORS.neutral.white }]}>
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
                    {idx !== app.history.length - 1 && (
                      <View style={[styles.historyLine, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200], }]} />
                    )}
                  </View>
                  <View style={styles.historyRight}>
                    <Text style={[styles.historyAction, { color: isDark ? colors.neutral[100] : colors.neutral[900], }]}>{entry.action}</Text>
                    <Text style={[styles.historyStaff, { color: isDark ? colors.neutral[500] : colors.neutral[400], }]}>by {entry.staff}</Text>
                    <Text style={[styles.historyDate, { color: isDark ? colors.neutral[500] : colors.neutral[400], }]}>{entry.timestamp}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </>
      )}

      {/* NOTE */}
      <View style={[styles.noteBlock, { borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
        <View style={styles.noteHeader}>
          <Text style={[styles.fieldGroupLabel, { color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>NOTE</Text>
          {isEditable && !editingNote && (
            <Pressable
              onPress={() => {
                setNoteDraft(app.note);
                setEditingNote(true);
              }}
            >
              <Text style={[styles.editLinkBlue, { color: isDark ? colors.brand[500] : colors.brand[700] }]}>EDIT</Text>
            </Pressable>
          )}
        </View>
        {editingNote ? (
          <View style={{ gap: SPACING[8] }}>
            <TextInput
              style={[styles.noteInput, { color: isDark ? colors.neutral[100] : colors.neutral[900], backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50], borderColor: isDark ? colors.brand[500] : colors.brand[500] }]}
              multiline
              value={noteDraft}
              onChangeText={setNoteDraft}
              textAlignVertical="top"
              autoFocus
            />
            <Pressable
              style={[styles.saveNoteBtn, { backgroundColor: isDark ? colors.brand[500] : colors.brand[700] }]}
              onPress={() => {
                setEditingNote(false);
                updateApplication(app.id, { note: noteDraft });
              }}
            >
              <Text style={[styles.saveNoteBtnText, { color: isDark ? colors.neutral[800] : COLORS.neutral.white }]}>Save Note</Text>
            </Pressable>
          </View>
        ) : (
          <Text style={[styles.noteText, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>{app.note}</Text>
        )}
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

function ApplicantRecordTab({
  app,
  selectedApplicantIndex,
  onSelectApplicantIndex,
  updateApplication,
  isEditable,
}: {
  app: ApplicationData;
  selectedApplicantIndex?: number;
  onSelectApplicantIndex?: (index: number) => void;
  updateApplication?: (id: string, patch: Partial<ApplicationData>) => void;
  isEditable?: boolean;
}) {
  const { colors, isDark } = useTheme();
  const effectiveApplicants = useMemo(() => {
    if (app.applicantsList && app.applicantsList.length > 0) {
      return app.applicantsList;
    }
    return [{
      id: app.id,
      name: app.applicant || `${app.basicInfo?.firstName ?? ''} ${app.basicInfo?.lastName ?? ''}`.trim() || "Applicant 1",
      applicantType: 'Individual' as const,
      status: 'Complete' as const,
      evaluationRemarks: '',
      contactNumber: app.contactDetails?.contactNumber || '',
      email: app.contactDetails?.email || '',
      address: typeof app.address === 'string' ? app.address : `${app.address?.city ?? ''}, ${app.address?.province ?? ''}`.trim(),
      barangay: '',
      city: '',
      province: '',
      zipCode: '',
      basicInfo: app.basicInfo ? {
        lastName: app.basicInfo.lastName,
        firstName: app.basicInfo.firstName,
        middleName: app.basicInfo.middleName,
        extensionName: app.basicInfo.extensionName,
        dob: app.basicInfo.dob,
        placeOfBirth: app.basicInfo.placeOfBirth,
        sex: app.basicInfo.sex,
        weight: app.basicInfo.weight,
        height: app.basicInfo.height,
        nationality: app.basicInfo.nationality,
        employmentStatus: app.basicInfo.employmentStatus,
        occupation: app.basicInfo.occupation,
      } : undefined,
      requirements: app.requirements,
    }];
  }, [app]);

  const [localApplicants, setLocalApplicants] = useState<ApplicantItem[]>(effectiveApplicants);

  useEffect(() => {
    setLocalApplicants(effectiveApplicants);
  }, [effectiveApplicants]);

  const applicants = (localApplicants.length > 0 && localApplicants[0]?.id === effectiveApplicants[0]?.id)
    ? localApplicants
    : effectiveApplicants;
  const activeIdx = Math.min(selectedApplicantIndex ?? 0, Math.max(0, applicants.length - 1));
  const activeApplicant = applicants[activeIdx];
  const bi = activeApplicant?.basicInfo;

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingForm, setIsEditingForm] = useState(false);

  const [fnProfileDraft, setFnProfileDraft] = useState('');
  const [lnProfileDraft, setLnProfileDraft] = useState('');
  const [mnProfileDraft, setMnProfileDraft] = useState('');
  const [extProfileDraft, setExtProfileDraft] = useState('');
  const [editingType, setEditingType] = useState(false);
  const [typeDraft, setTypeDraft] = useState('');
  const [editingContact, setEditingContact] = useState(false);
  const [contactDraft, setContactDraft] = useState('');
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailDraft, setEmailDraft] = useState('');
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressDraft, setAddressDraft] = useState('');
  const [editingZip, setEditingZip] = useState(false);
  const [zipDraft, setZipDraft] = useState('');

  const [compNameProfileDraft, setCompNameProfileDraft] = useState('');
  const [compRegNoProfileDraft, setCompRegNoProfileDraft] = useState('');
  const [compAddressProfileDraft, setCompAddressProfileDraft] = useState('');
  const [compContactProfileDraft, setCompContactProfileDraft] = useState('');
  const [compEmailProfileDraft, setCompEmailProfileDraft] = useState('');

  const { formData, isLoading: isLoadingForm, refetch: refetchForm } = useApplicationFormWithSubmission(
    app.id,
    activeApplicant?.id,
    activeApplicant?.serviceVariantId
  );
  const [formDraftValues, setFormDraftValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (formData) {
      const initialDrafts: Record<string, string> = {};
      formData.sections.forEach((sec) => {
        sec.fields.forEach((f) => {
          initialDrafts[f.fieldId] = f.value ?? '';
        });
      });
      setFormDraftValues(initialDrafts);
    }
  }, [formData]);

  const handleSaveProfile = () => {
    const updated = [...localApplicants];
    if (updated[activeIdx]) {
      const compiledName = [fnProfileDraft, mnProfileDraft, lnProfileDraft, extProfileDraft].filter(Boolean).join(' ').trim();
      const finalName = compiledName || updated[activeIdx].name;
      updated[activeIdx] = {
        ...updated[activeIdx],
        name: finalName,
        applicantType: (typeDraft as 'Individual' | 'Company') || updated[activeIdx].applicantType,
        contactNumber: contactDraft || updated[activeIdx].contactNumber,
        email: emailDraft || updated[activeIdx].email,
        address: addressDraft || updated[activeIdx].address,
        zipCode: zipDraft || updated[activeIdx].zipCode,
        companyDetails: typeDraft === 'Company' ? {
          name: compNameProfileDraft,
          registrationNumber: compRegNoProfileDraft,
          address: compAddressProfileDraft,
          contactNumber: compContactProfileDraft,
          email: compEmailProfileDraft,
        } : updated[activeIdx].companyDetails,
        basicInfo: {
          ...(updated[activeIdx].basicInfo ?? {
            lastName: '',
            firstName: '',
            middleName: '',
            extensionName: '',
            dob: '',
            placeOfBirth: '',
            sex: '',
            weight: 0,
            height: 0,
            nationality: '',
            employmentStatus: '',
            occupation: '',
          }),
          firstName: fnProfileDraft,
          lastName: lnProfileDraft,
          middleName: mnProfileDraft,
          extensionName: extProfileDraft,
        },
      };
      setLocalApplicants(updated);
      if (activeApplicant?.id) {
        applicationService.adminUpdateApplicantProfile(app.id, activeApplicant.id, {
          firstName: fnProfileDraft,
          lastName: lnProfileDraft,
          middleName: mnProfileDraft,
          suffix: extProfileDraft,
          contactNumber: contactDraft || updated[activeIdx].contactNumber,
          email: emailDraft || updated[activeIdx].email,
          address: addressDraft || updated[activeIdx].address,
          zipCode: zipDraft || updated[activeIdx].zipCode,
          applicantType: typeDraft || updated[activeIdx].applicantType,
          companyName: typeDraft === 'Company' ? compNameProfileDraft : undefined,
          companyRegistrationNumber: typeDraft === 'Company' ? compRegNoProfileDraft : undefined,
          companyAddress: typeDraft === 'Company' ? compAddressProfileDraft : undefined,
          companyContactNumber: typeDraft === 'Company' ? compContactProfileDraft : undefined,
          companyEmail: typeDraft === 'Company' ? compEmailProfileDraft : undefined,
        });
      }
    }
    setIsEditingProfile(false);
  };

  const handleSaveFormFields = async () => {
    if (!activeApplicant?.id || !formData) return;

    const payload = formData.sections.flatMap((sec) =>
      sec.fields.map((f) => ({
        fieldId: f.fieldId,
        fieldLabel: f.label,
        value: formDraftValues[f.fieldId] ?? (f.value || ''),
      }))
    );

    const [res, err] = await applicationService.adminUpdateFormValues(app.id, activeApplicant.id, payload, formData.submissionId ?? undefined);
    if (res && res.succeeded) {
      setIsEditingForm(false);
      refetchForm();
    }
  };

  const accountableForms = app.forms.filter(
    (f) => f.section === "ACCOUNTABLE FORM",
  );
  const downloadForms = app.forms.filter((f) => f.section === "DOWNLOAD FORM");

  const handleAction = (form: ApplicationFormAttachment, action: string) => {
    Alert.alert(
      `${action} Form`,
      `You are ${action.toLowerCase()}ing: ${form.name}`,
      [{ text: "OK" }],
    );
  };

  const handleViewRequirement = (label: string) => {
    Alert.alert("View Requirement Document", `Viewing submitted document: ${label}`);
  };

  const [localRemarks, setLocalRemarks] = useState(activeApplicant?.evaluationRemarks ?? '');

  useEffect(() => {
    setLocalRemarks(activeApplicant?.evaluationRemarks ?? '');
  }, [activeApplicant?.id, activeApplicant?.evaluationRemarks]);

  const handleSetStatus = (idx: number, newStatus: 'Complete' | 'Incomplete' | 'ForEndorsement') => {
    if (!isEditable) return;
    const updated = [...localApplicants];
    if (updated[idx]) {
      updated[idx] = { ...updated[idx], status: newStatus };
      setLocalApplicants(updated);
      if (updateApplication) {
        updateApplication(app.id, { applicantsList: updated });
      }
    }
  };

  const handleSetRemarks = (idx: number, text: string) => {
    if (!isEditable) return;
    const updated = [...localApplicants];
    if (updated[idx]) {
      updated[idx] = { ...updated[idx], evaluationRemarks: text };
      setLocalApplicants(updated);
      if (updateApplication) {
        updateApplication(app.id, { applicantsList: updated });
      }
    }
  };

  const applicantRequirements = (activeApplicant?.requirements && activeApplicant.requirements.length > 0)
    ? activeApplicant.requirements
    : app.requirements;

  return (
    <View style={{ flex: 1 }}>
      {/* Fixed Sticky Top Applicant Selector Bar for Bulk Applications */}
      {applicants.length > 0 && (
        <View
          style={[
            styles.applicantSelectorBar,
            {
              backgroundColor: isDark ? colors.neutral[900] : colors.brand[50],
              borderColor: isDark ? colors.neutral[700] : colors.brand[200],
              marginTop: SPACING[8],
              marginBottom: SPACING[4],
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 3,
              elevation: 3,
              zIndex: 10,
            },
          ]}
        >
          <Pressable
            disabled={activeIdx === 0}
            onPress={() => onSelectApplicantIndex?.(Math.max(0, activeIdx - 1))}
            style={[styles.selectorNavBtn, activeIdx === 0 && { opacity: 0.3 }]}
          >
            <Lucide name="chevron-left" size={14} color={isDark ? colors.brand[400] : colors.brand[800]} />
            <Text style={[styles.selectorNavBtnText, { color: isDark ? colors.brand[400] : colors.brand[800] }]}>Previous</Text>
          </Pressable>

          <View style={styles.selectorCenter}>
            <Lucide name="user" size={14} color={isDark ? colors.brand[400] : colors.brand[800]} />
            <Text style={[styles.selectorTitleText, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
              Applicant Record {activeIdx + 1} of {applicants.length}:
            </Text>
            <Text style={[styles.selectorNameText, { color: isDark ? colors.brand[300] : colors.brand[900] }]}>
              {activeApplicant?.name}
            </Text>
          </View>

          <Pressable
            disabled={activeIdx >= applicants.length - 1}
            onPress={() => onSelectApplicantIndex?.(Math.min(applicants.length - 1, activeIdx + 1))}
            style={[styles.selectorNavBtn, activeIdx >= applicants.length - 1 && { opacity: 0.3 }]}
          >
            <Text style={[styles.selectorNavBtnText, { color: isDark ? colors.brand[400] : colors.brand[800] }]}>Next</Text>
            <Lucide name="chevron-right" size={14} color={isDark ? colors.brand[400] : colors.brand[800]} />
          </Pressable>
        </View>
      )}

      {/* Scrollable Content Area */}
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>

        {/* Section 1: Personal & Profile Info */}
        <SectionHeader
          title={activeApplicant ? `1. APPLICANT PROFILE DETAILS (${activeApplicant.name.toUpperCase()})` : "APPLICATION FORM"}
          rightAction={
            isEditable && activeApplicant ? (
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                {isEditingProfile ? (
                  <>
                    <Pressable
                      style={[styles.inspectBtn, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[300], paddingHorizontal: 10 }]}
                      onPress={() => setIsEditingProfile(false)}
                    >
                      <Text style={[styles.inspectBtnText, { color: isDark ? colors.neutral[200] : colors.neutral[800] }]}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.inspectBtn, { backgroundColor: isDark ? colors.brand[500] : colors.brand[700], paddingHorizontal: 12 }]}
                      onPress={handleSaveProfile}
                    >
                      <Text style={[styles.inspectBtnText, { color: COLORS.neutral.white, fontWeight: '700' }]}>Save</Text>
                    </Pressable>
                  </>
                ) : (
                  <Pressable
                    style={[styles.inspectBtn, { backgroundColor: isDark ? colors.brand[600] : colors.brand[700], paddingHorizontal: 10 }]}
                    onPress={() => {
                      const biData = activeApplicant.basicInfo;
                      if (biData?.firstName || biData?.lastName) {
                        setFnProfileDraft(biData.firstName || '');
                        setLnProfileDraft(biData.lastName || '');
                        setMnProfileDraft(biData.middleName || '');
                        setExtProfileDraft(biData.extensionName || '');
                      } else {
                        const parts = activeApplicant.name.trim().split(/\s+/);
                        setFnProfileDraft(parts[0] || '');
                        setLnProfileDraft(parts.length > 1 ? parts.slice(1).join(' ') : '');
                        setMnProfileDraft('');
                        setExtProfileDraft('');
                      }
                      setTypeDraft(activeApplicant.applicantType);
                      setContactDraft(activeApplicant.contactNumber || '');
                      setEmailDraft(activeApplicant.email || '');
                      setAddressDraft(activeApplicant.address || '');
                      setZipDraft(activeApplicant.zipCode || '');
                      const compData = activeApplicant.companyDetails;
                      setCompNameProfileDraft(compData?.name || app.companyDetails?.name || app.filingUser?.company?.name || '');
                      setCompRegNoProfileDraft(compData?.registrationNumber || app.companyDetails?.registrationNumber || app.filingUser?.company?.registrationNumber || '');
                      setCompAddressProfileDraft(compData?.address || app.companyDetails?.address || app.filingUser?.company?.address || '');
                      setCompContactProfileDraft(compData?.contactNumber || app.companyDetails?.contactNumber || app.filingUser?.company?.contactNumber || '');
                      setCompEmailProfileDraft(compData?.email || app.companyDetails?.email || app.filingUser?.company?.email || '');
                      setIsEditingProfile(true);
                    }}
                  >
                    <Text style={[styles.inspectBtnText, { color: COLORS.neutral.white }]}>Edit</Text>
                  </Pressable>
                )}
              </View>
            ) : null
          }
        />
        <View style={styles.infoBlock}>
          {activeApplicant ? (
            <>
              {isEditingProfile ? (
                <>
                  <InfoRow
                    label="First Name:"
                    value={bi?.firstName || ''}
                    isEditing={true}
                    editValue={fnProfileDraft}
                    onEditChange={setFnProfileDraft}
                  />
                  <InfoRow
                    label="Middle Name:"
                    value={bi?.middleName || ''}
                    isEditing={true}
                    editValue={mnProfileDraft}
                    onEditChange={setMnProfileDraft}
                  />
                  <InfoRow
                    label="Last Name:"
                    value={bi?.lastName || ''}
                    isEditing={true}
                    editValue={lnProfileDraft}
                    onEditChange={setLnProfileDraft}
                  />
                  <InfoRow
                    label="Suffix:"
                    value={bi?.extensionName || ''}
                    isEditing={true}
                    editValue={extProfileDraft}
                    onEditChange={setExtProfileDraft}
                  />
                </>
              ) : (
                <InfoRow
                  label="Full Name:"
                  value={activeApplicant.name}
                  isEditing={false}
                />
              )}
              <View style={[infoStyles.row, { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
                <Text style={[infoStyles.label, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>Applicant Type:</Text>
                {isEditingProfile ? (
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <Pressable
                      style={{
                        backgroundColor: typeDraft === 'Individual'
                          ? (isDark ? colors.brand[500] : colors.brand[700])
                          : (isDark ? colors.neutral[800] : colors.neutral[100]),
                        borderColor: isDark ? colors.brand[500] : colors.brand[600],
                        borderWidth: 1,
                        paddingHorizontal: 16,
                        paddingVertical: 6,
                        borderRadius: RADIUS.button,
                      }}
                      onPress={() => setTypeDraft('Individual')}
                    >
                      <Text style={{
                        color: typeDraft === 'Individual' ? COLORS.neutral.white : (isDark ? colors.neutral[300] : colors.neutral[700]),
                        fontWeight: '600',
                        fontSize: TYPOGRAPHY.sizes.body,
                      }}>
                        Individual
                      </Text>
                    </Pressable>
                    <Pressable
                      style={{
                        backgroundColor: typeDraft === 'Company'
                          ? (isDark ? colors.brand[500] : colors.brand[700])
                          : (isDark ? colors.neutral[800] : colors.neutral[100]),
                        borderColor: isDark ? colors.brand[500] : colors.brand[600],
                        borderWidth: 1,
                        paddingHorizontal: 16,
                        paddingVertical: 6,
                        borderRadius: RADIUS.button,
                      }}
                      onPress={() => setTypeDraft('Company')}
                    >
                      <Text style={{
                        color: typeDraft === 'Company' ? COLORS.neutral.white : (isDark ? colors.neutral[300] : colors.neutral[700]),
                        fontWeight: '600',
                        fontSize: TYPOGRAPHY.sizes.body,
                      }}>
                        Company
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  <Text style={[infoStyles.value, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
                    {activeApplicant.applicantType}
                  </Text>
                )}
              </View>
              {(isEditingProfile ? typeDraft === 'Company' : activeApplicant.applicantType === 'Company') && (
                <>
                  <InfoRow
                    label="Company Name:"
                    value={activeApplicant.companyDetails?.name ?? app.companyDetails?.name ?? app.filingUser?.company?.name ?? '—'}
                    isEditing={isEditingProfile}
                    editValue={compNameProfileDraft}
                    onEditChange={setCompNameProfileDraft}
                  />
                  <InfoRow
                    label="Company Reg No:"
                    value={activeApplicant.companyDetails?.registrationNumber ?? app.companyDetails?.registrationNumber ?? app.filingUser?.company?.registrationNumber ?? '—'}
                    isEditing={isEditingProfile}
                    editValue={compRegNoProfileDraft}
                    onEditChange={setCompRegNoProfileDraft}
                  />
                  <InfoRow
                    label="Company Address:"
                    value={activeApplicant.companyDetails?.address ?? app.companyDetails?.address ?? app.filingUser?.company?.address ?? '—'}
                    isEditing={isEditingProfile}
                    editValue={compAddressProfileDraft}
                    onEditChange={setCompAddressProfileDraft}
                  />
                  <InfoRow
                    label="Company Contact:"
                    value={activeApplicant.companyDetails?.contactNumber ?? app.companyDetails?.contactNumber ?? app.filingUser?.company?.contactNumber ?? '—'}
                    isEditing={isEditingProfile}
                    editValue={compContactProfileDraft}
                    onEditChange={setCompContactProfileDraft}
                  />
                  <InfoRow
                    label="Company Email:"
                    value={activeApplicant.companyDetails?.email ?? app.companyDetails?.email ?? app.filingUser?.company?.email ?? '—'}
                    isEditing={isEditingProfile}
                    editValue={compEmailProfileDraft}
                    onEditChange={setCompEmailProfileDraft}
                  />
                </>
              )}
              <InfoRow
                label="Contact Number:"
                value={activeApplicant.contactNumber || '—'}
                isEditing={isEditingProfile}
                editValue={contactDraft}
                onEditChange={setContactDraft}
              />
              <InfoRow
                label="Email Address:"
                value={activeApplicant.email || '—'}
                isEditing={isEditingProfile}
                editValue={emailDraft}
                onEditChange={setEmailDraft}
              />
              <InfoRow
                label="Address / Barangay:"
                value={activeApplicant.address || '—'}
                isEditing={isEditingProfile}
                editValue={addressDraft}
                onEditChange={setAddressDraft}
              />
              <InfoRow
                label="Zip Code:"
                value={activeApplicant.zipCode || '—'}
                isEditing={isEditingProfile}
                editValue={zipDraft}
                onEditChange={setZipDraft}
              />
              {bi ? (
                <>
                  {bi.dob ? <InfoRow label="Date of Birth:" value={bi.dob} /> : null}
                  {bi.sex ? <InfoRow label="Sex:" value={bi.sex} /> : null}
                  {bi.nationality ? <InfoRow label="Nationality:" value={bi.nationality} /> : null}
                  {bi.height > 0 ? <InfoRow label="Height:" value={`${bi.height} cm`} /> : null}
                  {bi.weight > 0 ? <InfoRow label="Weight:" value={`${bi.weight} kg`} /> : null}
                </>
              ) : null}
            </>
          ) : (
            <>
              <Text style={[styles.submittedText, { color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>
                {app.applicationDetails.submittedAt}
              </Text>
              <Text style={[styles.permitCategoryText, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>{app.permitTitle}</Text>
              <Text style={[styles.formTypeText, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                {app.applicationDetails.formType}
              </Text>
            </>
          )}
        </View>

        {/* Section 2: Completed Service Form Submissions */}
        <SectionHeader
          title="2. COMPLETED SERVICE FORM SUBMISSIONS"
          rightAction={
            isEditable && formData && formData.sections.length > 0 ? (
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                {isEditingForm ? (
                  <>
                    <Pressable
                      style={[styles.inspectBtn, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[300], paddingHorizontal: 10 }]}
                      onPress={() => setIsEditingForm(false)}
                    >
                      <Text style={[styles.inspectBtnText, { color: isDark ? colors.neutral[200] : colors.neutral[800] }]}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.inspectBtn, { backgroundColor: isDark ? colors.brand[500] : colors.brand[700], paddingHorizontal: 12 }]}
                      onPress={handleSaveFormFields}
                    >
                      <Text style={[styles.inspectBtnText, { color: COLORS.neutral.white, fontWeight: '700' }]}>Save</Text>
                    </Pressable>
                  </>
                ) : (
                  <Pressable
                    style={[styles.inspectBtn, { backgroundColor: isDark ? colors.brand[600] : colors.brand[700], paddingHorizontal: 10 }]}
                    onPress={() => setIsEditingForm(true)}
                  >
                    <Text style={[styles.inspectBtnText, { color: COLORS.neutral.white }]}>Edit</Text>
                  </Pressable>
                )}
              </View>
            ) : null
          }
        />
        <View style={styles.infoBlock}>
          {isLoadingForm ? (
            <View style={{ padding: 16, alignItems: 'center' }}>
              <Text style={{ color: isDark ? colors.neutral[400] : colors.neutral[600], fontSize: 13 }}>
                Loading form submission...
              </Text>
            </View>
          ) : formData && formData.sections.length > 0 ? (
            formData.sections.map((sec) => (
              <View key={sec.key} style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: isDark ? colors.brand[400] : colors.brand[600], marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {sec.title}
                </Text>
                {sec.fields.map((ff) => (
                  <InfoRow
                    key={ff.fieldId}
                    label={`${ff.label}:`}
                    value={ff.value || '—'}
                    isEditing={isEditingForm}
                    editValue={formDraftValues[ff.fieldId] ?? ''}
                    onEditChange={(newVal) => {
                      setFormDraftValues((prev) => ({ ...prev, [ff.fieldId]: newVal }));
                    }}
                  />
                ))}
              </View>
            ))
          ) : (
            <View style={styles.emptyReqs}>
              <Lucide name="file-text" size={24} color={isDark ? colors.neutral[600] : colors.neutral[300]} />
              <Text style={[styles.emptyReqsText, { color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>
                No service form field submissions recorded
              </Text>
            </View>
          )}
        </View>

        {/* Section 3: Requirements & Submitted Documents per Applicant */}
        <SectionHeader title="3. SUBMITTED REQUIREMENTS & DOCUMENT ATTACHMENTS" />
        <View style={styles.infoBlock}>
          {applicantRequirements.length === 0 ? (
            <View style={styles.emptyReqs}>
              <Lucide name="folder" size={24} color={isDark ? colors.neutral[600] : colors.neutral[300]} />
              <Text style={[styles.emptyReqsText, { color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>No requirement documents submitted</Text>
            </View>
          ) : (
            applicantRequirements.map((req, idx) => (
              <View key={idx} style={[styles.reqItem, { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
                <Text style={[styles.reqLabel, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>{req.label}</Text>
                {req.note !== undefined && req.note.length > 0 && (
                  <Text style={[styles.reqNote, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{req.note}</Text>
                )}
                <View style={styles.reqFileRow}>
                  <Lucide name="file-text" size={14} color={isDark ? colors.brand[400] : colors.brand[700]} />
                  <Text style={[styles.reqFilename, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]} numberOfLines={1}>
                    {req.filename}
                  </Text>
                  <Pressable onPress={() => handleViewRequirement(req.label)}>
                    <Text style={[styles.reqViewLink, { color: isDark ? colors.brand[400] : colors.brand[700] }]}>View Document</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Accountable Form */}
        {accountableForms.length > 0 && (
          <>
            <SectionHeader title="ACCOUNTABLE FORM" />
            <View style={styles.infoBlock}>
              {accountableForms.map((form) => (
                <View key={form.name} style={[styles.formCard, { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100], borderLeftColor: isDark ? colors.brand[500] : colors.brand[700], backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white, }]}>
                  <View style={styles.formCardLeft}>
                    <View style={[styles.formDocIcon, { backgroundColor: isDark ? colors.neutral[800] : '#EFF6FF', }]}>
                      <Lucide
                        name="file-text"
                        size={18}
                        color={isDark ? colors.brand[500] : COLORS.brand[700]}
                      />
                    </View>
                    <View>
                      <Text style={[styles.formDocLabel, { color: isDark ? colors.neutral[500] : colors.neutral[400], }]}>DOCUMENT ATTACHMENT</Text>
                      <Text style={[styles.formDocName, { color: isDark ? colors.neutral[100] : colors.neutral[900], }]}>{form.name}</Text>
                      <View style={styles.formActions}>
                        {form.canView && (
                          <Pressable onPress={() => handleAction(form, "View")}>
                            <Text style={[styles.formActionLink, { color: isDark ? colors.brand[500] : colors.brand[700], }]}>View</Text>
                          </Pressable>
                        )}
                        {form.canPrint && (
                          <Pressable onPress={() => handleAction(form, "Print")}>
                            <Text style={[styles.formActionLink, { color: isDark ? colors.brand[500] : colors.brand[700], }]}>Print</Text>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  </View>
                  {form.canDownload && (
                    <Pressable
                      style={[styles.downloadBtn, { borderColor: isDark ? colors.neutral[700] : colors.neutral[200], }]}
                      onPress={() => handleAction(form, "Download")}
                    >
                      <Lucide
                        name="download"
                        size={14}
                        color={isDark ? colors.neutral[400] : colors.neutral[600]}
                      />
                      <Text style={[styles.downloadBtnText, { color: isDark ? colors.neutral[300] : colors.neutral[600], }]}>Download</Text>
                    </Pressable>
                  )}
                </View>
              ))}
            </View>
          </>
        )}

        {/* Download Form */}
        {downloadForms.length > 0 && (
          <>
            <SectionHeader title="DOWNLOAD FORM" />
            <View style={styles.infoBlock}>
              {downloadForms.map((form) => (
                <View key={form.name} style={[styles.formCard, { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100], borderLeftColor: isDark ? colors.brand[500] : colors.brand[700], backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white, }]}>
                  <View style={styles.formCardLeft}>
                    <View style={[styles.formDocIcon, { backgroundColor: isDark ? colors.neutral[800] : '#EFF6FF', }]}>
                      <Lucide
                        name="file-text"
                        size={18}
                        color={isDark ? colors.brand[500] : COLORS.brand[700]}
                      />
                    </View>
                    <View>
                      <Text style={[styles.formDocLabel, { color: isDark ? colors.neutral[500] : colors.neutral[400], }]}>DOCUMENT ATTACHMENT</Text>
                      <Text style={[styles.formDocName, { color: isDark ? colors.neutral[100] : colors.neutral[900], }]}>{form.name}</Text>
                      <View style={styles.formActions}>
                        {form.canView && (
                          <Pressable onPress={() => handleAction(form, "View")}>
                            <Text style={[styles.formActionLink, { color: isDark ? colors.brand[500] : colors.brand[700], }]}>View</Text>
                          </Pressable>
                        )}
                        {form.canPrint && (
                          <Pressable onPress={() => handleAction(form, "Print")}>
                            <Text style={[styles.formActionLink, { color: isDark ? colors.brand[500] : colors.brand[700], }]}>Print</Text>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  </View>
                  <View style={styles.formBtnGroup}>
                    {form.canDownload && (
                      <Pressable
                        style={[styles.downloadBtn, { borderColor: isDark ? colors.neutral[700] : colors.neutral[200], }]}
                        onPress={() => handleAction(form, "Download")}
                      >
                        <Lucide
                          name="download"
                          size={14}
                          color={isDark ? colors.neutral[400] : colors.neutral[600]}
                        />
                        <Text style={[styles.downloadBtnText, { color: isDark ? colors.neutral[300] : colors.neutral[600], }]}>Download</Text>
                      </Pressable>
                    )}
                    {form.canRefresh && (
                      <Pressable
                        style={[styles.refreshBtn, { borderColor: isDark ? colors.neutral[700] : colors.neutral[200], }]}
                        onPress={() => handleAction(form, "Refresh")}
                      >
                        <Lucide
                          name="refresh-cw"
                          size={14}
                          color={isDark ? colors.neutral[400] : colors.neutral[600]}
                        />
                        <Text style={[styles.downloadBtnText, { color: isDark ? colors.neutral[300] : colors.neutral[600], }]}>Refresh</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}



        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Fixed Sticky Bottom Dock — Evaluator Panel */}
      {activeApplicant && (
        <View
          style={[
            styles.evaluatorControlBoxSticky,
            {
              backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral.white,
              borderTopColor: isDark ? colors.neutral[700] : colors.neutral[200],
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: isDark ? 0.3 : 0.07,
              shadowRadius: 8,
              elevation: 10,
            },
          ]}
        >
          {/* Accent stripe at top — full-width via absolute positioning */}
          <View
            pointerEvents="none"
            style={[
              styles.evalAccentStripe,
              {
                backgroundColor: activeApplicant.status === 'Incomplete'
                  ? '#EF4444'
                  : activeApplicant.status === 'ForEndorsement'
                    ? '#A855F7'
                    : '#22C55E',
              },
            ]}
          />

          <View style={styles.evalDockRow}>
            {/* Left — Verdict chips */}
            <View style={styles.evalDockLeft}>
              <Text style={[styles.evalDockLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                VERDICT — {activeApplicant.name.split(' ')[0].toUpperCase()}
              </Text>
              <View style={styles.evalChipRow}>
                {/* Complete chip */}
                <Pressable
                  disabled={!isEditable}
                  style={[
                    styles.evalChip,
                    {
                      backgroundColor: (activeApplicant.status === 'Complete' || !activeApplicant.status)
                        ? (isDark ? '#14532D' : '#DCFCE7')
                        : (isDark ? colors.neutral[800] : colors.neutral[100]),
                      borderColor: (activeApplicant.status === 'Complete' || !activeApplicant.status)
                        ? '#22C55E'
                        : (isDark ? colors.neutral[700] : colors.neutral[200]),
                    },
                    !isEditable && { opacity: 0.5 },
                    Platform.select({ web: { cursor: isEditable ? 'pointer' : 'not-allowed' } as object }),
                  ]}
                  onPress={() => handleSetStatus(activeIdx, 'Complete')}
                >
                  <Lucide
                    name="check-circle"
                    size={13}
                    color={(activeApplicant.status === 'Complete' || !activeApplicant.status) ? '#22C55E' : (isDark ? colors.neutral[500] : colors.neutral[400])}
                  />
                  <Text style={[styles.evalChipText, {
                    color: (activeApplicant.status === 'Complete' || !activeApplicant.status)
                      ? '#16A34A'
                      : (isDark ? colors.neutral[400] : colors.neutral[500]),
                    fontWeight: (activeApplicant.status === 'Complete' || !activeApplicant.status) ? TYPOGRAPHY.weights.bold : TYPOGRAPHY.weights.medium,
                  }]}>Complete</Text>
                </Pressable>

                {/* Incomplete chip */}
                <Pressable
                  disabled={!isEditable}
                  style={[
                    styles.evalChip,
                    {
                      backgroundColor: activeApplicant.status === 'Incomplete'
                        ? (isDark ? '#7F1D1D' : '#FEE2E2')
                        : (isDark ? colors.neutral[800] : colors.neutral[100]),
                      borderColor: activeApplicant.status === 'Incomplete'
                        ? '#EF4444'
                        : (isDark ? colors.neutral[700] : colors.neutral[200]),
                    },
                    !isEditable && { opacity: 0.5 },
                    Platform.select({ web: { cursor: isEditable ? 'pointer' : 'not-allowed' } as object }),
                  ]}
                  onPress={() => handleSetStatus(activeIdx, 'Incomplete')}
                >
                  <Lucide
                    name="x-circle"
                    size={13}
                    color={activeApplicant.status === 'Incomplete' ? '#EF4444' : (isDark ? colors.neutral[500] : colors.neutral[400])}
                  />
                  <Text style={[styles.evalChipText, {
                    color: activeApplicant.status === 'Incomplete'
                      ? '#DC2626'
                      : (isDark ? colors.neutral[400] : colors.neutral[500]),
                    fontWeight: activeApplicant.status === 'Incomplete' ? TYPOGRAPHY.weights.bold : TYPOGRAPHY.weights.medium,
                  }]}>Incomplete</Text>
                </Pressable>

                {/* For Endorsement chip */}
                <Pressable
                  disabled={!isEditable}
                  style={[
                    styles.evalChip,
                    {
                      backgroundColor: activeApplicant.status === 'ForEndorsement'
                        ? (isDark ? '#3B0764' : '#F3E8FF')
                        : (isDark ? colors.neutral[800] : colors.neutral[100]),
                      borderColor: activeApplicant.status === 'ForEndorsement'
                        ? '#A855F7'
                        : (isDark ? colors.neutral[700] : colors.neutral[200]),
                    },
                    !isEditable && { opacity: 0.5 },
                    Platform.select({ web: { cursor: isEditable ? 'pointer' : 'not-allowed' } as object }),
                  ]}
                  onPress={() => handleSetStatus(activeIdx, 'ForEndorsement')}
                >
                  <Lucide
                    name="send"
                    size={12}
                    color={activeApplicant.status === 'ForEndorsement' ? '#A855F7' : (isDark ? colors.neutral[500] : colors.neutral[400])}
                  />
                  <Text style={[styles.evalChipText, {
                    color: activeApplicant.status === 'ForEndorsement'
                      ? '#9333EA'
                      : (isDark ? colors.neutral[400] : colors.neutral[500]),
                    fontWeight: activeApplicant.status === 'ForEndorsement' ? TYPOGRAPHY.weights.bold : TYPOGRAPHY.weights.medium,
                  }]}>For Endorsement</Text>
                </Pressable>
              </View>
            </View>

            {/* Divider */}
            <View style={[styles.evalDockDivider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200] }]} />

            {/* Right — Remarks */}
            <View style={styles.evalDockRight}>
              <Text style={[styles.evalDockLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                REMARKS
              </Text>
              <TextInput
                editable={isEditable}
                style={[styles.remarksInputCompact, {
                  color: isDark ? colors.neutral[100] : colors.neutral[900],
                  backgroundColor: isDark ? colors.neutral[800] : (isEditable ? colors.neutral[50] : colors.neutral[100]),
                  borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
                }, !isEditable && { opacity: 0.6 }]}
                placeholder="Add notes or remarks..."
                placeholderTextColor={isDark ? colors.neutral[600] : colors.neutral[400]}
                value={localRemarks}
                onChangeText={(text) => {
                  setLocalRemarks(text);
                  handleSetRemarks(activeIdx, text);
                }}
                multiline
                numberOfLines={2}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

function RequirementsTab({ app }: { app: ApplicationData }) {
  const { colors, isDark } = useTheme();
  const handleViewRequirement = (label: string) => {
    Alert.alert("View Requirement", `Viewing document: ${label}`);
  };

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {app.requirements.length === 0 ? (
        <View style={styles.emptyReqs}>
          <Lucide name="folder" size={28} color={isDark ? colors.neutral[600] : colors.neutral[300]} />
          <Text style={[styles.emptyReqsText, { color: isDark ? colors.neutral[500] : colors.neutral[400], }]}>No requirements submitted</Text>
        </View>
      ) : (
        app.requirements.map((req, idx) => (
          <View key={idx} style={[styles.reqItem, { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100], }]}>
            <Text style={[styles.reqLabel, { color: isDark ? colors.neutral[100] : colors.neutral[900], }]}>{req.label}</Text>
            {req.note !== undefined && req.note.length > 0 && (
              <Text style={[styles.reqNote, { color: isDark ? colors.neutral[400] : colors.neutral[500], }]}>{req.note}</Text>
            )}
            <View style={styles.reqFileRow}>
              <Lucide name="file" size={13} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
              <Text style={[styles.reqFilename, { color: isDark ? colors.neutral[400] : colors.neutral[500], }]} numberOfLines={1}>
                {req.filename}
              </Text>
              <Pressable onPress={() => handleViewRequirement(req.label)}>
                <Text style={[styles.reqViewLink, { color: isDark ? colors.brand[500] : colors.brand[700], }]}>View</Text>
              </Pressable>
            </View>
            <View style={[styles.reqThumbnail, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], }]}>
              <Lucide name="image" size={24} color={isDark ? colors.neutral[600] : colors.neutral[300]} />
            </View>
          </View>
        ))
      )}
      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

function SoaPaymentTab({
  app,
  isEditable,
  updateApplication,
}: {
  app: ApplicationData;
  isEditable: boolean;
  updateApplication: (id: string, patch: Partial<ApplicationData>) => void;
}) {
  const { colors, isDark } = useTheme();
  const [auditOpen, setAuditOpen] = useState(false);
  const [editingOrNumber, setEditingOrNumber] = useState(false);
  const [editingDueDate, setEditingDueDate] = useState(false);
  const [orDraft, setOrDraft] = useState(app.payment.orNumber);
  const [dueDraft, setDueDraft] = useState(app.dueDate);

  const excess = app.payment.amountReceived - app.totalAmountDue;
  const amountWords = amountToWords(app.totalAmountDue);

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* OFFICIAL BILLING RECORD */}
      <View style={[styles.billingContainer, { borderColor: isDark ? colors.neutral[700] : colors.neutral[200], backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white, }]}>
        <Text style={[styles.billingLabel, { color: isDark ? colors.brand[500] : colors.brand[700], }]}>OFFICIAL BILLING RECORD</Text>
        <Text style={[styles.billingTitle, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>Statement of Account</Text>
        <Text style={[styles.billingSubtitle, { color: isDark ? colors.neutral[400] : colors.neutral[500], }]}>
          Review the billing particulars, charges, and due date below.
        </Text>

        {/* Fee table */}
        <View style={[styles.feeTable, { borderColor: isDark ? colors.neutral[700] : colors.neutral[200], }]}>
          {/* Header */}
          <View style={[styles.feeTableHeader, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50], }]}>
            {[
              "Particular",
              "No. of Years",
              "%",
              "No. of Units",
              "Fees",
              "Amount",
            ].map((col) => (
              <Text
                key={col}
                style={[
                  styles.feeTableHeaderCell,
                  { color: isDark ? colors.neutral[300] : colors.neutral[600] },
                  col === "Particular"
                    ? { flex: 2 }
                    : { flex: 1, textAlign: "right" },
                ]}
              >
                {col}
              </Text>
            ))}
          </View>
          <View style={[styles.feeTableDivider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200], }]} />

          {app.soaItems.map((item, idx) => (
            <View key={idx} style={[styles.feeTableRow, { borderTopColor: isDark ? colors.neutral[800] : colors.neutral[100], }]}>
              <View style={{ flex: 2 }}>
                <Text style={[styles.feeParticularName, { color: isDark ? colors.neutral[100] : colors.neutral[900], }]}>{item.particular}</Text>
                <Text style={[styles.feeParticularSub, { color: isDark ? colors.neutral[500] : colors.neutral[400], }]}>
                  Validity • {item.validityYears} Year(s)
                </Text>
                <Text style={[styles.feeParticularSub, { color: isDark ? colors.neutral[500] : colors.neutral[400], }]}>Code: {item.code}</Text>
              </View>
              <Text style={[styles.feeTableCell, { flex: 1, color: isDark ? colors.neutral[200] : colors.neutral[700] }]}>
                {item.validityYears}
              </Text>
              <Text style={[styles.feeTableCell, { flex: 1, color: isDark ? colors.neutral[200] : colors.neutral[700] }]}>
                {item.percentage}
              </Text>
              <Text style={[styles.feeTableCell, { flex: 1, color: isDark ? colors.neutral[200] : colors.neutral[700] }]}>
                {item.noOfUnits}
              </Text>
              <Text style={[styles.feeTableCell, { flex: 1, color: isDark ? colors.neutral[200] : colors.neutral[700] }]}>
                {item.fees}
              </Text>
              <Text style={[styles.feeTableCell, { flex: 1, color: isDark ? colors.neutral[200] : colors.neutral[700] }]}>
                {formatAmount(item.amount)}
              </Text>
            </View>
          ))}
        </View>

        {/* Total Amount Due */}
        <View style={[styles.totalBox, { borderColor: isDark ? colors.neutral[700] : colors.neutral[200], backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50], }]}>
          <View style={styles.totalRight}>
            <Text style={[styles.totalLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500], }]}>TOTAL AMOUNT DUE</Text>
            <Text style={[styles.totalAmount, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
              {formatAmount(app.totalAmountDue)}
            </Text>
            <Text style={[styles.totalWords, { color: isDark ? colors.neutral[400] : colors.neutral[500], }]}>{amountWords.toUpperCase()}</Text>
            <View style={styles.totalDueDateRow}>
              <Text style={[styles.totalDueDateLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500], }]}>
                To be paid on or before:
              </Text>
              {editingDueDate ? (
                <View style={styles.inlineEditRow}>
                  <TextInput
                    style={[styles.inlineEditInput, { color: isDark ? colors.neutral[100] : colors.neutral[900], backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white, borderColor: isDark ? colors.brand[500] : colors.brand[500], }]}
                    value={dueDraft}
                    onChangeText={setDueDraft}
                    autoFocus
                  />
                  <Pressable
                    onPress={() => {
                      setEditingDueDate(false);
                      updateApplication(app.id, { dueDate: dueDraft });
                    }}
                  >
                    <Text style={[styles.inlineEditSave, { color: isDark ? colors.brand[500] : colors.brand[700], }]}>Save</Text>
                  </Pressable>
                </View>
              ) : (
                <Text style={[styles.totalDueDate, { color: isDark ? colors.neutral[100] : colors.neutral[900], }]}>{app.dueDate}</Text>
              )}
            </View>
            {isEditable && !editingDueDate && (
              <Pressable
                style={styles.editLinkRow}
                onPress={() => {
                  setDueDraft(app.dueDate);
                  setEditingDueDate(true);
                }}
              >
                <Lucide name="edit-2" size={12} color={isDark ? colors.brand[500] : COLORS.brand[700]} />
                <Text style={[styles.editLinkBlue, { color: isDark ? colors.brand[500] : colors.brand[700], }]}>Edit</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {/* Payment Summary */}
      <View style={[styles.paymentSection, { borderColor: isDark ? colors.neutral[700] : colors.neutral[200], backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white, }]}>
        <View style={styles.paymentSectionHeader}>
          <View style={[styles.paymentSectionIcon, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], }]}>
            <Lucide name="circle" size={20} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
          </View>
          <Text style={[styles.paymentSectionTitle, { color: isDark ? colors.neutral[100] : colors.neutral[900], }]}>Payment Summary</Text>
        </View>

        <View style={styles.paymentRow}>
          {/* Amount Received blue card */}
          <View style={[styles.amountReceivedCard, { backgroundColor: isDark ? colors.brand[500] : colors.brand[800], }]}>
            <Text style={styles.amountReceivedLabel}>AMOUNT RECEIVED</Text>
            <Text style={[styles.amountReceivedValue, { color: isDark ? colors.neutral[800] : COLORS.neutral.white, }]}>
              {app.payment.amountReceived}
            </Text>
            {excess > 0 && (
              <View style={styles.excessBadge}>
                <Text style={[styles.excessBadgeText, { color: isDark ? colors.neutral[800] : COLORS.neutral.white, }]}>Excess: ₱{excess}</Text>
              </View>
            )}
            <View style={styles.paymentMethodBlock}>
              <Text style={styles.paymentMethodLabel}>PAYMENT METHOD</Text>
              <Text style={[styles.paymentMethodValue, { color: isDark ? colors.neutral[800] : COLORS.neutral.white, }]}>
                {app.payment.method}
              </Text>
            </View>
          </View>

          {/* OR Number column */}
          <View style={styles.orColumn}>
            <Text style={[styles.orLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500], }]}>OFFICIAL RECEIPT (OR) NUMBER</Text>
            {editingOrNumber ? (
              <View style={styles.inlineEditRow}>
                <TextInput
                  style={[styles.inlineEditInput, { flex: 1, color: isDark ? colors.neutral[100] : colors.neutral[900], }]}
                  value={orDraft}
                  onChangeText={setOrDraft}
                  autoFocus
                  placeholder="Enter OR Number"
                  placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
                />
                <Pressable
                  onPress={() => {
                    setEditingOrNumber(false);
                    updateApplication(app.id, {
                      payment: { ...app.payment, orNumber: orDraft },
                    });
                  }}
                >
                  <Text style={[styles.inlineEditSave, { color: isDark ? colors.brand[500] : colors.brand[700], }]}>Save</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.orValueRow}>
                <Text style={[styles.orValue, { color: isDark ? colors.neutral[200] : colors.neutral[700], }]}>
                  {app.payment.orNumber.length > 0 ? app.payment.orNumber : "—"}
                </Text>
                {isEditable && (
                  <Pressable
                    style={[styles.orEditBtn, { backgroundColor: isDark ? colors.neutral[800] : '#EFF6FF', borderColor: isDark ? colors.brand[500] : colors.brand[600], }]}
                    onPress={() => {
                      setOrDraft(app.payment.orNumber);
                      setEditingOrNumber(true);
                    }}
                  >
                    <Lucide name="edit-2" size={12} color={isDark ? colors.brand[500] : COLORS.brand[700]} />
                    <Text style={[styles.orEditText, { color: isDark ? colors.brand[500] : colors.brand[700], }]}>EDIT</Text>
                  </Pressable>
                )}
              </View>
            )}

            {/* Additional Payment Info for Checks */}
            {app.payment.method === "check" && (
              <View style={{ marginTop: SPACING[16] }}>
                <Text style={[styles.orLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500], }]}>CHECK DETAILS</Text>
                <Text style={[styles.checkInfoText, { color: isDark ? colors.neutral[300] : colors.neutral[600], }]}>
                  No: {app.payment.checkNumber || "—"}
                </Text>
                <Text style={[styles.checkInfoText, { color: isDark ? colors.neutral[300] : colors.neutral[600], }]}>
                  Bank: {app.payment.checkName || "—"}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Correction Audit Trail */}
      <Pressable
        style={[styles.auditHeader, { borderTopColor: isDark ? colors.neutral[700] : colors.neutral[200], }]}
        onPress={() => setAuditOpen((p) => !p)}
      >
        <View style={styles.auditHeaderLeft}>
          <Lucide name="refresh-cw" size={14} color={isDark ? colors.neutral[500] : colors.neutral[500]} />
          <Text style={[styles.auditTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500], }]}>
            CORRECTION AUDIT TRAIL ({app.correctionAuditTrail.length})
          </Text>
        </View>
        <Lucide
          name={auditOpen ? "chevron-up" : "chevron-down"}
          size={16}
          color={isDark ? colors.neutral[500] : colors.neutral[500]}
        />
      </Pressable>

      {auditOpen && (
        <View style={styles.auditList}>
          {app.correctionAuditTrail.length === 0 ? (
            <Text style={[styles.auditEmpty, { color: isDark ? colors.neutral[500] : colors.neutral[400], }]}>No audit trail entries.</Text>
          ) : (
            app.correctionAuditTrail.map((entry) => (
              <View key={entry.id} style={[styles.auditEntry, { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100], }]}>
                <Text style={[styles.auditDesc, { color: isDark ? colors.neutral[200] : colors.neutral[700], }]}>{entry.action}</Text>
                <Text style={[styles.auditMeta, { color: isDark ? colors.neutral[500] : colors.neutral[400], }]}>
                  By {entry.staff} • {entry.timestamp}
                </Text>
              </View>
            ))
          )}
        </View>
      )}

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

// ─── Skeleton Loading Component ─────────────────────────────────────────────

export function ApplicationReviewSkeleton({ onClose }: { onClose?: () => void }) {
  const { colors, isDark } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }}>
      {/* Top Bar / Header Banner Skeleton */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: SPACING[16],
          paddingVertical: SPACING[12],
          borderBottomWidth: 1,
          borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[200],
          backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING[12] }}>
          {onClose && <SkeletonLoader width={32} height={32} borderRadius={RADIUS.button} />}
          <View style={{ gap: 6 }}>
            <SkeletonLoader width={240} height={20} borderRadius={4} />
            <SkeletonLoader width={140} height={13} borderRadius={4} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING[8] }}>
          <SkeletonLoader width={80} height={28} borderRadius={14} />
          <SkeletonLoader width={80} height={28} borderRadius={14} />
        </View>
      </View>

      {/* Inner Tabs Bar Skeleton */}
      <View
        style={{
          flexDirection: 'row',
          gap: SPACING[8],
          paddingHorizontal: SPACING[16],
          paddingVertical: SPACING[8],
          borderBottomWidth: 1,
          borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[200],
          backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
        }}
      >
        <SkeletonLoader width={140} height={36} borderRadius={6} />
        <SkeletonLoader width={140} height={36} borderRadius={6} />
        <SkeletonLoader width={140} height={36} borderRadius={6} />
      </View>

      {/* Content Workspace Skeleton */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING[16], gap: SPACING[16] }}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: Overview Card */}
        <View
          style={{
            borderRadius: RADIUS.card,
            borderWidth: 1,
            borderColor: isDark ? colors.neutral[800] : colors.neutral[200],
            backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
            padding: SPACING[16],
            gap: SPACING[12],
          }}
        >
          <SkeletonLoader width={180} height={18} borderRadius={4} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING[12] }}>
            <SkeletonLoader width="48%" height={48} borderRadius={RADIUS.input} />
            <SkeletonLoader width="48%" height={48} borderRadius={RADIUS.input} />
            <SkeletonLoader width="48%" height={48} borderRadius={RADIUS.input} />
            <SkeletonLoader width="48%" height={48} borderRadius={RADIUS.input} />
          </View>
        </View>

        {/* Section 2: Applicants Roster & Record */}
        <View
          style={{
            borderRadius: RADIUS.card,
            borderWidth: 1,
            borderColor: isDark ? colors.neutral[800] : colors.neutral[200],
            backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
            padding: SPACING[16],
            gap: SPACING[12],
          }}
        >
          <SkeletonLoader width={220} height={18} borderRadius={4} />
          <View style={{ gap: SPACING[8] }}>
            <SkeletonLoader width="100%" height={52} borderRadius={RADIUS.card} />
            <SkeletonLoader width="100%" height={52} borderRadius={RADIUS.card} />
          </View>
        </View>

        {/* Section 3: Form Submissions / Requirements Table */}
        <View
          style={{
            borderRadius: RADIUS.card,
            borderWidth: 1,
            borderColor: isDark ? colors.neutral[800] : colors.neutral[200],
            backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
            padding: SPACING[16],
            gap: SPACING[12],
          }}
        >
          <SkeletonLoader width={260} height={18} borderRadius={4} />
          <SkeletonLoader width="100%" height={100} borderRadius={RADIUS.card} />
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar Skeleton */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: SPACING[12],
          paddingHorizontal: SPACING[16],
          paddingVertical: SPACING[12],
          borderTopWidth: 1,
          borderTopColor: isDark ? colors.neutral[800] : colors.neutral[200],
          backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
        }}
      >
        <SkeletonLoader width={110} height={38} borderRadius={RADIUS.button} />
        <SkeletonLoader width={130} height={38} borderRadius={RADIUS.button} />
      </View>
    </View>
  );
}

// ─── Main Content Component ──────────────────────────────────────────────────

export interface ApplicationReviewScreenProps {
  applicationId?: string | null;
  onClose: () => void;
  onCollapse?: () => void;
  isCollapsed?: boolean;
}

export function ApplicationReviewScreenContent({
  applicationId: propApplicationId,
  onClose,
  onCollapse,
  isCollapsed,
}: ApplicationReviewScreenProps) {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isNarrow = width < 900;
  const { applicationDto, isLoading: isDetailsLoading, refetch } = useAdminApplicationDetails(propApplicationId);

  const selectedApplication = useMemo(() => {
    return applicationDto ? mapApplicationDtoToUI(applicationDto) : null;
  }, [applicationDto]);

  const updateApplication = useCallback(async (id: string, patch: Partial<ApplicationData>) => {
    if (patch.status) {
      await applicationService.updateStatus(id, {
        status: patch.status,
        remarks: patch.note,
      });
    } else {
      await applicationService.adminUpdateApplication(id, patch as Record<string, unknown>);
    }
    refetch();
  }, [refetch]);

  const setSelectedId = useCallback((_id: string | null) => {
    onClose();
  }, [onClose]);
  const { currentRole } = useRole();
  const { canApprove, canDecline, canEndorse, canVerifyCashier } =
    usePermissions();

  const [innerTab, setInnerTab] = useState<InnerTab>("details");
  const [selectedApplicantIndex, setSelectedApplicantIndex] = useState(0);
  const [showApprove, setShowApprove] = useState(false);
  const [showDecline, setShowDecline] = useState(false);
  const [showEndorse, setShowEndorse] = useState(false);
  const [showCashier, setShowCashier] = useState(false);

  useEffect(() => {
    setSelectedApplicantIndex(0);
  }, [selectedApplication?.id]);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const tabScrollRef = useRef<ScrollView>(null);

  // Mouse drag-to-scroll for the tab bar on web
  useEffect(() => {
    if (Platform.OS !== 'web' || !isNarrow) return;
    const node = tabScrollRef.current?.getScrollableNode();
    if (!(node instanceof HTMLElement)) return;

    node.style.cursor = 'grab';

    let dragging = false;
    let startX = 0;
    let originScrollLeft = 0;

    const onMouseDown = (e: MouseEvent) => {
      dragging = true;
      startX = e.pageX - node.offsetLeft;
      originScrollLeft = node.scrollLeft;
      node.style.cursor = 'grabbing';
      node.style.userSelect = 'none';
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      e.preventDefault();
      const x = e.pageX - node.offsetLeft;
      node.scrollLeft = originScrollLeft - (x - startX);
    };

    const stopDrag = () => {
      if (!dragging) return;
      dragging = false;
      node.style.cursor = 'grab';
      node.style.userSelect = '';
    };

    node.addEventListener('mousedown', onMouseDown);
    node.addEventListener('mousemove', onMouseMove);
    node.addEventListener('mouseup', stopDrag);
    node.addEventListener('mouseleave', stopDrag);

    return () => {
      node.removeEventListener('mousedown', onMouseDown);
      node.removeEventListener('mousemove', onMouseMove);
      node.removeEventListener('mouseup', stopDrag);
      node.removeEventListener('mouseleave', stopDrag);
      node.style.cursor = '';
      node.style.userSelect = '';
    };
  }, [isNarrow]);

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [selectedApplication?.id, fadeAnim]);

  const handleCloseAnimated = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      onClose();
      fadeAnim.setValue(1);
    });
  };

  if (isDetailsLoading) {
    return <ApplicationReviewSkeleton onClose={onClose} />;
  }

  if (selectedApplication === null) {
    return (
      <ScrollView
        style={[styles.emptyPanelScroll, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50], }]}
        contentContainerStyle={styles.emptyPanelContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.summaryCard, { backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white, }]}>
          <View style={[styles.summaryHeader, { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100], }]}>
            <Lucide name="layout" size={20} color={isDark ? colors.brand[500] : COLORS.brand[700]} />
            <Text style={[styles.summaryTitle, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>Work Queue Summary</Text>
          </View>

          <View style={[styles.guideBox, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50], }]}>
            <Lucide name="info" size={16} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
            <Text style={[styles.guideText, { color: isDark ? colors.neutral[300] : colors.neutral[600], }]}>
              Select an application from the left feed to start reviewing
              details, endorsing, or approving requests.
            </Text>
          </View>
        </View>

        <View style={styles.actionPrompt}>
          <Lucide name="mouse-pointer" size={32} color={isDark ? colors.neutral[600] : colors.neutral[300]} />
          <Text style={[styles.emptyPanelTitle, { color: isDark ? colors.neutral[500] : colors.neutral[400], }]}>No Application Selected</Text>
          <Text style={[styles.emptyPanelSub, { color: isDark ? colors.neutral[600] : colors.neutral[300], }]}>
            Select an application from the queue to view full details and perform evaluation actions.
          </Text>
        </View>
      </ScrollView>
    );
  }

  const app = selectedApplication;

  const isEditable =
    app.queueTab !== "history" &&
    app.status !== "Completed" &&
    app.status !== "Approved";

  const showCashierBtn =
    currentRole === "Cashier" ||
    (canVerifyCashier && innerTab === "soa");

  const handleApprove = () => {
    setShowApprove(false);
    const dateStr = new Date().toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    updateApplication(app.id, {
      status: "Approved",
      queueTab: "history",
      history: [
        ...app.history,
        {
          id: `H${app.history.length + 1}`,
          action: "Application Approved.",
          staff: `${currentRole.toUpperCase()} EDGE`,
          timestamp: dateStr,
        },
      ],
    });
    setSelectedId(null);
  };

  const handleDecline = (notice: string) => {
    setShowDecline(false);
    const dateStr = new Date().toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    updateApplication(app.id, {
      status: "Returned",
      queueTab: "history",
      note: notice,
      history: [
        ...app.history,
        {
          id: `H${app.history.length + 1}`,
          action: `Application Declined. Notice: ${notice}`,
          staff: `${currentRole.toUpperCase()} EDGE`,
          timestamp: dateStr,
        },
      ],
    });
    setSelectedId(null);
  };

  const handleEndorse = (targetRole: UserRole) => {
    setShowEndorse(false);
    const dateStr = new Date().toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    updateApplication(app.id, {
      assignedTo: `${targetRole.toUpperCase()} EDGE`,
      queueTab: "history",
      history: [
        ...app.history,
        {
          id: `H${app.history.length + 1}`,
          action: `Application endorsed to ${targetRole}.`,
          staff: `${currentRole.toUpperCase()} EDGE`,
          timestamp: dateStr,
        },
      ],
    });

    setSelectedId(null);
    Alert.alert("Success", `Application endorsed to ${targetRole}`);
  };

  const handleTopAction = (action: "View" | "Print") => {
    if (action === "Print") {
      Alert.alert(
        "Print Application",
        `Generating printable form for ${app.referenceNumber}...`,
      );
    } else {
      Alert.alert(
        "View Application",
        `Opening full view for ${app.applicant}...`,
      );
    }
  };

  const handleCashierVerify = (data: {
    orNumber: string;
    checkNumber: string;
    checkName: string;
  }) => {
    setShowCashier(false);
    const dateStr = new Date().toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    updateApplication(app.id, {
      payment: { ...app.payment, ...data },
      status: "Approved",
      queueTab: "history",
      assignedTo: "ADMIN EDGE",
      history: [
        ...app.history,
        {
          id: `H${app.history.length + 1}`,
          action: `Payment verified. OR: ${data.orNumber}. Moved for approval.`,
          staff: `${currentRole.toUpperCase()} EDGE`,
          timestamp: dateStr,
        },
      ],
    });

    setSelectedId(null);
    Alert.alert("Success", "Payment verified. Application moved for approval.");
  };

  return (
    <Animated.View style={[styles.panel, { backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white, opacity: fadeAnim }]}>
      {/* ── Inner Tab Bar ── */}
      <View style={[
        styles.innerTabBarWrapper,
        {
          borderBottomColor: isDark ? colors.neutral[700] : colors.neutral[200],
          backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
        },
      ]}>
        {isNarrow ? (
          // ── Narrow: two rows ──
          <>
            {/* Row 1: Scrollable tabs */}
            <ScrollView
              ref={tabScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.innerTabScrollContent}
              style={styles.innerTabScroll}
            >
              {INNER_TABS.map((tab) => {
                const isActive = innerTab === tab.key;
                return (
                  <Pressable
                    key={tab.key}
                    style={styles.innerTabItem}
                    onPress={() => setInnerTab(tab.key)}
                  >
                    <Lucide
                      name={tab.icon}
                      size={13}
                      color={isActive ? (isDark ? colors.brand[500] : COLORS.brand[700]) : (isDark ? colors.neutral[500] : COLORS.neutral[400])}
                    />
                    <Text
                      style={[
                        styles.innerTabText,
                        { color: isActive ? (isDark ? colors.brand[500] : COLORS.brand[700]) : (isDark ? colors.neutral[400] : COLORS.neutral[500]) },
                      ]}
                    >
                      {tab.label}
                    </Text>
                    {isActive && <View style={[styles.innerTabUnderline, { backgroundColor: isDark ? colors.brand[500] : colors.brand[700] }]} />}
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Row 2: Actions — always visible */}
            <View style={[styles.innerTabActionsRow, { borderTopColor: isDark ? colors.neutral[700] : colors.neutral[100] }]}>
              <View style={styles.headerActionRow}>
                <Pressable style={styles.headerActionLink} onPress={() => handleTopAction("View")}>
                  <Lucide name="eye" size={14} color={isDark ? colors.brand[500] : COLORS.brand[700]} />
                  <Text style={[styles.headerActionLinkText, { color: isDark ? colors.brand[500] : colors.brand[700] }]}>View</Text>
                </Pressable>
                <View style={[styles.headerActionDivider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200] }]} />
                <Pressable style={styles.headerActionLink} onPress={() => handleTopAction("Print")}>
                  <Lucide name="printer" size={14} color={isDark ? colors.brand[500] : COLORS.brand[700]} />
                  <Text style={[styles.headerActionLinkText, { color: isDark ? colors.brand[500] : colors.brand[700] }]}>Print</Text>
                </Pressable>
              </View>
              <View style={styles.innerTabSpacer} />
              {onCollapse !== undefined && (
                <Pressable style={[styles.iconBtn, Platform.select({ web: { cursor: "pointer" } })]} onPress={onCollapse}>
                  <Lucide name={isCollapsed ? "minimize-2" : "maximize-2"} size={14} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
                </Pressable>
              )}
              <Pressable style={[styles.iconBtn, Platform.select({ web: { cursor: "pointer" } })]} onPress={handleCloseAnimated}>
                <Lucide name="x" size={16} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
              </Pressable>
            </View>
          </>
        ) : (
          // ── Wide: single row ──
          <View style={styles.innerTabBar}>
            {INNER_TABS.map((tab) => {
              const isActive = innerTab === tab.key;
              return (
                <Pressable
                  key={tab.key}
                  style={styles.innerTabItem}
                  onPress={() => setInnerTab(tab.key)}
                >
                  <Lucide
                    name={tab.icon}
                    size={13}
                    color={isActive ? (isDark ? colors.brand[500] : COLORS.brand[700]) : (isDark ? colors.neutral[500] : COLORS.neutral[400])}
                  />
                  <Text
                    style={[
                      styles.innerTabText,
                      { color: isActive ? (isDark ? colors.brand[500] : COLORS.brand[700]) : (isDark ? colors.neutral[400] : COLORS.neutral[500]) },
                    ]}
                  >
                    {tab.label}
                  </Text>
                  {isActive && <View style={[styles.innerTabUnderline, { backgroundColor: isDark ? colors.brand[500] : colors.brand[700] }]} />}
                </Pressable>
              );
            })}
            <View style={styles.innerTabSpacer} />
            <View style={styles.headerActionRow}>
              <Pressable style={styles.headerActionLink} onPress={() => handleTopAction("View")}>
                <Lucide name="eye" size={14} color={isDark ? colors.brand[500] : COLORS.brand[700]} />
                <Text style={[styles.headerActionLinkText, { color: isDark ? colors.brand[500] : colors.brand[700] }]}>View</Text>
              </Pressable>
              <View style={[styles.headerActionDivider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200] }]} />
              <Pressable style={styles.headerActionLink} onPress={() => handleTopAction("Print")}>
                <Lucide name="printer" size={14} color={isDark ? colors.brand[500] : COLORS.brand[700]} />
                <Text style={[styles.headerActionLinkText, { color: isDark ? colors.brand[500] : colors.brand[700] }]}>Print</Text>
              </Pressable>
            </View>
            <View style={{ width: SPACING[16] }} />
            {onCollapse !== undefined && (
              <Pressable style={[styles.iconBtn, Platform.select({ web: { cursor: "pointer" } })]} onPress={onCollapse}>
                <Lucide name={isCollapsed ? "minimize-2" : "maximize-2"} size={14} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
              </Pressable>
            )}
            <Pressable style={[styles.iconBtn, Platform.select({ web: { cursor: "pointer" } })]} onPress={handleCloseAnimated}>
              <Lucide name="x" size={16} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
            </Pressable>
          </View>
        )}
      </View>

      {/* Read-only banner */}
      {!isEditable && (
        <View style={[styles.readOnlyBanner, { backgroundColor: colors.brand.yellowLight, }]}>
          <Lucide name="lock" size={12} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
          <Text style={[styles.readOnlyText, { color: isDark ? COLORS.semantic.warningText : COLORS.semantic.warningText }]}>
            Read-only — actions only available on Pending applications with
            actionable status
          </Text>
        </View>
      )}

      {/* ── Tab Content ── */}
      {innerTab === "details" && (
        <ApplicationDetailsTab
          key={app.id}
          app={app}
          isEditable={isEditable}
          updateApplication={updateApplication}
          selectedApplicantIndex={selectedApplicantIndex}
          onSelectApplicantIndex={(idx) => setSelectedApplicantIndex(idx)}
          onInspectApplicant={(idx) => {
            setSelectedApplicantIndex(idx);
            setInnerTab("applicant-record");
          }}
        />
      )}
      {innerTab === "applicant-record" && (
        <ApplicantRecordTab
          key={app.id}
          app={app}
          selectedApplicantIndex={selectedApplicantIndex}
          onSelectApplicantIndex={(idx) => setSelectedApplicantIndex(idx)}
          updateApplication={updateApplication}
          isEditable={isEditable}
        />
      )}
      {innerTab === "soa" && (
        <SoaPaymentTab
          key={app.id}
          app={app}
          isEditable={isEditable}
          updateApplication={updateApplication}
        />
      )}

      {/* ── Bottom Action Bar ── */}
      <View style={[styles.actionBar, { borderTopColor: isDark ? colors.neutral[700] : colors.neutral[200], backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white, }]}>
        {showCashierBtn ? (
          <Pressable
            style={[
              styles.actionBtnPrimary,
              {
                backgroundColor: (isEditable && (currentRole === "Cashier" || canVerifyCashier))
                  ? (isDark ? colors.brand[500] : colors.brand[700])
                  : (isDark ? '#1E293B' : '#E2E8F0'),
                borderColor: (isEditable && (currentRole === "Cashier" || canVerifyCashier))
                  ? 'transparent'
                  : (isDark ? '#334155' : '#CBD5E1'),
                borderWidth: 1,
              },
              (!isEditable || !(currentRole === "Cashier" || canVerifyCashier)) && styles.actionBtnDisabled,
              Platform.select({
                web: { cursor: (isEditable && (currentRole === "Cashier" || canVerifyCashier)) ? "pointer" : "not-allowed" } as object,
              }),
            ]}
            onPress={() => isEditable && (currentRole === "Cashier" || canVerifyCashier) && setShowCashier(true)}
            disabled={!isEditable || !(currentRole === "Cashier" || canVerifyCashier)}
          >
            <Lucide
              name="credit-card"
              size={15}
              color={(isEditable && (currentRole === "Cashier" || canVerifyCashier)) ? COLORS.neutral.white : (isDark ? '#64748B' : '#94A3B8')}
            />
            <Text
              style={[
                styles.actionBtnPrimaryText,
                { color: (isEditable && (currentRole === "Cashier" || canVerifyCashier)) ? COLORS.neutral.white : (isDark ? '#64748B' : '#94A3B8') },
              ]}
            >
              Cashier Verification
            </Text>
          </Pressable>
        ) : (
          <>
            {(() => {
              const hasIncompleteApplicants = app.applicantsList?.some(a => a.status === 'Incomplete') ?? false;
              const isApproveEnabled = isEditable && canApprove && !hasIncompleteApplicants;

              return (
                <Pressable
                  style={[
                    styles.actionBtnPrimary,
                    {
                      backgroundColor: isApproveEnabled
                        ? (isDark ? '#166534' : '#15803D')
                        : (isDark ? '#1E293B' : '#E2E8F0'),
                      borderColor: isApproveEnabled
                        ? 'transparent'
                        : (isDark ? '#334155' : '#CBD5E1'),
                      borderWidth: 1,
                    },
                    !isApproveEnabled && styles.actionBtnDisabled,
                    Platform.select({
                      web: { cursor: isApproveEnabled ? "pointer" : "not-allowed" } as object,
                    }),
                  ]}
                  onPress={() => {
                    if (!isApproveEnabled) return;
                    const endorseApplicants = app.applicantsList?.filter(a => a.status === 'ForEndorsement') ?? [];
                    if (endorseApplicants.length > 0) {
                      const names = endorseApplicants.map(a => a.name).join(", ");
                      Alert.alert(
                        "Endorsement Required",
                        `Application cannot be directly approved: ${endorseApplicants.length} applicant(s) are marked For Endorsement (${names}). Please use the Endorse action to forward for review.`,
                        [{ text: "OK" }]
                      );
                      return;
                    }
                    setShowApprove(true);
                  }}
                  disabled={!isApproveEnabled}
                >
                  <Text
                    style={[
                      styles.actionBtnPrimaryText,
                      { color: isApproveEnabled ? COLORS.neutral.white : (isDark ? '#64748B' : '#94A3B8') },
                    ]}
                  >
                    Approve
                  </Text>
                </Pressable>
              );
            })()}

            <Pressable
              style={[
                styles.actionBtnOutline,
                {
                  backgroundColor: (isEditable && canDecline)
                    ? (isDark ? colors.neutral[800] : COLORS.neutral.white)
                    : (isDark ? '#1E293B' : '#F8FAFC'),
                  borderColor: (isEditable && canDecline)
                    ? (isDark ? colors.neutral[300] : COLORS.neutral[900])
                    : (isDark ? '#334155' : '#E2E8F0'),
                  borderWidth: 1.5,
                },
                (!isEditable || !canDecline) && styles.actionBtnDisabled,
                Platform.select({
                  web: { cursor: (isEditable && canDecline) ? "pointer" : "not-allowed" } as object,
                }),
              ]}
              onPress={() => isEditable && canDecline && setShowDecline(true)}
              disabled={!isEditable || !canDecline}
            >
              <Text
                style={[
                  styles.actionBtnOutlineText,
                  { color: (isEditable && canDecline) ? (isDark ? colors.neutral[100] : COLORS.neutral[900]) : (isDark ? '#64748B' : '#94A3B8') },
                ]}
              >
                Return
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.actionBtnOutline,
                {
                  backgroundColor: (isEditable && canEndorse)
                    ? (isDark ? colors.neutral[800] : COLORS.neutral.white)
                    : (isDark ? '#1E293B' : '#F8FAFC'),
                  borderColor: (isEditable && canEndorse)
                    ? (isDark ? colors.brand[400] : colors.brand[600])
                    : (isDark ? '#334155' : '#E2E8F0'),
                  borderWidth: 1.5,
                },
                (!isEditable || !canEndorse) && styles.actionBtnDisabled,
                Platform.select({
                  web: { cursor: (isEditable && canEndorse) ? "pointer" : "not-allowed" } as object,
                }),
              ]}
              onPress={() => isEditable && canEndorse && setShowEndorse(true)}
              disabled={!isEditable || !canEndorse}
            >
              <Text
                style={[
                  styles.actionBtnOutlineText,
                  { color: (isEditable && canEndorse) ? (isDark ? colors.brand[400] : colors.brand[600]) : (isDark ? '#64748B' : '#94A3B8') },
                ]}
              >
                Endorse →
              </Text>
            </Pressable>
          </>
        )}
      </View>

      {/* ── Modals ── */}
      <ApproveModal
        visible={showApprove}
        applicantName={app.applicant}
        onConfirm={handleApprove}
        onCancel={() => setShowApprove(false)}
      />
      <DeclineModal
        visible={showDecline}
        applicantName={app.applicant}
        onConfirm={handleDecline}
        onCancel={() => setShowDecline(false)}
      />
      <EndorseModal
        visible={showEndorse}
        applicantName={app.applicant}
        currentRole={currentRole}
        onConfirm={handleEndorse}
        onCancel={() => setShowEndorse(false)}
      />
      <CashierVerificationModal
        visible={showCashier}
        applicantName={app.applicant}
        initialOrNumber={app.payment.orNumber}
        onConfirm={handleCashierVerify}
        onCancel={() => setShowCashier(false)}
      />
    </Animated.View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Empty state
  emptyPanelScroll: {
    flex: 1,
  },
  emptyPanelContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[24],
  },
  summaryCard: {
    borderRadius: RADIUS.card,
    padding: SPACING[16],
    width: "100%",
    maxWidth: 500,
    ...SHADOWS.card,
    marginBottom: SPACING[24],
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[10],
    marginBottom: SPACING[16],
    borderBottomWidth: 1,
    paddingBottom: SPACING[12],
  },
  summaryTitle: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING[20],
    gap: SPACING[6],
  },
  statBox: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 2,
  },
  statValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: "center",
  },
  statLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
    lineHeight: 14,
  },
  guideBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING[10],
    padding: SPACING[12],
    borderRadius: RADIUS.input,
  },
  guideText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    lineHeight: 18,
  },
  actionPrompt: {
    alignItems: "center",
    gap: SPACING[12],
  },
  emptyPanelTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textAlign: "center",
  },
  emptyPanelSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 22,
  },

  // Panel shell
  panel: {
    flex: 1,
    flexDirection: "column",
  },

  // Inner tab bar
  innerTabBarWrapper: {
    borderBottomWidth: 1,
  },
  innerTabBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING[8],
  },
  innerTabScroll: {
    flexGrow: 0,
  },
  innerTabScrollContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING[8],
  },
  innerTabActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: SPACING[8] + SPACING[12],
    paddingRight: SPACING[8] + SPACING[12],
    paddingVertical: SPACING[4],
    borderTopWidth: 1,
  },
  innerTabItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[12],
    gap: 5,
    position: "relative",
  },
  innerTabText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  innerTabTextActive: {
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  innerTabUnderline: {
    position: "absolute",
    bottom: 0,
    left: SPACING[12],
    right: SPACING[12],
    height: 2,
  },
  innerTabSpacer: {
    flex: 1,
  },
  headerActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[12],
    marginRight: SPACING[8],
  },
  headerActionLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[4],
  },
  headerActionLinkText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  headerActionDivider: {
    width: 1,
    height: 14,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: SPACING[4],
  },

  // Read-only banner
  readOnlyBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[8],
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[8],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.semantic.warningBorder,
  },
  readOnlyText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    color: COLORS.semantic.warningText,
  },

  // Tab content
  tabContent: {
    flex: 1,
  },

  // Status block
  statusBlock: {
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[12],
    borderBottomWidth: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusPill: {
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[4],
    borderRadius: RADIUS.circle,
  },
  statusPillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  statusActor: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
  },

  // Info block
  infoBlock: {
    paddingHorizontal: SPACING[16],
  },
  fieldGroupLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingTop: SPACING[12],
    paddingBottom: SPACING[4],
  },

  // Note block
  noteBlock: {
    margin: SPACING[16],
    borderWidth: 1,
    borderRadius: RADIUS.card,
    padding: SPACING[16],
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
    letterSpacing: 0.3,
  },
  noteText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    lineHeight: 22,
  },
  noteInput: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    borderWidth: 1,
    borderRadius: RADIUS.input,
    padding: SPACING[8],
    minHeight: 100,
    lineHeight: 22,
  },
  saveNoteBtn: {
    alignSelf: "flex-end",
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.button,
  },
  saveNoteBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  // Application Details tab
  submittedText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    paddingVertical: SPACING[8],
  },
  permitCategoryText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: 2,
  },
  formTypeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    paddingBottom: SPACING[12],
  },
  formCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: SPACING[12],
    borderBottomWidth: 1,
    borderLeftWidth: 3,
    paddingLeft: SPACING[12],
    marginBottom: SPACING[8],
    borderRadius: RADIUS.input,
    ...SHADOWS.card,
  },
  formCardLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING[8],
    flex: 1,
  },
  formDocIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.input,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  formDocLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.overline,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  formDocName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginTop: 2,
    marginBottom: 4,
  },
  formActions: {
    flexDirection: "row",
    gap: SPACING[12],
  },
  formActionLink: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  formBtnGroup: {
    flexDirection: "row",
    gap: SPACING[8],
    alignItems: "center",
  },
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.button,
  },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.button,
  },
  downloadBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
  },

  // Requirements tab
  reqItem: {
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[16],
    borderBottomWidth: 1,
  },
  reqLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: 4,
  },
  reqNote: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    fontStyle: "italic",
    marginBottom: SPACING[8],
    lineHeight: 18,
  },
  reqFileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[8],
    marginBottom: SPACING[8],
  },
  reqFilename: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    flex: 1,
  },
  reqViewLink: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  reqThumbnail: {
    width: 150,
    height: 100,
    borderRadius: RADIUS.card,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyReqs: {
    alignItems: "center",
    paddingVertical: SPACING[48],
    gap: SPACING[8],
  },
  emptyReqsText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
  },

  // SOA & Payment tab
  billingContainer: {
    margin: SPACING[16],
    borderWidth: 1,
    borderRadius: RADIUS.card,
    padding: SPACING[16],
    ...SHADOWS.card,
  },
  billingLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: SPACING[4],
  },
  billingTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.pageTitle,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: 4,
  },
  billingSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    marginBottom: SPACING[16],
    lineHeight: 20,
  },

  // Fee table
  feeTable: {
    borderWidth: 1,
    borderRadius: RADIUS.input,
    overflow: "hidden",
    marginBottom: SPACING[16],
  },
  feeTableHeader: {
    flexDirection: "row",
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
  },
  feeTableHeaderCell: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  feeTableDivider: {
    height: 1,
  },
  feeTableRow: {
    flexDirection: "row",
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[12],
    borderTopWidth: 1,
    alignItems: "flex-start",
  },
  feeParticularName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  feeParticularSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    marginTop: 2,
  },
  feeTableCell: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    textAlign: "right",
    paddingTop: 2,
  },

  // Total box
  totalBox: {
    borderWidth: 1,
    borderRadius: RADIUS.card,
    padding: SPACING[16],
    marginBottom: SPACING[8],
  },
  totalRight: {
    alignItems: "flex-end",
  },
  totalLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  totalAmount: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 32,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: 4,
  },
  totalWords: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    fontStyle: "italic",
    marginBottom: SPACING[8],
    textAlign: "right",
  },
  totalDueDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[8],
    marginBottom: SPACING[4],
  },
  totalDueDateLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
  },
  totalDueDate: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  editLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  inlineEditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[8],
    marginTop: 4,
  },
  inlineEditInput: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    borderWidth: 1,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[4],
    minWidth: 120,
  },
  inlineEditSave: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  // Payment section
  paymentSection: {
    marginHorizontal: SPACING[16],
    marginBottom: SPACING[16],
    borderWidth: 1,
    borderRadius: RADIUS.card,
    padding: SPACING[16],
    ...SHADOWS.card,
  },
  paymentSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[8],
    marginBottom: SPACING[16],
  },
  paymentSectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentSectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  paymentRow: {
    flexDirection: "row",
    gap: SPACING[16],
  },
  amountReceivedCard: {
    padding: SPACING[24],
    borderRadius: RADIUS.card,
    width: 220,
    gap: SPACING[12],
  },
  amountReceivedLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.overline,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "rgba(255,255,255,0.7)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  amountReceivedValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 32,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  excessBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "flex-start",
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[4],
    borderRadius: RADIUS.circle,
  },
  excessBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  paymentMethodBlock: {
    marginTop: SPACING[4],
  },
  paymentMethodLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "rgba(255,255,255,0.6)",
    textTransform: "uppercase",
  },
  paymentMethodValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: "capitalize",
  },
  orColumn: {
    flex: 1,
    justifyContent: "flex-start",
  },
  orLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.overline,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: SPACING[8],
  },
  orValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[8],
  },
  orValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  orEditBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[4],
    borderRadius: RADIUS.circle,
    borderWidth: 1,
  },
  orEditText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.3,
  },

  checkInfoText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    marginTop: 2,
  },

  // History / Audit trail
  historyList: {
    marginHorizontal: SPACING[16],
    marginBottom: SPACING[24],
    paddingTop: SPACING[8],
  },
  historyItem: {
    flexDirection: "row",
    minHeight: 60,
  },
  historyLeft: {
    width: 24,
    alignItems: "center",
  },
  historyLine: {
    position: "absolute",
    top: 20,
    bottom: 0,
    width: 2,
  },
  historyCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
    zIndex: 1,
  },
  historyCircleActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: -1,
  },
  historyRight: {
    flex: 1,
    paddingLeft: SPACING[16],
    paddingBottom: SPACING[20],
  },
  historyAction: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  historyStaff: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    marginTop: 2,
  },
  historyDate: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    marginTop: 2,
  },
  historyEmpty: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    paddingVertical: SPACING[12],
    textAlign: "center",
  },

  auditHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: SPACING[16],
    paddingVertical: SPACING[12],
    borderTopWidth: 1,
  },
  auditHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[8],
  },
  auditTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  auditList: {
    marginHorizontal: SPACING[16],
    marginBottom: SPACING[16],
  },
  auditEmpty: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    paddingVertical: SPACING[12],
  },
  auditEntry: {
    paddingVertical: SPACING[8],
    borderBottomWidth: 1,
  },
  auditDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    lineHeight: 20,
  },
  auditMeta: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    marginTop: 4,
  },

  // Bottom action bar
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING[12],
    paddingVertical: SPACING[12],
    paddingHorizontal: SPACING[16],
    borderTopWidth: 1,
    ...SHADOWS.card,
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING[8],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.button,
    minWidth: 140,
    maxWidth: 180,
  },
  actionBtnPrimaryText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  actionBtnOutline: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.button,
    borderWidth: 1.5,
    minWidth: 140,
    maxWidth: 180,
  },
  actionBtnOutlineText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  actionBtnDisabled: {
    opacity: 0.45,
  },
  actionBtnDisabledText: {
  },

  // Bulk Roster & Applicant Selector
  applicantSelectorBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[10],
    marginHorizontal: SPACING[16],
    marginTop: SPACING[12],
    borderRadius: RADIUS.card,
    borderWidth: 1,
  },
  selectorNavBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[4],
    borderRadius: RADIUS.button,
  },
  selectorNavBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  selectorCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[6],
  },
  selectorTitleText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
  },
  selectorNameText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  bulkHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
  },
  bulkItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[10],
    borderBottomWidth: 1,
  },
  bulkCellHeader: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: "uppercase",
  },
  bulkCellText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
  },
  inspectBtn: {
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[4],
    borderRadius: RADIUS.button,
  },
  inspectBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  // Dense Applicants Summary Table
  denseTableContainer: {
    marginHorizontal: SPACING[16],
    marginVertical: SPACING[8],
    borderRadius: RADIUS.card,
    borderWidth: 1,
    overflow: "hidden",
  },
  denseTableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[10],
    borderBottomWidth: 1,
  },
  denseHeaderCell: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  denseTableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[10],
    borderBottomWidth: 1,
  },
  denseRowIndex: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  denseRowName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  denseRowSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    marginTop: 1,
  },
  denseRowType: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
  },
  denseRowRemarks: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
  },

  // Expanded applicant card styles
  applicantExpandedCard: {
    marginHorizontal: SPACING[12],
    marginVertical: SPACING[8],
    padding: SPACING[12],
    borderRadius: RADIUS.card,
    borderWidth: 1,
  },
  expandedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[8],
    marginBottom: SPACING[8],
    paddingBottom: SPACING[6],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  expandedTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  expandedGrid: {
    gap: 2,
  },
  expandedSubTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: 4,
  },
  miniStatusBadge: {
    paddingHorizontal: SPACING[6],
    paddingVertical: 2,
    borderRadius: RADIUS.button,
  },
  miniStatusText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  evaluatorControlBox: {
    marginTop: SPACING[12],
    padding: SPACING[10],
    borderRadius: RADIUS.input,
    borderWidth: 1,
  },
  evalStatusBtn: {
    paddingHorizontal: SPACING[10],
    paddingVertical: SPACING[6],
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: "transparent",
  },
  evalStatusBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  remarksInput: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    borderWidth: 1,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[10],
    paddingVertical: SPACING[6],
    marginTop: SPACING[4],
  },
  evaluatorControlBoxSticky: {
    paddingHorizontal: SPACING[16],
    paddingTop: SPACING[12],
    paddingBottom: SPACING[10],
    borderTopWidth: 1,
    zIndex: 10,
  },
  evalAccentStripe: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  evalDockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
  },
  evalDockLeft: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  evalDockRight: {
    flex: 1,
  },
  evalDockDivider: {
    width: 1,
    alignSelf: 'stretch',
    marginVertical: SPACING[4],
  },
  evalDockLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.8,
    marginBottom: SPACING[4],
    textTransform: 'uppercase' as const,
    textAlign: 'center' as const,
  },
  evalChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap' as const,
    justifyContent: 'center' as const,
    gap: SPACING[4],
  },
  evalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[4],
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[4],
    borderRadius: 20,
    borderWidth: 1,
  },
  evalChipText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
  },
  remarksInputCompact: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    borderWidth: 1,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[10],
    paddingVertical: SPACING[6],
    minHeight: 44,
    textAlignVertical: 'top' as const,
  },

  // Master-Detail Split Workspace styles
  masterDetailWrapper: {
    flexDirection: "row",
    gap: SPACING[12],
    marginHorizontal: SPACING[16],
    marginVertical: SPACING[8],
    minHeight: 480,
  },
  rosterSidebarContainer: {
    width: 260,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    overflow: "hidden",
  },
  rosterSidebarHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[6],
    paddingHorizontal: SPACING[10],
    paddingVertical: SPACING[8],
    borderBottomWidth: 1,
  },
  rosterSidebarTitleText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  rosterCardItem: {
    paddingHorizontal: SPACING[10],
    paddingVertical: SPACING[8],
    borderBottomWidth: 1,
  },
  rosterCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[6],
  },
  rosterCardIndex: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  rosterCardName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    flex: 1,
  },
  rosterCardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  rosterCardSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
  },
  focusWorkspacePane: {
    flex: 1,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    overflow: "hidden",
  },
  focusNavHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    borderBottomWidth: 1,
  },
  focusNavBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[4],
  },
  focusNavBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  focusNavTitleBox: {
    alignItems: "center",
  },
  focusNavSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
  },
  focusNavTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
