import React from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { useTheme, COLORS, Icon as Lucide } from "@edge/ui";
import { ApplicationFormAttachment } from "../../../../types/application";
import { SectionHeader } from "./reviewComponents";
import { reviewStyles as styles } from "./reviewStyles";

export function FormsAttachmentSection({
  accountableForms,
  downloadForms,
}: {
  accountableForms: ApplicationFormAttachment[];
  downloadForms: ApplicationFormAttachment[];
}) {
  const { colors, isDark } = useTheme();

  const handleAction = (form: ApplicationFormAttachment, action: string) => {
    Alert.alert(
      `${action} Form`,
      `You are ${action.toLowerCase()}ing: ${form.name}`,
      [{ text: "OK" }]
    );
  };

  return (
    <>
      {accountableForms.length > 0 && (
        <>
          <SectionHeader title="ACCOUNTABLE FORM" />
          <View style={styles.infoBlock}>
            {accountableForms.map((form) => (
              <View
                key={form.name}
                style={[
                  styles.formCard,
                  {
                    borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100],
                    borderLeftColor: isDark ? colors.brand[500] : colors.brand[700],
                    backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                  },
                ]}
              >
                <View style={styles.formCardLeft}>
                  <View style={[styles.formDocIcon, { backgroundColor: isDark ? colors.neutral[800] : '#EFF6FF' }]}>
                    <Lucide
                      name="file-text"
                      size={18}
                      color={isDark ? colors.brand[500] : COLORS.brand[700]}
                    />
                  </View>
                  <View>
                    <Text style={[styles.formDocLabel, { color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>
                      DOCUMENT ATTACHMENT
                    </Text>
                    <Text style={[styles.formDocName, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
                      {form.name}
                    </Text>
                    <View style={styles.formActions}>
                      {form.canView && (
                        <Pressable onPress={() => handleAction(form, "View")}>
                          <Text style={[styles.formActionLink, { color: isDark ? colors.brand[500] : colors.brand[700] }]}>
                            View
                          </Text>
                        </Pressable>
                      )}
                      {form.canPrint && (
                        <Pressable onPress={() => handleAction(form, "Print")}>
                          <Text style={[styles.formActionLink, { color: isDark ? colors.brand[500] : colors.brand[700] }]}>
                            Print
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                </View>
                {form.canDownload && (
                  <Pressable
                    style={[styles.downloadBtn, { borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}
                    onPress={() => handleAction(form, "Download")}
                  >
                    <Lucide
                      name="download"
                      size={14}
                      color={isDark ? colors.neutral[400] : colors.neutral[600]}
                    />
                    <Text style={[styles.downloadBtnText, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>
                      Download
                    </Text>
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        </>
      )}

      {downloadForms.length > 0 && (
        <>
          <SectionHeader title="DOWNLOAD FORM" />
          <View style={styles.infoBlock}>
            {downloadForms.map((form) => (
              <View
                key={form.name}
                style={[
                  styles.formCard,
                  {
                    borderBottomColor: isDark ? colors.neutral[800] : colors.neutral[100],
                    borderLeftColor: isDark ? colors.brand[500] : colors.brand[700],
                    backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
                  },
                ]}
              >
                <View style={styles.formCardLeft}>
                  <View style={[styles.formDocIcon, { backgroundColor: isDark ? colors.neutral[800] : '#EFF6FF' }]}>
                    <Lucide
                      name="file-text"
                      size={18}
                      color={isDark ? colors.brand[500] : COLORS.brand[700]}
                    />
                  </View>
                  <View>
                    <Text style={[styles.formDocLabel, { color: isDark ? colors.neutral[500] : colors.neutral[400] }]}>
                      DOCUMENT ATTACHMENT
                    </Text>
                    <Text style={[styles.formDocName, { color: isDark ? colors.neutral[100] : colors.neutral[900] }]}>
                      {form.name}
                    </Text>
                    <View style={styles.formActions}>
                      {form.canView && (
                        <Pressable onPress={() => handleAction(form, "View")}>
                          <Text style={[styles.formActionLink, { color: isDark ? colors.brand[500] : colors.brand[700] }]}>
                            View
                          </Text>
                        </Pressable>
                      )}
                      {form.canPrint && (
                        <Pressable onPress={() => handleAction(form, "Print")}>
                          <Text style={[styles.formActionLink, { color: isDark ? colors.brand[500] : colors.brand[700] }]}>
                            Print
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                </View>
                <View style={styles.formBtnGroup}>
                  {form.canDownload && (
                    <Pressable
                      style={[styles.downloadBtn, { borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}
                      onPress={() => handleAction(form, "Download")}
                    >
                      <Lucide
                        name="download"
                        size={14}
                        color={isDark ? colors.neutral[400] : colors.neutral[600]}
                      />
                      <Text style={[styles.downloadBtnText, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>
                        Download
                      </Text>
                    </Pressable>
                  )}
                  {form.canRefresh && (
                    <Pressable
                      style={[styles.refreshBtn, { borderColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}
                      onPress={() => handleAction(form, "Refresh")}
                    >
                      <Lucide
                        name="refresh-cw"
                        size={14}
                        color={isDark ? colors.neutral[400] : colors.neutral[600]}
                      />
                      <Text style={[styles.downloadBtnText, { color: isDark ? colors.neutral[300] : colors.neutral[600] }]}>
                        Refresh
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </>
  );
}
