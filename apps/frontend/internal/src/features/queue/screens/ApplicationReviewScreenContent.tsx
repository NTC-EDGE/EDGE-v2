import React, { useState, useRef, useEffect } from "react";
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
} from "@edge/ui";
import {
  ApplicationData,
  ApplicationFormAttachment,
} from "../../../types/application";
import { useRole } from "../../shell/context/RoleContext";
import { usePermissions } from "../../shell/context/PermissionContext";
import { ApproveModal } from "../components/modals/ApproveModal";
import { DeclineModal } from "../components/modals/DeclineModal";
import { EndorseModal } from "../components/modals/EndorseModal";
import { CashierVerificationModal } from "../components/modals/CashierVerificationModal";
import { UserRole } from "../../shell/context/RoleContext";
import { useApplications } from "../context/ApplicationContext";

type InnerTab = "basic" | "details" | "requirements" | "soa";

const INNER_TABS: {
  key: InnerTab;
  label: string;
  icon: "user" | "clipboard" | "list" | "credit-card";
}[] = [
    { key: "basic", label: "Basic Informations", icon: "user" },
    { key: "details", label: "Application Records", icon: "clipboard" },
    { key: "requirements", label: "Requirements", icon: "list" },
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
}
function SectionHeader({ title }: SectionHeaderProps) {
  const { colors, isDark } = useTheme();
  return (
    <View style={[sectionStyles.header, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], }]}>
      <Text style={[sectionStyles.title, { color: isDark ? colors.neutral[400] : colors.neutral[500], }]}>{title}</Text>
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
}
function InfoRow({
  label,
  value,
  onEdit,
  isEditing,
  editValue,
  onEditChange,
  onEditDone,
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
            autoFocus
          />
          <Pressable style={[infoStyles.saveBtn, { backgroundColor: isDark ? colors.brand[500] : colors.brand[700], }]} onPress={onEditDone}>
            <Text style={[infoStyles.saveBtnText, { color: isDark ? colors.neutral[800] : COLORS.neutral.white, }]}>Save</Text>
          </Pressable>
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

function BasicInfoTab({
  app,
  isEditable,
  updateApplication,
  selectedApplicantIndex,
  onInspectApplicant,
}: {
  app: ApplicationData;
  isEditable: boolean;
  updateApplication: (id: string, patch: Partial<ApplicationData>) => void;
  selectedApplicantIndex?: number;
  onInspectApplicant?: (index: number) => void;
}) {
  const { colors, isDark } = useTheme();
  const [editingRef, setEditingRef] = useState(false);
  const [editingPermit, setEditingPermit] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [editingLastName, setEditingLastName] = useState(false);
  const [editingFirstName, setEditingFirstName] = useState(false);
  const [editingMiddleName, setEditingMiddleName] = useState(false);
  const [editingDob, setEditingDob] = useState(false);
  const [refDraft, setRefDraft] = useState(app.referenceNumber);
  const [permitDraft, setPermitDraft] = useState(app.permitNumber);
  const [noteDraft, setNoteDraft] = useState(app.note);
  const [lnDraft, setLnDraft] = useState(app.basicInfo.lastName);
  const [fnDraft, setFnDraft] = useState(app.basicInfo.firstName);
  const [mnDraft, setMnDraft] = useState(app.basicInfo.middleName);
  const [dobDraft, setDobDraft] = useState(app.basicInfo.dob);
  const [expandedApplicantIndex, setExpandedApplicantIndex] = useState<number | null>(null);

  const statusStyle = getStatusStyle(app.status);

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Status */}
      <View style={[styles.statusBlock, { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100], }]}>
        <View style={styles.statusRow}>
          <View
            style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}
          >
            <Text style={[styles.statusPillText, { color: statusStyle.text }]}>
              {app.status.toLowerCase() === "submitted" ? "FOR EVALUATION" : app.status.toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.statusActor, { color: isDark ? colors.neutral[500] : colors.neutral[400], }]}>by ADMIN EDGE</Text>
        </View>
      </View>

      <View style={styles.infoBlock}>
        <Text style={[styles.fieldGroupLabel, { color: isDark ? colors.neutral[500] : colors.neutral[400], }]}>REFERENCE NUMBER</Text>
        <InfoRow
          label="Reference Number:"
          value={app.referenceNumber}
          onEdit={
            isEditable
              ? () => {
                setRefDraft(app.referenceNumber);
                setEditingRef(true);
              }
              : undefined
          }
          isEditing={editingRef}
          editValue={refDraft}
          onEditChange={setRefDraft}
          onEditDone={() => {
            setEditingRef(false);
            updateApplication(app.id, { referenceNumber: refDraft });
          }}
        />

        <Text style={[styles.fieldGroupLabel, { marginTop: SPACING[12], color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>
          DOCUMENT NUMBER
        </Text>
        <InfoRow
          label="Permit Number:"
          value={app.permitNumber}
          onEdit={
            isEditable
              ? () => {
                setPermitDraft(app.permitNumber);
                setEditingPermit(true);
              }
              : undefined
          }
          isEditing={editingPermit}
          editValue={permitDraft}
          onEditChange={setPermitDraft}
          onEditDone={() => {
            setEditingPermit(false);
            updateApplication(app.id, { permitNumber: permitDraft });
          }}
        />
      </View>

      {app.applicationType === 'BULK' && app.applicantsList && app.applicantsList.length > 0 ? (
        <>
          {app.filingUser && (
            <>
              <SectionHeader title="FILING ENTITY & SUBMITTER DETAILS" />
              <View style={styles.infoBlock}>
                <InfoRow label="Submitted By:" value={app.filingUser.name} />
                <InfoRow label="User Email:" value={app.filingUser.email} />
                <InfoRow label="User Account Type:" value={app.filingUser.accountType} />
              </View>
            </>
          )}

          {(app.companyDetails !== undefined || app.filingUser?.company !== undefined || app.applicantType === 'Company') && (
            <>
              <SectionHeader title="APPLICANT COMPANY DETAILS" />
              <View style={styles.infoBlock}>
                <InfoRow label="Company Name:" value={app.companyDetails?.name ?? app.filingUser?.company?.name ?? app.applicant} />
                <InfoRow label="Registration No:" value={app.companyDetails?.registrationNumber ?? app.filingUser?.company?.registrationNumber ?? "—"} />
                <InfoRow label="Company Address:" value={app.companyDetails?.address ?? app.filingUser?.company?.address ?? app.address.barangay} />
                <InfoRow label="Contact Number:" value={app.companyDetails?.contactNumber ?? app.filingUser?.company?.contactNumber ?? app.contactDetails.contactNumber ?? "—"} />
                <InfoRow label="Email Address:" value={app.companyDetails?.email ?? app.filingUser?.company?.email ?? app.contactDetails.email ?? "—"} />
              </View>
            </>
          )}

          <SectionHeader title={`APPLICANTS BATCH WORKSPACE (${app.applicantsList.length} APPLICANTS)`} />
          <View style={styles.masterDetailWrapper}>
            {/* Left Sidebar: Applicant Cards List */}
            <View style={[styles.rosterSidebarContainer, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50], borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
              <View style={[styles.rosterSidebarHeader, { borderBottomColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
                <Lucide name="users" size={14} color={isDark ? colors.brand[400] : colors.brand[700]} />
                <Text style={[styles.rosterSidebarTitleText, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
                  Applicants List ({app.applicantsList.length})
                </Text>
              </View>

              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {app.applicantsList.map((item, idx) => {
                  const isSelected = (selectedApplicantIndex ?? 0) === idx;
                  return (
                    <Pressable
                      key={item.id || idx}
                      style={[
                        styles.rosterCardItem,
                        { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[200] },
                        isSelected && { backgroundColor: isDark ? colors.brand[900] : colors.brand[50], borderLeftWidth: 4, borderLeftColor: colors.brand[500] }
                      ]}
                      onPress={() => onInspectApplicant?.(idx)}
                    >
                      <View style={styles.rosterCardTop}>
                        <Text style={[styles.rosterCardIndex, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>#{idx + 1}</Text>
                        <Text style={[styles.rosterCardName, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]} numberOfLines={1}>
                          {item.name}
                        </Text>
                      </View>
                      <View style={styles.rosterCardBottom}>
                        <Text style={[styles.rosterCardSub, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                          {item.applicantType}
                        </Text>
                        {item.status === 'Incomplete' ? (
                          <View style={[styles.miniStatusBadge, { backgroundColor: '#FEE2E2' }]}>
                            <Text style={[styles.miniStatusText, { color: '#991B1B' }]}>INCOMPLETE</Text>
                          </View>
                        ) : item.status === 'ForEndorsement' ? (
                          <View style={[styles.miniStatusBadge, { backgroundColor: '#F3E8FF' }]}>
                            <Text style={[styles.miniStatusText, { color: '#6B21A8' }]}>FOR ENDORSEMENT</Text>
                          </View>
                        ) : (
                          <View style={[styles.miniStatusBadge, { backgroundColor: '#DCFCE7' }]}>
                            <Text style={[styles.miniStatusText, { color: '#166534' }]}>COMPLETE</Text>
                          </View>
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Right Pane: Active Applicant Focus Workspace */}
            {(() => {
              const activeIdx = Math.min(selectedApplicantIndex ?? 0, app.applicantsList.length - 1);
              const activeApplicant = app.applicantsList[activeIdx] || app.applicantsList[0];
              const bi = activeApplicant.basicInfo;

              return (
                <View style={[styles.focusWorkspacePane, { backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white, borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
                  {/* Focus Header Nav Bar */}
                  <View style={[styles.focusNavHeader, { borderBottomColor: isDark ? colors.neutral[700] : colors.neutral[200], backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
                    <Pressable
                      disabled={activeIdx === 0}
                      onPress={() => onInspectApplicant?.(Math.max(0, activeIdx - 1))}
                      style={[styles.focusNavBtn, activeIdx === 0 && { opacity: 0.3 }]}
                    >
                      <Lucide name="chevron-left" size={14} color={isDark ? colors.brand[400] : colors.brand[800]} />
                      <Text style={[styles.focusNavBtnText, { color: isDark ? colors.brand[400] : colors.brand[800] }]}>Previous</Text>
                    </Pressable>

                    <View style={styles.focusNavTitleBox}>
                      <Text style={[styles.focusNavSub, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                        Applicant {activeIdx + 1} of {app.applicantsList.length}:
                      </Text>
                      <Text style={[styles.focusNavTitle, { color: isDark ? colors.brand[300] : colors.brand[900] }]}>
                        {activeApplicant.name}
                      </Text>
                    </View>

                    <Pressable
                      disabled={activeIdx >= ((app.applicantsList?.length ?? 0) - 1)}
                      onPress={() => onInspectApplicant?.(Math.min((app.applicantsList?.length ?? 0) - 1, activeIdx + 1))}
                      style={[styles.focusNavBtn, activeIdx >= ((app.applicantsList?.length ?? 0) - 1) && { opacity: 0.3 }]}
                    >
                      <Text style={[styles.focusNavBtnText, { color: isDark ? colors.brand[400] : colors.brand[800] }]}>Next</Text>
                      <Lucide name="chevron-right" size={14} color={isDark ? colors.brand[400] : colors.brand[800]} />
                    </Pressable>
                  </View>

                  <ScrollView style={{ flex: 1, padding: SPACING[12] }} showsVerticalScrollIndicator={false}>
                    {/* Evaluator Verification & Remarks Controls */}
                    <View style={[styles.evaluatorControlBox, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50], borderColor: isDark ? colors.neutral[700] : colors.neutral[200], marginBottom: SPACING[12] }]}>
                      <Text style={[styles.expandedSubTitle, { color: isDark ? colors.neutral[200] : colors.neutral[800] }]}>
                        Evaluator Verdict & Remarks for {activeApplicant.name}:
                      </Text>
                      <View style={{ flexDirection: 'row', gap: SPACING[8], marginVertical: SPACING[8] }}>
                        <Pressable
                          style={[
                            styles.evalStatusBtn,
                            (activeApplicant.status === 'Complete' || !activeApplicant.status) && { backgroundColor: isDark ? '#14532D' : '#DCFCE7', borderColor: '#166534' }
                          ]}
                          onPress={() => {
                            const updated = [...app.applicantsList!];
                            updated[activeIdx] = { ...updated[activeIdx], status: 'Complete' };
                            updateApplication(app.id, { applicantsList: updated });
                          }}
                        >
                          <Text style={[styles.evalStatusBtnText, { color: (activeApplicant.status === 'Complete' || !activeApplicant.status) ? '#166534' : colors.neutral[500] }]}>
                            ✓ Complete
                          </Text>
                        </Pressable>

                        <Pressable
                          style={[
                            styles.evalStatusBtn,
                            activeApplicant.status === 'Incomplete' && { backgroundColor: isDark ? '#7F1D1D' : '#FEE2E2', borderColor: '#991B1B' }
                          ]}
                          onPress={() => {
                            const updated = [...app.applicantsList!];
                            updated[activeIdx] = { ...updated[activeIdx], status: 'Incomplete' };
                            updateApplication(app.id, { applicantsList: updated });
                          }}
                        >
                          <Text style={[styles.evalStatusBtnText, { color: activeApplicant.status === 'Incomplete' ? '#991B1B' : colors.neutral[500] }]}>
                            ✕ Incomplete
                          </Text>
                        </Pressable>

                        <Pressable
                          style={[
                            styles.evalStatusBtn,
                            activeApplicant.status === 'ForEndorsement' && { backgroundColor: isDark ? '#581C87' : '#F3E8FF', borderColor: '#6B21A8' }
                          ]}
                          onPress={() => {
                            const updated = [...app.applicantsList!];
                            updated[activeIdx] = { ...updated[activeIdx], status: 'ForEndorsement' };
                            updateApplication(app.id, { applicantsList: updated });
                          }}
                        >
                          <Text style={[styles.evalStatusBtnText, { color: activeApplicant.status === 'ForEndorsement' ? '#6B21A8' : colors.neutral[500] }]}>
                            ⚡ For Endorsement
                          </Text>
                        </Pressable>
                      </View>

                      <TextInput
                        style={[styles.remarksInput, { color: isDark ? colors.neutral[100] : colors.neutral[900], backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral.white, borderColor: isDark ? colors.neutral[700] : colors.neutral[300] }]}
                        placeholder="Enter evaluation remarks for this applicant..."
                        placeholderTextColor={isDark ? colors.neutral[500] : colors.neutral[400]}
                        value={activeApplicant.evaluationRemarks ?? ''}
                        onChangeText={(text) => {
                          const updated = [...app.applicantsList!];
                          updated[activeIdx] = { ...updated[activeIdx], evaluationRemarks: text };
                          updateApplication(app.id, { applicantsList: updated });
                        }}
                      />
                    </View>

                    {/* View Full Application Records Button */}
                    <View style={{ marginBottom: SPACING[12], alignItems: 'flex-end' }}>
                      <Pressable
                        style={[styles.inspectBtn, { backgroundColor: isDark ? colors.brand[600] : colors.brand[700], paddingHorizontal: 12, paddingVertical: 8 }]}
                        onPress={() => {
                          onInspectApplicant?.(activeIdx);
                        }}
                      >
                        <Text style={[styles.inspectBtnText, { color: COLORS.neutral.white }]}>
                          View Full Application Records for {activeApplicant.name} ►
                        </Text>
                      </Pressable>
                    </View>

                    {/* Section 1: Personal & Account Profile */}
                    <Text style={[styles.expandedSubTitle, { color: isDark ? colors.neutral[300] : colors.neutral[700], marginTop: 4 }]}>
                      1. Personal Profile & Account Info
                    </Text>
                    <View style={styles.infoBlock}>
                      <InfoRow label="Full Name:" value={activeApplicant.name} />
                      <InfoRow label="Applicant Type:" value={activeApplicant.applicantType} />
                      <InfoRow label="Contact Number:" value={activeApplicant.contactNumber || '—'} />
                      <InfoRow label="Email Address:" value={activeApplicant.email || '—'} />
                      <InfoRow label="Address / Barangay:" value={activeApplicant.address || '—'} />
                      {activeApplicant.zipCode ? <InfoRow label="Zip Code:" value={activeApplicant.zipCode} /> : null}
                      {bi ? (
                        <>
                          {bi.dob ? <InfoRow label="Date of Birth:" value={bi.dob} /> : null}
                          {bi.sex ? <InfoRow label="Sex:" value={bi.sex} /> : null}
                          {bi.nationality ? <InfoRow label="Nationality:" value={bi.nationality} /> : null}
                          {bi.height > 0 ? <InfoRow label="Height:" value={`${bi.height} cm`} /> : null}
                          {bi.weight > 0 ? <InfoRow label="Weight:" value={`${bi.weight} kg`} /> : null}
                        </>
                      ) : null}
                    </View>

                    {/* Section 2: Completed Service Form Responses */}
                    {activeApplicant.formFields && activeApplicant.formFields.length > 0 && (
                      <View style={{ marginTop: SPACING[12] }}>
                        <Text style={[styles.expandedSubTitle, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
                          2. Completed Service Form Field Values
                        </Text>
                        <View style={styles.infoBlock}>
                          {activeApplicant.formFields.map(ff => (
                            <InfoRow key={ff.fieldId} label={`${ff.fieldLabel}:`} value={ff.value || '—'} />
                          ))}
                        </View>
                      </View>
                    )}
                  </ScrollView>
                </View>
              );
            })()}
          </View>
        </>
      ) : app.filingUser?.accountType === 'Company' ? (
        <>
          <SectionHeader title="FILING USER / SUBMITTER DETAILS" />
          <View style={styles.infoBlock}>
            <InfoRow label="Submitted By:" value={app.filingUser.name} />
            <InfoRow label="User Email:" value={app.filingUser.email} />
            <InfoRow label="User Account Type:" value={app.filingUser.accountType} />
            {app.filingUser.company && (
              <>
                <InfoRow label="Filing Company Name:" value={app.filingUser.company.name} />
                <InfoRow label="Filing Company Reg No:" value={app.filingUser.company.registrationNumber} />
                <InfoRow label="Filing Company Address:" value={app.filingUser.company.address} />
              </>
            )}
          </View>

          <SectionHeader title="APPLICANT / PERMIT HOLDER DETAILS" />
          <View style={styles.infoBlock}>
            <InfoRow label="Applicant Name:" value={app.applicant} />
            <InfoRow label="Applicant Type:" value={app.applicantType} />
            <InfoRow label="Barangay:" value={app.address.barangay} />
            <InfoRow label="Province:" value={app.address.province} />
            <InfoRow label="City/Municipality:" value={app.address.city} />
            <InfoRow label="Zip Code:" value={app.address.zipCode} />
          </View>
        </>
      ) : (
        <>
          <SectionHeader title="APPLICANT & ACCOUNT INFORMATION" />
          <View style={styles.infoBlock}>
            <InfoRow label="Filing User / Applicant:" value={app.applicant} />
            <InfoRow label="Account Type:" value="Individual" />
            <InfoRow label="Email Address:" value={app.contactDetails.email} />
            <InfoRow label="Barangay:" value={app.address.barangay} />
            <InfoRow label="Province:" value={app.address.province} />
            <InfoRow label="City/Municipality:" value={app.address.city} />
            <InfoRow label="Zip Code:" value={app.address.zipCode} />
          </View>
        </>
      )}

      {!(app.applicationType === 'BULK' && app.applicantsList && app.applicantsList.length > 1) && (
        <>
          {(app.applicantType === "Company" || app.companyDetails !== undefined) && (
            <>
              <SectionHeader title="APPLICANT COMPANY DETAILS" />
              <View style={styles.infoBlock}>
                <InfoRow label="Company Name:" value={app.companyDetails?.name ?? app.applicant} />
                <InfoRow label="Registration No:" value={app.companyDetails?.registrationNumber ?? ""} />
                <InfoRow label="Company Address:" value={app.companyDetails?.address ?? app.address.barangay} />
                <InfoRow label="Contact Number:" value={app.companyDetails?.contactNumber ?? app.contactDetails.contactNumber} />
                <InfoRow label="Email Address:" value={app.companyDetails?.email ?? app.contactDetails.email} />
              </View>
            </>
          )}

          <SectionHeader title="BASIC INFORMATION" />
          <View style={styles.infoBlock}>
            <InfoRow
              label="Last Name:"
              value={app.basicInfo.lastName}
              onEdit={
                isEditable
                  ? () => {
                    setLnDraft(app.basicInfo.lastName);
                    setEditingLastName(true);
                  }
                  : undefined
              }
              isEditing={editingLastName}
              editValue={lnDraft}
              onEditChange={setLnDraft}
              onEditDone={() => {
                setEditingLastName(false);
                updateApplication(app.id, {
                  basicInfo: { ...app.basicInfo, lastName: lnDraft },
                });
              }}
            />
            <InfoRow
              label="First Name:"
              value={app.basicInfo.firstName}
              onEdit={
                isEditable
                  ? () => {
                    setFnDraft(app.basicInfo.firstName);
                    setEditingFirstName(true);
                  }
                  : undefined
              }
              isEditing={editingFirstName}
              editValue={fnDraft}
              onEditChange={setFnDraft}
              onEditDone={() => {
                setEditingFirstName(false);
                updateApplication(app.id, {
                  basicInfo: { ...app.basicInfo, firstName: fnDraft },
                });
              }}
            />
            <InfoRow
              label="Middle Name:"
              value={app.basicInfo.middleName}
              onEdit={
                isEditable
                  ? () => {
                    setMnDraft(app.basicInfo.middleName);
                    setEditingMiddleName(true);
                  }
                  : undefined
              }
              isEditing={editingMiddleName}
              editValue={mnDraft}
              onEditChange={setMnDraft}
              onEditDone={() => {
                setEditingMiddleName(false);
                updateApplication(app.id, {
                  basicInfo: { ...app.basicInfo, middleName: mnDraft },
                });
              }}
            />
            <InfoRow label="Extension Name:" value={app.basicInfo.extensionName} />
            <InfoRow label="Place Of Birth:" value={app.basicInfo.placeOfBirth} />
            <InfoRow
              label="Date Of Birth:"
              value={app.basicInfo.dob}
              onEdit={
                isEditable
                  ? () => {
                    setDobDraft(app.basicInfo.dob);
                    setEditingDob(true);
                  }
                  : undefined
              }
              isEditing={editingDob}
              editValue={dobDraft}
              onEditChange={setDobDraft}
              onEditDone={() => {
                setEditingDob(false);
                updateApplication(app.id, {
                  basicInfo: { ...app.basicInfo, dob: dobDraft },
                });
              }}
            />
            <InfoRow label="Sex:" value={app.basicInfo.sex} />
            <InfoRow label="Weight:" value={String(app.basicInfo.weight)} />
            <InfoRow label="Height:" value={String(app.basicInfo.height)} />
            <InfoRow label="Nationality:" value={app.basicInfo.nationality} />
          </View>

          <SectionHeader title="EMPLOYMENT" />
          <View style={styles.infoBlock}>
            <InfoRow label="Status:" value={app.basicInfo.employmentStatus} />
          </View>
        </>
      )}

      {/* NOTE */}
      <View style={[styles.noteBlock, { borderColor: isDark ? colors.neutral[700] : colors.neutral[200], }]}>
        <View style={styles.noteHeader}>
          <Text style={[styles.fieldGroupLabel, { color: isDark ? colors.neutral[500] : colors.neutral[400], }]}>NOTE</Text>
          {isEditable && !editingNote && (
            <Pressable
              onPress={() => {
                setNoteDraft(app.note);
                setEditingNote(true);
              }}
            >
              <Text style={[styles.editLinkBlue, { color: isDark ? colors.brand[500] : colors.brand[700], }]}>EDIT</Text>
            </Pressable>
          )}
        </View>
        {editingNote ? (
          <View style={{ gap: SPACING[8] }}>
            <TextInput
              style={[styles.noteInput, { color: isDark ? colors.neutral[100] : colors.neutral[900], backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50], borderColor: isDark ? colors.brand[500] : colors.brand[500], }]}
              multiline
              value={noteDraft}
              onChangeText={setNoteDraft}
              textAlignVertical="top"
              autoFocus
            />
            <Pressable
              style={[styles.saveNoteBtn, { backgroundColor: isDark ? colors.brand[500] : colors.brand[700], }]}
              onPress={() => {
                setEditingNote(false);
                updateApplication(app.id, { note: noteDraft });
              }}
            >
              <Text style={[styles.saveNoteBtnText, { color: isDark ? colors.neutral[800] : COLORS.neutral.white, }]}>Save Note</Text>
            </Pressable>
          </View>
        ) : (
          <Text style={[styles.noteText, { color: isDark ? colors.neutral[300] : colors.neutral[600], }]}>{app.note}</Text>
        )}
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

function ApplicationDetailsTab({ app }: { app: ApplicationData }) {
  const { colors, isDark } = useTheme();
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

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Application Form section */}
      <SectionHeader title="APPLICATION FORM" />
      <View style={styles.infoBlock}>
        <Text style={[styles.submittedText, { color: isDark ? colors.neutral[500] : colors.neutral[400], }]}>
          {app.applicationDetails.submittedAt}
        </Text>
        <Text style={[styles.permitCategoryText, { color: isDark ? colors.neutral[100] : colors.neutral[900], }]}>{app.permitTitle}</Text>
        <Text style={[styles.formTypeText, { color: isDark ? colors.neutral[400] : colors.neutral[500], }]}>
          {app.applicationDetails.formType}
        </Text>
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

      <View style={{ height: 80 }} />
    </ScrollView>
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

// ─── Main Content Component ──────────────────────────────────────────────────

export interface ApplicationReviewScreenProps {
  onClose: () => void;
  onCollapse?: () => void;
  isCollapsed?: boolean;
}

export function ApplicationReviewScreenContent({
  onClose,
  onCollapse,
  isCollapsed,
}: ApplicationReviewScreenProps) {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isNarrow = width < 900;
  const {
    applications,
    selectedApplication,
    activeQueueTab,
    updateApplication,
    setSelectedId,
  } = useApplications();
  const { currentRole } = useRole();
  const { canApprove, canDecline, canEndorse, canVerifyCashier } =
    usePermissions();

  const [innerTab, setInnerTab] = useState<InnerTab>("basic");
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

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: isDark ? colors.brand[500] : colors.brand[700], }]}>
                {
                  applications.filter(
                    (a: ApplicationData) =>
                      a.queueTab === "pending" && (a.status === "Evaluating" || a.status === "Submitted"),
                  ).length
                }
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500], }]}>Evaluating</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: isDark ? colors.brand[500] : colors.brand[700], }]}>
                {
                  applications.filter(
                    (a: ApplicationData) =>
                      a.queueTab === "pending" &&
                      a.status === "Approved",
                  ).length
                }
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500], }]}>To Verify</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: isDark ? colors.brand[500] : colors.brand[700], }]}>
                {
                  applications.filter(
                    (a: ApplicationData) =>
                      a.queueTab === "history" && a.status === "Approved",
                  ).length
                }
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500], }]}>Completed</Text>
            </View>
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
            Your active queue contains{" "}
            {
              applications.filter(
                (a: ApplicationData) => a.queueTab === "pending",
              ).length
            }{" "}
            items requiring attention.
          </Text>
        </View>
      </ScrollView>
    );
  }

  const app = selectedApplication;

  const EDITABLE_STATUSES: ReadonlyArray<string> = [
    "For Approval",
    "For Verification",
    "Returned",
  ];

  const isActionableRole = currentRole !== "Admin";

  const isEditable =
    isActionableRole &&
    activeQueueTab === "pending" &&
    EDITABLE_STATUSES.includes(app.status);

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

      {/* ── Applicant Selector Bar for Bulk Applications ── */}
      {app.applicationType === "BULK" && app.applicantsList && app.applicantsList.length > 0 && (innerTab === "details" || innerTab === "requirements") && (
        <View style={[styles.applicantSelectorBar, { backgroundColor: isDark ? colors.neutral[900] : colors.brand[50], borderColor: isDark ? colors.neutral[700] : colors.brand[200] }]}>
          <Pressable
            disabled={selectedApplicantIndex === 0}
            onPress={() => setSelectedApplicantIndex(prev => Math.max(0, prev - 1))}
            style={[styles.selectorNavBtn, selectedApplicantIndex === 0 && { opacity: 0.3 }]}
          >
            <Lucide name="chevron-left" size={14} color={isDark ? colors.brand[400] : colors.brand[800]} />
            <Text style={[styles.selectorNavBtnText, { color: isDark ? colors.brand[400] : colors.brand[800] }]}>Previous</Text>
          </Pressable>

          <View style={styles.selectorCenter}>
            <Lucide name="user" size={14} color={isDark ? colors.brand[400] : colors.brand[800]} />
            <Text style={[styles.selectorTitleText, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
              Viewing Applicant {selectedApplicantIndex + 1} of {app.applicantsList.length}:
            </Text>
            <Text style={[styles.selectorNameText, { color: isDark ? colors.brand[300] : colors.brand[900] }]}>
              {app.applicantsList[selectedApplicantIndex]?.name}
            </Text>
          </View>

          <Pressable
            disabled={selectedApplicantIndex >= app.applicantsList.length - 1}
            onPress={() => setSelectedApplicantIndex(prev => Math.min(app.applicantsList!.length - 1, prev + 1))}
            style={[styles.selectorNavBtn, selectedApplicantIndex >= app.applicantsList.length - 1 && { opacity: 0.3 }]}
          >
            <Text style={[styles.selectorNavBtnText, { color: isDark ? colors.brand[400] : colors.brand[800] }]}>Next</Text>
            <Lucide name="chevron-right" size={14} color={isDark ? colors.brand[400] : colors.brand[800]} />
          </Pressable>
        </View>
      )}

      {/* ── Tab Content ── */}
      {innerTab === "basic" && (
        <BasicInfoTab
          app={app}
          isEditable={isEditable}
          updateApplication={updateApplication}
          selectedApplicantIndex={selectedApplicantIndex}
          onInspectApplicant={(idx) => {
            setSelectedApplicantIndex(idx);
            setInnerTab("details");
          }}
        />
      )}
      {innerTab === "details" && <ApplicationDetailsTab app={app} />}
      {innerTab === "requirements" && <RequirementsTab app={app} />}
      {innerTab === "soa" && (
        <SoaPaymentTab
          app={app}
          isEditable={isEditable}
          updateApplication={updateApplication}
        />
      )}

      {/* ── Bottom Action Bar ── */}
      <View style={[styles.actionBar, { borderTopColor: isDark ? colors.neutral[700] : colors.neutral[200], backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white, }]}>
        {canVerifyCashier ? (
          <Pressable
            style={[
              styles.actionBtnPrimary,
              !isEditable && [styles.actionBtnDisabled, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[100] }],
              Platform.select({
                web: { cursor: isEditable ? "pointer" : "not-allowed" } as object,
              }),
            ]}
            onPress={() => isEditable && setShowCashier(true)}
            disabled={!isEditable}
          >
            <Lucide
              name="credit-card"
              size={15}
              color={isEditable ? COLORS.neutral.white : (isDark ? colors.neutral[500] : COLORS.neutral[400])}
            />
            <Text
              style={[
                styles.actionBtnPrimaryText,
                !isEditable && { color: isDark ? colors.neutral[500] : COLORS.neutral[400] },
              ]}
            >
              Cashier Verification
            </Text>
          </Pressable>
        ) : (
          <>
            <Pressable
              style={[
                styles.actionBtnPrimary,
                (!isEditable || !canApprove) && [styles.actionBtnDisabled, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[100] }],
                Platform.select({
                  web: { cursor: (isEditable && canApprove) ? "pointer" : "not-allowed" } as object,
                }),
              ]}
              onPress={() => {
                if (!isEditable || !canApprove) return;
                const incompleteApplicants = app.applicantsList?.filter(a => a.status === 'Incomplete') ?? [];
                if (incompleteApplicants.length > 0) {
                  const names = incompleteApplicants.map(a => a.name).join(", ");
                  Alert.alert(
                    "Action Blocked — Incomplete Applicants",
                    `Cannot approve application: ${incompleteApplicants.length} applicant(s) are marked as Incomplete (${names}). All applicants must be complete before approval.`,
                    [{ text: "OK" }]
                  );
                  return;
                }
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
              disabled={!isEditable || !canApprove}
            >
              <Text
                style={[
                  styles.actionBtnPrimaryText,
                  (!isEditable || !canApprove) && { color: isDark ? colors.neutral[500] : COLORS.neutral[400] },
                ]}
              >
                Approve
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.actionBtnOutline,
                { borderColor: isDark ? colors.neutral[600] : COLORS.neutral[300] },
                (!isEditable || !canDecline) && [styles.actionBtnDisabled, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[100], borderColor: isDark ? colors.neutral[800] : colors.neutral[200] }],
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
                  { color: isDark ? colors.neutral[200] : COLORS.neutral[700] },
                  (!isEditable || !canDecline) && { color: isDark ? colors.neutral[500] : COLORS.neutral[400] },
                ]}
              >
                Decline
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.actionBtnOutline,
                { borderColor: isDark ? colors.neutral[600] : COLORS.neutral[300] },
                (!isEditable || !canEndorse) && [styles.actionBtnDisabled, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[100], borderColor: isDark ? colors.neutral[800] : colors.neutral[200] }],
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
                  { color: isDark ? colors.neutral[200] : COLORS.neutral[700] },
                  (!isEditable || !canEndorse) && { color: isDark ? colors.neutral[500] : COLORS.neutral[400] },
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
    maxWidth: 200,
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
    maxWidth: 160,
  },
  actionBtnOutlineText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  actionBtnDisabled: {
    opacity: 0.6,
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
