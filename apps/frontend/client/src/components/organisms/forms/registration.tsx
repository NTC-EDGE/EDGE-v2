import React, {FC, useMemo, useCallback} from 'react';
import { View, StyleSheet } from 'react-native';
import Text from '@atoms/text';
import { Check, Close } from '@atoms/icon';
import { DropdownField, InputField, PasswordField } from '@molecules/form-fields';
import { text, input } from '@styles/color';
import { setCreatedAt } from '@reducers/user/actions';
import { changeCreatedAt } from '@config/api';
import { useDispatch } from 'react-redux';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  passwordValidationText: {
    marginLeft: 10
  },
  passwordValidationContainer: {
    marginTop: -15, // since input fields have a marginBottom of 15
    marginBottom: 15,
  },
  strengthBar: {
    height: 7,
    borderRadius: 4,
    flex: 1,
  },
  row: {
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

const validateIcon = (valid: boolean) => {
  if (valid) {
    return (
      <Check
        type='circle'
        color={text.success}
        size={16}
      />
    );
  }
  return (
    <Close
      type='circle'
      color={text.error}
      size={16}
    />
  );
};

const validateColor = (valid: boolean) => {
  return valid ? text.success : text.error;
};

const passwordMeterColor = (strength: string) => {
  if (strength === 'Average') return '#F8BF24';
  else if (strength === 'Strong') return '#2C9669';
  return '#DC2626';
};

interface Props {
  form?: any;
  onChangeValue?: any;
}

const RegistrationForm : FC<Props> = ({ form = {}, onChangeValue = () => {} }) => {
  const dispatch = useDispatch();

  const handleEmailChange = useCallback((value: string) => onChangeValue('email', value), [onChangeValue]);
  const handleEmailSubmit = useCallback((event: any) => onChangeValue('email', event.nativeEvent.text), [onChangeValue]);

  const handlePasswordChange = useCallback((value: string) => onChangeValue('password', value), [onChangeValue]);
  const handlePasswordSubmit = useCallback((event: any) => onChangeValue('password', event.nativeEvent.text), [onChangeValue]);
  const handleShowPassword = useCallback(() => onChangeValue('showPassword', !form?.showPassword?.value), [onChangeValue, form?.showPassword?.value]);

  const handleConfirmPasswordChange = useCallback((value: string) => onChangeValue('confirmPassword', value), [onChangeValue]);
  const handleConfirmPasswordSubmit = useCallback((event: any) => onChangeValue('confirmPassword', event.nativeEvent.text), [onChangeValue]);

  const handleRegionChange = useCallback((value: any) => {
    if (value?.value) {
      dispatch(setCreatedAt(changeCreatedAt(value?.value)));
    }
    onChangeValue('region', value);
  }, [onChangeValue, dispatch]);

  const stylesMemo = useMemo(() => {
    return styles;
  }, []);

  const renderMeter = (backgroundColor: string, width: string) => {
    return (
      <View
        style={[
          stylesMemo.strengthBar,
          {
            backgroundColor,
            width,
            position: 'absolute',
          }
        ]}
      />
    );
  };

  return (
    <View style={stylesMemo.container}>
      <InputField
        label='Email Address'
        placeholder='Email Address'
        required={true}
        hasValidation={true}
        error={form?.email?.error}
        value={form?.email?.value}
        onChangeText={handleEmailChange}
        onSubmitEditing={handleEmailSubmit}
      />
      <PasswordField
        label='Password'
        placeholder='Password'
        textContentType='oneTimeCode'
        required={true}
        hasValidation={false}
        secureTextEntry={!form?.showPassword?.value}
        error={form?.password?.error}
        value={form?.password?.value}
        showPassword={handleShowPassword}
        onChangeText={handlePasswordChange}
        onSubmitEditing={handlePasswordSubmit}
      />
      {
        !!form?.password?.value &&
        <>
          <View style={stylesMemo.passwordValidationContainer}>
            <View style={stylesMemo.row}>
              {validateIcon(form?.password?.characterLength)}
              <Text
                style={stylesMemo.passwordValidationText}
                size={12}
                color={validateColor(form?.password?.characterLength)}
              >
                8 or more characters
              </Text>
            </View>
            <View style={styles.row}>
              {validateIcon(form?.password?.upperAndLowerCase)}
              <Text
                style={stylesMemo.passwordValidationText}
                size={12}
                color={validateColor(form?.password?.upperAndLowerCase)}
              >
                Uppercase and lowercase letters
              </Text>
            </View>
            <View style={stylesMemo.row}>
              {validateIcon(form?.password?.atLeastOneNumber)}
              <Text
                style={stylesMemo.passwordValidationText}
                size={12}
                color={validateColor(form?.password?.atLeastOneNumber)}
              >
                At least one number
              </Text>
            </View>
          </View>
          <View style={{ marginBottom: 20, marginTop: 5 }}>
            <View style={{ flexDirection: 'row' }}>
              <Text
                size={14}
                color={text.default}
              >
                Strength:
              </Text>
              <Text
                style={{ color: passwordMeterColor(form?.password?.strength) }}
                size={14}
              >
                {` ${form?.password?.strength || 'Weak'}`}
              </Text>
            </View>
            <View
              style={[
                stylesMemo.strengthBar,
                {
                  backgroundColor: input?.background?.default,
                  marginTop: 10,
                }
              ]}
            >
              {
                form?.password?.strength === 'Strong' && 
                renderMeter('#2C9669', '100%')
              }
              {
                (form?.password?.strength === 'Strong' ||
                form?.password?.strength === 'Average') &&
                renderMeter('#F8BF24', '65%')
              }
              {
                (form?.password?.strength === 'Strong' ||
                form?.password?.strength === 'Average' ||
                form?.password?.strength === 'Weak') &&
                renderMeter('#DC2626', '30%')
              }
            </View>
          </View>
        </>
      }
      <PasswordField
        label='Confirm password'
        placeholder='Confirm password'
        textContentType='oneTimeCode'
        required={true}
        hasValidation={true}
        secureTextEntry={!form?.showPassword?.value}
        error={form?.confirmPassword?.error}
        value={form?.confirmPassword?.value}
        showPassword={handleShowPassword}
        onChangeText={handleConfirmPasswordChange}
        onSubmitEditing={handleConfirmPasswordSubmit}
      />

      <DropdownField
        items={form?.region?.items}
        required={true}
        hasValidation={true}
        placeholder='Region'
        error={form?.region?.error}
        value={form?.region?.value?.label}
        onChangeValue={handleRegionChange}
      />
    </View>
  );
};

export default React.memo(RegistrationForm);
