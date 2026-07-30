import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Icon as Lucide, SPACING, TYPOGRAPHY, useTheme, SkeletonLoader } from '@edge/ui';
import { useAdminAnnouncements, announcementService, SystemAnnouncementDto } from '@edge/api';

type AnnType = 'Info' | 'Warning' | 'Critical' | 'Maintenance' | 'Emergency';

const TYPE_STYLE: Record<string, { text: string; bg: string; icon: 'info' | 'alert-triangle' | 'alert-circle' | 'tool' }> = {
  Info:        { text: '#1E40AF', bg: '#DBEAFE', icon: 'info' },
  Warning:     { text: '#92400E', bg: '#FEF3C7', icon: 'alert-triangle' },
  Critical:    { text: '#991B1B', bg: '#FEE2E2', icon: 'alert-circle' },
  Emergency:   { text: '#991B1B', bg: '#FEE2E2', icon: 'alert-circle' },
  Maintenance: { text: '#5B21B6', bg: '#EDE9FE', icon: 'tool' },
};

export function AnnouncementsScreen() {
  const { colors, isDark } = useTheme();
  const { announcements, isLoading, isError, refetch } = useAdminAnnouncements();

  const [activeFilter, setActiveFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [annToDelete, setAnnToDelete] = useState<SystemAnnouncementDto | null>(null);

  // New Announcement Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<AnnType>('Info');
  const [targetAudience, setTargetAudience] = useState('All Users');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const canvasBg = isDark ? colors.neutral[900] : colors.neutral[50];
  const cardBg = isDark ? colors.neutral[800] : '#FFFFFF';
  const borderColor = isDark ? colors.neutral[700] : colors.neutral[200];
  const textColor = isDark ? colors.neutral[100] : colors.neutral[900];
  const mutedColor = isDark ? colors.neutral[400] : colors.neutral[500];
  const inputBg = isDark ? colors.neutral[900] : colors.neutral[50];

  const filtered = announcements.filter((a) => {
    if (activeFilter === 'Active') return a.isActive;
    if (activeFilter === 'Inactive') return !a.isActive;
    return true;
  });

  const handleCreateAnnouncement = async () => {
    if (!title.trim() || !message.trim()) {
      setFormError('Please enter both title and message.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const res = await announcementService.createAnnouncement({
      title: title.trim(),
      message: message.trim(),
      type,
      targetAudience,
      isActive,
    });

    setIsSubmitting(false);

    if (res) {
      setIsAddModalOpen(false);
      setTitle('');
      setMessage('');
      setType('Info');
      setTargetAudience('All Users');
      setIsActive(true);
      await refetch();
    } else {
      setFormError('Failed to create announcement. Please try again.');
    }
  };

  const handleDeleteAnnouncement = async () => {
    if (!annToDelete) return;
    const ok = await announcementService.deleteAnnouncement(annToDelete.id);
    if (ok) {
      setAnnToDelete(null);
      await refetch();
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

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
            Publish system banners and operational updates across the platform
          </Text>
        </View>
        <Pressable
          style={[styles.newBtn, { backgroundColor: isDark ? colors.brand[800] : colors.brand[700] }]}
          onPress={() => setIsAddModalOpen(true)}
        >
          <Lucide name="plus" size={13} color="#FFFFFF" />
          <Text style={styles.newBtnText}>New Announcement</Text>
        </Pressable>
      </View>

      {/* ── Status Filter Pills ─────────────────────────────────────────── */}
      <View style={styles.filterRow}>
        {(['All', 'Active', 'Inactive'] as const).map((f) => (
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
                  ? announcements.length
                  : announcements.filter((a) => (f === 'Active' ? a.isActive : !a.isActive)).length})
              </Text>
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ── Loading Skeleton ───────────────────────────────────────────── */}
      {isLoading && (
        <View style={{ gap: SPACING[12] }}>
          <SkeletonLoader height={100} borderRadius={12} />
          <SkeletonLoader height={100} borderRadius={12} />
        </View>
      )}

      {/* ── Announcement Cards ─────────────────────────────────────────── */}
      {!isLoading && (
        <View style={styles.cardList}>
          {filtered.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: cardBg, borderColor }]}>
              <Lucide name="volume-x" size={32} color={mutedColor} />
              <Text style={[styles.emptyTitle, { color: textColor }]}>No Announcements Found</Text>
              <Text style={[styles.emptySub, { color: mutedColor }]}>
                No announcements match your current filter.
              </Text>
            </View>
          ) : (
            filtered.map((ann) => {
              const typeSt = TYPE_STYLE[ann.type] || TYPE_STYLE['Info'];
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
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: ann.isActive ? '#D1FAE5' : '#F3F4F6' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            { color: ann.isActive ? '#065F46' : '#374151' },
                          ]}
                        >
                          {ann.isActive ? 'Active' : 'Inactive'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.annActions}>
                      <Pressable
                        style={styles.iconActionBtn}
                        onPress={() => setAnnToDelete(ann)}
                      >
                        <Lucide name="trash-2" size={13} color={isDark ? '#F87171' : '#EF4444'} />
                      </Pressable>
                    </View>
                  </View>

                  <Text style={[styles.annTitle, { color: textColor }]}>{ann.title}</Text>
                  <Text style={[styles.annBody, { color: mutedColor }]}>
                    {ann.message}
                  </Text>

                  {/* Card footer */}
                  <View style={[styles.annCardFooter, { borderTopColor: borderColor }]}>
                    <View style={styles.footerMeta}>
                      <Lucide name="users" size={11} color={mutedColor} />
                      <Text style={[styles.footerText, { color: mutedColor }]}>
                        {ann.targetAudience}
                      </Text>
                    </View>
                    <View style={styles.footerMeta}>
                      <Lucide name="clock" size={11} color={mutedColor} />
                      <Text style={[styles.footerText, { color: mutedColor }]}>
                        {formatDate(ann.createdAt)}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.footerId,
                        { color: isDark ? colors.neutral[600] : colors.neutral[300] },
                      ]}
                    >
                      {ann.id}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      )}

      {/* ── Create Announcement Modal ───────────────────────────────────── */}
      {isAddModalOpen && (
        <Modal transparent animationType="fade" visible={isAddModalOpen} onRequestClose={() => setIsAddModalOpen(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: cardBg, borderColor }]}>
              <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
                <Text style={[styles.modalTitle, { color: textColor }]}>New System Announcement</Text>
                <Pressable onPress={() => setIsAddModalOpen(false)}>
                  <Lucide name="x" size={18} color={textColor} />
                </Pressable>
              </View>

              <ScrollView style={{ padding: SPACING[20] }} showsVerticalScrollIndicator={false}>
                {formError && (
                  <View style={styles.errorBox}>
                    <Lucide name="alert-triangle" size={14} color="#991B1B" />
                    <Text style={styles.errorText}>{formError}</Text>
                  </View>
                )}

                <Text style={[styles.inputLabel, { color: textColor }]}>Title</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: inputBg, borderColor, color: textColor }]}
                  placeholder="e.g. Scheduled System Maintenance"
                  placeholderTextColor={mutedColor}
                  value={title}
                  onChangeText={setTitle}
                />

                <Text style={[styles.inputLabel, { color: textColor, marginTop: SPACING[12] }]}>Message Payload</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea, { backgroundColor: inputBg, borderColor, color: textColor }]}
                  placeholder="Detailed announcement description..."
                  placeholderTextColor={mutedColor}
                  multiline
                  numberOfLines={4}
                  value={message}
                  onChangeText={setMessage}
                />

                <Text style={[styles.inputLabel, { color: textColor, marginTop: SPACING[12] }]}>Announcement Type</Text>
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  {(['Info', 'Warning', 'Maintenance', 'Emergency'] as const).map((t) => (
                    <Pressable
                      key={t}
                      onPress={() => setType(t)}
                      style={[
                        styles.typeOption,
                        {
                          backgroundColor: type === t ? (isDark ? colors.brand[800] : colors.brand[700]) : inputBg,
                          borderColor: type === t ? 'transparent' : borderColor,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '600', color: type === t ? '#FFFFFF' : textColor }}>{t}</Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={[styles.inputLabel, { color: textColor, marginTop: SPACING[12] }]}>Target Audience</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: inputBg, borderColor, color: textColor }]}
                  placeholder="e.g. All Users, Internal Staff, Applicants"
                  placeholderTextColor={mutedColor}
                  value={targetAudience}
                  onChangeText={setTargetAudience}
                />

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACING[16] }}>
                  <Text style={[styles.inputLabel, { color: textColor, marginBottom: 0 }]}>Publish Immediately (Active)</Text>
                  <Switch value={isActive} onValueChange={setIsActive} />
                </View>
              </ScrollView>

              <View style={[styles.modalFooter, { borderTopColor: borderColor }]}>
                <Pressable style={[styles.cancelBtn, { borderColor }]} onPress={() => setIsAddModalOpen(false)}>
                  <Text style={[styles.cancelBtnText, { color: textColor }]}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.submitBtn, { backgroundColor: isDark ? colors.brand[800] : colors.brand[700] }]}
                  onPress={handleCreateAnnouncement}
                  disabled={isSubmitting}
                >
                  <Text style={styles.submitBtnText}>{isSubmitting ? 'Publishing...' : 'Publish Announcement'}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* ── Delete Confirmation Modal ──────────────────────────────────── */}
      {annToDelete && (
        <Modal transparent animationType="fade" visible={!!annToDelete} onRequestClose={() => setAnnToDelete(null)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxWidth: 440, backgroundColor: cardBg, borderColor }]}>
              <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
                <Text style={[styles.modalTitle, { color: textColor }]}>Delete Announcement</Text>
                <Pressable onPress={() => setAnnToDelete(null)}>
                  <Lucide name="x" size={18} color={textColor} />
                </Pressable>
              </View>
              <View style={{ padding: SPACING[20], gap: 12 }}>
                <Text style={{ fontSize: 14, color: textColor }}>
                  Are you sure you want to delete <Text style={{ fontWeight: '700' }}>"{annToDelete.title}"</Text>?
                </Text>
                <Text style={{ fontSize: 12, color: mutedColor }}>
                  This action cannot be undone and will remove the announcement banner for all users.
                </Text>
              </View>
              <View style={[styles.modalFooter, { borderTopColor: borderColor }]}>
                <Pressable style={[styles.cancelBtn, { borderColor }]} onPress={() => setAnnToDelete(null)}>
                  <Text style={[styles.cancelBtnText, { color: textColor }]}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.submitBtn, { backgroundColor: isDark ? '#B91C1C' : '#EF4444' }]}
                  onPress={handleDeleteAnnouncement}
                >
                  <Text style={styles.submitBtnText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
    gap: 6,
    paddingHorizontal: SPACING[16],
    paddingVertical: 10,
    borderRadius: 8,
  },
  newBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    gap: SPACING[8],
  },
  filterPill: {
    paddingHorizontal: SPACING[12],
    paddingVertical: 6,
    borderRadius: 6,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardList: {
    gap: SPACING[12],
  },
  annCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: SPACING[16],
    gap: SPACING[8],
  },
  annCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  annTitleRow: {
    flexDirection: 'row',
    gap: SPACING[8],
    alignItems: 'center',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  annActions: {
    flexDirection: 'row',
    gap: SPACING[4],
  },
  iconActionBtn: {
    padding: 6,
    borderRadius: 6,
  },
  annTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  annBody: {
    fontSize: 13,
    lineHeight: 18,
  },
  annCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING[16],
    paddingTop: SPACING[12],
    marginTop: SPACING[4],
    borderTopWidth: 1,
  },
  footerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 11,
  },
  footerId: {
    marginLeft: 'auto',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  emptyState: {
    padding: SPACING[40],
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptySub: {
    fontSize: 13,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[16],
  },
  modalContent: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '90%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[20],
    paddingVertical: SPACING[16],
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  textInput: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: SPACING[12],
    paddingVertical: 8,
    fontSize: 13,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    padding: SPACING[10],
    borderRadius: 8,
    marginBottom: SPACING[12],
  },
  errorText: {
    fontSize: 12,
    color: '#991B1B',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING[8],
    paddingHorizontal: SPACING[20],
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  cancelBtn: {
    paddingHorizontal: SPACING[16],
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  submitBtn: {
    paddingHorizontal: SPACING[16],
    paddingVertical: 8,
    borderRadius: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
