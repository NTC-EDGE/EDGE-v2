import React from "react";
import { Platform } from "react-native";
import { InternalLoginScreen as WebScreen } from "./InternalLoginScreen.web";
import { InternalLoginScreen as NativeScreen } from "./InternalLoginScreen.native";
import { InternalLoginScreen as DesktopScreen } from "./InternalLoginScreen.desktop";

export function InternalLoginScreen() {
  if (Platform.OS === "web") {
    return <WebScreen />;
  }

  if (Platform.OS === "macos" || Platform.OS === "windows") {
    return <DesktopScreen />;
  }

  return <NativeScreen />;
}
