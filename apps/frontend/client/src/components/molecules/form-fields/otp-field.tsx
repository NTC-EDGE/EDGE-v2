import React, {useState, FC, ReactNode, useMemo} from 'react';
import {View, StyleSheet, Platform} from 'react-native';
import { Exclamation } from '@atoms/icon';
import Text from '@atoms/text';
import TextInput from '@components/atoms/input';

const styles = StyleSheet.create({
  container: {
    paddingVertical: 15
  },
  label: {
    position: 'absolute',
    top: 2,
    // paddingHorizontal: 5,
    backgroundColor: 'white',
    flexDirection: 'row'
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 15,

    overflow: 'hidden',

    ...Platform.select({
      web:{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
      },
      native:{
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
      }})

  },
  description: {
    // paddingTop: 2,
    // marginLeft: 15,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});

interface Props {
  label?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  required?: boolean;
  hasValidation?: boolean;
  containerStyle?: any;
  inputStyle?: any;
  labelStyle?: any;
  outlineStyle?: any;
  description?: string;
  error?: string;
  errorColor?: string;
  activeColor?: string;
  requiredColor?: string;
  children: ReactNode;
  [x: string]: any;
}

const OTPField: FC<Props> = ({
  label = '',
  placeholder = '',
  secureTextEntry = false,
  required = false,
  hasValidation = false,
  containerStyle,
  inputStyle,
  labelStyle,
  outlineStyle,
  description,
  error,
  errorColor,
  activeColor,
  requiredColor,
  children,
  ...otherProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const onFocus = () => setIsFocused(true);
  const onBlur = () => setIsFocused(false);
  const stylesMemo = useMemo(() => {
    return styles;
  }, [])
  return (
    <View style={[stylesMemo.container, containerStyle]}>
      <View style={stylesMemo.label}>
        <Text
          style={[
            labelStyle,
            (isFocused || !!otherProps.value || !!error) && {
              color: activeColor
            }
          ]}
          size={12}
        >
          {label}
        </Text>
        {required && (
          <Text
            style={[
              labelStyle,
              !!requiredColor && {
                color: requiredColor
              }
            ]}
          >
            {'*'}
          </Text>
        )}
      </View>
      <View
        style={[
          stylesMemo.inputContainer,
          outlineStyle,
          isFocused && { borderColor: activeColor },
          !!error && { borderColor: errorColor }
        ]}
      >
        {Platform.OS == "web" ? <><View style={{flex: 0.5, }}>
          <TextInput
              style={inputStyle}
              placeholder={placeholder || label}
              secureTextEntry={secureTextEntry}
              onFocus={onFocus}
              onBlur={onBlur}
              {...otherProps}
          />
        </View>
          <View style={{flex: 0.5, alignItems: "flex-end"}}>
            {children}
          </View></> :  <><TextInput
            style={inputStyle}
            placeholder={placeholder || label}
            secureTextEntry={secureTextEntry}
            onFocus={onFocus}
            onBlur={onBlur}
            {...otherProps}
        />
          {children}
        </>}
      </View>
      {
        hasValidation && (!!error || !!description) && (
          <View style={stylesMemo.description}>
            <View style={stylesMemo.info}>
              {
                !!error && (
                  <Exclamation
                    type='circle'
                    size={12}
                    color={errorColor}
                  />
                )
              }
              <Text
                style={[
                  labelStyle,
                  !!error && {
                    marginLeft: 5,
                    color: errorColor
                  }
                ]}
                size={12}
              >
                {error || description}
              </Text>
            </View>
          </View>
        )
      }
    </View>
  );
};

export default React.memo(OTPField);
