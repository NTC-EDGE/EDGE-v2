
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from '@atoms/text';
import Button from '@atoms/button';
import ModalMoti from '@organisms/MotiModal';
import { primaryColor, secondaryColor, infoColor } from '@styles/color';

interface ConfirmationModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  onConfirm,
  onCancel,
  title = "Submit Application",
  message = "Are you sure you want to submit this application?"
}) => {
  return (
    <ModalMoti visible={visible} onClose={onCancel}>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Button style={styles.confirmButton} onPress={onConfirm}>
            <Text style={styles.confirmText}>Confirm</Text>
          </Button>
        </View>
      </View>
    </ModalMoti>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: primaryColor,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    color: '#4B5563',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: primaryColor,
    borderRadius: 12,
    height: 48,
  },
  cancelButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    height: 48,
  },
  confirmText: {
    color: '#fff',
    fontWeight: '600',
  },
  cancelText: {
    color: '#4B5563',
    fontWeight: '600',
  },
});

export default ConfirmationModal;
