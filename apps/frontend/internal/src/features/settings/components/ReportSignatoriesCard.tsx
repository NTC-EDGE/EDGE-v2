import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  DEFAULT_REPORT_SIGNATORIES,
  ReportSignatoriesDto,
  TenantMemberDto,
  useTenantMembers,
} from '@edge/api';
import { COLORS, Icon as Lucide, RADIUS, SHADOWS, SPACING, TYPOGRAPHY, useTheme } from '@edge/ui';

type IconName = keyof typeof Lucide.glyphMap;

interface SignatorySlotConfig {
  id: string;
  group: 'approving' | 'finance';
  label: string;
  icon: IconName;
  nameKey: keyof ReportSignatoriesDto;
  titleKey: keyof ReportSignatoriesDto;
  namePlaceholder: string;
  titlePlaceholder: string;
  usedIn: string;
  supportsAutoFallback?: boolean;
}

const SIGNATORY_SLOTS: readonly SignatorySlotConfig[] = [
  {
    id: 'regional-director',
    group: 'approving',
    label: 'Regional Director',
    icon: 'award',
    nameKey: 'regionalDirectorName',
    titleKey: 'regionalDirectorTitle',
    namePlaceholder: 'e.g., ENGR. JUAN DELA CRUZ',
    titlePlaceholder: 'Regional Director',
    usedIn: 'MIS Operations, Application Summaries, Volume Analytics, Examination Masterlist',
  },
  {
    id: 'chief-eod',
    group: 'approving',
    label: 'Chief, Enforcement & Operations Division',
    icon: 'shield',
    nameKey: 'chiefEodName',
    titleKey: 'chiefEodTitle',
    namePlaceholder: 'e.g., ENGR. MARIA SANTOS',
    titlePlaceholder: 'Chief, Enforcement & Operations Division',
    usedIn: 'Application Summaries (Evaluator, Service, Entity), Application Volume Analytics',
  },
  {
    id: 'exam-proctor',
    group: 'approving',
    label: 'Examination Proctor / Chair',
    icon: 'user-check',
    nameKey: 'examProctorName',
    titleKey: 'examProctorTitle',
    namePlaceholder: 'e.g., ENGR. PEDRO REYES',
    titlePlaceholder: 'Authorized Examination Proctor',
    usedIn: 'Radio Operator Examination Masterlist (NTC-EXAM-MST-01)',
  },
  {
    id: 'regional-accountant',
    group: 'finance',
    label: 'Regional Accountant / Chief, FAD',
    icon: 'briefcase',
    nameKey: 'regionalAccountantName',
    titleKey: 'regionalAccountantTitle',
    namePlaceholder: 'e.g., CPA ANA GARCIA',
    titlePlaceholder: 'Regional Accountant III',
    usedIn: 'COA Appendix 26 (Monthly & Daily), BIR DST, BTr Income Remittance',
  },
  {
    id: 'collecting-officer',
    group: 'finance',
    label: 'Collecting Officer / Cashier',
    icon: 'credit-card',
    nameKey: 'collectingOfficerName',
    titleKey: 'collectingOfficerTitle',
    namePlaceholder: 'Leave blank to use logged-in officer',
    titlePlaceholder: 'Collecting Officer / Regional Cashier III',
    usedIn: 'COA Appendix 26 (Monthly & Daily), BIR DST, BTr Income Remittance',
    supportsAutoFallback: true,
  },
  {
    id: 'mis-officer',
    group: 'finance',
    label: 'MIS / Planning Officer',
    icon: 'file-text',
    nameKey: 'misOfficerName',
    titleKey: 'misOfficerTitle',
    namePlaceholder: 'Leave blank to use logged-in officer',
    titlePlaceholder: 'MIS / Planning Officer',
    usedIn: 'Monthly Regional MIS & Operations Accomplishment Report (NTC-MIS-OPS-01)',
    supportsAutoFallback: true,
  },
];

function normalizeSignatories(input?: ReportSignatoriesDto): ReportSignatoriesDto {
  return {
    regionalDirectorName: input?.regionalDirectorName ?? DEFAULT_REPORT_SIGNATORIES.regionalDirectorName,
    regionalDirectorTitle: input?.regionalDirectorTitle ?? DEFAULT_REPORT_SIGNATORIES.regionalDirectorTitle,
    chiefEodName: input?.chiefEodName ?? DEFAULT_REPORT_SIGNATORIES.chiefEodName,
    chiefEodTitle: input?.chiefEodTitle ?? DEFAULT_REPORT_SIGNATORIES.chiefEodTitle,
    regionalAccountantName: input?.regionalAccountantName ?? DEFAULT_REPORT_SIGNATORIES.regionalAccountantName,
    regionalAccountantTitle: input?.regionalAccountantTitle ?? DEFAULT_REPORT_SIGNATORIES.regionalAccountantTitle,
    collectingOfficerName: input?.collectingOfficerName ?? DEFAULT_REPORT_SIGNATORIES.collectingOfficerName,
    collectingOfficerTitle: input?.collectingOfficerTitle ?? DEFAULT_REPORT_SIGNATORIES.collectingOfficerTitle,
    misOfficerName: input?.misOfficerName ?? DEFAULT_REPORT_SIGNATORIES.misOfficerName,
    misOfficerTitle: input?.misOfficerTitle ?? DEFAULT_REPORT_SIGNATORIES.misOfficerTitle,
    examProctorName: input?.examProctorName ?? DEFAULT_REPORT_SIGNATORIES.examProctorName,
    examProctorTitle: input?.examProctorTitle ?? DEFAULT_REPORT_SIGNATORIES.examProctorTitle,
  };
}

function areSignatoriesEqual(a: ReportSignatoriesDto, b: ReportSignatoriesDto): boolean {
  return (
    a.regionalDirectorName === b.regionalDirectorName &&
    a.regionalDirectorTitle === b.regionalDirectorTitle &&
    a.chiefEodName === b.chiefEodName &&
    a.chiefEodTitle === b.chiefEodTitle &&
    a.regionalAccountantName === b.regionalAccountantName &&
    a.regionalAccountantTitle === b.regionalAccountantTitle &&
    a.collectingOfficerName === b.collectingOfficerName &&
    a.collectingOfficerTitle === b.collectingOfficerTitle &&
    a.misOfficerName === b.misOfficerName &&
    a.misOfficerTitle === b.misOfficerTitle &&
    a.examProctorName === b.examProctorName &&
    a.examProctorTitle === b.examProctorTitle
  );
}

function formatStaffFullName(member: TenantMemberDto): string {
  const parts: string[] = [];
  const first = member.userFirstName.trim();
  const middle = (member.userMiddleName ?? '').trim();
  const last = member.userLastName.trim();
  const suffix = (member.userSuffix ?? '').trim();

  if (first.length > 0) parts.push(first);
  if (middle.length > 0) {
    parts.push(middle.length === 1 ? `${middle}.` : `${middle.charAt(0)}.`);
  }
  if (last.length > 0) parts.push(last);
  if (suffix.length > 0) parts.push(suffix);

  return parts.join(' ').trim();
}

function resolveStaffTitle(member: TenantMemberDto): string {
  const candidates = [member.designation, member.position, member.jobTitle, member.roleName];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }
  return '';
}

export interface ReportSignatoriesCardProps {
  tenantId?: string;
  signatories?: ReportSignatoriesDto;
  onSave: (signatories: ReportSignatoriesDto) => Promise<void> | void;
}

export function ReportSignatoriesCard({
  tenantId,
  signatories,
  onSave,
}: ReportSignatoriesCardProps) {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const baseline = useMemo(() => normalizeSignatories(signatories), [signatories]);
  const [formState, setFormState] = useState<ReportSignatoriesDto>(baseline);
  const [isSaving, setIsSaving] = useState(false);

  const [pickerSlot, setPickerSlot] = useState<SignatorySlotConfig | null>(null);
  const [staffSearch, setStaffSearch] = useState('');

  const { members, isLoading: isLoadingMembers } = useTenantMembers(tenantId);

  useEffect(() => {
    setFormState(baseline);
  }, [baseline]);

  const activeStaff = useMemo(() => {
    return members.filter((m) => !m.isDeleted);
  }, [members]);

  const filteredStaff = useMemo(() => {
    const query = staffSearch.trim().toLowerCase();
    if (query.length === 0) return activeStaff;

    return activeStaff.filter((member) => {
      const fullName = formatStaffFullName(member).toLowerCase();
      const title = resolveStaffTitle(member).toLowerCase();
      const division = (member.division ?? '').toLowerCase();
      const email = (member.userEmail ?? '').toLowerCase();
      return (
        fullName.includes(query) ||
        title.includes(query) ||
        division.includes(query) ||
        email.includes(query)
      );
    });
  }, [activeStaff, staffSearch]);

  const isDirty = useMemo(() => !areSignatoriesEqual(formState, baseline), [formState, baseline]);

  const configuredCount = useMemo(() => {
    const names = [
      formState.regionalDirectorName,
      formState.chiefEodName,
      formState.examProctorName,
      formState.regionalAccountantName,
      formState.collectingOfficerName,
      formState.misOfficerName,
    ];
    return names.filter((n) => n.trim().length > 0).length;
  }, [formState]);

  const handleFieldChange = (key: keyof ReportSignatoriesDto, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSelectStaff = (member: TenantMemberDto) => {
    if (pickerSlot === null) return;
    const pickedName = formatStaffFullName(member);
    const pickedTitle = resolveStaffTitle(member);

    setFormState((prev) => ({
      ...prev,
      [pickerSlot.nameKey]: pickedName,
      [pickerSlot.titleKey]: pickedTitle.length > 0 ? pickedTitle : prev[pickerSlot.titleKey],
    }));

    setPickerSlot(null);
    setStaffSearch('');
  };

  const handleClearSlot = (slot: SignatorySlotConfig) => {
    setFormState((prev) => ({
      ...prev,
      [slot.nameKey]: '',
      [slot.titleKey]: DEFAULT_REPORT_SIGNATORIES[slot.titleKey],
    }));
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const trimmedPayload: ReportSignatoriesDto = {
        regionalDirectorName: formState.regionalDirectorName.trim(),
        regionalDirectorTitle: formState.regionalDirectorTitle.trim(),
        chiefEodName: formState.chiefEodName.trim(),
        chiefEodTitle: formState.chiefEodTitle.trim(),
        regionalAccountantName: formState.regionalAccountantName.trim(),
        regionalAccountantTitle: formState.regionalAccountantTitle.trim(),
        collectingOfficerName: formState.collectingOfficerName.trim(),
        collectingOfficerTitle: formState.collectingOfficerTitle.trim(),
        misOfficerName: formState.misOfficerName.trim(),
        misOfficerTitle: formState.misOfficerTitle.trim(),
        examProctorName: formState.examProctorName.trim(),
        examProctorTitle: formState.examProctorTitle.trim(),
      };
      await onSave(trimmedPayload);
    } finally {
      setIsSaving(false);
    }
  };

  const approvingSlots = SIGNATORY_SLOTS.filter((s) => s.group === 'approving');
  const financeSlots = SIGNATORY_SLOTS.filter((s) => s.group === 'finance');

  const renderSlotCard = (slot: SignatorySlotConfig) => {
    const nameValue = formState[slot.nameKey];
    const titleValue = formState[slot.titleKey];
    const hasConfiguredName = nameValue.trim().length > 0;

    return (
      <View
        key={slot.id}
        style={[
          styles.slotCard,
          isMobile && styles.slotCardMobile,
          {
            backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.slotHeader}>
          <View style={styles.slotHeaderLeft}>
            <View
              style={[
                styles.slotIconBox,
                {
                  backgroundColor: isDark ? colors.neutral[800] : colors.brand.light,
                },
              ]}
            >
              <Lucide
                name={slot.icon}
                size={15}
                color={isDark ? colors.brand[400] : colors.brand.primary}
              />
            </View>
            <View style={styles.slotTitleBlock}>
              <Text style={[styles.slotLabel, { color: colors.text }]}>{slot.label}</Text>
              <View style={styles.slotStatusRow}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: hasConfiguredName
                        ? COLORS.semantic.success
                        : slot.supportsAutoFallback
                        ? COLORS.brand.indigo
                        : COLORS.semantic.warning,
                    },
                  ]}
                />
                <Text style={[styles.slotStatusText, { color: colors.textMuted }]}>
                  {hasConfiguredName
                    ? 'Configured'
                    : slot.supportsAutoFallback
                    ? 'Auto-defaults to generating officer'
                    : 'Not set (prints designation only)'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.slotActions}>
            <Pressable
              onPress={() => {
                setStaffSearch('');
                setPickerSlot(slot);
              }}
              style={({ pressed }) => [
                styles.quickPickBtn,
                {
                  backgroundColor: isDark ? colors.neutral[800] : colors.cardBg,
                  borderColor: isDark ? colors.brand[500] : colors.brand.primary,
                },
                pressed && { opacity: 0.75 },
                Platform.select({ web: { cursor: 'pointer' } }),
              ]}
              accessibilityLabel={`Pick staff member for ${slot.label}`}
            >
              <Lucide
                name="users"
                size={12}
                color={isDark ? colors.brand[400] : colors.brand.primary}
              />
              <Text
                style={[
                  styles.quickPickBtnText,
                  { color: isDark ? colors.brand[400] : colors.brand.primary },
                ]}
              >
                Pick Staff
              </Text>
            </Pressable>

            {hasConfiguredName && (
              <Pressable
                onPress={() => handleClearSlot(slot)}
                style={({ pressed }) => [
                  styles.clearSlotBtn,
                  {
                    backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                    borderColor: colors.border,
                  },
                  pressed && { opacity: 0.7 },
                  Platform.select({ web: { cursor: 'pointer' } }),
                ]}
                accessibilityLabel={`Clear ${slot.label}`}
              >
                <Lucide name="x" size={12} color={colors.textMuted} />
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>PRINTED NAME</Text>
          <TextInput
            value={nameValue}
            onChangeText={(text) => handleFieldChange(slot.nameKey, text)}
            placeholder={slot.namePlaceholder}
            placeholderTextColor={colors.textMuted}
            maxLength={150}
            style={[
              styles.input,
              {
                backgroundColor: colors.cardBg,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
            OFFICIAL TITLE / DESIGNATION
          </Text>
          <TextInput
            value={titleValue}
            onChangeText={(text) => handleFieldChange(slot.titleKey, text)}
            placeholder={slot.titlePlaceholder}
            placeholderTextColor={colors.textMuted}
            maxLength={150}
            style={[
              styles.input,
              {
                backgroundColor: colors.cardBg,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
          />
        </View>

        <Text style={[styles.usedInText, { color: colors.textMuted }]}>
          Used in: {slot.usedIn}
        </Text>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: colors.cardBg,
          borderColor: colors.border,
        },
        SHADOWS.card,
      ]}
    >
      {/* Header Row */}
      <View style={[styles.headerRow, isMobile && styles.headerRowMobile]}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.headerIconBox,
              { backgroundColor: isDark ? colors.neutral[800] : colors.brand.light },
            ]}
          >
            <Lucide
              name="edit-3"
              size={19}
              color={isDark ? colors.brand[400] : colors.brand.primary}
            />
          </View>
          <View style={styles.headerTextBlock}>
            <View style={styles.headerTitleLine}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Statutory Report Signatories
              </Text>
              <View
                style={[
                  styles.countPill,
                  { backgroundColor: isDark ? colors.neutral[800] : colors.brand.light },
                ]}
              >
                <Text
                  style={[
                    styles.countPillText,
                    { color: isDark ? colors.brand[400] : colors.brand.primary },
                  ]}
                >
                  {configuredCount}/6 Assigned
                </Text>
              </View>
            </View>
            <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
              Configure official printed names and designations stamped on all 10 Regional Compliance &amp; Statutory PDF reports (COA, BIR, BTr, MIS, Application &amp; Examination reports).
            </Text>
          </View>
        </View>

        <View style={[styles.headerActions, isMobile && styles.headerActionsMobile]}>
          {isDirty && (
            <Pressable
              onPress={() => setFormState(baseline)}
              disabled={isSaving}
              style={({ pressed }) => [
                styles.resetBtn,
                {
                  backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                  borderColor: colors.border,
                },
                pressed && { opacity: 0.75 },
                Platform.select({ web: { cursor: 'pointer' } }),
              ]}
            >
              <Lucide name="rotate-ccw" size={14} color={colors.textMuted} />
              <Text style={[styles.resetBtnText, { color: colors.text }]}>Reset</Text>
            </Pressable>
          )}

          <Pressable
            onPress={() => {
              void handleSave();
            }}
            disabled={isSaving || !isDirty}
            style={({ pressed }) => [
              styles.saveBtn,
              {
                backgroundColor:
                  !isDirty && !isSaving
                    ? isDark
                      ? colors.neutral[800]
                      : colors.neutral[200]
                    : isDark
                    ? colors.brand[600]
                    : colors.brand.primary,
              },
              pressed && isDirty && { opacity: 0.85 },
              Platform.select({ web: { cursor: isDirty && !isSaving ? 'pointer' : 'auto' } }),
            ]}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={COLORS.neutral.white} />
            ) : (
              <Lucide
                name="save"
                size={14}
                color={!isDirty ? colors.textMuted : COLORS.neutral.white}
              />
            )}
            <Text
              style={[
                styles.saveBtnText,
                { color: !isDirty && !isSaving ? colors.textMuted : COLORS.neutral.white },
              ]}
            >
              {isSaving ? 'Saving...' : 'Save Report Signatories'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Guidance Callout */}
      <View
        style={[
          styles.infoBanner,
          {
            backgroundColor: isDark ? colors.neutral[900] : colors.brand.light,
            borderColor: colors.border,
          },
        ]}
      >
        <Lucide
          name="info"
          size={15}
          color={isDark ? colors.brand[400] : colors.brand.primary}
        />
        <Text style={[styles.infoBannerText, { color: colors.textMuted }]}>
          Clean wet-ink signature space is preserved above each printed name for COA/BIR/BTr physical signing. Use{' '}
          <Text style={{ fontWeight: TYPOGRAPHY.weights.bold, color: colors.text }}>Pick Staff</Text>{' '}
          to auto-fill from active regional staff or type an Acting / OIC officer directly.
        </Text>
      </View>

      {/* Group 1: Approving & Operations Authority */}
      <View style={styles.groupSection}>
        <Text style={[styles.groupTitle, { color: colors.textMuted }]}>
          APPROVING &amp; OPERATIONS AUTHORITY
        </Text>
        <View style={[styles.slotsGrid, isMobile && styles.slotsGridMobile]}>
          {approvingSlots.map(renderSlotCard)}
        </View>
      </View>

      {/* Group 2: Finance & Reporting Officers */}
      <View style={styles.groupSection}>
        <Text style={[styles.groupTitle, { color: colors.textMuted }]}>
          FINANCE &amp; REPORTING OFFICERS
        </Text>
        <View style={[styles.slotsGrid, isMobile && styles.slotsGridMobile]}>
          {financeSlots.map(renderSlotCard)}
        </View>
      </View>

      {/* Staff Directory Quick-Pick Modal */}
      <Modal
        visible={pickerSlot !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerSlot(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setPickerSlot(null)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.cardBg,
                borderColor: colors.border,
              },
              SHADOWS.card,
            ]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View style={styles.modalHeaderText}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Select Regional Officer
                </Text>
                {pickerSlot !== null && (
                  <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                    Assigning signatory for {pickerSlot.label}
                  </Text>
                )}
              </View>
              <Pressable
                onPress={() => setPickerSlot(null)}
                style={({ pressed }) => [
                  styles.modalCloseBtn,
                  { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] },
                  pressed && { opacity: 0.7 },
                  Platform.select({ web: { cursor: 'pointer' } }),
                ]}
              >
                <Lucide name="x" size={16} color={colors.textMuted} />
              </Pressable>
            </View>

            <View style={styles.modalSearchContainer}>
              <View
                style={[
                  styles.modalSearchBox,
                  {
                    backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                    borderColor: colors.border,
                  },
                ]}
              >
                <Lucide name="search" size={15} color={colors.textMuted} />
                <TextInput
                  value={staffSearch}
                  onChangeText={setStaffSearch}
                  placeholder="Search by staff name, designation, or division..."
                  placeholderTextColor={colors.textMuted}
                  style={[styles.modalSearchInput, { color: colors.text }]}
                />
                {staffSearch.length > 0 && (
                  <Pressable
                    onPress={() => setStaffSearch('')}
                    style={Platform.select({ web: { cursor: 'pointer' } })}
                  >
                    <Lucide name="x" size={14} color={colors.textMuted} />
                  </Pressable>
                )}
              </View>
            </View>

            <ScrollView style={styles.staffList} contentContainerStyle={styles.staffListContent}>
              {isLoadingMembers ? (
                <View style={styles.emptyStaffBox}>
                  <ActivityIndicator
                    size="small"
                    color={isDark ? colors.brand[400] : colors.brand.primary}
                  />
                  <Text style={[styles.emptyStaffText, { color: colors.textMuted }]}>
                    Loading regional staff directory...
                  </Text>
                </View>
              ) : filteredStaff.length === 0 ? (
                <View style={styles.emptyStaffBox}>
                  <Lucide name="users" size={24} color={colors.textMuted} />
                  <Text style={[styles.emptyStaffText, { color: colors.textMuted }]}>
                    No matching regional staff members found. You can close this dialog and type an official&apos;s name manually.
                  </Text>
                </View>
              ) : (
                filteredStaff.map((member) => {
                  const fullName = formatStaffFullName(member);
                  const title = resolveStaffTitle(member);
                  return (
                    <Pressable
                      key={member.id}
                      onPress={() => handleSelectStaff(member)}
                      style={({ pressed }) => [
                        styles.staffRow,
                        {
                          backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                          borderColor: colors.border,
                        },
                        pressed && { opacity: 0.75 },
                        Platform.select({ web: { cursor: 'pointer' } }),
                      ]}
                    >
                      <View style={styles.staffRowMain}>
                        <Text style={[styles.staffName, { color: colors.text }]}>
                          {fullName || member.userEmail}
                        </Text>
                        <Text style={[styles.staffMeta, { color: colors.textMuted }]}>
                          {title.length > 0 ? title : member.roleName}
                          {member.division ? ` · ${member.division}` : ''}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.selectTag,
                          { backgroundColor: isDark ? colors.neutral[800] : colors.brand.light },
                        ]}
                      >
                        <Text
                          style={[
                            styles.selectTagText,
                            { color: isDark ? colors.brand[400] : colors.brand.primary },
                          ]}
                        >
                          Use
                        </Text>
                      </View>
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: SPACING[16],
    gap: SPACING[16],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING[12],
    flexWrap: 'wrap',
  },
  headerRowMobile: {
    flexDirection: 'column',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING[12],
    flex: 1,
    minWidth: 240,
  },
  headerIconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextBlock: {
    flex: 1,
    gap: 4,
  },
  headerTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING[8],
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  countPill: {
    paddingHorizontal: SPACING[8],
    paddingVertical: 2,
    borderRadius: RADIUS.button,
  },
  countPillText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    lineHeight: 18,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
  },
  headerActionsMobile: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.button,
    borderWidth: 1,
  },
  resetBtnText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.button,
  },
  saveBtnText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING[8],
    padding: SPACING[12],
    borderRadius: RADIUS.input,
    borderWidth: 1,
  },
  infoBannerText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    lineHeight: 18,
  },
  groupSection: {
    gap: SPACING[10],
  },
  groupTitle: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.7,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[12],
  },
  slotsGridMobile: {
    flexDirection: 'column',
  },
  slotCard: {
    flexGrow: 1,
    flexBasis: 310,
    minWidth: 280,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    padding: SPACING[12],
    gap: SPACING[10],
  },
  slotCardMobile: {
    flexBasis: 'auto',
    minWidth: 0,
    width: '100%',
  },
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING[8],
  },
  slotHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    flex: 1,
  },
  slotIconBox: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotTitleBlock: {
    flex: 1,
    gap: 2,
  },
  slotLabel: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  slotStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  slotStatusText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  slotActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickPickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING[8],
    paddingVertical: 5,
    borderRadius: RADIUS.button,
    borderWidth: 1,
  },
  quickPickBtnText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  clearSlotBtn: {
    width: 26,
    height: 26,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldGroup: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  input: {
    height: 38,
    borderRadius: RADIUS.input,
    borderWidth: 1,
    paddingHorizontal: SPACING[10],
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  usedInText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.primary,
    lineHeight: 15,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[16],
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '80%',
    borderRadius: RADIUS.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING[16],
    borderBottomWidth: 1,
    gap: SPACING[12],
  },
  modalHeaderText: {
    flex: 1,
    gap: 2,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.body,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  modalSubtitle: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSearchContainer: {
    paddingHorizontal: SPACING[16],
    paddingTop: SPACING[12],
    paddingBottom: SPACING[8],
  },
  modalSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[8],
    borderWidth: 1,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[10],
    height: 40,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  staffList: {
    maxHeight: 380,
  },
  staffListContent: {
    padding: SPACING[16],
    paddingTop: SPACING[8],
    gap: SPACING[8],
  },
  emptyStaffBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[24],
    gap: SPACING[8],
  },
  emptyStaffText: {
    fontSize: TYPOGRAPHY.sizes.caption,
    fontFamily: TYPOGRAPHY.fonts.primary,
    textAlign: 'center',
    lineHeight: 18,
  },
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING[12],
    borderRadius: RADIUS.input,
    borderWidth: 1,
    gap: SPACING[10],
  },
  staffRowMain: {
    flex: 1,
    gap: 2,
  },
  staffName: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  staffMeta: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  selectTag: {
    paddingHorizontal: SPACING[10],
    paddingVertical: 4,
    borderRadius: RADIUS.button,
  },
  selectTagText: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
