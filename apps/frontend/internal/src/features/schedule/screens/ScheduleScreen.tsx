import React from 'react';
import { Platform } from 'react-native';
import { ScheduleScreen as WebScreen } from './ScheduleScreen.web';
import { ScheduleScreen as NativeScreen } from './ScheduleScreen.native';
import { ScheduleScreen as DesktopScreen } from './ScheduleScreen.desktop';

export function ScheduleScreen() {
  if (Platform.OS === 'web') {
    return <WebScreen />;
  }
  if (Platform.OS === 'macos' || Platform.OS === 'windows') {
    return <DesktopScreen />;
  }
  return <NativeScreen />;
}
