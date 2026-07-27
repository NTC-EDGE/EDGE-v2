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
} from "react-native";
import {
  COLORS,
  SHADOWS,
  TYPOGRAPHY,
  Icon as Lucide,
} from "@edge/ui";
import { useMyTenantMemberships, parseApiError } from "@edge/api";
import { useAuth } from "@clerk/expo";

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
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const clerkAuth = useAuth();

  const [token, setToken] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");

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
  const { memberships, isLoading, isError, error: swrError } = useMyTenantMemberships(token, visible);

  // Automatically select the first authorized region when memberships load
  useEffect(() => {
    if (memberships.length > 0 && selectedRegion.length === 0) {
      setSelectedRegion(memberships[0].regionCode);
    }
  }, [memberships, selectedRegion]);

  const displayError = actionError.length > 0 ? actionError : isError ? parseApiError(swrError) : "";

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
            <View style={styles.headerIconCircle}>
              <Lucide name="map-pin" size={22} color="#1E3A8A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>Select Regional Office</Text>
              <Text style={styles.modalSubtitle}>
                Choose which regional portal session you want to open.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#0E1B61" />
              <Text style={styles.loadingText}>Verifying your regional office memberships...</Text>
            </View>
          ) : memberships.length === 0 ? (
            /* Case B: User is NOT a member of any region */
            <View style={styles.noMembershipBox}>
              <View style={styles.alertIconCircle}>
                <Lucide name="alert-triangle" size={28} color="#DC2626" />
              </View>
              <Text style={styles.noMembershipTitle}>Access Denied</Text>
              <Text style={styles.noMembershipText}>
                You are not an active member yet of any Regional Office. Please contact your system administrator to assign you to a region.
              </Text>

              <TouchableOpacity style={styles.signOutButton} onPress={onSignOut}>
                <Lucide name="log-out" size={16} color={COLORS.neutral.white} />
                <Text style={styles.signOutButtonText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Case A: User has 1 or more assigned region memberships */
            <View style={styles.bodyContent}>
              {displayError.length > 0 ? (
                <View style={styles.errorBanner}>
                  <Lucide name="alert-circle" size={16} color="#DC2626" />
                  <Text style={styles.errorText}>{displayError}</Text>
                </View>
              ) : null}

              <Text style={styles.fieldLabel}>Your Authorized Regional Offices</Text>

              <TouchableOpacity
                style={styles.dropdownSelector}
                onPress={() => setShowDropdown(!showDropdown)}
                activeOpacity={0.8}
              >
                <View style={styles.dropdownInner}>
                  <Lucide name="map-pin" size={18} color={COLORS.neutral[500]} />
                  <Text style={styles.dropdownValue}>
                    {memberships.find((m) => m.regionCode === selectedRegion)?.regionName ?? selectedRegion}
                  </Text>
                </View>
                <Lucide
                  name={showDropdown ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={COLORS.neutral[500]}
                />
              </TouchableOpacity>

              {showDropdown ? (
                <View style={styles.popoverMenu}>
                  <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled={true}>
                    {memberships.map((item) => (
                      <TouchableOpacity
                        key={item.tenantId}
                        style={[
                          styles.optionItem,
                          item.regionCode === selectedRegion && styles.optionItemSelected,
                        ]}
                        onPress={() => {
                          setSelectedRegion(item.regionCode);
                          setShowDropdown(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            item.regionCode === selectedRegion && styles.optionTextSelected,
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
                <TouchableOpacity style={styles.cancelBtn} onPress={onSignOut} disabled={isSubmitting}>
                  <Text style={styles.cancelBtnText}>Sign Out</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.confirmBtn, isSubmitting && { opacity: 0.7 }]}
                  onPress={handleConfirm}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color={COLORS.neutral.white} />
                  ) : (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text style={styles.confirmBtnText}>Confirm & Enter Portal</Text>
                      <Lucide name="arrow-right" size={16} color={COLORS.neutral.white} />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
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
    backgroundColor: COLORS.neutral.white,
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
    backgroundColor: "rgba(30, 58, 138, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#0F172A",
  },
  modalSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[600],
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
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
    color: COLORS.neutral[600],
  },
  noMembershipBox: {
    paddingVertical: 12,
    alignItems: "center",
  },
  alertIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  noMembershipTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: "#991B1B",
    marginBottom: 8,
  },
  noMembershipText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.neutral[600],
    textAlign: "center",
    marginBottom: 24,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#DC2626",
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
  bodyContent: {
    position: "relative",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: "#DC2626",
    flex: 1,
  },
  fieldLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.neutral[600],
    marginBottom: 8,
  },
  dropdownSelector: {
    height: 48,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
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
    color: COLORS.neutral[900],
    fontWeight: TYPOGRAPHY.weights.semibold,
    flex: 1,
  },
  popoverMenu: {
    position: "absolute",
    top: 76,
    left: 0,
    right: 0,
    backgroundColor: COLORS.neutral.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 1000,
    zIndex: 1000,
  },
  optionItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginVertical: 1,
  },
  optionItemSelected: {
    backgroundColor: "rgba(37, 99, 235, 0.08)",
  },
  optionText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[700],
  },
  optionTextSelected: {
    color: "#0E1B61",
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
    color: COLORS.neutral[600],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  confirmBtn: {
    backgroundColor: "#0E1B61",
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
