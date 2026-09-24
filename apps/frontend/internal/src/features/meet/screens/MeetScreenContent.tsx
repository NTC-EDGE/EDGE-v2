import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, useWindowDimensions, TextInput, Pressable, Modal } from 'react-native';
import { Meeting, meetService, safeAsync, useUsers } from '@edge/api';
import { AlertToast, Button, EmptyState, Icon, SkeletonLoader, useTheme } from '@edge/ui';
import { useAuthContext } from '../../auth/context/AuthContext';
import { useMeetingsList, MeetingFilter } from '../hooks/useMeetingsList';
import { MeetingCard } from '../components/MeetingCard';
import { ActiveMeetingRoom } from '../components/ActiveMeetingRoom';
import { CreateMeetingModal } from '../forms/CreateMeetingModal';
import { CreateDirectMeetingModal } from '../forms/CreateDirectMeetingModal';
import { InviteParticipantModal } from '../forms/InviteParticipantModal';
import { CreateMeetingFormValues, CreateDirectMeetingFormValues } from '../schemas/meetSchemas';

const FILTER_TABS: { id: MeetingFilter; label: string }[] = [
  { id: 'All', label: 'All' },
  { id: 'Upcoming', label: 'Upcoming' },
  { id: 'Live', label: 'Live' },
  { id: 'History', label: 'Meet History' },
];

export const MeetScreenContent: React.FC = () => {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const { user } = useAuthContext();
  const { users } = useUsers();
  const {
    meetings,
    isLoading,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    deleteMeeting,
    refreshMeetings,
  } = useMeetingsList(user?.tenantId);

  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  const [invitingMeeting, setInvitingMeeting] = useState<Meeting | null>(null);
  const [viewingRecordingMeeting, setViewingRecordingMeeting] = useState<Meeting | null>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(false);
  const [isDirectOpen, setIsDirectOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

  const showToast = (message: string, variant: 'success' | 'error') => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCreateMeeting = async (values: CreateMeetingFormValues) => {
    setIsSubmitting(true);
    const [newMeet, err] = await safeAsync(meetService.createMeeting(values));
    setIsSubmitting(false);
    if (err !== null) {
      showToast(err, 'error');
      return;
    }
    if (newMeet !== null) {
      showToast(`Meeting "${values.title}" scheduled.`, 'success');
      await refreshMeetings();
    }
  };

  const handleCreateDirectMeeting = async (values: CreateDirectMeetingFormValues) => {
    setIsSubmitting(true);
    const target = users.find(
      (u) =>
        u.id === values.colleagueEmailOrId ||
        u.email.toLowerCase() === values.colleagueEmailOrId.trim().toLowerCase()
    );
    const targetUserId = target ? target.id : values.colleagueEmailOrId;
    const targetName = target ? `${target.firstName} ${target.lastName}` : values.colleagueEmailOrId;
    const title = values.title?.trim() || `Direct Meet with ${targetName}`;

    const [newMeet, err] = await safeAsync(
      meetService.createMeeting({
        title,
        scope: values.scope,
        scheduledStartTime: new Date().toISOString(),
        participantUserIds: targetUserId ? [targetUserId] : undefined,
      })
    );
    setIsSubmitting(false);
    if (err !== null) {
      showToast(err, 'error');
      return;
    }
    if (newMeet !== null) {
      showToast('Direct meeting started. Entering room...', 'success');
      await refreshMeetings();
      setActiveMeeting(newMeet);
    }
  };

  const handleInviteFromList = async (userIds: string[]) => {
    if (!invitingMeeting) return;
    setIsSubmitting(true);
    const [updated, err] = await safeAsync(
      meetService.inviteParticipants(invitingMeeting.meetingCode, userIds)
    );
    setIsSubmitting(false);
    if (err !== null) {
      showToast(err, 'error');
      return;
    }
    if (updated !== null) {
      setInvitingMeeting(updated);
      showToast(`Invited ${userIds.length} colleague(s).`, 'success');
      await refreshMeetings();
    }
  };

  const handleRemoveFromList = async (userId: string) => {
    if (!invitingMeeting) return;
    setIsSubmitting(true);
    const [success, err] = await safeAsync(
      meetService.removeParticipant(invitingMeeting.meetingCode, userId)
    );
    setIsSubmitting(false);
    if (err !== null) {
      showToast(err, 'error');
      return;
    }
    if (success) {
      setInvitingMeeting((prev) =>
        prev
          ? {
              ...prev,
              participants: prev.participants.filter((p) => p.userId !== userId),
            }
          : null
      );
      showToast('Participant removed.', 'success');
      await refreshMeetings();
    }
  };

  const handleDeleteMeeting = (meetingId: string) => {
    deleteMeeting(meetingId);
    showToast('Meeting removed from your list.', 'success');
  };

  if (activeMeeting !== null) {
    return (
      <ActiveMeetingRoom
        meeting={activeMeeting}
        currentUserId={user?.id}
        currentUserName={user?.name}
        onLeave={() => setActiveMeeting(null)}
      />
    );
  }

  return (
    <View style={[styles.outerContainer, { backgroundColor: colors.bg }]}>
      {toast !== null && (
        <View style={styles.toastWrapper}>
          <AlertToast message={toast.message} variant={toast.variant} onDismiss={() => setToast(null)} />
        </View>
      )}

      <View style={styles.mainWrapper}>
        <View style={[styles.header, isMobile && styles.headerMobile, { borderBottomColor: colors.border }]}>
          <View style={styles.headerInfo}>
            <Text style={[styles.title, { color: colors.text }]}>Regional Meetings</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Real-time video & audio conferences across regional offices.
            </Text>
          </View>
          <View style={[styles.actionButtonsRow, isMobile && styles.actionButtonsRowMobile]}>
            <Button
              variant="outline"
              size={isMobile ? 'sm' : 'md'}
              fullWidth={false}
              leftIcon={<Icon name="video" size={16} color={colors.text} />}
              onPress={() => setIsDirectOpen(true)}
              style={isMobile ? styles.mobileBtn : undefined}
            >
              Direct Meet
            </Button>
            <Button
              variant="primary"
              size={isMobile ? 'sm' : 'md'}
              fullWidth={false}
              leftIcon={<Icon name="plus" size={16} color="#FFFFFF" />}
              onPress={() => setIsScheduleOpen(true)}
              style={isMobile ? styles.mobileBtn : undefined}
            >
              Schedule Meeting
            </Button>
          </View>
        </View>

        {/* Search Bar & Filter Tabs */}
        <View style={styles.filterRow}>
          <View style={[styles.searchBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Icon name="search" size={14} color={colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search meetings by title, host, or code..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                <Icon name="x" size={14} color={colors.textMuted} />
              </Pressable>
            )}
          </View>

          <View style={styles.tabGroup}>
            {FILTER_TABS.map((tab) => {
              const isActive = filter === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  style={[
                    styles.tabButton,
                    {
                      backgroundColor: isActive
                        ? colors.brand.primary
                        : isDark
                          ? 'rgba(255,255,255,0.06)'
                          : 'rgba(0,0,0,0.05)',
                    },
                  ]}
                  onPress={() => setFilter(tab.id)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      {
                        color: isActive ? '#FFFFFF' : colors.textMuted,
                        fontWeight: isActive ? '700' : '500',
                      },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingArea}>
            <SkeletonLoader height={80} style={styles.skel} />
            <SkeletonLoader height={80} style={styles.skel} />
            <SkeletonLoader height={80} style={styles.skel} />
          </View>
        ) : meetings.length === 0 ? (
          <EmptyState
            title={
              searchQuery
                ? 'No matching meetings'
                : filter === 'History'
                  ? 'No past meeting history'
                  : 'No scheduled meetings'
            }
            description={
              searchQuery
                ? 'Try different search keywords.'
                : filter === 'History'
                  ? 'Completed conference records and recordings will appear here.'
                  : 'Start a direct meeting or schedule a conference with regional teams.'
            }
          />
        ) : (
          <FlatList
            data={meetings}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MeetingCard
                meeting={item}
                onJoin={setActiveMeeting}
                onInvite={setInvitingMeeting}
                onDelete={handleDeleteMeeting}
                onViewRecording={setViewingRecordingMeeting}
              />
            )}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>

      <CreateDirectMeetingModal
        visible={isDirectOpen}
        onClose={() => setIsDirectOpen(false)}
        onSubmit={handleCreateDirectMeeting}
        isSubmitting={isSubmitting}
      />

      <CreateMeetingModal
        visible={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onSubmit={handleCreateMeeting}
        isSubmitting={isSubmitting}
      />

      <InviteParticipantModal
        visible={invitingMeeting !== null}
        meeting={invitingMeeting}
        onClose={() => setInvitingMeeting(null)}
        onInvite={handleInviteFromList}
        onRemoveParticipant={handleRemoveFromList}
        isSubmitting={isSubmitting}
      />

      {/* Recording Playback Modal */}
      <Modal
        visible={viewingRecordingMeeting !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setViewingRecordingMeeting(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setViewingRecordingMeeting(null)}>
          <View
            style={[
              styles.recordingModalCard,
              {
                backgroundColor: isDark ? colors.cardBg : '#FFFFFF',
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.recordingHeaderRow}>
              <View style={styles.recordingHeaderTitle}>
                <Icon name="film" size={18} color={colors.brand.primary} />
                <Text style={[styles.recTitle, { color: colors.text }]}>
                  {viewingRecordingMeeting?.title} - Recording
                </Text>
              </View>
              <Pressable onPress={() => setViewingRecordingMeeting(null)}>
                <Icon name="x" size={18} color={colors.textMuted} />
              </Pressable>
            </View>

            <View style={[styles.videoPlaceholder, { backgroundColor: '#0F172A' }]}>
              <Icon name="play-circle" size={48} color="#60A5FA" />
              <Text style={styles.playbackText}>Recording Playback Stream</Text>
              <Text style={styles.playbackSubText}>
                Recorded on {viewingRecordingMeeting?.scheduledStartTime ? new Date(viewingRecordingMeeting.scheduledStartTime).toLocaleDateString() : ''}
              </Text>
            </View>

            <View style={styles.recordingFooter}>
              <Text style={[styles.retentionNotice, { color: colors.textMuted }]}>
                🔒 Access: Authorized Attendees • Retention: 90 days
              </Text>
              <Button variant="primary" size="sm" onPress={() => setViewingRecordingMeeting(null)}>
                Close
              </Button>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    position: 'relative',
  },
  toastWrapper: {
    position: 'absolute',
    top: 12,
    zIndex: 9999,
    width: '90%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  mainWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 1200,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 16,
    marginBottom: 12,
    borderBottomWidth: 1,
  },
  headerMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerInfo: {
    flex: 1,
    minWidth: 200,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButtonsRowMobile: {
    width: '100%',
    flexDirection: 'row',
    gap: 8,
  },
  mobileBtn: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  searchBox: {
    flex: 1,
    minWidth: 240,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  tabGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  tabText: {
    fontSize: 12,
  },
  loadingArea: {
    gap: 12,
  },
  skel: {
    borderRadius: 12,
  },
  listContainer: {
    paddingBottom: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  recordingModalCard: {
    width: '100%',
    maxWidth: 600,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  recordingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordingHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  recTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  videoPlaceholder: {
    width: '100%',
    height: 260,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  playbackText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  playbackSubText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  recordingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  retentionNotice: {
    fontSize: 12,
  },
});
