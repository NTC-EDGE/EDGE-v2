import React from "react";
import { View, ViewStyle, useWindowDimensions } from "react-native";

export interface FormColProps {
  children: React.ReactNode;
  /** Column span on desktop/tablet: 12 (100%), 6 (50%), 4 (33%), 3 (25%) */
  span?: 12 | 6 | 4 | 3;
  /** Set to true if the input field has a limited character display (e.g. Years, Gender, SG Level, Class, Zip Code) */
  compact?: boolean;
  style?: ViewStyle | ViewStyle[];
}

export function FormCol({ children, span = 6, compact = false, style }: FormColProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 640;

  let computedStyle: ViewStyle;

  if (isMobile) {
    if (compact) {
      // Short/limited character fields retain a compact side-by-side layout on mobile
      computedStyle = {
        width: span === 3 ? "48%" : "48%",
        minWidth: 100,
        flexGrow: 0,
        paddingHorizontal: 6,
        marginBottom: 12,
      };
    } else {
      // Standard input fields stack as a single column (100% width) for optimal mobile UI
      computedStyle = {
        width: "100%",
        paddingHorizontal: 6,
        marginBottom: 12,
      };
    }
  } else {
    // Desktop & Tablet responsive layout
    switch (span) {
      case 12:
        computedStyle = { width: "100%", paddingHorizontal: 6, marginBottom: 12 };
        break;
      case 6:
        computedStyle = { width: "50%", paddingHorizontal: 6, marginBottom: 12 };
        break;
      case 4:
        computedStyle = { width: "33.333%", paddingHorizontal: 6, marginBottom: 12 };
        break;
      case 3:
        computedStyle = { width: "25%", paddingHorizontal: 6, marginBottom: 12 };
        break;
      default:
        computedStyle = { width: "50%", paddingHorizontal: 6, marginBottom: 12 };
    }
  }

  return <View style={[computedStyle, style]}>{children}</View>;
}

export function FormGrid({ children, style }: { children: React.ReactNode; style?: ViewStyle | ViewStyle[] }) {
  return (
    <View
      style={[
        {
          flexDirection: "row",
          flexWrap: "wrap",
          marginHorizontal: -6,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
