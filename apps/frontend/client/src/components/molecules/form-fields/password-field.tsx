import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  ForwardRefRenderFunction,
  useMemo,
  useCallback,
} from "react";
import { View, TouchableOpacity, Platform } from "react-native";
import { MotiView } from "moti";
import Text from "@atoms/text";
import TextInput from "@atoms/input";
import { Eye, EyeOff, Exclamation } from "@atoms/icon";
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
  showPassword?: any;
  [x: string]: any;
}

export type TextInputRef = {
  blur: any;
  focus: any;
};

const PasswordField: ForwardRefRenderFunction<TextInputRef, Props> = (
  {
    label = "",
    placeholder = "",
    secureTextEntry = false,
    required = false,
    hasValidation = false,
    description,
    error,
    showPassword = () => {},
    onBlur = () => {},
    onFocus = () => {},
    ...otherProps
  },
  ref
) => {
  const inputRef: any = useRef(null);
  const { text, background } = input;

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
  }, [error]);
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
        </View>
        <TouchableOpacity
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={
            secureTextEntry ? "Show password" : "Hide password"
          }
          onPress={() => {
            showPassword();
            inputRef?.current?.focus();
          }}
        >
          {secureTextEntry ? (
            <Eye size={20} color={text.defaultColor} />
          ) : (
            <EyeOff size={20} color={text.mainColor} />
          )}
        </TouchableOpacity>
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

export default React.memo(forwardRef(PasswordField));
