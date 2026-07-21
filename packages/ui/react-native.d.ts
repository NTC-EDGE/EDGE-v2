declare module 'react-native' {
  import * as React from 'react';

  export interface FlexStyle {
    position?: 'absolute' | 'relative' | 'fixed';
    flex?: number;
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    flexWrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
    justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
    alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
    alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
    padding?: number | string;
    paddingHorizontal?: number | string;
    paddingVertical?: number | string;
    paddingTop?: number | string;
    paddingBottom?: number | string;
    paddingLeft?: number | string;
    paddingRight?: number | string;
    margin?: number | string;
    marginHorizontal?: number | string;
    marginVertical?: number | string;
    marginTop?: number | string;
    marginBottom?: number | string;
    marginLeft?: number | string;
    marginRight?: number | string;
    width?: number | string;
    height?: number | string;
    maxWidth?: number | string;
    maxHeight?: number | string;
    minWidth?: number | string;
    minHeight?: number | string;
    gap?: number;
    rowGap?: number;
    columnGap?: number;
    overflow?: 'visible' | 'hidden' | 'scroll';
    zIndex?: number;
  }
  export interface ViewStyle extends FlexStyle {
    backgroundColor?: string;
    borderRadius?: number;
    borderWidth?: number;
    borderTopWidth?: number;
    borderBottomWidth?: number;
    borderLeftWidth?: number;
    borderRightWidth?: number;
    borderColor?: string;
    borderTopColor?: string;
    borderBottomColor?: string;
    borderLeftColor?: string;
    borderRightColor?: string;
    opacity?: number;
    cursor?: 'auto' | 'pointer' | 'default' | 'not-allowed';
    transition?: string;
    backgroundImage?: string;
    shadowColor?: string;
    shadowOffset?: { width: number; height: number };
    shadowOpacity?: number;
    shadowRadius?: number;
    elevation?: number;
  }
  export interface TextStyle extends ViewStyle {
    color?: string;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    fontStyle?: 'normal' | 'italic';
    lineHeight?: number;
    textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify';
    letterSpacing?: number;
    textDecorationLine?: 'none' | 'underline' | 'line-through';
  }
  export interface ImageStyle extends ViewStyle {
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  }

  export type StyleProp =
    | ViewStyle
    | TextStyle
    | ImageStyle
    | false
    | null
    | undefined
    | StyleProp[]
    | Record<string, unknown>;

  export interface ComponentProps {
    children?: React.ReactNode;
    style?: StyleProp;
    onPress?: (...args: unknown[]) => void;
    disabled?: boolean;
    activeOpacity?: number;
    testID?: string;
    [key: string]: unknown;
  }

  export const StyleSheet: {
    create: <T extends Record<string, ViewStyle | TextStyle | ImageStyle>>(styles: T) => T;
  };
  export const View: React.ComponentType<ComponentProps>;
  export const Text: React.ComponentType<ComponentProps>;
  export const Image: React.ComponentType<ComponentProps>;
  export const TouchableOpacity: React.ComponentType<ComponentProps>;
  export const Pressable: React.ComponentType<ComponentProps>;
  export const ScrollView: React.ComponentType<ComponentProps>;
  export const FlatList: React.ComponentType<ComponentProps>;
  export const ActivityIndicator: React.ComponentType<ComponentProps>;
  export const Modal: React.ComponentType<ComponentProps>;
  export const TextInput: React.ComponentType<ComponentProps>;
  export const Animated: {
    timing: (value: unknown, config: unknown) => { start: (callback?: (result: { finished?: boolean }) => void) => void };
    Value: new (value: number) => unknown;
    interpolate: (config: unknown) => unknown;
    parallel: (animations: unknown[]) => { start: () => void };
    sequence: (animations: unknown[]) => unknown;
    loop: (animation: unknown) => unknown;
  };
  export const Easing: {
    bezier: (x1: number, y1: number, x2: number, y2: number) => unknown;
  };
  export const Dimensions: {
    get: (dim: 'window' | 'screen') => { width: number; height: number };
  };
  export const Platform: {
    OS: 'ios' | 'android' | 'web' | string;
    select: <T>(obj: Record<string, T>) => T;
  };
  export const useWindowDimensions: () => { width: number; height: number };
}

