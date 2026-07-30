import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Icon as Lucide, SPACING, TYPOGRAPHY, useTheme } from '@edge/ui';

// ─── Types ───────────────────────────────────────────────────────────────────

type AnnStatus = 'Published' | 'Draft' | 'Scheduled';
type AnnType = 'Info' | 'Warning' | 'Critical' | 'Maintenance';

interface Announcement {
  id: string;
  title: string;
  body: string;
  type: AnnType;
  status: AnnStatus;
  audience: string;
  publishedAt: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_ANNOUNCEMENTS: readonly Announcement[] = [
  {
    id: 'ANN-001',
    title: 'Scheduled System Maintenance – July 31, 2026',
    body: 'EDGE Portal will undergo maintenance from 12:00 AM to 4:00 AM on July 31. All evaluation queues will be paused during this window.',
    type: 'Maintenance',
    status: 'Published',
    audience: 'All Users',
    publishedAt: 'Jul 30, 2026 8:00 AM',
  },
  {
    id: 'ANN-002',
    title: 'New License Evaluation SLA Policy Effective August 1',
    body: 'Updated SLA requirements for ISP license evaluations now mandate 10-day turnaround. All evaluators must comply starting August 1, 2026.',
    type: 'Info',
    status: 'Published',
    audience: 'Evaluators',
    publishedAt: 'Jul 29, 2026 2:30 PM',
  },
  {
    id: 'ANN-003',
    title: 'CRITICAL: Unauthorized Access Attempts Detected',
    body: 'Security operations have identified suspicious login attempts from external IP ranges. All staff are advised to change passwords immediately.',
    type: 'Critical',
    status: 'Published',
    audience: 'All Users',
    publishedAt: 'Jul 28, 2026 11:15 AM',
  },
  {
    id: 'ANN-004',
    title: 'Regional Director Quarterly Review – August 15',
    body: 'All regional offices are required to submit Q2 performance reports before the quarterly review session on August 15, 2026.',
    type: 'Warning',
    status: 'Scheduled',
    audience: 'Regional Directors',
    publishedAt: 'Jul 30, 2026 (scheduled)',
  },
  {
    id: 'ANN-005',
    title: 'EDGE Mobile App v2.1.0 Release Notes',
    body: 'Version 2.1.0 introduces offline queue review, biometric login, and improved notification reliability on Android 14.',
    type: 'Info',
    status: 'Draft',
    audience: 'All Users',
    publishedAt: '—',
  },
];

const TYPE_STYLE: Record<AnnType, { text: string; bg: string; icon: 'info' | 'alert-triangle' | 'alert-circle' | 'tool' }> = {
  Info:        { text: '#1E40AF', bg: '#DBEAFE', icon: 'info' },
  Warning:     { text: '#92400E', bg: '#FEF3C7', icon: 'alert-triangle' },
  Critical:    { text: '#991B1B', bg: '#FEE2E2', icon: 'alert-circle' },
  Maintenance: { text: '#5B21B6', bg: '#EDE9FE', icon: 'tool' },
};

const STATUS_STYLE: Record<AnnStatus, { text: string; bg: string }> = {
  Published: { text: '#065F46', bg: '#D1FAE5' },
  Draft:     { text: '#374151', bg: '#F3F4F6' },
  Scheduled: { text: '#92400E', bg: '#FEF3C7' },
};

// ─── Component ───────────────────────────────────────────────────────────────

export function AnnouncementsScreen() {
  const { colors, isDark } = useTheme();
  const [activeFilter, setActiveFilter] = useState<AnnStatus | 'All'>('All');

  const canvasBg = isDark ? colors.neutral[900] : colors.neutral[50];
  const cardBg = isDark ? colors.neutral[800] : '#FFFFFF';
  const borderColor = isDark ? colors.neutral[700] : colors.neutral[200];
  const textColor = isDark ? colors.neutral[100] : colors.neutral[900];
  const mutedColor = isDark ? colors.neutral[400] : colors.neutral[500];

  const filtered = MOCK_ANNOUNCEMENTS.filter(
    (a) => activeFilter === 'All' || a.status === activeFilter,
  );

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: canvasBg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Page Title ─────────────────────────────────────────────────── */}
      <View style={styles.titleRow}>
        <View>
          <Text style={[styles.pageTitle, { color: textColor }]}>Announcements</Text>
          <Text style={[styles.pageSub, { color: mutedColor }]}>
            Publish system banners and operational updates to all regional portals
          </Text>
        </View>
        <Pressable style={[styles.newBtn, { backgroundColor: isDark ? colors.brand[800] : colors.brand[700] }]}>
          <Lucide name="plus" size={13} color="#FFFFFF" />
          <Text style={styles.newBtnText}>New Announcement</Text>
        </Pressable>
      </View>

      {/* ── Status Filter Pills ─────────────────────────────────────────── */}
      <View style={styles.filterRow}>
        {(['All', 'Published', 'Scheduled', 'Draft'] as const).map((f) => (
          <Pressable
            key={f}
            onPress={() => setActiveFilter(f)}
            style={[
              styles.filterPill,
              {
                backgroundColor:
                  activeFilter === f
                    ? (isDark ? colors.brand[800] : colors.brand[700])
                    : (isDark ? colors.neutral[700] : colors.neutral[100]),
              },
            ]}
          >
            <Text
              style={[
                styles.filterPillText,
                { color: activeFilter === f ? '#FFFFFF' : mutedColor },
              ]}
            >
              {f}{' '}
              <Text style={{ opacity: 0.7 }}>
                ({f === 'All'
                  ? MOCK_ANNOUNCEMENTS.length
                  : MOCK_ANNOUNCEMENTS.filter((a) => a.status === f).length})
              </Text>
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ── Announcement Cards ─────────────────────────────────────────── */}
      <View style={styles.cardList}>
        {filtered.map((ann) => {
          const typeSt = TYPE_STYLE[ann.type];
          const statusSt = STATUS_STYLE[ann.status];
          return (
            <View
              key={ann.id}
              style={[
                styles.annCard,
                { backgroundColor: cardBg, borderColor, borderLeftColor: typeSt.bg },
              ]}
            >
              {/* Card header */}
              <View style={styles.annCardHeader}>
                <View style={styles.annTitleRow}>
                  <View style={[styles.typeBadge, { backgroundColor: typeSt.bg }]}>
                    <Lucide name={typeSt.icon} size={11} color={typeSt.text} />
                    <Text style={[styles.typeBadgeText, { color: typeSt.text }]}>
                      {ann.type}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusSt.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: statusSt.text }]}>
                      {ann.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.annActions}>
                  <Pressable style={styles.iconActionBtn}>
                    <Lucide name="edit-2" size={13} color={mutedColor} />
                  </Pressable>
                  <Pressable style={styles.iconActionBtn}>
                    <Lucide name="trash-2" size={13} color={isDark ? '#F87171' : '#EF4444'} />
                  </Pressable>
                </View>
              </View>

              <Text style={[styles.annTitle, { color: textColor }]}>{ann.title}</Text>
              <Text style={[styles.annBody, { color: mutedColor }]} numberOfLines={2}>
                {ann.body}
              </Text>

              {/* Card footer */}
              <View style={[styles.annCardFooter, { borderTopColor: borderColor }]}>
                <View style={styles.footerMeta}>
                  <Lucide name="users" size={11} color={mutedColor} />
                  <Text style={[styles.footerText, { color: mutedColor }]}>{ann.audience}</Text>
                </View>
                <View style={styles.footerMeta}>
                  <Lucide name="clock" size={11} color={mutedColor} />
                  <Text style={[styles.footerText, { color: mutedColor }]}>{ann.publishedAt}</Text>
                </View>
                <Text style={[styles.footerId, { color: isDark ? colors.neutral[600] : colors.neutral[300] }]}>
                  {ann.id}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    padding: SPACING[24],
    gap: SPACING[16],
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: SPACING[12],
    flexWrap: 'wrap',
  },
  pageTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.pageTitle,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  pageSub: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.caption,
    marginTop: 2,
  },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  newBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#FFFFFF',
  },
  filterRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  filterPillText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  cardList: { gap: SPACING[10] },
  annCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderLeftWidth: 3,
    padding: SPACING[16],
    gap: SPACING[8],
  },
  annCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  annTitleRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  annActions: { flexDirection: 'row', gap: 4 },
  iconActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  annTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.sectionTitle,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  annBody: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    lineHeight: 18,
  },
  annCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[12],
    paddingTop: SPACING[8],
    borderTopWidth: 1,
    marginTop: SPACING[4],
  },
  footerMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11 },
  footerId: { marginLeft: 'auto', fontFamily: TYPOGRAPHY.fonts.mono, fontSize: 10 },
});
