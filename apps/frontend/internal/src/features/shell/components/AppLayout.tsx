import React from "react";
import { Platform } from "react-native";
import { AppLayoutWeb } from "./AppLayout.web";
import { AppLayoutNative } from "./AppLayout.native";
import { AppLayoutDesktop } from "./AppLayout.desktop";

export interface AppLayoutProps {
  children: React.ReactNode;
  activeScreen?: string;
  onNavigate?: (screenName: string) => void;
}

export function AppLayout(props: AppLayoutProps) {
  if (Platform.OS === "web") {
    return <AppLayoutWeb {...props} />;
  }

  if (Platform.OS === "macos" || Platform.OS === "windows") {
    return <AppLayoutDesktop {...props} />;
  }

  return <AppLayoutNative {...props} />;
}
