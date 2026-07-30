import React from 'react';
import { Platform } from 'react-native';
import { ApplicationReviewScreen as WebScreen } from './ApplicationReviewScreen.web';
import { ApplicationReviewScreen as NativeScreen } from './ApplicationReviewScreen.native';
import { ApplicationReviewScreen as DesktopScreen } from './ApplicationReviewScreen.desktop';

export interface ApplicationReviewScreenProps {
  onClose: () => void;
  onCollapse?: () => void;
  isCollapsed?: boolean;
}

export function ApplicationReviewScreen(props: ApplicationReviewScreenProps) {
  if (Platform.OS === 'web') {
    return <WebScreen {...props} />;
  }
  if (Platform.OS === 'macos' || Platform.OS === 'windows') {
    return <DesktopScreen {...props} />;
  }
  return <NativeScreen {...props} />;
}
