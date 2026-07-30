import React from 'react';
import { Platform } from 'react-native';
import { FeedbackScreen as WebScreen } from './FeedbackScreen.web';
import { FeedbackScreen as NativeScreen } from './FeedbackScreen.native';
import { FeedbackScreen as DesktopScreen } from './FeedbackScreen.desktop';

export function FeedbackScreen() {
  if (Platform.OS === 'web') {
    return <WebScreen />;
  }
  if (Platform.OS === 'macos' || Platform.OS === 'windows') {
    return <DesktopScreen />;
  }
  return <NativeScreen />;
}
