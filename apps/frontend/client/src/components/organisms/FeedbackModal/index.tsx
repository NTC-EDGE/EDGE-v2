
import React from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Text from '@atoms/text';
import ModalMoti from '@organisms/MotiModal';
import { primaryColor, secondaryColor, infoColor, successColor, errorColor } from '@styles/color';
import { LucideIcon, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react-native';

interface FeedbackModalProps {
  visible: boolean;
  status: 'loading' | 'success' | 'error';
  message: string;
  onClose: () => void;
  isBulk?: boolean;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  status,
  message,
  onClose,
  isBulk = false
}) => {
  return (
    <ModalMoti visible={visible} onClose={onClose} dismissOnBackdropPress={status !== 'loading'}>
      <View style={styles.container}>
        {status === 'loading' && (
          <View style={styles.iconContainer}>
            <ActivityIndicator size="large" color={primaryColor} />
          </View>
        )}
        {status === 'success' && (
          <View style={[styles.iconContainer, { backgroundColor: '#ECFDF5' }]}>
            <CheckCircle2 size={48} color={successColor} />
          </View>
        )}
        {status === 'error' && (
          <View style={[styles.iconContainer, { backgroundColor: '#FEF2F2' }]}>
            <AlertCircle size={48} color={errorColor} />
          </View>
        )}

        <Text style={styles.title}>
          {status === 'loading' ? 'Processing...' : status === 'success' ? 'Success!' : 'Oops! Something went wrong'}
        </Text>

        <Text style={styles.message}>
          {message}
        </Text>

        {status !== 'loading' && (
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: status === 'success' ? successColor : errorColor }]}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        )}
      </View>
    </ModalMoti>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  closeButton: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FeedbackModal;
