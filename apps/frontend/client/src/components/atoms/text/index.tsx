import React, { ReactNode, FC, useMemo } from 'react';
import { StyleSheet, Text as RNText } from 'react-native';
import { RNValue as RFValue } from "@utils/formatting";
import { Regular } from '@styles/font';

const styles = StyleSheet.create({
  default: {
    color: 'black',
    fontSize: 12,
    fontFamily: Regular
  }
});

// Stable constant for default style to prevent unnecessary re-renders of memoized component.
const EMPTY_STYLE = {};

interface Props {
  color?: string;
  size?: number;
  weight?: string;
  children: ReactNode;
  style?: any;
  align?: string;
  [x: string]: any;
}

const Text: FC<Props> = ({
  color = '#000',
  size = 14,
  weight = 'normal',
  children,
  style = EMPTY_STYLE,
  align,
  ...otherProps
}) => {
  const stylesMemo = useMemo(() => {
    return [
      styles.default,
      { color, fontSize: RFValue(size), textAlign: align, includeFontPadding: false },
      style
    ];
  }, [size, color, align, style])


  return (
    <RNText

      style={stylesMemo}
      {...otherProps}
    >
      {children}
    </RNText>
  );
};

export default React.memo(Text);
