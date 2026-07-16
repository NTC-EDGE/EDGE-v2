import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch, RootStateOrAny } from 'react-redux';
import { View,ScrollView,ImageBackground,ActivityIndicator,BackHandler,TouchableOpacity, Platform } from 'react-native';
import moment from 'moment';
import Text from '@atoms/text';
import Alert from '@atoms/alert';
import { Left } from '@atoms/icon';
import { DateField, DropdownField, InputField } from '@molecules/form-fields';
import UploadFile from '@molecules/upload-file';
import { Bottom } from '@molecules/buttons';
import NavBar from '@organisms/navbar';
import styles from './styles';

import {
  validateText,
  validatePhone,
  validateEmail,
  validatePassword,
  validateNumber,
  validateZipCode,
} from '@utils/form-validations';
import { setCreatedAt, setUpdateUserError, setUpdateUserSuccess, updateUser } from '@reducers/user/actions';
import { fetchProvinces, fetchCities } from '@reducers/application/actions';
import { userType as USER_TYPE } from '@utils/registration-lists';
import { extractDate, isMobile, JSONfn } from '@utils/formatting';
import { regionList } from '@utils/ntc';
import { changeCreatedAt } from '@config/api';
import Sign from "@atoms/signature";
import SignatureModal from "@molecules/sign-modal";

const Profile = ({
  navigation
}: any) => {
  const dispatch = useDispatch();
  const state = useSelector((state: RootStateOrAny) => state);
  const { user } = state;
  const { updatingUserPhoto, updatingUserProfile, updateUserSuccess, updateUserError, session } = user;
  const profilePicture = session?.profilePicture?.original;
  const signature = session?.signature?.small;
  const photo = profilePicture ? {uri: profilePicture} : require('@assets/avatar.png');

  const [visible, setVisible] = useState(false);
  const [discardVisible, setDiscardVisible] = useState(false);

  const stateApplication = useSelector((state: RootStateOrAny) => state?.application) || {};
  const { provinces, fetchingProvinces, cities, fetchingCities } = stateApplication;

  const errorResponse = {
    userType: 'Select a user type',
    email: 'Enter a valid email address',
    password: 'Password must be at least 8 characters',
    confirm: 'Passwords do not match',
    firstName: 'Enter first name',
    middleName: 'Enter middle name',
    lastName: 'Enter last name',
    suffix: 'Enter suffix',
    companyName: 'Enter company name',
    applicantName: 'Enter name of representative',
    sex: 'Select a sex',
    nationality: 'Enter a nationality',
    contactNumber: 'Enter a valid contact number',
    height: 'Enter a valid height',
    weight: 'Enter a valid weight',
    region: 'Select a region',
    province: 'Select a province',
    city: 'Select a city',
    barangay: 'Enter barangay',
    street: 'Enter street',
    unit: 'Enter unit',
    zipCode: 'Enter a valid zip code',
  };

  const validate = {
    email: validateEmail,
    contactNumber: validatePhone,
    height: validateNumber,
    weight: validateNumber,
    zipCode: validateZipCode,
  };

  const validatePasswordMatch = (value: string, password: string) => { return value === password; };
  const onChangeValue = (key: string, value: any, subId: string = '') => {
    if (form[key]?.value === (value?.label || value)) return;
    switch (key) {
      case 'password': {
        const passwordTest = validatePassword(value);
        const checked = validatePasswordMatch(value, form.confirmPassword.value);
        return setForm({
          ...form,
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
            ...form.confirmPassword,
            isValid: checked,
            error: !checked ? errorResponse['confirm'] : ''
          }
        });
      }
      case 'confirmPassword': {
        const checked = validatePasswordMatch(value, form.password.value);
        return setForm({
          ...form,
          [key]: {
            value: value,
            isValid: checked,
            error: !checked ? errorResponse['confirm'] : ''
          }
        });
      }
      case 'showPassword': {
        return setForm({
          ...form,
          [key]: {
            value: value,
          }
        });
      }
      case 'signature': {
        return setForm({
          ...form,
          [key]: {
            value: value,
          }
        });
      }
      case 'userType': {
        return setForm({
          ...form,
          [key]: {
            obj: value,
            value: value?.value,
            isValid: !!value?.value,
            error: !value?.value ? errorResponse['userType'] : ''
          }
        });
      }
      case 'dateOfBirth': {
        let index = form?.dateOfBirth?.value?.findIndex((v: any) => v?.id === subId);
        if (index > -1) {
          let _value = [...form?.dateOfBirth?.value];
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
          return setForm({
            ...form,
            [key]: {
              value: _value,
              isValid: !notValid(),
            }
          });
        }
      }
      case 'region': {
        dispatch(fetchProvinces({regionCode: value?.value}));
        return setForm({
          ...form,
          province: {
            value: '',
            isValid: true,
            error: 'Select a province',
          },
          city: {
            value: '',
            isValid: false,
            error: 'Select a city',
          },
          "region": {
            ...form.region,
            value: value.label,
            isValid: !!value,
            error: '',
          }
        });
      }
      case 'province': {

        dispatch(fetchCities({provinceCode: value?.value}));
        return setForm({
          ...form,
          city: {
            value: '',
            isValid: false,
            error: 'Select a city',
          },
          [key]: {
            value: value?.label,
            isValid: true,
            error: '',
          }
        });
      }
      case 'city': {
        return setForm({
          ...form,
          [key]: {
            value: value?.label,
            isValid: true,
            error: '',
          }
        });
      }
      default:
        const isValid = ( /**not required fields */
          key === 'middleName' ||
          key === 'suffix' ||
          key === 'street' ||
          key === 'unit'
        ) ? true
          : validate?.[key] ? validate[key](value) : validateText(value);
        return setForm({
          ...form,
          [key]: {
            value: value,
            isValid,
            error: !isValid ? errorResponse[key] : ''
          }
        });
    }
  };

  const { userType, firstName, middleName, lastName, suffix, dateOfBirth, sex, nationality, contactNumber, applicant } = session;
  const { companyName, applicantName, address } = applicant || {};
  const { region, province, city, barangay, street, unit, zipCode } = address || {};

  /** had to subtract 1 month from dateOfBirth since moment uses 0 as January, 1 as February and so on.. */
  const _getFormDate = (_f: any, _id: string) => { return _f?.dateOfBirth?.value?.find((d: any) => d?.id === _id)?.value; }
  const birthDate = extractDate(dateOfBirth, 'date');
  const birthMonth = extractDate(dateOfBirth, 'month');
  const birthYear = extractDate(dateOfBirth, 'year');

  const baseForm = {
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
      obj: {},
      value: userType,
      isValid: !!userType,
      error: '',
    },
    firstName: {
      value: firstName,
      isValid: !!firstName,
      error: '',
    },
    middleName: {
      value: middleName,
      isValid: !!middleName,
      error: '',
    },
    lastName: {
      value: lastName,
      isValid: !!lastName,
      error: '',
    },
    suffix: {
      value: suffix,
      isValid: !!suffix,
      error: '',
    },
    companyName: {
      value: companyName,
      isValid: !!companyName,
      error: '',
    },
    applicantName: {
      value: applicantName,
      isValid: !!applicantName,
      error: '',
    },
    dateOfBirth: {
      value: [
        {
          id: 'year',
          value: birthYear,
        },
        {
          id: 'month',
          value: birthMonth,
        },
        {
          id: 'day',
          value: birthDate,
        },
      ],
      isValid: !!birthYear && !!birthMonth && !!birthDate,
      error: '',
    },
    sex: {
      value: sex,
      isValid: !!sex,
      error: '',
    },
    nationality: {
      value: nationality,
      isValid: !!nationality,
      error: '',
    },
    contactNumber: {
      value: contactNumber,
      isValid: !!contactNumber,
      error: '',
    },
    height: {
      value: (applicant?.height || '')?.toString(),
      isValid: !!applicant?.height,
      error: '',
    },
    weight: {
      value: (applicant?.weight || '')?.toString(),
      isValid: !!applicant?.weight,
      error: '',
    },
    region: {
      value: region,
      isValid: !!region,
      error: '',
    },
    province: {
      value: province,
      isValid: !!province,
      error: '',
    },
    city: {
      value: city,
      isValid: !!city,
      error: '',
    },
    barangay: {
      value: barangay,
      isValid: !!barangay,
      error: '',
    },
    street: {
      value: street,
      isValid: true,
      error: '',
    },
    unit: {
      value: unit,
      isValid: true,
      error: '',
    },
    zipCode: {
      value: zipCode,
      isValid: !!zipCode,
      error: '',
    },

    signature: {
      value: signature,
      isValid: false,
      error: '',
    },

  };
  const [form, setForm] = useState(JSONfn.parse(JSONfn.stringify(baseForm)));

  const nameValid = form?.userType?.value === 'Company'
    ? form?.companyName?.value && form?.companyName?.isValid &&
      form?.applicantName?.value && form?.applicantName?.isValid
    : form?.firstName?.value && form?.firstName?.isValid &&
      form?.lastName?.value && form?.lastName?.isValid;
  const userDataValid = form?.userType?.value === 'Company'
    ? true
    : form?.sex?.value && form?.sex?.isValid &&
      form?.nationality?.value && form?.nationality?.isValid &&
      form?.dateOfBirth?.value?.[0]?.value &&
      form?.dateOfBirth?.value?.[1]?.value &&
      form?.dateOfBirth?.value?.[2]?.value;
  const valid =
    form?.userType?.value && form?.userType?.isValid &&
    nameValid &&
    userDataValid &&
    form?.contactNumber?.value && form?.contactNumber?.isValid &&
    form?.region?.value && form?.region?.isValid &&
    form?.province?.value && form?.province?.isValid &&
    form?.city?.value && form?.city?.isValid &&
    form?.barangay?.value && form?.barangay?.isValid &&
    form?.zipCode?.value && form?.zipCode?.isValid;
  const hasChanges = () => {
    let hc = false;
    Object?.keys(baseForm).map(bf => {
      if (bf === 'dateOfBirth') {
        if (
          _getFormDate(form, 'day') !== _getFormDate(baseForm, 'day') ||
          _getFormDate(form, 'month') !== _getFormDate(baseForm, 'month') ||
          _getFormDate(form, 'year') !== _getFormDate(baseForm, 'year')
        ) {
          hc = true;
          return;
        }
      }
      else if (baseForm?.[bf]?.value !== form?.[bf]?.value) {
        hc = true;
        return;
      }
    });
    return hc;
  };

  const save = async(file:any, isCropped = false)=>{
    var formData = new FormData(), updatedUser = {};
    if (file) {
      if (isMobile) {
        formData.append('profilePicture', {
          name: file.name,
          type: file.mimeType,
          uri: file.uri,
        } as any);
        dispatch(updateUser({ userProfile: formData, photo: true,  }));
      } else {
        try {
          // NEW if‑else: handle blob:, data:, or http URL
          let uri = file.uri;
          let resp: Response;
          let blob: Blob;

          const asset = file?.assets?.[0];
          await fetch(asset?.uri)
              .then(res => { return res?.blob(); })
              .then(blob => {
                const mime = asset?.uri?.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
                if (mime && mime[1]) {
                  const attachmentMime = mime[1].split('/')[1] || 'jpeg';
                  const _file = new File([blob], `${asset?.name}${attachmentMime.length < 5 ? `.${attachmentMime}` : ''}`);
                  formData.append('profilePicture', _file);
                  dispatch(updateUser({
                    userProfile: formData,
                    photo: !!asset,
                    isCropped
                  }));
                } else {
                  console.warn('Could not extract MIME type from URI:', file?.uri);
                }
              });


          if (uri.startsWith('blob:')) {
            // Fetch the blob URL
            resp = await fetch(uri, { mode: 'cors' });
            blob = await resp.blob();
          } else if (uri.startsWith('data:')) {
            // Convert data URI to blob
            resp = await fetch(uri);
            blob = await resp.blob();
          } else {
            // HTTP(S) URL
            resp = await fetch(uri, { mode: 'cors' });
            blob = await resp.blob();
          }

          // Derive MIME and extension
          const mimeType = blob.type || 'image/jpeg';
          const ext = mimeType.split('/')[1] || 'jpeg';
          const baseName = file.name?.replace(/\.[^/.]+$/, '') || 'photo';
          const fileName = `${baseName}.${ext}`;

          // Build the File and append
          const fileObj = new File([blob], fileName, { type: mimeType });
          formData.append('profilePicture', fileObj);
          dispatch(updateUser({ userProfile: formData, photo: true , isCropped}));
        } catch (err) {
          console.warn('Error preparing upload:', err);
        }
      }
    }
    else {
      Object?.keys(form).forEach((key:any)=>{
        if (
          key === 'height' ||
          key === 'weight'
        ) {
          updatedUser = {
            ...updatedUser,
            applicant: {
              ...(updatedUser?.applicant || {}),
              [key]: Number(form?.[key]?.value),
            },
          };
        }
        else if (
          key === 'applicantName' ||
          key === 'companyName'
        ) {
          updatedUser = {
            ...updatedUser,
            applicant: {
              ...(updatedUser?.applicant || {}),
              [key]: form?.[key]?.value,
            },
          };
        }
        else if (
          key === 'region' ||
          key === 'province' ||
          key === 'city' ||
          key === 'barangay' ||
          key === 'street' ||
          key === 'unit' ||
          key === 'zipCode'
        ) {
          updatedUser = {
            ...updatedUser,
            applicant: {
              ...(updatedUser?.applicant || {}),
              address: {
                ...(updatedUser?.applicant?.address || {}),
                [key]: form?.[key]?.value,
              },
            },
          };
        }
        else if (key === 'dateOfBirth') {
          let y = _getFormDate(form,'year');
          let m = _getFormDate(form,'month');
          let d = _getFormDate(form,'day');
          let _dateOfBirth=moment(new Date()).set({
            year: y,
            month: m,
            date: d,
            hour:0,
            minute:0,
            second:0,
            millisecond:0,
          });
          updatedUser = {...updatedUser, [key]: (y && m && d) ? _dateOfBirth : null}
        }
        else updatedUser = {...updatedUser, [key]:form?.[key]?.value};
      });
      updatedUser.applicant = {
        ...(updatedUser.applicant || {}),
        userId: session?._id,
        _id: applicant?._id,
      };
      dispatch(updateUser({
        userProfile: updatedUser,
        photo: !!file,
        isCropped
      }));
    }
  };

  const [backPressed, setBackPressed] = useState(false);
  const onBack = () => {
    setBackPressed(true);
    return true;
  };
  useEffect(() => {
    if (backPressed) {
      if (hasChanges()) setDiscardVisible(true);
      else navigation.pop();
      setBackPressed(false);
    }
  }, [backPressed]);
  useEffect(() => {
    setVisible(updateUserSuccess);
  }, [updateUserSuccess]);
  useEffect(() => {
    setVisible(updateUserError);
  }, [updateUserError]);
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBack);
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>

      <Alert
        alertContainerStyle={{zIndex: 2}}
        visible={visible}
        title={updateUserSuccess ? 'Success' : 'Failure'}
        message={updateUserSuccess ? 'Your profile has been successfully updated!' : 'Failed to update your profile.'}
        confirmText='OK'
        onConfirm={() => {
          setVisible(false);
          setTimeout(() => {
            if (updateUserSuccess) dispatch(setUpdateUserSuccess(false));
            if (updateUserError) dispatch(setUpdateUserError(false));
          }, 1000);
        }}
      />

      <Alert
          alertContainerStyle={{zIndex: 2}}
        visible={discardVisible}
        title='Discard Changes'
        message='You have unsaved changes. Do you want to continue?'
        confirmText='OK'
        cancelText='Cancel'
        onConfirm={() => navigation.pop()}
        onCancel={() => setDiscardVisible(false)}
      />

      <NavBar
        title='Profile'
        leftIcon={<Left color='#fff' />}
        onLeft={() => {
          setTimeout(() => {
            onBack();
          });
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={true}
        style={styles.scrollview}
      >
        <View style={Platform.select({
          web: { flexDirection: "row"},
          native: { flexDirection: "column"}
        })}>
          <View style={Platform.select({
            web: {flex: 0.2}
          })}>
            <View style={Platform.select({
              web: styles.column,
              native: styles.row
            })}>
              <ImageBackground
                  style={styles.image}
                  imageStyle={styles.imageStyle}
                  source={photo}
              >
                { updatingUserPhoto && <ActivityIndicator color='#fff' size='large' /> }
              </ImageBackground>

              <UploadFile
                  image={photo.uri}
                  raw
                  photoOnly
                  uploadText='Change photo'
                  onUpload={(file: any, isCropped = false) => save(file, isCropped)}
                  isCrop={true}
              />
              <SignatureModal formSignature={form?.signature}  userId={session?._id}/>




            </View>
          </View>


          <View style={Platform.select({
              web: {
                flex: 0.8,
                backgroundColor: "#fff",
                padding: 20,
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,

                elevation: 5,
                borderRadius: 10
              },
              native: {flex: 1}
          })}>
            <DropdownField
                items={USER_TYPE}
                required={true}
                hasValidation={true}
                placeholder='User'
                error={form?.userType?.error}
                value={form?.userType?.value}
                onChangeValue={(value: object) => onChangeValue('userType', value)}
            />
            {
              form?.userType?.value === 'Company'
                  ? <>
                    <InputField
                        label='Company Name'
                        placeholder='Company name'
                        required={true}
                        hasValidation={true}
                        error={form?.companyName?.error}
                        value={form?.companyName?.value}
                        onChangeText={(value: string) => onChangeValue('companyName', value)}
                    />
                    <InputField
                        label='Name of Representative'
                        placeholder='Name of Representative'
                        required={true}
                        hasValidation={true}
                        error={form?.applicantName?.error}
                        value={form?.applicantName?.value}
                        onChangeText={(value: string) => onChangeValue('applicantName', value)}
                    />
                  </>
                  : <>
                    <InputField
                        label='First name'
                        placeholder='First name'
                        required={true}
                        hasValidation={true}
                        error={form?.firstName?.error}
                        value={form?.firstName?.value}
                        onChangeText={(value: string) => onChangeValue('firstName', value)}
                    />
                    <InputField
                        label='Middle name'
                        placeholder='Middle name'
                        value={form?.middleName?.value}
                        onChangeText={(value: string) => onChangeValue('middleName', value)}
                    />
                    <InputField
                        label='Last name'
                        placeholder='Last name'
                        required={true}
                        hasValidation={true}
                        error={form?.lastName?.error}
                        value={form?.lastName?.value}
                        onChangeText={(value: string) => onChangeValue('lastName', value)}
                    />
                    <InputField
                        label='Suffix'
                        placeholder='Suffix'
                        error={form?.suffix?.error}
                        value={form?.suffix?.value}
                        onChangeText={(value: string) => onChangeValue('suffix', value)}
                    />
                    <DateField
                        label='Date of Birth'
                        value={form?.dateOfBirth?.value}
                        onChangeValue={(subId: string, value: string) => {
                          onChangeValue('dateOfBirth', value, subId);
                        }}
                        required={true}
                        isDateOfBirth
                    />
                    <InputField
                        label='Height (cm.)'
                        placeholder='Height (cm.)'
                        error={form?.height?.error}
                        value={form?.height?.value}
                        onChangeText={(value: string) => onChangeValue('height', value)}
                        keyboardType='decimal-pad'
                    />
                    <InputField
                        label='Weight (kg.)'
                        placeholder='Weight (kg.)'
                        error={form?.weight?.error}
                        value={form?.weight?.value}
                        onChangeText={(value: string) => onChangeValue('weight', value)}
                        keyboardType='decimal-pad'
                    />
                    <DropdownField
                        items={[
                          {label: 'Male', value: 'Male'},
                          {label: 'Female', value: 'Female'},
                        ]}
                        required={true}
                        hasValidation={true}
                        placeholder='Sex'
                        error={form?.sex?.error}
                        value={form?.sex?.value}
                        onChangeValue={(value: object) => onChangeValue('sex', value?.value)}
                    />


                    <DropdownField
                        items = {[
                          {label: 'Filipino', value: 'Filipino'},
                          {label: 'Others', value: 'Others'}
                        ]}
                        required={true}
                        hasValidation={true}
                        placeholder='Nationality'
                        error={form?.nationality?.error}
                        value={form?.nationality?.value}
                        onChangeText={(value: string) => onChangeValue('nationality', value)}
                    />

                  </>
            }
            <InputField
                label='Phone number'
                placeholder='Phone number'
                required={true}
                hasValidation={true}
                error={form?.contactNumber?.error}
                value={form?.contactNumber?.value}
                keyboardType='phone-pad'
                onChangeText={(value: string) => onChangeValue('contactNumber', value)}
            />
            <DropdownField
                items={regionList}
                required={true}
                hasValidation={true}
                placeholder='Region'
                error={form?.region?.error}
                value={form?.region?.value}
                onChangeValue={(value: object) => {
                  onChangeValue('region', value)
                }}
            />
            <DropdownField
                items={provinces}
                loading={fetchingProvinces}
                required={true}
                hasValidation={true}
                placeholder='Province'
                error={form?.province?.error}
                value={form?.province?.value}
                onChangeValue={(value: object) => onChangeValue('province', value)}
            />
            <DropdownField
                items={cities}
                loading={fetchingCities}
                required={true}
                hasValidation={true}
                placeholder='City'
                error={form?.city?.error}
                value={form?.city?.value}
                onChangeValue={(value: object) => onChangeValue('city', value)}
            />
            <InputField
                label='Barangay'
                placeholder='Barangay'
                required={true}
                hasValidation={true}
                error={form?.barangay?.error}
                value={form?.barangay?.value}
                onChangeText={(value: string) => onChangeValue('barangay', value)}
            />
            <InputField
                label='Street/Zone'
                placeholder='Street/Zone'
                hasValidation={true}
                error={form?.street?.error}
                value={form?.street?.value}
                onChangeText={(value: string) => onChangeValue('street', value)}
            />
            <InputField
                label='Unit/Rm./House/Bldg. No.'
                placeholder='Unit/Rm./House/Bldg. No.'
                hasValidation={true}
                error={form?.unit?.error}
                value={form?.unit?.value}
                onChangeText={(value: string) => onChangeValue('unit', value)}
            />
            <InputField
                label='Zip Code'
                placeholder='Zip Code'
                hasValidation={true}
                error={form?.zipCode?.error}
                value={form?.zipCode?.value}
                onChangeText={(value: string) => onChangeValue('zipCode', value)}
                required={true}
            />


            <TouchableOpacity onPress={ () => navigation.navigate('ChangePassword')} >
              <Text style={styles.changePassword}>Change password</Text>
            </TouchableOpacity>

            <View style={styles.bottomView} />
          </View>
        </View>


      </ScrollView>

      <Bottom
        noShadow
        block={false}
        label='Save'
        onPress={() => save()}
        disabled={!(hasChanges() && valid)}
        loading={updatingUserProfile}
      />

    </View>
  )
};

export default React.memo(Profile);
