import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChatMessage } from '@edge/api';
import { useTheme } from '@edge/ui';

interface MessageBubbleProps {
  message: ChatMessage;
  isCurrentUser: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isCurrentUser }) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer,
      ]}
    >
      {!isCurrentUser ? (
        <Text style={[styles.senderName, { color: colors.textMuted }]}>
          {message.senderName} ({message.senderTenantName})
        </Text>
      ) : null}
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isCurrentUser ? colors.brand.primary : colors.cardBg,
            borderColor: colors.border,
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
    maxWidth: '80%',
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
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
