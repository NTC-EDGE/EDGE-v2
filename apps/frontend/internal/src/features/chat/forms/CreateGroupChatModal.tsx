import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormFieldInput, ModalDialog, Icon, useTheme } from '@edge/ui';
import { useUsers, useTenants, useTenantMembers } from '@edge/api';
import { createGroupChatSchema, CreateGroupChatFormValues } from '../schemas/chatSchemas';

interface CreateGroupChatModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: CreateGroupChatFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export const CreateGroupChatModal: React.FC<CreateGroupChatModalProps> = ({ visible, onClose, onSubmit, isSubmitting }) => {
  const { colors, isDark } = useTheme();
  const { users } = useUsers({ pageSize: 500 });
  const { tenants } = useTenants();
  const [colleagueQuery, setColleagueQuery] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState<string>('all');

  const { control, handleSubmit, setValue, reset } = useForm<CreateGroupChatFormValues>({
    resolver: zodResolver(createGroupChatSchema),
    defaultValues: { title: '', description: '', scope: 'IntraRegional', participantUserIds: [] },
  });

  const selectedUserIds = useWatch({ control, name: 'participantUserIds' }) || [];
  const { members } = useTenantMembers(selectedTenantId !== 'all' ? selectedTenantId : undefined);

  const candidates = useMemo(() => {
    if (selectedTenantId !== 'all') {
      return members.filter((m) => !m.isDeleted).map((m) => ({
        userId: m.userId,
        name: `${m.userFirstName} ${m.userLastName}`,
        email: m.userEmail,
        tenant: m.tenantName || 'Regional Office',
        office: m.fieldOfficeName || m.division || 'Main Office',
      }));
    }
    return users.map((u) => {
      const m = u.tenantMemberships?.[0];
      const matched = tenants.find((t) => t.id === m?.tenantId);
      return {
        userId: u.id,
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        tenant: matched?.name || matched?.code || m?.tenantName || (u.isSuperAdmin ? 'National Headquarters' : 'Regional Office'),
        office: m?.fieldOffice?.name || m?.division || (u.isSuperAdmin ? 'Executive Office' : 'Main Office'),
      };
    });
  }, [selectedTenantId, members, users, tenants]);

  const matchingUsers = useMemo(() => {
    const q = colleagueQuery.trim().toLowerCase();
    return candidates.filter((c) => q.length === 0 || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  }, [candidates, colleagueQuery]);

  const isAllSelected = matchingUsers.length > 0 && matchingUsers.every((u) => selectedUserIds.includes(u.userId));

  const handleToggleUser = (userId: string) => {
    const updated = selectedUserIds.includes(userId) ? selectedUserIds.filter((id) => id !== userId) : [...selectedUserIds, userId];
    setValue('participantUserIds', updated, { shouldValidate: true });
  };

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      const matchIds = new Set(matchingUsers.map((u) => u.userId));
      setValue('participantUserIds', selectedUserIds.filter((id) => !matchIds.has(id)), { shouldValidate: true });
    } else {
      setValue('participantUserIds', Array.from(new Set([...selectedUserIds, ...matchingUsers.map((u) => u.userId)])), { shouldValidate: true });
    }
  };

  const handleFormSubmit = async (values: CreateGroupChatFormValues) => {
    await onSubmit(values);
    reset();
    setColleagueQuery('');
    onClose();
  };

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      title="Create Group Chat"
      subtitle="Select tenant office and add members to group."
      icon="users"
      confirmText="Create Group"
      cancelText="Cancel"
      onConfirm={handleSubmit(handleFormSubmit)}
      isLoading={isSubmitting}
      maxWidth={540}
    >
      <FormFieldInput control={control} name="title" label="Group Title" placeholder="e.g. Operations & Finance Taskforce" />
      <FormFieldInput control={control} name="description" label="Description (Optional)" placeholder="Purpose of this group..." />

      <View style={styles.inputContainer}>
        <Text style={[styles.fieldLabel, { color: colors.text }]}>Add Participants ({selectedUserIds.length} selected)</Text>
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
    </ModalDialog>
  );
};

const styles = StyleSheet.create({
  inputContainer: { position: 'relative' },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  searchBoxWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, gap: 8, marginBottom: 8 },
  searchInput: { flex: 1, fontSize: 13, padding: 0 },
  tenantPillsRow: { flexDirection: 'row', gap: 6, marginBottom: 8, paddingVertical: 2 },
  tenantPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14, borderWidth: 1 },
  tenantPillText: { fontSize: 11, fontWeight: '600' },
  suggestionsBox: { marginBottom: 14, borderRadius: 8, borderWidth: 1, overflow: 'hidden' },
  suggestionsHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderBottomWidth: 1 },
  suggestionHeader: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  selectAllText: { fontSize: 11, fontWeight: '700' },
  membersListScroll: { maxHeight: 200 },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, gap: 10 },
  itemInfo: { flex: 1, gap: 2 },
  itemName: { fontSize: 13, fontWeight: '600' },
  itemEmail: { fontSize: 11, fontWeight: '400' },
  itemOffice: { fontSize: 10, fontWeight: '500' },
});
