import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  ScrollView,
} from 'react-native';
import { Feather as Lucide } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

export interface EditedImageResult {
  uri: string;
  name: string;
  type: string;
  file?: File | Blob;
  blob?: Blob;
  width: number;
  height: number;
  rotation: number;
  cropped: boolean;
}

export type AspectRatioPreset = 'free' | 'doc' | 'card' | '1:1' | 'orig';

export interface ImageCropRotateModalProps {
  visible: boolean;
  imageUri: string | null;
  fileName?: string;
  title?: string;
  onClose: () => void;
  onApply: (result: EditedImageResult) => void;
  onDownload?: (result: EditedImageResult) => void;
  allowDownload?: boolean;
}

interface CropPercent {
  left: number;   // 0 to 100
  top: number;    // 0 to 100
  right: number;  // 0 to 100
  bottom: number; // 0 to 100
}

const DEFAULT_CROP: CropPercent = {
  left: 4,
  top: 4,
  right: 96,
  bottom: 96,
};

const FULL_CROP: CropPercent = {
  left: 0,
  top: 0,
  right: 100,
  bottom: 100,
};

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(val, max));
}

export function ImageCropRotateModal({
  visible,
  imageUri,
  fileName = 'document.jpg',
  title = 'Crop & Rotate Document',
  onClose,
  onApply,
  onDownload,
  allowDownload = true,
}: ImageCropRotateModalProps) {
  const { isDark, colors } = useTheme();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isMobile = screenWidth < 680;

  const [rotation, setRotation] = useState<number>(0);
  const [flipHorizontal, setFlipHorizontal] = useState<boolean>(false);
  const [crop, setCrop] = useState<CropPercent>(DEFAULT_CROP);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioPreset>('free');

  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [viewportSize, setViewportSize] = useState<{ width: number; height: number }>({
    width: 600,
    height: 420,
  });

  // Track dragging state for crop box and handles
  const dragRef = useRef<{
    active: boolean;
    handle: string | null;
    startX: number;
    startY: number;
    startCrop: CropPercent;
    imgDispW: number;
    imgDispH: number;
  }>({
    active: false,
    handle: null,
    startX: 0,
    startY: 0,
    startCrop: DEFAULT_CROP,
    imgDispW: 0,
    imgDispH: 0,
  });

  // Reset state when a new image or modal visibility changes
  useEffect(() => {
    if (visible && imageUri !== null && imageUri.trim() !== '') {
      setRotation(0);
      setFlipHorizontal(false);
      setCrop(DEFAULT_CROP);
      setAspectRatio('free');
      setIsProcessing(false);

      if (typeof window !== 'undefined' && typeof window.Image !== 'undefined') {
        const testImg = new window.Image();
        testImg.onload = () => {
          setNaturalSize({
            width: testImg.naturalWidth || 800,
            height: testImg.naturalHeight || 600,
          });
        };
        testImg.onerror = () => {
          setNaturalSize({ width: 800, height: 600 });
        };
        testImg.src = imageUri;
      }
    } else {
      setNaturalSize(null);
    }
  }, [visible, imageUri]);

  // Rotated natural dimensions
  const isQuarterTurn = rotation === 90 || rotation === 270;
  const rotNaturalW = naturalSize !== null
    ? (isQuarterTurn ? naturalSize.height : naturalSize.width)
    : 800;
  const rotNaturalH = naturalSize !== null
    ? (isQuarterTurn ? naturalSize.width : naturalSize.height)
    : 600;

  // Viewport display calculations
  const vpW = Math.max(100, viewportSize.width);
  const vpH = Math.max(100, viewportSize.height);
  const scale = Math.min((vpW - 32) / rotNaturalW, (vpH - 32) / rotNaturalH, 1);
  const imgDispW = Math.max(80, Math.round(rotNaturalW * scale));
  const imgDispH = Math.max(80, Math.round(rotNaturalH * scale));
  const offsetX = Math.max(0, Math.round((vpW - imgDispW) / 2));
  const offsetY = Math.max(0, Math.round((vpH - imgDispH) / 2));

  // Pixel coordinates of crop rectangle inside viewport
  const cropPxLeft = offsetX + (crop.left / 100) * imgDispW;
  const cropPxTop = offsetY + (crop.top / 100) * imgDispH;
  const cropPxWidth = Math.max(20, ((crop.right - crop.left) / 100) * imgDispW);
  const cropPxHeight = Math.max(20, ((crop.bottom - crop.top) / 100) * imgDispH);

  // Rotation controls
  const handleRotateCW = () => {
    setRotation((r) => (r + 90) % 360);
  };

  const handleRotateCCW = () => {
    setRotation((r) => (r + 270) % 360);
  };

  const handleToggleFlip = () => {
    setFlipHorizontal((f) => !f);
  };

  const handleReset = () => {
    setRotation(0);
    setFlipHorizontal(false);
    setCrop(DEFAULT_CROP);
    setAspectRatio('free');
  };

  const handleFitFull = () => {
    setCrop(FULL_CROP);
    setAspectRatio('free');
  };

  const handleApplyPreset = (preset: AspectRatioPreset) => {
    setAspectRatio(preset);
    let targetRatio = 0; // width / height

    if (preset === 'doc') {
      targetRatio = 1 / 1.414; // A4 portrait standard
    } else if (preset === 'card') {
      targetRatio = 1.586; // Standard CR80 ID Card
    } else if (preset === '1:1') {
      targetRatio = 1.0;
    } else if (preset === 'orig') {
      targetRatio = rotNaturalW / rotNaturalH;
    } else {
      return; // Free mode, keep current crop
    }

    // Adjust crop box around center to fit target ratio
    const currentRotRatio = rotNaturalW / rotNaturalH;
    let newCropW = 90;
    let newCropH = 90;

    if (targetRatio > currentRotRatio) {
      // Wider than image: clamp width to 90%, height shrinks
      newCropW = 90;
      newCropH = Math.min(90, (90 * currentRotRatio) / targetRatio);
    } else {
      // Taller than image: clamp height to 90%, width shrinks
      newCropH = 90;
      newCropW = Math.min(90, (90 * targetRatio) / currentRotRatio);
    }

    const halfW = newCropW / 2;
    const halfH = newCropH / 2;
    setCrop({
      left: Math.round(50 - halfW),
      top: Math.round(50 - halfH),
      right: Math.round(50 + halfW),
      bottom: Math.round(50 + halfH),
    });
  };

  // Dragging handlers for interactive mouse and touch
  const handlePointerDown = (handle: string, clientX: number, clientY: number) => {
    dragRef.current = {
      active: true,
      handle,
      startX: clientX,
      startY: clientY,
      startCrop: { ...crop },
      imgDispW,
      imgDispH,
    };
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!dragRef.current.active) return;
    const { handle, startX, startY, startCrop, imgDispW: w, imgDispH: h } = dragRef.current;
    if (w <= 0 || h <= 0) return;

    const deltaXPercent = ((clientX - startX) / w) * 100;
    const deltaYPercent = ((clientY - startY) / h) * 100;
    const minSize = 10; // Minimum 10% crop box

    if (handle === 'box') {
      const boxW = startCrop.right - startCrop.left;
      const boxH = startCrop.bottom - startCrop.top;
      const newLeft = clamp(startCrop.left + deltaXPercent, 0, 100 - boxW);
      const newTop = clamp(startCrop.top + deltaYPercent, 0, 100 - boxH);
      setCrop({
        left: Math.round(newLeft),
        top: Math.round(newTop),
        right: Math.round(newLeft + boxW),
        bottom: Math.round(newTop + boxH),
      });
      return;
    }

    let nextLeft = startCrop.left;
    let nextTop = startCrop.top;
    let nextRight = startCrop.right;
    let nextBottom = startCrop.bottom;

    if (handle === 'tl' || handle === 'l' || handle === 'bl') {
      nextLeft = clamp(startCrop.left + deltaXPercent, 0, nextRight - minSize);
    }
    if (handle === 'tr' || handle === 'r' || handle === 'br') {
      nextRight = clamp(startCrop.right + deltaXPercent, nextLeft + minSize, 100);
    }
    if (handle === 'tl' || handle === 't' || handle === 'tr') {
      nextTop = clamp(startCrop.top + deltaYPercent, 0, nextBottom - minSize);
    }
    if (handle === 'bl' || handle === 'b' || handle === 'br') {
      nextBottom = clamp(startCrop.bottom + deltaYPercent, nextTop + minSize, 100);
    }

    setCrop({
      left: Math.round(nextLeft),
      top: Math.round(nextTop),
      right: Math.round(nextRight),
      bottom: Math.round(nextBottom),
    });
  };

  const handlePointerUp = () => {
    dragRef.current.active = false;
    dragRef.current.handle = null;
  };

  // Offscreen Canvas Export Processing
  const processCanvasExport = useCallback(async (): Promise<EditedImageResult | null> => {
    if (imageUri === null || typeof document === 'undefined') return null;

    const img = new window.Image();
    img.crossOrigin = 'anonymous';

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Image failed to load for crop'));
      img.src = imageUri;
    });

    const origW = img.naturalWidth || 800;
    const origH = img.naturalHeight || 600;

    // 1. Render rotated intermediate canvas
    const rotW = isQuarterTurn ? origH : origW;
    const rotH = isQuarterTurn ? origW : origH;

    const rotCanvas = document.createElement('canvas');
    rotCanvas.width = rotW;
    rotCanvas.height = rotH;
    const rotCtx = rotCanvas.getContext('2d');
    if (rotCtx === null) return null;

    rotCtx.translate(rotW / 2, rotH / 2);
    rotCtx.rotate((rotation * Math.PI) / 180);
    if (flipHorizontal) {
      rotCtx.scale(-1, 1);
    }
    rotCtx.drawImage(img, -origW / 2, -origH / 2, origW, origH);

    // 2. Crop from rotated canvas
    const srcX = Math.round((crop.left / 100) * rotW);
    const srcY = Math.round((crop.top / 100) * rotH);
    const srcW = Math.max(1, Math.round(((crop.right - crop.left) / 100) * rotW));
    const srcH = Math.max(1, Math.round(((crop.bottom - crop.top) / 100) * rotH));

    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = srcW;
    finalCanvas.height = srcH;
    const finalCtx = finalCanvas.getContext('2d');
    if (finalCtx === null) return null;

    finalCtx.drawImage(rotCanvas, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);

    const blob = await new Promise<Blob | null>((resolve) => {
      finalCanvas.toBlob((b) => resolve(b), 'image/jpeg', 0.92);
    });

    if (blob === null) return null;

    const previewUrl = URL.createObjectURL(blob);
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    const cleanOutputName = `${baseName}_cropped.jpg`;
    const photoFile = typeof File !== 'undefined'
      ? new File([blob], cleanOutputName, { type: 'image/jpeg' })
      : blob;

    const isCropped = crop.left > 1 || crop.top > 1 || crop.right < 99 || crop.bottom < 99;

    return {
      uri: previewUrl,
      name: cleanOutputName,
      type: 'image/jpeg',
      file: photoFile,
      blob: blob,
      width: srcW,
      height: srcH,
      rotation,
      cropped: isCropped || rotation !== 0 || flipHorizontal,
    };
  }, [imageUri, isQuarterTurn, rotation, flipHorizontal, crop, fileName]);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      const result = await processCanvasExport();
      if (result !== null) {
        onApply(result);
        onClose();
      }
    } catch (err) {
      console.warn('Crop processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadCropped = async () => {
    setIsProcessing(true);
    try {
      const result = await processCanvasExport();
      if (result !== null) {
        if (onDownload !== undefined) {
          onDownload(result);
        } else if (Platform.OS === 'web' && typeof document !== 'undefined') {
          const a = document.createElement('a');
          a.href = result.uri;
          a.download = result.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      }
    } catch (err) {
      console.warn('Download cropped error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!visible || imageUri === null) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={styles.backdrop}
        onStartShouldSetResponder={() => true}
        onResponderMove={(e) => {
          handlePointerMove(e.nativeEvent.pageX, e.nativeEvent.pageY);
        }}
        onResponderRelease={handlePointerUp}
      >
        <View
          style={[
            styles.modalContainer,
            { maxWidth: isMobile ? '98%' : 920, maxHeight: isMobile ? '98%' : '92%' },
            isDark ? { backgroundColor: '#0B1120', borderColor: '#1E293B' } : { backgroundColor: '#0F172A', borderColor: '#334155' },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconCircle}>
                <Lucide name="crop" size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>{title}</Text>
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  {fileName} · Rotate, crop borders, and align document
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityLabel="Cancel editing"
            >
              <Lucide name="x" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Quick Toolbar: Aspect ratio presets & rotation buttons */}
          <View style={styles.toolbar}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.toolbarScroll}
            >
              {/* Rotation buttons */}
              <TouchableOpacity
                onPress={handleRotateCCW}
                style={styles.toolBtn}
                activeOpacity={0.7}
                accessibilityLabel="Rotate 90 degrees counter-clockwise"
              >
                <Lucide name="rotate-ccw" size={15} color="#E2E8F0" />
                <Text style={styles.toolBtnText}>90° Left</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleRotateCW}
                style={styles.toolBtn}
                activeOpacity={0.7}
                accessibilityLabel="Rotate 90 degrees clockwise"
              >
                <Lucide name="rotate-cw" size={15} color="#E2E8F0" />
                <Text style={styles.toolBtnText}>90° Right</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleToggleFlip}
                style={[styles.toolBtn, flipHorizontal && styles.toolBtnActive]}
                activeOpacity={0.7}
                accessibilityLabel="Flip horizontally"
              >
                <Lucide name="repeat" size={15} color={flipHorizontal ? '#38BDF8' : '#E2E8F0'} />
                <Text style={[styles.toolBtnText, flipHorizontal && { color: '#38BDF8' }]}>Flip</Text>
              </TouchableOpacity>

              <View style={styles.toolDivider} />

              {/* Aspect Ratio Presets */}
              <TouchableOpacity
                onPress={() => handleApplyPreset('free')}
                style={[styles.toolBtn, aspectRatio === 'free' && styles.toolBtnActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.toolBtnText, aspectRatio === 'free' && { color: '#38BDF8' }]}>Free</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleApplyPreset('doc')}
                style={[styles.toolBtn, aspectRatio === 'doc' && styles.toolBtnActive]}
                activeOpacity={0.7}
              >
                <Lucide name="file-text" size={13} color={aspectRatio === 'doc' ? '#38BDF8' : '#94A3B8'} />
                <Text style={[styles.toolBtnText, aspectRatio === 'doc' && { color: '#38BDF8' }]}>Document A4</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleApplyPreset('card')}
                style={[styles.toolBtn, aspectRatio === 'card' && styles.toolBtnActive]}
                activeOpacity={0.7}
              >
                <Lucide name="credit-card" size={13} color={aspectRatio === 'card' ? '#38BDF8' : '#94A3B8'} />
                <Text style={[styles.toolBtnText, aspectRatio === 'card' && { color: '#38BDF8' }]}>ID Card</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleApplyPreset('1:1')}
                style={[styles.toolBtn, aspectRatio === '1:1' && styles.toolBtnActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.toolBtnText, aspectRatio === '1:1' && { color: '#38BDF8' }]}>1:1</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleFitFull}
                style={styles.toolBtn}
                activeOpacity={0.7}
              >
                <Lucide name="maximize-2" size={14} color="#94A3B8" />
                <Text style={styles.toolBtnText}>Full Frame</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleReset}
                style={styles.toolBtn}
                activeOpacity={0.7}
              >
                <Lucide name="refresh-cw" size={13} color="#94A3B8" />
                <Text style={styles.toolBtnText}>Reset</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Viewport Surface */}
          <View
            style={styles.viewport}
            onLayout={(e) => {
              const { width, height } = e.nativeEvent.layout;
              if (width > 0 && height > 0) {
                setViewportSize({ width, height });
              }
            }}
          >
            {/* The Rotated Display Image */}
            <View
              style={[
                styles.imageContainer,
                {
                  width: imgDispW,
                  height: imgDispH,
                  left: offsetX,
                  top: offsetY,
                },
              ]}
            >
              <Image
                source={{ uri: imageUri }}
                style={[
                  styles.displayImage,
                  {
                    transform: [
                      { rotate: `${rotation}deg` },
                      { scaleX: flipHorizontal ? -1 : 1 },
                    ],
                  },
                ]}
                resizeMode="contain"
              />
            </View>

            {/* Dimmed Overlays around Crop Box */}
            {/* Top Dim */}
            <View
              pointerEvents="none"
              style={[
                styles.dimOverlay,
                {
                  left: offsetX,
                  top: offsetY,
                  width: imgDispW,
                  height: Math.max(0, cropPxTop - offsetY),
                },
              ]}
            />
            {/* Bottom Dim */}
            <View
              pointerEvents="none"
              style={[
                styles.dimOverlay,
                {
                  left: offsetX,
                  top: cropPxTop + cropPxHeight,
                  width: imgDispW,
                  height: Math.max(0, offsetY + imgDispH - (cropPxTop + cropPxHeight)),
                },
              ]}
            />
            {/* Left Dim */}
            <View
              pointerEvents="none"
              style={[
                styles.dimOverlay,
                {
                  left: offsetX,
                  top: cropPxTop,
                  width: Math.max(0, cropPxLeft - offsetX),
                  height: cropPxHeight,
                },
              ]}
            />
            {/* Right Dim */}
            <View
              pointerEvents="none"
              style={[
                styles.dimOverlay,
                {
                  left: cropPxLeft + cropPxWidth,
                  top: cropPxTop,
                  width: Math.max(0, offsetX + imgDispW - (cropPxLeft + cropPxWidth)),
                  height: cropPxHeight,
                },
              ]}
            />

            {/* The Crop Box */}
            <View
              style={[
                styles.cropBox,
                {
                  left: cropPxLeft,
                  top: cropPxTop,
                  width: cropPxWidth,
                  height: cropPxHeight,
                },
              ]}
              onStartShouldSetResponder={() => true}
              onResponderGrant={(e) => {
                handlePointerDown('box', e.nativeEvent.pageX, e.nativeEvent.pageY);
              }}
            >
              {/* 3x3 Rule-of-Thirds Grid */}
              <View pointerEvents="none" style={styles.gridLineH1} />
              <View pointerEvents="none" style={styles.gridLineH2} />
              <View pointerEvents="none" style={styles.gridLineV1} />
              <View pointerEvents="none" style={styles.gridLineV2} />

              {/* Edge Handles */}
              {/* Top Handle */}
              <View
                style={[styles.edgeHandle, styles.edgeHandleTop]}
                onStartShouldSetResponder={() => true}
                onResponderGrant={(e) => {
                  handlePointerDown('t', e.nativeEvent.pageX, e.nativeEvent.pageY);
                }}
              />
              {/* Bottom Handle */}
              <View
                style={[styles.edgeHandle, styles.edgeHandleBottom]}
                onStartShouldSetResponder={() => true}
                onResponderGrant={(e) => {
                  handlePointerDown('b', e.nativeEvent.pageX, e.nativeEvent.pageY);
                }}
              />
              {/* Left Handle */}
              <View
                style={[styles.edgeHandle, styles.edgeHandleLeft]}
                onStartShouldSetResponder={() => true}
                onResponderGrant={(e) => {
                  handlePointerDown('l', e.nativeEvent.pageX, e.nativeEvent.pageY);
                }}
              />
              {/* Right Handle */}
              <View
                style={[styles.edgeHandle, styles.edgeHandleRight]}
                onStartShouldSetResponder={() => true}
                onResponderGrant={(e) => {
                  handlePointerDown('r', e.nativeEvent.pageX, e.nativeEvent.pageY);
                }}
              />

              {/* Corner Handles */}
              {/* Top-Left */}
              <View
                style={[styles.cornerHandle, styles.cornerTL]}
                onStartShouldSetResponder={() => true}
                onResponderGrant={(e) => {
                  handlePointerDown('tl', e.nativeEvent.pageX, e.nativeEvent.pageY);
                }}
              />
              {/* Top-Right */}
              <View
                style={[styles.cornerHandle, styles.cornerTR]}
                onStartShouldSetResponder={() => true}
                onResponderGrant={(e) => {
                  handlePointerDown('tr', e.nativeEvent.pageX, e.nativeEvent.pageY);
                }}
              />
              {/* Bottom-Left */}
              <View
                style={[styles.cornerHandle, styles.cornerBL]}
                onStartShouldSetResponder={() => true}
                onResponderGrant={(e) => {
                  handlePointerDown('bl', e.nativeEvent.pageX, e.nativeEvent.pageY);
                }}
              />
              {/* Bottom-Right */}
              <View
                style={[styles.cornerHandle, styles.cornerBR]}
                onStartShouldSetResponder={() => true}
                onResponderGrant={(e) => {
                  handlePointerDown('br', e.nativeEvent.pageX, e.nativeEvent.pageY);
                }}
              />

              {/* Center Drag Hint Badge */}
              <View pointerEvents="none" style={styles.centerHintBadge}>
                <Lucide name="move" size={11} color="rgba(255, 255, 255, 0.85)" />
                <Text style={styles.centerHintText}>Drag to reposition</Text>
              </View>
            </View>
          </View>

          {/* Footer Controls */}
          <View style={styles.footer}>
            <View style={styles.footerInfo}>
              <Text style={styles.footerInfoText}>
                {rotation !== 0 ? `Rotated ${rotation}°` : '0°'}
                {flipHorizontal ? ' · Flipped' : ''}
                {` · Crop ${Math.round(((crop.right - crop.left) / 100) * rotNaturalW)} × ${Math.round(((crop.bottom - crop.top) / 100) * rotNaturalH)} px`}
              </Text>
            </View>

            <View style={styles.footerActions}>
              {allowDownload && (
                <TouchableOpacity
                  onPress={handleDownloadCropped}
                  disabled={isProcessing}
                  style={styles.downloadBtn}
                  activeOpacity={0.8}
                >
                  <Lucide name="download" size={15} color="#94A3B8" />
                  {!isMobile && <Text style={styles.downloadBtnText}>Download</Text>}
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={onClose}
                disabled={isProcessing}
                style={styles.cancelBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirm}
                disabled={isProcessing}
                style={styles.applyBtn}
                activeOpacity={0.8}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Lucide name="check" size={16} color="#FFFFFF" />
                    <Text style={styles.applyBtnText}>Apply & Save</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  modalContainer: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  headerSubtitle: {
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
  },
  toolbar: {
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingVertical: 6,
  },
  toolbarScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 6,
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  toolBtnActive: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  toolBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  toolDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#334155',
    marginHorizontal: 4,
  },
  viewport: {
    flex: 1,
    minHeight: 380,
    maxHeight: 520,
    backgroundColor: '#050811',
    position: 'relative',
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  displayImage: {
    width: '100%',
    height: '100%',
  },
  dimOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  cropBox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
  },
  gridLineH1: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '33.33%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  gridLineH2: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '66.66%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  gridLineV1: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '33.33%',
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  gridLineV2: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '66.66%',
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  cornerHandle: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderColor: '#FFFFFF',
    backgroundColor: '#38BDF8',
    borderRadius: 3,
  },
  cornerTL: {
    top: -6,
    left: -6,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTR: {
    top: -6,
    right: -6,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBL: {
    bottom: -6,
    left: -6,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBR: {
    bottom: -6,
    right: -6,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  edgeHandle: {
    position: 'absolute',
    backgroundColor: '#38BDF8',
    borderRadius: 2,
  },
  edgeHandleTop: {
    top: -4,
    left: '50%',
    marginLeft: -16,
    width: 32,
    height: 8,
  },
  edgeHandleBottom: {
    bottom: -4,
    left: '50%',
    marginLeft: -16,
    width: 32,
    height: 8,
  },
  edgeHandleLeft: {
    left: -4,
    top: '50%',
    marginTop: -16,
    width: 8,
    height: 32,
  },
  edgeHandleRight: {
    right: -4,
    top: '50%',
    marginTop: -16,
    width: 8,
    height: 32,
  },
  centerHintBadge: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
    marginTop: -12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  centerHintText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 10,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    gap: 12,
  },
  footerInfo: {
    flex: 1,
  },
  footerInfoText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 11,
    color: '#94A3B8',
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  downloadBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  cancelBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#16A34A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  applyBtnText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
