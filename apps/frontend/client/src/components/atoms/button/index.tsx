import React, {ReactNode, FC, useMemo, useState} from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import lodash from 'lodash';

const styles = StyleSheet.create({
  default: {
    padding: 15,
    alignItems: 'center',
    borderRadius: 12,
  },
});

interface Props {
  children: ReactNode;
  onPress?: any;
  style?: any;
  [x: string]: any;
}

const Button: FC<Props> = ({
  children,
  onPress = () => {},
  style,
  ...otherProps
}) => {
  const [pressed, setPressed] = useState(false);

  // Debounce the onPress action to prevent double taps
  const debouncedOnPress = useMemo(
    () => lodash.debounce(onPress, 300, { leading: true, trailing: false }),
    [onPress]
  );

  return (
    <Pressable
      accessibilityRole="button"
      onPress={debouncedOnPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      {...otherProps}
    >
      <MotiView
        style={[styles.default, style]}
        animate={{
          // Subtle scale and opacity feedback for a more modern feel
          scale: pressed ? 0.98 : 1,
          opacity: pressed ? 0.92 : 1,
          shadowOpacity: pressed ? 0.12 : 0,
        }}
        transition={{
          type: 'timing',
          duration: 100,
        }}
      >
        {children}
      </MotiView>
    </Pressable>
  );
};

export default React.memo(Button);
