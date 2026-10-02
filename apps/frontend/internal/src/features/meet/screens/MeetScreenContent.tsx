import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, useWindowDimensions, TextInput, Pressable, Modal } from 'react-native';
import { Meeting, meetService, safeAsync, realTimeService, useUsers } from '@edge/api';
import { AlertToast, Button, EmptyState, Icon, SkeletonLoader, useTheme } from '@edge/ui';
import { useAuthContext } from '../../auth/context/AuthContext';
import { useMeetingsList, MeetingFilter } from '../hooks/useMeetingsList';
import { clearMeetingSessionState } from '../hooks/useMeetingRoom';
import { MeetingCard } from '../components/MeetingCard';
import { ActiveMeetingRoom } from '../components/ActiveMeetingRoom';
import { WaitingRoomModal } from '../components/WaitingRoomModal';
import { CreateMeetingModal } from '../forms/CreateMeetingModal';
import { CreateDirectMeetingModal } from '../forms/CreateDirectMeetingModal';
import { InviteParticipantModal } from '../forms/InviteParticipantModal';
import { JoinMeetingModal } from '../forms/JoinMeetingModal';
import { CreateMeetingFormValues, CreateDirectMeetingFormValues, JoinMeetingFormValues } from '../schemas/meetSchemas';
import { isCustomEventWithCode, JOIN_MEETING_EVENT_NAME } from '../utils/meetingNavigationHelper';

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
    scheduledMeetingNotification,
    clearScheduledMeetingNotification,
    deleteMeeting,
    refreshMeetings,
  } = useMeetingsList(user?.tenantId);

  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  const [invitingMeeting, setInvitingMeeting] = useState<Meeting | null>(null);
  const [viewingRecordingMeeting, setViewingRecordingMeeting] = useState<Meeting | null>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(false);
  const [isDirectOpen, setIsDirectOpen] = useState<boolean>(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState<boolean>(false);
  const [waitingRoomMeeting, setWaitingRoomMeeting] = useState<Meeting | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

  const showToast = (message: string, variant: 'success' | 'error') => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 4000);
  };

  const handleJoinMeeting = (meetingToJoin: Meeting) => {
    setActiveMeeting(meetingToJoin);
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      try {
        if ('sessionStorage' in window && window.sessionStorage !== null && window.sessionStorage !== undefined) {
          window.sessionStorage.setItem('edge_active_meeting_code', meetingToJoin.meetingCode);
        }
        if (window.location !== undefined && typeof window.location.href === 'string') {
          const url = new URL(window.location.href);
          url.searchParams.set('code', meetingToJoin.meetingCode);
          window.history.replaceState(null, '', url.toString());
        }
      } catch {
        // ignore
      }
    }
  };

  const handleLeaveMeeting = () => {
    const code = activeMeeting?.meetingCode;
    setActiveMeeting(null);
    clearMeetingSessionState(code);
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      try {
        if ('sessionStorage' in window && window.sessionStorage !== null && window.sessionStorage !== undefined) {
          window.sessionStorage.removeItem('edge_active_meeting_code');
        }
        if (window.location !== undefined && typeof window.location.href === 'string') {
          const url = new URL(window.location.href);
          url.searchParams.delete('code');
          window.history.replaceState(null, '', url.toString());
        }
      } catch {
        // ignore
      }
    }
  };

  // Restore active meeting on page reload / direct URL link (?code=MEET-XXX)
  useEffect(() => {
    let savedCode: string | null = null;
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      try {
        if (window.location !== undefined && typeof window.location.search === 'string') {
          const urlParams = new URLSearchParams(window.location.search);
          savedCode = urlParams.get('code') || null;
        }
        if (savedCode === null && 'sessionStorage' in window && window.sessionStorage !== null && window.sessionStorage !== undefined) {
          savedCode = window.sessionStorage.getItem('edge_active_meeting_code');
        }
      } catch {
        // ignore
      }
    }

    if (savedCode !== null && savedCode !== '' && activeMeeting === null) {
      const codeToFetch = savedCode;
      void (async () => {
        const [meeting, err] = await safeAsync(meetService.getMeetingByCode(codeToFetch));
        if (meeting !== null && err === null && meeting.status !== 'Ended' && meeting.status !== 'Cancelled') {
          handleJoinMeeting(meeting);
        } else if (typeof window !== 'undefined' && typeof document !== 'undefined') {
          try {
            if ('sessionStorage' in window && window.sessionStorage !== null && window.sessionStorage !== undefined) {
              window.sessionStorage.removeItem('edge_active_meeting_code');
            }
          } catch {
            // ignore
          }
        }
      })();
    }
  }, []);

  // Listen to direct call accepted event while MeetScreenContent is already active
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;

    const handleDirectJoinEvent = (event: Event) => {
      if (isCustomEventWithCode(event)) {
        const codeToJoin = event.detail.code;
        if (codeToJoin.length > 0) {
          void (async () => {
            const [meeting, err] = await safeAsync(meetService.getMeetingByCode(codeToJoin));
            if (meeting !== null && err === null && meeting.status !== 'Ended' && meeting.status !== 'Cancelled') {
              handleJoinMeeting(meeting);
            }
          })();
        }
      }
    };

    window.addEventListener(JOIN_MEETING_EVENT_NAME, handleDirectJoinEvent);
    return () => {
      window.removeEventListener(JOIN_MEETING_EVENT_NAME, handleDirectJoinEvent);
    };
  }, []);

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
      handleJoinMeeting(newMeet);
    }
  };

  const handleJoinByCode = async (values: JoinMeetingFormValues) => {
    const code = values.meetingCode.trim();
    if (!code) return;

    setIsSubmitting(true);
    const [meeting, err] = await safeAsync(meetService.getMeetingByCode(code));
    setIsSubmitting(false);

    if (err !== null || meeting === null) {
      showToast('Meeting not found or invalid meeting code.', 'error');
      return;
    }

    if (meeting.status === 'Ended' || meeting.status === 'Cancelled') {
      showToast(`This meeting has already ${meeting.status.toLowerCase()}.`, 'error');
      return;
    }

    setIsJoinModalOpen(false);

    const isHost = user?.id !== undefined && meeting.hostUserId === user.id;
    const isParticipant = user?.id !== undefined && meeting.participants.some((p) => p.userId === user.id);
    const isDirectlyAuthorized = isHost || isParticipant || meeting.scope === 'InterRegional';

    if (isDirectlyAuthorized) {
      handleJoinMeeting(meeting);
    } else {
      // User is not invited -> Enter waiting room and send admission request to host
      setWaitingRoomMeeting(meeting);
      void realTimeService.requestJoinMeeting(meeting.meetingCode);
    }
  };

  const handleWaitingRoomAdmitted = async () => {
    if (!waitingRoomMeeting) return;
    const code = waitingRoomMeeting.meetingCode;
    setWaitingRoomMeeting(null);
    showToast('Admitted by the host! Entering meeting room...', 'success');

    const [meeting, err] = await safeAsync(meetService.getMeetingByCode(code));
    if (meeting !== null && err === null) {
      handleJoinMeeting(meeting);
    }
  };

  const handleWaitingRoomDenied = (reason: string) => {
    setWaitingRoomMeeting(null);
    showToast(reason || 'Your request to join was declined by the host.', 'error');
  };

  const handleWaitingRoomCancel = () => {
    if (waitingRoomMeeting) {
      void realTimeService.leaveMeeting(waitingRoomMeeting.meetingCode);
    }
    setWaitingRoomMeeting(null);
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

  const handleDeleteMeeting = async (meeting: Meeting) => {
    await deleteMeeting(meeting.meetingCode, meeting.id);
    showToast('Meeting cancelled and moved to history.', 'success');
    await refreshMeetings();
  };

  if (activeMeeting !== null) {
    return (
      <ActiveMeetingRoom
        meeting={activeMeeting}
        currentUserId={user?.id}
        currentUserName={user?.name}
        onLeave={handleLeaveMeeting}
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

      {/* Scheduled Meeting Starting Notification Prompt */}
      {scheduledMeetingNotification !== null && (
        <View style={[styles.scheduledAlertBanner, { backgroundColor: '#1E293B', borderColor: colors.brand.primary }]}>
          <View style={styles.scheduledAlertLeft}>
            <View style={styles.scheduledAlertPulse}>
              <Icon name="clock" size={16} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.scheduledAlertTitle}>
                Meeting Starting: {scheduledMeetingNotification.title}
              </Text>
              <Text style={styles.scheduledAlertSub}>
                Scheduled for {new Date(scheduledMeetingNotification.scheduledStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Host: {scheduledMeetingNotification.hostUserName}
              </Text>
            </View>
          </View>
          <View style={styles.scheduledAlertActions}>
            <Button
              variant="primary"
              size="sm"
              onPress={() => {
                const target = scheduledMeetingNotification;
                clearScheduledMeetingNotification();
                handleJoinMeeting(target);
              }}
            >
              Join Call Now
            </Button>
            <Button
              variant="outline"
              size="sm"
              onPress={clearScheduledMeetingNotification}
            >
              Dismiss
            </Button>
          </View>
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
              leftIcon={<Icon name="link" size={16} color={colors.text} />}
              onPress={() => setIsJoinModalOpen(true)}
              style={isMobile ? styles.mobileBtn : undefined}
            >
              Join Meeting
            </Button>
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
                onJoin={handleJoinMeeting}
                onInvite={setInvitingMeeting}
                onDelete={() => handleDeleteMeeting(item)}
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

      <JoinMeetingModal
        visible={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onSubmit={handleJoinByCode}
        isSubmitting={isSubmitting}
      />

      <WaitingRoomModal
        visible={waitingRoomMeeting !== null}
        meeting={waitingRoomMeeting}
        onAdmitted={handleWaitingRoomAdmitted}
        onDenied={handleWaitingRoomDenied}
        onCancel={handleWaitingRoomCancel}
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
  scheduledAlertBanner: {
    width: '100%',
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  scheduledAlertLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 260,
  },
  scheduledAlertPulse: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduledAlertTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  scheduledAlertSub: {
    color: '#94A3B8',
    fontSize: 12,
  },
  scheduledAlertActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
