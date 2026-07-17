import 'react-native';

declare module 'react-native' {
  interface FlexStyle {
    position?: 'absolute' | 'relative' | 'fixed';
  }
  interface ViewStyle {
    cursor?: 'auto' | 'pointer' | 'default' | 'not-allowed';
    transition?: string;
    backgroundImage?: string;
  }
  interface TextStyle {
    cursor?: 'auto' | 'pointer' | 'default' | 'not-allowed';
    transition?: string;
  }
}
