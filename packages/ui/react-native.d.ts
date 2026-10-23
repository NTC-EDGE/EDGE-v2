import 'react-native';

declare module 'react-native' {
  interface FlexStyle {
    position?: 'absolute' | 'relative' | 'fixed';
  }
  interface ViewStyle {
    cursor?: 'auto' | 'pointer' | 'default' | 'not-allowed';
    userSelect?: 'auto' | 'text' | 'none' | 'contain' | 'all';
    transition?: string;
    backgroundImage?: string;
    boxShadow?: string;
  }
  interface TextStyle {
    cursor?: 'auto' | 'pointer' | 'default' | 'not-allowed';
    userSelect?: 'auto' | 'text' | 'none' | 'contain' | 'all';
    transition?: string;
  }
  interface ImageStyle {
    cursor?: 'auto' | 'pointer' | 'default' | 'not-allowed';
    userSelect?: 'auto' | 'text' | 'none' | 'contain' | 'all';
    transition?: string;
  }
}

declare global {
  const process: {
    env: Record<string, string | undefined>;
  };
}
