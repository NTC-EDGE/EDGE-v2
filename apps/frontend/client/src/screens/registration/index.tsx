import React, { useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { validateEmail, validatePassword } from 'src/utils/form-validations';
import useKeyboard from 'src/hooks/useKeyboard';
import Text from '@atoms/text';
import Button from '@atoms/button';
import { ArrowRight } from '@atoms/icon';
import RegistrationForm from '@organisms/forms/registration';
import NavBar from '@organisms/navbar';
import { text, button } from '@styles/color';
import styles from './styles';
import useApi from '@config/api';
import { regionList } from '@utils/ntc';
import { JSONfn } from '@utils/formatting';

const errorResponse = {
  userType: 'Select a user type',
  // permitType: 'Select a permit type',
  email: 'Enter a valid email address',
  password: 'Password must be at least 8 characters',
  confirm: 'Passwords do not match',
};

const Registration = ({ navigation }:any) => {
  const isKeyboardVisible = useKeyboard();
  const api = useApi(null);
  const [loading, setLoading] = useState(false);
  const [formValue, setFormValue] = useState({
    email: {
      value: '',
      isValid: false,
      error: '',
    },
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
    },
    userType: {
      obj: {
        label: 'Individual',
        value: 'Individual',
      },
      value: 'Individual',
      isValid: false,
      error: '',
    },
    // permitType: {
    //   obj: {},
    //   value: '',
    //   isValid: false,
    //   error: '',
    // },
    firstName: {
      value: '',
      isValid: false,
      error: '',
    },
    middleName: {
      value: '',
      isValid: false,
      error: '',
    },
    lastName: {
      value: '',
      isValid: false,
      error: '',
    },
    suffix: {
      value: '',
      isValid: false,
      error: '',
    },
    companyName: {
      value: '',
      isValid: false,
      error: '',
    },
    applicantName: {
      value: '',
      isValid: false,
      error: '',
    },
    dateOfBirth: {
      value: [
        {
          id: 'year',
          value: '',
        },
        {
          id: 'month',
          value: '',
        },
        {
          id: 'day',
          value: '',
        },
      ],
      isValid: false,
      error: '',
    },
    sex: {
      value: '',
      isValid: false,
      error: '',
    },
    nationality: {
      value: '',
      isValid: false,
      error: '',
    },
    contactNumber: {
      value: '',
      isValid: false,
      error: '',
    },
    address: {
      value: '',
      isValid: false,
      error: '',
    },
    agreed: {
      value: false,
    },
    region: {
      value: '',
      isValid: false,
      error: '',
      items: regionList
    },
    province: {
      value: '',
      isValid: false,
      error: '',
      items: [],
      loading: false,
    },
    city: {
      value: '',
      isValid: false,
      error: '',
      items: [],
      loading: false,
    },
    barangay: {
      value: '',
      isValid: false,
      error: '',
    },
    street: {
      value: '',
      isValid: false,
      error: '',
    },
    unit: {
      value: '',
      isValid: false,
      error: '',
    },
    zipCode: {
      value: '',
      isValid: false,
      error: '',
    },
    signature: {
      value: '',
      isValid: false,
      error: '',
    },
  });

  const saveFormData = (form: any = {}) => {
    setFormValue({
      ...formValue,
      ...form,
    });
  };

  const onChangeText = useCallback((key: string, value: any) => {
    setFormValue((prev) => {
      switch (key) {
        case 'email': {
          const checked = validateEmail(value);
          return {
            ...prev,
            [key]: {
              value: value,
              isValid: checked,
              error: !checked ? errorResponse['email'] : ''
            }
          };
        }
        case 'password': {
          const passwordTest = validatePassword(value);
          const checked = validatePasswordMatch(value, prev.confirmPassword.value);
          return {
            ...prev,
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
              ...prev.confirmPassword,
              isValid: checked,
              error: !checked ? errorResponse['confirm'] : ''
            }
          };
        }
        case 'confirmPassword': {
          const checked = validatePasswordMatch(value, prev.password.value);
          return {
            ...prev,
            [key]: {
              value: value,
              isValid: checked,
              error: !checked ? errorResponse['confirm'] : ''
            }
          };
        }
        case 'showPassword': {
          return {
            ...prev,
            [key]: {
              value: value,
            }
          };
        }
        case 'region': {
          return {
            ...prev,
            "region": {
              ...prev.region,
              value: value,
              isValid: !!value,
              error: '',
            }
          };
        }
        default:
          return {
            ...prev,
            [key]: {
              value: value,
              isValid: !!value,
              error: '',
            }
          };
      }
    });
  }, []);

  const validatePasswordMatch = (value:string, password:string) => {
    return value === password;
  };

  const onValidateEmail = (email:string, callback = (err:any, res:any) => {}) => {
    // api.get(`/validate-email?email=${email}`)
    api.get(`/users/get-by-email/${email}`)
      .then((res) => {
        callback(null, res);
      })
      .catch(e => {
        callback(e, null);
      });
  }

  const onCheckValidation = () => {

    if (!formValue.email.isValid) {
      return onChangeText('email', formValue.email.value);
    } else if (!formValue.password.isValid) {
      return onChangeText('password', formValue.password.value);
    } else if (!formValue.confirmPassword.isValid) {
      return onChangeText('confirmPassword', formValue.confirmPassword.value);
    } else {

      setLoading(true);
      onValidateEmail(formValue.email.value, (err, res) => {
        setLoading(false);
        if (res?.data?._id) {
          return Alert.alert(
            'Duplicate Email Address',
            'It seems like this email address already exists in our record.'
          );
        }
        else if (JSONfn.parse(JSONfn.stringify(err))?.status === 404) {

          return navigation.navigate(
            'RegistrationPageTwo',
            {
              FormValue: formValue,
              saveFormData,
            }
          );
        }
        else {
          return Alert.alert('Alert', err?.message || 'Something went wrong.');
        }


      })
    }
  };

  const isValid =
    formValue.email.isValid &&
    formValue.password.isValid &&
    formValue.confirmPassword.isValid;

  return (
    <View style={styles.container}>
      <NavBar
        title={'Sign up'}
        rightIcon={<Text color='#fff'>Close</Text>}
        onRight={() => navigation.navigate('Login')}
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
          <RegistrationForm onChangeValue={onChangeText} form={formValue} />
          <View style={styles.bottomView} />
        </ScrollView>
      </KeyboardAvoidingView>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'position', android: undefined })}
        style={styles.keyboardAvoiding}
      >
        <View style={[
          styles.buttonContainer,
          styles.row,
          isKeyboardVisible && styles.shadow
        ]}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text
              size={16}
              color={text.info}
              style={styles.boldText}
            >
              Sign in instead
            </Text>
          </TouchableOpacity>
          <Button
            disabled={loading}
            style={[
              styles.row,
              styles.button,
              {
                backgroundColor: isValid ?
                  button.primary :
                  button.default
              },
              loading && { backgroundColor: '#60A5FA' }
            ]}
            onPress={onCheckValidation}
          >
            <Text color={(isValid || loading) ? '#fff' : text.disabled} size={14} style={styles.boldText}>Next</Text>
            {
              loading ? (
                <ActivityIndicator size={14} color={'white'} style={styles.arrowRight}/>
              ) : (
                <ArrowRight color={isValid ? '#fff' : text.disabled} size={18} style={styles.arrowRight} />
              )
            }
          </Button>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default React.memo(Registration);
