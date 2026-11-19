import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  Platform,
  Modal,
  Dimensions,
} from 'react-native';
import { ConfirmationModal, EmptyState, Icon, SHADOWS, useTheme } from '@edge/ui';
import { InMeetingChatMessage, InMeetingReactionItem } from '../hooks/useMeetingRoom';

const QUICK_REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '👏', '🎉'];

export type InMeetingReaction = InMeetingReactionItem;
export type InMeetingMessage = InMeetingChatMessage;

interface InMeetingChatSidebarProps {
  meetingCode: string;
  currentUserName?: string;
  visible: boolean;
  messages: InMeetingChatMessage[];
  onSendMessage: (content: string) => void;
  onEditMessage: (messageId: string, newContent: string) => void;
  onUnsendMessage: (messageId: string) => void;
  onReactMessage: (messageId: string, emoji: string) => void;
  onClose: () => void;
}

interface InMeetingMessageItemProps {
  item: InMeetingChatMessage;
  isSelf: boolean;
  currentUserName: string;
  onEdit: (messageId: string, newContent: string) => void;
  onUnsend: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
}

const InMeetingMessageItem: React.FC<InMeetingMessageItemProps> = ({
  item,
  isSelf,
  currentUserName,
  onEdit,
  onUnsend,
  onReact,
}) => {
  const { colors, isDark } = useTheme();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editText, setEditText] = useState<string>(item.content);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [pickerVisible, setPickerVisible] = useState<boolean>(false);
  const [showUnsendModal, setShowUnsendModal] = useState<boolean>(false);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const moreBtnRef = useRef<View>(null);
  const reactionBtnRef = useRef<View>(null);

  const handleOpenMenu = () => {
    moreBtnRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
      const menuWidth = 150;
      const windowWidth = Dimensions.get('window').width;
      const windowHeight = Dimensions.get('window').height;
      let leftPos = (pageX !== undefined ? pageX : 0) + width - menuWidth;
      if (leftPos < 10) leftPos = 10;
      if (leftPos + menuWidth > windowWidth - 10) leftPos = windowWidth - menuWidth - 10;
      let topPos = (pageY !== undefined ? pageY : 0) + height + 4;
      if (topPos + 140 > windowHeight - 10) {
        topPos = Math.max(10, (pageY !== undefined ? pageY : 0) - 140);
      }
      setPopoverPos({ top: topPos, left: leftPos });
      setMenuVisible(true);
    });
  };

  const handleOpenPicker = () => {
    reactionBtnRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
      const pickerWidth = 230;
      const windowWidth = Dimensions.get('window').width;
      let leftPos = (pageX !== undefined ? pageX : 0) + width / 2 - pickerWidth / 2;
      if (leftPos < 10) leftPos = 10;
      if (leftPos + pickerWidth > windowWidth - 10) leftPos = windowWidth - pickerWidth - 10;
      let topPos = (pageY !== undefined ? pageY : 0) - 44;
      if (topPos < 10) {
        topPos = (pageY !== undefined ? pageY : 0) + height + 4;
      }
      setPopoverPos({ top: topPos, left: leftPos });
      setPickerVisible(true);
    });
  };

  const handleSaveEdit = () => {
    const trimmed = editText.trim();
    if (trimmed.length === 0) return;
    setIsEditing(false);
    onEdit(item.id, trimmed);
  };

  const handleCancelEdit = () => {
    setEditText(item.content);
    setIsEditing(false);
  };

  const handleSelectReaction = (emoji: string) => {
    setPickerVisible(false);
    setMenuVisible(false);
    onReact(item.id, emoji);
  };

  const showActions = isHovered || menuVisible || pickerVisible;

  return (
    <View
      style={[styles.msgItem, isSelf ? styles.selfMsgItem : styles.otherMsgItem]}
      {...Platform.select({
        web: {
          onMouseEnter: () => setIsHovered(true),
          onMouseLeave: () => setIsHovered(false),
        },
      })}
    >
      <Text style={[styles.msgSender, { color: colors.textMuted }]}>
        {item.senderName} • {item.timestamp}
        {item.isEdited && !item.isUnsent ? ' (edited)' : ''}
      </Text>

      <View style={[styles.bubbleRow, isSelf ? styles.bubbleRowSelf : styles.bubbleRowOther]}>
        {isSelf && !item.isUnsent && (
          <View style={[styles.actionTriggerBar, !showActions && styles.actionTriggerBarHidden]}>
            <View ref={reactionBtnRef} collapsable={false}>
              <Pressable
                style={[styles.actionIconBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0' }]}
                onPress={handleOpenPicker}
                accessibilityLabel="React with emoji"
              >
                <Icon name="smile" size={12} color={colors.textMuted} />
              </Pressable>
            </View>
            <View ref={moreBtnRef} collapsable={false}>
              <Pressable
                style={[styles.actionIconBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0' }]}
                onPress={handleOpenMenu}
                accessibilityLabel="Message options"
              >
                <Icon name="more-vertical" size={12} color={colors.textMuted} />
              </Pressable>
            </View>
          </View>
        )}

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
            item.isUnsent && styles.unsentBubble,
          ]}
        >
          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                style={[styles.editInput, { color: isSelf ? '#FFFFFF' : colors.text }]}
                value={editText}
                onChangeText={setEditText}
                multiline
                autoFocus
              />
              <View style={styles.editActionRow}>
                <Pressable style={styles.editCancelBtn} onPress={handleCancelEdit}>
                  <Text style={styles.editCancelText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.editSaveBtn} onPress={handleSaveEdit}>
                  <Text style={styles.editSaveText}>Save</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Text
              style={[
                styles.msgContent,
                { color: isSelf ? '#FFFFFF' : colors.text },
                item.isUnsent && [styles.unsentText, { color: isSelf ? 'rgba(255,255,255,0.7)' : colors.textMuted }],
              ]}
            >
              {item.content}
            </Text>
          )}
        </View>

        {!isSelf && !item.isUnsent && (
          <View style={[styles.actionTriggerBar, !showActions && styles.actionTriggerBarHidden]}>
            <View ref={reactionBtnRef} collapsable={false}>
              <Pressable
                style={[styles.actionIconBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0' }]}
                onPress={handleOpenPicker}
                accessibilityLabel="React with emoji"
              >
                <Icon name="smile" size={12} color={colors.textMuted} />
              </Pressable>
            </View>
            <View ref={moreBtnRef} collapsable={false}>
              <Pressable
                style={[styles.actionIconBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0' }]}
                onPress={handleOpenMenu}
                accessibilityLabel="Message options"
              >
                <Icon name="more-vertical" size={12} color={colors.textMuted} />
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {item.reactions !== undefined && item.reactions.length > 0 && (
        <View style={[styles.reactionsRow, isSelf ? styles.reactionsRowSelf : styles.reactionsRowOther]}>
          {item.reactions.map((r) => {
            const hasReacted = r.users.includes(currentUserName);
            return (
              <Pressable
                key={r.emoji}
                style={[
                  styles.reactionChip,
                  {
                    backgroundColor: hasReacted
                      ? isDark
                        ? 'rgba(59, 130, 246, 0.3)'
                        : '#DBEAFE'
                      : isDark
                        ? 'rgba(255, 255, 255, 0.08)'
                        : '#F1F5F9',
                    borderColor: hasReacted ? '#3B82F6' : colors.border,
                  },
                ]}
                onPress={() => onReact(item.id, r.emoji)}
              >
                <Text style={styles.reactionEmoji}>{r.emoji}</Text>
                <Text style={[styles.reactionCount, { color: hasReacted ? '#2563EB' : colors.textMuted }]}>
                  {r.count}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <Modal visible={pickerVisible} transparent animationType="none" onRequestClose={() => setPickerVisible(false)}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={(e) => {
            e.stopPropagation?.();
            setPickerVisible(false);
          }}
        >
          <View
            style={[
              styles.emojiPickerCard,
              {
                top: popoverPos.top,
                left: popoverPos.left,
                backgroundColor: isDark ? colors.cardBg : '#FFFFFF',
                borderColor: colors.border,
              },
              SHADOWS.modal,
            ]}
          >
            {QUICK_REACTION_EMOJIS.map((emoji) => (
              <Pressable key={emoji} style={styles.emojiBtn} onPress={() => handleSelectReaction(emoji)}>
                <Text style={styles.emojiText}>{emoji}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Modal visible={menuVisible} transparent animationType="none" onRequestClose={() => setMenuVisible(false)}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={(e) => {
            e.stopPropagation?.();
            setMenuVisible(false);
          }}
        >
          <View
            style={[
              styles.menuCard,
              {
                top: popoverPos.top,
                left: popoverPos.left,
                backgroundColor: isDark ? colors.cardBg : '#FFFFFF',
                borderColor: colors.border,
              },
              SHADOWS.modal,
            ]}
          >
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                handleOpenPicker();
              }}
            >
              <Icon name="smile" size={13} color={colors.text} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Add Reaction</Text>
            </Pressable>

            {isSelf && (
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  setIsEditing(true);
                  setEditText(item.content);
                }}
              >
                <Icon name="edit-2" size={13} color={colors.text} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Edit Message</Text>
              </Pressable>
            )}

            {isSelf && (
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  setShowUnsendModal(true);
                }}
              >
                <Icon name="trash-2" size={13} color="#EF4444" />
                <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Unsend Message</Text>
              </Pressable>
            )}
          </View>
        </Pressable>
      </Modal>

      <ConfirmationModal
        visible={showUnsendModal}
        title="Unsend Message?"
        subtitle="This will remove the message for all participants in this meeting."
        variant="danger"
        confirmText="Unsend"
        cancelText="Cancel"
        onCancel={() => setShowUnsendModal(false)}
        onConfirm={() => {
          setShowUnsendModal(false);
          onUnsend(item.id);
        }}
      />
    </View>
  );
};

export const InMeetingChatSidebar: React.FC<InMeetingChatSidebarProps> = ({
  currentUserName = 'You',
  visible,
  messages,
  onSendMessage,
  onEditMessage,
  onUnsendMessage,
  onReactMessage,
  onClose,
}) => {
  const { colors } = useTheme();
  const [content, setContent] = useState<string>('');

  if (!visible) return null;

  const handleSend = () => {
    const trimmed = content.trim();
    if (trimmed.length === 0) return;
    onSendMessage(trimmed);
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
          <Text style={[styles.title, { color: colors.text }]}>In-Call Messages</Text>
        </View>
        <Pressable onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close chat">
          <Icon name="x" size={18} color={colors.textMuted} />
        </Pressable>
      </View>

      {messages.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            title="No messages yet"
            description="Messages sent here are shared with everyone in this live meeting."
          />
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isSelf = item.senderName === currentUserName || item.senderName === 'You';
            return (
              <InMeetingMessageItem
                item={item}
                isSelf={isSelf}
                currentUserName={currentUserName}
                onEdit={onEditMessage}
                onUnsend={onUnsendMessage}
                onReact={onReactMessage}
              />
            );
          }}
          style={styles.msgList}
        />
      )}

      <View style={[styles.inputRow, { borderTopColor: colors.border, backgroundColor: colors.bg }]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Message everyone..."
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
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  msgList: {
    flex: 1,
    padding: 12,
  },
  msgItem: {
    marginBottom: 10,
    maxWidth: '92%',
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
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bubbleRowSelf: {
    justifyContent: 'flex-end',
  },
  bubbleRowOther: {
    justifyContent: 'flex-start',
  },
  actionTriggerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  actionTriggerBarHidden: {
    opacity: 0,
    ...Platform.select({
      web: {
        pointerEvents: 'none',
      },
    }),
  },
  actionIconBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 60,
  },
  unsentBubble: {
    opacity: 0.7,
  },
  unsentText: {
    fontStyle: 'italic',
  },
  msgContent: {
    fontSize: 13,
    lineHeight: 18,
  },
  editContainer: {
    minWidth: 140,
  },
  editInput: {
    fontSize: 13,
    lineHeight: 18,
    paddingVertical: 2,
  },
  editActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
    marginTop: 4,
  },
  editCancelBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  editCancelText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editSaveBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  editSaveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F2C59',
  },
  reactionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    marginTop: 3,
  },
  reactionsRowSelf: {
    justifyContent: 'flex-end',
  },
  reactionsRowOther: {
    justifyContent: 'flex-start',
  },
  reactionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  reactionEmoji: {
    fontSize: 11,
  },
  reactionCount: {
    fontSize: 10,
    fontWeight: '700',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
  },
  emojiPickerCard: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  emojiBtn: {
    padding: 4,
  },
  emojiText: {
    fontSize: 16,
  },
  menuCard: {
    position: 'absolute',
    width: 150,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  menuItemText: {
    fontSize: 12,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 13,
    maxHeight: 90,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
