import React from 'react';
import { Platform } from 'react-native';
import { RolesPermissionScreen as WebScreen } from './RolesPermissionScreen.web';
import { RolesPermissionScreen as NativeScreen } from './RolesPermissionScreen.native';
import { RolesPermissionScreen as DesktopScreen } from './RolesPermissionScreen.desktop';

export function RolesPermissionScreen() {
  if (Platform.OS === 'web') {
    return <WebScreen />;
  }
  if (Platform.OS === 'macos' || Platform.OS === 'windows') {
    return <DesktopScreen />;
  }
  return <NativeScreen />;
}
