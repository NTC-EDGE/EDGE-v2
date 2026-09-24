import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Icon, useTheme } from '@edge/ui';
import { ExtendedChatMessage } from '../hooks/useChatMessages';

interface MessageBubbleProps {
  message: ExtendedChatMessage;
  isCurrentUser: boolean;
  onRetry?: (message: ExtendedChatMessage) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isCurrentUser, onRetry }) => {
  const { colors, isDark } = useTheme();

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderStatusIcon = () => {
    if (!isCurrentUser) return null;

    if (message.status === 'sending') {
      return (
        <View style={styles.statusIndicator}>
          <Icon name="clock" size={11} color="rgba(255,255,255,0.7)" />
        </View>
      );
    }

    if (message.status === 'sent') {
      return (
        <View style={styles.statusIndicator}>
          <Icon name="check" size={11} color="rgba(255,255,255,0.8)" />
        </View>
      );
    }

    if (message.status === 'delivered') {
      return (
        <View style={styles.statusIndicator}>
          <Icon name="check-circle" size={11} color="rgba(255,255,255,0.9)" />
        </View>
      );
    }

    if (message.status === 'failed') {
      return (
        <Pressable
          style={styles.retryBtn}
          onPress={() => onRetry?.(message)}
          accessibilityLabel="Retry sending message"
        >
          <Icon name="alert-circle" size={12} color="#EF4444" />
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      );
    }

    return null;
  };

  return (
    <View
      style={[
        styles.container,
        isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer,
      ]}
    >
      {!isCurrentUser ? (
        <Text style={[styles.senderName, { color: colors.textMuted }]}>
          {message.senderName}{message.senderTenantName ? ` (${message.senderTenantName})` : ''}
        </Text>
      ) : null}
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isCurrentUser
              ? colors.brand.primary
              : isDark
                ? colors.cardBg
                : '#F1F5F9',
            borderColor: isCurrentUser ? colors.brand.primary : colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.messageText,
            { color: isCurrentUser ? '#FFFFFF' : colors.text },
          ]}
        >
          {message.content}
        </Text>

        <View style={styles.metaRow}>
          <Text
            style={[
              styles.timeText,
              { color: isCurrentUser ? 'rgba(255,255,255,0.7)' : colors.textMuted },
            ]}
          >
            {formatTime(message.createdAt)}
          </Text>
          {renderStatusIcon()}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
    maxWidth: '85%',
  },
  currentUserContainer: {
    alignSelf: 'flex-end',
  },
  otherUserContainer: {
    alignSelf: 'flex-start',
  },
  senderName: {
    fontSize: 11,
    marginBottom: 2,
    marginLeft: 4,
    fontWeight: '500',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 80,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 3,
  },
  timeText: {
    fontSize: 10,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  retryText: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: '700',
  },
});
