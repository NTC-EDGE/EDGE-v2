import React, { useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Alert,
} from 'react-native';
import { validateEmail, validatePassword } from 'src/utils/form-validations';
import useKeyboard from 'src/hooks/useKeyboard';
import Text from '@atoms/text';
import Button from '@atoms/button';
import { ArrowRight } from '@atoms/icon';
import NTCAlert from '@atoms/alert';
import RegistrationForm from '@organisms/forms/registration';
import NavBar from '@organisms/navbar';
import { text, button, infoColor } from '@styles/color';
import styles from './styles';
import {JSONfn} from "@utils/formatting";
import useApi, { changeCreatedAt } from '@config/api';
import { regionList } from '@utils/ntc';
import Ellipsis from '@components/atoms/ellipsis';
import { setCreatedAt } from '@reducers/user/actions';
import { useDispatch } from 'react-redux';
import SEO from "@atoms/seo";

const errorResponse = {
  userType: 'Select a user type',
  // permitType: 'Select a permit type',
  email: 'Enter a valid email address',
  password: 'Password must be at least 8 characters',
  confirm: 'Passwords do not match',
};

const Registration = ({ navigation }:any) => {
  const isKeyboardVisible = useKeyboard();
  const dispatch = useDispatch();
  const api = useApi(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertData, setAlertData] = useState({});
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
      value: { label: "Region X - Northern Mindanao",  "value": "X" },
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
        case 'showPassword': {
          return {
            ...prev,
            [key]: {
              value: value,
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
    if(formValue.region?.value) {
      dispatch(setCreatedAt(changeCreatedAt(formValue.region?.value?.value)))
    }
    if (!formValue.email.isValid) return onChangeText('email', formValue.email.value);
    else if (!formValue.password.isValid) return onChangeText('password', formValue.password.value);
    else if (!formValue.confirmPassword.isValid) return onChangeText('confirmPassword', formValue.confirmPassword.value);
    else {
      setLoading(true);
      onValidateEmail(formValue.email.value, (err, res) => {
        setLoading(false);
        if (res?.data?._id) {
          setAlertData({
            title: 'Duplicate Email Address',
            message: 'It seems like this email address already exists in our record.',
          });
          setTimeout(() => setShowAlert(true), 500);
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
          setAlertData({
            title: err?.title || 'Alert',
            message: err?.message || 'Something went wrong',
          });
          setTimeout(() => setShowAlert(true), 500);
        }
      })
    }
  };

  const isValid =
    formValue.email.isValid &&
    formValue.password.isValid &&
    formValue.confirmPassword.isValid;

  return (
      <>
        <SEO
          title="Sign Up - NTC EDGE Portal"
          description="Create an account on the NTC EDGE Portal to apply for licenses, permits, and certificates online."
          canonical="https://www.ntcedge.com/Registration"
        />
        <NTCAlert
            titleStyle={{textAlign: "center"}}
            overlayStyle={{backgroundColor: "rgba(0,0,0,0)"}}
            alertContainerStyle={{paddingTop: 40, justifyContent: "flex-start",  zIndex: 2, backgroundColor: "rgba(0,0,0,0)"}}
            contentContainerStyle={{shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 7,
              },
              shadowOpacity: 0.43,
              shadowRadius: 9.51,

              elevation: 15}}
            visible={showAlert}
            title={alertData?.title || 'Alert'}
            message={alertData?.message}
            confirmText='OK'
            onConfirm={() => setShowAlert(false)}
        />


        <View style={styles.container}>


          <ScrollView
              style={styles.scrollview}
              showsVerticalScrollIndicator={true}
          >

            <RegistrationForm onChangeValue={onChangeText} form={formValue} />
            <View style={styles.bottomView} />
          </ScrollView>
          <View style={[
            styles.buttonContainer,
            styles.row,
            isKeyboardVisible && styles.shadow,
            {justifyContent: 'flex-end'}
          ]}>
            <Button
                style={[
                  styles.row,
                  styles.button,
                  {backgroundColor: isValid ? button.primary : button.default}
                ]}
                onPress={onCheckValidation}
            >
              {
                loading
                    ? <Ellipsis color={infoColor} size={10} />
                    : <>
                      <Text color={isValid ? '#fff' : text.disabled} size={14} style={styles.boldText}>Next</Text>
                      <ArrowRight color={isValid ? '#fff' : text.disabled} size={18} style={styles.arrowRight} />
                    </>
              }
            </Button>

          </View>
        </View>
      </>

  );
};

export default React.memo(Registration);
