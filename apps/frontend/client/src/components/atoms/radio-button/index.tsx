import React, {FC, useMemo} from 'react';
import { View } from 'react-native';
import { defaultColor } from '@styles/color';
import styles from './styles';
import {RNValue as RFValue} from "@utils/formatting";

interface Props {
  isChecked?: boolean;
  size?: number;
  color?: string;
};

const RadioButton: FC<Props> = ({
  isChecked,
  size = 24,
  color = defaultColor,
}) => {
  size = RFValue(size);
    const stylesMemo = useMemo(() => {
        return styles;
    }, [])
  return (
    <View style={[
        stylesMemo.outer,
      {
        height: size,
        width: size,
        borderRadius: size,
      },
      isChecked && {
        backgroundColor: color,
        borderColor: color,
      },
    ]}>
      {
        isChecked &&
        <View
          style={[
              stylesMemo.inner,
            {
              height: size / 4,
              width: size / 4,
              borderRadius: size / 4,
            }
          ]}
        />
      }
    </View>
  )
};

export default React.memo(RadioButton);
