import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { Conversation, ChatMessage } from '@edge/api';
import { EmptyState, Icon, useTheme } from '@edge/ui';
import { MessageBubble } from './MessageBubble';
import { MessageInputBar } from '../forms/MessageInputBar';

interface ChatActivePaneProps {
  conversation: Conversation | null;
  messages: ChatMessage[];
  currentUserId?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  onSendMessage: (content: string) => Promise<boolean>;
  isSending: boolean;
}

export const ChatActivePane: React.FC<ChatActivePaneProps> = ({
  conversation,
  messages,
  currentUserId,
  showBackButton = false,
  onBack,
  onSendMessage,
  isSending,
}) => {
  const { colors } = useTheme();

  if (conversation === null) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.bg }]}>
        <EmptyState
          title="Select a conversation"
          description="Choose a chat from the list or start a new conversation."
        />
      </View>
    );
  }

  const title = conversation.title ?? conversation.participants[0]?.fullName ?? 'Chat';
  const isInterRegional = conversation.scope === 'InterRegional';

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.cardBg }]}>
        <View style={styles.headerLeft}>
          {showBackButton && onBack ? (
            <Pressable style={styles.backButton} onPress={onBack} accessibilityLabel="Back to chat list">
              <Icon name="arrow-left" size={20} color={colors.text} />
            </Pressable>
          ) : null}
          <View style={styles.headerTitleArea}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {title}
            </Text>
            <View style={styles.subtitleRow}>
              <View
                style={[
                  styles.scopeBadge,
                  { backgroundColor: isInterRegional ? colors.brand.accent + '20' : colors.brand.primary + '20' },
                ]}
              >
                <Text
                  style={[
                    styles.scopeText,
                    { color: isInterRegional ? colors.brand.accent : colors.brand.primary },
                  ]}
                >
                  {isInterRegional ? 'Inter-Regional' : 'My Regional Office'}
                </Text>
              </View>
              <Text style={[styles.participantCount, { color: colors.textMuted }]}>
                {conversation.participants.length} members
              </Text>
            </View>
          </View>
        </View>
      </View>

      <FlatList
        data={messages}
        inverted
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble message={item} isCurrentUser={item.senderId === currentUserId} />
        )}
        contentContainerStyle={styles.listContent}
      />

      <MessageInputBar onSendMessage={onSendMessage} isSending={isSending} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    minHeight: 64,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  backButton: {
    padding: 6,
    borderRadius: 8,
  },
  headerTitleArea: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  scopeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  scopeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  participantCount: {
    fontSize: 11,
  },
  listContent: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
});
