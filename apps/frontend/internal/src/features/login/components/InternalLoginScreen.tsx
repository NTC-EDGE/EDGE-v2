import React from "react";
import { Platform } from "react-native";
import { InternalLoginScreenWeb } from "./InternalLoginScreen.web";
import { InternalLoginScreenNative } from "./InternalLoginScreen.native";
import { InternalLoginScreenDesktop } from "./InternalLoginScreen.desktop";

export function InternalLoginScreen() {
  if (Platform.OS === "web") {
    return <InternalLoginScreenWeb />;
  }

  if (Platform.OS === "macos" || Platform.OS === "windows") {
    return <InternalLoginScreenDesktop />;
  }

  return <InternalLoginScreenNative />;
}
