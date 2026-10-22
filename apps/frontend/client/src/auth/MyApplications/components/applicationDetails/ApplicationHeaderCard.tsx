import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from '@edge/ui';
import { Application, formatRelativeTime } from '../../data/applicationsData';
import { safeGetStatusLabel } from './applicationDetailsTypes';
import { getStatusLabel } from '../../data/applicationsData';
import { styles } from './applicationDetailsStyles';

interface ApplicationHeaderCardProps {
  app: Application;
  isBulk: boolean;
  isDesktop: boolean;
  appApplicantsCount: number;
  statusBg: string;
  statusColor: string;
  resolvedServiceVariant?: string;
  primaryName: string;
  docsCount: number;
}

export function ApplicationHeaderCard({
  app,
  isBulk,
  isDesktop,
  appApplicantsCount,
  statusBg,
  statusColor,
  resolvedServiceVariant,
  primaryName,
  docsCount,
}: ApplicationHeaderCardProps) {
  return (
    <View style={styles.headerCard}>
      <View style={styles.badgeRow}>
        <View style={[styles.modeBadge, isBulk ? styles.bulkBadge : styles.singleBadge]}>
          <View style={[styles.modeDot, { backgroundColor: isBulk ? '#D97706' : '#1D4ED8' }]} />
          <Text style={[styles.modeBadgeText, { color: isBulk ? '#D97706' : '#1D4ED8' }]}>
            {isBulk ? `BULK APPLICATION (${appApplicantsCount})` : 'SINGLE APPLICATION'}
          </Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusBadgeText, { color: statusColor }]}>
            {safeGetStatusLabel(app.status, getStatusLabel)}
          </Text>
        </View>
      </View>

      <Text style={styles.appRefId}>
        {isBulk ? `Bulk Application #${app.referenceNumber}` : `#${app.referenceNumber}`}
      </Text>

      {/* Service Category & Service Variant Badges */}
      <View style={styles.headerBadgeRow}>
        {app.serviceCategory ? (
          <View style={styles.headerCategoryBadge}>
            <Icon name="grid" size={11} color="#0369A1" />
            <Text style={styles.headerCategoryBadgeText}>
              {app.serviceCategory.toUpperCase()}
            </Text>
          </View>
        ) : null}

        {resolvedServiceVariant ? (
          <View style={styles.headerVariantBadge}>
            <Icon name="layers" size={11} color="#4338CA" />
            <Text style={styles.headerVariantBadgeText}>
              {resolvedServiceVariant}
            </Text>
          </View>
        ) : null}

        {docsCount > 0 ? (
          <View style={[styles.headerCategoryBadge, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
            <Icon name="paperclip" size={11} color="#16A34A" />
            <Text style={[styles.headerCategoryBadgeText, { color: '#16A34A' }]}>
              {docsCount} ATTACHED DOCUMENT{docsCount === 1 ? '' : 'S'}
            </Text>
          </View>
        ) : null}
      </View>

      <Text style={[styles.appTitle, { fontSize: isDesktop ? 24 : 20 }]}>{app.serviceName}</Text>
      {isBulk ? (
        <View style={styles.submittedAtRow}>
          <Icon name="calendar" size={14} color="#64748B" />
          <Text style={[styles.appSubtitleCompany, { marginTop: 0, marginBottom: 0 }]}>
            {primaryName} [BULK] Submitted {formatRelativeTime(app.submittedAt)}
          </Text>
        </View>
      ) : (
        <View style={styles.submittedAtRow}>
          <Icon name="calendar" size={14} color="#64748B" />
          <Text style={[styles.appSubtitleCompany, { marginTop: 0, marginBottom: 0 }]}>
            Submitted {formatRelativeTime(app.submittedAt)}
          </Text>
        </View>
      )}
    </View>
  );
}
