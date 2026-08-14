import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Alert,
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
import { ApplicationData } from "../../../types/application";
import { useRole, UserRole } from "../../shell/context/RoleContext";
import { usePermissions } from "../../shell/context/PermissionContext";
import {
  applicationService,
  useAdminApplicationDetails,
  useAdminApplicationApplicants,
  AdminUpdateApplicationPayload,
} from "@edge/api";
import { mapToApplicationData } from "../mappers";
import { ApproveModal } from "../components/modals/ApproveModal";
import { DeclineModal } from "../components/modals/DeclineModal";
import { EndorseModal } from "../components/modals/EndorseModal";
import { CashierVerificationModal } from "../components/modals/CashierVerificationModal";
import { ApplicationReviewSkeleton } from "../components/review/ApplicationReviewSkeleton";
import { ReviewTabBar, InnerTab } from "../components/review/common/ReviewTabBar";
import { ReviewBottomBar } from "../components/review/common/ReviewBottomBar";
import { ApplicationDetailsTab } from "../components/review/tabs/ApplicationDetailsTab";
import { ApplicantRecordTab } from "../components/review/tabs/ApplicantRecordTab";
import { SoaPaymentTab } from "../components/review/tabs/SoaPaymentTab";

export { ApplicationReviewSkeleton };

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

  const {
    applicationDto,
    isLoading: isDetailsLoading,
    refetch: refetchDetails,
  } = useAdminApplicationDetails(propApplicationId);

  const {
    applicants,
    isLoading: isApplicantsLoading,
    refetch: refetchApplicants,
  } = useAdminApplicationApplicants(propApplicationId);

  const selectedApplication = useMemo(() => {
    return applicationDto
      ? mapToApplicationData(applicationDto, applicants)
      : null;
  }, [applicationDto, applicants]);

  const refetch = useCallback(() => {
    refetchDetails();
    refetchApplicants();
  }, [refetchDetails, refetchApplicants]);

  const updateApplication = useCallback(
    async (
      id: string,
      patch: Partial<ApplicationData> | AdminUpdateApplicationPayload
    ) => {
      if (
        "status" in patch &&
        typeof patch.status === "string" &&
        patch.status.length > 0 &&
        !("applicantsList" in patch)
      ) {
        await applicationService.updateStatus(id, {
          status: patch.status,
          remarks: typeof patch.note === "string" ? patch.note : undefined,
        });
      } else {
        await applicationService.adminUpdateApplication(id, patch);
      }
      refetch();
    },
    [refetch]
  );

  const setSelectedId = useCallback(
    (_id: string | null) => {
      onClose();
    },
    [onClose]
  );

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
        style={[
          styles.emptyPanelScroll,
          {
            backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
          },
        ]}
        contentContainerStyle={styles.emptyPanelContainer}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: isDark
                ? colors.neutral[800]
                : COLORS.neutral.white,
            },
          ]}
        >
          <View
            style={[
              styles.summaryHeader,
              {
                borderBottomColor: isDark
                  ? colors.neutral[800]
                  : colors.neutral[100],
              },
            ]}
          >
            <Lucide
              name="layout"
              size={20}
              color={isDark ? colors.brand[500] : COLORS.brand[700]}
            />
            <Text
              style={[
                styles.summaryTitle,
                { color: isDark ? colors.neutral[100] : colors.neutral[900] },
              ]}
            >
              Work Queue Summary
            </Text>
          </View>

          <View
            style={[
              styles.guideBox,
              {
                backgroundColor: isDark
                  ? colors.neutral[900]
                  : colors.neutral[50],
              },
            ]}
          >
            <Lucide
              name="info"
              size={16}
              color={isDark ? colors.neutral[500] : colors.neutral[400]}
            />
            <Text
              style={[
                styles.guideText,
                { color: isDark ? colors.neutral[300] : colors.neutral[600] },
              ]}
            >
              Select an application from the left feed to start reviewing
              details, endorsing, or approving requests.
            </Text>
          </View>
        </View>

        <View style={styles.actionPrompt}>
          <Lucide
            name="mouse-pointer"
            size={32}
            color={isDark ? colors.neutral[600] : colors.neutral[300]}
          />
          <Text
            style={[
              styles.emptyPanelTitle,
              { color: isDark ? colors.neutral[500] : colors.neutral[400] },
            ]}
          >
            No Application Selected
          </Text>
          <Text
            style={[
              styles.emptyPanelSub,
              { color: isDark ? colors.neutral[600] : colors.neutral[300] },
            ]}
          >
            Select an application from the queue to view full details and
            perform evaluation actions.
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

  const isSoaApproved =
    (app.statementsOfAccount?.length ?? 0) > 0 &&
    (app.statementsOfAccount?.every((s) => s.status === "Approved") ?? false);

  const showCashierBtn =
    (currentRole === "Cashier" || (canVerifyCashier && innerTab === "soa")) &&
    isSoaApproved;

  const shouldShowReadOnlyBanner =
    !isEditable && (innerTab !== "soa" || isSoaApproved);

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
        ...(app.history || []),
        {
          id: `H${(app.history?.length ?? 0) + 1}`,
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
        ...(app.history || []),
        {
          id: `H${(app.history?.length ?? 0) + 1}`,
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
        ...(app.history || []),
        {
          id: `H${(app.history?.length ?? 0) + 1}`,
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
        `Generating printable form for ${app.referenceNumber}...`
      );
    } else {
      Alert.alert(
        "View Application",
        `Opening full view for ${app.applicant}...`
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
        ...(app.history || []),
        {
          id: `H${(app.history?.length ?? 0) + 1}`,
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
    <Animated.View
      style={[
        styles.panel,
        {
          backgroundColor: isDark
            ? colors.neutral[800]
            : COLORS.neutral.white,
          opacity: fadeAnim,
        },
      ]}
    >
      {/* ── Inner Tab Bar ── */}
      <ReviewTabBar
        innerTab={innerTab}
        onSelectTab={setInnerTab}
        isNarrow={isNarrow}
        onTopAction={handleTopAction}
        onClose={handleCloseAnimated}
        onCollapse={onCollapse}
        isCollapsed={isCollapsed}
      />

      {/* Read-only banner */}
      {shouldShowReadOnlyBanner && (
        <View
          style={[
            styles.readOnlyBanner,
            { backgroundColor: colors.brand.yellowLight },
          ]}
        >
          <Lucide
            name="lock"
            size={12}
            color={isDark ? colors.neutral[400] : colors.neutral[500]}
          />
          <Text style={styles.readOnlyText}>
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
      <ReviewBottomBar
        app={app}
        isEditable={isEditable}
        currentRole={currentRole}
        canApprove={canApprove}
        canDecline={canDecline}
        canEndorse={canEndorse}
        canVerifyCashier={canVerifyCashier}
        showCashierBtn={showCashierBtn}
        onOpenCashierModal={() => setShowCashier(true)}
        onOpenApproveModal={() => setShowApprove(true)}
        onOpenDeclineModal={() => setShowDecline(true)}
        onOpenEndorseModal={() => setShowEndorse(true)}
      />

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
});
