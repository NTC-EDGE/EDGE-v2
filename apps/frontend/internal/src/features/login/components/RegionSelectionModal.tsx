import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  useWindowDimensions,
  Platform,
} from "react-native";
import {
  COLORS,
  SHADOWS,
  TYPOGRAPHY,
  Icon as Lucide,
  useTheme,
  SkeletonLoader,
} from "@edge/ui";
import { useMyTenantMemberships, parseApiError } from "@edge/api";
import { useAuth } from "@clerk/expo";
import { SignOutConfirmModal } from "../../auth/components/SignOutConfirmModal";

interface RegionSelectionModalProps {
  visible: boolean;
  onConfirmRegion: (selectedRegionCode: string) => Promise<void>;
  onSignOut: () => Promise<void>;
}

export function RegionSelectionModal({
  visible,
  onConfirmRegion,
  onSignOut,
}: RegionSelectionModalProps) {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const clerkAuth = useAuth();

  const [token, setToken] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [isSignOutConfirmVisible, setIsSignOutConfirmVisible] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOutConfirm = async () => {
    setIsSigningOut(true);
    try {
      await onSignOut();
    } catch (err: unknown) {
      console.error("Sign out error:", err);
    } finally {
      setIsSigningOut(false);
      setIsSignOutConfirmVisible(false);
    }
  };

  // Obtain current session token for SWR hook
  useEffect(() => {
    if (visible) {
      const getToken = async () => {
        const tok = clerkAuth.getToken ? await clerkAuth.getToken() : null;
        setToken(tok);
      };
      getToken();
    }
  }, [visible, clerkAuth]);

  // Data Layer SWR Hook for caller's tenant memberships
  const { memberships, isLoading, isError, error: swrError, refetch } = useMyTenantMemberships(token, visible);

  // Automatically select the first authorized region when memberships load
  useEffect(() => {
    if (memberships.length > 0 && selectedRegion.length === 0) {
      setSelectedRegion(memberships[0].regionCode);
    }
  }, [memberships, selectedRegion]);

  const displayActionError = actionError.length > 0 ? actionError : "";

  const handleConfirm = async () => {
    if (selectedRegion.length === 0) {
      setActionError("Please select a Regional Office.");
      return;
    }

    setActionError("");
    setIsSubmitting(true);
    try {
      await onConfirmRegion(selectedRegion);
    } catch (err: unknown) {
      setActionError(parseApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.modalCard, SHADOWS.modal, isMobile && { padding: 20 }]}>
          <View style={styles.headerRow}>
            <View style={[styles.headerIconCircle, { backgroundColor: isDark ? colors.neutral[800] : colors.brand.light }]}>
              <Lucide name="map-pin" size={22} color={isDark ? colors.brand.primary : colors.brand[800]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Regional Office</Text>
              <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                Choose which regional portal session you want to open.
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {isLoading ? (
            <View style={styles.loadingBox}>
              <SkeletonLoader height={48} borderRadius={10} style={{ marginBottom: 12 }} />
              <Text style={[styles.loadingText, { color: colors.textMuted }]}>Verifying your regional office memberships...</Text>
            </View>
          ) : isError ? (
            /* Case 1: Backend API Offline or Network Connection Error */
            <View style={styles.noMembershipBox}>
              <View style={[styles.alertIconCircle, { backgroundColor: colors.semantic.errorBg }]}>
                <Lucide name="alert-triangle" size={28} color={colors.semantic.error} />
              </View>
              <Text style={[styles.noMembershipTitle, { color: colors.semantic.errorText }]}>Server Connection Error</Text>
              <Text style={[styles.noMembershipText, { color: colors.textMuted }]}>
                {parseApiError(swrError)}
              </Text>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity style={[styles.retryButton, { backgroundColor: isDark ? colors.brand.primary : colors.brand[800] }]} onPress={() => refetch()}>
                  <Lucide name="refresh-cw" size={16} color={colors.neutral.white} />
                  <Text style={styles.signOutButtonText}>Retry Connection</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.signOutOutlineButton, { borderColor: colors.border }]} onPress={() => setIsSignOutConfirmVisible(true)}>
                  <Text style={[styles.signOutOutlineText, { color: colors.textMuted }]}>Sign Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : memberships.length === 0 ? (
            /* Case 2: User is NOT a member of any region */
            <View style={styles.noMembershipBox}>
              <View style={[styles.alertIconCircle, { backgroundColor: colors.semantic.errorBg }]}>
                <Lucide name="alert-triangle" size={28} color={colors.semantic.error} />
              </View>
              <Text style={[styles.noMembershipTitle, { color: colors.semantic.errorText }]}>Access Denied</Text>
              <Text style={[styles.noMembershipText, { color: colors.textMuted }]}>
                You are not an active member yet of any Regional Office. Please contact your system administrator to assign you to a region.
              </Text>

              <TouchableOpacity style={[styles.signOutButton, { backgroundColor: colors.semantic.error }]} onPress={() => setIsSignOutConfirmVisible(true)}>
                <Lucide name="log-out" size={16} color={colors.neutral.white} />
                <Text style={styles.signOutButtonText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Case 3: User has 1 or more assigned region memberships */
            <View style={styles.bodyContent}>
              {displayActionError.length > 0 ? (
                <View style={[styles.errorBanner, { backgroundColor: colors.semantic.errorBg, borderColor: colors.semantic.errorBorder }]}>
                  <Lucide name="alert-circle" size={16} color={colors.semantic.error} />
                  <Text style={[styles.errorText, { color: colors.semantic.errorText }]}>{displayActionError}</Text>
                </View>
              ) : null}

              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>Your Authorized Regional Offices</Text>

              <TouchableOpacity
                style={[styles.dropdownSelector, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50], borderColor: colors.border }]}
                onPress={() => setShowDropdown(!showDropdown)}
                activeOpacity={0.8}
              >
                <View style={styles.dropdownInner}>
                  <Lucide name="map-pin" size={18} color={colors.textMuted} />
                  <Text style={[styles.dropdownValue, { color: colors.text }]}>
                    {memberships.find((m) => m.regionCode === selectedRegion)?.regionName ?? selectedRegion}
                  </Text>
                </View>
                <Lucide
                  name={showDropdown ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>

              {showDropdown ? (
                <View style={[styles.popoverMenu, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                  <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled={true}>
                    {memberships.map((item) => (
                      <TouchableOpacity
                        key={item.tenantId}
                        style={[
                          styles.optionItem,
                          item.regionCode === selectedRegion && [styles.optionItemSelected, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }],
                        ]}
                        onPress={() => {
                          setSelectedRegion(item.regionCode);
                          setShowDropdown(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            { color: colors.text },
                            item.regionCode === selectedRegion && [styles.optionTextSelected, { color: isDark ? colors.brand.primary : colors.brand[800] }],
                          ]}
                        >
                          {item.regionCode} - {item.regionName}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              ) : null}

              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsSignOutConfirmVisible(true)} disabled={isSubmitting}>
                  <Text style={[styles.cancelBtnText, { color: colors.textMuted }]}>Sign Out</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.confirmBtn, { backgroundColor: isDark ? colors.brand.primary : colors.brand[800] }, isSubmitting && { opacity: 0.7 }]}
                  onPress={handleConfirm}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color={colors.neutral.white} />
                  ) : (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text style={styles.confirmBtnText}>Confirm & Enter Portal</Text>
                      <Lucide name="arrow-right" size={16} color={colors.neutral.white} />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Sign Out Confirmation Dialog */}
      <SignOutConfirmModal
        visible={isSignOutConfirmVisible}
        loading={isSigningOut}
        onClose={() => {
          if (!isSigningOut) {
            setIsSignOutConfirmVisible(false);
          }
        }}
        onConfirm={handleSignOutConfirm}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 28,
    position: "relative",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  headerIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  modalSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  loadingBox: {
    paddingVertical: 32,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
  },
  noMembershipBox: {
    paddingVertical: 12,
    alignItems: "center",
  },
  alertIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  noMembershipTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: 8,
  },
  noMembershipText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  signOutButtonText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
  },
  signOutOutlineButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  signOutOutlineText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  bodyContent: {
    position: "relative",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    flex: 1,
  },
  fieldLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginBottom: 8,
  },
  dropdownSelector: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  dropdownInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  dropdownValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    flex: 1,
  },
  popoverMenu: {
    position: "absolute",
    top: 76,
    left: 0,
    right: 0,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 4,
    ...Platform.select({
      web: {
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.16)",
      },
      default: {
        shadowColor: COLORS.neutral[900],
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.16,
        shadowRadius: 16,
      },
    }),
    elevation: 1000,
    zIndex: 1000,
  },
  optionItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginVertical: 1,
  },
  optionItemSelected: {},
  optionText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
  },
  optionTextSelected: {
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cancelBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  confirmBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  confirmBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
  },
});
