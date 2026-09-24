import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, TextInput } from 'react-native';
import { Conversation } from '@edge/api';
import { EmptyState, Icon, SkeletonLoader, useTheme } from '@edge/ui';
import { ConversationItem } from './ConversationItem';
import { ChatFilter, ExtendedConversation } from '../hooks/useChatConversations';

interface ChatSidebarProps {
  conversations: ExtendedConversation[];
  currentUserId?: string;
  selectedConversation: Conversation | null;
  onSelectConversation: (conv: Conversation) => void;
  onOpenCreateDirect: () => void;
  onOpenCreateGroup: () => void;
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filter: ChatFilter;
  onFilterChange: (filter: ChatFilter) => void;
  onMarkAsRead?: (conversationId: string) => void;
  onMarkAsUnread?: (conversationId: string) => void;
  onArchive?: (conversationId: string) => void;
  onUnarchive?: (conversationId: string) => void;
  onDelete?: (conversationId: string) => void;
}

const FILTER_OPTIONS: { id: ChatFilter; label: string }[] = [
  { id: 'All', label: 'All' },
  { id: 'Unread', label: 'Unread' },
  { id: 'Direct', label: 'Direct' },
  { id: 'Group', label: 'Group' },
  { id: 'Archived', label: 'Archived' },
];

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  currentUserId,
  selectedConversation,
  onSelectConversation,
  onOpenCreateDirect,
  onOpenCreateGroup,
  isLoading,
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  onMarkAsRead,
  onMarkAsUnread,
  onArchive,
  onUnarchive,
  onDelete,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { borderRightColor: colors.border, backgroundColor: colors.cardBg }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerTitleRow}>
          <Text style={[styles.title, { color: colors.text }]}>Messages</Text>
          <View style={styles.actionButtonGroup}>
            <Pressable
              style={[styles.directBtn, { backgroundColor: colors.bg, borderColor: colors.border }]}
              onPress={onOpenCreateDirect}
              accessibilityLabel="New direct message"
            >
              <Icon name="user-plus" size={13} color={colors.text} />
              <Text style={[styles.directBtnText, { color: colors.text }]}>Direct</Text>
            </Pressable>
            <Pressable
              style={[styles.createBtn, { backgroundColor: colors.brand.primary }]}
              onPress={onOpenCreateGroup}
              accessibilityLabel="New group chat"
            >
              <Icon name="plus" size={13} color="#FFFFFF" />
              <Text style={styles.createBtnText}>Group</Text>
            </Pressable>
          </View>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.bg, borderColor: colors.border }]}>
          <Icon name="search" size={14} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search conversations & people..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={onSearchChange}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => onSearchChange('')} hitSlop={8}>
              <Icon name="x" size={14} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        {/* Filter Pills */}
        <View style={styles.filterScroll}>
          {FILTER_OPTIONS.map((opt) => {
            const isActive = filter === opt.id;
            return (
              <Pressable
                key={opt.id}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isActive
                      ? colors.brand.primary
                      : isDark
                        ? 'rgba(255,255,255,0.06)'
                        : 'rgba(0,0,0,0.05)',
                  },
                ]}
                onPress={() => onFilterChange(opt.id)}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: isActive ? '#FFFFFF' : colors.textMuted,
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Conversation List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <SkeletonLoader height={56} style={styles.skeleton} />
          <SkeletonLoader height={56} style={styles.skeleton} />
          <SkeletonLoader height={56} style={styles.skeleton} />
        </View>
      ) : conversations.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'No matches found' : filter === 'Archived' ? 'No archived chats' : 'No conversations'}
          description={
            searchQuery
              ? 'Try a different search keyword.'
              : filter === 'Archived'
                ? 'Archived messages will appear here.'
                : 'Start a direct chat or create a regional group.'
          }
        />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ConversationItem
              conversation={item}
              currentUserId={currentUserId}
              isSelected={selectedConversation?.id === item.id}
              onSelect={onSelectConversation}
              onMarkAsRead={onMarkAsRead}
              onMarkAsUnread={onMarkAsUnread}
              onArchive={onArchive}
              onUnarchive={onUnarchive}
              onDelete={onDelete}
            />
          )}
          style={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    height: '100%',
    borderRightWidth: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    gap: 10,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  actionButtonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  directBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  directBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  filterScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  filterText: {
    fontSize: 11,
  },
  list: {
    flex: 1,
  },
  loadingContainer: {
    padding: 16,
    gap: 12,
  },
  skeleton: {
    borderRadius: 8,
  },
});
