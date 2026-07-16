import * as React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  X,
  Check,
  ArrowLeft,
  Undo,
  Trash2,
  Minus,
  Plus,
  RotateCcw,
  RotateCw,
  Crop,
  Maximize,
  Image as ImageIcon,
  CircleDot,
  Circle,
  Move,
  Sliders,
  Droplet,
  Highlighter,
  Wand2,
} from "lucide-react-native";

export interface IIconProps {
  disabled?: boolean;
  iconID: string;
  text: string;
}

const iconMap: Record<string, React.ElementType> = {
  "close": X,
  "check": Check,
  "done": Check,
  "arrow-back": ArrowLeft,
  "undo": Undo,
  "delete": Trash2,
  "remove": Minus,
  "add": Plus,
  "rotate-left": RotateCcw,
  "rotate-right": RotateCw,
  "crop": Crop,
  "crop-free": Maximize,
  "crop-original": ImageIcon,
  "radio-button-checked": CircleDot,
  "radio-button-unchecked": Circle,
  "transform": Move,
  "tune": Sliders,
  "blur-on": Droplet,
  "edit": Highlighter,
  "auto-fix-high": Wand2,
  "rotate-90-degrees-ccw": RotateCcw,
};

export const Icon = React.memo((props: IIconProps) => {
  const IconComponent = iconMap[props.iconID] || X;
  return (
    <View style={styles.container}>
      <IconComponent
        size={26}
        color={props.disabled ? "grey" : "white"}
      />
      <Text style={[styles.text, props.disabled && { color: "grey" }]}>
        {props.text}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    height: 64,
    width: 80,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  text: {
    color: "#fff",
    textAlign: "center",
  },
});
