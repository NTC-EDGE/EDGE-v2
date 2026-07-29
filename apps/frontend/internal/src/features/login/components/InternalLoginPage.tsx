import React from "react";
import { Platform } from "react-native";
import { InternalLoginPageWeb } from "./InternalLoginPage.web";
import { InternalLoginPageNative } from "./InternalLoginPage.native";
import { InternalLoginPageDesktop } from "./InternalLoginPage.desktop";

export function InternalLoginPage() {
  if (Platform.OS === "web") {
    return <InternalLoginPageWeb />;
  }

  if (Platform.OS === "macos" || Platform.OS === "windows") {
    return <InternalLoginPageDesktop />;
  }

  return <InternalLoginPageNative />;
}
