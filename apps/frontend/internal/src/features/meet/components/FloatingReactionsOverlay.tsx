import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

interface FloatingReactionItemProps {
  id: string;
  emoji: string;
  onComplete?: (id: string) => void;
}

const FloatingEmojiItem: React.FC<FloatingReactionItemProps> = ({ id, emoji, onComplete }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.4)).current;
  const randomDrift = useRef((Math.random() - 0.5) * 36).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1.2,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -200,
        duration: 2500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(1500),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      onComplete?.(id);
    });
  }, [id, onComplete, opacity, scale, translateY]);

  return (
    <Animated.View
      style={[
        styles.floatingItem,
        {
          transform: [
            { translateY },
            { translateX: randomDrift },
            { scale },
          ],
          opacity,
        },
      ]}
    >
      <View style={styles.bubble}>
        <Text style={styles.emojiText}>{emoji}</Text>
      </View>
    </Animated.View>
  );
};

interface FloatingReactionsOverlayProps {
  reactions: { id: string; emoji: string }[];
  onReactionComplete?: (id: string) => void;
}

export const FloatingReactionsOverlay: React.FC<FloatingReactionsOverlayProps> = ({
  reactions,
  onReactionComplete,
}) => {
  if (reactions.length === 0) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      <View style={styles.reactionAnchor}>
        {reactions.map((r) => (
          <FloatingEmojiItem
            key={r.id}
            id={r.id}
            emoji={r.emoji}
            onComplete={onReactionComplete}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 85,
    left: 0,
    right: 0,
    top: 0,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    zIndex: 9999,
  },
  reactionAnchor: {
    position: 'absolute',
    bottom: 10,
    left: 28,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingItem: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  bubble: {
    padding: 8,
    borderRadius: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emojiText: {
    fontSize: 34,
  },
});
