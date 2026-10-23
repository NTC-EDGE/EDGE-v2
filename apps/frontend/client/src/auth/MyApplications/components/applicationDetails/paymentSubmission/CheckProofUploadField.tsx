import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { Icon, ImageCropRotateModal, EditedImageResult } from '@edge/ui';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { CameraCaptureModal, CapturedPhoto } from '../../../../../shared/components/CameraCaptureModal';
import { CheckProofFile } from './paymentSubmissionTypes';
import { styles } from './paymentSubmissionStyles';

interface CheckProofUploadFieldProps {
  file: CheckProofFile | null;
  onFileChange: (file: CheckProofFile | null) => void;
  label?: string;
  helperText?: string;
  compact?: boolean;
  onPreview?: (file: CheckProofFile) => void;
}

function isBlob(val: unknown): val is Blob {
  return typeof Blob !== 'undefined' && val instanceof Blob;
}

function isImageFile(file: CheckProofFile | null): boolean {
  if (file === null || file === undefined) return false;
  if (typeof file?.type === 'string' && file.type.startsWith('image/')) return true;
  const ext = (file?.name || '').toLowerCase().split('.').pop() || '';
  return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);
}

function formatFileSize(bytes?: number): string {
  if (bytes === undefined || bytes === null || Number.isNaN(bytes) || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CheckProofUploadField({
  file,
  onFileChange,
  label = 'Check Photo / Scanned Proof',
  helperText = 'Attach a clear photo or scanned copy of the physical check (JPEG, PNG, or PDF)',
  compact = false,
  onPreview,
}: CheckProofUploadFieldProps) {
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [file]);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && Array.isArray(result.assets) && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset !== undefined && asset !== null) {
          const rawBlob = 'file' in asset && isBlob(asset.file) ? asset.file : undefined;
          const resolvedSize = typeof asset?.size === 'number'
            ? asset.size
            : (rawBlob && typeof rawBlob?.size === 'number' ? rawBlob.size : undefined);
          const resolvedType = (typeof asset?.mimeType === 'string' && asset.mimeType)
            || (rawBlob && typeof rawBlob?.type === 'string' ? rawBlob.type : undefined);
          const resolvedName = asset?.name || (rawBlob && 'name' in rawBlob && typeof rawBlob.name === 'string' ? rawBlob.name : 'proof_document');
          onFileChange({
            name: resolvedName,
            uri: asset?.uri || '',
            type: resolvedType,
            size: resolvedSize,
            file: rawBlob,
          });
        }
      }
    } catch (err) {
      console.warn('Failed to pick document:', err);
      Alert.alert('File Selection Failed', 'Unable to pick document. Please try again.');
    }
  };

  const handleTakePhoto = async () => {
    if (
      Platform.OS === 'web' &&
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function'
    ) {
      setIsCameraModalOpen(true);
      return;
    }

    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Camera access is required to take a photo of the physical check.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.85,
      });

      if (!result.canceled && Array.isArray(result.assets) && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset !== undefined && asset !== null) {
          const rawBlob = 'file' in asset && isBlob(asset.file) ? asset.file : undefined;
          const resolvedSize = typeof asset?.fileSize === 'number'
            ? asset.fileSize
            : (rawBlob && typeof rawBlob?.size === 'number' ? rawBlob.size : undefined);
          const resolvedType = (typeof asset?.mimeType === 'string' && asset.mimeType)
            || (rawBlob && typeof rawBlob?.type === 'string' ? rawBlob.type : 'image/jpeg');
          const resolvedName = asset?.fileName || `check_proof_${Date.now()}.jpg`;
          onFileChange({
            name: resolvedName,
            uri: asset?.uri || '',
            type: resolvedType,
            size: resolvedSize,
            file: rawBlob,
          });
        }
      }
    } catch (err) {
      console.warn('Failed to launch camera:', err);
      Alert.alert('Camera Error', 'Could not access the camera. Please try choosing from files.');
    }
  };

  const handleCameraCapture = (captured: CapturedPhoto) => {
    onFileChange({
      name: captured?.name || `check_photo_${Date.now()}.jpg`,
      uri: captured?.uri || '',
      type: captured?.type || 'image/jpeg',
      size: captured?.file && typeof captured.file?.size === 'number' ? captured.file.size : undefined,
      file: captured?.file,
    });
  };

  // Compact layout (used inside CombinationPaymentSection rows)
  if (compact) {
    if (file !== null) {
      return (
        <View style={styles.proofCompactCard}>
          <Icon name="check-circle" size={14} color="#16A34A" />
          <Text style={styles.proofCompactFileName} numberOfLines={1}>
            {file?.name}
          </Text>
          {onPreview !== undefined && (
            <TouchableOpacity
              onPress={() => onPreview(file)}
              style={styles.proofActionBtn}
              activeOpacity={0.7}
              accessibilityLabel="Preview check photo"
            >
              <Icon name="eye" size={13} color="#0F2C59" />
            </TouchableOpacity>
          )}
          {isImageFile(file) && (
            <TouchableOpacity
              onPress={() => setIsCropModalOpen(true)}
              style={styles.proofActionBtn}
              activeOpacity={0.7}
              accessibilityLabel="Crop & rotate check photo"
            >
              <Icon name="crop" size={13} color="#0284C7" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => onFileChange(null)}
            style={styles.proofRemoveBtn}
            activeOpacity={0.7}
            accessibilityLabel="Remove check photo"
          >
            <Icon name="trash-2" size={13} color="#DC2626" />
          </TouchableOpacity>
          {isImageFile(file) && typeof file?.uri === 'string' && (
            <ImageCropRotateModal
              visible={isCropModalOpen}
              imageUri={file.uri}
              fileName={file?.name}
              title="Crop & Rotate Check Proof"
              onClose={() => setIsCropModalOpen(false)}
              onApply={(result) => {
                onFileChange({
                  name: result?.name || 'check_proof.jpg',
                  uri: result?.uri || '',
                  type: result?.type || 'image/jpeg',
                  size: result?.blob?.size ?? (result?.file && typeof result.file?.size === 'number' ? result.file.size : undefined),
                  file: result?.file,
                });
                setIsCropModalOpen(false);
              }}
              allowDownload={false}
            />
          )}
        </View>
      );
    }

    return (
      <>
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          <TouchableOpacity
            style={styles.proofCompactAttachBtn}
            onPress={handlePickDocument}
            activeOpacity={0.7}
          >
            <Icon name="paperclip" size={12} color="#475569" />
            <Text style={styles.proofCompactAttachBtnText}>Attach Check Photo / Proof</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.proofCompactAttachBtn}
            onPress={handleTakePhoto}
            activeOpacity={0.7}
          >
            <Icon name="camera" size={12} color="#475569" />
            <Text style={styles.proofCompactAttachBtnText}>Camera</Text>
          </TouchableOpacity>
        </View>
        <CameraCaptureModal
          visible={isCameraModalOpen}
          onClose={() => setIsCameraModalOpen(false)}
          onCapture={handleCameraCapture}
          onFallbackToFilePick={handlePickDocument}
          title="Capture Check Photo"
          instructionText="Position physical check clearly within frame"
        />
      </>
    );
  }

  // Standard layout (used inside SingleModeDetails when Check is selected)
  return (
    <View style={styles.proofUploadSection}>
      <Text style={styles.inputLabel}>{label}</Text>

      {file !== null ? (
        <View style={styles.proofAttachedCard}>
          <View style={styles.proofAttachedLeft}>
            {isImageFile(file) && typeof file?.uri === 'string' && file.uri.trim() !== '' && !hasImageError ? (
              <Image
                source={{ uri: file.uri }}
                style={styles.proofThumbnail}
                resizeMode="cover"
                onError={() => setHasImageError(true)}
              />
            ) : (
              <View
                style={[
                  styles.proofThumbnail,
                  { alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFF6FF' },
                ]}
              >
                <Icon name="file-text" size={18} color="#1D4ED8" />
              </View>
            )}
            <View style={styles.proofAttachedInfo}>
              <Text style={styles.proofAttachedName} numberOfLines={1}>
                {file?.name}
              </Text>
              <Text style={styles.proofAttachedMeta}>
                {formatFileSize(file?.size) ? `${formatFileSize(file?.size)} • ` : ''}Photo Attached
                ✓
              </Text>
            </View>
          </View>

          <View style={styles.proofAttachedActions}>
            {onPreview !== undefined && (
              <TouchableOpacity
                style={styles.proofActionBtn}
                onPress={() => onPreview(file)}
                activeOpacity={0.7}
                accessibilityLabel="Preview check document"
              >
                <Icon name="eye" size={14} color="#0F2C59" />
              </TouchableOpacity>
            )}
            {isImageFile(file) && (
              <TouchableOpacity
                style={styles.proofActionBtn}
                onPress={() => setIsCropModalOpen(true)}
                activeOpacity={0.7}
                accessibilityLabel="Crop & rotate check photo"
              >
                <Icon name="crop" size={14} color="#0284C7" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.proofRemoveBtn}
              onPress={() => onFileChange(null)}
              activeOpacity={0.7}
              accessibilityLabel="Remove check photo"
            >
              <Icon name="trash-2" size={14} color="#DC2626" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.proofUploadDropzone}>
          <Icon name="upload-cloud" size={24} color="#3B82F6" />
          <Text style={styles.proofUploadHelper}>{helperText}</Text>
          <View style={styles.proofUploadActionsRow}>
            <TouchableOpacity
              style={styles.proofUploadBtn}
              onPress={handlePickDocument}
              activeOpacity={0.8}
            >
              <Icon name="paperclip" size={13} color="#FFFFFF" />
              <Text style={styles.proofUploadBtnText}>Choose Photo / Document</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.proofCameraBtn}
              onPress={handleTakePhoto}
              activeOpacity={0.8}
            >
              <Icon name="camera" size={13} color="#334155" />
              <Text style={styles.proofCameraBtnText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <CameraCaptureModal
        visible={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleCameraCapture}
        onFallbackToFilePick={handlePickDocument}
        title="Capture Check Photo"
        instructionText="Position physical check clearly within frame"
      />

      {file !== null && isImageFile(file) && typeof file?.uri === 'string' && (
        <ImageCropRotateModal
          visible={isCropModalOpen}
          imageUri={file.uri}
          fileName={file?.name}
          title="Crop & Rotate Check Proof"
          onClose={() => setIsCropModalOpen(false)}
          onApply={(result) => {
            onFileChange({
              name: result?.name || 'check_proof.jpg',
              uri: result?.uri || '',
              type: result?.type || 'image/jpeg',
              size: result?.blob?.size ?? (result?.file && typeof result.file?.size === 'number' ? result.file.size : undefined),
              file: result?.file,
            });
            setIsCropModalOpen(false);
          }}
          allowDownload={false}
        />
      )}
    </View>
  );
}
