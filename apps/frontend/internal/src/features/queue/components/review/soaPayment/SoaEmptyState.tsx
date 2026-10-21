import React from "react";
import { View, Text, ScrollView, Pressable, Platform } from "react-native";
import { useTheme, COLORS, SPACING, TYPOGRAPHY, Icon as Lucide } from "@edge/ui";
import { ApplicationData } from "../../../../../types/application";
import { reviewStyles as styles } from "../reviewStyles";

interface SoaEmptyStateProps {
  app: ApplicationData;
  isEditable: boolean;
  canGenerateSoa: boolean;
  isEvaluationReady: boolean;
  onOpenGenerateSoa: () => void;
}

export function SoaEmptyState({
  app,
  isEditable,
  canGenerateSoa,
  isEvaluationReady,
  onOpenGenerateSoa,
}: SoaEmptyStateProps) {
  const { colors, isDark } = useTheme();

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View
        style={[
          styles.billingContainer,
          {
            borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
            backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
            padding: SPACING[24],
            alignItems: 'center',
            gap: SPACING[16],
          },
        ]}
      >
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: isEvaluationReady
              ? (isDark ? colors.brand[900] : colors.brand[50])
              : (isDark ? '#451a03' : '#fef3c7'),
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Lucide
            name={isEvaluationReady ? "file-plus" : "lock"}
            size={26}
            color={isEvaluationReady ? (isDark ? colors.brand[400] : colors.brand[600]) : (isDark ? '#fbbf24' : '#d97706')}
          />
        </View>

        <Text
          style={[
            styles.billingTitle,
            {
              color: isDark ? colors.neutral[100] : colors.neutral[900],
              fontSize: 17,
              textAlign: 'center',
            },
          ]}
        >
          {app.status === 'Submitted'
            ? 'Statement of Account (Evaluation Not Started)'
            : isEvaluationReady
            ? 'Generate Statement of Account'
            : 'Statement of Account (Evaluation Required)'}
        </Text>

        {isEditable && canGenerateSoa && (
          <Pressable
            style={[
              styles.soaActionBtn,
              {
                backgroundColor: isDark ? colors.brand[500] : colors.brand[700],
                borderColor: isDark ? colors.brand[400] : colors.brand[800],
                paddingHorizontal: 18,
                paddingVertical: 10,
                marginTop: SPACING[8],
              },
              Platform.select({ web: { cursor: 'pointer' } as object }),
            ]}
            onPress={onOpenGenerateSoa}
          >
            <Lucide
              name="file-plus"
              size={16}
              color={COLORS.neutral.white}
            />
            <Text
              style={[
                styles.soaActionBtnText,
                {
                  color: COLORS.neutral.white,
                  fontSize: 13,
                  fontWeight: TYPOGRAPHY.weights.bold,
                },
              ]}
            >
              Generate Statement of Account
            </Text>
          </Pressable>
        )}
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}
