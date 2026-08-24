import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { COLORS, SHADOWS, Icon as Lucide } from '@edge/ui';
import { uploadDialogStyles } from '../styles/signatureUploadDialogStyles';

interface SignatureUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onFileUpload: () => void;
  onOpenCamera: () => void;
}

export function SignatureUploadModal({
  visible,
  onClose,
  onFileUpload,
  onOpenCamera,
}: SignatureUploadModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={uploadDialogStyles.dialogOverlay}>
        <View style={[uploadDialogStyles.dialogContainer, SHADOWS.modal]}>
          <View style={uploadDialogStyles.dialogHeader}>
            <Text style={uploadDialogStyles.dialogTitle}>Add Signature</Text>
            <Pressable onPress={onClose} style={uploadDialogStyles.dialogCloseBtn}>
              <Lucide name="x" size={18} color={COLORS.neutral[600]} />
            </Pressable>
          </View>

          <View style={uploadDialogStyles.dialogBody}>
            {/* Standard Dropzone Upload Area */}
            <Pressable style={uploadDialogStyles.dropzone} onPress={onFileUpload}>
              <Lucide
                name="upload-cloud"
                size={36}
                color={COLORS.brand[700]}
                style={{ marginBottom: 8 }}
              />
              <Text style={uploadDialogStyles.dropzoneTitle}>
                Drag and drop signature file here
              </Text>
              <Text style={uploadDialogStyles.dropzoneSubtitle}>
                or click to browse files from your device
              </Text>
              <Text style={uploadDialogStyles.dropzoneSpecs}>
                PNG, JPG or SVG formats up to 2MB
              </Text>
            </Pressable>

            <View style={uploadDialogStyles.dialogDividerRow}>
              <View style={uploadDialogStyles.dialogDividerLine} />
              <Text style={uploadDialogStyles.dialogDividerText}>OR</Text>
              <View style={uploadDialogStyles.dialogDividerLine} />
            </View>

            {/* Take Picture Action */}
            <Pressable
              style={uploadDialogStyles.dialogCameraBtn}
              onPress={onOpenCamera}
            >
              <Lucide
                name="camera"
                size={16}
                color={COLORS.neutral.white}
                style={{ marginRight: 8 }}
              />
              <Text style={uploadDialogStyles.dialogCameraBtnText}>
                Take Picture with Camera
              </Text>
            </Pressable>
          </View>

          <View style={uploadDialogStyles.dialogFooter}>
            <Pressable
              style={uploadDialogStyles.dialogCancelBtn}
              onPress={onClose}
            >
              <Text style={uploadDialogStyles.dialogCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
