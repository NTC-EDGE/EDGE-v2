import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { ModalDialog, Button, useTheme } from '@edge/ui';
import { Meeting } from '@edge/api';
import { TenantParticipantPicker } from '../../../shared/components';

interface InviteParticipantModalProps {
  visible: boolean;
  meeting: Meeting | null;
  onClose: () => void;
  onInvite: (userIds: string[]) => Promise<void>;
  onRemoveParticipant?: (userId: string) => Promise<void>;
  isSubmitting?: boolean;
}

export const InviteParticipantModal: React.FC<InviteParticipantModalProps> = ({
  visible,
  meeting,
  onClose,
  onInvite,
  onRemoveParticipant,
  isSubmitting = false,
}) => {
  const { colors, isDark } = useTheme();
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'invite' | 'members'>('invite');

  if (!visible || !meeting) return null;

  const currentParticipantIds = meeting.participants.map((p) => p.userId);

  const handleSendInvites = async () => {
    if (selectedUserIds.length === 0) {
      onClose();
      return;
    }
    await onInvite(selectedUserIds);
    setSelectedUserIds([]);
    onClose();
  };

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      title="Meeting Participants"
      subtitle={`Manage attendees & invite colleagues to "${meeting.title}".`}
      icon="user-plus"
      confirmText={activeTab === 'invite' ? (selectedUserIds.length > 0 ? `Invite (${selectedUserIds.length})` : 'Done') : 'Done'}
      cancelText="Close"
      onConfirm={handleSendInvites}
      isLoading={isSubmitting}
      maxWidth={540}
    >
      <View style={[styles.codeCard, { backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50], borderColor: colors.border }]}>
        <View style={styles.codeInfo}>
          <Text style={[styles.codeLabel, { color: colors.textMuted }]}>Meeting Code</Text>
          <Text style={[styles.codeValue, { color: colors.text }]}>{meeting.meetingCode}</Text>
        </View>
        <Button
          variant="secondary"
          size="sm"
          fullWidth={false}
          onPress={() => {
            setCopied('code');
            setTimeout(() => setCopied(null), 2500);
          }}
        >
          {copied === 'code' ? 'Copied!' : 'Copy Code'}
        </Button>
      </View>

      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
        <Pressable
          style={[styles.tabItem, activeTab === 'invite' && { borderBottomColor: colors.brand.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('invite')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'invite' ? colors.brand.primary : colors.textMuted }]}>
            Invite Members
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabItem, activeTab === 'members' && { borderBottomColor: colors.brand.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('members')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'members' ? colors.brand.primary : colors.textMuted }]}>
            Participants ({meeting.participants.length})
          </Text>
        </Pressable>
      </View>

      {activeTab === 'invite' ? (
        <TenantParticipantPicker
          selectedUserIds={selectedUserIds}
          onSelectedUserIdsChange={setSelectedUserIds}
          excludeUserIds={currentParticipantIds}
          listMaxHeight={200}
        />
      ) : (
        <ScrollView style={styles.membersListScroll} nestedScrollEnabled>
          {meeting.participants.map((p) => (
            <View key={p.userId} style={[styles.participantRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.avatarBadge, { backgroundColor: colors.brand.primary }]}>
                <Text style={styles.avatarText}>{p.fullName ? p.fullName.charAt(0) : 'U'}</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.text }]}>
                  {p.fullName} {p.userId === meeting.hostUserId && <Text style={{ color: colors.brand.primary }}>(Host)</Text>}
                </Text>
                <Text style={[styles.itemEmail, { color: colors.textMuted }]}>
                  {p.email} • {p.role}
                </Text>
              </View>
              {onRemoveParticipant !== undefined && p.userId !== meeting.hostUserId && (
                <Button variant="danger" size="sm" fullWidth={false} onPress={() => onRemoveParticipant(p.userId)}>
                  Remove
                </Button>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </ModalDialog>
  );
};

const styles = StyleSheet.create({
  codeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  codeInfo: { gap: 2 },
  codeLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  codeValue: { fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
  tabBar: { flexDirection: 'row', gap: 16, marginBottom: 10, borderBottomWidth: 1 },
  tabItem: { paddingVertical: 6, paddingHorizontal: 4 },
  tabText: { fontSize: 13, fontWeight: '600' },
  membersListScroll: { maxHeight: 220 },
  participantRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, gap: 10 },
  avatarBadge: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  itemInfo: { flex: 1, gap: 2 },
  itemName: { fontSize: 13, fontWeight: '600' },
  itemEmail: { fontSize: 11, fontWeight: '400' },
});
