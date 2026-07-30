import React from "react";
import { Platform } from "react-native";
import { SettingsScreen as WebScreen } from "./SettingsScreen.web";
import { SettingsScreen as NativeScreen } from "./SettingsScreen.native";
import { SettingsScreen as DesktopScreen } from "./SettingsScreen.desktop";

export function SettingsScreen(): React.ReactElement {
  if (Platform.OS === "web") {
    return <WebScreen />;
  }

  if (Platform.OS === "macos" || Platform.OS === "windows") {
    return <DesktopScreen />;
  }

  return <NativeScreen />;
}
