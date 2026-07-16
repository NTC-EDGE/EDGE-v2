import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, View, ScrollView, Alert } from 'react-native';
import Text from '@atoms/text';
import Button from '@atoms/button';
import { Left } from '@atoms/icon';
import NavBar from '@organisms/navbar';
import PasswordForm from '@organisms/forms/reset-password';
import { button } from '@styles/color';
import { validatePassword } from 'src/utils/form-validations';
import api from '@config/api';
import Ellipsis from '@atoms/ellipsis';
import styles from './styles';

const errorResponse = {
  password: 'Password must be at least 8 characters',
  confirm: 'Passwords do not match',
};

const ResetPassword = ({ navigation, route }: any) => {
  const { otpId } = route?.params;
  const [loading, setLoading] = useState(false);
  const [formValue, setFormValue] = useState({
    password: {
      value: '',
      isValid: false,
      error: '',
      characterLength: false,
      upperAndLowerCase: false,
      atLeastOneNumber: false,
      strength: 'Weak',
    },
    confirmPassword: {
      value: '',
      isValid: false,
      error: '',
    },
    showPassword: {
      value: false,
    }
  });

  const onChangeText = (key: string, value: any) => {
    switch (key) {
      case 'password': {
        const passwordTest = validatePassword(value);
        const checked = validatePasswordMatch(value, formValue.confirmPassword.value);
        return setFormValue({
          ...formValue,
          [key]: {
            value: value,
            isValid: passwordTest?.isValid,
            error: !passwordTest?.isValid ? errorResponse['password'] : '',
            characterLength: passwordTest.characterLength,
            upperAndLowerCase: passwordTest.upperAndLowerCase,
            atLeastOneNumber: passwordTest.atLeastOneNumber,
            strength: passwordTest.strength,
          },
          'confirmPassword': {
            ...formValue.confirmPassword,
            isValid: checked,
            error: !checked ? errorResponse['confirm'] : ''
          }
        });
      }
      case 'confirmPassword': {
        const checked = validatePasswordMatch(value, formValue.password.value);
        return setFormValue({
          ...formValue,
          [key]: {
            value: value,
            isValid: checked,
            error: !checked ? errorResponse['confirm'] : ''
          }
        });
      }
      case 'showPassword': {
        return setFormValue({
          ...formValue,
          [key]: {
            value: value,
          }
        });
      }
      default:
        return setFormValue({
          ...formValue,
          [key]: {
            value: value,
            isValid: !!value,
            error: '',
          }
        });
    }
  };

  const validatePasswordMatch = (value:string, password:string) => {
    return value === password;
  }

  const onCheckValidation = () => {
    if (!formValue.password.isValid) {
      return onChangeText('password', formValue.password.value);
    } else if (!formValue.confirmPassword.isValid) {
      return onChangeText('confirmPassword', formValue.confirmPassword.value);
    } else {
      setLoading(true);
      api(null, '')
        .post(`/reset-password`, {
          id: otpId,
          password: formValue?.password?.value,
        })
        .then((res: any) => {
          setLoading(false);
          if (res?.data?.success) {
            return navigation.navigate('ForgotPasswordSuccess')
          }
          else {
            Alert.alert('Alert', res?.data?.message || 'Cannot process reset password');
          }
        })
        .catch((err: any) => {
          setLoading(false);
          Alert.alert('Alert', err?.message);
        });
    }
  }

  const isValid = formValue.password.isValid && formValue.confirmPassword.isValid;

  return (
    <View style={styles.container}>
      <NavBar
        title={'Forgot Password'}
        rightIcon={<Text color='#fff'>Close</Text>}
        onRight={() => navigation.navigate('Login')}
        leftIcon={<Left color='#fff' size={17}/>}
        onLeft={() => navigation.pop()}
      />

      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        keyboardVerticalOffset={Platform.select({ ios: 75, android: undefined })}
        style={styles.container}
      >
        <ScrollView
          style={styles.scrollview}
          showsVerticalScrollIndicator={true}
        >
          <PasswordForm onChangeValue={onChangeText} form={formValue} />
        </ScrollView>
      </KeyboardAvoidingView>

      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'position', android: undefined })}
        style={styles.keyboardAvoiding}
      >
        <Button
          disabled={!isValid || loading}
          style={[
            styles.button,
            !isValid && {
              backgroundColor: button.default
            },
            loading && {
              backgroundColor: '#60A5FA'
            }
          ]}
          onPress={onCheckValidation}
        >
          {
            loading
              ? <Ellipsis color='#fff' size={10} />
              : <Text
                  color='#fff'
                  size={16}
                  style={styles.boldText}
                >
                  Reset
                </Text>
          }
          
        </Button>
      </KeyboardAvoidingView>
    </View>
  )
}

export default React.memo(ResetPassword);
