import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, Platform } from 'react-native';
import { Icon, useTheme } from '@edge/ui';
import { realTimeService } from '@edge/api';

export interface InMeetingMessage {
  id: string;
  senderName: string;
  content: string;
  timestamp: string;
}

interface InMeetingChatSidebarProps {
  meetingCode: string;
  currentUserName?: string;
  visible: boolean;
  onClose: () => void;
}

export const InMeetingChatSidebar: React.FC<InMeetingChatSidebarProps> = ({
  meetingCode,
  currentUserName = 'You',
  visible,
  onClose,
}) => {
  const { colors, isDark } = useTheme();
  const [messages, setMessages] = useState<InMeetingMessage[]>([]);
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    if (!visible || !meetingCode) return;

    const unsubChat = realTimeService.onReceiveMeetingChatMessage((msg) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}_${Math.random()}`,
          senderName: msg.senderName,
          content: msg.content,
          timestamp: msg.timestamp,
        },
      ]);
    });

    return () => {
      unsubChat();
    };
  }, [visible, meetingCode]);

  if (!visible) return null;

  const handleSend = () => {
    const trimmed = content.trim();
    if (trimmed.length === 0) return;

    const newMsg: InMeetingMessage = {
      id: `${Date.now()}_${Math.random()}`,
      senderName: currentUserName,
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    void realTimeService.broadcastMeetingChat(meetingCode, {
      senderName: currentUserName,
      content: trimmed,
      timestamp: newMsg.timestamp,
    });
    setContent('');
  };

  const handleKeyPress = (e: { nativeEvent: { key: string; shiftKey?: boolean; preventDefault?: () => void } }) => {
    if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
      if (Platform.OS === 'web' && typeof e.nativeEvent.preventDefault === 'function') {
        e.nativeEvent.preventDefault();
      }
      handleSend();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBg, borderLeftColor: colors.border }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerTitleRow}>
          <Icon name="message-square" size={16} color={colors.brand.primary} />
          <Text style={[styles.title, { color: colors.text }]}>In-Meeting Chat</Text>
        </View>
        <Pressable onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close chat">
          <Icon name="x" size={18} color={colors.textMuted} />
        </Pressable>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isSelf = item.senderName === currentUserName || item.senderName === 'You';
          return (
            <View
              style={[
                styles.msgItem,
                isSelf ? styles.selfMsgItem : styles.otherMsgItem,
              ]}
            >
              <Text style={[styles.msgSender, { color: colors.textMuted }]}>
                {item.senderName} • {item.timestamp}
              </Text>
              <View
                style={[
                  styles.msgBubble,
                  {
                    backgroundColor: isSelf
                      ? colors.brand.primary
                      : isDark
                        ? 'rgba(255,255,255,0.08)'
                        : '#F1F5F9',
                  },
                ]}
              >
                <Text style={[styles.msgContent, { color: isSelf ? '#FFFFFF' : colors.text }]}>
                  {item.content}
                </Text>
              </View>
            </View>
          );
        }}
        style={styles.msgList}
      />

      <View style={[styles.inputRow, { borderTopColor: colors.border, backgroundColor: colors.bg }]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Message all participants... (Enter to send)"
          placeholderTextColor={colors.textMuted}
          value={content}
          onChangeText={setContent}
          onKeyPress={handleKeyPress}
          multiline
        />
        <Pressable
          style={[
            styles.sendBtn,
            { backgroundColor: content.trim().length > 0 ? colors.brand.primary : colors.border },
          ]}
          onPress={handleSend}
          disabled={content.trim().length === 0}
        >
          <Icon name="send" size={14} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 320,
    height: '100%',
    borderLeftWidth: 1,
    display: 'flex',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  msgList: {
    flex: 1,
    padding: 12,
  },
  msgItem: {
    marginBottom: 10,
    maxWidth: '90%',
  },
  selfMsgItem: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMsgItem: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  msgSender: {
    fontSize: 10,
    marginBottom: 2,
  },
  msgBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  msgContent: {
    fontSize: 13,
    lineHeight: 18,
  },
  inputRow: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 13,
    maxHeight: 70,
    paddingVertical: 6,
    ...Platform.select({
      web: {
        outlineWidth: 0,
        outlineColor: 'transparent',
      },
    }),
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
