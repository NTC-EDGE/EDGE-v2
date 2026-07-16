import React, {
  FC,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  ForwardRefRenderFunction,
  useMemo,
  useCallback,
} from "react";
import { View, Platform } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { MotiView, AnimatePresence } from "moti";
import Text from "@atoms/text";
import TextInput from "@atoms/input";
import { Close, Exclamation } from "@atoms/icon";
import styles from "@styles/input-style";
import { input, outline, palette } from "@styles/color";

interface Props {
  label?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  required?: boolean;
  hasValidation?: boolean;
  description?: string;
  error?: string;
  icon?: React.ReactNode; // <-- NEW
  iconPosition?: "left" | "right"; // <-- OPTIONAL
  [x: string]: any;
}

export type TextInputRef = {
  blur: any;
  focus: any;
};

const InputField: ForwardRefRenderFunction<TextInputRef, Props> = (
  {
    label = "",
    placeholder = "",
    secureTextEntry = false,
    required = false,
    hasValidation = false,
    description,
    error,
    onBlur = () => {},
    onFocus = () => {},
    icon = null,
    iconPosition = "left",
    ...otherProps
  },
  ref
) => {
  const inputRef: any = useRef(null);
  const { text, background } = input;
  const editable =
    otherProps?.editable === false || otherProps?.editable === true
      ? otherProps?.editable
      : true;

  const [focused, setFocused] = useState(false);
  const onFocusFN = useCallback(() => {
    setFocused(true);
    onFocus();
  }, [onFocus]);
  const onBlurFN = useCallback(() => {
    setFocused(false);
    onBlur();
  }, [onBlur]);
  useImperativeHandle(ref, () => ({
    blur: () => inputRef.current.blur(),
    focus: () => inputRef.current.focus(),
  }));
  const stylesMemo = useMemo(() => {
    return styles;
  }, []);

  return (
    <View style={stylesMemo.mainContainer}>
      <MotiView
        animate={{
          borderColor: !!error
            ? text?.errorColor
            : focused
            ? outline.primary
            : palette.border,
          backgroundColor: !!error
            ? background?.error
            : focused
            ? "#fff"
            : background?.default,
          shadowOpacity: focused ? 0.08 : 0,
          transform: [{ scale: focused ? 1.01 : 1 }],
        }}
        transition={{
          type: "timing",
          duration: 200,
        }}
        style={[
          stylesMemo.container,
          stylesMemo.rowContainer,
          focused &&
            Platform.select({
              ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 12,
              },
              android: { elevation: 4 },
            }),
        ]}
      >
        <View style={{ flex: 0.95 }}>
          {!!otherProps.value && !!label && (
            <View style={stylesMemo.labelContainer}>
              <Text
                style={[
                  stylesMemo.labelText,
                  !!error && { color: text?.errorColor },
                ]}
              >
                {label}
              </Text>
              {required && <Text style={stylesMemo.requiredText}>{"*"}</Text>}
            </View>
          )}
          <View
            style={{
              flex: icon ? 0.88 : 0.95,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {icon && iconPosition === "left" && (
              <View style={{ marginRight: 8 }}>{icon}</View>
            )}
            <TextInput
              ref={inputRef}
              style={stylesMemo.inputText}
              placeholder={`${placeholder || label}${required ? "*" : ""}`}
              placeholderTextColor={
                !!error ? text?.errorColor : text?.defaultColor
              }
              secureTextEntry={secureTextEntry}
              onFocus={onFocusFN}
              onBlur={onBlurFN}
              accessibilityLabel={
                otherProps.accessibilityLabel || label || placeholder
              }
              accessibilityHint={
                error ? `Error: ${error}` : otherProps.accessibilityHint
              }
              {...otherProps}
            />
            {icon && iconPosition !== "left" && (
              <View style={{ marginLeft: 8 }}>{icon}</View>
            )}
          </View>
        </View>
        <AnimatePresence>
          {!!otherProps.value && focused && (
            <MotiView
              from={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "timing", duration: 150 }}
            >
              <TouchableOpacity
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Clear input"
                onPress={() => {
                  if (otherProps?.onChangeText) otherProps?.onChangeText("");
                }}
              >
                <Close
                  size={15}
                  color={error ? text.errorColor : text.mainColor}
                />
              </TouchableOpacity>
            </MotiView>
          )}
        </AnimatePresence>
      </MotiView>
      {hasValidation && (!!error || !!description) && (
        <View style={stylesMemo.validationContainer}>
          {!!error && (
            <View style={stylesMemo.validationIconContainer}>
              <Exclamation size={14} color={text?.errorColor} />
            </View>
          )}
          <Text
            style={[
              stylesMemo?.validationText,
              !!error && { color: text?.errorColor },
              !!error && stylesMemo.validationTextError,
            ]}
          >
            {error || description}
          </Text>
        </View>
      )}
    </View>
  );
};

export default React.memo(forwardRef(InputField));
