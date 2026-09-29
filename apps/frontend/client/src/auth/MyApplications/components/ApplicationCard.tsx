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
  getStatusLabel,
  getStatusColor,
  getStatusBgColor,
  formatRelativeTime,
} from '../data/applicationsData';
import {
  FIELD_ID_TYPE_OF_CERT,
  FIELD_ID_PERMIT_TYPE,
  FIELD_ID_APP_TYPE,
} from '../../../shared/constants/fieldIds';

interface ApplicationCardProps {
  app: Application;
  onPress: () => void;
  style?: object;
}

export function ApplicationCard({
  app,
  onPress,
  style,
}: ApplicationCardProps) {
  const isBulk = app.mode === 'BULK';
  const primaryName = isBulk ? app.companyName : app.applicantName;
  const statusColor = getStatusColor(app.status);
  const statusBg = getStatusBgColor(app.status);
  const totalApplicants = isBulk ? app.applicants.length : 1;

  const resolvedVariant =
    app.serviceVariantName ||
    app.variant ||
    (app.formFieldValues?.find(
      (fv) =>
        fv.fieldId === FIELD_ID_TYPE_OF_CERT ||
        fv.fieldId === FIELD_ID_PERMIT_TYPE ||
        fv.fieldId === FIELD_ID_APP_TYPE ||
        (fv.fieldId !== undefined && fv.fieldId.toLowerCase().includes('variant')) ||
        (fv.fieldLabel !== undefined && (
          fv.fieldLabel.toLowerCase().includes('permit / license type') ||
          fv.fieldLabel.toLowerCase().includes('type of certificate') ||
          fv.fieldLabel.toLowerCase().includes('application variant') ||
          fv.fieldLabel.toLowerCase().includes('application type')
        ))
    )?.value) ||
    (!isBulk && Array.isArray(app.applicants) && app.applicants.length > 0 && app.applicants[0].applicationType && app.applicants[0].applicationType !== 'Individual' ? app.applicants[0].applicationType : undefined) ||
    (app.element !== 'New' ? app.element : '');

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={[styles.card, style]}
    >
      {/* ── Card Top Header ────────────────────── */}
      <View style={styles.cardTopHeader}>
        <View style={styles.leftBadges}>
          <View
            style={[
              styles.modeBadge,
              isBulk ? styles.bulkBadge : styles.singleBadge,
            ]}
          >
            <View
              style={[
                styles.modeDot,
                { backgroundColor: isBulk ? '#D97706' : '#1D4ED8' },
              ]}
            />
            <Text
              style={[
                styles.modeBadgeText,
                { color: isBulk ? '#D97706' : '#1D4ED8' },
              ]}
            >
              {isBulk ? `BULK (${totalApplicants})` : 'SINGLE'}
            </Text>
          </View>

          <Text style={styles.refNumber}>#{app.referenceNumber}</Text>
        </View>

        <View style={styles.rightHeaderGroup}>
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>
              {getStatusLabel(app.status)}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Main Content Body ──────────────────── */}
      <View style={styles.cardBody}>
        {/* Service Category & Service Variant Badges */}
        <View style={styles.serviceMetaRow}>
          {app.serviceCategory ? (
            <View style={styles.categoryBadge}>
              <Icon name="grid" size={11} color="#0369A1" />
              <Text style={styles.categoryBadgeText}>
                {app.serviceCategory.toUpperCase()}
              </Text>
            </View>
          ) : null}

          {resolvedVariant ? (
            <View style={styles.variantBadge}>
              <Icon name="layers" size={11} color="#4338CA" />
              <Text style={styles.variantBadgeText} numberOfLines={1}>
                {resolvedVariant}
              </Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.serviceName} numberOfLines={2}>
          {app.serviceName}
        </Text>

        <View style={styles.detailsMetaRow}>
          <View style={styles.metaItem}>
            <Icon name="user" size={14} color="#64748B" />
            <Text style={styles.primaryName} numberOfLines={1}>
              {primaryName}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Icon name="clock" size={14} color="#64748B" />
            <Text style={styles.metaText}>{formatRelativeTime(app.submittedAt)}</Text>
          </View>
        </View>
      </View>

      {/* ── Card Footer Actions Bar ── */}
      <View style={styles.cardFooter}>
        <View style={styles.footerInfo}>
          <Icon name="map-pin" size={13} color="#64748B" />
          <Text style={styles.footerInfoText} numberOfLines={1}>
            {app.office || 'NTC Central Office'}
          </Text>
        </View>

        <View style={styles.viewDetailsBtn}>
          <Text style={styles.viewDetailsBtnText}>View Details</Text>
          <Icon name="chevron-right" size={14} color="#FFFFFF" />
        </View>
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 6,
    borderLeftColor: '#1D4ED8',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: 190,
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 16px -2px rgba(15, 23, 42, 0.06), 0 2px 4px -1px rgba(15, 23, 42, 0.04)',
        cursor: 'pointer',
      },
    }),
  },

  cardTopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[20],
    paddingVertical: 14,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  leftBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    flex: 1,
  },

  rightHeaderGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  singleBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  bulkBadge: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  modeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  modeBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  refNumber: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#334155',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  cardBody: {
    padding: SPACING[20],
    flex: 1,
    justifyContent: 'center',
  },

  serviceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  categoryBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10.5,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0369A1',
    letterSpacing: 0.5,
  },
  variantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    maxWidth: 280,
  },
  variantBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#4338CA',
  },

  serviceName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 17,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
    marginBottom: 14,
    lineHeight: 24,
  },

  detailsMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  primaryName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#334155',
    maxWidth: 200,
  },
  metaText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: '#64748B',
  },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[20],
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
  },

  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  footerInfoText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#64748B',
    fontWeight: TYPOGRAPHY.weights.medium,
  },

  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.brand[700],
    gap: 6,
  },
  viewDetailsBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#FFFFFF',
  },
});
