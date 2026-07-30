import React from 'react';
import { Platform } from 'react-native';
import { FormBuilderScreen as WebScreen } from './FormBuilderScreen.web';
import { FormBuilderScreen as NativeScreen } from './FormBuilderScreen.native';
import { FormBuilderScreen as DesktopScreen } from './FormBuilderScreen.desktop';

export function FormBuilderScreen() {
  if (Platform.OS === 'web') {
    return <WebScreen />;
  }
  if (Platform.OS === 'macos' || Platform.OS === 'windows') {
    return <DesktopScreen />;
  }
  return <NativeScreen />;
}
