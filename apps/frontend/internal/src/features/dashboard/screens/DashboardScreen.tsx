import React from "react";
import { Platform } from "react-native";
import { DashboardScreenWeb } from "./DashboardScreen.web";
import { DashboardScreenNative } from "./DashboardScreen.native";
import { DashboardScreenDesktop } from "./DashboardScreen.desktop";

export function DashboardScreen() {
  if (Platform.OS === "web") {
    return <DashboardScreenWeb />;
  }

  if (Platform.OS === "macos" || Platform.OS === "windows") {
    return <DashboardScreenDesktop />;
  }

  return <DashboardScreenNative />;
}
