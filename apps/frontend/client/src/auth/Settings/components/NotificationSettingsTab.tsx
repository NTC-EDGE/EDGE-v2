import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS, TYPOGRAPHY, SPACING, Icon } from "@edge/ui";
import { Button } from "../../../shared/components/Button";
import { UserNotificationPreferences } from "../hooks/useClientSettings";

interface NotificationSettingsTabProps {
  notifications: UserNotificationPreferences;
  onUpdateNotifications: (fields: Partial<UserNotificationPreferences>) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function NotificationSettingsTab({
  notifications,
  onUpdateNotifications,
  onSave,
  isSaving,
}: NotificationSettingsTabProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderIcon}>
            <Icon name="bell" size={20} color="#0F2C59" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Filing & Application Notifications</Text>
            <Text style={styles.cardSubtitle}>
              Control which system alerts, review status transitions, and reminders are sent to your registered contact channels.
            </Text>
          </View>
        </View>

        <View style={styles.optionsList}>
          {/* Status Updates */}
          <View style={styles.optionRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>Application Status Updates</Text>
              <Text style={styles.optionSubtitle}>
                Receive email notifications when your application is Approved, Issued, or Requires Attention / Action.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                onUpdateNotifications({
                  emailStatusUpdates: !notifications.emailStatusUpdates,
                })
              }
              style={[
                styles.toggleTrack,
                notifications.emailStatusUpdates && styles.toggleTrackActive,
              ]}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.toggleThumb,
                  notifications.emailStatusUpdates && styles.toggleThumbActive,
                ]}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Payment Receipts */}
          <View style={styles.optionRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>Payment & Official Receipts (OR)</Text>
              <Text style={styles.optionSubtitle}>
                Get digital copies of your official fee breakdown statements and payment confirmation receipts.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                onUpdateNotifications({
                  emailPaymentReceipts: !notifications.emailPaymentReceipts,
                })
              }
              style={[
                styles.toggleTrack,
                notifications.emailPaymentReceipts && styles.toggleTrackActive,
              ]}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.toggleThumb,
                  notifications.emailPaymentReceipts && styles.toggleThumbActive,
                ]}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* License Expiry Reminders */}
          <View style={styles.optionRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>License & Permit Expiration Reminders</Text>
              <Text style={styles.optionSubtitle}>
                Early renewal alerts sent 60 days and 30 days before radio licenses, certificates, or station permits expire.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                onUpdateNotifications({
                  expiryReminders: !notifications.expiryReminders,
                })
              }
              style={[
                styles.toggleTrack,
                notifications.expiryReminders && styles.toggleTrackActive,
              ]}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.toggleThumb,
                  notifications.expiryReminders && styles.toggleThumbActive,
                ]}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Schedule Alerts */}
          <View style={styles.optionRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>Examination & Seminar Schedules</Text>
              <Text style={styles.optionSubtitle}>
                Notifications regarding assigned examination venue slots, seminar times, and physical inspection schedules.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                onUpdateNotifications({
                  scheduleAlerts: !notifications.scheduleAlerts,
                })
              }
              style={[
                styles.toggleTrack,
                notifications.scheduleAlerts && styles.toggleTrackActive,
              ]}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.toggleThumb,
                  notifications.scheduleAlerts && styles.toggleThumbActive,
                ]}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* SMS Alerts */}
          <View style={styles.optionRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>SMS Urgent Text Alerts</Text>
              <Text style={styles.optionSubtitle}>
                Send critical filing milestones and payment reminders via cellular SMS to your registered mobile number.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                onUpdateNotifications({
                  smsAlerts: !notifications.smsAlerts,
                })
              }
              style={[
                styles.toggleTrack,
                notifications.smsAlerts && styles.toggleTrackActive,
              ]}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.toggleThumb,
                  notifications.smsAlerts && styles.toggleThumbActive,
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Save Action Footer */}
      <View style={styles.footerActionRow}>
        <Button
          variant="primary"
          onPress={onSave}
          loading={isSaving}
          icon={<Icon name="check" size={16} color="#FFFFFF" />}
        >
          Save Notification Preferences
        </Button>
      </View>
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
  optionsList: {
    gap: 14,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  optionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  optionSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E2E8F0",
    padding: 2,
    justifyContent: "center",
  },
  toggleTrackActive: {
    backgroundColor: "#0F2C59",
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
  },
  footerActionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: SPACING[8],
  },
});
