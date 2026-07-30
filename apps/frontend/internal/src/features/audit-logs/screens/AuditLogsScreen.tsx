import React from 'react';
import { Platform } from 'react-native';
import { AuditLogsScreen as WebScreen } from './AuditLogsScreen.web';
import { AuditLogsScreen as NativeScreen } from './AuditLogsScreen.native';
import { AuditLogsScreen as DesktopScreen } from './AuditLogsScreen.desktop';

export function AuditLogsScreen() {
  if (Platform.OS === 'web') {
    return <WebScreen />;
  }
  if (Platform.OS === 'macos' || Platform.OS === 'windows') {
    return <DesktopScreen />;
  }
  return <NativeScreen />;
}
