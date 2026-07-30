import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';
import { RADIUS, TYPOGRAPHY } from '../theme/tokens';

export interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onDebouncedChange?: (text: string) => void;
  debounceMs?: number;
  placeholder?: string;
  autoFocus?: boolean;
  style?: ViewStyle;
}

export function SearchBar({
  value = '',
  onChangeText,
  onDebouncedChange,
  debounceMs = 300,
  placeholder = 'Search...',
  autoFocus = false,
  style,
}: SearchBarProps) {
  const { colors, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [text, setText] = useState<string>(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const handleChangeText = (newText: string) => {
    setText(newText);
    if (onChangeText !== undefined) {
      onChangeText(newText);
    }
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (onDebouncedChange !== undefined) {
      timerRef.current = setTimeout(() => {
        onDebouncedChange(newText);
      }, debounceMs);
    }
  };

  const handleClear = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (text !== '') {
      setText('');
      if (onChangeText !== undefined) {
        onChangeText('');
      }
      if (onDebouncedChange !== undefined) {
        onDebouncedChange('');
      }
    }
  };

  const hasValue = text.length > 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
          borderColor: isFocused ? colors.brand[600] : colors.border,
        },
        style,
      ]}
    >
      <Icon
        name="search"
        size={16}
        color={isFocused ? (isDark ? colors.brand[500] : colors.brand[800]) : colors.neutral[400]}
        style={styles.searchIcon}
      />

      <TextInput
        value={text}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.neutral[400]}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoFocus={autoFocus}
        style={[styles.input, { color: colors.text }]}
      />

      {hasValue ? (
        <TouchableOpacity onPress={handleClear} style={styles.clearBtn} activeOpacity={0.7}>
          <Icon name="x" size={14} color={colors.neutral[400]} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: RADIUS.input,
    borderWidth: 1,
    paddingHorizontal: 12,
    width: '100%',
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    height: '100%',
    padding: 0,
    ...Platform.select({ web: { outlineWidth: 0 } }),
  },
  clearBtn: {
    padding: 4,
    marginLeft: 4,
  },
});
