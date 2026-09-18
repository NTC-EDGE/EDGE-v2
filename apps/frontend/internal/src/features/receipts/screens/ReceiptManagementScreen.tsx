import React from 'react';
import { Platform } from 'react-native';
import { ReceiptManagementScreen as WebScreen } from './ReceiptManagementScreen.web';
import { ReceiptManagementScreen as NativeScreen } from './ReceiptManagementScreen.native';
import { ReceiptManagementScreen as DesktopScreen } from './ReceiptManagementScreen.desktop';

export function ReceiptManagementScreen() {
  if (Platform.OS === 'web') {
    return <WebScreen />;
  }
  if (Platform.OS === 'macos' || Platform.OS === 'windows') {
    return <DesktopScreen />;
  }
  return <NativeScreen />;
}
