import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { Button, ConfirmationModal, Icon, SHADOWS, useTheme } from '@edge/ui';
import { ExtendedChatMessage } from '../hooks/useChatMessages';

const QUICK_REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '👏'];

interface MessageBubbleProps {
  message: ExtendedChatMessage;
  isCurrentUser: boolean;
  currentUserName?: string;
  onRetry?: (message: ExtendedChatMessage) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onUnsend?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
  currentUserName = 'You',
  onRetry,
  onEdit,
  onUnsend,
  onReact,
}) => {
  const { colors, isDark } = useTheme();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editText, setEditText] = useState<string>(message.content);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [pickerVisible, setPickerVisible] = useState<boolean>(false);
  const [showUnsendModal, setShowUnsendModal] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const moreBtnRef = useRef<View>(null);
  const reactionBtnRef = useRef<View>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleOpenMenu = () => {
    moreBtnRef.current?.measure((x, y, width, height, pageX, pageY) => {
      const menuWidth = 170;
      const windowWidth = Dimensions.get('window').width;
      const windowHeight = Dimensions.get('window').height;
      let leftPos = (pageX !== undefined ? pageX : 0) + width - menuWidth;
      if (leftPos < 10) leftPos = 10;
      if (leftPos + menuWidth > windowWidth - 10) leftPos = windowWidth - menuWidth - 10;
      let topPos = (pageY !== undefined ? pageY : 0) + height + 4;
      if (topPos + 150 > windowHeight - 10) {
        topPos = Math.max(10, (pageY !== undefined ? pageY : 0) - 150);
      }
      setPopoverPos({ top: topPos, left: leftPos });
      setMenuVisible(true);
    });
  };

  const handleOpenPicker = () => {
    reactionBtnRef.current?.measure((x, y, width, height, pageX, pageY) => {
      const pickerWidth = 260;
      const windowWidth = Dimensions.get('window').width;
      let leftPos = (pageX !== undefined ? pageX : 0) + width / 2 - pickerWidth / 2;
      if (leftPos < 10) leftPos = 10;
      if (leftPos + pickerWidth > windowWidth - 10) leftPos = windowWidth - pickerWidth - 10;
      let topPos = (pageY !== undefined ? pageY : 0) - 48;
      if (topPos < 10) {
        topPos = (pageY !== undefined ? pageY : 0) + height + 6;
      }
      setPopoverPos({ top: topPos, left: leftPos });
      setPickerVisible(true);
    });
  };

  const handleSaveEdit = () => {
    const trimmed = editText.trim();
    if (trimmed.length === 0) return;
    setIsEditing(false);
    onEdit?.(message.id, trimmed);
  };

  const handleCancelEdit = () => {
    setEditText(message.content);
    setIsEditing(false);
  };

  const handleSelectReaction = (emoji: string) => {
    setPickerVisible(false);
    setMenuVisible(false);
    onReact?.(message.id, emoji);
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

  const showActionTriggers = isHovered || menuVisible || pickerVisible;

  return (
    <View
      style={[
        styles.container,
        isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer,
      ]}
      {...Platform.select({
        web: {
          onMouseEnter: () => setIsHovered(true),
          onMouseLeave: () => setIsHovered(false),
        },
      })}
    >
      {!isCurrentUser ? (
        <Text style={[styles.senderName, { color: colors.textMuted }]}>
          {message.senderName}{message.senderTenantName ? ` (${message.senderTenantName})` : ''}
        </Text>
      ) : null}

      <View
        style={[
          styles.bubbleWrapperRow,
          isCurrentUser ? styles.bubbleWrapperSelf : styles.bubbleWrapperOther,
        ]}
      >
        {/* Action Triggers (Left of self bubble, right of other bubble) */}
        {isCurrentUser && (
          <View style={[styles.actionTriggerBar, !showActionTriggers && styles.actionTriggerBarHidden]}>
            <View ref={reactionBtnRef} collapsable={false}>
              <Pressable
                style={[styles.actionIconBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' }]}
                onPress={handleOpenPicker}
                accessibilityLabel="React with emoji"
              >
                <Icon name="smile" size={13} color={colors.textMuted} />
              </Pressable>
            </View>
            <View ref={moreBtnRef} collapsable={false}>
              <Pressable
                style={[styles.actionIconBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' }]}
                onPress={handleOpenMenu}
                accessibilityLabel="Message actions"
              >
                <Icon name="more-vertical" size={13} color={colors.textMuted} />
              </Pressable>
            </View>
          </View>
        )}

        {/* Message Bubble Body */}
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
          {isEditing ? (
            <View style={styles.editInputContainer}>
              <TextInput
                style={[styles.editInput, { color: isCurrentUser ? '#FFFFFF' : colors.text }]}
                value={editText}
                onChangeText={setEditText}
                multiline
                autoFocus
              />
              <View style={styles.editActionRow}>
                <Pressable style={styles.editBtnCancel} onPress={handleCancelEdit}>
                  <Text style={styles.editBtnCancelText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.editBtnSave} onPress={handleSaveEdit}>
                  <Text style={styles.editBtnSaveText}>Save</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Text
              style={[
                styles.messageText,
                { color: isCurrentUser ? '#FFFFFF' : colors.text },
              ]}
            >
              {message.content}
            </Text>
          )}

          <View style={styles.metaRow}>
            {message.isEdited && (
              <Text
                style={[
                  styles.editedTag,
                  { color: isCurrentUser ? 'rgba(255,255,255,0.6)' : colors.textMuted },
                ]}
              >
                (edited)
              </Text>
            )}
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

        {/* Action Triggers for other user */}
        {!isCurrentUser && (
          <View style={[styles.actionTriggerBar, !showActionTriggers && styles.actionTriggerBarHidden]}>
            <View ref={reactionBtnRef} collapsable={false}>
              <Pressable
                style={[styles.actionIconBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' }]}
                onPress={handleOpenPicker}
                accessibilityLabel="React with emoji"
              >
                <Icon name="smile" size={13} color={colors.textMuted} />
              </Pressable>
            </View>
            <View ref={moreBtnRef} collapsable={false}>
              <Pressable
                style={[styles.actionIconBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' }]}
                onPress={handleOpenMenu}
                accessibilityLabel="Message actions"
              >
                <Icon name="more-vertical" size={13} color={colors.textMuted} />
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {/* Reaction Badges */}
      {message.reactions && message.reactions.length > 0 && (
        <View
          style={[
            styles.reactionsRow,
            isCurrentUser ? styles.reactionsRowSelf : styles.reactionsRowOther,
          ]}
        >
          {message.reactions.map((r) => {
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
                onPress={() => onReact?.(message.id, r.emoji)}
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
              <Icon name="smile" size={14} color={colors.text} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Add Reaction</Text>
            </Pressable>

            {isCurrentUser && (
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  setIsEditing(true);
                  setEditText(message.content);
                }}
              >
                <Icon name="edit-2" size={14} color={colors.text} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Edit Message</Text>
              </Pressable>
            )}

            {isCurrentUser && (
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  setShowUnsendModal(true);
                }}
              >
                <Icon name="trash-2" size={14} color="#EF4444" />
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
        subtitle="This will permanently remove the message for everyone in this conversation."
        variant="danger"
        confirmText="Unsend"
        cancelText="Cancel"
        onCancel={() => setShowUnsendModal(false)}
        onConfirm={() => {
          setShowUnsendModal(false);
          onUnsend?.(message.id);
        }}
      />
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
  bubbleWrapperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bubbleWrapperSelf: {
    justifyContent: 'flex-end',
  },
  bubbleWrapperOther: {
    justifyContent: 'flex-start',
  },
  actionTriggerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
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
  editedTag: {
    fontSize: 10,
    fontStyle: 'italic',
    marginRight: 2,
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
  reactionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
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
    fontSize: 12,
  },
  reactionCount: {
    fontSize: 11,
    fontWeight: '700',
  },
  editInputContainer: {
    width: '100%',
    minWidth: 180,
  },
  editInput: {
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: 4,
    ...Platform.select({
      web: {
        outlineWidth: 0,
      },
    }),
  },
  editActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 6,
  },
  editBtnCancel: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  editBtnCancelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editBtnSave: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  editBtnSaveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F2C59',
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
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 24,
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
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  emojiText: {
    fontSize: 18,
  },
  menuCard: {
    position: 'absolute',
    width: 170,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 6,
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
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  menuItemText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
