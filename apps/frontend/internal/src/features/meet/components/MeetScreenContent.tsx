import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  TextInput,
  Pressable,
} from 'react-native';
import { Meeting, meetService, safeAsync, useUsers } from '@edge/api';
import { AlertToast, Button, EmptyState, Icon, SkeletonLoader, useTheme } from '@edge/ui';
import { useAuthContext } from '../../auth/context/AuthContext';
import { useMeetingsList, MeetingFilter } from '../hooks/useMeetingsList';
import { InitialJoinPreferences } from '../hooks/useMeetingRoom';
import { useMeetingSession } from '../context/MeetingSessionContext';
import { MeetingCard } from './MeetingCard';
import { ActiveMeetingRoom } from './ActiveMeetingRoom';
import { PreJoinLobby } from './PreJoinLobby';
import { CreateMeetingModal } from '../forms/CreateMeetingModal';
import { CreateDirectMeetingModal } from '../forms/CreateDirectMeetingModal';
import { InviteParticipantModal } from '../forms/InviteParticipantModal';
import { JoinMeetingModal } from '../forms/JoinMeetingModal';
import {
  CreateMeetingFormValues,
  CreateDirectMeetingFormValues,
  JoinMeetingFormValues,
} from '../schemas/meetSchemas';
import { extractMeetingCodeFromInput } from '../utils/meetingNavigationHelper';
import { copyTextToClipboard, getMeetingJoinLink } from '../utils/webDomHelpers';

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
  const session = useMeetingSession();

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

  // Fallback local state if rendered outside MeetingSessionProvider (e.g. isolated unit test)
  const [fallbackLobbyMeeting, setFallbackLobbyMeeting] = useState<Meeting | null>(null);
  const [fallbackActiveMeeting, setFallbackActiveMeeting] = useState<Meeting | null>(null);

  const [invitingMeeting, setInvitingMeeting] = useState<Meeting | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState<boolean>(false);
  const [isDirectOpen, setIsDirectOpen] = useState<boolean>(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

  const showToast = (message: string, variant: 'success' | 'error') => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 4200);
  };

  useEffect(() => {
    if (session?.exitReasonToast) {
      showToast(session.exitReasonToast, 'error');
      session.clearExitReasonToast();
      void refreshMeetings();
    }
  }, [session?.exitReasonToast, session?.clearExitReasonToast, refreshMeetings]);

  const activeMeeting = session ? session.activeMeeting : fallbackActiveMeeting;
  const lobbyMeeting = session ? session.lobbyMeeting : fallbackLobbyMeeting;

  const openLobbyForMeeting = (meetingToOpen: Meeting) => {
    if (session) {
      session.openPreJoinLobby(meetingToOpen);
    } else {
      setFallbackLobbyMeeting(meetingToOpen);
    }
  };

  const enterCallImmediately = (meetingToJoin: Meeting, prefs?: InitialJoinPreferences) => {
    if (session) {
      session.enterMeetingNow(meetingToJoin, prefs);
    } else {
      setFallbackLobbyMeeting(null);
      setFallbackActiveMeeting(meetingToJoin);
    }
  };

  const handleLeaveActiveCall = async () => {
    if (session) {
      await session.leaveActiveMeeting();
    } else {
      setFallbackActiveMeeting(null);
    }
    await refreshMeetings();
  };

  const handleEndCallForEveryone = async () => {
    if (session) {
      await session.endActiveMeetingForEveryone();
    } else {
      setFallbackActiveMeeting(null);
    }
    showToast('Meeting ended for all participants.', 'success');
    await refreshMeetings();
  };

  // 1-Click Instant Meeting ("New Instant Meeting" like Google Meet)
  const handleStartInstantMeeting = async () => {
    setIsSubmitting(true);
    const hostLabel = user?.name ? `${user.name}'s Meeting` : 'Instant Regional Sync';
    const [newMeet, err] = await safeAsync(
      meetService.createMeeting({
        title: hostLabel,
        scope: 'InterRegional',
        scheduledStartTime: new Date().toISOString(),
        isInstant: true,
        ringParticipants: false,
      })
    );
    setIsSubmitting(false);
    if (err !== null) {
      showToast(err, 'error');
      return;
    }
    if (newMeet !== null) {
      const link = getMeetingJoinLink(newMeet.meetingCode);
      const copied = await copyTextToClipboard(link);
      showToast(
        copied
          ? `Instant meeting ready! Join link copied (${newMeet.meetingCode}).`
          : `Instant meeting started (${newMeet.meetingCode}).`,
        'success'
      );
      await refreshMeetings();
      enterCallImmediately(newMeet);
    }
  };

  const handleSaveScheduledMeeting = async (values: CreateMeetingFormValues) => {
    setIsSubmitting(true);
    if (editingMeeting) {
      const [updated, err] = await safeAsync(
        meetService.updateMeeting({
          meetingCode: editingMeeting.meetingCode,
          title: values.title,
          description: values.description,
          scope: values.scope,
          scheduledStartTime: values.scheduledStartTime,
          scheduledEndTime: values.scheduledEndTime,
        })
      );
      setIsSubmitting(false);
      if (err !== null) {
        showToast(err, 'error');
        return;
      }
      if (updated !== null) {
        setEditingMeeting(null);
        showToast(`Updated "${updated.title}".`, 'success');
        await refreshMeetings();
      }
      return;
    }

    const [newMeet, err] = await safeAsync(
      meetService.createMeeting({
        ...values,
        isInstant: false,
        ringParticipants: false,
      })
    );
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
    const targetName = target
      ? `${target.firstName} ${target.lastName}`
      : values.colleagueEmailOrId;
    const title = values.title?.trim() || `Direct Call with ${targetName}`;

    const [newMeet, err] = await safeAsync(
      meetService.createMeeting({
        title,
        scope: values.scope,
        scheduledStartTime: new Date().toISOString(),
        participantUserIds: targetUserId ? [targetUserId] : undefined,
        isInstant: true,
        ringParticipants: true,
      })
    );
    setIsSubmitting(false);
    if (err !== null) {
      showToast(err, 'error');
      return;
    }
    if (newMeet !== null) {
      showToast(`Calling ${targetName}...`, 'success');
      await refreshMeetings();
      enterCallImmediately(newMeet);
    }
  };

  const handleJoinByCode = async (values: JoinMeetingFormValues) => {
    const code = extractMeetingCodeFromInput(values.meetingCode);
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
    openLobbyForMeeting(meeting);
  };

  const handleInviteFromList = async (userIds: string[]) => {
    if (!invitingMeeting) return;
    setIsSubmitting(true);
    const shouldRing = invitingMeeting.status === 'Live';
    const [updated, err] = await safeAsync(
      meetService.inviteParticipants(invitingMeeting.meetingCode, userIds, shouldRing)
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
    showToast('Meeting cancelled.', 'success');
    await refreshMeetings();
  };

  // 1. Active Live Meeting Room View
  if (activeMeeting !== null) {
    return (
      <ActiveMeetingRoom
        meeting={activeMeeting}
        currentUserId={user?.id}
        currentUserName={user?.name}
        roomController={session?.room}
        onLeave={() => void handleLeaveActiveCall()}
        onEndForEveryone={() => void handleEndCallForEveryone()}
      />
    );
  }

  // 2. Pre-Join "Green Room" Lobby View (Scheduled / Code / Link joins)
  if (lobbyMeeting !== null) {
    return (
      <PreJoinLobby
        meeting={lobbyMeeting}
        currentUserId={user?.id}
        currentUserName={user?.name}
        onJoinConfirmed={(prefs) => enterCallImmediately(lobbyMeeting, prefs)}
        onCancel={() => {
          if (session) {
            session.closePreJoinLobby();
          } else {
            setFallbackLobbyMeeting(null);
          }
        }}
        onDenied={(reason) => {
          if (session) {
            session.closePreJoinLobby();
          } else {
            setFallbackLobbyMeeting(null);
          }
          showToast(reason, 'error');
        }}
      />
    );
  }

  // 3. Meetings Dashboard View
  return (
    <View style={[styles.outerContainer, { backgroundColor: colors.bg }]}>
      {toast !== null && (
        <View style={styles.toastWrapper}>
          <AlertToast
            message={toast.message}
            variant={toast.variant}
            onDismiss={() => setToast(null)}
          />
        </View>
      )}

      <View style={styles.mainWrapper}>
        {scheduledMeetingNotification !== null && (
          <View
            style={[
              styles.scheduledAlertBanner,
              { backgroundColor: '#1E293B', borderColor: colors.brand.primary },
            ]}
          >
            <View style={styles.scheduledAlertLeft}>
              <View style={styles.scheduledAlertPulse}>
                <Icon name="clock" size={16} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.scheduledAlertTitle}>
                  Starting Now: {scheduledMeetingNotification.title}
                </Text>
                <Text style={styles.scheduledAlertSub}>
                  Scheduled for{' '}
                  {new Date(scheduledMeetingNotification.scheduledStartTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  • Host: {scheduledMeetingNotification.hostUserName}
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
                  openLobbyForMeeting(target);
                }}
              >
                Open Lobby
              </Button>
              <Button variant="outline" size="sm" onPress={clearScheduledMeetingNotification}>
                Dismiss
              </Button>
            </View>
          </View>
        )}

        <View style={[styles.header, isMobile && styles.headerMobile, { borderBottomColor: colors.border }]}>
          <View style={styles.headerInfo}>
            <Text style={[styles.title, { color: colors.text }]}>Regional Meetings</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Start an instant conference, call a colleague, or schedule regional meetings.
            </Text>
          </View>
          <View style={[styles.actionButtonsRow, isMobile && styles.actionButtonsRowMobile]}>
            <Button
              variant="outline"
              size={isMobile ? 'sm' : 'md'}
              fullWidth={false}
              leftIcon={<Icon name="hash" size={15} color={colors.text} />}
              onPress={() => setIsJoinModalOpen(true)}
            >
              Join Code
            </Button>
            <Button
              variant="outline"
              size={isMobile ? 'sm' : 'md'}
              fullWidth={false}
              leftIcon={<Icon name="phone-call" size={15} color={colors.text} />}
              onPress={() => setIsDirectOpen(true)}
            >
              Direct Call
            </Button>
            <Button
              variant="secondary"
              size={isMobile ? 'sm' : 'md'}
              fullWidth={false}
              leftIcon={<Icon name="zap" size={15} color={colors.brand.primary} />}
              onPress={() => void handleStartInstantMeeting()}
              isLoading={isSubmitting}
            >
              Instant Meet
            </Button>
            <Button
              variant="primary"
              size={isMobile ? 'sm' : 'md'}
              fullWidth={false}
              leftIcon={<Icon name="calendar" size={15} color="#FFFFFF" />}
              onPress={() => {
                setEditingMeeting(null);
                setIsScheduleOpen(true);
              }}
            >
              Schedule
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
                : filter === 'Live'
                  ? 'No live meetings right now'
                  : filter === 'History'
                    ? 'No past meeting history'
                    : 'No scheduled meetings'
            }
            description={
              searchQuery
                ? 'Try different search keywords.'
                : filter === 'History'
                  ? 'Completed conference sessions will appear here.'
                  : 'Click "Instant Meet" to launch a room now, or schedule an upcoming regional session.'
            }
          />
        ) : (
          <FlatList
            data={meetings}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MeetingCard
                meeting={item}
                currentUserId={user?.id}
                onJoin={openLobbyForMeeting}
                onInvite={setInvitingMeeting}
                onEdit={(m) => {
                  setEditingMeeting(m);
                  setIsScheduleOpen(true);
                }}
                onDelete={() => void handleDeleteMeeting(item)}
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
        editingMeeting={editingMeeting}
        onClose={() => {
          setIsScheduleOpen(false);
          setEditingMeeting(null);
        }}
        onSubmit={handleSaveScheduledMeeting}
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
    alignSelf: 'center',
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
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButtonsRowMobile: {
    width: '100%',
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
    flexWrap: 'wrap',
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
