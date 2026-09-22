import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, Platform } from 'react-native';
import { Icon, useTheme } from '@edge/ui';

interface InMeetingMessage {
  id: string;
  senderName: string;
  content: string;
  timestamp: string;
}

interface InMeetingChatSidebarProps {
  visible: boolean;
  onClose: () => void;
}

export const InMeetingChatSidebar: React.FC<InMeetingChatSidebarProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const [messages, setMessages] = useState<InMeetingMessage[]>([]);
  const [content, setContent] = useState<string>('');

  if (!visible) return null;

  const handleSend = () => {
    if (content.trim().length === 0) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        senderName: 'You',
        content: content.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setContent('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, borderLeftColor: colors.border }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>In-Meeting Chat</Text>
        <Pressable onPress={onClose}>
          <Icon name="x" size={20} color={colors.text} />
        </Pressable>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.msgItem}>
            <Text style={[styles.msgSender, { color: colors.textMuted }]}>
              {item.senderName} • {item.timestamp}
            </Text>
            <Text style={[styles.msgContent, { color: colors.text }]}>{item.content}</Text>
          </View>
        )}
        style={styles.msgList}
      />

      <View style={[styles.inputRow, { borderTopColor: colors.border }]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Send a message to everyone..."
          placeholderTextColor={colors.textMuted}
          value={content}
          onChangeText={setContent}
        />
        <Pressable style={styles.sendBtn} onPress={handleSend}>
          <Icon name="send" size={16} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: '100%',
    borderLeftWidth: 1,
    display: 'flex',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  msgList: {
    flex: 1,
    padding: 12,
  },
  msgItem: {
    marginBottom: 10,
  },
  msgSender: {
    fontSize: 11,
  },
  msgContent: {
    fontSize: 13,
    marginTop: 2,
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
    paddingVertical: 6,
    ...Platform.select({
      web: {
        outlineWidth: 0,
        outlineColor: 'transparent',
      },
    }),
  },
  sendBtn: {
    backgroundColor: '#3B82F6',
    padding: 8,
    borderRadius: 6,
  },
});
