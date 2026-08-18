import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { COLORS, TYPOGRAPHY, SPACING, Icon } from "@edge/ui";
import { useAuth } from "@clerk/expo";
import { Button } from "../../../shared/components/Button";
import { ConfirmationDialog } from "../../../shared/components/ConfirmationDialog";

interface SecuritySettingsTabProps {
  clerkUser: any;
  onClearLocalDraftCache: () => void;
}

export function SecuritySettingsTab({
  clerkUser,
  onClearLocalDraftCache,
}: SecuritySettingsTabProps) {
  const { signOut } = useAuth();
  const [isSignOutConfirmVisible, setIsSignOutConfirmVisible] = useState(false);
  const [isClearDraftsConfirmVisible, setIsClearDraftsConfirmVisible] = useState(false);

  const createdAtDate = clerkUser?.createdAt
    ? new Date(clerkUser.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  const lastSignInDate = clerkUser?.lastSignInAt
    ? new Date(clerkUser.lastSignInAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Active Now";

  return (
    <View style={styles.container}>
      {/* ── 1. Account & Identity Overview ──────────────────────── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderIcon}>
            <Icon name="shield" size={20} color="#0F2C59" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Account Security & Authentication</Text>
            <Text style={styles.cardSubtitle}>
              Authenticated identity information and secure sign-in credentials.
            </Text>
          </View>
        </View>

        <View style={styles.securityGrid}>
          <View style={styles.securityItem}>
            <Text style={styles.securityItemLabel}>Account ID</Text>
            <Text style={styles.securityItemValue} numberOfLines={1} ellipsizeMode="middle">
              {clerkUser?.id || "N/A"}
            </Text>
          </View>

          <View style={styles.securityItem}>
            <Text style={styles.securityItemLabel}>Primary Email</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={styles.securityItemValue}>
                {clerkUser?.primaryEmailAddress?.emailAddress || "N/A"}
              </Text>
              <View style={styles.verifiedTag}>
                <Icon name="check" size={10} color="#065F46" />
                <Text style={styles.verifiedTagText}>Verified</Text>
              </View>
            </View>
          </View>

          <View style={styles.securityItem}>
            <Text style={styles.securityItemLabel}>Member Since</Text>
            <Text style={styles.securityItemValue}>{createdAtDate}</Text>
          </View>

          <View style={styles.securityItem}>
            <Text style={styles.securityItemLabel}>Last Sign In</Text>
            <Text style={styles.securityItemValue}>{lastSignInDate}</Text>
          </View>
        </View>
      </View>

      {/* ── 2. Data & Storage Management ────────────────────────── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderIcon}>
            <Icon name="database" size={20} color="#0F2C59" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Data & Local Storage</Text>
            <Text style={styles.cardSubtitle}>
              Manage local browser storage, cached application drafts, and offline assets.
            </Text>
          </View>
        </View>

        <View style={styles.actionList}>
          <View style={styles.actionRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>Clear Local Form Drafts Cache</Text>
              <Text style={styles.actionSubtitle}>
                Removes locally cached auto-save form drafts and temporary wizard states on this device.
              </Text>
            </View>
            <Button
              variant="secondary"
              onPress={() => setIsClearDraftsConfirmVisible(true)}
              icon={<Icon name="trash-2" size={14} color="#64748B" />}
            >
              Clear Cache
            </Button>
          </View>

          <View style={styles.divider} />

          <View style={styles.actionRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>Session Management</Text>
              <Text style={styles.actionSubtitle}>
                Sign out of this session safely across your devices.
              </Text>
            </View>
            <Button
              variant="secondary"
              onPress={() => setIsSignOutConfirmVisible(true)}
              icon={<Icon name="log-out" size={14} color="#DC2626" />}
            >
              Sign Out
            </Button>
          </View>
        </View>
      </View>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        visible={isClearDraftsConfirmVisible}
        title="Clear Local Draft Cache"
        message="Are you sure you want to clear all locally cached drafts? Unsubmitted temporary forms on this browser will be reset."
        iconName="trash-2"
        onClose={() => setIsClearDraftsConfirmVisible(false)}
        actions={[
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => setIsClearDraftsConfirmVisible(false),
          },
          {
            text: "Clear Cache",
            style: "destructive",
            onPress: () => {
              setIsClearDraftsConfirmVisible(false);
              onClearLocalDraftCache();
            },
          },
        ]}
      />

      <ConfirmationDialog
        visible={isSignOutConfirmVisible}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        iconName="log-out"
        onClose={() => setIsSignOutConfirmVisible(false)}
        actions={[
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => setIsSignOutConfirmVisible(false),
          },
          {
            text: "Yes, Sign Out",
            style: "destructive",
            onPress: async () => {
              setIsSignOutConfirmVisible(false);
              await signOut();
            },
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING[20],
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: SPACING[20],
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: SPACING[20],
    paddingBottom: SPACING[12],
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  cardHeaderIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F0F4F8",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: "700",
    color: "#0F2C59",
  },
  cardSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  securityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 16,
    marginHorizontal: -8,
  },
  securityItem: {
    width: "50%",
    paddingHorizontal: 8,
    minWidth: 240,
    gap: 4,
  },
  securityItemLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  securityItemValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  verifiedTagText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: "700",
    color: "#065F46",
  },
  actionList: {
    gap: 14,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 14,
  },
  actionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  actionSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },
});
