import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Icon } from '@edge/ui';
import { COLORS, SPACING, TYPOGRAPHY } from '@edge/ui';
import {
  SingleApplication,
  getStatusLabel,
  getStatusColor,
  getStatusBgColor,
  formatRelativeTime,
} from '../data/applicationsData';

interface SinglePreviewProps {
  app: SingleApplication;
  onBack: () => void;
}

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
}

function SectionCard({ title, children }: SectionCardProps) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionDivider} />
      {children}
    </View>
  );
}

export function SinglePreview({ app, onBack }: SinglePreviewProps) {
  const statusColor = getStatusColor(app.status);
  const statusBg    = getStatusBgColor(app.status);

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Back link */}
      <TouchableOpacity onPress={onBack} style={styles.backLink} activeOpacity={0.7}>
        <Icon name="arrow-left" size={14} color={COLORS.brand[700]} />
        <Text style={styles.backLinkText}>BACK TO MY APPLICATIONS</Text>
      </TouchableOpacity>

      {/* Header card */}
      <View style={styles.headerCard}>
        {/* Reference number + status badge */}
        <View style={styles.headerTopRow}>
          <Text style={styles.refNumber}>
            Application #{app.referenceNumber}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>
              {getStatusLabel(app.status).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Service name */}
        <Text style={styles.headerServiceName}>{app.serviceName}</Text>

        {/* Meta row: category | SINGLE badge | submission time */}
        <View style={styles.headerMeta}>
          <Text style={styles.headerCategory}>{app.serviceCategory}</Text>

          <View style={styles.singleBadge}>
            <View style={styles.singleDot} />
            <Text style={styles.singleBadgeText}>SINGLE</Text>
          </View>

          <Text style={styles.headerTime}>
            Submitted {formatRelativeTime(app.submittedAt)}
          </Text>
        </View>
      </View>

      {/* Application Details */}
      <SectionCard title="Application Details">
        <InfoRow label="Service"  value={app.serviceName} />
        <InfoRow label="Category" value={app.serviceCategory} />
        <InfoRow label="Element"  value={app.element} />
      </SectionCard>

      {/* Basic Information */}
      <SectionCard title="Basic Information">
        <InfoRow label="Full Name"    value={app.applicantName} />
        <InfoRow label="Sex"          value={app.sex} />
        <InfoRow label="Nationality"  value={app.nationality} />
      </SectionCard>

      {/* Address */}
      <SectionCard title="Address">
        <InfoRow label="Street Address"   value={app.streetAddress} />
        <InfoRow label="City/Municipality" value={app.cityMunicipality} />
        <InfoRow label="Province"          value={app.province} />
        <InfoRow label="Region"            value={app.region} />
      </SectionCard>

      {/* Contact Details */}
      <SectionCard title="Contact Details">
        <InfoRow label="Mobile Number" value={app.mobileNumber} />
        <InfoRow label="Email Address" value={app.email} />
      </SectionCard>

      {/* Examinee Type */}
      <SectionCard title="Examinee Type">
        <InfoRow label="Type" value={app.examineeType} />
      </SectionCard>

      {/* Region */}
      <SectionCard title="Region">
        <InfoRow label="Region" value={app.region} />
      </SectionCard>

      {/* Schedule */}
      <SectionCard title="Schedule">
        <InfoRow label="Date"  value={app.schedule.date} />
        <InfoRow label="Time"  value={app.schedule.time} />
        <InfoRow label="Venue" value={app.schedule.venue} />
      </SectionCard>
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollContent: {
    padding: SPACING[24],
    paddingBottom: 40,
  },

  // Back link
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING[20],
    ...Platform.select({ web: { cursor: 'pointer' as unknown as undefined } }),
  },
  backLinkText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[700],
    letterSpacing: 0.5,
  },

  // Header card
  headerCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[24],
    marginBottom: SPACING[16],
    ...Platform.select({
      web: { boxShadow: '0 1px 4px rgba(0,0,0,0.06)' as unknown as undefined },
    }),
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 10,
  },
  refNumber: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[900],
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
  },
  headerServiceName: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: COLORS.neutral[600],
    marginBottom: 12,
    lineHeight: 20,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  headerCategory: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[500],
  },
  singleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 5,
  },
  singleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2F56E8',
  },
  singleBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#2F56E8',
  },
  headerTime: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[400],
  },

  // Section card
  sectionCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[20],
    marginBottom: SPACING[12],
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.neutral[500],
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: SPACING[12],
  },
  sectionDivider: {
    height: 1,
    backgroundColor: COLORS.neutral[100],
    marginBottom: SPACING[12],
  },

  // Info row
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    alignItems: 'flex-start',
  },
  infoLabel: {
    width: 160,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[400],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  infoValue: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: COLORS.neutral[800],
    fontWeight: TYPOGRAPHY.weights.medium,
    lineHeight: 18,
  },
});
