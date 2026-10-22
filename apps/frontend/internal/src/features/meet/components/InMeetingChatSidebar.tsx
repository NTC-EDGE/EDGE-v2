import React, { useState, useEffect, useRef } from 'react';
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
import { Button, ConfirmationModal, Icon, SHADOWS, useTheme } from '@edge/ui';
import { realTimeService } from '@edge/api';

const QUICK_REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '👏', '🎉'];

export interface InMeetingReaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface InMeetingMessage {
  id: string;
  senderName: string;
  content: string;
  timestamp: string;
  isEdited?: boolean;
  isUnsent?: boolean;
  reactions?: InMeetingReaction[];
}

interface InMeetingChatSidebarProps {
  meetingCode: string;
  currentUserName?: string;
  visible: boolean;
  onClose: () => void;
}

interface InMeetingMessageItemProps {
  item: InMeetingMessage;
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
    moreBtnRef.current?.measure((x, y, width, height, pageX, pageY) => {
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
    reactionBtnRef.current?.measure((x, y, width, height, pageX, pageY) => {
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
      style={[
        styles.msgItem,
        isSelf ? styles.selfMsgItem : styles.otherMsgItem,
      ]}
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

      <View
        style={[
          styles.bubbleRow,
          isSelf ? styles.bubbleRowSelf : styles.bubbleRowOther,
        ]}
      >
        {/* Action Triggers on Left for Self */}
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

        {/* Message Bubble Body */}
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

        {/* Action Triggers on Right for Others */}
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

      {/* Reaction Badges */}
      {item.reactions !== undefined && item.reactions.length > 0 && (
        <View
          style={[
            styles.reactionsRow,
            isSelf ? styles.reactionsRowSelf : styles.reactionsRowOther,
          ]}
        >
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
                <Text
                  style={[
                    styles.reactionCount,
                    { color: hasReacted ? '#2563EB' : colors.textMuted },
                  ]}
                >
                  {r.count}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Emoji Quick Picker Dropdown */}
      <Modal
        visible={pickerVisible}
        transparent
        animationType="none"
        onRequestClose={() => setPickerVisible(false)}
      >
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
              <Pressable
                key={emoji}
                style={styles.emojiBtn}
                onPress={() => handleSelectReaction(emoji)}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* 3-Dots Action Dropdown */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="none"
        onRequestClose={() => setMenuVisible(false)}
      >
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

      {/* Reusable Unsend Confirmation Modal */}
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
      setMessages((prev) => {
        if (msg.id !== undefined && prev.some((m) => m.id === msg.id)) {
          return prev;
        }
        return [
          ...prev,
          {
            id: msg.id ?? `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            senderName: msg.senderName,
            content: msg.content,
            timestamp: msg.timestamp,
            reactions: [],
          },
        ];
      });
    });

    const unsubEdited = realTimeService.onReceiveMeetingChatEdited(({ messageId, content: newContent }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, content: newContent, isEdited: true } : msg
        )
      );
    });

    const unsubUnsent = realTimeService.onReceiveMeetingChatUnsent(({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: 'This message was unsent', isUnsent: true }
            : msg
        )
      );
    });

    const unsubReaction = realTimeService.onReceiveMeetingChatReaction(({ messageId, emoji, userName }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== messageId) return msg;
          const reactions = msg.reactions !== undefined ? [...msg.reactions] : [];
          const existingIdx = reactions.findIndex((r) => r.emoji === emoji);
          if (existingIdx >= 0) {
            const existing = reactions[existingIdx];
            if (existing !== undefined) {
              const userIdx = existing.users.indexOf(userName);
              let newUsers = [...existing.users];
              if (userIdx >= 0) {
                newUsers = newUsers.filter((u) => u !== userName);
              } else {
                newUsers.push(userName);
              }
              if (newUsers.length === 0) {
                reactions.splice(existingIdx, 1);
              } else {
                reactions[existingIdx] = {
                  emoji,
                  count: newUsers.length,
                  users: newUsers,
                };
              }
            }
          } else {
            reactions.push({
              emoji,
              count: 1,
              users: [userName],
            });
          }
          return { ...msg, reactions };
        })
      );
    });

    return () => {
      unsubChat();
      unsubEdited();
      unsubUnsent();
      unsubReaction();
    };
  }, [visible, meetingCode]);

  if (!visible) return null;

  const handleSend = () => {
    const trimmed = content.trim();
    if (trimmed.length === 0) return;

    const messageId = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: InMeetingMessage = {
      id: messageId,
      senderName: currentUserName,
      content: trimmed,
      timestamp,
      reactions: [],
    };

    setMessages((prev) => [...prev, newMsg]);
    void realTimeService.broadcastMeetingChat(meetingCode, {
      id: messageId,
      senderName: currentUserName,
      content: trimmed,
      timestamp,
    });
    setContent('');
  };

  const handleEdit = (messageId: string, newContent: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, content: newContent, isEdited: true } : msg
      )
    );
    void realTimeService.broadcastMeetingChatEdited(meetingCode, { messageId, content: newContent });
  };

  const handleUnsend = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, content: 'This message was unsent', isUnsent: true } : msg
      )
    );
    void realTimeService.broadcastMeetingChatUnsent(meetingCode, { messageId });
  };

  const handleReact = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;
        const reactions = msg.reactions !== undefined ? [...msg.reactions] : [];
        const existingIdx = reactions.findIndex((r) => r.emoji === emoji);
        if (existingIdx >= 0) {
          const existing = reactions[existingIdx];
          if (existing !== undefined) {
            const userIdx = existing.users.indexOf(currentUserName);
            let newUsers = [...existing.users];
            if (userIdx >= 0) {
              newUsers = newUsers.filter((u) => u !== currentUserName);
            } else {
              newUsers.push(currentUserName);
            }
            if (newUsers.length === 0) {
              reactions.splice(existingIdx, 1);
            } else {
              reactions[existingIdx] = {
                emoji,
                count: newUsers.length,
                users: newUsers,
              };
            }
          }
        } else {
          reactions.push({
            emoji,
            count: 1,
            users: [currentUserName],
          });
        }
        return { ...msg, reactions };
      })
    );
    void realTimeService.broadcastMeetingChatReaction(meetingCode, { messageId, emoji, userName: currentUserName });
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
            <InMeetingMessageItem
              item={item}
              isSelf={isSelf}
              currentUserName={currentUserName}
              onEdit={handleEdit}
              onUnsend={handleUnsend}
              onReact={handleReact}
            />
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
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  msgBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 60,
  },
  unsentBubble: {
    opacity: 0.7,
    fontStyle: 'italic',
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
    ...Platform.select({
      web: {
        outlineWidth: 0,
      },
    }),
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
    gap: 2,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    borderWidth: 1,
  },
  reactionEmoji: {
    fontSize: 11,
  },
  reactionCount: {
    fontSize: 10,
    fontWeight: '700',
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
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
    zIndex: 99998,
  },
  emojiPickerCard: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 20,
    zIndex: 99999,
    ...Platform.select({
      web: {
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.2), 0 8px 10px -6px rgba(15, 23, 42, 0.1)',
      },
    }),
  },
  emojiBtn: {
    paddingHorizontal: 3,
    paddingVertical: 2,
    borderRadius: 6,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
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
    elevation: 20,
    zIndex: 99999,
    ...Platform.select({
      web: {
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.18), 0 8px 10px -6px rgba(15, 23, 42, 0.1)',
      },
    }),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  menuItemText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
