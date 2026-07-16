import React, { FC, useEffect, useState } from 'react';
import { View, Animated } from 'react-native';
import { lightInfoColor } from '@styles/color';
import styles from './styles';
import {RNValue as RFValue} from "@utils/formatting";

interface Props {
  color?: string;
  size?: number;
};

const Ellipsis: FC<Props> = ({
  color = '#000',
  size = 24,
}) => {
  const [color1] = useState(new Animated.Value(0));
  const [color2] = useState(new Animated.Value(0));
  const [color3] = useState(new Animated.Value(0));
  const [color4] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(color1, {
          toValue: 300,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(color2, {
          toValue: 300,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(color3, {
          toValue: 300,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(color4, {
          toValue: 300,
          duration: 300,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const propStyles = (_c: any) => {
    return {
      height: RFValue(size),
      width: RFValue(size),
      borderRadius: RFValue(size),
      backgroundColor: _c.interpolate({
        inputRange: [0, 300],
        outputRange: [lightInfoColor, color],
      }),
    }
  };

  const separator = <View style={{ width: 5 }} />

  return (
    <View style={styles.container}>
      <Animated.View style={propStyles(color1)} />
      {separator}
      <Animated.View style={propStyles(color2)} />
      {separator}
      <Animated.View style={propStyles(color3)} />
      {separator}
      <Animated.View style={propStyles(color4)} />
    </View>
  )
};

export default React.memo(Ellipsis);
