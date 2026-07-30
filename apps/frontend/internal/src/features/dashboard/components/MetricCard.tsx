import React from "react";
import { Platform } from "react-native";
import { MetricCard as WebCard } from "./MetricCard.web";
import { MetricCard as NativeCard } from "./MetricCard.native";
import { MetricCard as DesktopCard } from "./MetricCard.desktop";
import type { MetricCardProps, LucideIconName } from "./MetricCard.web";

export type { MetricCardProps, LucideIconName };

export function MetricCard(props: MetricCardProps): React.ReactElement {
  if (Platform.OS === "web") {
    return <WebCard {...props} />;
  }

  if (Platform.OS === "macos" || Platform.OS === "windows") {
    return <DesktopCard {...props} />;
  }

  return <NativeCard {...props} />;
}
