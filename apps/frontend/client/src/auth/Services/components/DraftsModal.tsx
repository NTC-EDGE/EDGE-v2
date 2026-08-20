import React, { useState, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Icon, COLORS, TYPOGRAPHY } from "@edge/ui";
import { useApi } from "../../../shared/hooks/useApi";
import { ConfirmationDialog } from "../../../shared/components/ConfirmationDialog";

interface DraftsModalProps {
  viewingDraftsCategory: string | null;
  onClose: () => void;
  drafts?: any[];
  loadDraft: (draft: any) => void;
  deleteDraft?: (draftId: string) => Promise<boolean | void> | void;
  backendCategories: any[] | null;
}

export function DraftsModal({
  viewingDraftsCategory,
  onClose,
  loadDraft,
  deleteDraft,
  backendCategories,
}: DraftsModalProps) {
  const api = useApi();
  const [draftToDelete, setDraftToDelete] = useState<any | null>(null);
  const [categoryDrafts, setCategoryDrafts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  const currentCategory = backendCategories?.find((c) => {
    if (c.id === viewingDraftsCategory) return true;
    const code = c.code?.toUpperCase();
    const name = c.name?.toLowerCase();
    const vLower = (viewingDraftsCategory || "").toLowerCase();
    if (vLower === "exams" && (code === "EXAM" || name?.includes("exam"))) return true;
    if (vLower === "certificates" && (code === "CERT" || name?.includes("cert"))) return true;
    if (vLower === "licenses" && (code === "LIC" || name?.includes("licen"))) return true;
    if (vLower === "permits" && (code === "PRM" || name?.includes("permit"))) return true;
    if (vLower === "accreditations" && (code === "ACCR" || name?.includes("accred"))) return true;
    if ((vLower === "complaints" || vLower === "requests") && (code === "REQ" || c.type === "RequestsAndComplaints" || name?.includes("request"))) return true;
    return false;
  });

  const categoryTitle = currentCategory?.name ?? (viewingDraftsCategory === "ALL" ? "All Applications" : viewingDraftsCategory || "Applications");

  // Reset page number on category change
  useEffect(() => {
    setPageNumber(1);
  }, [viewingDraftsCategory]);

  useEffect(() => {
    if (!viewingDraftsCategory) {
      setCategoryDrafts([]);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const fetchCategoryDrafts = async () => {
      try {
        const catIdOrCode = currentCategory?.id || viewingDraftsCategory;
        const baseEndpoint = viewingDraftsCategory === "ALL"
          ? `/api/v2/applications/me/drafts?categoryId=ALL&pageNumber=${pageNumber}&pageSize=${pageSize}`
          : `/api/v2/applications/me/drafts/categoryId=${catIdOrCode}?pageNumber=${pageNumber}&pageSize=${pageSize}`;

        const res = await api.get<any>(baseEndpoint);
        if (isMounted) {
          if (res && res.succeeded) {
            const items = Array.isArray(res.data) ? res.data : (Array.isArray(res.items) ? res.items : []);
            setCategoryDrafts(items);
            setTotalCount(res.totalCount ?? items.length);
            setTotalPages(res.totalPages ?? Math.max(1, Math.ceil((res.totalCount ?? items.length) / pageSize)));
            setHasPreviousPage(res.hasPreviousPage ?? pageNumber > 1);
            setHasNextPage(res.hasNextPage ?? (res.totalPages ? pageNumber < res.totalPages : false));
          } else {
            setCategoryDrafts([]);
            setTotalCount(0);
            setTotalPages(1);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch category drafts:", err);
        if (isMounted) {
          setCategoryDrafts([]);
          setTotalCount(0);
          setTotalPages(1);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchCategoryDrafts();

    return () => {
      isMounted = false;
    };
  }, [viewingDraftsCategory, currentCategory?.id, pageNumber, pageSize]);

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
            maxWidth: 560,
            borderRadius: 16,
            overflow: "hidden",
            padding: 24,
            maxHeight: "85%",
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Icon name="file-text" size={20} color="#1D4ED8" />
              <Text
                style={{
                  fontFamily: TYPOGRAPHY.fonts.primary,
                  fontSize: 18,
                  fontWeight: "700",
                  color: COLORS.neutral[900],
                }}
              >
                Saved Drafts {currentCategory ? `• ${currentCategory.name}` : "(All Categories)"}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <Icon name="x" size={20} color={COLORS.neutral[500]} />
            </TouchableOpacity>
          </View>

          {/* List */}
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
            {isLoading ? (
              <View style={{ padding: 40, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="small" color="#1D4ED8" />
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[500], marginTop: 12 }}>
                  Loading saved drafts...
                </Text>
              </View>
            ) : categoryDrafts.length === 0 ? (
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
              categoryDrafts.map((draft: any) => {
                const serviceTitle = draft.serviceName || draft.applicants?.[0]?.serviceName || draft.service?.title || "Application Draft";
                const formattedDate = draft.createdAt ? new Date(draft.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }) : (draft.timestamp || "Recently");
                const modeText = (draft.submissionMode?.toUpperCase() === "BULK" || draft.appMode === "BULK") ? "Bulk Filing" : "Single Applicant";
                const variantText = [draft.serviceVariant, draft.serviceVariantElement].filter(Boolean).join(" • ");

                return (
                  <View
                    key={draft.id}
                    style={{
                      backgroundColor: COLORS.neutral[50],
                      borderColor: COLORS.neutral[200],
                      borderWidth: 1,
                      borderRadius: 12,
                      padding: 14,
                      marginBottom: 10,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => loadDraft(draft)}
                      style={{ flex: 1, paddingRight: 12 }}
                    >
                      <Text
                        style={{
                          fontFamily: TYPOGRAPHY.fonts.primary,
                          fontSize: 14,
                          fontWeight: "700",
                          color: COLORS.neutral[800],
                          marginBottom: 4,
                        }}
                      >
                        {serviceTitle}
                      </Text>
                      {variantText ? (
                        <Text
                          style={{
                            fontFamily: TYPOGRAPHY.fonts.primary,
                            fontSize: 12,
                            fontWeight: "600",
                            color: "#1D4ED8",
                            marginBottom: 4,
                          }}
                        >
                          {variantText}
                        </Text>
                      ) : null}
                      <Text
                        style={{
                          fontFamily: TYPOGRAPHY.fonts.primary,
                          fontSize: 11.5,
                          color: COLORS.neutral[500],
                        }}
                      >
                        {modeText} {draft.referenceNumber ? `• Ref: ${draft.referenceNumber}` : ""} • Saved {formattedDate}
                      </Text>
                    </TouchableOpacity>

                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      {deleteDraft && (
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation?.();
                            setDraftToDelete(draft);
                          }}
                          style={{
                            padding: 8,
                            borderRadius: 8,
                            backgroundColor: "#FEE2E2",
                          }}
                          accessibilityLabel="Delete Draft"
                        >
                          <Icon
                            name="trash-2"
                            size={16}
                            color="#DC2626"
                          />
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        onPress={() => loadDraft(draft)}
                        style={{
                          padding: 8,
                          borderRadius: 8,
                          backgroundColor: COLORS.brand[50] || "#EFF6FF",
                        }}
                      >
                        <Icon
                          name="chevron-right"
                          size={16}
                          color={COLORS.brand[700]}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Pagination Controls */}
          {totalCount > pageSize && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: 16,
                marginTop: 8,
                borderTopWidth: 1,
                borderTopColor: COLORS.neutral[200],
              }}
            >
              <Text
                style={{
                  fontFamily: TYPOGRAPHY.fonts.primary,
                  fontSize: 12,
                  color: COLORS.neutral[500],
                }}
              >
                Showing {Math.min((pageNumber - 1) * pageSize + 1, totalCount)}-{Math.min(pageNumber * pageSize, totalCount)} of {totalCount}
              </Text>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <TouchableOpacity
                  onPress={() => setPageNumber((p) => Math.max(1, p - 1))}
                  disabled={!hasPreviousPage || isLoading}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: hasPreviousPage ? COLORS.neutral[300] : COLORS.neutral[200],
                    backgroundColor: hasPreviousPage ? COLORS.neutral.white : COLORS.neutral[100],
                    opacity: hasPreviousPage ? 1 : 0.5,
                  }}
                >
                  <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: "600", color: COLORS.neutral[700] }}>
                    Previous
                  </Text>
                </TouchableOpacity>

                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: "700", color: COLORS.neutral[800], marginHorizontal: 4 }}>
                  {pageNumber} / {totalPages}
                </Text>

                <TouchableOpacity
                  onPress={() => setPageNumber((p) => (hasNextPage ? p + 1 : p))}
                  disabled={!hasNextPage || isLoading}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: hasNextPage ? COLORS.neutral[300] : COLORS.neutral[200],
                    backgroundColor: hasNextPage ? COLORS.neutral.white : COLORS.neutral[100],
                    opacity: hasNextPage ? 1 : 0.5,
                  }}
                >
                  <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: "600", color: COLORS.neutral[700] }}>
                    Next
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        visible={draftToDelete !== null}
        variant="destructive"
        iconName="trash-2"
        title="Delete Saved Draft"
        message={`Are you sure you want to delete the draft for "${draftToDelete?.serviceName || draftToDelete?.service?.title || "this application"}"? This action cannot be undone.`}
        onClose={() => setDraftToDelete(null)}
        actions={[
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => setDraftToDelete(null),
          },
          {
            text: "Delete Draft",
            style: "destructive",
            iconName: "trash-2",
            onPress: async () => {
              if (draftToDelete && deleteDraft) {
                await deleteDraft(draftToDelete.id);
                setCategoryDrafts((prev) => prev.filter((d) => d.id !== draftToDelete.id));
              }
              setDraftToDelete(null);
            },
          },
        ]}
      />
    </Modal>
  );
}
