import React from "react";
import { Platform } from "react-native";
import { DashboardScreen as WebScreen } from "./DashboardScreen.web";
import { DashboardScreen as NativeScreen } from "./DashboardScreen.native";
import { DashboardScreen as DesktopScreen } from "./DashboardScreen.desktop";

export function DashboardScreen() {
  if (Platform.OS === "web") {
    return <WebScreen />;
  }

  if (Platform.OS === "macos" || Platform.OS === "windows") {
    return <DesktopScreen />;
  }

  return <NativeScreen />;
}
