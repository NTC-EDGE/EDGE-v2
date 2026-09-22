import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable, Platform } from 'react-native';
import { Icon, useTheme } from '@edge/ui';

interface MessageInputBarProps {
  onSendMessage: (content: string) => Promise<boolean>;
  isSending: boolean;
}

export const MessageInputBar: React.FC<MessageInputBarProps> = ({ onSendMessage, isSending }) => {
  const { colors } = useTheme();
  const [content, setContent] = useState<string>('');
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const handleSend = async () => {
    const trimmed = content.trim();
    if (trimmed.length === 0 || isSending) return;
    const success = await onSendMessage(trimmed);
    if (success) {
      setContent('');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBg, borderTopColor: colors.border }]}>
      <View
        style={[
          styles.inputPill,
          {
            backgroundColor: colors.bg,
            borderColor: isFocused ? colors.brand.primary : colors.border,
          },
        ]}
      >
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Type your message..."
          placeholderTextColor={colors.textMuted}
          value={content}
          onChangeText={setContent}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline
          maxLength={2000}
        />
        <Pressable
          style={({ pressed }) => [
            styles.sendButton,
            {
              backgroundColor: content.trim().length > 0 ? colors.brand.primary : colors.border,
            },
            pressed && { opacity: 0.8 },
          ]}
          onPress={() => void handleSend()}
          disabled={content.trim().length === 0 || isSending}
          accessibilityLabel="Send message"
        >
          <Icon
            name="send"
            size={16}
            color={content.trim().length > 0 ? '#FFFFFF' : colors.textMuted}
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    width: '100%',
  },
  inputPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 4,
    minHeight: 48,
  },
  input: {
    flex: 1,
    maxHeight: 90,
    fontSize: 14,
    paddingVertical: 6,
    ...Platform.select({
      web: {
        outlineWidth: 0,
        outlineColor: 'transparent',
      },
    }),
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
