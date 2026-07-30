import React from "react";
import { Platform } from "react-native";
import { EmployeesScreen as WebScreen } from "./EmployeesScreen.web";
import { EmployeesScreen as NativeScreen } from "./EmployeesScreen.native";
import { EmployeesScreen as DesktopScreen } from "./EmployeesScreen.desktop";

export function EmployeesScreen() {
  if (Platform.OS === "web") {
    return <WebScreen />;
  }

  if (Platform.OS === "macos" || Platform.OS === "windows") {
    return <DesktopScreen />;
  }

  return <NativeScreen />;
}
