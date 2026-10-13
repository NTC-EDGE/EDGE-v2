import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Icon, COLORS, TYPOGRAPHY } from "@edge/ui";

export interface ExamScheduleCardData {
  id: string;
  scheduledDate: string;
  startTime?: string | null;
  endTime?: string | null;
  venue?: string | null;
  maximumSlots?: number | null;
  availableSlots?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  startApplication?: string | null;
  endApplication?: string | null;
  applicationDeadline?: string | null;
  regionName?: string | null;
  serviceName?: string | null;
  title?: string | null;
  remarks?: string | null;
  description?: string | null;
}

interface ExamScheduleCardProps {
  schedule: ExamScheduleCardData;
  isSelected: boolean;
  onSelect: (id: string) => void;
  fallbackRegionName?: string;
}

export function formatFriendlyDate(val?: string | null): string {
  if (!val) return "TBA";
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatFullExamDate(val?: string | null): string {
  if (!val) return "Scheduled Date TBA";
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getFilingWindowInfo(startApp?: string | null, endApp?: string | null) {
  const now = new Date();
  if (startApp) {
    const s = new Date(startApp);
    if (!isNaN(s.getTime()) && now < s) {
      return {
        label: `Filing Starts ${formatFriendlyDate(startApp)}`,
        badgeBg: "#FEF3C7",
        badgeBorder: "#FDE68A",
        badgeText: "#B45309",
        iconName: "clock" as const,
      };
    }
  }
  if (endApp) {
    const e = new Date(endApp);
    if (!isNaN(e.getTime())) {
      e.setHours(23, 59, 59, 999);
      if (now > e) {
        return {
          label: "Filing Closed",
          badgeBg: "#FEE2E2",
          badgeBorder: "#FECACA",
          badgeText: "#DC2626",
          iconName: "alert-circle" as const,
        };
      }
    }
  }
  return {
    label: endApp ? `Filing Ends ${formatFriendlyDate(endApp)}` : "Filing Open",
    badgeBg: "#DCFCE7",
    badgeBorder: "#BBF7D0",
    badgeText: "#15803D",
    iconName: "check-circle" as const,
  };
}

export function ExamScheduleCard({
  schedule,
  isSelected,
  onSelect,
  fallbackRegionName,
}: ExamScheduleCardProps) {
  const filingInfo = getFilingWindowInfo(
    schedule.startApplication,
    schedule.endApplication || schedule.applicationDeadline
  );

  const examTimeDisplay =
    [schedule.startTime, schedule.endTime].filter(Boolean).join(" - ") || "08:00 AM - 12:00 PM";

  const effectiveRegion = schedule.regionName || fallbackRegionName || "NTC Regional Office";
  const effectiveVenue = schedule.venue || "NTC Regional Examination Center";
  const remarksText = schedule.remarks || schedule.description;

  const appStartDisplay = formatFriendlyDate(schedule.startApplication);
  const appEndDisplay = formatFriendlyDate(
    schedule.endApplication || schedule.applicationDeadline
  );

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onSelect(schedule.id)}
      style={[
        styles.cardContainer,
        isSelected && styles.cardSelected,
      ]}
    >
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
            {isSelected && <View style={styles.radioDot} />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.examDateTitle, isSelected && styles.examDateTitleSelected]}>
              {formatFullExamDate(schedule.startDate || schedule.scheduledDate)}
            </Text>
            {schedule.title ? (
              <Text style={styles.examSubtitle}>{schedule.title}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.badgesWrapper}>
          <View
            style={[
              styles.badge,
              { backgroundColor: filingInfo.badgeBg, borderColor: filingInfo.badgeBorder },
            ]}
          >
            <Icon name={filingInfo.iconName} size={11} color={filingInfo.badgeText} />
            <Text style={[styles.badgeText, { color: filingInfo.badgeText }]}>
              {filingInfo.label}
            </Text>
          </View>

          {isSelected && (
            <View style={styles.selectedBadge}>
              <Icon name="check" size={11} color="#FFFFFF" />
              <Text style={styles.selectedBadgeText}>SELECTED</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Grid of Key Schedule Details */}
      <View style={styles.detailsGrid}>
        {/* Exam Time */}
        <View style={styles.detailItem}>
          <View style={styles.iconCircle}>
            <Icon name="clock" size={13} color="#0F2C59" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Exam Time</Text>
            <Text style={styles.detailValue}>{examTimeDisplay}</Text>
          </View>
        </View>

        {/* Region / Jurisdiction */}
        <View style={styles.detailItem}>
          <View style={styles.iconCircle}>
            <Icon name="globe" size={13} color="#0F2C59" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Region / Jurisdiction</Text>
            <Text style={styles.detailValue}>{effectiveRegion}</Text>
          </View>
        </View>

        {/* Examination Venue */}
        <View style={[styles.detailItem, { width: "100%" }]}>
          <View style={styles.iconCircle}>
            <Icon name="map-pin" size={13} color="#DC2626" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Examination Venue & Location</Text>
            <Text style={styles.detailValue}>{effectiveVenue}</Text>
          </View>
        </View>

        {/* Application Filing Window */}
        <View style={styles.detailItem}>
          <View style={styles.iconCircle}>
            <Icon name="calendar" size={13} color="#059669" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Application Period (Filing Window)</Text>
            <Text style={styles.detailValue}>
              {appStartDisplay} – {appEndDisplay}
            </Text>
          </View>
        </View>

        {/* Capacity / Slots */}
        <View style={styles.detailItem}>
          <View style={styles.iconCircle}>
            <Icon name="users" size={13} color="#D97706" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Capacity & Slots</Text>
            <Text style={styles.detailValue}>
              {schedule.availableSlots !== null && schedule.availableSlots !== undefined
                ? `${schedule.availableSlots} Available (${schedule.maximumSlots ?? "N/A"} Max)`
                : schedule.maximumSlots !== null && schedule.maximumSlots !== undefined
                ? `${schedule.maximumSlots} Maximum Examinee Slots`
                : "Slots Determined by Venue"}
            </Text>
          </View>
        </View>
      </View>

      {/* Special Reminders / Remarks callout */}
      {remarksText ? (
        <View style={styles.remarksBox}>
          <Icon name="info" size={14} color="#92400E" style={{ marginTop: 2 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.remarksLabel}>Special Instructions & Remarks:</Text>
            <Text style={styles.remarksText}>{remarksText}</Text>
          </View>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    padding: 14,
    marginBottom: 12,
    shadowColor: "#0F2C59",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardSelected: {
    borderColor: "#0F2C59",
    borderWidth: 2,
    backgroundColor: "#F8FAFC",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    flex: 1,
    minWidth: 200,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#94A3B8",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  radioCircleSelected: {
    borderColor: "#0F2C59",
    backgroundColor: "#0F2C59",
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  examDateTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
  },
  examDateTitleSelected: {
    color: "#0F2C59",
  },
  examSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  badgesWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "700",
  },
  selectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#0F2C59",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  selectedBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 12,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 10,
    columnGap: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    width: "48%",
    minWidth: 180,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  detailValue: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12.5,
    fontWeight: "600",
    color: "#1E293B",
    marginTop: 1,
  },
  remarksBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  remarksLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 2,
  },
  remarksText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#78350F",
    lineHeight: 16,
  },
});
