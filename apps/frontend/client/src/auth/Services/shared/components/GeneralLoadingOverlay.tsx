import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Easing, Platform } from "react-native";
import { Icon, COLORS, TYPOGRAPHY } from "@edge/ui";

interface GeneralLoadingOverlayProps {
  visible: boolean;
  message?: string;
  subMessage?: string;
}

export function GeneralLoadingOverlay({
  visible,
  message = "Submitting general application...",
  subMessage,
}: GeneralLoadingOverlayProps) {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      spinValue.setValue(0);
      return;
    }

    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== "web",
      })
    );

    spinAnimation.start();

    return () => {
      spinAnimation.stop();
      spinValue.setValue(0);
    };
  }, [visible, spinValue]);

  if (!visible) return null;

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.88)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        padding: 20,
      }}
    >
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          paddingVertical: 28,
          paddingHorizontal: 32,
          alignItems: "center",
          shadowColor: "#0F2C59",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 10,
          borderWidth: 1,
          borderColor: "#E2E8F0",
          maxWidth: 380,
          width: "90%",
        }}
      >
        <Animated.View
          style={{
            width: 48,
            height: 48,
            justifyContent: "center",
            alignItems: "center",
            transform: [{ rotate: spin }],
          }}
        >
          <Icon name="loader" size={48} color={COLORS.brand[700]} />
        </Animated.View>
        <Text
          style={{
            fontFamily: TYPOGRAPHY.fonts.primary,
            fontSize: 16,
            fontWeight: "700",
            color: COLORS.neutral[800],
            marginTop: 16,
            textAlign: "center",
          }}
        >
          {message}
        </Text>
        {subMessage ? (
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 12.5,
              color: COLORS.neutral[500],
              marginTop: 6,
              textAlign: "center",
              lineHeight: 18,
            }}
          >
            {subMessage}
          </Text>
        ) : (
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 12.5,
              color: COLORS.neutral[500],
              marginTop: 6,
              textAlign: "center",
            }}
          >
            Please wait while we save and register your filing.
          </Text>
        )}
      </View>
    </View>
  );
}
