import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  Platform,
} from "react-native";
import { COLORS, TYPOGRAPHY, SPACING, Icon } from "@edge/ui";
import { Button } from "../../../shared/components/Button";

interface SignatureSettingsTabProps {
  savedSignature: string;
  applicantName: string;
  onUpdateSignature: (sigDataUrl: string) => Promise<void>;
  onClearSignature: () => Promise<void>;
  isSaving: boolean;
}

export function SignatureSettingsTab({
  savedSignature,
  applicantName,
  onUpdateSignature,
  onClearSignature,
  isSaving,
}: SignatureSettingsTabProps) {
  const [activeTab, setActiveTab] = useState<"draw" | "type" | "upload">("draw");
  const [typedName, setTypedName] = useState(applicantName || "");
  const [isEditing, setIsEditing] = useState(!savedSignature);

  // Web Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const strokeHistoryRef = useRef<ImageData[]>([]);

  useEffect(() => {
    if (activeTab === "draw" && Platform.OS === "web" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#0F2C59";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, [activeTab, isEditing]);

  const startDrawing = (e: any) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    isDrawingRef.current = true;
    try {
      strokeHistoryRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    } catch {
      // ignore
    }
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: any) => {
    if (!isDrawingRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) ctx.closePath();
    }
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokeHistoryRef.current = [];
  };

  const handleSaveDrawn = async () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    await onUpdateSignature(dataUrl);
    setIsEditing(false);
  };

  const handleSaveTyped = async () => {
    if (!typedName.trim()) return;
    const signatureToken = `typed:cursive:${typedName.trim()}`;
    await onUpdateSignature(signatureToken);
    setIsEditing(false);
  };

  const triggerUpload = () => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/png, image/jpeg, image/jpg";
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = async () => {
            if (typeof reader.result === "string") {
              await onUpdateSignature(reader.result);
              setIsEditing(false);
            }
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }
  };

  const hasSignature = Boolean(savedSignature && savedSignature.trim().length > 0);
  const isImageSignature =
    hasSignature &&
    (savedSignature.startsWith("data:image") ||
      savedSignature.startsWith("http://") ||
      savedSignature.startsWith("https://") ||
      savedSignature.startsWith("blob:") ||
      savedSignature.startsWith("file:"));

  const typedSignatureText = savedSignature.startsWith("typed:")
    ? savedSignature.split(":").slice(2).join(":") || savedSignature.split(":")[1]
    : savedSignature;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderIcon}>
            <Icon name="edit-3" size={20} color="#0F2C59" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Official Digital E-Signature</Text>
            <Text style={styles.cardSubtitle}>
              Your saved digital signature is automatically attached to legal declaration sections across all NTC application filings.
            </Text>
          </View>
        </View>

        {/* Current Active Signature Display */}
        {hasSignature && !isEditing ? (
          <View style={styles.activeSignatureContainer}>
            <View style={styles.activeBadgeRow}>
              <View style={styles.activeBadge}>
                <Icon name="check-circle" size={14} color="#10B981" />
                <Text style={styles.activeBadgeText}>Default Active Signature</Text>
              </View>

              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  onPress={() => setIsEditing(true)}
                  style={styles.replaceButton}
                  activeOpacity={0.7}
                >
                  <Icon name="refresh-cw" size={13} color="#2563EB" />
                  <Text style={styles.replaceButtonText}>Replace / Change</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onClearSignature}
                  style={styles.deleteButton}
                  activeOpacity={0.7}
                >
                  <Icon name="trash-2" size={13} color="#EF4444" />
                  <Text style={styles.deleteButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Signature Preview Surface */}
            <View style={styles.previewSurface}>
              {isImageSignature ? (
                <Image
                  source={{ uri: savedSignature }}
                  style={styles.signatureImg}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.typedCanvas}>
                  <Text style={styles.typedText}>{typedSignatureText}</Text>
                  <View style={styles.typedUnderline} />
                  <Text style={styles.typedWatermark}>Verified Electronic Signature</Text>
                </View>
              )}
            </View>

            <View style={styles.infoBox}>
              <Icon name="shield" size={16} color="#0F2C59" />
              <Text style={styles.infoText}>
                This signature meets the Philippine Electronic Commerce Act (RA 8792) requirements for online government filings.
              </Text>
            </View>
          </View>
        ) : (
          /* Signature Editor / Creator */
          <View style={styles.editorContainer}>
            <View style={styles.tabRow}>
              <TouchableOpacity
                onPress={() => setActiveTab("draw")}
                style={[styles.tabBtn, activeTab === "draw" && styles.tabBtnActive]}
              >
                <Icon name="edit-2" size={14} color={activeTab === "draw" ? "#0F2C59" : "#64748B"} />
                <Text style={[styles.tabBtnText, activeTab === "draw" && styles.tabBtnTextActive]}>
                  Draw Signature
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab("type")}
                style={[styles.tabBtn, activeTab === "type" && styles.tabBtnActive]}
              >
                <Icon name="type" size={14} color={activeTab === "type" ? "#0F2C59" : "#64748B"} />
                <Text style={[styles.tabBtnText, activeTab === "type" && styles.tabBtnTextActive]}>
                  Type Cursive
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab("upload")}
                style={[styles.tabBtn, activeTab === "upload" && styles.tabBtnActive]}
              >
                <Icon name="upload-cloud" size={14} color={activeTab === "upload" ? "#0F2C59" : "#64748B"} />
                <Text style={[styles.tabBtnText, activeTab === "upload" && styles.tabBtnTextActive]}>
                  Upload Image
                </Text>
              </TouchableOpacity>
            </View>

            {/* Mode 1: Draw */}
            {activeTab === "draw" && (
              <View style={styles.tabContent}>
                <View style={styles.canvasFrame}>
                  {Platform.OS === "web" ? (
                    <canvas
                      ref={canvasRef}
                      width={520}
                      height={160}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      style={{
                        width: "100%",
                        height: 160,
                        cursor: "crosshair",
                        backgroundColor: "#FFFFFF",
                      }}
                    />
                  ) : (
                    <View style={{ height: 160, justifyContent: "center", alignItems: "center" }}>
                      <Text style={{ color: "#64748B" }}>Draw canvas ready on mobile</Text>
                    </View>
                  )}
                </View>

                <View style={styles.editorActionRow}>
                  <TouchableOpacity onPress={clearCanvas} style={styles.clearBtn} activeOpacity={0.7}>
                    <Icon name="rotate-ccw" size={14} color="#64748B" />
                    <Text style={styles.clearBtnText}>Clear Canvas</Text>
                  </TouchableOpacity>

                  <View style={{ flexDirection: "row", gap: 10 }}>
                    {hasSignature && (
                      <Button variant="secondary" onPress={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    )}
                    <Button variant="primary" onPress={handleSaveDrawn} loading={isSaving}>
                      Save as Default Signature
                    </Button>
                  </View>
                </View>
              </View>
            )}

            {/* Mode 2: Type */}
            {activeTab === "type" && (
              <View style={styles.tabContent}>
                <Text style={styles.typeLabel}>Full Signer Legal Name</Text>
                <TextInput
                  value={typedName}
                  onChangeText={setTypedName}
                  placeholder="Enter full legal name..."
                  style={styles.typeInput}
                />

                {typedName.trim().length > 0 && (
                  <View style={styles.typePreviewCard}>
                    <Text style={styles.cursivePreviewText}>{typedName.trim()}</Text>
                    <View style={styles.typedUnderline} />
                    <Text style={styles.typedWatermark}>Authenticated Signature Sample</Text>
                  </View>
                )}

                <View style={styles.editorActionRow}>
                  <View />
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    {hasSignature && (
                      <Button variant="secondary" onPress={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    )}
                    <Button variant="primary" onPress={handleSaveTyped} loading={isSaving}>
                      Save as Default Signature
                    </Button>
                  </View>
                </View>
              </View>
            )}

            {/* Mode 3: Upload */}
            {activeTab === "upload" && (
              <View style={styles.tabContent}>
                <TouchableOpacity
                  onPress={triggerUpload}
                  style={styles.uploadDropzone}
                  activeOpacity={0.7}
                >
                  <View style={styles.uploadIconCircle}>
                    <Icon name="upload-cloud" size={24} color="#0F2C59" />
                  </View>
                  <Text style={styles.uploadTitle}>Click to browse and upload signature image</Text>
                  <Text style={styles.uploadSubtitle}>PNG, JPG, or JPEG with transparent or clean background</Text>
                </TouchableOpacity>

                {hasSignature && (
                  <View style={{ marginTop: 14, alignItems: "flex-end" }}>
                    <Button variant="secondary" onPress={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING[20],
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: SPACING[20],
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: SPACING[20],
    paddingBottom: SPACING[12],
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  cardHeaderIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F0F4F8",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: "700",
    color: "#0F2C59",
  },
  cardSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  activeSignatureContainer: {
    gap: 16,
  },
  activeBadgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  activeBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: "700",
    color: "#065F46",
  },
  replaceButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  replaceButtonText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: "600",
    color: "#2563EB",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  deleteButtonText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: "600",
    color: "#EF4444",
  },
  previewSurface: {
    height: 160,
    backgroundColor: "#FAFBFD",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  signatureImg: {
    width: "100%",
    height: "100%",
    maxHeight: 130,
  },
  typedCanvas: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  typedText: {
    fontFamily: Platform.OS === "web" ? "'Brush Script MT', 'Dancing Script', cursive" : "System",
    fontSize: 32,
    color: "#0F2C59",
    letterSpacing: 1.5,
  },
  typedUnderline: {
    width: 220,
    height: 1.5,
    backgroundColor: "#94A3B8",
    marginTop: 6,
  },
  typedWatermark: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  infoText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#475569",
    flex: 1,
  },
  editorContainer: {
    gap: 16,
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  tabBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  tabBtnTextActive: {
    color: "#0F2C59",
    fontWeight: "700",
  },
  tabContent: {
    gap: 14,
  },
  canvasFrame: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    borderStyle: "dashed",
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  editorActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  clearBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  typeLabel: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  typeInput: {
    height: 44,
    backgroundColor: "#FFFFFF",
    borderColor: "#CBD5E1",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    color: "#1E293B",
  },
  typePreviewCard: {
    backgroundColor: "#FAFBFD",
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  cursivePreviewText: {
    fontFamily: Platform.OS === "web" ? "'Brush Script MT', 'Dancing Script', cursive" : "System",
    fontSize: 34,
    color: "#0F2C59",
  },
  uploadDropzone: {
    borderWidth: 2,
    borderColor: "#CBD5E1",
    borderStyle: "dashed",
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  uploadIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: "700",
    color: "#0F2C59",
  },
  uploadSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#64748B",
  },
});
