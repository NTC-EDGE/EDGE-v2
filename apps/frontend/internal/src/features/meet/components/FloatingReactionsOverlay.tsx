import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface FloatingReactionsOverlayProps {
  reactions: { id: string; emoji: string }[];
}

export const FloatingReactionsOverlay: React.FC<FloatingReactionsOverlayProps> = ({ reactions }) => {
  if (reactions.length === 0) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      {reactions.map((r, idx) => (
        <View key={r.id} style={[styles.floatingEmoji, { left: `${20 + (idx % 5) * 15}%` }]}>
          <Text style={styles.emojiText}>{r.emoji}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    top: 0,
    justifyContent: 'flex-end',
  },
  floatingEmoji: {
    position: 'absolute',
    bottom: 20,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  emojiText: {
    fontSize: 32,
  },
});
