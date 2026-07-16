import React, {
  useRef,
  forwardRef,
  useImperativeHandle,
  ForwardRefRenderFunction, useMemo,
} from 'react';
import { TextInput } from 'react-native';
import { defaultColor } from '@styles/color';
import styles from '@styles/input-style';

interface Props {
  value?: string;
  secureTextEntry?: boolean;
  placeholder?: string;
  placeholderTextColor?: string;
  style?: any;
  [x: string]: any;
}

export type TextInputRef =  {
  blur: any,
  focus: any,
}

const Input: ForwardRefRenderFunction<TextInputRef, Props> = ({
  value = '',
  style,
  placeholderTextColor = defaultColor,
  secureTextEntry = false,
  placeholder = '',
  ...otherProps
}, ref) => {
  const inputRef:any = useRef(null);
  useImperativeHandle(ref, () => ({
    blur: () => inputRef.current.blur(),
    focus: () => inputRef.current.focus(),
  }));
  const stylesMemo = useMemo(() => {
    return styles;
  }, [])
  return (
    <TextInput
        allowFontScaling={false}
      ref={inputRef}
      style={[stylesMemo.input, style]}
      value={value}
      autoCompleteType="off"
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor}
      secureTextEntry={secureTextEntry}
      underlineColorAndroid={'transparent'}
      {...otherProps}
    />
  );
};

export default React.memo(forwardRef(Input));
