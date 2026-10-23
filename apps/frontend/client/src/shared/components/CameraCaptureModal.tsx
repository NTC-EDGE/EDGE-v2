import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Icon, COLORS, TYPOGRAPHY } from '@edge/ui';

export interface CapturedPhoto {
  name: string;
  uri: string;
  type: string;
  file?: File | Blob;
}

export interface CameraCaptureModalProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (photo: CapturedPhoto) => void;
  onFallbackToFilePick?: () => void;
  title?: string;
  instructionText?: string;
}

export function CameraCaptureModal({
  visible,
  onClose,
  onCapture,
  onFallbackToFilePick,
  title = 'Take Document Photo',
  instructionText = 'Position your document or ID clearly inside the camera frame',
}: CameraCaptureModalProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 640;

  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  const [capturedPreviewUrl, setCapturedPreviewUrl] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedFileName, setCapturedFileName] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    if (streamRef.current !== null) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current !== null) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setIsLoadingCamera(false);
  };

  const startCamera = async (mode: 'environment' | 'user') => {
    stopCamera();
    setErrorMessage(null);
    setIsLoadingCamera(true);

    if (
      Platform.OS !== 'web' ||
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== 'function'
    ) {
      setIsLoadingCamera(false);
      setErrorMessage(
        'Camera access is not directly available in this environment. Please choose a file from your device instead.'
      );
      return;
    }

    try {
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch {
        // Fallback to any available video stream
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      if (stream !== null) {
        streamRef.current = stream;
        setIsStreaming(true);
        setIsLoadingCamera(false);

        if (videoRef.current !== null) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch {
            // Autoplay policy handled
          }
        }
      }
    } catch (err: unknown) {
      setIsLoadingCamera(false);
      console.warn('Camera access error:', err);

      const errName =
        typeof err === 'object' && err !== null && 'name' in err
          ? String(err.name)
          : '';

      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        setErrorMessage(
          'Camera access was denied. Please allow camera permissions in your browser address bar settings to take a photo.'
        );
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        setErrorMessage(
          'No camera device was detected on your computer or device. Please upload a saved document or photo.'
        );
      } else {
        setErrorMessage(
          'Could not start camera. Please verify camera permissions or choose a file from your device.'
        );
      }
    }
  };

  const checkMultipleCameras = async () => {
    if (
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.enumerateDevices === 'function'
    ) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    if (visible) {
      setCapturedPreviewUrl(null);
      setCapturedBlob(null);
      setCapturedFileName(null);
      setErrorMessage(null);
      void checkMultipleCameras();
      void startCamera(facingMode);
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [visible]);

  const handleSnapPhoto = () => {
    const video = videoRef.current;
    if (video === null || video.videoWidth === 0 || video.videoHeight === 0) {
      return;
    }

    if (typeof document === 'undefined') return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx === null) return;

    // If front-facing camera, mirror snapshot to match preview
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob !== null) {
          const previewUrl = URL.createObjectURL(blob);
          const fileName = `document_photo_${Date.now()}.jpg`;
          setCapturedPreviewUrl(previewUrl);
          setCapturedBlob(blob);
          setCapturedFileName(fileName);

          if (videoRef.current !== null) {
            videoRef.current.pause();
          }
        }
      },
      'image/jpeg',
      0.92
    );
  };

  const handleRetake = () => {
    if (capturedPreviewUrl !== null && typeof URL !== 'undefined') {
      URL.revokeObjectURL(capturedPreviewUrl);
    }
    setCapturedPreviewUrl(null);
    setCapturedBlob(null);
    setCapturedFileName(null);

    if (videoRef.current !== null) {
      void videoRef.current.play();
    }
  };

  const handleConfirmPhoto = () => {
    if (capturedBlob === null || capturedPreviewUrl === null) {
      return;
    }

    const fileName = capturedFileName ?? `document_photo_${Date.now()}.jpg`;
    const photoFile =
      typeof File !== 'undefined'
        ? new File([capturedBlob], fileName, { type: 'image/jpeg' })
        : capturedBlob;

    onCapture({
      name: fileName,
      uri: capturedPreviewUrl,
      type: 'image/jpeg',
      file: photoFile,
    });

    stopCamera();
    onClose();
  };

  const handleToggleCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    void startCamera(nextMode);
  };

  const handleCloseModal = () => {
    stopCamera();
    if (capturedPreviewUrl !== null && typeof URL !== 'undefined') {
      URL.revokeObjectURL(capturedPreviewUrl);
    }
    setCapturedPreviewUrl(null);
    setCapturedBlob(null);
    setCapturedFileName(null);
    setErrorMessage(null);
    onClose();
  };

  const handleSwitchToFilePicker = () => {
    handleCloseModal();
    if (onFallbackToFilePick !== undefined) {
      onFallbackToFilePick();
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCloseModal}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.modalContainer,
            { maxWidth: isMobile ? '96%' : 560 },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconBox}>
                <Icon name="camera" size={20} color={COLORS.neutral.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  {instructionText}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleCloseModal}
              style={styles.closeBtn}
              accessibilityLabel="Close camera"
            >
              <Icon name="x" size={18} color={COLORS.neutral.white} />
            </TouchableOpacity>
          </View>

          {/* Viewfinder / Camera Surface */}
          <View style={styles.viewfinderContainer}>
            {capturedPreviewUrl !== null ? (
              // Review Mode: Captured Image Preview
              <View style={styles.previewBox}>
                <Image
                  source={{ uri: capturedPreviewUrl }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
                <View style={styles.reviewBadge}>
                  <Icon name="check-circle" size={13} color="#22C55E" />
                  <Text style={styles.reviewBadgeText}>Photo Captured - Check clarity</Text>
                </View>
              </View>
            ) : errorMessage !== null ? (
              // Error State
              <View style={styles.errorBox}>
                <View style={styles.errorIconCircle}>
                  <Icon name="alert-circle" size={28} color="#EF4444" />
                </View>
                <Text style={styles.errorTitle}>Camera Unavailable</Text>
                <Text style={styles.errorDesc}>{errorMessage}</Text>

                <View style={styles.errorActionsRow}>
                  <TouchableOpacity
                    onPress={() => void startCamera(facingMode)}
                    style={styles.retryBtn}
                  >
                    <Icon name="refresh-cw" size={14} color={COLORS.neutral.white} />
                    <Text style={styles.retryBtnText}>Try Again</Text>
                  </TouchableOpacity>

                  {onFallbackToFilePick !== undefined && (
                    <TouchableOpacity
                      onPress={handleSwitchToFilePicker}
                      style={styles.fallbackBtn}
                    >
                      <Icon name="file-text" size={14} color="#0284c7" />
                      <Text style={styles.fallbackBtnText}>Choose from Files Instead</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ) : (
              // Live Video Stream Viewfinder
              <View style={styles.liveVideoBox}>
                {isLoadingCamera && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                    <Text style={styles.loadingText}>Starting device camera...</Text>
                  </View>
                )}

                {Platform.OS === 'web' &&
                  React.createElement('video', {
                    ref: (el: HTMLVideoElement | null) => {
                      videoRef.current = el;
                      if (el !== null && streamRef.current !== null && el.srcObject !== streamRef.current) {
                        el.srcObject = streamRef.current;
                        el.play().catch(() => {});
                      }
                    },
                    autoPlay: true,
                    playsInline: true,
                    muted: true,
                    style: {
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: 10,
                      backgroundColor: '#000000',
                    },
                  })}

                {/* Framing Overlay Guidelines for Document Capture */}
                {isStreaming && (
                  <View pointerEvents="none" style={styles.framingOverlay}>
                    <View style={styles.frameCornerTL} />
                    <View style={styles.frameCornerTR} />
                    <View style={styles.frameCornerBL} />
                    <View style={styles.frameCornerBR} />
                    <View style={styles.frameGuideBox}>
                      <Text style={styles.frameGuideText}>Align Document Here</Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Bottom Controls Bar */}
          <View style={styles.controlsBar}>
            {capturedPreviewUrl !== null ? (
              // Actions when photo is taken: Retake or Confirm
              <View style={styles.reviewActionsRow}>
                <TouchableOpacity
                  onPress={handleRetake}
                  style={styles.retakeBtn}
                >
                  <Icon name="rotate-ccw" size={16} color={COLORS.neutral.white} />
                  <Text style={styles.retakeBtnText}>Retake Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleConfirmPhoto}
                  style={styles.usePhotoBtn}
                >
                  <Icon name="check" size={16} color={COLORS.neutral.white} />
                  <Text style={styles.usePhotoBtnText}>Use This Photo</Text>
                </TouchableOpacity>
              </View>
            ) : errorMessage === null ? (
              // Live camera controls: Shutter & Switch Camera
              <View style={styles.liveControlsRow}>
                <View style={styles.controlSide}>
                  {hasMultipleCameras && (
                    <TouchableOpacity
                      onPress={handleToggleCamera}
                      style={styles.switchCameraBtn}
                      accessibilityLabel="Switch Camera"
                    >
                      <Icon name="repeat" size={16} color={COLORS.neutral.white} />
                      <Text style={styles.switchCameraText}>Flip</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Shutter Button */}
                <TouchableOpacity
                  onPress={handleSnapPhoto}
                  disabled={!isStreaming}
                  style={[
                    styles.shutterBtn,
                    !isStreaming && { opacity: 0.5 },
                  ]}
                  accessibilityLabel="Take Photo"
                >
                  <View style={styles.shutterInnerCircle}>
                    <Icon name="camera" size={24} color="#0F172A" />
                  </View>
                </TouchableOpacity>

                <View style={styles.controlSide}>
                  {onFallbackToFilePick !== undefined && (
                    <TouchableOpacity
                      onPress={handleSwitchToFilePicker}
                      style={styles.filePickerFallbackBtn}
                      accessibilityLabel="Upload file instead"
                    >
                      <Icon name="file-text" size={14} color="#94A3B8" />
                      <Text style={styles.filePickerFallbackText}>Files</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  viewfinderContainer: {
    width: '100%',
    height: 380,
    backgroundColor: '#000000',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveVideoBox: {
    width: '100%',
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    zIndex: 10,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#E2E8F0',
  },
  previewBox: {
    width: '100%',
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  reviewBadge: {
    position: 'absolute',
    top: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  reviewBadgeText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  framingOverlay: {
    position: 'absolute',
    top: 24,
    left: 24,
    right: 24,
    bottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 12,
  },
  frameCornerTL: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 24,
    height: 24,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#38BDF8',
    borderTopLeftRadius: 10,
  },
  frameCornerTR: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 24,
    height: 24,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#38BDF8',
    borderTopRightRadius: 10,
  },
  frameCornerBL: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 24,
    height: 24,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#38BDF8',
    borderBottomLeftRadius: 10,
  },
  frameCornerBR: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#38BDF8',
    borderBottomRightRadius: 10,
  },
  frameGuideBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  frameGuideText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: '700',
    color: '#E2E8F0',
    letterSpacing: 0.5,
  },
  errorBox: {
    padding: 24,
    alignItems: 'center',
    maxWidth: 380,
    gap: 10,
  },
  errorIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  errorTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  errorDesc: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  errorActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginTop: 8,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fallbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
    borderWidth: 1,
    borderColor: '#0284c7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  fallbackBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: '600',
    color: '#38BDF8',
  },
  controlsBar: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    minHeight: 84,
    justifyContent: 'center',
  },
  liveControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlSide: {
    width: 60,
    alignItems: 'center',
  },
  shutterBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  shutterInnerCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchCameraBtn: {
    alignItems: 'center',
    gap: 2,
    padding: 6,
  },
  switchCameraText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  filePickerFallbackBtn: {
    alignItems: 'center',
    gap: 2,
    padding: 6,
  },
  filePickerFallbackText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  reviewActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  retakeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 12,
    borderRadius: 10,
  },
  retakeBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  usePhotoBtn: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    borderRadius: 10,
  },
  usePhotoBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
