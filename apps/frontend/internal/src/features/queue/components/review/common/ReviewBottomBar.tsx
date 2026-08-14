import React from "react";
import { StyleSheet, View, Text, Pressable, Platform, Alert } from "react-native";
import {
  COLORS,
  RADIUS,
  SPACING,
  TYPOGRAPHY,
  Icon as Lucide,
  useTheme,
} from "@edge/ui";
import { ApplicationData } from "../../../../../types/application";

export interface ReviewBottomBarProps {
  app: ApplicationData;
  isEditable: boolean;
  currentRole: string;
  canApprove: boolean;
  canDecline: boolean;
  canEndorse: boolean;
  canVerifyCashier: boolean;
  showCashierBtn: boolean;
  onOpenCashierModal: () => void;
  onOpenApproveModal: () => void;
  onOpenDeclineModal: () => void;
  onOpenEndorseModal: () => void;
}

export function ReviewBottomBar({
  app,
  isEditable,
  currentRole,
  canApprove,
  canDecline,
  canEndorse,
  canVerifyCashier,
  showCashierBtn,
  onOpenCashierModal,
  onOpenApproveModal,
  onOpenDeclineModal,
  onOpenEndorseModal,
}: ReviewBottomBarProps) {
  const { colors, isDark } = useTheme();

  const isCashierActionEnabled =
    (currentRole === "Cashier" || canVerifyCashier) &&
    app.status !== "Completed";

  return (
    <View
      style={[
        styles.actionBar,
        {
          borderTopColor: isDark ? colors.neutral[700] : colors.neutral[200],
          backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
        },
      ]}
    >
      {showCashierBtn ? (
        <Pressable
          style={[
            styles.actionBtnPrimary,
            {
              backgroundColor: isCashierActionEnabled
                ? isDark
                  ? colors.brand[500]
                  : colors.brand[700]
                : isDark
                ? "#1E293B"
                : "#E2E8F0",
              borderColor: isCashierActionEnabled
                ? "transparent"
                : isDark
                ? "#334155"
                : "#CBD5E1",
              borderWidth: 1,
            },
            !isCashierActionEnabled && styles.actionBtnDisabled,
            Platform.select({
              web: {
                cursor: isCashierActionEnabled ? "pointer" : "not-allowed",
              } as object,
            }),
          ]}
          onPress={() => isCashierActionEnabled && onOpenCashierModal()}
          disabled={!isCashierActionEnabled}
        >
          <Lucide
            name="credit-card"
            size={15}
            color={
              isCashierActionEnabled
                ? COLORS.neutral.white
                : isDark
                ? "#64748B"
                : "#94A3B8"
            }
          />
          <Text
            style={[
              styles.actionBtnPrimaryText,
              {
                color: isCashierActionEnabled
                  ? COLORS.neutral.white
                  : isDark
                  ? "#64748B"
                  : "#94A3B8",
              },
            ]}
          >
            Cashier Verification
          </Text>
        </Pressable>
      ) : (
        <>
          {(() => {
            const hasIncompleteApplicants =
              app.applicantsList?.some((a) => a.status === "Incomplete") ??
              false;
            const isApproveEnabled =
              isEditable && canApprove && !hasIncompleteApplicants;

            return (
              <Pressable
                style={[
                  styles.actionBtnPrimary,
                  {
                    backgroundColor: isApproveEnabled
                      ? isDark
                        ? "#166534"
                        : "#15803D"
                      : isDark
                      ? "#1E293B"
                      : "#E2E8F0",
                    borderColor: isApproveEnabled
                      ? "transparent"
                      : isDark
                      ? "#334155"
                      : "#CBD5E1",
                    borderWidth: 1,
                  },
                  !isApproveEnabled && styles.actionBtnDisabled,
                  Platform.select({
                    web: {
                      cursor: isApproveEnabled ? "pointer" : "not-allowed",
                    } as object,
                  }),
                ]}
                onPress={() => {
                  if (!isApproveEnabled) return;
                  const endorseApplicants =
                    app.applicantsList?.filter(
                      (a) => a.status === "ForEndorsement"
                    ) ?? [];
                  if (endorseApplicants.length > 0) {
                    const names = endorseApplicants
                      .map((a) => a.name)
                      .join(", ");
                    Alert.alert(
                      "Endorsement Required",
                      `Application cannot be directly approved: ${endorseApplicants.length} applicant(s) are marked For Endorsement (${names}). Please use the Endorse action to forward for review.`,
                      [{ text: "OK" }]
                    );
                    return;
                  }
                  onOpenApproveModal();
                }}
                disabled={!isApproveEnabled}
              >
                <Text
                  style={[
                    styles.actionBtnPrimaryText,
                    {
                      color: isApproveEnabled
                        ? COLORS.neutral.white
                        : isDark
                        ? "#64748B"
                        : "#94A3B8",
                    },
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
                backgroundColor:
                  isEditable && canDecline
                    ? isDark
                      ? colors.neutral[800]
                      : COLORS.neutral.white
                    : isDark
                    ? "#1E293B"
                    : "#F8FAFC",
                borderColor:
                  isEditable && canDecline
                    ? isDark
                      ? colors.neutral[300]
                      : COLORS.neutral[900]
                    : isDark
                    ? "#334155"
                    : "#E2E8F0",
                borderWidth: 1.5,
              },
              (!isEditable || !canDecline) && styles.actionBtnDisabled,
              Platform.select({
                web: {
                  cursor:
                    isEditable && canDecline ? "pointer" : "not-allowed",
                } as object,
              }),
            ]}
            onPress={() => isEditable && canDecline && onOpenDeclineModal()}
            disabled={!isEditable || !canDecline}
          >
            <Text
              style={[
                styles.actionBtnOutlineText,
                {
                  color:
                    isEditable && canDecline
                      ? isDark
                        ? colors.neutral[100]
                        : COLORS.neutral[900]
                      : isDark
                      ? "#64748B"
                      : "#94A3B8",
                },
              ]}
            >
              Return
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.actionBtnOutline,
              {
                backgroundColor:
                  isEditable && canEndorse
                    ? isDark
                      ? colors.neutral[800]
                      : COLORS.neutral.white
                    : isDark
                    ? "#1E293B"
                    : "#F8FAFC",
                borderColor:
                  isEditable && canEndorse
                    ? isDark
                      ? colors.brand[400]
                      : colors.brand[600]
                    : isDark
                    ? "#334155"
                    : "#E2E8F0",
                borderWidth: 1.5,
              },
              (!isEditable || !canEndorse) && styles.actionBtnDisabled,
              Platform.select({
                web: {
                  cursor:
                    isEditable && canEndorse ? "pointer" : "not-allowed",
                } as object,
              }),
            ]}
            onPress={() => isEditable && canEndorse && onOpenEndorseModal()}
            disabled={!isEditable || !canEndorse}
          >
            <Text
              style={[
                styles.actionBtnOutlineText,
                {
                  color:
                    isEditable && canEndorse
                      ? isDark
                        ? colors.brand[400]
                        : colors.brand[600]
                      : isDark
                      ? "#64748B"
                      : "#94A3B8",
                },
              ]}
            >
              Endorse →
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  actionBar: {
    flexDirection: "row",
    gap: SPACING[8],
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[12],
    borderTopWidth: 1,
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING[6],
    paddingVertical: SPACING[10],
    borderRadius: RADIUS.button,
  },
  actionBtnPrimaryText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  actionBtnOutline: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING[10],
    borderRadius: RADIUS.button,
  },
  actionBtnOutlineText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  actionBtnDisabled: {
    opacity: 0.6,
  },
});
