import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Icon, COLORS, TYPOGRAPHY } from "@edge/ui";
import { NTCService } from "../../data/servicesData";
import { GeneralApplicantData } from "../hooks/useGeneralServiceWizard";

interface GeneralDocumentUploadStepProps {
  service: NTCService;
  activeApplicant: GeneralApplicantData;
  isWeb: boolean;
  selectedReqIndex: number;
  setSelectedReqIndex: (idx: number) => void;
  onUploadPress: (req: string) => void;
  onRemoveUpload: (req: string) => void;
}

export function GeneralDocumentUploadStep({
  service,
  activeApplicant,
  isWeb,
  selectedReqIndex,
  setSelectedReqIndex,
  onUploadPress,
  onRemoveUpload,
}: GeneralDocumentUploadStepProps) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, color: COLORS.neutral[600], marginBottom: 16 }}>
        Please upload clear scanned documents (PDF or JPEG) for each of the listed requirements below:
      </Text>

      {isWeb ? (
        /* WEB: Side-by-Side Split Grid View */
        <View style={{ flexDirection: "row", gap: 24, minHeight: 400 }}>
          {/* Left Panel: Tabs List of Requirements */}
          <View style={{ flex: 1.2, backgroundColor: COLORS.neutral.white, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.neutral[200] }}>
            {service.requirements.map((req, i) => {
              const uploadData = activeApplicant.uploads[req];
              const isUploaded = !!uploadData;
              const isSelected = i === selectedReqIndex;

              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => setSelectedReqIndex(i)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: isSelected ? COLORS.brand[500] + "22" : "transparent",
                    borderWidth: 1,
                    borderColor: isSelected ? COLORS.brand[700] : "transparent",
                    marginBottom: 8,
                  }}
                >
                  <Text style={{
                    flex: 1,
                    fontFamily: TYPOGRAPHY.fonts.primary,
                    fontSize: 13,
                    fontWeight: isSelected ? "600" : "400",
                    color: isSelected ? COLORS.brand[900] : COLORS.neutral[700],
                    marginRight: 8,
                  }} numberOfLines={2}>
                    {req}
                  </Text>
                  <Icon
                    name={isUploaded ? "check-circle" : "circle"}
                    size={18}
                    color={isUploaded ? COLORS.semantic.success : COLORS.neutral[300]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Right Panel: Large Drag-drop style Zone & Preview */}
          <View style={{ flex: 1.5, backgroundColor: COLORS.neutral.white, borderRadius: 12, padding: 24, borderWidth: 1, borderColor: COLORS.neutral[200], justifyContent: "center" }}>
            {(() => {
              const req = service.requirements[selectedReqIndex] || "";
              const uploadData = activeApplicant.uploads[req];
              const fileName = typeof uploadData === "string" ? uploadData : uploadData?.name;
              const fileUri = typeof uploadData === "string" ? "" : uploadData?.uri;
              const isImage = fileUri && (fileUri.toLowerCase().endsWith(".png") || fileUri.toLowerCase().endsWith(".jpg") || fileUri.toLowerCase().endsWith(".jpeg") || fileUri.startsWith("data:image"));

              return (
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "700", color: COLORS.neutral[800], marginBottom: 20, textAlign: "center" }}>
                    {req}
                  </Text>

                  {uploadData ? (
                    /* Large Image/PDF Preview Box */
                    <View style={{ width: "100%", alignItems: "center" }}>
                      {isImage ? (
                        <Image
                          source={{ uri: fileUri }}
                          style={{ width: "100%", height: 200, borderRadius: 8, resizeMode: "contain", backgroundColor: COLORS.neutral[50], borderWidth: 1, borderColor: COLORS.neutral[200], marginBottom: 16 }}
                        />
                      ) : (
                        <View style={{ width: "100%", height: 120, borderRadius: 8, backgroundColor: COLORS.neutral[50], borderWidth: 1, borderColor: COLORS.neutral[200], justifyContent: "center", alignItems: "center", marginBottom: 16 }}>
                          <Icon name="file-text" size={48} color={COLORS.neutral[400]} />
                          <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: COLORS.neutral[500], marginTop: 8 }}>Scanned PDF Document</Text>
                        </View>
                      )}
                      <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, color: COLORS.neutral[800], fontWeight: "600", marginBottom: 16, textAlign: "center" }}>
                        {fileName}
                      </Text>
                      <TouchableOpacity
                        onPress={() => onRemoveUpload(req)}
                        style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: COLORS.semantic.errorBg, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20 }}
                      >
                        <Icon name="trash-2" size={16} color={COLORS.semantic.error} style={{ marginRight: 6 }} />
                        <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "700", color: COLORS.semantic.error }}>Remove Upload</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    /* Interactive Upload Dropzone */
                    <TouchableOpacity
                      onPress={() => onUploadPress(req)}
                      style={{
                        width: "100%",
                        borderWidth: 2,
                        borderStyle: "dashed",
                        borderColor: COLORS.brand[500],
                        borderRadius: 12,
                        paddingVertical: 48,
                        paddingHorizontal: 24,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: COLORS.neutral[50],
                      }}
                    >
                      <Icon name="upload-cloud" size={48} color={COLORS.brand[700]} style={{ marginBottom: 12 }} />
                      <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 14, fontWeight: "700", color: COLORS.neutral[700], marginBottom: 4 }}>
                        Drag & drop or Click to upload
                      </Text>
                      <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: COLORS.neutral[400] }}>
                        Supports scanned PDFs or JPEGs
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })()}
          </View>
        </View>
      ) : (
        /* MOBILE: List View with Thumbnail Mini Previews */
        <View>
          {service.requirements.map((req, i) => {
            const uploadData = activeApplicant.uploads[req];
            const fileName = typeof uploadData === "string" ? uploadData : uploadData?.name;
            const fileUri = typeof uploadData === "string" ? "" : uploadData?.uri;
            const isImage = fileUri && (fileUri.toLowerCase().endsWith(".png") || fileUri.toLowerCase().endsWith(".jpg") || fileUri.toLowerCase().endsWith(".jpeg") || fileUri.startsWith("data:image"));

            return (
              <View key={i} style={{ backgroundColor: COLORS.neutral.white, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.neutral[200] }}>
                <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "600", color: COLORS.neutral[800], marginBottom: 12 }}>
                  {req}
                </Text>
                {uploadData ? (
                  <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: COLORS.semantic.successBg, padding: 8, borderRadius: 8 }}>
                    {isImage ? (
                      <Image
                        source={{ uri: fileUri }}
                        style={{ width: 44, height: 44, borderRadius: 6, marginRight: 12, borderWidth: 1, borderColor: COLORS.semantic.successBorder }}
                      />
                    ) : (
                      <View style={{ width: 44, height: 44, borderRadius: 6, backgroundColor: COLORS.neutral[100], justifyContent: "center", alignItems: "center", marginRight: 12 }}>
                        <Icon name="file-text" size={20} color={COLORS.neutral[500]} />
                      </View>
                    )}
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, color: COLORS.neutral[800], fontWeight: "600" }} numberOfLines={1}>
                        {fileName}
                      </Text>
                      <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, color: COLORS.semantic.success, marginTop: 2 }}>
                        Uploaded ✓
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => onRemoveUpload(req)} style={{ padding: 6 }}>
                      <Icon name="trash-2" size={16} color={COLORS.semantic.error} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => onUploadPress(req)}
                    style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderStyle: "dashed", borderColor: COLORS.brand[500], padding: 10, borderRadius: 8 }}
                  >
                    <Icon name="upload-cloud" size={18} color={COLORS.brand[700]} style={{ marginRight: 8 }} />
                    <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 13, fontWeight: "600", color: COLORS.brand[700] }}>
                      Upload scanned document
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
