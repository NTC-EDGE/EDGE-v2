import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { Icon, useTheme } from '@edge/ui';
import { useUsers, useTenants, useTenantMembers } from '@edge/api';

export interface TenantParticipantPickerProps {
  selectedUserIds: string[];
  onSelectedUserIdsChange: (userIds: string[]) => void;
  excludeUserIds?: string[];
  label?: string;
  listMaxHeight?: number;
}

export const TenantParticipantPicker: React.FC<TenantParticipantPickerProps> = ({
  selectedUserIds,
  onSelectedUserIdsChange,
  excludeUserIds,
  label,
  listMaxHeight = 180,
}) => {
  const { colors, isDark } = useTheme();
  const { users } = useUsers({ pageSize: 500 });
  const { tenants } = useTenants();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState<string>('all');

  const { members } = useTenantMembers(selectedTenantId !== 'all' ? selectedTenantId : undefined);

  const candidates = useMemo(() => {
    if (selectedTenantId !== 'all') {
      return members
        .filter((m) => !m.isDeleted)
        .map((m) => ({
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
    const q = searchQuery.trim().toLowerCase();
    const excludeSet = excludeUserIds && excludeUserIds.length > 0 ? new Set(excludeUserIds) : null;
    return candidates.filter((c) => {
      if (excludeSet !== null && excludeSet.has(c.userId)) return false;
      return q.length === 0 || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    });
  }, [candidates, searchQuery, excludeUserIds]);

  const isAllSelected = matchingUsers.length > 0 && matchingUsers.every((u) => selectedUserIds.includes(u.userId));

  const handleToggleUser = (userId: string) => {
    const updated = selectedUserIds.includes(userId)
      ? selectedUserIds.filter((id) => id !== userId)
      : [...selectedUserIds, userId];
    onSelectedUserIdsChange(updated);
  };

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      const matchIds = new Set(matchingUsers.map((u) => u.userId));
      onSelectedUserIdsChange(selectedUserIds.filter((id) => !matchIds.has(id)));
    } else {
      onSelectedUserIdsChange(Array.from(new Set([...selectedUserIds, ...matchingUsers.map((u) => u.userId)])));
    }
  };

  return (
    <View style={styles.container}>
      {label !== undefined && <Text style={[styles.fieldLabel, { color: colors.text }]}>{label}</Text>}

      <View style={[styles.searchBoxWrapper, { borderColor: colors.border, backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50] }]}>
        <Icon name="search" size={14} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search member by name or email..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tenantPillsRow}>
        <Pressable
          style={[styles.tenantPill, { borderColor: colors.border }, selectedTenantId === 'all' && { backgroundColor: colors.brand.primary, borderColor: colors.brand.primary }]}
          onPress={() => setSelectedTenantId('all')}
        >
          <Text style={[styles.tenantPillText, { color: selectedTenantId === 'all' ? '#FFFFFF' : colors.text }]}>All Tenants</Text>
        </Pressable>
        {tenants.map((t) => (
          <Pressable
            key={t.id}
            style={[styles.tenantPill, { borderColor: colors.border }, selectedTenantId === t.id && { backgroundColor: colors.brand.primary, borderColor: colors.brand.primary }]}
            onPress={() => setSelectedTenantId(t.id)}
          >
            <Text style={[styles.tenantPillText, { color: selectedTenantId === t.id ? '#FFFFFF' : colors.text }]}>{t.code || t.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={[styles.suggestionsBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <View style={[styles.suggestionsHeaderRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.suggestionHeader, { color: colors.textMuted }]}>
            {selectedTenantId === 'all' ? 'All Members' : 'Tenant Members'} ({matchingUsers.length})
          </Text>
          {matchingUsers.length > 0 && (
            <Pressable onPress={handleSelectAllToggle} hitSlop={8}>
              <Text style={[styles.selectAllText, { color: colors.brand.primary }]}>
                {isAllSelected ? 'Deselect All' : `Select All (${matchingUsers.length})`}
              </Text>
            </Pressable>
          )}
        </View>
        <ScrollView style={[styles.membersListScroll, { maxHeight: listMaxHeight }]} nestedScrollEnabled>
          {matchingUsers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No matching members found.</Text>
            </View>
          ) : (
            matchingUsers.map((u) => {
              const isSelected = selectedUserIds.includes(u.userId);
              return (
                <Pressable
                  key={u.userId}
                  style={({ pressed }) => [
                    styles.suggestionItem,
                    { borderBottomColor: colors.border },
                    isSelected && { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)' },
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => handleToggleUser(u.userId)}
                >
                  <Icon name={isSelected ? 'check-square' : 'square'} size={18} color={isSelected ? colors.brand.primary : colors.textMuted} />
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                      {u.name} <Text style={[styles.itemEmail, { color: colors.textMuted }]}>({u.email})</Text>
                    </Text>
                    <Text style={[styles.itemOffice, { color: colors.textMuted }]} numberOfLines={1}>
                      {u.tenant} • {u.office}
                    </Text>
                  </View>
                </Pressable>
              );
            })
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  searchBoxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  tenantPillsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  tenantPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  tenantPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  suggestionsBox: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  suggestionsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  suggestionHeader: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  selectAllText: {
    fontSize: 11,
    fontWeight: '700',
  },
  membersListScroll: {
    maxHeight: 180,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
  },
  itemEmail: {
    fontSize: 12,
    fontWeight: '400',
  },
  itemOffice: {
    fontSize: 11,
    marginTop: 2,
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 12,
  },
});
