import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
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
  TYPOGRAPHY,
  Icon as Lucide,
  SkeletonLoader,
  toast,
} from "@edge/ui";
import {
  ApplicationData,
  ApplicationFormAttachment,
  ApplicantItem,
} from "../../../types/application";
import { useRole } from "../../shell/context/RoleContext";
import { usePermissions } from "../../shell/context/PermissionContext";
import {
  applicationService,
  storageService,
  ApplicantRequirementItemDto,
  useApplicationFormWithSubmission,
  useAdminApplicationDetails,
  mutateApplications,
} from "@edge/api";
import { mapApplicationDtoToUI } from "../data/applicationMapper";
import { ApproveModal } from "../components/modals/ApproveModal";
import { DeclineModal } from "../components/modals/DeclineModal";
import { EndorseModal } from "../components/modals/EndorseModal";
import { CashierVerificationModal } from "../components/modals/CashierVerificationModal";
import { UserRole } from "../../shell/context/RoleContext";
import { isAllowedRequirementFileType } from "../../../utils/fileValidation";
import { HeroReviewHeader } from "../components/HeroReviewHeader";
import { ApplicantParticularsCard } from "../components/ApplicantParticularsCard";
import { BulkMetricsGrid } from "../components/BulkMetricsGrid";
import {
  SectionCard,
  SummaryRow,
  BaseApplicationPreview,
  DigitalSignatureReviewCard,
} from "../../../shared/formPreview";
import { CustomDocPreviewModal } from "../../../shared/components/CustomDocPreviewModal";
import { DocumentPreviewFile } from "../../../shared/components/DocumentPreviewModal";

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
    const oneVal = ones[num];
    if (num < 20) return (oneVal !== undefined ? oneVal : "") + " ";
    const tenVal = tens[Math.floor(num / 10)];
    if (num < 100)
      return (tenVal !== undefined ? tenVal : "") + " " + toWords(num % 10);
    const hundredVal = ones[Math.floor(num / 100)];
    return (
      (hundredVal !== undefined ? hundredVal : "") + " Hundred " + toWords(num % 100)
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
    <View style={[infoStyles.row, { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
      <Text style={[infoStyles.label, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{label}</Text>
      {isEditing ? (
        <View style={infoStyles.editRow}>
          <TextInput
            style={[infoStyles.editInput, { color: isDark ? colors.neutral[100] : colors.neutral[900], backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50], borderColor: isDark ? colors.brand[500] : colors.brand[500] }]}
            value={editValue}
            onChangeText={onEditChange}
            onBlur={onEditDone}
          />
          {showRowSaveButton && onEditDone && (
            <Pressable style={[infoStyles.saveBtn, { backgroundColor: isDark ? colors.brand[500] : colors.brand[700] }]} onPress={onEditDone}>
              <Text style={[infoStyles.saveBtnText, { color: isDark ? colors.neutral[800] : COLORS.neutral.white }]}>Save</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <View style={infoStyles.valueRow}>
          <Text style={[infoStyles.value, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>{value}</Text>
          {onEdit !== undefined && (
            <Pressable onPress={onEdit}>
              <Text style={[infoStyles.editLink, { color: isDark ? colors.brand[500] : colors.brand[700] }]}>Edit</Text>
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
    flexWrap: 'wrap',
    flexShrink: 1,
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
  onPreviewFile,
}: {
  app: ApplicationData;
  isEditable: boolean;
  updateApplication: (id: string, patch: Partial<ApplicationData>) => void;
  selectedApplicantIndex?: number;
  onSelectApplicantIndex?: (index: number) => void;
  onInspectApplicant?: (index: number) => void;
  onPreviewFile?: (file: DocumentPreviewFile | string, label?: string) => void;
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

  const [editingNote, setEditingNote] = useState(false);
  const [rosterSearch, setRosterSearch] = useState('');

  const [localApplicants, setLocalApplicants] = useState<ApplicantItem[]>(app.applicantsList ?? []);

  useEffect(() => {
    if (app.applicantsList) {
      setLocalApplicants(app.applicantsList);
    }
  }, [app.applicantsList]);

  const activeApplicant = (localApplicants.length > 0)
    ? localApplicants[Math.min(selectedApplicantIndex ?? 0, localApplicants.length - 1)]
    : undefined;

  const isExamService = useMemo(() => {
    const cat = (app.category || '').toLowerCase();
    const title = (app.serviceName || app.permitTitle || '').toLowerCase();
    return cat.includes('exam') || title.includes('exam') || title.includes('admission') || title.includes('operator examination');
  }, [app.category, app.serviceName, app.permitTitle]);

  const appliedServices = useMemo(() => {
    if (app.services && app.services.length > 0) {
      const map = new Map<string, { id?: string; name: string; category?: string; variant?: string }>();
      for (const s of app.services) {
        const name = s.serviceName || app.serviceName || app.permitTitle || `${app.serviceCategory || app.category} Application`;
        const category = s.serviceCategory || app.serviceCategory || app.category || undefined;
        const variant = s.serviceVariantName || app.serviceVariantName || undefined;
        const key = `${s.serviceId ?? ''}-${name}-${variant ?? ''}`;
        if (!map.has(key)) {
          map.set(key, { id: s.id, name, category, variant });
        }
      }
      return Array.from(map.values());
    }
    return [
      {
        name: app.serviceName || app.permitTitle || `${app.serviceCategory || app.category} Application`,
        category: app.serviceCategory || app.category || undefined,
        variant: app.serviceVariantName || undefined,
      },
    ];
  }, [app.services, app.serviceName, app.permitTitle, app.serviceCategory, app.category, app.serviceVariantName]);

  const scheduleSummaryText = useMemo(() => {
    if (app.assignedTo && app.assignedTo.trim().length > 0) {
      return app.assignedTo;
    }
    if (app.office && app.office.trim().length > 0) {
      return `NTC Field Office • ${app.office}`;
    }
    return null;
  }, [app.assignedTo, app.office]);

  const filteredApplicants = useMemo(() => {
    if (!rosterSearch.trim()) return localApplicants;
    const q = rosterSearch.toLowerCase().trim();
    return localApplicants.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.applicantType.toLowerCase().includes(q) ||
        (a.status && a.status.toLowerCase().includes(q))
    );
  }, [localApplicants, rosterSearch]);

  const handleSetStatus = (idx: number, newStatus: 'Complete' | 'Incomplete' | 'ForEndorsement') => {
    const updated = [...localApplicants];
    const target = updated[idx];
    if (target) {
      updated[idx] = { ...target, status: newStatus };
      setLocalApplicants(updated);
      if (!isEditingRoster) {
        updateApplication(app.id, { applicantsList: updated });
      }
    }
  };

  const handleUpdateRosterRow = (idx: number, patch: Partial<ApplicantItem>) => {
    const updated = [...localApplicants];
    const target = updated[idx];
    if (!target) return;

    const newApplicant = { ...target, ...patch };

    if (patch.name !== undefined && newApplicant.applicantType === 'Individual') {
      const parts = patch.name.trim().split(/\s+/);
      const firstName = parts[0] ?? '';
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
    const synchronized = localApplicants.map((item) => {
      if (item.applicantType === 'Individual' && item.name) {
        const parts = item.name.trim().split(/\s+/);
        const firstName = parts[0] ?? '';
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

  const bulkTotal = localApplicants.length;
  const bulkApproved = localApplicants.filter((a) => a.status === 'Complete').length;
  const bulkDeclined = localApplicants.filter((a) => a.status === 'Incomplete').length;
  const bulkPending = localApplicants.filter((a) => a.status === 'ForEndorsement' || !a.status).length;

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* ── Status Banner ── */}
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

      <View style={{ paddingHorizontal: SPACING[16], paddingTop: SPACING[16] }}>
        {/* ── 1. Hero Review Header: Services, Processing Office, Mode, Variant ── */}
        <HeroReviewHeader
          services={appliedServices}
          serviceName={app.serviceName || app.permitTitle || `${app.serviceCategory || app.category} Application`}
          category={app.serviceCategory || app.category}
          isExamService={isExamService}
          variantLabel={app.serviceVariantName || 'Standard'}
          scheduleSummaryText={scheduleSummaryText}
          mode={app.applicationType === 'BULK' ? 'Bulk' : 'Single'}
          totalApplicants={localApplicants.length}
        />
      </View>

      {/* ── Reference & Document Number block ── */}
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

      {/* ── Filing Entity & Submitter Details ── */}
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

      {/* ── Bulk Applications Section ── */}
      {app.applicationType === 'BULK' && localApplicants.length > 0 && (
        <View style={{ paddingHorizontal: SPACING[16], marginTop: SPACING[12] }}>
          <BulkMetricsGrid
            totalSubmitted={bulkTotal}
            approvedCount={bulkApproved}
            declinedCount={bulkDeclined}
            pendingCount={bulkPending}
          />

          <SectionHeader
            title={`APPLICANTS BATCH ROSTER (${localApplicants.length} APPLICANTS)`}
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
                        <Text style={[styles.inspectBtnText, { color: COLORS.neutral.white, fontWeight: '700' }]}>Save</Text>
                      </Pressable>
                    </>
                  ) : (
                    <Pressable
                      style={[styles.inspectBtn, { backgroundColor: isDark ? colors.brand[600] : colors.brand[700], paddingHorizontal: 10 }]}
                      onPress={() => setIsEditingRoster(true)}
                    >
                      <Text style={[styles.inspectBtnText, { color: COLORS.neutral.white }]}>Edit</Text>
                    </Pressable>
                  )}
                </View>
              ) : null
            }
          />

          <TextInput
            style={[styles.rosterSearchInput, { color: isDark ? colors.neutral[100] : colors.neutral[900], backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral.white, borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}
            placeholder="Search roster applicants by name, type, or status..."
            placeholderTextColor={colors.neutral[400]}
            value={rosterSearch}
            onChangeText={setRosterSearch}
          />

          <View style={[styles.denseTableContainer, { backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral.white, borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
            <View style={[styles.denseTableHeader, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderBottomColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
              <Text style={[styles.denseHeaderCell, { width: 35, textAlign: 'center', color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>#</Text>
              <Text style={[styles.denseHeaderCell, { flex: 2, color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>APPLICANT NAME</Text>
              <Text style={[styles.denseHeaderCell, { flex: 1, color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>TYPE</Text>
              <Text style={[styles.denseHeaderCell, { flex: 1.2, color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>STATUS VERDICT</Text>
              <Text style={[styles.denseHeaderCell, { flex: 2, color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>EVALUATION REMARKS</Text>
              <Text style={[styles.denseHeaderCell, { width: 100, textAlign: 'right', color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>ACTION</Text>
            </View>

            {filteredApplicants.map((item, idx) => {
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
        </View>
      )}

      {/* ── Single Applicant Summary & Record Link ── */}
      {app.applicationType !== 'BULK' && (
        <View style={{ paddingHorizontal: SPACING[16], marginTop: SPACING[12] }}>
          <SectionHeader
            title="PRIMARY APPLICANT SUMMARY"
            rightAction={
              <Pressable
                style={[
                  styles.inspectBtn,
                  {
                    backgroundColor: isDark ? colors.brand[600] : colors.brand[700],
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: RADIUS.button,
                  },
                ]}
                onPress={() => onInspectApplicant?.(0)}
              >
                <Text style={[styles.inspectBtnText, { color: COLORS.neutral.white, fontWeight: '700' }]}>
                  View Applicant Record & Content ►
                </Text>
              </Pressable>
            }
          />
          <View style={[styles.infoBlock, { backgroundColor: isDark ? colors.neutral[900] : COLORS.neutral.white }]}>
            <InfoRow label="Applicant Name:" value={app.applicant || "—"} />
            <InfoRow label="Applicant Type:" value={app.applicantType || "Individual"} />
            <InfoRow label="Email Address:" value={app.contactDetails?.email || app.filingUser?.email || "—"} />
            <InfoRow label="Contact Number:" value={app.contactDetails?.contactNumber || app.companyDetails?.contactNumber || "—"} />
            <InfoRow
              label="Primary Address:"
              value={
                app.address?.address ||
                app.address?.streetAddress ||
                (typeof app.address === 'string' ? app.address : [app.address?.city, app.address?.province].filter(Boolean).join(', ')) ||
                "—"
              }
            />
            {app.applicantType === 'Company' && (
              <>
                <InfoRow label="Company Name:" value={app.companyDetails?.name || app.filingUser?.company?.name || "—"} />
                <InfoRow label="Registration Number:" value={app.companyDetails?.registrationNumber || app.filingUser?.company?.registrationNumber || "—"} />
              </>
            )}

            <Pressable
              style={{
                marginTop: SPACING[8],
                padding: SPACING[12],
                borderRadius: RADIUS.card,
                backgroundColor: isDark ? colors.brand[900] : colors.brand[50],
                borderWidth: 1,
                borderColor: isDark ? colors.brand[700] : colors.brand[200],
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onPress={() => onInspectApplicant?.(0)}
            >
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? colors.brand[300] : colors.brand[900] }}>
                  Application Form Submissions & Attachments
                </Text>
                <Text style={{ fontSize: 11, color: isDark ? colors.brand[400] : colors.brand[700], marginTop: 2 }}>
                  Switch to the Applicant Records tab to view full dynamic form fields, technical specifications, and uploaded requirement documents.
                </Text>
              </View>
              <Lucide name="arrow-right" size={16} color={isDark ? colors.brand[300] : colors.brand[700]} />
            </Pressable>
          </View>
        </View>
      )}

      {/* ── Application History section ── */}
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
                      <View style={[styles.historyLine, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200] }]} />
                    )}
                  </View>
                  <View style={styles.historyRight}>
                    <Text style={[styles.historyAction, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>{entry.action}</Text>
                    <Text style={[styles.historyStaff, { color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>by {entry.staff}</Text>
                    <Text style={[styles.historyDate, { color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>{entry.timestamp}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </>
      )}

      {/* ── Note Block ── */}
      <View style={[styles.noteBlock, { borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
        <View style={styles.noteHeader}>
          <Text style={[styles.fieldGroupLabel, { color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>EVALUATION NOTES / REMARKS</Text>
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
          <Text style={[styles.noteText, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>{app.note || 'No evaluation notes recorded.'}</Text>
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
  onPreviewFile,
}: {
  app: ApplicationData;
  selectedApplicantIndex?: number;
  onSelectApplicantIndex?: (index: number) => void;
  updateApplication?: (id: string, patch: Partial<ApplicationData>) => void;
  isEditable?: boolean;
  onPreviewFile?: (file: DocumentPreviewFile | string, label?: string) => void;
}) {
  const { colors, isDark } = useTheme();
  const effectiveApplicants = useMemo(() => {
    if (app.applicantsList && app.applicantsList.length > 0) {
      return app.applicantsList;
    }
    return [{
      id: app.id,
      name: app.applicant || `${app.basicInfo?.firstName ?? ''} ${app.basicInfo?.lastName ?? ''}`.trim() || app.companyDetails?.name || app.filingUser?.name || "Applicant",
      applicantType: (app.applicantType === 'Company' ? 'Company' : 'Individual') as 'Individual' | 'Company',
      status: 'Complete' as const,
      evaluationRemarks: '',
      contactNumber: app.contactDetails?.contactNumber || '',
      email: app.contactDetails?.email || '',
      address: app.address?.address || app.address?.streetAddress || (typeof app.address === 'string' ? app.address : `${app.address?.city ?? ''}, ${app.address?.province ?? ''}`.trim()),
      streetAddress: app.address?.streetAddress || app.address?.address || '',
      barangay: app.address?.barangay || '',
      city: app.address?.city || '',
      province: app.address?.province || '',
      region: app.address?.region || '',
      zipCode: app.address?.zipCode || '',
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
        civilStatus: app.basicInfo.civilStatus,
        employmentStatus: app.basicInfo.employmentStatus,
        occupation: app.basicInfo.occupation,
      } : undefined,
      companyDetails: app.companyDetails,
      requirements: app.requirements,
    }];
  }, [app]);

  const [localApplicants, setLocalApplicants] = useState<ApplicantItem[]>(effectiveApplicants);

  useEffect(() => {
    setLocalApplicants(effectiveApplicants);
  }, [effectiveApplicants]);

  const activeIdx = Math.min(selectedApplicantIndex ?? 0, Math.max(0, localApplicants.length - 1));
  const activeApplicant = localApplicants[activeIdx];

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingForm, setIsEditingForm] = useState(false);

  const [fnProfileDraft, setFnProfileDraft] = useState('');
  const [lnProfileDraft, setLnProfileDraft] = useState('');
  const [mnProfileDraft, setMnProfileDraft] = useState('');
  const [extProfileDraft, setExtProfileDraft] = useState('');
  const [typeDraft, setTypeDraft] = useState('');
  const [contactDraft, setContactDraft] = useState('');
  const [emailDraft, setEmailDraft] = useState('');
  const [addressDraft, setAddressDraft] = useState('');
  const [zipDraft, setZipDraft] = useState('');
  const [dobDraft, setDobDraft] = useState('');
  const [sexDraft, setSexDraft] = useState('');
  const [nationalityDraft, setNationalityDraft] = useState('');

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

  const flatFormValues = useMemo(() => {
    if (!formData || !formData.sections) return [];
    return formData.sections.flatMap((sec) =>
      sec.fields.map((f) => ({
        fieldId: f.fieldId,
        fieldLabel: f.label,
        value: formDraftValues[f.fieldId] ?? f.value ?? '',
      }))
    );
  }, [formData, formDraftValues]);

  const handleSaveProfile = () => {
    const updated = [...localApplicants];
    const target = updated[activeIdx];
    if (target) {
      const compiledName = [fnProfileDraft, mnProfileDraft, lnProfileDraft, extProfileDraft].filter(Boolean).join(' ').trim();
      const finalName = compiledName || target.name;
      updated[activeIdx] = {
        ...target,
        name: finalName,
        applicantType: (typeDraft as 'Individual' | 'Company') || target.applicantType,
        contactNumber: contactDraft || target.contactNumber,
        email: emailDraft || target.email,
        address: addressDraft || target.address,
        zipCode: zipDraft || target.zipCode,
        companyDetails: typeDraft === 'Company' ? {
          name: compNameProfileDraft,
          registrationNumber: compRegNoProfileDraft,
          address: compAddressProfileDraft,
          contactNumber: compContactProfileDraft,
          email: compEmailProfileDraft,
        } : target.companyDetails,
        basicInfo: {
          ...(target.basicInfo ?? {
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
          dob: dobDraft,
          sex: sexDraft,
          nationality: nationalityDraft,
        },
      };
      setLocalApplicants(updated);
      if (activeApplicant?.id) {
        applicationService.adminUpdateApplicantProfile(app.id, activeApplicant.id, {
          firstName: fnProfileDraft,
          lastName: lnProfileDraft,
          middleName: mnProfileDraft,
          suffix: extProfileDraft,
          contactNumber: contactDraft || target.contactNumber,
          email: emailDraft || target.email,
          address: addressDraft || target.address,
          zipCode: zipDraft || target.zipCode,
          applicantType: typeDraft || target.applicantType,
          dob: dobDraft,
          sex: sexDraft,
          nationality: nationalityDraft,
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

    const [res] = await applicationService.adminUpdateFormValues(app.id, activeApplicant.id, payload, formData.submissionId ?? undefined);
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

  const [applicantRequirementsState, setApplicantRequirementsState] = useState<ApplicantRequirementItemDto[]>([]);
  const [isLoadingRequirements, setIsLoadingRequirements] = useState<boolean>(false);
  const [uploadingReqId, setUploadingReqId] = useState<string | null>(null);
  const [previewLoadingReqId, setPreviewLoadingReqId] = useState<string | null>(null);

  const fetchApplicantRequirements = useCallback(async () => {
    if (app?.id === undefined || app?.id === null || activeApplicant?.id === undefined || activeApplicant?.id === null) {
      return;
    }
    setIsLoadingRequirements(true);
    const [res] = await applicationService.getApplicantRequirements(app.id, activeApplicant.id);
    setIsLoadingRequirements(false);
    if (res !== null && res.data !== undefined && res.data !== null) {
      setApplicantRequirementsState(res.data);
    }
  }, [app?.id, activeApplicant?.id]);

  useEffect(() => {
    fetchApplicantRequirements();
  }, [fetchApplicantRequirements]);

  const [localRemarks, setLocalRemarks] = useState(activeApplicant?.evaluationRemarks ?? '');

  useEffect(() => {
    setLocalRemarks(activeApplicant?.evaluationRemarks ?? '');
  }, [activeApplicant?.id, activeApplicant?.evaluationRemarks]);

  const handleSetStatus = async (idx: number, newStatus: 'Complete' | 'Incomplete' | 'ForEndorsement') => {
    if (!isEditable) return;
    const updated = [...localApplicants];
    const target = updated[idx];
    if (target) {
      updated[idx] = { ...target, status: newStatus };
      setLocalApplicants(updated);
      if (updateApplication) {
        await updateApplication(app.id, { applicantsList: updated });
        notifySuccess("Status Updated", `Applicant evaluation status set to ${newStatus}.`);
      }
    }
  };

  const handleSetRemarks = async (idx: number, text: string) => {
    if (!isEditable) return;
    const updated = [...localApplicants];
    const target = updated[idx];
    if (target) {
      updated[idx] = { ...target, evaluationRemarks: text };
      setLocalApplicants(updated);
      if (updateApplication) {
        await updateApplication(app.id, { applicantsList: updated });
      }
    }
  };

  const notifyError = (title: string, msg: string) => {
    try {
      toast.error(`${title}: ${msg}`);
    } catch {
      // fallback
    }
    Alert.alert(title, msg);
  };

  const notifySuccess = (title: string, msg: string) => {
    try {
      toast.success(`${title}: ${msg}`);
    } catch {
      // fallback
    }
    Alert.alert(title, msg);
  };

  const uploadAndAttachRequirement = async (
    fileData: Blob | File,
    fileName: string,
    reqItem: ApplicantRequirementItemDto
  ) => {
    if (!app?.id || !activeApplicant?.id) return;

    const tenantId = app.tenantId;
    if (!tenantId?.trim()) {
      notifyError('Upload Failed', 'Tenant ID is missing on current application context.');
      return;
    }

    setUploadingReqId(reqItem.requirementId);
    try {
      const [storageRes, storageErr] = await storageService.uploadFile(
        fileData,
        fileName,
        'requirements',
        tenantId
      );

      if (storageErr !== null || !storageRes?.data) {
        const errText = typeof storageErr === 'object' && storageErr !== null && 'message' in storageErr
          ? String((storageErr as { message?: unknown }).message)
          : (storageRes?.message ?? 'Failed to upload document to storage.');
        notifyError('Upload Failed', errText);
        setUploadingReqId(null);
        return;
      }

      const storedFileId = storageRes.data.id;

      const [reqRes, reqErr] = await applicationService.uploadApplicantRequirement(
        app.id,
        activeApplicant.id,
        {
          requirementId: reqItem.requirementId,
          serviceVariantRequirementId: reqItem.serviceVariantRequirementId ?? undefined,
          storedFileId: storedFileId,
        }
      );

      setUploadingReqId(null);

      if (reqErr !== null || !reqRes?.succeeded) {
        const errText = typeof reqErr === 'object' && reqErr !== null && 'message' in reqErr
          ? String((reqErr as { message?: unknown }).message)
          : (reqRes?.message ?? 'Failed to save requirement attachment.');
        notifyError('Save Failed', errText);
        return;
      }

      notifySuccess('Success', 'Requirement document attached successfully.');
      await fetchApplicantRequirements();
    } catch (err: unknown) {
      setUploadingReqId(null);
      const errorMsg = err instanceof Error ? err.message : 'An error occurred during file upload.';
      notifyError('Upload Error', errorMsg);
    }
  };

  const handleUploadOrReplaceRequirement = async (reqItem: ApplicantRequirementItemDto) => {
    if (!app?.id || !activeApplicant?.id) return;

    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg,image/jpg,image/png,image/webp,image/gif,image/bmp,application/pdf';

      input.onchange = async (e: Event) => {
        const target = e.target as HTMLInputElement;
        const files = target.files;
        if (!files || files.length === 0) return;

        const selectedFile = files[0];
        if (!selectedFile) return;

        const fileName = selectedFile.name;
        const mimeType = selectedFile.type;

        if (!isAllowedRequirementFileType(fileName, mimeType)) {
          notifyError('Invalid File Type', 'Only image files (JPG, PNG, WEBP, GIF, BMP) and PDF documents are allowed.');
          return;
        }

        await uploadAndAttachRequirement(selectedFile, selectedFile.name, reqItem);
      };

      input.click();
    } else {
      try {
        const DocumentPicker = await import('expo-document-picker');
        const result = await DocumentPicker.getDocumentAsync({
          type: ['image/*', 'application/pdf'],
          copyToCacheDirectory: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const selectedAsset = result.assets[0];
          if (!selectedAsset) return;

          const fileName = selectedAsset.name || `doc_${Date.now()}.pdf`;
          const mimeType = selectedAsset.mimeType || '';

          if (!isAllowedRequirementFileType(fileName, mimeType)) {
            notifyError('Invalid File Type', 'Only image files (JPG, PNG, WEBP, GIF, BMP) and PDF documents are allowed.');
            return;
          }

          const response = await fetch(selectedAsset.uri);
          const fileBlob = await response.blob();

          await uploadAndAttachRequirement(fileBlob, selectedAsset.name || fileName, reqItem);
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'An error occurred during mobile document selection.';
        notifyError('Upload Error', errorMsg);
      }
    }
  };

  const handlePreviewRequirement = async (reqItem: ApplicantRequirementItemDto) => {
    let fileUrl: string = typeof reqItem.url === 'string' && reqItem.url.trim() !== '' ? reqItem.url.trim() : '';
    if (fileUrl === '' && typeof reqItem.storedFileId === 'string' && reqItem.storedFileId.trim() !== '') {
      const tenantId = typeof app.tenantId === 'string' && app.tenantId.trim() !== ''
        ? app.tenantId
        : 'aa0cd342-7265-4d9e-9242-948fc7e3d0a8';
      fileUrl = storageService.getFileDownloadUrl(reqItem.storedFileId, tenantId);
    }

    const fileName = reqItem.fileName || reqItem.requirementName || 'Requirement Document';
    const isPdf = Boolean(reqItem.contentType?.includes('pdf') || fileName.toLowerCase().endsWith('.pdf'));
    const fileType = isPdf ? 'PDF' : 'IMAGE';
    const fileSize = typeof reqItem.fileSizeBytes === 'number' && reqItem.fileSizeBytes > 0
      ? `${(reqItem.fileSizeBytes / 1024).toFixed(1)} KB`
      : undefined;

    const docObj: DocumentPreviewFile = {
      uri: fileUrl,
      name: fileName,
      category: reqItem.requirementName,
      size: fileSize,
      type: fileType,
      referenceNumber: app.referenceNumber || 'NTC-REQ-2026',
      serviceName: app.serviceName || app.permitTitle || 'Licensing Service',
      applicantName: activeApplicant?.name || app.applicant,
      uploadedAt: reqItem.uploadedAt ?? undefined,
    };

    if (fileUrl !== '') {
      if (fileUrl.startsWith('data:') || fileUrl.startsWith('blob:')) {
        onPreviewFile?.(docObj, reqItem.requirementName);
        return;
      }

      setPreviewLoadingReqId(reqItem.requirementId);
      try {
        const [blobData, blobErr] = await storageService.downloadFileByUrl(fileUrl);
        if (blobErr === null && blobData instanceof Blob) {
          const objectUrl =
            typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
              ? URL.createObjectURL(blobData)
              : fileUrl;

          onPreviewFile?.({ ...docObj, uri: objectUrl }, reqItem.requirementName);
          setPreviewLoadingReqId(null);
          return;
        }

        onPreviewFile?.({ ...docObj, uri: fileUrl }, reqItem.requirementName);
      } catch {
        onPreviewFile?.(docObj, reqItem.requirementName);
      } finally {
        setPreviewLoadingReqId(null);
      }
    } else {
      onPreviewFile?.(docObj, reqItem.requirementName);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* ── Fixed Sticky Top Applicant Selector Bar ── */}
      {localApplicants.length > 0 && (
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
          {localApplicants.length > 1 && (
            <Pressable
              disabled={activeIdx === 0}
              onPress={() => onSelectApplicantIndex?.(Math.max(0, activeIdx - 1))}
              style={[styles.selectorNavBtn, activeIdx === 0 && { opacity: 0.3 }]}
            >
              <Lucide name="chevron-left" size={14} color={isDark ? colors.brand[400] : colors.brand[800]} />
              <Text style={[styles.selectorNavBtnText, { color: isDark ? colors.brand[400] : colors.brand[800] }]}>Previous</Text>
            </Pressable>
          )}

          <View style={styles.selectorCenter}>
            <Lucide name="user" size={14} color={isDark ? colors.brand[400] : colors.brand[800]} />
            <Text style={[styles.selectorTitleText, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>
              {localApplicants.length > 1
                ? `Applicant Record ${activeIdx + 1} of ${localApplicants.length}:`
                : `Applicant Record:`}
            </Text>
            <Text style={[styles.selectorNameText, { color: isDark ? colors.brand[300] : colors.brand[900] }]}>
              {activeApplicant?.name}
            </Text>
          </View>

          {localApplicants.length > 1 && (
            <Pressable
              disabled={activeIdx >= localApplicants.length - 1}
              onPress={() => onSelectApplicantIndex?.(Math.min(localApplicants.length - 1, activeIdx + 1))}
              style={[styles.selectorNavBtn, activeIdx >= localApplicants.length - 1 && { opacity: 0.3 }]}
            >
              <Text style={[styles.selectorNavBtnText, { color: isDark ? colors.brand[400] : colors.brand[800] }]}>Next</Text>
              <Lucide name="chevron-right" size={14} color={isDark ? colors.brand[400] : colors.brand[800]} />
            </Pressable>
          )}
        </View>
      )}

      {/* ── Scrollable Content Area ── */}
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
                      setDobDraft(biData?.dob || '');
                      setSexDraft(biData?.sex || '');
                      setNationalityDraft(biData?.nationality || '');
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

        <View style={{ paddingHorizontal: SPACING[16] }}>
          {activeApplicant && (
            <ApplicantParticularsCard
              applicant={{
                applicantName: activeApplicant.name,
                name: activeApplicant.name,
                applicantType: activeApplicant.applicantType === 'Company' ? 'company' : 'individual',
                email: activeApplicant.email,
                mobileNumber: activeApplicant.contactNumber,
                streetAddress: activeApplicant.streetAddress || activeApplicant.address,
                barangay: activeApplicant.barangay,
                cityMunicipality: activeApplicant.city,
                province: activeApplicant.province,
                region: activeApplicant.region,
                zipCode: activeApplicant.zipCode,
                birthDate: activeApplicant.basicInfo?.dob,
                sex: activeApplicant.basicInfo?.sex,
                civilStatus: activeApplicant.basicInfo?.civilStatus,
                nationality: activeApplicant.basicInfo?.nationality,
                companyName: activeApplicant.companyDetails?.name || (activeApplicant.applicantType === 'Company' ? app.companyDetails?.name : undefined),
                registrationNumber: activeApplicant.companyDetails?.registrationNumber || (activeApplicant.applicantType === 'Company' ? app.companyDetails?.registrationNumber : undefined),
                companyAddress: activeApplicant.companyDetails?.address || (activeApplicant.applicantType === 'Company' ? app.companyDetails?.address : undefined),
                companyEmail: activeApplicant.companyDetails?.email || (activeApplicant.applicantType === 'Company' ? app.companyDetails?.email : undefined),
                companyContactNumber: activeApplicant.companyDetails?.contactNumber || (activeApplicant.applicantType === 'Company' ? app.companyDetails?.contactNumber : undefined),
                representativeName: activeApplicant.applicantType === 'Company' ? app.filingUser?.name : undefined,
                representativeEmail: activeApplicant.applicantType === 'Company' ? app.filingUser?.email : undefined,
                representativeContactNumber: activeApplicant.applicantType === 'Company' ? app.filingUser?.company?.contactNumber : undefined,
                notes: activeApplicant.evaluationRemarks,
              }}
            />
          )}
        </View>

        {/* Section 2: Completed Service Form Submissions */}
        <SectionHeader
          title="2. COMPLETED SERVICE FORM SUBMISSIONS & TECHNICAL SPECIFICATIONS"
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

        <View style={{ paddingHorizontal: SPACING[16] }}>
          {isLoadingForm ? (
            <View style={{ padding: 16, alignItems: 'center' }}>
              <SkeletonLoader height={32} style={{ marginBottom: 8, width: '100%' }} />
              <SkeletonLoader height={32} style={{ marginBottom: 8, width: '100%' }} />
            </View>
          ) : formData && formData.sections.length > 0 ? (
            <BaseApplicationPreview
              service={{
                title: app.serviceName || app.permitTitle,
                category: app.serviceCategory || app.category,
              }}
              form={formData}
              formFieldValues={flatFormValues}
              showApplicantCard={false}
              showSignatureCard={true}
              onPreviewFile={onPreviewFile}
            />
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
          {isLoadingRequirements ? (
            <View style={{ padding: SPACING[4] }}>
              <SkeletonLoader height={24} style={{ marginBottom: 8 }} />
              <SkeletonLoader height={24} style={{ marginBottom: 8 }} />
            </View>
          ) : applicantRequirementsState.length === 0 ? (
            <View style={styles.emptyReqs}>
              <Lucide name="folder" size={24} color={isDark ? colors.neutral[600] : colors.neutral[300]} />
              <Text style={[styles.emptyReqsText, { color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>
                No requirement documents configured or submitted
              </Text>
            </View>
          ) : (
            applicantRequirementsState.map((reqItem) => {
              const hasValidUrl = typeof reqItem.url === 'string' && reqItem.url.trim() !== '' && reqItem.url !== 'null' && reqItem.url !== 'undefined';
              const hasStoredId = typeof reqItem.storedFileId === 'string' && reqItem.storedFileId.trim() !== '' && reqItem.storedFileId !== 'null';
              const hasSubmission = reqItem.submittedRequirementId !== undefined && reqItem.submittedRequirementId !== null;
              const isAttached = hasSubmission || hasStoredId || hasValidUrl;
              const isUploading = uploadingReqId === reqItem.requirementId;
              const isPreviewLoading = previewLoadingReqId === reqItem.requirementId;

              return (
                <View key={reqItem.requirementId} style={[styles.reqItem, { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={[styles.reqLabel, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
                      {reqItem.requirementName}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <View style={{
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 4,
                        backgroundColor: reqItem.isRequired
                          ? (isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2')
                          : (isDark ? colors.neutral[800] : colors.neutral[100])
                      }}>
                        <Text style={{
                          fontSize: 10,
                          fontWeight: '700',
                          color: reqItem.isRequired ? '#EF4444' : (isDark ? colors.neutral[400] : colors.neutral[600])
                        }}>
                          {reqItem.isRequired ? 'REQUIRED' : 'OPTIONAL'}
                        </Text>
                      </View>
                      <View style={{
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 4,
                        backgroundColor: isAttached
                          ? (isDark ? 'rgba(34, 197, 94, 0.2)' : '#DCFCE7')
                          : (isDark ? 'rgba(234, 179, 8, 0.2)' : '#FEF9C3')
                      }}>
                        <Text style={{
                          fontSize: 10,
                          fontWeight: '700',
                          color: isAttached ? '#22C55E' : (isDark ? '#EAB308' : '#CA8A04')
                        }}>
                          {isAttached ? 'ATTACHED' : 'PENDING'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {reqItem.description !== undefined && reqItem.description !== null && reqItem.description.length > 0 && (
                    <Text style={[styles.reqNote, { color: isDark ? colors.neutral[400] : colors.neutral[500], marginBottom: 8 }]}>
                      {reqItem.description}
                    </Text>
                  )}

                  <View style={styles.reqFileRow}>
                    <Lucide
                      name={reqItem.contentType?.includes('pdf') || reqItem.fileName?.endsWith('.pdf') ? 'file-text' : 'image'}
                      size={14}
                      color={isDark ? colors.brand[400] : colors.brand[700]}
                    />
                    <Text style={[styles.reqFilename, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]} numberOfLines={1}>
                      {reqItem.fileName || 'No document file attached'}
                    </Text>
                    {isAttached && (
                      <Pressable
                        disabled={isPreviewLoading}
                        onPress={() => handlePreviewRequirement(reqItem)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 4,
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: RADIUS.sm,
                          backgroundColor: isDark ? colors.brand[900] : colors.brand[50],
                          borderWidth: 1,
                          borderColor: isDark ? colors.brand[700] : colors.brand[200],
                        }}
                      >
                        <Lucide
                          name={isPreviewLoading ? "loader" : "eye"}
                          size={12}
                          color={isDark ? colors.brand[300] : colors.brand[700]}
                        />
                        <Text style={[styles.reqViewLink, { color: isDark ? colors.brand[300] : colors.brand[700] }]}>
                          {isPreviewLoading ? "Loading..." : "View Document"}
                        </Text>
                      </Pressable>
                    )}
                    {isEditable && (
                      <Pressable
                        disabled={isUploading}
                        onPress={() => handleUploadOrReplaceRequirement(reqItem)}
                        style={{
                          marginLeft: 12,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: RADIUS.sm,
                          backgroundColor: isDark ? colors.brand[900] : colors.brand[50],
                          borderWidth: 1,
                          borderColor: isDark ? colors.brand[700] : colors.brand[200],
                          opacity: isUploading ? 0.6 : 1
                        }}
                      >
                        <Text style={{
                          fontSize: 11,
                          fontWeight: '600',
                          color: isDark ? colors.brand[300] : colors.brand[700]
                        }}>
                          {isUploading ? 'Uploading...' : isAttached ? 'Replace File' : 'Upload File'}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Accountable Form */}
        {accountableForms.length > 0 && (
          <>
            <SectionHeader title="ACCOUNTABLE FORM" />
            <View style={styles.infoBlock}>
              {accountableForms.map((form) => (
                <View key={form.name} style={[styles.formCard, { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100], borderLeftColor: isDark ? colors.brand[500] : colors.brand[700], backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white }]}>
                  <View style={styles.formCardLeft}>
                    <View style={[styles.formDocIcon, { backgroundColor: isDark ? colors.neutral[800] : '#EFF6FF' }]}>
                      <Lucide
                        name="file-text"
                        size={18}
                        color={isDark ? colors.brand[500] : COLORS.brand[700]}
                      />
                    </View>
                    <View>
                      <Text style={[styles.formDocLabel, { color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>DOCUMENT ATTACHMENT</Text>
                      <Text style={[styles.formDocName, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>{form.name}</Text>
                      <View style={styles.formActions}>
                        {form.canView && (
                          <Pressable onPress={() => handleAction(form, "View")}>
                            <Text style={[styles.formActionLink, { color: isDark ? colors.brand[500] : colors.brand[700] }]}>View</Text>
                          </Pressable>
                        )}
                        {form.canPrint && (
                          <Pressable onPress={() => handleAction(form, "Print")}>
                            <Text style={[styles.formActionLink, { color: isDark ? colors.brand[500] : colors.brand[700] }]}>Print</Text>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  </View>
                  {form.canDownload && (
                    <Pressable
                      style={[styles.downloadBtn, { borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}
                      onPress={() => handleAction(form, "Download")}
                    >
                      <Lucide
                        name="download"
                        size={14}
                        color={isDark ? colors.neutral[400] : colors.neutral[600]}
                      />
                      <Text style={[styles.downloadBtnText, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>Download</Text>
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
                <View key={form.name} style={[styles.formCard, { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100], borderLeftColor: isDark ? colors.brand[500] : colors.brand[700], backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white }]}>
                  <View style={styles.formCardLeft}>
                    <View style={[styles.formDocIcon, { backgroundColor: isDark ? colors.neutral[800] : '#EFF6FF' }]}>
                      <Lucide
                        name="file-text"
                        size={18}
                        color={isDark ? colors.brand[500] : COLORS.brand[700]}
                      />
                    </View>
                    <View>
                      <Text style={[styles.formDocLabel, { color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>DOCUMENT ATTACHMENT</Text>
                      <Text style={[styles.formDocName, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>{form.name}</Text>
                      <View style={styles.formActions}>
                        {form.canView && (
                          <Pressable onPress={() => handleAction(form, "View")}>
                            <Text style={[styles.formActionLink, { color: isDark ? colors.brand[500] : colors.brand[700] }]}>View</Text>
                          </Pressable>
                        )}
                        {form.canPrint && (
                          <Pressable onPress={() => handleAction(form, "Print")}>
                            <Text style={[styles.formActionLink, { color: isDark ? colors.brand[500] : colors.brand[700] }]}>Print</Text>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  </View>
                  <View style={styles.formBtnGroup}>
                    {form.canDownload && (
                      <Pressable
                        style={[styles.downloadBtn, { borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}
                        onPress={() => handleAction(form, "Download")}
                      >
                        <Lucide
                          name="download"
                          size={14}
                          color={isDark ? colors.neutral[400] : colors.neutral[600]}
                        />
                        <Text style={[styles.downloadBtnText, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>Download</Text>
                      </Pressable>
                    )}
                    {form.canRefresh && (
                      <Pressable
                        style={[styles.refreshBtn, { borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}
                        onPress={() => handleAction(form, "Refresh")}
                      >
                        <Lucide
                          name="refresh-cw"
                          size={14}
                          color={isDark ? colors.neutral[400] : colors.neutral[600]}
                        />
                        <Text style={[styles.downloadBtnText, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>Refresh</Text>
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

      {/* ── Fixed Sticky Bottom Dock — Evaluator Panel ── */}
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
            <View style={styles.evalDockLeft}>
              <Text style={[styles.evalDockLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                VERDICT — {activeApplicant.name.split(' ')[0]?.toUpperCase() ?? 'APPLICANT'}
              </Text>
              <View style={styles.evalChipRow}>
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

            <View style={[styles.evalDockDivider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200] }]} />

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
      <View style={[styles.billingContainer, { borderColor: isDark ? colors.neutral[700] : colors.neutral[200], backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white }]}>
        <Text style={[styles.billingLabel, { color: isDark ? colors.brand[500] : colors.brand[700] }]}>OFFICIAL BILLING RECORD</Text>
        <Text style={[styles.billingTitle, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>Statement of Account</Text>
        <Text style={[styles.billingSubtitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
          Review the billing particulars, charges, and due date below.
        </Text>

        <View style={[styles.feeTable, { borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
          <View style={[styles.feeTableHeader, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
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
          <View style={[styles.feeTableDivider, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200] }]} />

          {app.soaItems.map((item, idx) => (
            <View key={idx} style={[styles.feeTableRow, { borderTopColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
              <View style={{ flex: 2 }}>
                <Text style={[styles.feeParticularName, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>{item.particular}</Text>
                <Text style={[styles.feeParticularSub, { color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>
                  Validity • {item.validityYears} Year(s)
                </Text>
                <Text style={[styles.feeParticularSub, { color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>Code: {item.code}</Text>
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

        <View style={[styles.totalBox, { borderColor: isDark ? colors.neutral[700] : colors.neutral[200], backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
          <View style={styles.totalRight}>
            <Text style={[styles.totalLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>TOTAL AMOUNT DUE</Text>
            <Text style={[styles.totalAmount, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
              {formatAmount(app.totalAmountDue)}
            </Text>
            <Text style={[styles.totalWords, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>{amountWords.toUpperCase()}</Text>
            <View style={styles.totalDueDateRow}>
              <Text style={[styles.totalDueDateLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
                To be paid on or before:
              </Text>
              {editingDueDate ? (
                <View style={styles.inlineEditRow}>
                  <TextInput
                    style={[styles.inlineEditInput, { color: isDark ? colors.neutral[100] : colors.neutral[900], backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white, borderColor: isDark ? colors.brand[500] : colors.brand[500] }]}
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
                    <Text style={[styles.inlineEditSave, { color: isDark ? colors.brand[500] : colors.brand[700] }]}>Save</Text>
                  </Pressable>
                </View>
              ) : (
                <Text style={[styles.totalDueDate, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>{app.dueDate}</Text>
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
                <Text style={[styles.editLinkBlue, { color: isDark ? colors.brand[500] : colors.brand[700] }]}>Edit</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>

      <View style={[styles.paymentSection, { borderColor: isDark ? colors.neutral[700] : colors.neutral[200], backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white }]}>
        <View style={styles.paymentSectionHeader}>
          <View style={[styles.paymentSectionIcon, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
            <Lucide name="circle" size={20} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
          </View>
          <Text style={[styles.paymentSectionTitle, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>Payment Summary</Text>
        </View>

        <View style={styles.paymentRow}>
          <View style={[styles.amountReceivedCard, { backgroundColor: isDark ? colors.brand[500] : colors.brand[800] }]}>
            <Text style={styles.amountReceivedLabel}>AMOUNT RECEIVED</Text>
            <Text style={[styles.amountReceivedValue, { color: isDark ? colors.neutral[800] : COLORS.neutral.white }]}>
              {app.payment.amountReceived}
            </Text>
            {excess > 0 && (
              <View style={styles.excessBadge}>
                <Text style={[styles.excessBadgeText, { color: isDark ? colors.neutral[800] : COLORS.neutral.white }]}>Excess: ₱{excess}</Text>
              </View>
            )}
            <View style={styles.paymentMethodBlock}>
              <Text style={styles.paymentMethodLabel}>PAYMENT METHOD</Text>
              <Text style={[styles.paymentMethodValue, { color: isDark ? colors.neutral[800] : COLORS.neutral.white }]}>
                {app.payment.method}
              </Text>
            </View>
          </View>

          <View style={styles.orColumn}>
            <Text style={[styles.orLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>OFFICIAL RECEIPT (OR) NUMBER</Text>
            {editingOrNumber ? (
              <View style={styles.inlineEditRow}>
                <TextInput
                  style={[styles.inlineEditInput, { flex: 1, color: isDark ? colors.neutral[100] : colors.neutral[900] }]}
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
                  <Text style={[styles.inlineEditSave, { color: isDark ? colors.brand[500] : colors.brand[700] }]}>Save</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.orValueRow}>
                <Text style={[styles.orValue, { color: isDark ? colors.neutral[200] : colors.neutral[700] }]}>
                  {app.payment.orNumber.length > 0 ? app.payment.orNumber : "—"}
                </Text>
                {isEditable && (
                  <Pressable
                    style={[styles.orEditBtn, { backgroundColor: isDark ? colors.neutral[800] : '#EFF6FF', borderColor: isDark ? colors.brand[500] : colors.brand[600] }]}
                    onPress={() => {
                      setOrDraft(app.payment.orNumber);
                      setEditingOrNumber(true);
                    }}
                  >
                    <Lucide name="edit-2" size={12} color={isDark ? colors.brand[500] : COLORS.brand[700]} />
                    <Text style={[styles.orEditText, { color: isDark ? colors.brand[500] : colors.brand[700] }]}>EDIT</Text>
                  </Pressable>
                )}
              </View>
            )}

            {app.payment.method === "check" && (
              <View style={{ marginTop: SPACING[16] }}>
                <Text style={[styles.orLabel, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>CHECK DETAILS</Text>
                <Text style={[styles.checkInfoText, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>
                  No: {app.payment.checkNumber || "—"}
                </Text>
                <Text style={[styles.checkInfoText, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>
                  Bank: {app.payment.checkName || "—"}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <Pressable
        style={[styles.auditHeader, { borderTopColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}
        onPress={() => setAuditOpen((p) => !p)}
      >
        <View style={styles.auditHeaderLeft}>
          <Lucide name="refresh-cw" size={14} color={isDark ? colors.neutral[500] : colors.neutral[500]} />
          <Text style={[styles.auditTitle, { color: isDark ? colors.neutral[400] : colors.neutral[500] }]}>
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
            <Text style={[styles.auditEmpty, { color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>No audit trail entries.</Text>
          ) : (
            app.correctionAuditTrail.map((entry) => (
              <View key={entry.id} style={[styles.auditEntry, { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
                <Text style={[styles.auditDesc, { color: isDark ? colors.neutral[200] : colors.neutral[700] }]}>{entry.action}</Text>
                <Text style={[styles.auditMeta, { color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>
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

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING[16], gap: SPACING[16] }}
        showsVerticalScrollIndicator={false}
      >
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
      </ScrollView>

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
    try {
      if (typeof patch.status === 'string' && patch.status.length > 0) {
        const [res, err] = await applicationService.updateStatus(id, {
          status: patch.status,
          remarks: typeof patch.note === 'string' ? patch.note : undefined,
        });
        if (err !== null) {
          const errMsg = typeof err === 'object' && err !== null && Reflect.has(err, 'message')
            ? String(Reflect.get(err, 'message'))
            : 'Please try again.';
          toast.error(`Status update failed: ${errMsg}`);
          return;
        }
      } else {
        const payload: Record<string, unknown> = {};
        if (patch.referenceNumber !== undefined) payload.referenceNumber = patch.referenceNumber;
        if (patch.applicationNumber !== undefined) payload.permitNumber = patch.applicationNumber;
        if (patch.office !== undefined) payload.office = patch.office;
        if (patch.applicant !== undefined) payload.applicant = patch.applicant;
        if (patch.applicantType !== undefined) payload.applicantType = patch.applicantType;
        if (patch.note !== undefined) payload.note = patch.note;
        if (patch.contactDetails !== undefined) payload.contactDetails = patch.contactDetails;
        if (patch.address !== undefined) payload.address = patch.address;
        if (patch.companyDetails !== undefined) payload.companyDetails = patch.companyDetails;
        if (patch.basicInfo !== undefined) payload.basicInfo = patch.basicInfo;
        if (patch.applicantsList !== undefined) payload.applicantsList = patch.applicantsList;

        const [res, err] = await applicationService.adminUpdateApplication(id, payload);
        if (err !== null) {
          const errMsg = typeof err === 'object' && err !== null && Reflect.has(err, 'message')
            ? String(Reflect.get(err, 'message'))
            : 'Please try again.';
          toast.error(`Update failed: ${errMsg}`);
          return;
        }
      }
      await mutateApplications(id);
      await refetch();
    } catch {
      toast.error("Failed to update application data.");
    }
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
  const [previewCustomDoc, setPreviewCustomDoc] = useState<DocumentPreviewFile | null>(null);

  const handlePreviewFile = useCallback((fileOrUri: DocumentPreviewFile | string, label?: string) => {
    if (typeof fileOrUri === 'string') {
      setPreviewCustomDoc({
        uri: fileOrUri,
        name: label !== undefined && label !== null && label.trim() !== '' ? label : 'Attachment Document',
        category: label,
      });
    } else if (fileOrUri !== null && typeof fileOrUri === 'object') {
      setPreviewCustomDoc(fileOrUri);
    }
  }, []);

  useEffect(() => {
    setSelectedApplicantIndex(0);
  }, [selectedApplication?.id]);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const tabScrollRef = useRef<ScrollView>(null);

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
        style={[styles.emptyPanelScroll, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}
        contentContainerStyle={styles.emptyPanelContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.summaryCard, { backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white }]}>
          <View style={[styles.summaryHeader, { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
            <Lucide name="layout" size={20} color={isDark ? colors.brand[500] : COLORS.brand[700]} />
            <Text style={[styles.summaryTitle, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>Work Queue Summary</Text>
          </View>

          <View style={[styles.guideBox, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <Lucide name="info" size={16} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
            <Text style={[styles.guideText, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>
              Select an application from the left feed to start reviewing
              details, endorsing, or approving requests.
            </Text>
          </View>
        </View>

        <View style={styles.actionPrompt}>
          <Lucide name="mouse-pointer" size={32} color={isDark ? colors.neutral[600] : colors.neutral[300]} />
          <Text style={[styles.emptyPanelTitle, { color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>No Application Selected</Text>
          <Text style={[styles.emptyPanelSub, { color: isDark ? colors.neutral[600] : colors.neutral[300] }]}>
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

  const handleApprove = async () => {
    setShowApprove(false);
    const dateStr = new Date().toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    await updateApplication(app.id, {
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
    toast.success("Application has been approved successfully.");
    setSelectedId(null);
  };

  const handleDecline = async (notice: string) => {
    setShowDecline(false);
    const dateStr = new Date().toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    await updateApplication(app.id, {
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
    toast.success("Application returned with notice.");
    setSelectedId(null);
  };

  const handleEndorse = async (targetRole: UserRole) => {
    setShowEndorse(false);
    const dateStr = new Date().toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    await updateApplication(app.id, {
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

    toast.success(`Application endorsed to ${targetRole}.`);
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

  const handleCashierVerify = async (data: {
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
    await updateApplication(app.id, {
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

    toast.success("Payment verified. Application moved for approval.");
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
          <>
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
        <View style={[styles.readOnlyBanner, { backgroundColor: colors.brand.yellowLight }]}>
          <Lucide name="lock" size={12} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
          <Text style={[styles.readOnlyText, { color: isDark ? COLORS.semantic.warningText : COLORS.semantic.warningText }]}>
            Read-only — actions only available on Pending applications with actionable status
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
          onPreviewFile={handlePreviewFile}
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
          onPreviewFile={handlePreviewFile}
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
      <View style={[styles.actionBar, { borderTopColor: isDark ? colors.neutral[700] : colors.neutral[200], backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white }]}>
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

      {/* ── Document Preview Modal ── */}
      <CustomDocPreviewModal
        previewCustomDoc={previewCustomDoc}
        onClose={() => setPreviewCustomDoc(null)}
      />

      {/* ── Evaluation Action Modals ── */}
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

  panel: {
    flex: 1,
    flexDirection: "column",
  },

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

  tabContent: {
    flex: 1,
  },

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

  infoBlock: {
    paddingHorizontal: SPACING[16],
  },
  fieldGroupLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: SPACING[4],
  },

  rosterSearchInput: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    borderWidth: 1,
    borderRadius: RADIUS.input,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },

  denseTableContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  denseTableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
  },
  denseHeaderCell: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  denseTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
  },
  denseRowIndex: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  denseRowName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12.5,
    fontWeight: '600',
  },
  denseRowSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10.5,
  },
  denseRowType: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11.5,
  },
  denseRowRemarks: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
  },
  miniStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  miniStatusText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: '700',
  },

  inspectBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  inspectBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: '600',
  },

  applicantSelectorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: SPACING[16],
  },
  selectorNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  selectorNavBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  selectorCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectorTitleText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
  },
  selectorNameText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12.5,
    fontWeight: '700',
  },

  reqItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  reqLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  reqNote: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11.5,
  },
  reqFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  reqFilename: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    flex: 1,
  },
  reqViewLink: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11.5,
    fontWeight: '600',
  },
  emptyReqs: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  emptyReqsText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12.5,
  },

  formCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: RADIUS.card,
    padding: SPACING[12],
    marginVertical: SPACING[4],
  },
  formCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[10],
    flex: 1,
  },
  formDocIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  formDocLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  formDocName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  formActions: {
    flexDirection: "row",
    gap: SPACING[10],
    marginTop: SPACING[2],
  },
  formActionLink: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  formBtnGroup: {
    flexDirection: "row",
    gap: SPACING[6],
  },
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[4],
    borderWidth: 1,
    borderRadius: RADIUS.button,
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[4],
  },
  downloadBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
  },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[4],
    borderWidth: 1,
    borderRadius: RADIUS.button,
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[4],
  },

  historyList: {
    paddingVertical: SPACING[4],
  },
  historyItem: {
    flexDirection: "row",
    gap: SPACING[12],
  },
  historyLeft: {
    alignItems: "center",
    width: 14,
  },
  historyCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.neutral[400],
    marginTop: 4,
  },
  historyCircleActive: {
    backgroundColor: COLORS.brand[700],
  },
  historyLine: {
    width: 2,
    flex: 1,
    minHeight: 30,
    marginVertical: 2,
  },
  historyRight: {
    flex: 1,
    paddingBottom: SPACING[12],
  },
  historyAction: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  historyStaff: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
  },
  historyDate: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    marginTop: 1,
  },

  noteBlock: {
    marginHorizontal: SPACING[16],
    marginVertical: SPACING[12],
    borderWidth: 1,
    borderRadius: RADIUS.card,
    padding: SPACING[12],
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING[6],
  },
  editLinkBlue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  noteText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    lineHeight: 18,
  },
  noteInput: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    borderWidth: 1,
    borderRadius: RADIUS.input,
    padding: SPACING[8],
    minHeight: 60,
  },
  saveNoteBtn: {
    alignSelf: "flex-end",
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[4],
    borderRadius: RADIUS.button,
  },
  saveNoteBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    fontWeight: TYPOGRAPHY.weights.semibold,
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

  billingContainer: {
    margin: SPACING[16],
    borderWidth: 1,
    borderRadius: RADIUS.card,
    padding: SPACING[16],
  },
  billingLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  billingTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginTop: 2,
  },
  billingSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    marginBottom: SPACING[12],
  },
  feeTable: {
    borderWidth: 1,
    borderRadius: RADIUS.card,
    overflow: "hidden",
    marginBottom: SPACING[16],
  },
  feeTableHeader: {
    flexDirection: "row",
    paddingHorizontal: SPACING[10],
    paddingVertical: SPACING[6],
  },
  feeTableHeaderCell: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: "uppercase",
  },
  feeTableDivider: {
    height: 1,
  },
  feeTableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING[10],
    paddingVertical: SPACING[8],
    borderTopWidth: 1,
  },
  feeParticularName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  feeParticularSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
  },
  feeTableCell: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    textAlign: "right",
  },
  totalBox: {
    borderWidth: 1,
    borderRadius: RADIUS.card,
    padding: SPACING[12],
  },
  totalRight: {
    alignItems: "flex-end",
  },
  totalLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  totalAmount: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginVertical: 2,
  },
  totalWords: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
    textAlign: "right",
  },
  totalDueDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[6],
    marginTop: SPACING[8],
  },
  totalDueDateLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
  },
  totalDueDate: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  inlineEditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[6],
  },
  inlineEditInput: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    borderWidth: 1,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[6],
    paddingVertical: SPACING[2],
  },
  inlineEditSave: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  editLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[4],
    marginTop: SPACING[4],
  },

  paymentSection: {
    marginHorizontal: SPACING[16],
    marginBottom: SPACING[16],
    borderWidth: 1,
    borderRadius: RADIUS.card,
    padding: SPACING[16],
  },
  paymentSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[8],
    marginBottom: SPACING[12],
  },
  paymentSectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentSectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  paymentRow: {
    flexDirection: "row",
    gap: SPACING[12],
  },
  amountReceivedCard: {
    borderRadius: RADIUS.card,
    padding: SPACING[12],
    flex: 1,
  },
  amountReceivedLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 0.5,
  },
  amountReceivedValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginVertical: 2,
  },
  excessBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: RADIUS.circle,
    paddingHorizontal: SPACING[6],
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginBottom: SPACING[8],
  },
  excessBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  paymentMethodBlock: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
    paddingTop: SPACING[6],
  },
  paymentMethodLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
    color: "rgba(255,255,255,0.7)",
  },
  paymentMethodValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: "uppercase",
  },
  orColumn: {
    flex: 1,
  },
  orLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  orValueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  orValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  orEditBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderWidth: 1,
    borderRadius: RADIUS.button,
    paddingHorizontal: SPACING[6],
    paddingVertical: 2,
  },
  orEditText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  checkInfoText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    marginTop: 2,
  },

  auditHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[10],
    borderTopWidth: 1,
  },
  auditHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[8],
  },
  auditTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  auditList: {
    paddingHorizontal: SPACING[16],
    paddingBottom: SPACING[12],
  },
  auditEmpty: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    paddingVertical: SPACING[6],
  },
  auditEntry: {
    paddingVertical: SPACING[6],
    borderBottomWidth: 1,
  },
  auditDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
  },
  auditMeta: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.label,
    marginTop: 1,
  },

  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: SPACING[8],
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[12],
    borderTopWidth: 1,
  },
  actionBtnPrimary: {
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.button,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[6],
  },
  actionBtnPrimaryText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  actionBtnOutline: {
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.button,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[6],
  },
  actionBtnOutlineText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  actionBtnDisabled: {
    opacity: 0.5,
  },
});
