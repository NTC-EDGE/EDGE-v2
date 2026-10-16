import React from "react";
import { View, Text, ScrollView, Pressable, Platform } from "react-native";
import { useTheme, COLORS, SPACING, RADIUS, TYPOGRAPHY, Icon as Lucide } from "@edge/ui";
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
            padding: SPACING[20],
            alignItems: 'center',
            gap: SPACING[12],
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

        <Text
          style={[
            styles.billingSubtitle,
            {
              color: isDark ? colors.neutral[400] : colors.neutral[500],
              textAlign: 'center',
              maxWidth: 480,
              lineHeight: 18,
            },
          ]}
        >
          {app.status === 'Submitted'
            ? 'You must take and start evaluation on this application first before generating the Statement of Account.'
            : isEvaluationReady
            ? 'Generate the SOA to compute statutory fees before forwarding to the Accountant.'
            : 'Complete applicant evaluation to generate the SOA.'}
        </Text>

        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: RADIUS.xs,
              backgroundColor: isDark ? colors.neutral[900] : colors.neutral[100],
              borderWidth: 1,
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
            }}
          >
            <Text style={{ fontSize: 11, color: isDark ? colors.neutral[300] : colors.neutral[600], fontFamily: TYPOGRAPHY.fonts.primary }}>
              Service: <Text style={{ fontWeight: TYPOGRAPHY.weights.bold }}>{app.serviceName || app.category}</Text>
            </Text>
          </View>

          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: RADIUS.xs,
              backgroundColor: isDark ? colors.neutral[900] : colors.neutral[100],
              borderWidth: 1,
              borderColor: isDark ? colors.neutral[700] : colors.neutral[200],
            }}
          >
            <Text style={{ fontSize: 11, color: isDark ? colors.neutral[300] : colors.neutral[600], fontFamily: TYPOGRAPHY.fonts.primary }}>
              Applicants: <Text style={{ fontWeight: TYPOGRAPHY.weights.bold }}>{app.applicantsList?.length || 1} unit(s)</Text>
            </Text>
          </View>

          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: RADIUS.xs,
              backgroundColor: isEvaluationReady
                ? (isDark ? '#064e3b' : '#ecfdf5')
                : (isDark ? '#451a03' : '#fffbeb'),
              borderWidth: 1,
              borderColor: isEvaluationReady
                ? (isDark ? '#059669' : '#10b981')
                : (isDark ? '#b45309' : '#f59e0b'),
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: TYPOGRAPHY.weights.bold,
                color: isEvaluationReady
                  ? (isDark ? '#34d399' : '#059669')
                  : (isDark ? '#fbbf24' : '#d97706'),
                fontFamily: TYPOGRAPHY.fonts.primary,
              }}
            >
              {isEvaluationReady ? '✓ Evaluation Active & Ready' : app.status === 'Submitted' ? '⚠ Evaluation Not Started' : '⚠ Evaluation Pending'}
            </Text>
          </View>
        </View>

        {isEditable && (
          <Pressable
            style={[
              styles.soaActionBtn,
              {
                backgroundColor: canGenerateSoa
                  ? (isDark ? colors.brand[500] : colors.brand[700])
                  : (isDark ? colors.neutral[800] : colors.neutral[200]),
                borderColor: canGenerateSoa
                  ? (isDark ? colors.brand[400] : colors.brand[800])
                  : (isDark ? colors.neutral[700] : colors.neutral[300]),
                paddingHorizontal: 18,
                paddingVertical: 10,
                marginTop: SPACING[8],
              },
              !canGenerateSoa && { opacity: 0.6 },
              Platform.select({ web: { cursor: canGenerateSoa ? 'pointer' : 'not-allowed' } as object }),
            ]}
            disabled={!canGenerateSoa}
            onPress={() => {
              if (canGenerateSoa) {
                onOpenGenerateSoa();
              }
            }}
          >
            <Lucide
              name={canGenerateSoa ? "file-plus" : "lock"}
              size={16}
              color={canGenerateSoa ? COLORS.neutral.white : (isDark ? colors.neutral[400] : colors.neutral[500])}
            />
            <Text
              style={[
                styles.soaActionBtnText,
                {
                  color: canGenerateSoa ? COLORS.neutral.white : (isDark ? colors.neutral[400] : colors.neutral[500]),
                  fontSize: 13,
                  fontWeight: TYPOGRAPHY.weights.bold,
                },
              ]}
            >
              {canGenerateSoa
                ? 'Generate Statement of Account'
                : app.status === 'Submitted'
                ? 'Start Evaluation First to Generate SOA'
                : 'Evaluation Required to Generate SOA'}
            </Text>
          </Pressable>
        )}
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}
