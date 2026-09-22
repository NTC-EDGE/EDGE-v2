import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Conversation } from '@edge/api';
import { Avatar, useTheme } from '@edge/ui';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (conversation: Conversation) => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  onSelect,
}) => {
  const { colors } = useTheme();

  const title = conversation.title ?? conversation.participants[0]?.fullName ?? 'Direct Chat';
  const subtitle = conversation.lastMessagePreview ?? 'No messages yet';
  const isRegional = conversation.scope === 'InterRegional';

  return (
    <Pressable
      style={[
        styles.container,
        {
          backgroundColor: isSelected ? colors.brand.primary + '15' : 'transparent',
          borderBottomColor: colors.border,
        },
      ]}
      onPress={() => onSelect(conversation)}
    >
      <Avatar name={title} size="md" />
      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          {isRegional ? (
            <View style={[styles.badge, { backgroundColor: colors.brand.accent + '20' }]}>
              <Text style={[styles.badgeText, { color: colors.brand.accent }]}>Inter-Region</Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
    </Pressable>
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
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
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
});
