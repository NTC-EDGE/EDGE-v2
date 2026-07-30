import React from "react";
import { Platform } from "react-native";
import { OnboardingScreen as WebScreen } from "./OnboardingScreen.web";
import { OnboardingScreen as NativeScreen } from "./OnboardingScreen.native";
import { OnboardingScreen as DesktopScreen } from "./OnboardingScreen.desktop";

export function OnboardingScreen(): React.ReactElement {
  if (Platform.OS === "web") {
    return <WebScreen />;
  }

  if (Platform.OS === "macos" || Platform.OS === "windows") {
    return <DesktopScreen />;
  }

  return <NativeScreen />;
}
