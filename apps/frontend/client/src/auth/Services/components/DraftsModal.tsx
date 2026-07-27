import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Icon, COLORS, TYPOGRAPHY } from "@edge/ui";
import { servicesData } from "../data/servicesData";
import { DraftApplication } from "../hooks/useServices";

interface DraftsModalProps {
  viewingDraftsCategory: string | null;
  onClose: () => void;
  drafts: DraftApplication[];
  loadDraft: (draft: DraftApplication) => void;
}

export function DraftsModal({
  viewingDraftsCategory,
  onClose,
  drafts,
  loadDraft,
}: DraftsModalProps) {
  const currentCategory = servicesData.find((c) => c.id === viewingDraftsCategory);
  const categoryTitle = currentCategory?.title ?? "";

  const categoryDrafts = drafts.filter((d) =>
    currentCategory?.services.some((s) => s.title === d.service?.title)
  );

  return (
    <Modal
      visible={viewingDraftsCategory !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: COLORS.neutral.white,
            width: "100%",
            maxWidth: 540,
            borderRadius: 16,
            overflow: "hidden",
            padding: 24,
            maxHeight: "80%",
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontFamily: TYPOGRAPHY.fonts.primary,
                fontSize: 18,
                fontWeight: "700",
                color: COLORS.neutral[900],
              }}
            >
              Saved Drafts - {categoryTitle}
            </Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <Icon name="x" size={20} color={COLORS.neutral[500]} />
            </TouchableOpacity>
          </View>

          {/* List */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {categoryDrafts.length === 0 ? (
              <Text
                style={{
                  fontFamily: TYPOGRAPHY.fonts.primary,
                  fontSize: 14,
                  color: COLORS.neutral[400],
                  textAlign: "center",
                  marginTop: 40,
                  marginBottom: 20,
                }}
              >
                No saved drafts found in this category.
              </Text>
            ) : (
              categoryDrafts.map((draft) => (
                <TouchableOpacity
                  key={draft.id}
                  onPress={() => loadDraft(draft)}
                  style={{
                    backgroundColor: COLORS.neutral[50],
                    borderColor: COLORS.neutral[200],
                    borderWidth: 1,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flex: 1, paddingRight: 16 }}>
                    <Text
                      style={{
                        fontFamily: TYPOGRAPHY.fonts.primary,
                        fontSize: 14,
                        fontWeight: "700",
                        color: COLORS.neutral[800],
                        marginBottom: 4,
                      }}
                    >
                      {draft.service?.title}
                    </Text>
                    <Text
                      style={{
                        fontFamily: TYPOGRAPHY.fonts.primary,
                        fontSize: 12,
                        color: COLORS.neutral[500],
                      }}
                    >
                      Step {draft.step} • {draft.appMode === "BULK" ? "Bulk Filing" : "Single Applicant"} • Saved {draft.timestamp}
                    </Text>
                  </View>
                  <Icon
                    name="chevron-right"
                    size={16}
                    color={COLORS.neutral[400]}
                  />
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
