import React, { FC, ReactNode, useMemo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import StatusBar from '@atoms/status-bar';
import Text from '@atoms/text';
import { disabledColor, primaryColor } from '@styles/color';
import styles from './styles';
import { RNValue as RFValue } from "@utils/formatting";

interface Props {
  title?: string;
  titleStyle?: any;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onLeft?: any;
  onRight?: any;
  shadow?: any;
  light?: boolean;
  leftAccessibilityLabel?: string;
  rightAccessibilityLabel?: string;
};

const NavBar: FC<Props> = ({
  title = '',
  titleStyle = {},
  leftIcon,
  rightIcon,
  onLeft = () => { },
  onRight = () => { },
  shadow,
  light,
  leftAccessibilityLabel,
  rightAccessibilityLabel,
}) => {
  leftIcon = !!leftIcon ? leftIcon : <View style={{ width: (24) }} />
  rightIcon = !!rightIcon ? rightIcon : <View style={{ width: (24) }} />
  const backgroundColor = light ? '#fff' : primaryColor;
  const statusBar = {
    backgroundColor,
    barStyle: light ? 'dark-content' : 'light-content',
  };
  const stylesMemo = useMemo(() => {
    return styles;
  }, [])
  return (
    <>

      <StatusBar {...statusBar} />

      <View style={shadow && stylesMemo.shadowContainer}>

        <View style={[
          stylesMemo.container,
          shadow && stylesMemo.shadow,
          light && { backgroundColor },
          light && { borderBottomColor: disabledColor }
        ]}>

          <TouchableOpacity
            onPress={onLeft}
            style={stylesMemo.iconContainer}
            accessibilityRole="button"
            accessibilityLabel={leftAccessibilityLabel || 'Back'}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {leftIcon}
          </TouchableOpacity>

          <View style={stylesMemo.titleContainer}>
            <Text
              numberOfLines={3}
              accessibilityRole="header"
              style={[
                stylesMemo.title,
                light && stylesMemo.lightTitle,
                titleStyle
              ]}>
              {title}
            </Text>
          </View>

          <TouchableOpacity
            onPress={onRight}
            style={[stylesMemo.iconContainer, stylesMemo.rightIconContainer]}
            accessibilityRole="button"
            accessibilityLabel={rightAccessibilityLabel || 'Action'}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {rightIcon}
          </TouchableOpacity>

        </View>

      </View>

    </>
  )
};

export default React.memo(NavBar);
