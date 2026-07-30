import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY, Icon as Lucide, SkeletonLoader } from '@edge/ui';
import { useAdminAnnouncements, SystemAnnouncementDto } from '@edge/api';

interface AnnouncementsTabProps {
  onAddAnnouncement: () => void;
  onDeleteAnnouncement: (id: string, title: string) => void;
}

export function AnnouncementsTab({ onAddAnnouncement, onDeleteAnnouncement }: AnnouncementsTabProps) {
  const { announcements, isLoading, isError, refetch } = useAdminAnnouncements();

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>System Announcements & Operational Alerts</Text>
          <Text style={styles.subtitle}>
            Broadcast system maintenance schedules, regional notices, and portal banners.
          </Text>
        </View>

        <Pressable style={styles.addButton} onPress={onAddAnnouncement}>
          <Lucide name="plus" size={16} color={COLORS.neutral.white} />
          <Text style={styles.addButtonText}>New Announcement</Text>
        </Pressable>
      </View>

      {/* Loading & Error States */}
      {isLoading && (
        <View style={styles.listGrid}>
          <SkeletonLoader height={100} borderRadius={RADIUS.card} />
          <SkeletonLoader height={100} borderRadius={RADIUS.card} />
        </View>
      )}

      {isError && !isLoading && (
        <View style={styles.centeredState}>
          <Lucide name="alert-circle" size={32} color={COLORS.brand[600]} />
          <Text style={styles.stateText}>Failed to load announcements.</Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {/* Announcements List */}
      {!isLoading && !isError && (
        <View style={styles.listGrid}>
          {announcements.length === 0 ? (
            <View style={styles.emptyCard}>
              <Lucide name="bell-off" size={36} color={COLORS.neutral[300]} />
              <Text style={styles.emptyTitle}>No active announcements</Text>
              <Text style={styles.emptyDesc}>
                Create an operational announcement to display alerts to clients or internal staff.
              </Text>
            </View>
          ) : (
            announcements.map((item) => {
              const getTypeColor = (type: string) => {
                switch (type) {
                  case 'Warning':
                    return { bg: COLORS.semantic.warningBg, text: COLORS.semantic.warningText, border: COLORS.semantic.warningBorder };
                  case 'Maintenance':
                    return { bg: COLORS.semantic.errorBg, text: COLORS.semantic.errorText, border: COLORS.semantic.errorBorder };
                  default:
                    return { bg: COLORS.brand.light, text: COLORS.brand[700], border: COLORS.brand[500] };
                }
              };

              const badgeTheme = getTypeColor(item.type);

              return (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.badgeRow}>
                      <View
                        style={[
                          styles.typeBadge,
                          { backgroundColor: badgeTheme.bg, borderColor: badgeTheme.border },
                        ]}
                      >
                        <Text style={[styles.typeBadgeText, { color: badgeTheme.text }]}>
                          {item.type}
                        </Text>
                      </View>
                      <View style={styles.statusBadge}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>Active</Text>
                      </View>
                    </View>

                    <Pressable
                      style={styles.deleteIcon}
                      onPress={() => onDeleteAnnouncement(item.id, item.title)}
                    >
                      <Lucide name="trash-2" size={16} color={COLORS.neutral[400]} />
                    </Pressable>
                  </View>

                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardMessage}>{item.message}</Text>

                  <View style={styles.cardFooter}>
                    <Lucide name="users" size={14} color={COLORS.neutral[400]} />
                    <Text style={styles.footerText}>Target: {item.targetAudience}</Text>
                    <Text style={styles.footerDot}>·</Text>
                    <Text style={styles.footerText}>
                      Created {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING[16],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING[12],
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fonts.primary,
    color: COLORS.neutral[900],
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.neutral[500],
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.brand[600],
    borderRadius: RADIUS.button,
    ...SHADOWS.card,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neutral.white,
  },
  listGrid: {
    gap: SPACING[12],
  },
  card: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[16],
    gap: 10,
    ...SHADOWS.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.semantic.success,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.neutral[600],
  },
  deleteIcon: {
    padding: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  cardMessage: {
    fontSize: 14,
    color: COLORS.neutral[600],
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.neutral[500],
  },
  footerDot: {
    color: COLORS.neutral[400],
  },
  centeredState: {
    padding: SPACING[32],
    alignItems: 'center',
    gap: 12,
  },
  stateText: {
    fontSize: 14,
    color: COLORS.neutral[600],
  },
  retryButton: {
    paddingHorizontal: SPACING[16],
    paddingVertical: 8,
    backgroundColor: COLORS.brand[600],
    borderRadius: RADIUS.button,
  },
  retryText: {
    color: COLORS.neutral.white,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    padding: SPACING[32],
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.neutral[800],
  },
  emptyDesc: {
    fontSize: 13,
    color: COLORS.neutral[500],
    textAlign: 'center',
  },
});
