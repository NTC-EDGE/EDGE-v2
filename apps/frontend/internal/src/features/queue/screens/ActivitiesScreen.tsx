import React from 'react';
import { Platform } from 'react-native';
import { ActivitiesScreen as WebScreen } from './ActivitiesScreen.web';
import { ActivitiesScreen as NativeScreen } from './ActivitiesScreen.native';
import { ActivitiesScreen as DesktopScreen } from './ActivitiesScreen.desktop';

export function ActivitiesScreen() {
  if (Platform.OS === 'web') {
    return <WebScreen />;
  }
  if (Platform.OS === 'macos' || Platform.OS === 'windows') {
    return <DesktopScreen />;
  }
  return <NativeScreen />;
}
