import React, { FC, useMemo } from "react";
import { View } from "react-native";
import Text from "@atoms/text";
import CheckBox from "@atoms/checkbox";
import styles from "./styles";
import { text } from "@styles/color";
import { MotiView } from "moti";
import { MotiPressable } from "moti/interactions";
interface Props {
  size?: number;
  style?: any;
  textStyle?: any;
  isChecked?: boolean;
  onClick?: () => void;
  label?: string;
  highlightedText?: string;
  type?: string;
}

const checkbox: FC<Props> = ({
                                       size = 24,
                                       style = {},
                                       textStyle = {},
                                       isChecked = false,
                                       onClick = () => {},
                                       label = "",
                                       highlightedText = "",
                                       type = "",
                                     }) => {
  const stylesMemo = useMemo(() => styles, []);

  return (
      <MotiPressable
          onPress={onClick}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isChecked }}
          accessibilityLabel={label || "Checkbox"}
          animate={({ pressed }) => {
            "worklet";
            return {
              scale: pressed ? 0.96 : 1,
              opacity: pressed ? 0.75 : 1,
            };
          }}
          transition={{ type: "timing", duration: 120 }}
          style={[stylesMemo.view, style]}
      >
        {/* Animated CHECK */}
        <MotiView
            from={{ scale: 0.6, opacity: 0 }}
            animate={{
              scale: isChecked ? 1 : 0.85,
              opacity: isChecked ? 1 : 0.5,
            }}
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 18,
            }}
        >
          <CheckBox
              size={size}
              style={stylesMemo.checkbox}
              isChecked={isChecked}
              onClick={onClick}
              type={type}
          />
        </MotiView>

        {/* Animated TEXT */}
        <MotiView
            style={stylesMemo.textContainer}
            from={{ opacity: 0.6, translateX: -4 }}
            animate={{
              opacity: isChecked ? 1 : 0.8,
              translateX: isChecked ? 0 : -2,
            }}
            transition={{ type: "timing", duration: 150 }}
        >
          <Text
              style={[
                !isChecked && { color: text.default },
                textStyle,
              ]}
          >
            {label}{" "}
            {!!highlightedText && (
                <Text style={stylesMemo.highlightedText}>
                  {highlightedText}
                </Text>
            )}
          </Text>
        </MotiView>
      </MotiPressable>
  );
};

export default React.memo(checkbox);
