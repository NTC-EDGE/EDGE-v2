import React from "react";
import { Platform } from "react-native";
import { UsersScreen as WebScreen } from "./UsersScreen.web";
import { UsersScreen as NativeScreen } from "./UsersScreen.native";
import { UsersScreen as DesktopScreen } from "./UsersScreen.desktop";

export function UsersScreen() {
  if (Platform.OS === "web") {
    return <WebScreen />;
  }

  if (Platform.OS === "macos" || Platform.OS === "windows") {
    return <DesktopScreen />;
  }

  return <NativeScreen />;
}
