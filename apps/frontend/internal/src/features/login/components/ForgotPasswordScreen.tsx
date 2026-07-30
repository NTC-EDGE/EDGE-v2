import React from "react";
import { Platform } from "react-native";
import {
  ForgotPasswordScreen as WebScreen,
  ForgotPasswordScreenProps,
} from "./ForgotPasswordScreen.web";
import { ForgotPasswordScreen as NativeScreen } from "./ForgotPasswordScreen.native";
import { ForgotPasswordScreen as DesktopScreen } from "./ForgotPasswordScreen.desktop";

export function ForgotPasswordScreen(props: ForgotPasswordScreenProps): React.ReactElement {
  if (Platform.OS === "web") {
    return <WebScreen {...props} />;
  }

  if (Platform.OS === "macos" || Platform.OS === "windows") {
    return <DesktopScreen {...props} />;
  }

  return <NativeScreen {...props} />;
}
