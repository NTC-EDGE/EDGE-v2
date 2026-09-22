import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { Conversation } from '@edge/api';
import { Button, EmptyState, Icon, SkeletonLoader, useTheme } from '@edge/ui';
import { ConversationItem } from './ConversationItem';

interface ChatSidebarProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conv: Conversation) => void;
  onOpenCreateDirect: () => void;
  onOpenCreateGroup: () => void;
  isLoading: boolean;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  onOpenCreateDirect,
  onOpenCreateGroup,
  isLoading,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { borderRightColor: colors.border, backgroundColor: colors.cardBg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerTitleRow}>
          <Text style={[styles.title, { color: colors.text }]}>Messages</Text>
          <View style={styles.actionButtonGroup}>
            <Pressable
              style={[styles.directBtn, { backgroundColor: colors.bg, borderColor: colors.border }]}
              onPress={onOpenCreateDirect}
              accessibilityLabel="New direct message"
            >
              <Icon name="user-plus" size={14} color={colors.text} />
              <Text style={[styles.directBtnText, { color: colors.text }]}>Direct</Text>
            </Pressable>
            <Pressable
              style={[styles.createBtn, { backgroundColor: colors.brand.primary }]}
              onPress={onOpenCreateGroup}
              accessibilityLabel="New group chat"
            >
              <Icon name="plus" size={14} color="#FFFFFF" />
              <Text style={styles.createBtnText}>Group</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <SkeletonLoader height={56} style={styles.skeleton} />
          <SkeletonLoader height={56} style={styles.skeleton} />
          <SkeletonLoader height={56} style={styles.skeleton} />
        </View>
      ) : conversations.length === 0 ? (
        <EmptyState
          title="No conversations"
          description="Start a direct chat or create a regional group."
        />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ConversationItem
              conversation={item}
              isSelected={selectedConversation?.id === item.id}
              onSelect={onSelectConversation}
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    minHeight: 64,
    justifyContent: 'center',
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
    paddingVertical: 6,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
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
