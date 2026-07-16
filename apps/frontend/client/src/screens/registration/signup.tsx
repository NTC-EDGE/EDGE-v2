import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import moment from 'moment';
import { validateText, validatePhone, validateZipCode } from '@utils/form-validations';
import { ArrowRight, Left } from '@atoms/icon';
import RegistrationDetailsForm from '@organisms/forms/registration-details';
import useKeyboard from 'src/hooks/useKeyboard';
import Text from '@atoms/text';
import Button from '@components/atoms/button';
import NavBar from '@organisms/navbar';
import { button, text } from '@styles/color';
import styles from './styles';
import api, {apiWorker} from '@config/api';
import Ellipsis from '@components/atoms/ellipsis';
import { JSONfn } from '@utils/formatting';

const RegistrationSignUp = ({ route, navigation }:any) => {
  const isKeyboardVisible = useKeyboard();

  const { FormValue = {}, saveFormData = () => {} } = route.params;
  const { email, password } = FormValue;
  const [formValue, setFormValue] = useState(FormValue);

  const [fetchingProvinces, setFetchingProvinces] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const fetchProvinces = () => {
    setFetchingProvinces(true);
    apiWorker(null, '')
      .get(`/provinces?region=${formValue?.region?.preservedCode}`)
      .then((res: any) => {
        setFetchingProvinces(false);
        if (res?.status === 200) {
          let _data = [];
          res?.data?.forEach((a: any) => {
            _data.push({
              label: a.name,
              value: a.provinceCode,
            });
          });
          setProvinces(_data);
        }
        else Alert.alert('Alert', res?.message || 'Cannot fetch provinces at the moment. Please try again later.');
      })
      .catch((err: any) => {
        setFetchingProvinces(false);
        Alert.alert('Alert', err?.message);
      });
  };

  useEffect(() => {
    if (formValue?.region?.preservedCode) fetchProvinces();
  }, [formValue?.region?.preservedCode]);

  const [fetchingCities, setFetchingCities] = useState(false);
  const [cities, setCities] = useState([]);
  const fetchCities = () => {
    setFetchingCities(true);
    apiWorker(null, '')
      .get(`/cities?province=${formValue?.province?.preservedCode}`)
      .then((res: any) => {
        setFetchingCities(false);
        if (res?.status === 200) {
          let _data = [];
          res?.data?.forEach((a: any) => {
            _data.push({
              label: a.name,
              value: a.cityCode,
            });
          });
          setCities(_data);
        }
        else Alert.alert('Alert', res?.message || 'Cannot fetch provinces at the moment. Please try again later.');
      })
      .catch((err: any) => {
        setFetchingCities(false);
        Alert.alert('Alert', err?.message);
      });
  };
  useEffect(() => {
    if (formValue?.province?.preservedCode) fetchCities();
  }, [formValue?.province?.preservedCode]);

  const [loading, setLoading] = useState(false);
  const onSubmit = () => {
    setLoading(true);

    api(null, '')
      .post(`registration-otp-request`, {contactNumber: formValue?.contactNumber?.value, email: email?.value ?? "" })
      .then((res: any) => {
        setLoading(false);

        if (res?.data?.success) {
          let year = formValue?.dateOfBirth?.value?.find((v: any) => v?.id === 'year')?.value;
          let month = formValue?.dateOfBirth?.value?.find((v: any) => v?.id === 'month')?.value;
          let date = formValue?.dateOfBirth?.value?.find((v: any) => v?.id === 'day')?.value
          let dateOfBirth = year && month && date
            ? moment(new Date()).set({year, month, date})
            : null;
          return navigation.navigate(
            'RegistrationOTP',
            {
              email: email?.value,
              password: password?.value,
              userType: formValue?.userType.value,
              // permitType: formValue.permitType.value,
              firstName: formValue.firstName.value,
              middleName: formValue.middleName.value,
              lastName: formValue.lastName.value,
              suffix: formValue.suffix.value,
              companyName: formValue.companyName.value,
              applicantName: formValue.applicantName.value,
              dateOfBirth,
              sex: formValue.sex.value,
              nationality: formValue.nationality.value,
              contactNumber: formValue.contactNumber.value,
              region: formValue.region.value,
              province: formValue.province.value,
              city: formValue.city.value,
              barangay: formValue.barangay.value,
              street: formValue.street.value,
              unit: formValue.unit.value,
              zipCode: formValue.zipCode.value,
              role: 'user',
              otpId: res?.data?.otpId,
              signature: formValue.signature.value,
            }
          );
        }
        else Alert?.alert('Alert', res?.data?.message || 'Cannot proceed right now.');
      })
      .catch((err: any) => {
        setLoading(false);
        Alert.alert('Alert', err?.message);
      });
  };

  const errorResponse = {
    userType: 'Select a user type',
    // permitType: 'Select a user type',
    firstName: 'Enter first name',
    middleName: 'Enter middle name',
    suffix: 'Enter suffix',
    lastName: 'Enter last name',
    companyName: 'Enter company name',
    applicantName: 'Enter name of representative',
    contactNumber: 'Enter a valid contact number',
    address: 'Enter address',
    sex: 'Select a sex',
    nationality: 'Enter a nationality',
    region: 'Select a region',
    province: 'Select a province',
    city: 'Enter city',
    barangay: 'Enter barangay',
    street: 'Enter street',
    unit: 'Enter unit',
    zipCode: 'Enter a valid zip code',
  };

  const onChangeText = (key: string, value: any, subId: string = '') => {
    let preservedValue = JSONfn.parse(JSONfn.stringify(value));
    let preservedCode = '';
    if (
      key === 'region' ||
      key === 'province' ||
      key === 'city'
    ) {
      preservedCode = preservedValue?.value || '';
      value = value?.label || '';
    }
    let setState = (obj: any) => {
      setFormValue((formValue: any) => {
        return {
          ...formValue,
          ...obj,
        };
      });
    };

    switch (key) {
      case 'userType': {
        return setState({
          [key]: {
            obj: value,
            value: value?.value,
            isValid: !!value?.value,
            error: !value?.value ? errorResponse['userType'] : ''
          }
        });
      }
      case 'middleName': {
        return setState({
          [key]: {
            value: value,
            isValid: true,
            error: ''
          }
        });
      }
      case 'suffix': {
        return setState({
          [key]: {
            value: value,
            isValid: true,
            error: ''
          }
        });
      }
      case 'dateOfBirth': {
        let index = formValue?.dateOfBirth?.value?.findIndex((v: any) => v?.id === subId);
        if (index > -1) {
          let _value = [...formValue?.dateOfBirth?.value];
          _value[index].value = value?.value;
          let notValid = () => {
            let notValid = false;
            _value.forEach((v: any) => {
              if (!v.value) {
                notValid = true;
                return;
              }
            });
            return notValid;
          };
          return setState({
            [key]: {
              value: _value,
              isValid: !notValid(),
            }
          });
        }
      }
      case 'contactNumber': {
        const checked = validatePhone(value);
        return setState({
          [key]: {
            value: value,
            isValid: checked,
            error: !checked ? errorResponse['contactNumber'] : ''
          }
        });
      }
      case 'agreed': {
        return setState({
          [key]: {
            value: value,
          }
        });
      }
      case 'zipCode': {
        const _valid = validateZipCode(value);
        return setState({
          [key]: {
            value: value,
            isValid: _valid,
            error: !_valid ? errorResponse['zipCode'] : ''
          }
        });
      }
      case 'region': {

        return setState({
          region: {

            ...formValue?.region,
            preservedCode,
            value: value,
            isValid: true,
            error: '',
          },
          province: {
            items: [],
            value: '',
            isValid: false,
            error: '',
          },
          city: {
            items: [],
            value: '',
            isValid: false,
            error: '',
          },
        });
      }
      case 'province': {
        return setState({
          province: {
            ...formValue?.region,
            preservedCode,
            value: value,
            isValid: true,
            error: '',
          },
          city: {
            items: [],
            value: '',
            isValid: false,
            error: '',
          },
        });
      }
      case 'city': {
        return setState({
          city: {
            ...formValue?.city,
            value: value,
            isValid: true,
            error: '',
          },
        });
      }
      case 'signature': {
        return setState({
          signature: {
            ...formValue?.signature,
            value: value,
            isValid: !!value,
            error: '',
          },
        });
      }
      default:
        const test = validateText(value);
        return setState({
          [key]: {
            value: value,
            isValid: !!value,
            error: !test ? errorResponse[`${key}`] : ''
          }
        });
    }
  };

  const onCheckValidation = () => {
    // if (!formValue.permitType.isValid) {
    //   return onChangeText('permitType', formValue?.permitType?.obj?.value);
    // }
    if (formValue?.userType?.value === 'Company') {
      if (!formValue.companyName.isValid) { return onChangeText('companyName', formValue?.companyName?.value); }
      else if (!formValue.applicantName.isValid) { return onChangeText('applicantName', formValue?.applicantName?.value); }
    }
    else {
      if (!formValue.firstName.isValid) { return onChangeText('firstName', formValue?.firstName?.value); }
      else if (!formValue.lastName.isValid) { return onChangeText('lastName', formValue?.lastName?.value); }
      else if (!formValue.dateOfBirth.isValid) { return onChangeText('dateOfBirth', formValue?.dateOfBirth?.value?.[0]?.value, 'year'); }
      else if (!formValue.sex.isValid) { return onChangeText('sex', formValue?.sex?.value); }
      else if (!formValue.nationality.isValid) { return onChangeText('nationality', formValue?.nationality?.value); }
    }
    if (!formValue.contactNumber.isValid) { return onChangeText('contactNumber', formValue?.contactNumber?.value); }
    else if (!formValue.agreed.value) { return onChangeText('agreed', formValue.agreed.value); }

    else if (!formValue.region.isValid) { return onChangeText('region', formValue?.region?.value); }
    else if (!formValue.province.isValid) { return onChangeText('province', formValue?.province?.value); }
    else if (!formValue.city.isValid) { return onChangeText('city', formValue?.city?.value); }
    else if (!formValue.barangay.value) { return onChangeText('barangay', formValue.barangay.value); }
    else if (!formValue.zipCode.value) { return onChangeText('zipCode', formValue.zipCode.value); }

    else if (!formValue.signature.value) { return onChangeText('signature', formValue.signature.value); }

    else onSubmit();
  };

  useEffect(() => {
    return () => {
      saveFormData(formValue);
    }
  });

  const isUserValid = formValue?.userType?.value === 'Company'
    ? (
        formValue?.companyName?.isValid &&
        formValue?.applicantName?.isValid
      )
    : (
        formValue?.firstName?.isValid &&
        formValue?.lastName?.isValid
      )
    ;
  const areDeetsValid = formValue?.userType?.value === 'Company'
    ? true
    : (
        formValue?.dateOfBirth?.isValid &&
        formValue?.sex?.isValid &&
        formValue?.nationality?.isValid
      )
    ;
  const isValid =
    isUserValid &&
    areDeetsValid &&
    formValue?.contactNumber?.isValid &&
    formValue?.agreed?.value &&
    formValue.region?.isValid &&
    formValue.province?.isValid &&
    formValue.city?.isValid &&
    formValue.barangay?.isValid &&
    formValue.zipCode?.isValid &&
    formValue.signature?.isValid;

  const [scrollEnabled, setScrollEnabled] = useState(true);

  return (
    <View style={styles.container}>
      <NavBar
        title={'Sign up'}
        rightIcon={<Text color='#fff'>Close</Text>}
        onRight={() => navigation.navigate('Login')}
        leftIcon={<Left color='#fff' size={17}/>}
        onLeft={() => {
          saveFormData(formValue);
          navigation.pop();
        }}
      />
       <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        keyboardVerticalOffset={Platform.select({ ios: 75, android: undefined })}
        style={styles.container}
      >
        <ScrollView
          style={styles.scrollview}
          showsVerticalScrollIndicator={true}
          scrollEnabled={scrollEnabled}
        >
          <RegistrationDetailsForm
            onChangeValue={onChangeText}
            form={formValue}

            /**dirty props but dynamic approach doesn't seem to work; hooks issue */
            provinces={provinces}
            fetchingProvinces={fetchingProvinces}
            cities={cities}
            fetchingCities={fetchingCities}
            /** */

            onBegin={() => setScrollEnabled(false)}
            onEnd={() => setScrollEnabled(true)}

          />
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
            style={[
              styles.row,
              styles.button,
              {
                backgroundColor: isValid ?
                  button.primary :
                  button.default
              }
            ]}
            onPress={onCheckValidation}
            disabled={loading}
          >
            {
              loading
                ? <Ellipsis color='#fff' size={10} />
                : <>
                    <Text color={isValid ? '#fff' : text.disabled} size={14} style={styles.boldText}>Next</Text>
                    <ArrowRight color={isValid ? '#fff' : text.disabled} size={18} style={styles.arrowRight} />
                  </>
            }
          </Button>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default React.memo(RegistrationSignUp);
