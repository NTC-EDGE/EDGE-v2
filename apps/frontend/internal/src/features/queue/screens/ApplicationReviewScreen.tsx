import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Image,
} from "react-native";
import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
  Icon as Lucide,
} from "@edge/ui";
import { ApplicationData } from "../data/mockApplications";
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
  { key: "basic", label: "Basic Info", icon: "user" },
  { key: "details", label: "Application Details", icon: "clipboard" },
  { key: "requirements", label: "Requirements", icon: "list" },
  { key: "soa", label: "SOA & Payment", icon: "credit-card" },
];

function getStatusStyle(status: string): { bg: string; text: string } {
  const s = status.toLowerCase();
  if (s === "completed" || s === "approved")
    return { bg: COLORS.brand[800], text: COLORS.neutral.white };
  if (s === "for approval")
    return { bg: "#F59E0B", text: COLORS.neutral.white };
  if (s === "for verification")
    return { bg: "#06B6D4", text: COLORS.neutral.white };
  if (s === "returned") return { bg: "#EF4444", text: COLORS.neutral.white };
  if (s === "declined") return { bg: "#EF4444", text: COLORS.neutral.white };
  if (s === "in process") return { bg: "#8B5CF6", text: COLORS.neutral.white };
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
  return (
    <View style={sectionStyles.header}>
      <Text style={sectionStyles.title}>{title}</Text>
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.neutral[100],
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[8],
    marginVertical: SPACING[8],
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[500],
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
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      {isEditing ? (
        <View style={infoStyles.editRow}>
          <TextInput
            style={infoStyles.editInput}
            value={editValue}
            onChangeText={onEditChange}
            onBlur={onEditDone}
            autoFocus
          />
          <Pressable style={infoStyles.saveBtn} onPress={onEditDone}>
            <Text style={infoStyles.saveBtnText}>Save</Text>
          </Pressable>
        </View>
      ) : (
        <View style={infoStyles.valueRow}>
          <Text style={infoStyles.value}>{value}</Text>
          {onEdit !== undefined && (
            <Pressable onPress={onEdit}>
              <Text style={infoStyles.editLink}>Edit</Text>
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
    borderBottomColor: COLORS.neutral[100],
  },
  label: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[500],
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
    fontSize: 13,
    color: COLORS.neutral[800],
    fontWeight: TYPOGRAPHY.weights.medium,
    flex: 1,
  },
  editLink: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.brand[700],
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
    fontSize: 13,
    color: COLORS.neutral[800],
    backgroundColor: COLORS.neutral[50],
    borderWidth: 1,
    borderColor: COLORS.brand[500],
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[4],
    outline: "none",
  } as unknown as object,
  saveBtn: {
    backgroundColor: COLORS.brand[700],
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[4],
    borderRadius: RADIUS.button,
  },
  saveBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
  },
});

// ─── Tabs ────────────────────────────────────────────────────────────────────

function BasicInfoTab({
  app,
  isEditable,
  updateApplication,
}: {
  app: ApplicationData;
  isEditable: boolean;
  updateApplication: (id: string, patch: Partial<ApplicationData>) => void;
}) {
  const [editingRef, setEditingRef] = useState(false);
  const [editingPermit, setEditingPermit] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [refDraft, setRefDraft] = useState(app.referenceNumber);
  const [permitDraft, setPermitDraft] = useState(app.permitNumber);
  const [noteDraft, setNoteDraft] = useState(app.note);
  const statusStyle = getStatusStyle(app.status);

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Status */}
      <View style={styles.statusBlock}>
        <View style={styles.statusRow}>
          <View
            style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}
          >
            <Text style={[styles.statusPillText, { color: statusStyle.text }]}>
              {app.status.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.statusActor}>by ADMIN EDGE</Text>
        </View>
      </View>

      <View style={styles.infoBlock}>
        <Text style={styles.fieldGroupLabel}>REFERENCE NUMBER</Text>
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

        <Text style={[styles.fieldGroupLabel, { marginTop: SPACING[12] }]}>
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

      <SectionHeader title="ADDRESS" />
      <View style={styles.infoBlock}>
        <InfoRow label="Barangay:" value={app.address.barangay} />
        <InfoRow label="Province:" value={app.address.province} />
        <InfoRow label="City/Municipality:" value={app.address.city} />
        <InfoRow label="Zip Code:" value={app.address.zipCode} />
      </View>

      <SectionHeader title="CONTACT DETAILS" />
      <View style={styles.infoBlock}>
        <InfoRow
          label="Contact Number:"
          value={app.contactDetails.contactNumber}
        />
        <InfoRow label="Email:" value={app.contactDetails.email} />
      </View>

      <SectionHeader title="APPLICATION DETAILS" />
      <View style={styles.infoBlock}>
        <InfoRow
          label="No Of Years:"
          value={String(app.applicationDetails.noOfYears)}
        />
      </View>

      <SectionHeader title="BASIC INFORMATION" />
      <View style={styles.infoBlock}>
        <InfoRow label="Last Name:" value={app.basicInfo.lastName} />
        <InfoRow label="First Name:" value={app.basicInfo.firstName} />
        <InfoRow label="Middle Name:" value={app.basicInfo.middleName} />
        <InfoRow label="Date Of Birth:" value={app.basicInfo.dob} />
        <InfoRow label="Sex:" value={app.basicInfo.sex} />
        <InfoRow label="Weight:" value={String(app.basicInfo.weight)} />
        <InfoRow label="Height:" value={String(app.basicInfo.height)} />
        <InfoRow label="Nationality:" value={app.basicInfo.nationality} />
      </View>

      <SectionHeader title="EMPLOYMENT" />
      <View style={styles.infoBlock}>
        <InfoRow label="Status:" value={app.basicInfo.employmentStatus} />
      </View>

      {/* NOTE */}
      <View style={styles.noteBlock}>
        <View style={styles.noteHeader}>
          <Text style={styles.fieldGroupLabel}>NOTE</Text>
          {isEditable && !editingNote && (
            <Pressable
              onPress={() => {
                setNoteDraft(app.note);
                setEditingNote(true);
              }}
            >
              <Text style={styles.editLinkBlue}>EDIT</Text>
            </Pressable>
          )}
        </View>
        {editingNote ? (
          <View style={{ gap: SPACING[8] }}>
            <TextInput
              style={styles.noteInput}
              multiline
              value={noteDraft}
              onChangeText={setNoteDraft}
              textAlignVertical="top"
              autoFocus
            />
            <Pressable
              style={styles.saveNoteBtn}
              onPress={() => {
                setEditingNote(false);
                updateApplication(app.id, { note: noteDraft });
              }}
            >
              <Text style={styles.saveNoteBtnText}>Save Note</Text>
            </Pressable>
          </View>
        ) : (
          <Text style={styles.noteText}>{app.note}</Text>
        )}
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

function ApplicationDetailsTab({ app }: { app: ApplicationData }) {
  const accountableForms = app.forms.filter(
    (f) => f.section === "ACCOUNTABLE FORM",
  );
  const downloadForms = app.forms.filter((f) => f.section === "DOWNLOAD FORM");

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Application Form section */}
      <SectionHeader title="APPLICATION FORM" />
      <View style={styles.infoBlock}>
        <Text style={styles.submittedText}>
          {app.applicationDetails.submittedAt}
        </Text>
        <Text style={styles.permitCategoryText}>{app.permitTitle}</Text>
        <Text style={styles.formTypeText}>
          {app.applicationDetails.formType}
        </Text>
      </View>

      {/* Accountable Form */}
      {accountableForms.length > 0 && (
        <>
          <SectionHeader title="ACCOUNTABLE FORM" />
          <View style={styles.infoBlock}>
            {accountableForms.map((form) => (
              <View key={form.name} style={styles.formCard}>
                <View style={styles.formCardLeft}>
                  <View style={styles.formDocIcon}>
                    <Lucide
                      name="file-text"
                      size={18}
                      color={COLORS.brand[700]}
                    />
                  </View>
                  <View>
                    <Text style={styles.formDocLabel}>DOCUMENT ATTACHMENT</Text>
                    <Text style={styles.formDocName}>{form.name}</Text>
                    <View style={styles.formActions}>
                      {form.canView && (
                        <Pressable>
                          <Text style={styles.formActionLink}>View</Text>
                        </Pressable>
                      )}
                      {form.canPrint && (
                        <Pressable>
                          <Text style={styles.formActionLink}>Print</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                </View>
                {form.canDownload && (
                  <Pressable style={styles.downloadBtn}>
                    <Lucide
                      name="download"
                      size={14}
                      color={COLORS.neutral[600]}
                    />
                    <Text style={styles.downloadBtnText}>Download</Text>
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
              <View key={form.name} style={styles.formCard}>
                <View style={styles.formCardLeft}>
                  <View style={styles.formDocIcon}>
                    <Lucide
                      name="file-text"
                      size={18}
                      color={COLORS.brand[700]}
                    />
                  </View>
                  <View>
                    <Text style={styles.formDocLabel}>DOCUMENT ATTACHMENT</Text>
                    <Text style={styles.formDocName}>{form.name}</Text>
                    <View style={styles.formActions}>
                      {form.canView && (
                        <Pressable>
                          <Text style={styles.formActionLink}>View</Text>
                        </Pressable>
                      )}
                      {form.canPrint && (
                        <Pressable>
                          <Text style={styles.formActionLink}>Print</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                </View>
                <View style={styles.formBtnGroup}>
                  {form.canDownload && (
                    <Pressable style={styles.downloadBtn}>
                      <Lucide
                        name="download"
                        size={14}
                        color={COLORS.neutral[600]}
                      />
                      <Text style={styles.downloadBtnText}>Download</Text>
                    </Pressable>
                  )}
                  {form.canRefresh && (
                    <Pressable style={styles.refreshBtn}>
                      <Lucide
                        name="refresh-cw"
                        size={14}
                        color={COLORS.neutral[600]}
                      />
                      <Text style={styles.downloadBtnText}>Refresh</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            ))}
          </View>
        </>
      )}
      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

function RequirementsTab({ app }: { app: ApplicationData }) {
  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {app.requirements.length === 0 ? (
        <View style={styles.emptyReqs}>
          <Lucide name="folder" size={28} color={COLORS.neutral[300]} />
          <Text style={styles.emptyReqsText}>No requirements submitted</Text>
        </View>
      ) : (
        app.requirements.map((req, idx) => (
          <View key={idx} style={styles.reqItem}>
            <Text style={styles.reqLabel}>{req.label}</Text>
            {req.note !== undefined && req.note.length > 0 && (
              <Text style={styles.reqNote}>{req.note}</Text>
            )}
            <View style={styles.reqFileRow}>
              <Lucide name="file" size={13} color={COLORS.neutral[400]} />
              <Text style={styles.reqFilename} numberOfLines={1}>
                {req.filename}
              </Text>
              <Pressable>
                <Text style={styles.reqViewLink}>View</Text>
              </Pressable>
            </View>
            {/* Thumbnail placeholder */}
            <View style={styles.reqThumbnail}>
              <Lucide name="image" size={24} color={COLORS.neutral[300]} />
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
      <View style={styles.billingContainer}>
        <Text style={styles.billingLabel}>OFFICIAL BILLING RECORD</Text>
        <Text style={styles.billingTitle}>Statement of Account</Text>
        <Text style={styles.billingSubtitle}>
          Review the billing particulars, charges, and due date below.
        </Text>

        {/* Fee table */}
        <View style={styles.feeTable}>
          {/* Header */}
          <View style={styles.feeTableHeader}>
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
                  col === "Particular"
                    ? { flex: 2 }
                    : { flex: 1, textAlign: "right" },
                ]}
              >
                {col}
              </Text>
            ))}
          </View>
          <View style={styles.feeTableDivider} />

          {app.soaItems.map((item, idx) => (
            <View key={idx} style={styles.feeTableRow}>
              <View style={{ flex: 2 }}>
                <Text style={styles.feeParticularName}>{item.particular}</Text>
                <Text style={styles.feeParticularSub}>
                  Validity • {item.validityYears} Year(s)
                </Text>
                <Text style={styles.feeParticularSub}>Code: {item.code}</Text>
              </View>
              <Text style={[styles.feeTableCell, { flex: 1 }]}>
                {item.validityYears}
              </Text>
              <Text style={[styles.feeTableCell, { flex: 1 }]}>
                {item.percentage}
              </Text>
              <Text style={[styles.feeTableCell, { flex: 1 }]}>
                {item.noOfUnits}
              </Text>
              <Text style={[styles.feeTableCell, { flex: 1 }]}>
                {item.fees}
              </Text>
              <Text style={[styles.feeTableCell, { flex: 1 }]}>
                {formatAmount(item.amount)}
              </Text>
            </View>
          ))}
        </View>

        {/* Total Amount Due */}
        <View style={styles.totalBox}>
          <View style={styles.totalRight}>
            <Text style={styles.totalLabel}>TOTAL AMOUNT DUE</Text>
            <Text style={styles.totalAmount}>
              {formatAmount(app.totalAmountDue)}
            </Text>
            <Text style={styles.totalWords}>{amountWords.toUpperCase()}</Text>
            <View style={styles.totalDueDateRow}>
              <Text style={styles.totalDueDateLabel}>
                To be paid on or before:
              </Text>
              {editingDueDate ? (
                <View style={styles.inlineEditRow}>
                  <TextInput
                    style={styles.inlineEditInput}
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
                    <Text style={styles.inlineEditSave}>Save</Text>
                  </Pressable>
                </View>
              ) : (
                <Text style={styles.totalDueDate}>{app.dueDate}</Text>
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
                <Lucide name="edit-2" size={12} color={COLORS.brand[700]} />
                <Text style={styles.editLinkBlue}>Edit</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {/* Payment Summary */}
      <View style={styles.paymentSection}>
        <View style={styles.paymentSectionHeader}>
          <View style={styles.paymentSectionIcon}>
            <Lucide name="circle" size={20} color={COLORS.neutral[400]} />
          </View>
          <Text style={styles.paymentSectionTitle}>Payment Summary</Text>
        </View>

        <View style={styles.paymentRow}>
          {/* Amount Received blue card */}
          <View style={styles.amountReceivedCard}>
            <Text style={styles.amountReceivedLabel}>AMOUNT RECEIVED</Text>
            <Text style={styles.amountReceivedValue}>
              {app.payment.amountReceived}
            </Text>
            {excess > 0 && (
              <View style={styles.excessBadge}>
                <Text style={styles.excessBadgeText}>Excess: ₱{excess}</Text>
              </View>
            )}
            <View style={styles.paymentMethodBlock}>
              <Text style={styles.paymentMethodLabel}>PAYMENT METHOD</Text>
              <Text style={styles.paymentMethodValue}>
                {app.payment.method}
              </Text>
            </View>
          </View>

          {/* OR Number column */}
          <View style={styles.orColumn}>
            <Text style={styles.orLabel}>OFFICIAL RECEIPT (OR) NUMBER</Text>
            {editingOrNumber ? (
              <View style={styles.inlineEditRow}>
                <TextInput
                  style={[styles.inlineEditInput, { flex: 1 }]}
                  value={orDraft}
                  onChangeText={setOrDraft}
                  autoFocus
                  placeholder="Enter OR Number"
                  placeholderTextColor={COLORS.neutral[400]}
                />
                <Pressable
                  onPress={() => {
                    setEditingOrNumber(false);
                    updateApplication(app.id, {
                      payment: { ...app.payment, orNumber: orDraft },
                    });
                  }}
                >
                  <Text style={styles.inlineEditSave}>Save</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.orValueRow}>
                <Text style={styles.orValue}>
                  {app.payment.orNumber.length > 0 ? app.payment.orNumber : "—"}
                </Text>
                {isEditable && (
                  <Pressable
                    style={styles.orEditBtn}
                    onPress={() => {
                      setOrDraft(app.payment.orNumber);
                      setEditingOrNumber(true);
                    }}
                  >
                    <Lucide name="edit-2" size={12} color={COLORS.brand[700]} />
                    <Text style={styles.orEditText}>EDIT</Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Correction Audit Trail */}
      <Pressable
        style={styles.auditHeader}
        onPress={() => setAuditOpen((p) => !p)}
      >
        <View style={styles.auditHeaderLeft}>
          <Lucide name="refresh-cw" size={14} color={COLORS.neutral[500]} />
          <Text style={styles.auditTitle}>
            CORRECTION AUDIT TRAIL ({app.correctionAuditTrail.length})
          </Text>
        </View>
        <Lucide
          name={auditOpen ? "chevron-up" : "chevron-down"}
          size={16}
          color={COLORS.neutral[500]}
        />
      </Pressable>

      {auditOpen && (
        <View style={styles.auditList}>
          {app.correctionAuditTrail.length === 0 ? (
            <Text style={styles.auditEmpty}>No audit trail entries.</Text>
          ) : (
            app.correctionAuditTrail.map((entry) => (
              <View key={entry.id} style={styles.auditEntry}>
                <Text style={styles.auditDesc}>{entry.description}</Text>
                <Text style={styles.auditMeta}>
                  By {entry.changedBy} • {entry.timestamp}
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

// ─── Main Screen ─────────────────────────────────────────────────────────────

interface ApplicationReviewScreenProps {
  onClose: () => void;
  onCollapse?: () => void;
  isCollapsed?: boolean;
}

export function ApplicationReviewScreen({
  onClose,
  onCollapse,
  isCollapsed,
}: ApplicationReviewScreenProps) {
  const {
    applications,
    selectedApplication,
    activeQueueTab,
    updateApplication,
  } = useApplications();
  const { currentRole } = useRole();
  const { canApprove, canDecline, canEndorse, canVerifyCashier } =
    usePermissions();

  const [innerTab, setInnerTab] = useState<InnerTab>("basic");
  const [showApprove, setShowApprove] = useState(false);
  const [showDecline, setShowDecline] = useState(false);
  const [showEndorse, setShowEndorse] = useState(false);
  const [showCashier, setShowCashier] = useState(false);

  if (selectedApplication === null) {
    return (
      <View style={styles.emptyPanel}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Lucide name="layout" size={20} color={COLORS.brand[700]} />
            <Text style={styles.summaryTitle}>Work Queue Summary</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {
                  applications.filter(
                    (a: ApplicationData) =>
                      a.queueTab === "pending" && a.status === "For Approval",
                  ).length
                }
              </Text>
              <Text style={styles.statLabel}>To Approve</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {
                  applications.filter(
                    (a: ApplicationData) =>
                      a.queueTab === "pending" &&
                      a.status === "For Verification",
                  ).length
                }
              </Text>
              <Text style={styles.statLabel}>To Verify</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {
                  applications.filter(
                    (a: ApplicationData) =>
                      a.queueTab === "history" && a.status === "Approved",
                  ).length
                }
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>

          <View style={styles.guideBox}>
            <Lucide name="info" size={16} color={COLORS.neutral[400]} />
            <Text style={styles.guideText}>
              Select an application from the left feed to start reviewing
              details, endorsing, or approving requests.
            </Text>
          </View>
        </View>

        <View style={styles.actionPrompt}>
          <Lucide name="mouse-pointer" size={32} color={COLORS.neutral[300]} />
          <Text style={styles.emptyPanelTitle}>No Application Selected</Text>
          <Text style={styles.emptyPanelSub}>
            Your active queue contains{" "}
            {
              applications.filter(
                (a: ApplicationData) => a.queueTab === "pending",
              ).length
            }{" "}
            items requiring attention.
          </Text>
        </View>
      </View>
    );
  }

  const app = selectedApplication;

  // Core gate: editable only when Pending tab + correct status
  const EDITABLE_STATUSES = [
    "For Approval",
    "For Verification",
    "Returned",
  ] as const;
  const isEditable =
    activeQueueTab === "pending" &&
    (EDITABLE_STATUSES as readonly string[]).includes(app.status);

  const handleApprove = () => {
    setShowApprove(false);
    updateApplication(app.id, { status: "Approved", queueTab: "history" });
  };

  const handleDecline = (_notice: string) => {
    setShowDecline(false);
    updateApplication(app.id, { status: "Declined", queueTab: "history" });
  };

  const handleEndorse = (_targetRole: UserRole) => {
    setShowEndorse(false);
    updateApplication(app.id, { queueTab: "history" });
  };

  const handleCashierVerify = (data: {
    orNumber: string;
    checkNumber: string;
    checkName: string;
  }) => {
    setShowCashier(false);
    updateApplication(app.id, {
      payment: { ...app.payment, ...data },
      status: "Completed",
      queueTab: "history",
    });
  };

  return (
    <View style={styles.panel}>
      {/* ── Inner Tab Bar ── */}
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
                color={isActive ? COLORS.brand[700] : COLORS.neutral[400]}
              />
              <Text
                style={[
                  styles.innerTabText,
                  isActive && styles.innerTabTextActive,
                ]}
              >
                {tab.label}
              </Text>
              {isActive && <View style={styles.innerTabUnderline} />}
            </Pressable>
          );
        })}
        <View style={styles.innerTabSpacer} />
        {/* Collapse + Close */}
        {onCollapse !== undefined && (
          <Pressable style={styles.iconBtn} onPress={onCollapse}>
            <Lucide
              name={isCollapsed ? "maximize-2" : "minimize-2"}
              size={14}
              color={COLORS.neutral[500]}
            />
          </Pressable>
        )}
        <Pressable style={styles.iconBtn} onPress={onClose}>
          <Lucide name="x" size={16} color={COLORS.neutral[500]} />
        </Pressable>
      </View>

      {/* Read-only banner */}
      {!isEditable && (
        <View style={styles.readOnlyBanner}>
          <Lucide name="lock" size={12} color={COLORS.neutral[500]} />
          <Text style={styles.readOnlyText}>
            Read-only — actions only available on Pending applications with
            actionable status
          </Text>
        </View>
      )}

      {/* ── Tab Content ── */}
      {innerTab === "basic" && (
        <BasicInfoTab
          app={app}
          isEditable={isEditable}
          updateApplication={updateApplication}
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
      <View style={styles.actionBar}>
        {canVerifyCashier ? (
          <Pressable
            style={[
              styles.actionBtnPrimary,
              !isEditable && styles.actionBtnDisabled,
            ]}
            onPress={() => isEditable && setShowCashier(true)}
            disabled={!isEditable}
          >
            <Lucide
              name="credit-card"
              size={15}
              color={isEditable ? COLORS.neutral.white : COLORS.neutral[400]}
            />
            <Text
              style={[
                styles.actionBtnPrimaryText,
                !isEditable && styles.actionBtnDisabledText,
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
                (!isEditable || !canApprove) && styles.actionBtnDisabled,
              ]}
              onPress={() => isEditable && canApprove && setShowApprove(true)}
              disabled={!isEditable || !canApprove}
            >
              <Text
                style={[
                  styles.actionBtnPrimaryText,
                  (!isEditable || !canApprove) && styles.actionBtnDisabledText,
                ]}
              >
                Approve
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.actionBtnOutline,
                (!isEditable || !canDecline) && styles.actionBtnDisabled,
              ]}
              onPress={() => isEditable && canDecline && setShowDecline(true)}
              disabled={!isEditable || !canDecline}
            >
              <Text
                style={[
                  styles.actionBtnOutlineText,
                  (!isEditable || !canDecline) && styles.actionBtnDisabledText,
                ]}
              >
                Decline
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.actionBtnOutline,
                (!isEditable || !canEndorse) && styles.actionBtnDisabled,
              ]}
              onPress={() => isEditable && canEndorse && setShowEndorse(true)}
              disabled={!isEditable || !canEndorse}
            >
              <Text
                style={[
                  styles.actionBtnOutlineText,
                  (!isEditable || !canEndorse) && styles.actionBtnDisabledText,
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
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Empty state
  emptyPanel: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING[40],
    backgroundColor: COLORS.neutral[50],
  },
  summaryCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    padding: SPACING[24],
    width: "100%",
    maxWidth: 500,
    ...SHADOWS.card,
    marginBottom: SPACING[40],
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[12],
    marginBottom: SPACING[20],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
    paddingBottom: SPACING[12],
  },
  summaryTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING[24],
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[700],
  },
  statLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    marginTop: 4,
  },
  guideBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[12],
    backgroundColor: COLORS.neutral[50],
    padding: SPACING[16],
    borderRadius: RADIUS.input,
  },
  guideText: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[600],
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
    color: COLORS.neutral[400],
  },
  emptyPanelSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[300],
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 22,
  },

  // Panel shell
  panel: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: COLORS.neutral.white,
  },

  // Inner tab bar
  innerTabBar: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    backgroundColor: COLORS.neutral.white,
    paddingHorizontal: SPACING[8],
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
    fontSize: 13,
    color: COLORS.neutral[500],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  innerTabTextActive: {
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  innerTabUnderline: {
    position: "absolute",
    bottom: 0,
    left: SPACING[12],
    right: SPACING[12],
    height: 2,
    backgroundColor: COLORS.brand[700],
  },
  innerTabSpacer: {
    flex: 1,
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
    backgroundColor: "#FEF9C3",
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[8],
    borderBottomWidth: 1,
    borderBottomColor: "#FDE68A",
  },
  readOnlyText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#92400E",
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
    borderBottomColor: COLORS.neutral[100],
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
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  statusActor: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[400],
  },

  // Info block
  infoBlock: {
    paddingHorizontal: SPACING[16],
  },
  fieldGroupLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[400],
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingTop: SPACING[12],
    paddingBottom: SPACING[4],
  },

  // Note block
  noteBlock: {
    margin: SPACING[16],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
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
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[700],
    letterSpacing: 0.3,
  },
  noteText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[600],
    lineHeight: 22,
  },
  noteInput: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[800],
    backgroundColor: COLORS.neutral[50],
    borderWidth: 1,
    borderColor: COLORS.brand[500],
    borderRadius: RADIUS.input,
    padding: SPACING[8],
    minHeight: 100,
    lineHeight: 22,
    outline: "none",
  } as unknown as object,
  saveNoteBtn: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.brand[700],
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.button,
  },
  saveNoteBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
  },

  // Application Details tab
  submittedText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[400],
    paddingVertical: SPACING[8],
  },
  permitCategoryText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[800],
    marginBottom: 2,
  },
  formTypeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[500],
    paddingBottom: SPACING[12],
  },
  formCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: SPACING[12],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
    borderLeftWidth: 3,
    borderLeftColor: COLORS.brand[700],
    paddingLeft: SPACING[12],
    marginBottom: SPACING[8],
    borderRadius: RADIUS.input,
    backgroundColor: COLORS.neutral.white,
    ...SHADOWS.card,
  },
  formCardLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING[8],
    flex: 1,
  } as unknown as object,
  formDocIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.input,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  formDocLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    color: COLORS.neutral[400],
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  formDocName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[800],
    marginTop: 2,
    marginBottom: 4,
  },
  formActions: {
    flexDirection: "row",
    gap: SPACING[12],
  },
  formActionLink: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.brand[700],
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
    borderColor: COLORS.neutral[200],
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.button,
  },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.button,
  },
  downloadBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[600],
  },

  // Requirements tab
  reqItem: {
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[16],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  reqLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[800],
    marginBottom: 4,
  },
  reqNote: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
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
    fontSize: 12,
    color: COLORS.neutral[500],
    flex: 1,
  },
  reqViewLink: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[700],
  },
  reqThumbnail: {
    width: 150,
    height: 100,
    backgroundColor: COLORS.neutral[100],
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
    color: COLORS.neutral[400],
  },

  // SOA & Payment tab
  billingContainer: {
    margin: SPACING[16],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: RADIUS.card,
    padding: SPACING[16],
    backgroundColor: COLORS.neutral.white,
    ...SHADOWS.card,
  },
  billingLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[700],
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: SPACING[4],
  },
  billingTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    marginBottom: 4,
  },
  billingSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[500],
    marginBottom: SPACING[16],
    lineHeight: 20,
  },

  // Fee table
  feeTable: {
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: RADIUS.input,
    overflow: "hidden",
    marginBottom: SPACING[16],
  },
  feeTableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.neutral[50],
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[8],
  },
  feeTableHeaderCell: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[600],
  },
  feeTableDivider: {
    height: 1,
    backgroundColor: COLORS.neutral[200],
  },
  feeTableRow: {
    flexDirection: "row",
    paddingHorizontal: SPACING[12],
    paddingVertical: SPACING[12],
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[100],
    alignItems: "flex-start",
  },
  feeParticularName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral[800],
  },
  feeParticularSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[400],
    marginTop: 2,
  },
  feeTableCell: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[700],
    textAlign: "right",
    paddingTop: 2,
  },

  // Total box
  totalBox: {
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: RADIUS.card,
    padding: SPACING[16],
    backgroundColor: COLORS.neutral[50],
    marginBottom: SPACING[8],
  },
  totalRight: {
    alignItems: "flex-end",
  },
  totalLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[500],
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  totalAmount: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 32,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    marginBottom: 4,
  },
  totalWords: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
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
    fontSize: 13,
    color: COLORS.neutral[500],
  },
  totalDueDate: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[800],
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
    fontSize: 13,
    color: COLORS.neutral[800],
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.brand[500],
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[4],
    minWidth: 120,
    outline: "none",
  } as unknown as object,
  inlineEditSave: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[700],
  },

  // Payment section
  paymentSection: {
    marginHorizontal: SPACING[16],
    marginBottom: SPACING[16],
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: RADIUS.card,
    padding: SPACING[16],
    backgroundColor: COLORS.neutral.white,
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
    backgroundColor: COLORS.neutral[100],
    alignItems: "center",
    justifyContent: "center",
  },
  paymentSectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[800],
  },
  paymentRow: {
    flexDirection: "row",
    gap: SPACING[16],
  },
  amountReceivedCard: {
    flex: 1,
    backgroundColor: "#DBEAFE",
    borderRadius: RADIUS.card,
    padding: SPACING[16],
    gap: SPACING[4],
  },
  amountReceivedLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#1E40AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  amountReceivedValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 28,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#1E3A8A",
  },
  excessBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#BFDBFE",
    paddingHorizontal: SPACING[8],
    paddingVertical: 2,
    borderRadius: RADIUS.circle,
  },
  excessBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: "#1E40AF",
  },
  paymentMethodBlock: {
    marginTop: SPACING[8],
  },
  paymentMethodLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#1E40AF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  paymentMethodValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#1E3A8A",
    textTransform: "lowercase",
  },
  orColumn: {
    flex: 1,
    justifyContent: "flex-start",
  },
  orLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[500],
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
    color: COLORS.neutral[700],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  orEditBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: SPACING[8],
    paddingVertical: SPACING[4],
    borderRadius: RADIUS.circle,
    borderWidth: 1,
    borderColor: COLORS.brand[600],
  },
  orEditText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[700],
    letterSpacing: 0.3,
  },

  // Audit trail
  auditHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: SPACING[16],
    paddingVertical: SPACING[12],
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
  },
  auditHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[8],
  },
  auditTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[500],
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  auditList: {
    marginHorizontal: SPACING[16],
    marginBottom: SPACING[16],
  },
  auditEmpty: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[400],
    paddingVertical: SPACING[12],
  },
  auditEntry: {
    paddingVertical: SPACING[8],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  auditDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[700],
    lineHeight: 20,
  },
  auditMeta: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[400],
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
    borderTopColor: COLORS.neutral[200],
    backgroundColor: COLORS.neutral.white,
    ...SHADOWS.card,
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING[8],
    backgroundColor: COLORS.brand[800],
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.button,
    maxWidth: 200,
  },
  actionBtnPrimaryText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
  },
  actionBtnOutline: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING[8],
    borderRadius: RADIUS.button,
    borderWidth: 1.5,
    borderColor: COLORS.neutral[300],
    maxWidth: 160,
  },
  actionBtnOutlineText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.neutral[700],
  },
  actionBtnDisabled: {
    backgroundColor: COLORS.neutral[100],
    borderColor: COLORS.neutral[200],
    opacity: 0.6,
  },
  actionBtnDisabledText: {
    color: COLORS.neutral[400],
  },
});
