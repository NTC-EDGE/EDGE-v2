import React from 'react';
import { Platform } from 'react-native';
import { ReportsScreen as WebScreen } from './ReportsScreen.web';
import { ReportsScreen as NativeScreen } from './ReportsScreen.native';
import { ReportsScreen as DesktopScreen } from './ReportsScreen.desktop';

export function ReportsScreen() {
  if (Platform.OS === 'web') {
    return <WebScreen />;
  }
  if (Platform.OS === 'macos' || Platform.OS === 'windows') {
    return <DesktopScreen />;
  }
  return <NativeScreen />;
}
