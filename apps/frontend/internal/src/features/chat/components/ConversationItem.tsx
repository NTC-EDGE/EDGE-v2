import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, Platform } from 'react-native';
import { Conversation } from '@edge/api';
import { Avatar, Icon, useTheme } from '@edge/ui';

interface ConversationItemProps {
  conversation: Conversation & { isArchived?: boolean };
  isSelected: boolean;
  onSelect: (conversation: Conversation) => void;
  onMarkAsRead?: (conversationId: string) => void;
  onMarkAsUnread?: (conversationId: string) => void;
  onArchive?: (conversationId: string) => void;
  onUnarchive?: (conversationId: string) => void;
  onDelete?: (conversationId: string) => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  onSelect,
  onMarkAsRead,
  onMarkAsUnread,
  onArchive,
  onUnarchive,
  onDelete,
}) => {
  const { colors, isDark } = useTheme();
  const [menuVisible, setMenuVisible] = useState<boolean>(false);

  const title = conversation.title ?? conversation.participants[0]?.fullName ?? 'Direct Chat';
  const subtitle = conversation.lastMessagePreview ?? 'No messages yet';
  const isRegional = conversation.scope === 'InterRegional';
  const hasUnread = conversation.unreadCount > 0;

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleAction = (action: 'read' | 'unread' | 'archive' | 'unarchive' | 'delete') => {
    setMenuVisible(false);
    if (action === 'read') onMarkAsRead?.(conversation.id);
    if (action === 'unread') onMarkAsUnread?.(conversation.id);
    if (action === 'archive') onArchive?.(conversation.id);
    if (action === 'unarchive') onUnarchive?.(conversation.id);
    if (action === 'delete') onDelete?.(conversation.id);
  };

  return (
    <View style={{ position: 'relative' }}>
      <Pressable
        style={[
          styles.container,
          {
            backgroundColor: isSelected
              ? isDark
                ? 'rgba(59, 130, 246, 0.2)'
                : '#EFF6FF'
              : hasUnread
                ? isDark
                  ? 'rgba(30, 58, 138, 0.2)'
                  : '#F0FDF4'
                : 'transparent',
            borderBottomColor: colors.border,
          },
        ]}
        onPress={() => onSelect(conversation)}
      >
        <View style={styles.avatarWrapper}>
          <Avatar name={title} size="md" />
          {hasUnread && <View style={styles.unreadDot} />}
        </View>
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                {
                  color: colors.text,
                  fontWeight: hasUnread ? '700' : '500',
                },
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
            <View style={styles.topRightRow}>
              {conversation.lastMessageAt && (
                <Text style={[styles.timestamp, { color: colors.textMuted }]}>
                  {formatTime(conversation.lastMessageAt)}
                </Text>
              )}
              <Pressable
                style={styles.moreBtn}
                onPress={(e) => {
                  e.stopPropagation?.();
                  setMenuVisible(true);
                }}
                accessibilityLabel="Conversation actions"
              >
                <Icon name="more-vertical" size={14} color={colors.textMuted} />
              </Pressable>
            </View>
          </View>
          <View style={styles.bottomRow}>
            <Text
              style={[
                styles.subtitle,
                {
                  color: hasUnread ? colors.text : colors.textMuted,
                  fontWeight: hasUnread ? '600' : '400',
                },
              ]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
            <View style={styles.badgeGroup}>
              {isRegional && (
                <View style={[styles.badge, { backgroundColor: colors.brand.accent + '20' }]}>
                  <Text style={[styles.badgeText, { color: colors.brand.accent }]}>Inter-Region</Text>
                </View>
              )}
              {hasUnread && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>
                    {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Pressable>

      {/* Action Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View
            style={[
              styles.menuCard,
              {
                backgroundColor: isDark ? colors.cardBg : '#FFFFFF',
                borderColor: colors.border,
              },
            ]}
          >
            {hasUnread ? (
              <Pressable style={styles.menuItem} onPress={() => handleAction('read')}>
                <Icon name="check" size={14} color={colors.text} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Mark as Read</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.menuItem} onPress={() => handleAction('unread')}>
                <Icon name="mail" size={14} color={colors.text} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Mark as Unread</Text>
              </Pressable>
            )}

            {conversation.isArchived ? (
              <Pressable style={styles.menuItem} onPress={() => handleAction('unarchive')}>
                <Icon name="inbox" size={14} color={colors.text} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Unarchive</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.menuItem} onPress={() => handleAction('archive')}>
                <Icon name="archive" size={14} color={colors.text} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Archive</Text>
              </Pressable>
            )}

            <Pressable style={styles.menuItem} onPress={() => handleAction('delete')}>
              <Icon name="trash-2" size={14} color="#EF4444" />
              <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Delete Conversation</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontSize: 14,
    flex: 1,
  },
  topRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timestamp: {
    fontSize: 11,
  },
  moreBtn: {
    padding: 4,
    borderRadius: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    gap: 8,
  },
  subtitle: {
    fontSize: 12,
    flex: 1,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuCard: {
    width: 200,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 6,
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  menuItemText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
