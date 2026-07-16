import React, {FC, useMemo, useCallback} from 'react';
import { View, StyleSheet } from 'react-native';
import Text from '@atoms/text';
import { Check, Close } from '@atoms/icon';
import { PasswordField } from '@molecules/form-fields';
import { text, input } from '@styles/color';

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

interface Props {
  form?: any;
  onChangeValue?: any;
}

const validateIcon = (valid: boolean) => {
  if (valid) {
    return (
      <Check
        type='circle'
        color={text.success}
        size={16}
      />
    )
  }
  return (
    <Close
      type='circle'
      color={text.error}
      size={16}
    />
  )
};

const validateColor = (valid: boolean) => {
  return valid ? text.success : text.error;
};

const passwordMeterColor = (strength: string) => {
  if (strength === 'Average') return '#F8BF24';
  else if (strength === 'Strong') return '#2C9669';
  return '#DC2626';
};

const MeterBar = React.memo(({ strength }: { strength: string }) => (
  <View style={{ marginBottom: 20, marginTop: 5 }}>
    <View style={{ flexDirection: 'row' }}>
      <Text
        size={14}
        color={text.default}
      >
        Strength:
      </Text>
      <Text
        style={{ color: passwordMeterColor(strength) }}
        size={14}
      >
        {` ${strength || 'Weak'}`}
      </Text>
    </View>
    <View
      style={[
        styles.strengthBar,
        {
          backgroundColor: input?.background?.default,
          marginTop: 10,
        }
      ]}
    >
      {strength === 'Strong' && (
        <View
          style={[
            styles.strengthBar,
            {
              backgroundColor: '#2C9669',
              width: '100%',
              position: 'absolute',
            }
          ]}
        />
      )}
      {(strength === 'Strong' || strength === 'Average') && (
        <View
          style={[
            styles.strengthBar,
            {
              backgroundColor: '#F8BF24',
              width: '65%',
              position: 'absolute',
            }
          ]}
        />
      )}
      {(strength === 'Strong' || strength === 'Average' || strength === 'Weak') && (
        <View
          style={[
            styles.strengthBar,
            {
              backgroundColor: '#DC2626',
              width: '30%',
              position: 'absolute',
            }
          ]}
        />
      )}
    </View>
  </View>
));

const PasswordForm : FC<Props> = ({ form = {}, onChangeValue = () => {} }) => {

  const onShowPassword = useCallback(() => {
    onChangeValue('showPassword', !form?.showPassword?.value);
  }, [onChangeValue, form?.showPassword?.value]);

  const onPasswordChange = useCallback((value: string) => {
    onChangeValue('password', value);
  }, [onChangeValue]);

  const onPasswordSubmit = useCallback((event: any) => {
    onChangeValue('password', event.nativeEvent.text);
  }, [onChangeValue]);

  const onConfirmPasswordChange = useCallback((value: string) => {
    onChangeValue('confirmPassword', value);
  }, [onChangeValue]);

  const onConfirmPasswordSubmit = useCallback((event: any) => {
    onChangeValue('confirmPassword', event.nativeEvent.text);
  }, [onChangeValue]);

  return (
    <View style={styles.container}>

      <PasswordField
        label='New Password'
        placeholder='New Password'
        textContentType='oneTimeCode'
        required={true}
        hasValidation={false}
        secureTextEntry={!form?.showPassword?.value}
        error={form?.password?.error}
        value={form?.password?.value}
        showPassword={onShowPassword}
        onChangeText={onPasswordChange}
        onSubmitEditing={onPasswordSubmit}
      />
      {
        !!form?.password?.value &&
        <>
          <View style={styles.passwordValidationContainer}>
            <View style={styles.row}>
              {validateIcon(form?.password?.characterLength)}
              <Text
                style={styles.passwordValidationText}
                size={12}
                color={validateColor(form?.password?.characterLength)}
              >
                8 or more characters
              </Text>
            </View>
            <View style={styles.row}>
              {validateIcon(form?.password?.upperAndLowerCase)}
              <Text
                style={styles.passwordValidationText}
                size={12}
                color={validateColor(form?.password?.upperAndLowerCase)}
              >
                Uppercase and lowercase letters
              </Text>
            </View>
            <View style={styles.row}>
              {validateIcon(form?.password?.atLeastOneNumber)}
              <Text
                style={styles.passwordValidationText}
                size={12}
                color={validateColor(form?.password?.atLeastOneNumber)}
              >
                At least one number
              </Text>
            </View>
          </View>
          <MeterBar strength={form?.password?.strength} />
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
        showPassword={onShowPassword}
        onChangeText={onConfirmPasswordChange}
        onSubmitEditing={onConfirmPasswordSubmit}
      />

    </View>
  );
};

export default React.memo(PasswordForm);
