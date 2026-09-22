import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { ModalDialog, Icon, Button, useTheme } from '@edge/ui';
import { useUsers, useTenants, useTenantMembers, Meeting } from '@edge/api';

interface InviteParticipantModalProps {
  visible: boolean;
  meeting: Meeting | null;
  onClose: () => void;
  onInvite: (userIds: string[]) => Promise<void>;
  onRemoveParticipant?: (userId: string) => Promise<void>;
  isSubmitting?: boolean;
}

export const InviteParticipantModal: React.FC<InviteParticipantModalProps> = ({
  visible, meeting, onClose, onInvite, onRemoveParticipant, isSubmitting = false,
}) => {
  const { colors, isDark } = useTheme();
  const { users } = useUsers();
  const { tenants } = useTenants();
  const [colleagueQuery, setColleagueQuery] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState<string>('all');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'invite' | 'members'>('invite');

  const { members } = useTenantMembers(selectedTenantId !== 'all' ? selectedTenantId : undefined);

  const candidates = useMemo(() => {
    if (selectedTenantId !== 'all') {
      return members.filter((m) => !m.isDeleted).map((m) => ({
        userId: m.userId, name: `${m.userFirstName} ${m.userLastName}`, email: m.userEmail,
        tenant: m.tenantName || 'Regional Office', office: m.fieldOfficeName || m.division || 'Main Office',
      }));
    }
    return users.filter((u) => u.tenantMemberships && u.tenantMemberships.length > 0).map((u) => {
      const m = u.tenantMemberships?.[0];
      const matched = tenants.find((t) => t.id === m?.tenantId);
      return {
        userId: u.id, name: `${u.firstName} ${u.lastName}`, email: u.email,
        tenant: matched?.name || matched?.code || 'Regional Office', office: m?.fieldOffice?.name || m?.division || 'Main Office',
      };
    });
  }, [selectedTenantId, members, users, tenants]);

  const matchingUsers = useMemo(() => {
    if (!meeting) return [];
    const q = colleagueQuery.trim().toLowerCase();
    const currentIds = meeting.participants.map((p) => p.userId);
    return candidates.filter((c) => !currentIds.includes(c.userId) && (q.length === 0 || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)));
  }, [candidates, colleagueQuery, meeting]);

  if (!visible || !meeting) return null;

  const isAllSelected = matchingUsers.length > 0 && matchingUsers.every((u) => selectedUserIds.includes(u.userId));

  const handleToggleUser = (userId: string) => {
    setSelectedUserIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  };

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      const matchIds = new Set(matchingUsers.map((u) => u.userId));
      setSelectedUserIds((prev) => prev.filter((id) => !matchIds.has(id)));
    } else {
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...matchingUsers.map((u) => u.userId)])));
    }
  };

  const handleSendInvites = async () => {
    if (selectedUserIds.length === 0) { onClose(); return; }
    await onInvite(selectedUserIds);
    setSelectedUserIds([]);
    setColleagueQuery('');
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
        <Button variant="secondary" size="sm" fullWidth={false} onPress={() => { setCopied('code'); setTimeout(() => setCopied(null), 2500); }}>
          {copied === 'code' ? 'Copied!' : 'Copy Code'}
        </Button>
      </View>

      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
        <Pressable style={[styles.tabItem, activeTab === 'invite' && { borderBottomColor: colors.brand.primary, borderBottomWidth: 2 }]} onPress={() => setActiveTab('invite')}>
          <Text style={[styles.tabText, { color: activeTab === 'invite' ? colors.brand.primary : colors.textMuted }]}>Invite Members</Text>
        </Pressable>
        <Pressable style={[styles.tabItem, activeTab === 'members' && { borderBottomColor: colors.brand.primary, borderBottomWidth: 2 }]} onPress={() => setActiveTab('members')}>
          <Text style={[styles.tabText, { color: activeTab === 'members' ? colors.brand.primary : colors.textMuted }]}>Participants ({meeting.participants.length})</Text>
        </Pressable>
      </View>

      {activeTab === 'invite' ? (
        <View style={styles.inputContainer}>
          <View style={[styles.searchBoxWrapper, { borderColor: colors.border, backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
            <Icon name="search" size={14} color={colors.textMuted} />
            <TextInput style={[styles.searchInput, { color: colors.text }]} placeholder="Search member by name or email..." placeholderTextColor={colors.textMuted} value={colleagueQuery} onChangeText={setColleagueQuery} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tenantPillsRow}>
            <Pressable style={[styles.tenantPill, { borderColor: colors.border }, selectedTenantId === 'all' && { backgroundColor: colors.brand.primary, borderColor: colors.brand.primary }]} onPress={() => setSelectedTenantId('all')}>
              <Text style={[styles.tenantPillText, { color: selectedTenantId === 'all' ? '#FFFFFF' : colors.text }]}>All Tenants</Text>
            </Pressable>
            {tenants.map((t) => (
              <Pressable key={t.id} style={[styles.tenantPill, { borderColor: colors.border }, selectedTenantId === t.id && { backgroundColor: colors.brand.primary, borderColor: colors.brand.primary }]} onPress={() => setSelectedTenantId(t.id)}>
                <Text style={[styles.tenantPillText, { color: selectedTenantId === t.id ? '#FFFFFF' : colors.text }]}>{t.code || t.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <View style={[styles.suggestionsBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={[styles.suggestionsHeaderRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.suggestionHeader, { color: colors.textMuted }]}>{selectedTenantId === 'all' ? 'All Members' : 'Tenant Members'} ({matchingUsers.length})</Text>
              {matchingUsers.length > 0 && (
                <Pressable onPress={handleSelectAllToggle} hitSlop={8}>
                  <Text style={[styles.selectAllText, { color: colors.brand.primary }]}>{isAllSelected ? 'Deselect All' : `Select All (${matchingUsers.length})`}</Text>
                </Pressable>
              )}
            </View>
            <ScrollView style={styles.membersListScroll} nestedScrollEnabled>
              {matchingUsers.map((u) => {
                const isSelected = selectedUserIds.includes(u.userId);
                return (
                  <Pressable key={u.userId} style={({ pressed }) => [styles.suggestionItem, { borderBottomColor: colors.border }, isSelected && { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)' }, pressed && { opacity: 0.8 }]} onPress={() => handleToggleUser(u.userId)}>
                    <Icon name={isSelected ? 'check-square' : 'square'} size={18} color={isSelected ? colors.brand.primary : colors.textMuted} />
                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>{u.name} <Text style={[styles.itemEmail, { color: colors.textMuted }]}>({u.email})</Text></Text>
                      <Text style={[styles.itemOffice, { color: colors.textMuted }]} numberOfLines={1}>{u.tenant} • {u.office}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      ) : (
        <ScrollView style={styles.membersListScroll} nestedScrollEnabled>
          {meeting.participants.map((p) => (
            <View key={p.userId} style={[styles.participantRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.avatarBadge, { backgroundColor: colors.brand.primary }]}><Text style={styles.avatarText}>{p.fullName ? p.fullName.charAt(0) : 'U'}</Text></View>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.text }]}>{p.fullName} {p.userId === meeting.hostUserId && <Text style={{ color: colors.brand.primary }}>(Host)</Text>}</Text>
                <Text style={[styles.itemEmail, { color: colors.textMuted }]}>{p.email} • {p.role}</Text>
              </View>
              {onRemoveParticipant && p.userId !== meeting.hostUserId && (
                <Button variant="danger" size="sm" fullWidth={false} onPress={() => onRemoveParticipant(p.userId)}>Remove</Button>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </ModalDialog>
  );
};

const styles = StyleSheet.create({
  codeCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderRadius: 8, borderWidth: 1, marginBottom: 10 },
  codeInfo: { gap: 2 },
  codeLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  codeValue: { fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
  tabBar: { flexDirection: 'row', gap: 16, marginBottom: 10, borderBottomWidth: 1 },
  tabItem: { paddingVertical: 6, paddingHorizontal: 4 },
  tabText: { fontSize: 13, fontWeight: '600' },
  inputContainer: { position: 'relative' },
  searchBoxWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, gap: 8, marginBottom: 8 },
  searchInput: { flex: 1, fontSize: 13, padding: 0 },
  tenantPillsRow: { flexDirection: 'row', gap: 6, marginBottom: 8, paddingVertical: 2 },
  tenantPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14, borderWidth: 1 },
  tenantPillText: { fontSize: 11, fontWeight: '600' },
  suggestionsBox: { borderRadius: 8, borderWidth: 1, overflow: 'hidden' },
  suggestionsHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderBottomWidth: 1 },
  suggestionHeader: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  selectAllText: { fontSize: 11, fontWeight: '700' },
  membersListScroll: { maxHeight: 220 },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, gap: 10 },
  participantRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, gap: 10 },
  avatarBadge: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  itemInfo: { flex: 1, gap: 2 },
  itemName: { fontSize: 13, fontWeight: '600' },
  itemEmail: { fontSize: 11, fontWeight: '400' },
  itemOffice: { fontSize: 10, fontWeight: '500' },
});
