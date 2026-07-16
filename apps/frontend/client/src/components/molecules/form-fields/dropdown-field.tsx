import React, {
  FC,
  useCallback,
  useMemo,
  useState,
} from "react";
import { View, Platform } from "react-native";
import { MotiView } from 'moti';
import Text from "@atoms/text";
import styles from "@styles/input-style";
import { input, outline, palette } from "@styles/color";
import DropDownComponent from "@atoms/dropdown";
import DynamicField from "@organisms/forms/fields/dynamic";

interface Props {
  value?: string;
  alternativeValue?: string;
  items?: any[];
  placeholder?: string;
  onPreSelect?: (val: any) => void;
  onChangeValue?: (val: any) => void;
  hasValidation?: boolean;
  description?: string;
  error?: string;
  loading?: boolean;
  required?: boolean;
  [x: string]: any;
}

const DropDownField: FC<Props> = ({
                                    value = "",
                                    alternativeValue = "",
                                    items = [],
                                    placeholder = "Choose an item...",
                                    onPreSelect = () => {},
                                    onChangeValue = () => {},
                                    hasValidation = false,
                                    description,
                                    error,
                                    loading,
                                    required,
                                    ...otherProps
                                  }) => {
  const { text, background } = input;
  const [focused, setFocused] = useState(false);
    const {
        type = '',
        parentId = '',
        index = -1,
    } = otherProps;
  // keep reference-stable list if parent passes a stable array
  const itemsMemo = useMemo(() => items, [items]);

  // compute placeholder once per relevant change
  const computedPlaceholder = useMemo(
      () => `${placeholder}${required && !value ? "*" : ""}`,
      [placeholder, required, value]
  );
    const isChecked = otherProps?.selected;
  // stable handler so Dropdown doesn't re-render from new functions
  const handleToggle = useCallback((visible: boolean) => {
    setFocused(visible);
  }, []);

  const showValidation = hasValidation && (!!error || !!description);

  return (
      <View style={styles.mainContainer}>
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
                ? '#fff'
                : background?.default,
            shadowOpacity: focused ? 0.08 : 0,
            transform: [{ scale: focused ? 1.01 : 1 }],
          }}
          transition={{
            type: 'timing',
            duration: 200,
          }}
          style={[
            styles.container,
            styles.dropdownContainer,
            focused && Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 12,
              },
              android: { elevation: 4 },
            }),
          ]}
        >
        <DropDownComponent
            items={itemsMemo}
            value={value}
            alternativeValue={alternativeValue}
            onPreSelect={onPreSelect}
            onChangeValue={onChangeValue}
            placeholder={computedPlaceholder}
            containerStyle={{ borderWidth: 0, paddingHorizontal: 0, height: '100%', backgroundColor: 'transparent', marginBottom: 0 }}
            dropdownStyle={styles.dropdownListContainer}
            dropdownElementStyle={styles.dropdownElementContainer}
            selectedElementColor={input.background.default}
            placeholderStyle={!value && styles.placeholderText}
            iconSize={15}
            iconColor={text.defaultColor}
            onToggle={handleToggle}
            loading={loading}
            required={required}
            {...otherProps}
        />
        </MotiView>

        {showValidation && (
            <View>
              <Text
                  style={[
                    styles.validationText,
                    !!error && { color: text?.errorColor },
                  ]}
              >
                {error || description}
              </Text>
            </View>
        )}
      </View>
  );
};

export default React.memo(DropDownField);
