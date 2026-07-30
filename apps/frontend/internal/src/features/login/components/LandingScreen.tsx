import React from "react";
import { Platform } from "react-native";
import { LandingScreen as WebScreen } from "./LandingScreen.web";
import { LandingScreen as NativeScreen } from "./LandingScreen.native";
import { LandingScreen as DesktopScreen } from "./LandingScreen.desktop";

export function LandingScreen(): React.ReactElement {
  if (Platform.OS === "web") {
    return <WebScreen />;
  }

  if (Platform.OS === "macos" || Platform.OS === "windows") {
    return <DesktopScreen />;
  }

  return <NativeScreen />;
}
