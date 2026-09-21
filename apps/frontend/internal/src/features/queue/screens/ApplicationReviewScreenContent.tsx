import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
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
  toast,
} from "@edge/ui";
import { ApplicationData, ApplicationStatus } from "../../../types/application";
import { useRole } from "../../shell/context/RoleContext";
import { usePermissions } from "../../shell/context/PermissionContext";
import {
  applicationService,
  useAdminApplicationDetails,
  mutateApplications,
} from "@edge/api";
import { mapApplicationDtoToUI } from "../data/applicationMapper";
import { ApproveModal } from "../components/modals/ApproveModal";
import { DeclineModal } from "../components/modals/DeclineModal";
import { EndorseModal } from "../components/modals/EndorseModal";
import { CashierVerificationModal } from "../components/modals/CashierVerificationModal";
import { GenerateSoaModal } from "../components/modals/GenerateSoaModal";
import { SoaReportPreviewModal, ReportDocumentType } from "../components/modals/SoaReportPreviewModal";
import {
  generateSoaPrintableHtml,
  generateOpPrintableHtml,
  openPrintableDocumentWindow,
} from "../utils/soaReportGenerator";
import { UserRole } from "../../shell/context/RoleContext";
import { CustomDocPreviewModal } from "../../../shared/components/CustomDocPreviewModal";
import { DocumentPreviewFile } from "../../../shared/components/DocumentPreviewModal";
import { ApplicationReviewSkeleton } from "../components/review/ApplicationReviewSkeleton";
import { ApplicationDetailsTab } from "../components/review/ApplicationDetailsTab";
import { ApplicantRecordTab } from "../components/review/ApplicantRecordTab";
import { SoaPaymentTab } from "../components/review/SoaPaymentTab";
import { InnerTab, INNER_TABS } from "../components/review/reviewTypes";

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
        const [, err] = await applicationService.updateStatus(id, {
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

        const [, err] = await applicationService.adminUpdateApplication(id, payload);
        if (err !== null) {
          const errMsg = typeof err === 'object' && err !== null && Reflect.has(err, 'message')
            ? String(Reflect.get(err, 'message'))
            : 'Please try again.';
          toast.error(`Update failed: ${errMsg}`);
          return;
        }
        if (patch.note !== undefined && Object.keys(payload).length === 1) {
          toast.success("Evaluation note saved successfully.");
        } else {
          toast.success("Application updated successfully.");
        }
      }
      await mutateApplications(id);
      await refetch();
    } catch {
      toast.error("Failed to update application data.");
    }
  }, [refetch]);

  const { currentRole } = useRole();
  const { canApprove, canDecline, canEndorse, canVerifyCashier, canForwardToAccountant, canApproveAsAccountant } = usePermissions();

  const [innerTab, setInnerTab] = useState<InnerTab>("details");
  const [selectedApplicantIndex, setSelectedApplicantIndex] = useState(0);
  const [showApprove, setShowApprove] = useState(false);
  const [showDecline, setShowDecline] = useState(false);
  const [showEndorse, setShowEndorse] = useState(false);
  const [showCashier, setShowCashier] = useState(false);
  const [showGenerateSoa, setShowGenerateSoa] = useState(false);
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [reportPreviewInitialDoc, setReportPreviewInitialDoc] = useState<ReportDocumentType>("soa");
  const [previewCustomDoc, setPreviewCustomDoc] = useState<DocumentPreviewFile | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const tabScrollRef = useRef<ScrollView>(null);

  useEffect(() => { setSelectedApplicantIndex(0); }, [selectedApplication?.id]);
  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }, [selectedApplication?.id, fadeAnim]);

  const handlePreviewFile = useCallback((fileOrUri: DocumentPreviewFile | string, label?: string) => {
    if (typeof fileOrUri === 'string') {
      setPreviewCustomDoc({ uri: fileOrUri, name: (label ?? '').trim() || 'Attachment Document', category: label });
    } else if (fileOrUri !== null && typeof fileOrUri === 'object') {
      setPreviewCustomDoc(fileOrUri);
    }
  }, []);

  const handleClosePreviewDoc = useCallback(() => {
    setPreviewCustomDoc((prev) => {
      if (prev?.uri && typeof prev.uri === 'string' && prev.uri.startsWith('blob:') && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
        try { URL.revokeObjectURL(prev.uri); } catch { /* ignore */ }
      }
      return null;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (previewCustomDoc?.uri && typeof previewCustomDoc.uri === 'string' && previewCustomDoc.uri.startsWith('blob:') && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
        try { URL.revokeObjectURL(previewCustomDoc.uri); } catch { /* cleanup */ }
      }
    };
  }, [previewCustomDoc?.uri]);

  const handlePrintSoa = useCallback(() => {
    if (selectedApplication !== null) openPrintableDocumentWindow(generateSoaPrintableHtml(selectedApplication));
  }, [selectedApplication]);

  const handlePrintOp = useCallback(() => {
    if (selectedApplication !== null) openPrintableDocumentWindow(generateOpPrintableHtml(selectedApplication));
  }, [selectedApplication]);

  const handlePreviewReport = useCallback((docType: ReportDocumentType = "soa") => {
    setReportPreviewInitialDoc(docType);
    setShowReportPreview(true);
  }, []);

  const handleCloseAnimated = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      onClose();
      fadeAnim.setValue(1);
    });
  };

  if (isDetailsLoading) return <ApplicationReviewSkeleton onClose={onClose} />;

  if (selectedApplication === null) {
    return (
      <ScrollView style={[sc.emptyScroll, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]} contentContainerStyle={sc.emptyContainer} showsVerticalScrollIndicator={false}>
        <View style={[sc.summaryCard, { backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white }]}>
          <View style={[sc.summaryHeader, { borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}>
            <Lucide name="layout" size={20} color={isDark ? colors.brand[500] : COLORS.brand[700]} />
            <Text style={[sc.summaryTitle, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>Work Queue Summary</Text>
          </View>
          <View style={[sc.guideBox, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <Lucide name="info" size={16} color={isDark ? colors.neutral[500] : colors.neutral[400]} />
            <Text style={[sc.guideText, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>Select an application from the left feed to start reviewing details, endorsing, or approving requests.</Text>
          </View>
        </View>
        <View style={sc.actionPrompt}>
          <Lucide name="mouse-pointer" size={32} color={isDark ? colors.neutral[600] : colors.neutral[300]} />
          <Text style={[sc.emptyTitle, { color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>No Application Selected</Text>
          <Text style={[sc.emptySub, { color: isDark ? colors.neutral[600] : colors.neutral[300] }]}>Select an application from the queue to view full details and perform evaluation actions.</Text>
        </View>
      </ScrollView>
    );
  }

  const app = selectedApplication;
  const isEditable = app.queueTab !== "history" && app.status !== "Completed" && app.status !== "Approved";

  // ── Workflow-aware action handlers ──────────────────────────────────────────

  /** Evaluator / Chief / Director → Approves evaluation, background advances to Accountant */
  const handleForwardToAccountant = async () => {
    setShowApprove(false);
    const [, err] = await applicationService.updateStatus(app.id, {
      status: 'ForAccountant',
      remarks: 'Evaluation approved. Advanced to Accountant for SOA review.',
    });
    if (err !== null) { toast.error('Failed to approve application.'); return; }
    toast.success('Application approved and advanced to Accountant.');
    await mutateApplications(app.id);
    await refetch();
    onClose();
  };

  /** Accountant → Approves SOA, background advances to PendingPayment (visible on client portal) */
  const handleAccountantApprove = async () => {
    setShowApprove(false);
    const [, err] = await applicationService.updateStatus(app.id, {
      status: 'PendingPayment',
      remarks: 'SOA and assessment approved by Accountant. Ready for client payment.',
    });
    if (err !== null) { toast.error('Failed to approve SOA.'); return; }
    toast.success('SOA approved. Application is now ready for payment.');
    await mutateApplications(app.id);
    await refetch();
    onClose();
  };

  /** Cashier → verifies payment and marks the application Completed */
  const handleCashierVerify = async (data: { orNumber: string; checkNumber: string; checkName: string }) => {
    setShowCashier(false);
    const [, statusErr] = await applicationService.updateStatus(app.id, {
      status: 'Completed',
      remarks: `Payment verified by Cashier. OR: ${data.orNumber}. Application completed.`,
    });
    if (statusErr !== null) { toast.error('Failed to complete application.'); return; }
    await updateApplication(app.id, { payment: { ...app.payment, ...data } });
    toast.success('Payment verified. Application completed successfully.');
    await mutateApplications(app.id);
    await refetch();
    onClose();
  };

  /** Return / decline — multi-tier return in background based on workflow stage */
  const handleDecline = async (notice: string) => {
    setShowDecline(false);
    const trimmedNotice = notice.trim() || 'Application returned with notice.';

    let targetStatus: ApplicationStatus = 'Returned';
    let successMessage = 'Application returned to applicant with notice.';
    let auditRemarks = `Notice of Discrepancy: ${trimmedNotice}`;

    if (app.status === 'PendingPayment') {
      // Cashier returns -> goes back to Accountant (previous touch)
      targetStatus = 'ForAccountant';
      successMessage = 'Application returned to Accountant for SOA review.';
      auditRemarks = `Returned by Cashier to Accountant: ${trimmedNotice}`;
    } else if (app.status === 'ForAccountant') {
      // Accountant returns -> goes back to Evaluator (previous touch)
      targetStatus = 'Evaluating';
      successMessage = 'Application returned to Evaluator for review.';
      auditRemarks = `Returned by Accountant to Evaluator: ${trimmedNotice}`;
    } else {
      // Evaluator / Chief / Director returns -> goes back to Applicant
      targetStatus = 'Returned';
      successMessage = 'Application returned to applicant with notice.';
      auditRemarks = `Notice of Discrepancy: ${trimmedNotice}`;
    }

    const [, err] = await applicationService.updateStatus(app.id, {
      status: targetStatus,
      remarks: auditRemarks,
    });
    if (err !== null) { toast.error('Failed to return application.'); return; }
    toast.success(successMessage);
    await mutateApplications(app.id);
    await refetch();
    onClose();
  };

  /** Endorse to another role for review */
  const handleEndorse = async (targetRole: UserRole) => {
    setShowEndorse(false);
    const [, err] = await applicationService.updateStatus(app.id, {
      status: 'Evaluating',
      remarks: `Application endorsed to ${targetRole}.`,
    });
    if (err !== null) { toast.error('Failed to endorse application.'); return; }
    toast.success(`Application endorsed to ${targetRole}.`);
    await mutateApplications(app.id);
    await refetch();
    onClose();
    Alert.alert('Success', `Application endorsed to ${targetRole}`);
  };

  /** Admin-only direct approve (bypasses normal cycle) */
  const handleAdminDirectApprove = async () => {
    setShowApprove(false);
    const [, err] = await applicationService.updateStatus(app.id, {
      status: 'Approved',
      remarks: 'Application directly approved by administrator.',
    });
    if (err !== null) { toast.error('Failed to approve application.'); return; }
    toast.success('Application approved directly by administrator.');
    await mutateApplications(app.id);
    await refetch();
    onClose();
  };

  // ── Contextual action bar state ─────────────────────────────────────────────
  const hasIncompleteApplicants = app.applicantsList?.some(a => a.status === 'Incomplete') ?? false;

  /** Show Cashier-specific payment verify button */
  const showCashierBtn = (currentRole === 'Cashier' || canVerifyCashier) && app.status === 'PendingPayment';
  /** Show Accountant-specific SOA approve button */
  const showAccountantBtn = (currentRole === 'Accountant' || canApproveAsAccountant) && app.status === 'ForAccountant';
  /** Show Evaluator forward-to-accountant button */
  const showForwardBtn = canForwardToAccountant && (app.status === 'Evaluating' || app.status === 'Submitted');
  /** Admin can do everything — show the stage-appropriate primary action */
  const isAdmin = currentRole === 'Admin';

  return (
    <Animated.View style={[sc.panel, { backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white, opacity: fadeAnim }]}>
      {/* Tab Bar */}
      <View style={[sc.tabBarWrapper, { borderBottomColor: isDark ? colors.neutral[700] : colors.neutral[200], backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white }]}>
        {isNarrow ? (
          <>
            <ScrollView ref={tabScrollRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={sc.tabScrollContent} style={sc.tabScroll}>
              {INNER_TABS.map((tab) => {
                const isActive = innerTab === tab.key;
                return (
                  <Pressable key={tab.key} style={sc.tabItem} onPress={() => setInnerTab(tab.key)}>
                    <Lucide name={tab.icon} size={13} color={isActive ? (isDark ? colors.brand[500] : COLORS.brand[700]) : (isDark ? colors.neutral[500] : COLORS.neutral[400])} />
                    <Text style={[sc.tabText, { color: isActive ? (isDark ? colors.brand[500] : COLORS.brand[700]) : (isDark ? colors.neutral[400] : COLORS.neutral[500]) }]}>{tab.label}</Text>
                    {isActive && <View style={[sc.tabUnderline, { backgroundColor: isDark ? colors.brand[500] : colors.brand[700] }]} />}
                  </Pressable>
                );
              })}
            </ScrollView>
            <View style={[sc.tabActionsRow, { borderTopColor: isDark ? colors.neutral[700] : colors.neutral[100] }]}>
              <View style={sc.tabSpacer} />
              {onCollapse !== undefined && (
                <Pressable style={[sc.iconBtn, Platform.select({ web: { cursor: "pointer" } as object })]} onPress={onCollapse}>
                  <Lucide name={isCollapsed ? "minimize-2" : "maximize-2"} size={14} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
                </Pressable>
              )}
              <Pressable style={[sc.iconBtn, Platform.select({ web: { cursor: "pointer" } as object })]} onPress={handleCloseAnimated}>
                <Lucide name="x" size={16} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
              </Pressable>
            </View>
          </>
        ) : (
          <View style={sc.tabBar}>
            {INNER_TABS.map((tab) => {
              const isActive = innerTab === tab.key;
              return (
                <Pressable key={tab.key} style={sc.tabItem} onPress={() => setInnerTab(tab.key)}>
                  <Lucide name={tab.icon} size={13} color={isActive ? (isDark ? colors.brand[500] : COLORS.brand[700]) : (isDark ? colors.neutral[500] : COLORS.neutral[400])} />
                  <Text style={[sc.tabText, { color: isActive ? (isDark ? colors.brand[500] : COLORS.brand[700]) : (isDark ? colors.neutral[400] : COLORS.neutral[500]) }]}>{tab.label}</Text>
                  {isActive && <View style={[sc.tabUnderline, { backgroundColor: isDark ? colors.brand[500] : colors.brand[700] }]} />}
                </Pressable>
              );
            })}
            <View style={sc.tabSpacer} />
            {onCollapse !== undefined && (
              <Pressable style={[sc.iconBtn, Platform.select({ web: { cursor: "pointer" } as object })]} onPress={onCollapse}>
                <Lucide name={isCollapsed ? "minimize-2" : "maximize-2"} size={14} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
              </Pressable>
            )}
            <Pressable style={[sc.iconBtn, Platform.select({ web: { cursor: "pointer" } as object })]} onPress={handleCloseAnimated}>
              <Lucide name="x" size={16} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
            </Pressable>
          </View>
        )}
      </View>

      {/* Read-only banner */}
      {!isEditable && (
        <View style={[sc.readOnlyBanner, { backgroundColor: colors.brand.yellowLight }]}>
          <Lucide name="lock" size={12} color={isDark ? colors.neutral[400] : colors.neutral[500]} />
          <Text style={[sc.readOnlyText, { color: COLORS.semantic.warningText }]}>
            Read-only — actions only available on Pending applications with actionable status
          </Text>
        </View>
      )}

      {/* Tab Content */}
      {innerTab === "details" && (
        <ApplicationDetailsTab
          key={app.id}
          app={app}
          isEditable={isEditable}
          updateApplication={updateApplication}
          selectedApplicantIndex={selectedApplicantIndex}
          onSelectApplicantIndex={(idx) => setSelectedApplicantIndex(idx)}
          onInspectApplicant={(idx) => { setSelectedApplicantIndex(idx); setInnerTab("applicant-record"); }}
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
          onOpenGenerateSoa={() => setShowGenerateSoa(true)}
          onPrintSoa={handlePrintSoa}
          onPrintOp={handlePrintOp}
          onPreviewReport={handlePreviewReport}
        />
      )}

      {/* ── Bottom Action Bar ── */}
      <WorkflowActionBar
        isEditable={isEditable}
        isDark={isDark}
        colors={colors}
        canApprove={showCashierBtn || showAccountantBtn || showForwardBtn || isAdmin || canApprove}
        canDecline={canDecline}
        canEndorse={canEndorse && !showCashierBtn}
        isApproveDisabled={showForwardBtn && hasIncompleteApplicants}
        approveLabel={showCashierBtn ? "Verify Payment" : "Approve"}
        approveIcon={showCashierBtn ? "credit-card" : "check-circle"}
        onApprove={() => {
          if (showCashierBtn) {
            setShowCashier(true);
          } else {
            setShowApprove(true);
          }
        }}
        onReturn={() => setShowDecline(true)}
        onEndorse={() => setShowEndorse(true)}
      />

      {/* ── Modals ── */}
      <CustomDocPreviewModal previewCustomDoc={previewCustomDoc} onClose={handleClosePreviewDoc} />

      {/* ApproveModal is reused for evaluation and accountant approval */}
      <ApproveModal
        visible={showApprove}
        applicantName={app.applicant}
        onConfirm={
          showCashierBtn ? () => { /* handled by CashierModal */ } :
          showAccountantBtn ? handleAccountantApprove :
          showForwardBtn ? handleForwardToAccountant :
          isAdmin ? handleAdminDirectApprove :
          handleForwardToAccountant
        }
        onCancel={() => setShowApprove(false)}
      />
      <DeclineModal
        visible={showDecline}
        applicantName={app.applicant}
        title={
          app.status === 'PendingPayment'
            ? 'Return to Accountant'
            : app.status === 'ForAccountant'
              ? 'Return to Evaluator'
              : 'Return Application'
        }
        confirmText="Confirm Return"
        reasonLabel={
          app.status === 'PendingPayment'
            ? 'Return Reason for Accountant'
            : app.status === 'ForAccountant'
              ? 'Return Reason for Evaluator'
              : 'Reason / Notice of Discrepancy'
        }
        placeholder={
          app.status === 'PendingPayment'
            ? 'Describe fee adjustments or discrepancy for the Accountant...'
            : app.status === 'ForAccountant'
              ? 'Describe findings or missing details for the Evaluator...'
              : 'Describe the discrepancy or reason for returning this application...'
        }
        onConfirm={handleDecline}
        onCancel={() => setShowDecline(false)}
      />
      <EndorseModal visible={showEndorse} applicantName={app.applicant} currentRole={currentRole} onConfirm={handleEndorse} onCancel={() => setShowEndorse(false)} />
      <CashierVerificationModal visible={showCashier} applicantName={app.applicant} initialOrNumber={app.payment.orNumber} onConfirm={handleCashierVerify} onCancel={() => setShowCashier(false)} />
      <GenerateSoaModal visible={showGenerateSoa} app={app} onClose={() => setShowGenerateSoa(false)} onSuccess={async () => { await mutateApplications(app.id); await refetch(); }} />
      <SoaReportPreviewModal visible={showReportPreview} app={app} initialDocType={reportPreviewInitialDoc} onClose={() => setShowReportPreview(false)} onOpenGenerateSoa={() => setShowGenerateSoa(true)} />
    </Animated.View>
  );
}

// ── Unified WorkflowActionBar sub-component ───────────────────────────────────

interface WorkflowActionBarProps {
  isEditable: boolean;
  isDark: boolean;
  colors: ReturnType<typeof import('@edge/ui').useTheme>['colors'];
  canApprove: boolean;
  canDecline: boolean;
  canEndorse: boolean;
  isApproveDisabled: boolean;
  approveLabel: string;
  approveIcon: 'check-circle' | 'credit-card';
  onApprove: () => void;
  onReturn: () => void;
  onEndorse: () => void;
}

function WorkflowActionBar({
  isEditable,
  isDark,
  colors,
  canApprove,
  canDecline,
  canEndorse,
  isApproveDisabled,
  approveLabel,
  approveIcon,
  onApprove,
  onReturn,
  onEndorse,
}: WorkflowActionBarProps) {
  const primaryGreen = isDark ? '#166534' : '#15803D';
  const primaryBlue = isDark ? colors.brand[600] : colors.brand[700];
  const primaryColor = approveIcon === 'credit-card' ? primaryBlue : primaryGreen;
  const disabledBg = isDark ? '#1E293B' : '#E2E8F0';
  const disabledText = isDark ? '#64748B' : '#94A3B8';
  const disabledBorder = isDark ? '#334155' : '#CBD5E1';
  const outlineBg = isDark ? colors.neutral[800] : COLORS.neutral.white;
  const outlineText = isDark ? colors.neutral[100] : COLORS.neutral[900];
  const outlineBorder = isDark ? colors.neutral[300] : COLORS.neutral[900];

  const approveEnabled = isEditable && canApprove && !isApproveDisabled;
  const returnEnabled = isEditable && canDecline;
  const endorseEnabled = isEditable && canEndorse;

  return (
    <View
      style={[
        sc.actionBar,
        {
          borderTopColor: isDark ? colors.neutral[700] : colors.neutral[200],
          backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
        },
      ]}
    >
      {/* ── Return Button ── */}
      {returnEnabled && (
        <Pressable
          style={[
            sc.actionBtnOutline,
            { backgroundColor: outlineBg, borderColor: outlineBorder, borderWidth: 1.5 },
            Platform.select({ web: { cursor: 'pointer' } as object }),
          ]}
          onPress={onReturn}
        >
          <Lucide name="rotate-ccw" size={14} color={outlineText} />
          <Text style={[sc.actionBtnOutlineText, { color: outlineText }]}>Return</Text>
        </Pressable>
      )}

      {/* ── Endorse Button ── */}
      {endorseEnabled && (
        <Pressable
          style={[
            sc.actionBtnOutline,
            {
              backgroundColor: outlineBg,
              borderColor: isDark ? colors.brand[400] : colors.brand[600],
              borderWidth: 1.5,
            },
            Platform.select({ web: { cursor: 'pointer' } as object }),
          ]}
          onPress={onEndorse}
        >
          <Lucide name="share-2" size={14} color={isDark ? colors.brand[400] : colors.brand[600]} />
          <Text
            style={[
              sc.actionBtnOutlineText,
              { color: isDark ? colors.brand[400] : colors.brand[600] },
            ]}
          >
            Endorse
          </Text>
        </Pressable>
      )}

      {/* ── Approve Button (Primary) ── */}
      {canApprove && (
        <Pressable
          style={[
            sc.actionBtnPrimary,
            {
              backgroundColor: approveEnabled ? primaryColor : disabledBg,
              borderColor: approveEnabled ? 'transparent' : disabledBorder,
              borderWidth: 1,
            },
            !approveEnabled && sc.actionBtnDisabled,
            Platform.select({
              web: { cursor: approveEnabled ? 'pointer' : 'not-allowed' } as object,
            }),
          ]}
          onPress={onApprove}
          disabled={!approveEnabled}
        >
          <Lucide
            name={approveIcon}
            size={15}
            color={approveEnabled ? COLORS.neutral.white : disabledText}
          />
          <Text
            style={[
              sc.actionBtnPrimaryText,
              { color: approveEnabled ? COLORS.neutral.white : disabledText },
            ]}
          >
            {approveLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const sc = StyleSheet.create({
  emptyScroll: { flex: 1 },
  emptyContainer: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING[16], paddingVertical: SPACING[24] },
  summaryCard: { borderRadius: RADIUS.card, padding: SPACING[16], width: '100%', maxWidth: 500, marginBottom: SPACING[24] },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING[10], marginBottom: SPACING[16], borderBottomWidth: 1, paddingBottom: SPACING[12] },
  summaryTitle: { flex: 1, fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 16, fontWeight: TYPOGRAPHY.weights.bold },
  guideBox: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING[10], padding: SPACING[12], borderRadius: RADIUS.input },
  guideText: { flex: 1, fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, lineHeight: 18 },
  actionPrompt: { alignItems: 'center', gap: SPACING[12] },
  emptyTitle: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 18, fontWeight: TYPOGRAPHY.weights.semibold, textAlign: 'center' },
  emptySub: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, textAlign: 'center', maxWidth: 280, lineHeight: 22 },
  panel: { flex: 1 },
  tabBarWrapper: { borderBottomWidth: 1 },
  tabBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING[16], height: 46 },
  tabScroll: { flexGrow: 0 },
  tabScrollContent: { flexDirection: 'row', paddingHorizontal: SPACING[16], alignItems: 'center', height: 46 },
  tabActionsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING[16], paddingVertical: SPACING[6], borderTopWidth: 1 },
  tabItem: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: SPACING[12], paddingVertical: SPACING[8], position: 'relative', marginRight: SPACING[4] },
  tabText: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: TYPOGRAPHY.sizes.label, fontWeight: TYPOGRAPHY.weights.medium },
  tabUnderline: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, borderRadius: 1 },
  tabSpacer: { flex: 1 },
  iconBtn: { padding: SPACING[8], borderRadius: RADIUS.button },
  readOnlyBanner: { flexDirection: 'row', alignItems: 'center', gap: SPACING[8], paddingHorizontal: SPACING[16], paddingVertical: SPACING[8] },
  readOnlyText: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: TYPOGRAPHY.sizes.label, flex: 1 },
  actionBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: SPACING[8], paddingHorizontal: SPACING[16], paddingVertical: SPACING[12], borderTopWidth: 1, flexWrap: 'wrap' },
  actionBtnPrimary: { flexDirection: 'row', alignItems: 'center', gap: SPACING[6], paddingHorizontal: SPACING[16], paddingVertical: SPACING[8], borderRadius: RADIUS.button },
  actionBtnPrimaryText: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: TYPOGRAPHY.sizes.body, fontWeight: TYPOGRAPHY.weights.semibold },
  actionBtnOutline: { flexDirection: 'row', alignItems: 'center', gap: SPACING[6], paddingHorizontal: SPACING[16], paddingVertical: SPACING[8], borderRadius: RADIUS.button },
  actionBtnOutlineText: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: TYPOGRAPHY.sizes.body, fontWeight: TYPOGRAPHY.weights.semibold },
  actionBtnDisabled: { opacity: 0.5 },
});
