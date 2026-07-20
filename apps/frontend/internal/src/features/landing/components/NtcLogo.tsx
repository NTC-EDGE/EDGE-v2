import React from "react";
import { StyleSheet, View, Image, ViewStyle, StyleProp } from "react-native";

const logoAsset = require("../../../../assets/logo.png");
const whiteLogoAsset = require("../../../../assets/white-ntc-logo.png");

interface NtcLogoProps {
  size?: "small" | "medium" | "large";
  variant?: "light" | "dark";
  showSubtext?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function NtcLogo({
  size = "medium",
  variant = "light",
  style,
}: NtcLogoProps) {
  const heightMap: Record<"small" | "medium" | "large", number> = {
    small: 32,
    medium: 52,
    large: 76,
  };

  const height = heightMap[size];
  const width = height * 2.75;
  const asset = variant === "dark" ? whiteLogoAsset : logoAsset;

  return (
    <View style={[styles.container, { height, width }, style]}>
      <Image
        source={asset}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});


