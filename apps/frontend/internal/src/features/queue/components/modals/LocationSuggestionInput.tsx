import React, { useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useTheme, TYPOGRAPHY, Icon } from "@edge/ui";
import { normalizeGeoName } from "@edge/api";

export interface LocationSuggestionOption {
  id: string;
  name: string;
  subtitle?: string;
}

export interface LocationSuggestionInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSelectOption?: (option: LocationSuggestionOption) => void;
  options: LocationSuggestionOption[];
  placeholder?: string;
  loading?: boolean;
  emptyHint?: string;
}

export function LocationSuggestionInput({
  value,
  onChangeText,
  onSelectOption,
  options,
  placeholder,
  loading = false,
  emptyHint = "No matching locations found",
}: LocationSuggestionInputProps) {
  const { colors, isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [hasTypedSinceOpen, setHasTypedSinceOpen] = useState(false);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredOptions = useMemo(() => {
    const trimmed = value.trim();
    if (!trimmed || !hasTypedSinceOpen) {
      return options.slice(0, 60);
    }
    const lower = trimmed.toLowerCase();
    const norm = normalizeGeoName(trimmed);

    const exactOrStarts: LocationSuggestionOption[] = [];
    const contains: LocationSuggestionOption[] = [];

    for (const opt of options) {
      const nameLower = opt.name.toLowerCase();
      const nameNorm = normalizeGeoName(opt.name);
      const subLower = (opt.subtitle || "").toLowerCase();

      if (
        nameLower.startsWith(lower) ||
        (norm.length > 0 && nameNorm.startsWith(norm))
      ) {
        exactOrStarts.push(opt);
      } else if (
        nameLower.includes(lower) ||
        (norm.length > 0 && nameNorm.includes(norm)) ||
        (subLower.length > 0 && subLower.includes(lower))
      ) {
        contains.push(opt);
      }
      if (exactOrStarts.length + contains.length >= 60) {
        break;
      }
    }

    return [...exactOrStarts, ...contains].slice(0, 50);
  }, [options, value, hasTypedSinceOpen]);

  const handleFocus = () => {
    if (blurTimerRef.current !== null) {
      clearTimeout(blurTimerRef.current);
      blurTimerRef.current = null;
    }
    setHasTypedSinceOpen(false);
    setIsOpen(true);
  };

  const handleBlur = () => {
    blurTimerRef.current = setTimeout(() => {
      setIsOpen(false);
      setHasTypedSinceOpen(false);
    }, 200);
  };

  const handleChangeText = (text: string) => {
    setHasTypedSinceOpen(true);
    if (!isOpen) setIsOpen(true);
    onChangeText(text);
  };

  const handleSelect = (opt: LocationSuggestionOption) => {
    if (blurTimerRef.current !== null) {
      clearTimeout(blurTimerRef.current);
      blurTimerRef.current = null;
    }
    onChangeText(opt.name);
    onSelectOption?.(opt);
    setIsOpen(false);
    setHasTypedSinceOpen(false);
  };

  const toggleDropdown = () => {
    if (blurTimerRef.current !== null) {
      clearTimeout(blurTimerRef.current);
      blurTimerRef.current = null;
    }
    setHasTypedSinceOpen(false);
    setIsOpen((prev) => !prev);
  };

  return (
    <View style={[styles.wrapper, isOpen && { zIndex: 100 }]}>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
            borderColor: isOpen
              ? colors.brand[500]
              : isDark
              ? colors.neutral[700]
              : colors.neutral[300],
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            { color: isDark ? colors.neutral[100] : colors.neutral[900] },
          ]}
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
        />
        <TouchableOpacity
          onPress={toggleDropdown}
          style={styles.rightBtn}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.brand[500]} />
          ) : (
            <Icon
              name={isOpen ? "chevron-up" : "chevron-down"}
              size={15}
              color={isDark ? colors.neutral[400] : colors.neutral[500]}
            />
          )}
        </TouchableOpacity>
      </View>

      {isOpen && (
        <View
          style={[
            styles.dropdown,
            {
              backgroundColor: isDark ? colors.neutral[800] : "#FFFFFF",
              borderColor: isDark ? colors.neutral[700] : colors.neutral[300],
            },
          ]}
        >
          {loading && filteredOptions.length === 0 ? (
            <View style={styles.emptyBox}>
              <ActivityIndicator size="small" color={colors.brand[500]} />
              <Text
                style={[
                  styles.emptyText,
                  { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                ]}
              >
                Loading suggestions...
              </Text>
            </View>
          ) : filteredOptions.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text
                style={[
                  styles.emptyText,
                  { color: isDark ? colors.neutral[400] : colors.neutral[500] },
                ]}
              >
                {emptyHint}
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.dropdownScroll}
              keyboardShouldPersistTaps="always"
              nestedScrollEnabled
            >
              {filteredOptions.map((opt) => {
                const isSelected =
                  value.trim().toLowerCase() === opt.name.trim().toLowerCase();
                return (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() => handleSelect(opt)}
                    style={[
                      styles.optionItem,
                      {
                        borderBottomColor: isDark
                          ? colors.neutral[700]
                          : colors.neutral[100],
                      },
                      isSelected && {
                        backgroundColor: isDark
                          ? colors.neutral[700]
                          : colors.brand[50],
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionName,
                        {
                          color: isSelected
                            ? isDark
                              ? colors.brand[300]
                              : colors.brand[700]
                            : isDark
                            ? colors.neutral[100]
                            : colors.neutral[900],
                          fontWeight: isSelected ? "700" : "500",
                        },
                      ]}
                    >
                      {opt.name}
                    </Text>
                    {opt.subtitle ? (
                      <Text
                        style={[
                          styles.optionSubtitle,
                          {
                            color: isDark
                              ? colors.neutral[400]
                              : colors.neutral[500],
                          },
                        ]}
                      >
                        {opt.subtitle}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 12,
    paddingRight: 6,
    minHeight: 38,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  rightBtn: {
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  dropdown: {
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 180,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  dropdownScroll: {
    maxHeight: 180,
  },
  optionItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  optionName: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fonts.primary,
    flex: 1,
  },
  optionSubtitle: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
  emptyBox: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fonts.primary,
  },
});
