import React from 'react';
import { Platform } from 'react-native';
import { AnnouncementsScreen as WebScreen } from './AnnouncementsScreen.web';
import { AnnouncementsScreen as NativeScreen } from './AnnouncementsScreen.native';
import { AnnouncementsScreen as DesktopScreen } from './AnnouncementsScreen.desktop';

export function AnnouncementsScreen() {
  if (Platform.OS === 'web') {
    return <WebScreen />;
  }
  if (Platform.OS === 'macos' || Platform.OS === 'windows') {
    return <DesktopScreen />;
  }
  return <NativeScreen />;
}
