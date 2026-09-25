import 'react-native';

declare module 'react-native' {
  interface ViewStyle {
    transition?: string;
    backgroundImage?: string;
  }
  interface TextStyle {
    transition?: string;
  }
}

