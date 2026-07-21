import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Icon } from '@edge/ui';
import { COLORS, SPACING, TYPOGRAPHY } from '@edge/ui';
import {
  Application,
  DensityOption,
  getStatusLabel,
  getStatusColor,
  getStatusBgColor,
  formatRelativeTime,
} from '../data/applicationsData';

interface ApplicationCardProps {
  app: Application;
  isExpanded: boolean;
  isSelected: boolean;
  density: DensityOption;
  onPress: () => void;
  onPreview: () => void;
}

export function ApplicationCard({
  app,
  isExpanded,
  isSelected,
  density,
  onPress,
  onPreview,
}: ApplicationCardProps) {
  const isBulk = app.mode === 'BULK';
  const primaryName = isBulk ? app.companyName : app.applicantName;
  const statusColor = getStatusColor(app.status);

  const isPaymentAvailable =
    app.status === 'READY_FOR_PAYMENT' || app.status === 'APPROVED';
  const isAccreditationAvailable = app.status === 'APPROVED';

  const verticalPad =
    density === 'compact' ? 8 : density === 'cozy' ? 10 : 14;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        isExpanded && styles.cardExpanded,
        { borderLeftColor: statusColor },
      ]}
    >
      {/* ── Element / type header row ─────────────────────────── */}
      <View style={styles.elementRow}>
        <Text style={styles.elementLabel}>{app.element.toUpperCase()}</Text>
      </View>

      {/* ── Main card body ────────────────────────────────────── */}
      <View style={[styles.cardBody, { paddingVertical: verticalPad }]}>
        {/* Mode badge + primary name */}
        <View style={styles.titleRow}>
          <View
            style={[
              styles.modeBadge,
              isBulk ? styles.bulkBadge : styles.singleBadge,
            ]}
          >
            <View
              style={[
                styles.modeDot,
                { backgroundColor: isBulk ? '#D97706' : '#2F56E8' },
              ]}
            />
            <Text
              style={[
                styles.modeBadgeText,
                { color: isBulk ? '#D97706' : '#2F56E8' },
              ]}
            >
              {isBulk ? 'Bulk' : 'Single'}
            </Text>
          </View>

          <Text style={styles.primaryName} numberOfLines={1}>
            {primaryName}
          </Text>
        </View>

        {/* Service name – hidden on compact */}
        {density !== 'compact' && (
          <Text style={styles.serviceName} numberOfLines={2}>
            {app.serviceName}
          </Text>
        )}

        {/* Submission time */}
        <Text style={styles.submittedTime}>
          Submitted {formatRelativeTime(app.submittedAt)}
        </Text>
      </View>

      {/* ── Expanded section ─────────────────────────────────── */}
      {isExpanded && (
        <View style={styles.expandedSection}>
          <View style={styles.sectionDivider} />

          {/* Status + Preview button row */}
          <View style={styles.statusRow}>
            <View style={styles.statusPill}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: statusColor },
                ]}
              />
              <Text
                style={[styles.statusLabel, { color: statusColor }]}
              >
                {getStatusLabel(app.status).toUpperCase()}
              </Text>
            </View>

            <TouchableOpacity
              onPress={(e) => {
                // Prevent outer onPress from toggling collapse
                e.stopPropagation?.();
                onPreview();
              }}
              activeOpacity={0.85}
              style={styles.previewBtn}
            >
              <Text style={styles.previewBtnText}>Preview</Text>
              <Icon
                name="chevron-right"
                size={14}
                color={COLORS.neutral.white}
              />
            </TouchableOpacity>
          </View>

          {/* Payment section */}
          <View style={styles.docSection}>
            <Text style={styles.docSectionHeader}>PAYMENT</Text>
            {isPaymentAvailable ? (
              <TouchableOpacity style={styles.docActiveBtn} activeOpacity={0.8}>
                <Text style={styles.docActiveBtnText}>Order of Payment</Text>
                <Icon
                  name="chevron-right"
                  size={14}
                  color={COLORS.brand[700]}
                />
              </TouchableOpacity>
            ) : (
              <View style={styles.docPendingRow}>
                <Text style={styles.docPendingName}>Order of Payment</Text>
                <Text style={styles.pendingText}>Pending</Text>
              </View>
            )}
          </View>

          {/* Accreditation section */}
          <View style={styles.docSection}>
            <Text style={styles.docSectionHeader}>ACCREDITATION</Text>
            {isAccreditationAvailable ? (
              <TouchableOpacity style={styles.docActiveBtn} activeOpacity={0.8}>
                <Text style={styles.docActiveBtnText}>Download Certificate</Text>
                <Icon
                  name="download"
                  size={14}
                  color={COLORS.brand[700]}
                />
              </TouchableOpacity>
            ) : (
              <View style={styles.docPendingRow}>
                <Text style={styles.docPendingName}>Certificate</Text>
                <View style={styles.pendingWithIcon}>
                  <Text style={styles.pendingText}>Pending</Text>
                  <Icon
                    name="download"
                    size={12}
                    color={COLORS.neutral[400]}
                    style={{ marginLeft: 4 }}
                  />
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* ── Expand / collapse chevron ─────────────────────────── */}
      <View style={styles.chevronRow}>
        <Icon
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={COLORS.neutral[400]}
        />
      </View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderLeftWidth: 4,
    marginBottom: SPACING[12],
    overflow: 'hidden',
    ...Platform.select({
      web: { cursor: 'pointer' as unknown as undefined },
    }),
  },
  cardSelected: {
    borderColor: COLORS.brand[700],
    backgroundColor: '#FAFBFF',
  },
  cardExpanded: {
    borderColor: COLORS.neutral[300],
  },

  // Element header row
  elementRow: {
    backgroundColor: COLORS.neutral[50],
    paddingHorizontal: SPACING[16],
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  elementLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[500],
    letterSpacing: 0.8,
  },

  // Card body
  cardBody: {
    paddingHorizontal: SPACING[16],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
    gap: 8,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  singleBadge: {
    backgroundColor: '#EEF2FF',
  },
  bulkBadge: {
    backgroundColor: '#FEF3C7',
  },
  modeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  modeBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  primaryName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    flex: 1,
  },
  serviceName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[500],
    marginBottom: 6,
    lineHeight: 16,
  },
  submittedTime: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: COLORS.neutral[400],
  },

  // Expanded section
  expandedSection: {
    paddingHorizontal: SPACING[16],
    paddingBottom: SPACING[12],
  },
  sectionDivider: {
    height: 1,
    backgroundColor: COLORS.neutral[100],
    marginBottom: SPACING[12],
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING[16],
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brand[800],
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
    ...Platform.select({
      web: { cursor: 'pointer' as unknown as undefined },
    }),
  },
  previewBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.neutral.white,
  },

  // Document links
  docSection: {
    marginBottom: SPACING[12],
  },
  docSectionHeader: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[400],
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  docActiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...Platform.select({
      web: { cursor: 'pointer' as unknown as undefined },
    }),
  },
  docActiveBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  docPendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.neutral[100],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.neutral[50],
  },
  docPendingName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[400],
  },
  pendingText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: COLORS.neutral[400],
    fontStyle: 'italic',
  },
  pendingWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Footer chevron
  chevronRow: {
    alignItems: 'center',
    paddingBottom: 8,
  },
});
