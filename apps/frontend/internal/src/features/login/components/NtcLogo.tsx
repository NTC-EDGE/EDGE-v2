import React from "react";
import { StyleSheet, View, Image, ViewStyle, StyleProp } from "react-native";
import { useTheme } from "@edge/ui";

const logoAsset = require("../../../../assets/logo.png");
const footerLogoAsset = require("../../../../assets/footer-logo.png");

interface NtcLogoProps {
  size?: "small" | "medium" | "large" | "xlarge";
  variant?: "light" | "dark" | "footer" | "auto";
  showSubtext?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function NtcLogo({
  size = "medium",
  variant = "auto",
  style,
}: NtcLogoProps) {
  const { isDark } = useTheme();
  const heightMap: Record<"small" | "medium" | "large" | "xlarge", number> = {
    small: 42,
    medium: 68,
    large: 136,
    xlarge: 164,
  };

  const height = heightMap[size];
  const width = height * 3.2;

  // 'dark' or 'footer' means dark background (white EDGE text: footer-logo.png)
  // 'light' means light background (dark blue EDGE text: logo.png)
  // 'auto' automatically resolves from active theme / device color scheme
  const resolvedVariant =
    variant === "auto" ? (isDark ? "dark" : "light") : variant;

  const asset =
    resolvedVariant === "dark" || resolvedVariant === "footer"
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
