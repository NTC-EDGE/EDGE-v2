
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import Text from '@atoms/text';
import { CheckCircle2 } from 'lucide-react-native';
import { successColor } from '@styles/color';

interface ToastProps {
  visible: boolean;
  message: string;
  onHide: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  onHide,
  duration = 3000,
}) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onHide();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide]);

  return (
    <View style={styles.container} pointerEvents="none">
      <AnimatePresence>
        {visible && (
          <MotiView
            from={{ opacity: 0, translateY: 50, scale: 0.9 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            exit={{ opacity: 0, translateY: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 15, stiffness: 150 }}
            style={styles.toast}
          >
            <CheckCircle2 size={20} color="#fff" />
            <Text style={styles.text}>{message}</Text>
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  text: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Toast;
