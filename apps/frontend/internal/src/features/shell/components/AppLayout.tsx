import React from "react";
import { Platform } from "react-native";
import { AppLayout as WebLayout } from "./AppLayout.web";
import { AppLayout as NativeLayout } from "./AppLayout.native";
import { AppLayout as DesktopLayout } from "./AppLayout.desktop";

export interface AppLayoutProps {
  children: React.ReactNode;
  activeScreen?: string;
  onNavigate?: (screenName: string) => void;
}

export function AppLayout(props: AppLayoutProps) {
  if (Platform.OS === "web") {
    return <WebLayout {...props} />;
  }

  if (Platform.OS === "macos" || Platform.OS === "windows") {
    return <DesktopLayout {...props} />;
  }

  return <NativeLayout {...props} />;
}
