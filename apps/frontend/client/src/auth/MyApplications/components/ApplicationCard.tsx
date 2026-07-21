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
  getAppDocuments,
} from '../data/applicationsData';

interface ApplicationCardProps {
  app: Application;
  onPress: () => void;
  onDownload?: () => void;
  style?: object;
}

export function ApplicationCard({
  app,
  onPress,
  onDownload,
  style,
}: ApplicationCardProps) {
  const isBulk = app.mode === 'BULK';
  const primaryName = isBulk ? app.companyName : app.applicantName;
  const statusColor = getStatusColor(app.status);
  const statusBg = getStatusBgColor(app.status);
  const docs = getAppDocuments(app);
  const totalApplicants = isBulk ? app.applicants.length : 1;

  return (
    <View style={[styles.card, style]}>
      {/* ── Card Header Bar ────────────────────────────────────────────── */}
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
                { backgroundColor: isBulk ? '#D97706' : '#2F56E8' },
              ]}
            />
            <Text
              style={[
                styles.modeBadgeText,
                { color: isBulk ? '#D97706' : '#2F56E8' },
              ]}
            >
              {isBulk ? `BULK (${totalApplicants})` : 'SINGLE'}
            </Text>
          </View>

          <Text style={styles.refNumber}>#{app.referenceNumber}</Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusBadgeText, { color: statusColor }]}>
            {getStatusLabel(app.status)}
          </Text>
        </View>
      </View>

      {/* ── Main Content Body ──────────────────────────────────────────────── */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={styles.cardBody}
      >
        <Text style={styles.serviceName} numberOfLines={2}>
          {app.serviceName}
        </Text>

        <View style={styles.detailsMetaRow}>
          <View style={styles.metaItem}>
            <Icon name="user" size={13} color="#64748B" />
            <Text style={styles.primaryName} numberOfLines={1}>
              {primaryName}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Icon name="tag" size={13} color="#64748B" />
            <Text style={styles.metaText}>{app.element}</Text>
          </View>

          <View style={styles.metaItem}>
            <Icon name="clock" size={13} color="#64748B" />
            <Text style={styles.metaText}>{formatRelativeTime(app.submittedAt)}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* ── Card Footer Actions Bar ───────────────────────────────────────── */}
      <View style={styles.cardFooter}>
        <View style={styles.docsSummary}>
          <Icon name="file-text" size={14} color="#475569" />
          <Text style={styles.docsSummaryText}>
            {docs.length} Document{docs.length === 1 ? '' : 's'} available
          </Text>
        </View>

        <View style={styles.actionsGroup}>
          {onDownload !== undefined && (
            <TouchableOpacity
              onPress={onDownload}
              style={styles.downloadBtn}
              activeOpacity={0.8}
            >
              <Icon name="download" size={13} color={COLORS.brand[700]} />
              <Text style={styles.downloadBtnText}>Download</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={onPress}
            style={styles.viewDetailsBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.viewDetailsBtnText}>Details</Text>
            <Icon name="chevron-right" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
      },
    }),
  },

  cardTopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[16],
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  leftBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    flex: 1,
  },

  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
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
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  refNumber: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#334155',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  cardBody: {
    padding: SPACING[16],
    flex: 1,
    ...Platform.select({
      web: { cursor: 'pointer' as unknown as undefined },
    }),
  },

  serviceName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#0F172A',
    marginBottom: 12,
    lineHeight: 20,
  },

  detailsMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  primaryName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#334155',
    maxWidth: 160,
  },
  metaText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#64748B',
  },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[16],
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },

  docsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  docsSummaryText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: '#475569',
    fontWeight: TYPOGRAPHY.weights.medium,
  },

  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 4,
  },
  downloadBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.brand[700],
  },

  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: COLORS.brand[700],
    gap: 4,
  },
  viewDetailsBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#FFFFFF',
  },
});
