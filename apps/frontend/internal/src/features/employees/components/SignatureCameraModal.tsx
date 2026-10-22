import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { COLORS, SHADOWS, Icon as Lucide } from '@edge/ui';
import { cameraStyles } from '../styles/signatureCameraStyles';

interface SignatureCameraModalProps {
  visible: boolean;
  onClose: () => void;
  onCapture: () => void;
}

export function SignatureCameraModal({
  visible,
  onClose,
  onCapture,
}: SignatureCameraModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={cameraStyles.cameraOverlay}>
        <View style={[cameraStyles.cameraContainer, SHADOWS.modal]}>
          <View style={cameraStyles.cameraHeader}>
            <Text style={cameraStyles.cameraTitle}>Capture Signature</Text>
            <Pressable onPress={onClose} style={cameraStyles.cameraCloseBtn}>
              <Lucide name="x" size={20} color={COLORS.neutral.white} />
            </Pressable>
          </View>

          {/* Simulated Viewfinder */}
          <View style={cameraStyles.viewfinder}>
            <View style={cameraStyles.viewfinderCornerTL} />
            <View style={cameraStyles.viewfinderCornerTR} />
            <View style={cameraStyles.viewfinderCornerBL} />
            <View style={cameraStyles.viewfinderCornerBR} />

            <Lucide
              name="edit-3"
              size={48}
              color="rgba(255,255,255,0.25)"
              style={{ marginBottom: 12 }}
            />
            <Text style={cameraStyles.viewfinderText}>
              Position the signature inside the frame
            </Text>
          </View>

          {/* Camera Controls */}
          <View style={cameraStyles.cameraControls}>
            <Pressable style={cameraStyles.cameraCancelBtn} onPress={onClose}>
              <Text style={cameraStyles.cameraCancelText}>Cancel</Text>
            </Pressable>

            <Pressable style={cameraStyles.shutterBtn} onPress={onCapture}>
              <View style={cameraStyles.shutterBtnInner} />
            </Pressable>

            <View style={{ width: 60 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
