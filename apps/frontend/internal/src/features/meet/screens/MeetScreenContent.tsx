import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, useWindowDimensions } from 'react-native';
import { Meeting, meetService, safeAsync, useUsers } from '@edge/api';
import { AlertToast, Button, EmptyState, Icon, SkeletonLoader, useTheme } from '@edge/ui';
import { useMeetingsList } from '../hooks/useMeetingsList';
import { MeetingCard } from '../components/MeetingCard';
import { ActiveMeetingRoom } from '../components/ActiveMeetingRoom';
import { CreateMeetingModal } from '../forms/CreateMeetingModal';
import { CreateDirectMeetingModal } from '../forms/CreateDirectMeetingModal';
import { CreateMeetingFormValues, CreateDirectMeetingFormValues } from '../schemas/meetSchemas';

export const MeetScreenContent: React.FC = () => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const { users } = useUsers();
  const { meetings, isLoading, refreshMeetings } = useMeetingsList();
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
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
    const [newMeet, err] = await safeAsync(meetService.createMeeting({
      title: values.title,
      description: values.description,
      scope: values.scope,
      scheduledStartTime: values.scheduledStartTime,
    }));
    setIsSubmitting(false);
    if (err !== null) { showToast(err, 'error'); return; }
    if (newMeet !== null) {
      showToast(`Meeting "${values.title}" scheduled.`, 'success');
      await refreshMeetings();
    }
  };

  const handleCreateDirectMeeting = async (values: CreateDirectMeetingFormValues) => {
    setIsSubmitting(true);
    const targetUser = users.find(
      (u) => u.id === values.colleagueEmailOrId || u.email.toLowerCase() === values.colleagueEmailOrId.trim().toLowerCase()
    );
    const targetUserId = targetUser ? targetUser.id : values.colleagueEmailOrId;
    const targetName = targetUser ? `${targetUser.firstName} ${targetUser.lastName}` : values.colleagueEmailOrId;
    const title = values.title?.trim() || `Direct Meet with ${targetName}`;

    const [newMeet, err] = await safeAsync(meetService.createMeeting({
      title,
      scope: values.scope,
      scheduledStartTime: new Date().toISOString(),
      participantUserIds: targetUserId ? [targetUserId] : undefined,
    }));
    setIsSubmitting(false);
    if (err !== null) { showToast(err, 'error'); return; }
    if (newMeet !== null) {
      showToast('Direct meeting started. Entering room...', 'success');
      await refreshMeetings();
      setActiveMeeting(newMeet);
    }
  };

  if (activeMeeting !== null) {
    return <ActiveMeetingRoom meeting={activeMeeting} onLeave={() => setActiveMeeting(null)} />;
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

        {isLoading ? (
          <View style={styles.loadingArea}>
            <SkeletonLoader height={80} style={styles.skel} />
            <SkeletonLoader height={80} style={styles.skel} />
          </View>
        ) : meetings.length === 0 ? (
          <EmptyState
            title="No scheduled meetings"
            description="Start a direct meeting or schedule a conference with regional teams."
          />
        ) : (
          <FlatList
            data={meetings}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MeetingCard meeting={item} onJoin={setActiveMeeting} />
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
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: { flex: 1, width: '100%', alignItems: 'center', position: 'relative' },
  toastWrapper: { position: 'absolute', top: 12, zIndex: 9999, width: '90%', maxWidth: 500, alignSelf: 'center' },
  mainWrapper: { flex: 1, width: '100%', maxWidth: 1200, paddingHorizontal: 16, paddingVertical: 12 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
  },
  headerMobile: { flexDirection: 'column', alignItems: 'flex-start', gap: 12 },
  headerInfo: { flex: 1, minWidth: 200 },
  actionButtonsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionButtonsRowMobile: { width: '100%', flexDirection: 'row', gap: 8 },
  mobileBtn: { flex: 1 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 2 },
  loadingArea: { gap: 12 },
  skel: { borderRadius: 12 },
  listContainer: { paddingBottom: 24 },
});
