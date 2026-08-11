import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { styles } from "./CategoryGrid.styles";

export function CategorySkeletonGrid() {
  const animatedValue = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, [animatedValue]);

  const skeletonItems = [1, 2, 3, 4, 5, 6];

  return (
    <View style={styles.gridContainer}>
      {skeletonItems.map((item) => (
        <View
          key={item}
          style={[
            styles.categoryCard,
            {
              backgroundColor: "#F1F5F9",
              borderColor: "#E2E8F0",
              borderWidth: 1,
              opacity: 1,
            },
          ]}
        >
          {/* Skeleton Icon Circle */}
          <Animated.View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "#CBD5E1",
              marginBottom: 12,
              opacity: animatedValue,
            }}
          />

          {/* Skeleton Title Bar */}
          <Animated.View
            style={{
              width: "70%",
              height: 16,
              borderRadius: 4,
              backgroundColor: "#CBD5E1",
              marginBottom: 8,
              opacity: animatedValue,
            }}
          />

          {/* Skeleton Subtitle Bar */}
          <Animated.View
            style={{
              width: "45%",
              height: 12,
              borderRadius: 4,
              backgroundColor: "#E2E8F0",
              opacity: animatedValue,
            }}
          />
        </View>
      ))}
    </View>
  );
}
