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

import {
  CropPercent,
  AspectRatioPreset,
  DragHandleType,
  DEFAULT_CROP,
  FULL_CROP,
  clamp,
  calculateNewCrop,
  computeCropForPreset,
  nudgeCropInset,
  nudgeCropExpand,
} from './imageCropUtils';

export {
  CropPercent,
  AspectRatioPreset,
  DragHandleType,
  DEFAULT_CROP,
  FULL_CROP,
  clamp,
  calculateNewCrop,
  computeCropForPreset,
  nudgeCropInset,
  nudgeCropExpand,
};

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

function getEventCoords(e: unknown): { x: number; y: number } {
  if (typeof e === 'object' && e !== null) {
    if ('nativeEvent' in e && typeof e.nativeEvent === 'object' && e.nativeEvent !== null) {
      const ne = e.nativeEvent;
      if ('touches' in ne && Array.isArray(ne.touches) && ne.touches.length > 0) {
        const t0 = ne.touches[0];
        if (typeof t0 === 'object' && t0 !== null) {
          if ('clientX' in t0 && typeof t0.clientX === 'number' && 'clientY' in t0 && typeof t0.clientY === 'number') {
            return { x: t0.clientX, y: t0.clientY };
          }
          if ('pageX' in t0 && typeof t0.pageX === 'number' && 'pageY' in t0 && typeof t0.pageY === 'number') {
            return { x: t0.pageX, y: t0.pageY };
          }
        }
      }
      if ('clientX' in ne && typeof ne.clientX === 'number' && 'clientY' in ne && typeof ne.clientY === 'number') {
        return { x: ne.clientX, y: ne.clientY };
      }
      if ('pageX' in ne && typeof ne.pageX === 'number' && 'pageY' in ne && typeof ne.pageY === 'number') {
        return { x: ne.pageX, y: ne.pageY };
      }
    }
    if ('clientX' in e && typeof e.clientX === 'number' && 'clientY' in e && typeof e.clientY === 'number') {
      return { x: e.clientX, y: e.clientY };
    }
    if ('pageX' in e && typeof e.pageX === 'number' && 'pageY' in e && typeof e.pageY === 'number') {
      return { x: e.pageX, y: e.pageY };
    }
  }
  return { x: 0, y: 0 };
}

function getElementBoundingBox(element: unknown): { left: number; top: number; width: number; height: number } | null {
  if (typeof element !== 'object' || element === null) return null;
  if ('getBoundingClientRect' in element && typeof element.getBoundingClientRect === 'function') {
    const rect = element.getBoundingClientRect();
    if (typeof rect === 'object' && rect !== null) {
      const left = typeof rect.left === 'number' ? rect.left : 0;
      const top = typeof rect.top === 'number' ? rect.top : 0;
      const width = typeof rect.width === 'number' ? rect.width : 0;
      const height = typeof rect.height === 'number' ? rect.height : 0;
      return { left, top, width, height };
    }
  }
  return null;
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
  const { isDark } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
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

  const viewportRef = useRef<View>(null);

  // Track active drag state for crop box and handles
  const dragRef = useRef<{
    active: boolean;
    handle: DragHandleType | null;
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

  // Inject web CSS cursor styles on web platforms
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const styleId = 'edge-crop-cursors-style';
    let styleTag = document.getElementById(styleId);
    if (styleTag === null) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      styleTag.textContent = `
        [data-testid="crop-viewport"] { cursor: crosshair !important; user-select: none !important; -webkit-user-select: none !important; }
        [data-testid="crop-box"] { cursor: move !important; user-select: none !important; -webkit-user-select: none !important; }
        [data-testid="crop-handle-tl"], [data-testid="crop-handle-br"] { cursor: nwse-resize !important; }
        [data-testid="crop-handle-tr"], [data-testid="crop-handle-bl"] { cursor: nesw-resize !important; }
        [data-testid="crop-handle-t"], [data-testid="crop-handle-b"] { cursor: ns-resize !important; }
        [data-testid="crop-handle-l"], [data-testid="crop-handle-r"] { cursor: ew-resize !important; }
      `;
      document.head.appendChild(styleTag);
    }
  }, []);

  // Reset state when modal opens with a new image
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

  const handleNudgeInset = () => {
    setAspectRatio('free');
    setCrop((c) => nudgeCropInset(c));
  };

  const handleNudgeExpand = () => {
    setAspectRatio('free');
    setCrop((c) => nudgeCropExpand(c));
  };

  const handleApplyPreset = (preset: AspectRatioPreset) => {
    setAspectRatio(preset);
    if (preset === 'free') return;
    const newCrop = computeCropForPreset(rotNaturalW, rotNaturalH, preset);
    setCrop(newCrop);
  };

  // Pointer drag start handler
  const handlePointerDown = (handle: DragHandleType, clientX: number, clientY: number) => {
    setAspectRatio('free');
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

  // Pointer drag move handler
  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!dragRef.current.active || dragRef.current.handle === null) return;
    const { handle, startX, startY, startCrop, imgDispW: w, imgDispH: h } = dragRef.current;
    if (w <= 0 || h <= 0) return;

    const deltaXPercent = ((clientX - startX) / w) * 100;
    const deltaYPercent = ((clientY - startY) / h) * 100;

    const newCrop = calculateNewCrop(handle, startCrop, deltaXPercent, deltaYPercent, 6);
    setCrop(newCrop);
  };

  // Pointer drag end handler
  const handlePointerUp = () => {
    dragRef.current.active = false;
    dragRef.current.handle = null;
  };

  // Viewport background click/drag handler: snaps closest edge or corner and initiates drag
  const handleViewportPointerDown = (e: unknown) => {
    const coords = getEventCoords(e);
    let relX = 0;
    let relY = 0;

    const rect = getElementBoundingBox(viewportRef.current);
    if (rect !== null) {
      relX = coords.x - rect.left;
      relY = coords.y - rect.top;
    } else if (typeof e === 'object' && e !== null && 'nativeEvent' in e) {
      const ne = e.nativeEvent;
      if (typeof ne === 'object' && ne !== null) {
        if ('locationX' in ne && typeof ne.locationX === 'number') {
          relX = ne.locationX;
        }
        if ('locationY' in ne && typeof ne.locationY === 'number') {
          relY = ne.locationY;
        }
      }
    }

    if (imgDispW <= 0 || imgDispH <= 0) return;

    const imgX = relX - offsetX;
    const imgY = relY - offsetY;
    const clickPctX = clamp((imgX / imgDispW) * 100, 0, 100);
    const clickPctY = clamp((imgY / imgDispH) * 100, 0, 100);

    setAspectRatio('free');

    let newCrop = { ...crop };
    let targetHandle: DragHandleType = 'box';

    const isLeft = clickPctX < crop.left;
    const isRight = clickPctX > crop.right;
    const isTop = clickPctY < crop.top;
    const isBottom = clickPctY > crop.bottom;

    if (isTop && isLeft) {
      newCrop = { ...newCrop, left: clickPctX, top: clickPctY };
      targetHandle = 'tl';
    } else if (isTop && isRight) {
      newCrop = { ...newCrop, right: clickPctX, top: clickPctY };
      targetHandle = 'tr';
    } else if (isBottom && isLeft) {
      newCrop = { ...newCrop, left: clickPctX, bottom: clickPctY };
      targetHandle = 'bl';
    } else if (isBottom && isRight) {
      newCrop = { ...newCrop, right: clickPctX, bottom: clickPctY };
      targetHandle = 'br';
    } else if (isTop) {
      newCrop = { ...newCrop, top: clickPctY };
      targetHandle = 't';
    } else if (isBottom) {
      newCrop = { ...newCrop, bottom: clickPctY };
      targetHandle = 'b';
    } else if (isLeft) {
      newCrop = { ...newCrop, left: clickPctX };
      targetHandle = 'l';
    } else if (isRight) {
      newCrop = { ...newCrop, right: clickPctX };
      targetHandle = 'r';
    } else {
      targetHandle = 'box';
    }

    setCrop(newCrop);
    dragRef.current = {
      active: true,
      handle: targetHandle,
      startX: coords.x,
      startY: coords.y,
      startCrop: newCrop,
      imgDispW,
      imgDispH,
    };
  };

  // Window global listeners for web to ensure smooth dragging across entire window
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    const onWindowMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.active) return;
      e.preventDefault();
      handlePointerMove(e.clientX, e.clientY);
    };

    const onWindowMouseUp = () => {
      if (dragRef.current.active) {
        handlePointerUp();
      }
    };

    const onWindowTouchMove = (e: TouchEvent) => {
      if (!dragRef.current.active) return;
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        if (touch !== undefined) {
          handlePointerMove(touch.clientX, touch.clientY);
        }
      }
    };

    const onWindowTouchEnd = () => {
      if (dragRef.current.active) {
        handlePointerUp();
      }
    };

    window.addEventListener('mousemove', onWindowMouseMove);
    window.addEventListener('mouseup', onWindowMouseUp);
    window.addEventListener('touchmove', onWindowTouchMove);
    window.addEventListener('touchend', onWindowTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onWindowMouseMove);
      window.removeEventListener('mouseup', onWindowMouseUp);
      window.removeEventListener('touchmove', onWindowTouchMove);
      window.removeEventListener('touchend', onWindowTouchEnd);
    };
  }, []);

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
          const coords = getEventCoords(e);
          handlePointerMove(coords.x, coords.y);
        }}
        onResponderRelease={handlePointerUp}
      >
        <View
          style={[
            styles.modalContainer,
            { maxWidth: isMobile ? '98%' : 940, maxHeight: isMobile ? '98%' : '92%' },
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
                  {fileName} · Drag handles freely, rotate, or align borders
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

          {/* Quick Toolbar: Presets, Rotation & Nudge Controls */}
          <View style={styles.toolbar}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.toolbarScroll}
            >
              {/* Rotation & Flip Buttons */}
              <TouchableOpacity
                onPress={handleRotateCCW}
                style={styles.toolBtn}
                activeOpacity={0.7}
                accessibilityLabel="Rotate 90 degrees counter-clockwise"
              >
                <Lucide name="rotate-ccw" size={14} color="#E2E8F0" />
                <Text style={styles.toolBtnText}>90° Left</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleRotateCW}
                style={styles.toolBtn}
                activeOpacity={0.7}
                accessibilityLabel="Rotate 90 degrees clockwise"
              >
                <Lucide name="rotate-cw" size={14} color="#E2E8F0" />
                <Text style={styles.toolBtnText}>90° Right</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleToggleFlip}
                style={[styles.toolBtn, flipHorizontal && styles.toolBtnActive]}
                activeOpacity={0.7}
                accessibilityLabel="Flip horizontally"
              >
                <Lucide name="repeat" size={14} color={flipHorizontal ? '#38BDF8' : '#E2E8F0'} />
                <Text style={[styles.toolBtnText, flipHorizontal && { color: '#38BDF8' }]}>Flip</Text>
              </TouchableOpacity>

              <View style={styles.toolDivider} />

              {/* Aspect Ratio Presets */}
              <TouchableOpacity
                onPress={() => handleApplyPreset('free')}
                style={[styles.toolBtn, aspectRatio === 'free' && styles.toolBtnActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.toolBtnText, aspectRatio === 'free' && { color: '#38BDF8' }]}>Free Crop</Text>
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

              <View style={styles.toolDivider} />

              {/* Nudge Inset & Expand */}
              <TouchableOpacity
                onPress={handleNudgeInset}
                style={styles.toolBtn}
                activeOpacity={0.7}
                accessibilityLabel="Inset crop box slightly"
              >
                <Lucide name="minimize-2" size={13} color="#94A3B8" />
                <Text style={styles.toolBtnText}>+ Inset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleNudgeExpand}
                style={styles.toolBtn}
                activeOpacity={0.7}
                accessibilityLabel="Expand crop box slightly"
              >
                <Lucide name="maximize-2" size={13} color="#94A3B8" />
                <Text style={styles.toolBtnText}>- Expand</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleFitFull}
                style={styles.toolBtn}
                activeOpacity={0.7}
              >
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
            ref={viewportRef}
            testID="crop-viewport"
            style={styles.viewport}
            onLayout={(e) => {
              const { width, height } = e.nativeEvent.layout;
              if (width > 0 && height > 0) {
                setViewportSize({ width, height });
              }
            }}
            onStartShouldSetResponder={() => true}
            onResponderGrant={handleViewportPointerDown}
            onResponderMove={(e) => {
              const coords = getEventCoords(e);
              handlePointerMove(coords.x, coords.y);
            }}
            onResponderRelease={handlePointerUp}
          >
            {/* The Rotated Display Image (pointerEvents none so it won't interfere with mouse drag) */}
            <View
              pointerEvents="none"
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

            {/* The Interactive Crop Box */}
            <View
              testID="crop-box"
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
                const coords = getEventCoords(e);
                handlePointerDown('box', coords.x, coords.y);
              }}
              onResponderMove={(e) => {
                const coords = getEventCoords(e);
                handlePointerMove(coords.x, coords.y);
              }}
              onResponderRelease={handlePointerUp}
            >
              {/* 3x3 Rule-of-Thirds Grid */}
              <View pointerEvents="none" style={styles.gridLineH1} />
              <View pointerEvents="none" style={styles.gridLineH2} />
              <View pointerEvents="none" style={styles.gridLineV1} />
              <View pointerEvents="none" style={styles.gridLineV2} />

              {/* Edge Handles */}
              {/* Top Handle */}
              <View
                testID="crop-handle-t"
                style={[styles.edgeHitTargetH, styles.edgeHandleTop]}
                onStartShouldSetResponder={() => true}
                onResponderGrant={(e) => {
                  const coords = getEventCoords(e);
                  handlePointerDown('t', coords.x, coords.y);
                }}
                onResponderMove={(e) => {
                  const coords = getEventCoords(e);
                  handlePointerMove(coords.x, coords.y);
                }}
                onResponderRelease={handlePointerUp}
              >
                <View style={styles.edgePillH} />
              </View>

              {/* Bottom Handle */}
              <View
                testID="crop-handle-b"
                style={[styles.edgeHitTargetH, styles.edgeHandleBottom]}
                onStartShouldSetResponder={() => true}
                onResponderGrant={(e) => {
                  const coords = getEventCoords(e);
                  handlePointerDown('b', coords.x, coords.y);
                }}
                onResponderMove={(e) => {
                  const coords = getEventCoords(e);
                  handlePointerMove(coords.x, coords.y);
                }}
                onResponderRelease={handlePointerUp}
              >
                <View style={styles.edgePillH} />
              </View>

              {/* Left Handle */}
              <View
                testID="crop-handle-l"
                style={[styles.edgeHitTargetV, styles.edgeHandleLeft]}
                onStartShouldSetResponder={() => true}
                onResponderGrant={(e) => {
                  const coords = getEventCoords(e);
                  handlePointerDown('l', coords.x, coords.y);
                }}
                onResponderMove={(e) => {
                  const coords = getEventCoords(e);
                  handlePointerMove(coords.x, coords.y);
                }}
                onResponderRelease={handlePointerUp}
              >
                <View style={styles.edgePillV} />
              </View>

              {/* Right Handle */}
              <View
                testID="crop-handle-r"
                style={[styles.edgeHitTargetV, styles.edgeHandleRight]}
                onStartShouldSetResponder={() => true}
                onResponderGrant={(e) => {
                  const coords = getEventCoords(e);
                  handlePointerDown('r', coords.x, coords.y);
                }}
                onResponderMove={(e) => {
                  const coords = getEventCoords(e);
                  handlePointerMove(coords.x, coords.y);
                }}
                onResponderRelease={handlePointerUp}
              >
                <View style={styles.edgePillV} />
              </View>

              {/* Corner Handles */}
              {/* Top-Left */}
              <View
                testID="crop-handle-tl"
                style={[styles.cornerHitTarget, styles.cornerTL]}
                onStartShouldSetResponder={() => true}
                onResponderGrant={(e) => {
                  const coords = getEventCoords(e);
                  handlePointerDown('tl', coords.x, coords.y);
                }}
                onResponderMove={(e) => {
                  const coords = getEventCoords(e);
                  handlePointerMove(coords.x, coords.y);
                }}
                onResponderRelease={handlePointerUp}
              >
                <View style={styles.cornerVisual} />
              </View>

              {/* Top-Right */}
              <View
                testID="crop-handle-tr"
                style={[styles.cornerHitTarget, styles.cornerTR]}
                onStartShouldSetResponder={() => true}
                onResponderGrant={(e) => {
                  const coords = getEventCoords(e);
                  handlePointerDown('tr', coords.x, coords.y);
                }}
                onResponderMove={(e) => {
                  const coords = getEventCoords(e);
                  handlePointerMove(coords.x, coords.y);
                }}
                onResponderRelease={handlePointerUp}
              >
                <View style={styles.cornerVisual} />
              </View>

              {/* Bottom-Left */}
              <View
                testID="crop-handle-bl"
                style={[styles.cornerHitTarget, styles.cornerBL]}
                onStartShouldSetResponder={() => true}
                onResponderGrant={(e) => {
                  const coords = getEventCoords(e);
                  handlePointerDown('bl', coords.x, coords.y);
                }}
                onResponderMove={(e) => {
                  const coords = getEventCoords(e);
                  handlePointerMove(coords.x, coords.y);
                }}
                onResponderRelease={handlePointerUp}
              >
                <View style={styles.cornerVisual} />
              </View>

              {/* Bottom-Right */}
              <View
                testID="crop-handle-br"
                style={[styles.cornerHitTarget, styles.cornerBR]}
                onStartShouldSetResponder={() => true}
                onResponderGrant={(e) => {
                  const coords = getEventCoords(e);
                  handlePointerDown('br', coords.x, coords.y);
                }}
                onResponderMove={(e) => {
                  const coords = getEventCoords(e);
                  handlePointerMove(coords.x, coords.y);
                }}
                onResponderRelease={handlePointerUp}
              >
                <View style={styles.cornerVisual} />
              </View>

              {/* Center Drag Hint Badge */}
              <View pointerEvents="none" style={styles.centerHintBadge}>
                <Lucide name="move" size={11} color="rgba(255, 255, 255, 0.9)" />
                <Text style={styles.centerHintText}>Drag freely</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    userSelect: 'none',
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
    userSelect: 'none',
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
    maxHeight: 540,
    backgroundColor: '#050811',
    position: 'relative',
    overflow: 'hidden',
    userSelect: 'none',
  },
  imageContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    userSelect: 'none',
  },
  displayImage: {
    width: '100%',
    height: '100%',
    userSelect: 'none',
  },
  dimOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  cropBox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.06)',
    zIndex: 10,
    userSelect: 'none',
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
  cornerHitTarget: {
    position: 'absolute',
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    cursor: 'pointer',
    userSelect: 'none',
  },
  cornerTL: {
    top: -18,
    left: -18,
  },
  cornerTR: {
    top: -18,
    right: -18,
  },
  cornerBL: {
    bottom: -18,
    left: -18,
  },
  cornerBR: {
    bottom: -18,
    right: -18,
  },
  cornerVisual: {
    width: 14,
    height: 14,
    backgroundColor: '#0284C7',
    borderColor: '#FFFFFF',
    borderWidth: 2,
    borderRadius: 3,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 3,
  },
  edgeHitTargetH: {
    position: 'absolute',
    width: 48,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15,
    cursor: 'pointer',
    userSelect: 'none',
  },
  edgeHandleTop: {
    top: -12,
    left: '50%',
    marginLeft: -24,
  },
  edgeHandleBottom: {
    bottom: -12,
    left: '50%',
    marginLeft: -24,
  },
  edgePillH: {
    width: 24,
    height: 6,
    backgroundColor: '#0284C7',
    borderColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 3,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  edgeHitTargetV: {
    position: 'absolute',
    width: 24,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15,
    cursor: 'pointer',
    userSelect: 'none',
  },
  edgeHandleLeft: {
    left: -12,
    top: '50%',
    marginTop: -24,
  },
  edgeHandleRight: {
    right: -12,
    top: '50%',
    marginTop: -24,
  },
  edgePillV: {
    width: 6,
    height: 24,
    backgroundColor: '#0284C7',
    borderColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 3,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
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
