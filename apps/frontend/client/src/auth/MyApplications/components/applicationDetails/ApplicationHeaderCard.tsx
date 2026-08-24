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
  activeTab: 'DETAILS' | 'DOCUMENTS';
  setActiveTab: (tab: 'DETAILS' | 'DOCUMENTS') => void;
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
  activeTab,
  setActiveTab,
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

      {/* Navigation Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('DETAILS')}
          style={[styles.tabItem, activeTab === 'DETAILS' && styles.tabItemActive]}
          activeOpacity={0.8}
        >
          <Icon
            name="user"
            size={16}
            color={activeTab === 'DETAILS' ? '#1D4ED8' : '#64748B'}
          />
          <Text style={[styles.tabText, activeTab === 'DETAILS' && styles.tabTextActive]}>
            Applicant Details
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('DOCUMENTS')}
          style={[styles.tabItem, activeTab === 'DOCUMENTS' && styles.tabItemActive]}
          activeOpacity={0.8}
        >
          <Icon
            name="file-text"
            size={16}
            color={activeTab === 'DOCUMENTS' ? '#1D4ED8' : '#64748B'}
          />
          <Text style={[styles.tabText, activeTab === 'DOCUMENTS' && styles.tabTextActive]}>
            Documents ({docsCount})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
