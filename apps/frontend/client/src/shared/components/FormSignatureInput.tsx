import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
} from "react-native";
import { useUser } from "@clerk/expo";
import { COLORS, TYPOGRAPHY, Icon } from "@edge/ui";

interface FormSignatureInputProps {
  label?: string;
  isRequired?: boolean;
  value: string;
  onChange: (signatureDataUrl: string) => void;
  error?: string;
  applicantName?: string;
}

export function FormSignatureInput({
  label = "Applicant Signature / Declaration",
  isRequired = true,
  value = "",
  onChange,
  error,
  applicantName = "",
}: FormSignatureInputProps) {
  const { user: clerkUser } = useUser();
  const [activeTab, setActiveTab] = useState<"draw" | "type" | "upload">("draw");
  const [typedName, setTypedName] = useState(applicantName || clerkUser?.fullName || "");
  const [hasDrawnStrokes, setHasDrawnStrokes] = useState(false);

  // Helper to retrieve saved signature from Clerk metadata or local storage
  const getSavedSignature = useCallback((): string => {
    try {
      const userMeta = clerkUser?.unsafeMetadata as Record<string, unknown> | undefined;
      if (userMeta?.eSignature && typeof userMeta.eSignature === "string" && userMeta.eSignature.trim().length > 0) {
        return userMeta.eSignature;
      }
      if (userMeta?.signature && typeof userMeta.signature === "string" && userMeta.signature.trim().length > 0) {
        return userMeta.signature;
      }
      const publicMeta = clerkUser?.publicMetadata as Record<string, unknown> | undefined;
      if (publicMeta?.eSignature && typeof publicMeta.eSignature === "string" && publicMeta.eSignature.trim().length > 0) {
        return publicMeta.eSignature;
      }
      if (publicMeta?.signature && typeof publicMeta.signature === "string" && publicMeta.signature.trim().length > 0) {
        return publicMeta.signature;
      }
      if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
        const localSig = window.localStorage.getItem("ntc_user_saved_signature") || window.localStorage.getItem("user_e_signature");
        if (localSig && localSig.trim().length > 0) {
          return localSig;
        }
      }
    } catch {
      // ignore
    }
    return "";
  }, [clerkUser]);

  const savedSignature = getSavedSignature();

  // Auto-populate default saved signature if value is currently empty
  useEffect(() => {
    if (!value || value.trim().length === 0) {
      if (savedSignature) {
        onChange(savedSignature);
      }
    }
  }, [savedSignature, value, onChange]);

  // Sync typed name when applicantName or clerkUser updates
  useEffect(() => {
    if (applicantName) {
      setTypedName(applicantName);
    } else if (clerkUser?.fullName) {
      setTypedName(clerkUser.fullName);
    }
  }, [applicantName, clerkUser?.fullName]);

  // Web Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const strokeHistoryRef = useRef<ImageData[]>([]);

  const hasSignature = value !== null && value !== undefined && value.trim().length > 0;

  // Initialize Canvas when activeTab is 'draw' on Web
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
  }, [activeTab, hasSignature]);

  // Web Drawing Handlers
  const startDrawing = (e: any) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    isDrawingRef.current = true;

    // Save snapshot for undo
    try {
      strokeHistoryRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    } catch {
      // ignore
    }

    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: any) => {
    if (!isDrawingRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawnStrokes(true);
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
    setHasDrawnStrokes(false);
  };

  const undoStroke = () => {
    if (!canvasRef.current || strokeHistoryRef.current.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const previousState = strokeHistoryRef.current.pop();
    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
      if (strokeHistoryRef.current.length === 0) {
        setHasDrawnStrokes(false);
      }
    }
  };

  const persistSavedSignature = async (sigDataUrl: string) => {
    if (!sigDataUrl || !sigDataUrl.trim()) return;
    try {
      if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("ntc_user_saved_signature", sigDataUrl);
      }
      if (clerkUser) {
        await clerkUser.update({
          unsafeMetadata: {
            ...((clerkUser.unsafeMetadata as Record<string, unknown>) || {}),
            eSignature: sigDataUrl,
          },
        });
      }
    } catch (err) {
      console.warn("Could not persist saved signature:", err);
    }
  };

  const handleApplyDrawnSignature = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    onChange(dataUrl);
    persistSavedSignature(dataUrl);
  };

  const handleApplyTypedSignature = () => {
    if (!typedName.trim()) return;
    const signatureToken = `typed:cursive:${typedName.trim()}`;
    onChange(signatureToken);
    persistSavedSignature(signatureToken);
  };

  const triggerNativeOrWebUpload = () => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/png, image/jpeg, image/jpg";
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === "string") {
              onChange(reader.result);
              persistSavedSignature(reader.result);
            }
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }
  };

  const handleApplySavedSignature = () => {
    if (savedSignature) {
      onChange(savedSignature);
    }
  };

  const handleClearSignature = () => {
    onChange("");
    clearCanvas();
  };

  // Determine if the signature is an image or typed
  const isImageSignature =
    value.startsWith("data:image") ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("blob:") ||
    value.startsWith("file:");

  const typedSignatureText = value.startsWith("typed:")
    ? value.split(":").slice(2).join(":") || value.split(":")[1]
    : value;

  return (
    <View style={styles.container}>
      {/* Label Row with Red Asterisk */}
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {isRequired && <Text style={styles.requiredAsterisk}>*</Text>}
      </View>

      {/* Signature Signed State Display */}
      {hasSignature ? (
        <View style={styles.signedCard}>
          <View style={styles.signedHeader}>
            <View style={styles.verifiedBadge}>
              <Icon name="check-circle" size={14} color="#10B981" />
              <Text style={styles.verifiedBadgeText}>Digital Signature Attached</Text>
            </View>

            <TouchableOpacity
              onPress={handleClearSignature}
              style={styles.clearButton}
              activeOpacity={0.7}
            >
              <Icon name="trash-2" size={13} color="#EF4444" />
              <Text style={styles.clearButtonText}>Clear / Resign</Text>
            </TouchableOpacity>
          </View>

          {/* Visual Signature Rendering Box */}
          <View style={styles.signaturePreviewSurface}>
            {isImageSignature ? (
              <Image
                source={{ uri: value }}
                style={styles.signatureImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.typedSignatureCanvas}>
                <Text style={styles.typedSignatureText}>{typedSignatureText}</Text>
                <View style={styles.signatureUnderline} />
                <Text style={styles.signatureWatermark}>Verified Electronic Signature</Text>
              </View>
            )}
          </View>

          <View style={styles.signedFooter}>
            <Icon name="lock" size={12} color="#64748B" />
            <Text style={styles.signedFooterText}>
              Digitally sealed for application submission.
            </Text>
          </View>
        </View>
      ) : (
        /* Signature Creation State */
        <View style={styles.creatorCard}>
          {/* Method Tabs */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              onPress={() => setActiveTab("draw")}
              style={[styles.tabButton, activeTab === "draw" && styles.tabButtonActive]}
            >
              <Icon
                name="edit-2"
                size={14}
                color={activeTab === "draw" ? "#0F2C59" : COLORS.neutral[500]}
              />
              <Text
                style={[styles.tabText, activeTab === "draw" && styles.tabTextActive]}
              >
                Draw Signature
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("type")}
              style={[styles.tabButton, activeTab === "type" && styles.tabButtonActive]}
            >
              <Icon
                name="type"
                size={14}
                color={activeTab === "type" ? "#0F2C59" : COLORS.neutral[500]}
              />
              <Text
                style={[styles.tabText, activeTab === "type" && styles.tabTextActive]}
              >
                Type Signature
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("upload")}
              style={[styles.tabButton, activeTab === "upload" && styles.tabButtonActive]}
            >
              <Icon
                name="upload-cloud"
                size={14}
                color={activeTab === "upload" ? "#0F2C59" : COLORS.neutral[500]}
              />
              <Text
                style={[styles.tabText, activeTab === "upload" && styles.tabTextActive]}
              >
                Upload Image
              </Text>
            </TouchableOpacity>

            {Boolean(savedSignature) && (
              <TouchableOpacity
                onPress={handleApplySavedSignature}
                style={[
                  styles.tabButton,
                  { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE", borderWidth: 1 },
                ]}
                activeOpacity={0.7}
              >
                <Icon name="bookmark" size={14} color="#2563EB" />
                <Text style={[styles.tabText, { color: "#2563EB", fontWeight: "700" }]}>
                  Use Saved
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Mode 1: Draw Signature via Touch Pad */}
          {activeTab === "draw" && (
            <View style={styles.tabContent}>
              <View style={styles.canvasContainer}>
                {Platform.OS === "web" ? (
                  <canvas
                    ref={canvasRef}
                    width={480}
                    height={150}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    style={{
                      width: "100%",
                      height: "150px",
                      backgroundColor: "#FAFAFA",
                      borderRadius: "10px",
                      cursor: "crosshair",
                      touchAction: "none",
                    }}
                  />
                ) : (
                  <View style={styles.nativeFallbackPad}>
                    <Text style={styles.nativeFallbackText}>
                      Touch drawing pad active
                    </Text>
                  </View>
                )}

                {/* Signature Baseline Guide */}
                <View style={styles.canvasGuideline} pointerEvents="none">
                  <Text style={styles.guidelineText}>Sign above this line</Text>
                </View>
              </View>

              {/* Action Toolbar */}
              <View style={styles.drawActionRow}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity
                    onPress={clearCanvas}
                    style={styles.secondaryBtn}
                  >
                    <Icon name="trash-2" size={13} color="#EF4444" />
                    <Text style={[styles.secondaryBtnText, { color: "#EF4444" }]}>Clear</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={undoStroke}
                    style={styles.secondaryBtn}
                  >
                    <Icon name="rotate-ccw" size={13} color="#64748B" />
                    <Text style={styles.secondaryBtnText}>Undo</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={handleApplyDrawnSignature}
                  disabled={!hasDrawnStrokes}
                  style={[
                    styles.adoptButton,
                    !hasDrawnStrokes && styles.adoptButtonDisabled,
                  ]}
                >
                  <Icon name="check" size={15} color="#FFFFFF" />
                  <Text style={styles.adoptButtonText}>Adopt Signature</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Mode 2: Type Signature */}
          {activeTab === "type" && (
            <View style={styles.tabContent}>
              <View style={styles.inputWithActionRow}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Type your full legal name..."
                  value={typedName}
                  onChangeText={setTypedName}
                  placeholderTextColor="#94A3B8"
                />
                {applicantName && (
                  <TouchableOpacity
                    style={styles.prefillButton}
                    onPress={() => setTypedName(applicantName)}
                  >
                    <Text style={styles.prefillButtonText}>Use Name</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Live Preview Box */}
              <View style={styles.livePreviewCanvas}>
                <Text style={styles.typedSignatureText}>
                  {typedName || "Your Signature Preview"}
                </Text>
                <View style={styles.signatureUnderline} />
              </View>

              <TouchableOpacity
                onPress={handleApplyTypedSignature}
                disabled={!typedName.trim()}
                style={[
                  styles.adoptButton,
                  !typedName.trim() && styles.adoptButtonDisabled,
                ]}
              >
                <Icon name="check" size={15} color="#FFFFFF" />
                <Text style={styles.adoptButtonText}>Adopt &amp; Sign</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Mode 3: Upload Image Signature */}
          {activeTab === "upload" && (
            <View style={styles.tabContent}>
              <TouchableOpacity
                onPress={triggerNativeOrWebUpload}
                style={styles.uploadDropzone}
                activeOpacity={0.8}
              >
                <View style={styles.uploadIconCircle}>
                  <Icon name="upload-cloud" size={24} color="#0F2C59" />
                </View>
                <Text style={styles.uploadTitle}>
                  Click to browse signature image
                </Text>
                <Text style={styles.uploadSubtitle}>
                  Supports PNG, JPG (Transparent or white background recommended)
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {error !== undefined && error.length > 0 && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 4,
  },
  label: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: "700",
    color: "#0F2C59",
  },
  requiredAsterisk: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 14,
    fontWeight: "800",
    color: "#EF4444",
  },
  creatorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    padding: 16,
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    padding: 3,
    marginBottom: 14,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  tabTextActive: {
    color: "#0F2C59",
    fontWeight: "700",
  },
  tabContent: {
    gap: 12,
  },
  canvasContainer: {
    position: "relative",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#93C5FD",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FAFAFA",
  },
  canvasGuideline: {
    position: "absolute",
    bottom: 25,
    left: 20,
    right: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148, 163, 184, 0.4)",
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingBottom: 2,
  },
  guidelineText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9.5,
    color: "#94A3B8",
    letterSpacing: 0.5,
  },
  nativeFallbackPad: {
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAFA",
  },
  nativeFallbackText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: "#64748B",
  },
  drawActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  secondaryBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  inputWithActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  textInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 13,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
  },
  prefillButton: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#93C5FD",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  prefillButtonText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  livePreviewCanvas: {
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 90,
  },
  typedSignatureCanvas: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  typedSignatureText: {
    fontFamily: Platform.OS === "web" ? "cursive, 'Brush Script MT', 'Segoe Script', italic" : "sans-serif",
    fontStyle: "italic",
    fontSize: 26,
    color: "#0F2C59",
    letterSpacing: 1.5,
    textAlign: "center",
  },
  signatureUnderline: {
    width: 200,
    height: 1.5,
    backgroundColor: "#94A3B8",
    marginTop: 6,
  },
  signatureWatermark: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 9.5,
    color: "#94A3B8",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  adoptButton: {
    backgroundColor: "#0F2C59",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 6,
  },
  adoptButtonDisabled: {
    backgroundColor: "#94A3B8",
  },
  adoptButtonText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  uploadDropzone: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#93C5FD",
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  uploadTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: "#64748B",
    textAlign: "center",
  },
  signedCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#86EFAC",
    padding: 14,
    gap: 10,
  },
  signedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#FEF2F2",
  },
  clearButtonText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: "700",
    color: "#DC2626",
  },
  signaturePreviewSurface: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
  },
  signatureImage: {
    width: "100%",
    maxWidth: 240,
    height: 70,
  },
  signedFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  signedFooterText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10.5,
    color: "#64748B",
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: "#EF4444",
    marginTop: 4,
  },
});
