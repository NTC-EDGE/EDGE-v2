import React from "react";
import { StyleSheet, View, Image, ViewStyle, StyleProp } from "react-native";

const logoAsset = require("../../../../assets/logo.png");
const whiteLogoAsset = require("../../../../assets/white-ntc-logo.png");
const footerLogoAsset = require("../../../../assets/footer-logo.png");

interface NtcLogoProps {
  size?: "small" | "medium" | "large" | "xlarge";
  variant?: "light" | "dark" | "footer";
  showSubtext?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function NtcLogo({
  size = "medium",
  variant = "light",
  style,
}: NtcLogoProps) {
  const heightMap: Record<"small" | "medium" | "large" | "xlarge", number> = {
    small: 42,
    medium: 68,
    large: 136,
    xlarge: 164,
  };

  const height = heightMap[size];
  const width = height * 3.2;
  const asset =
    variant === "dark" || variant === "footer"
      ? footerLogoAsset
      : logoAsset;

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
