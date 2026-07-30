import React from "react";
import { Platform } from "react-native";
import { AdminSettingsScreen as WebScreen } from "./AdminSettingsScreen.web";
import { AdminSettingsScreen as NativeScreen } from "./AdminSettingsScreen.native";
import { AdminSettingsScreen as DesktopScreen } from "./AdminSettingsScreen.desktop";

export function AdminSettingsScreen(): React.ReactElement {
  if (Platform.OS === "web") {
    return <WebScreen />;
  }

  if (Platform.OS === "macos" || Platform.OS === "windows") {
    return <DesktopScreen />;
  }

  return <NativeScreen />;
}
