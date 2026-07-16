import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  View,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as Progress from 'react-native-progress';
import { RFValue } from 'react-native-responsive-fontsize';
import * as FileSystem from 'expo-file-system';
import Text from '@atoms/text';
import Button from '@atoms/button';
import { Left } from '@atoms/icon';
import Ellipsis from '@atoms/ellipsis';
import { OTPField } from '@molecules/form-fields';
import NavBar from '@organisms/navbar';
import { text, button } from '@styles/color';
import useKeyboard from 'src/hooks/useKeyboard';
import { register, setRegisterSuccess, setRegisterError, uploadSignature } from '@reducers/user/actions';
import styles from './styles';
import api from '@config/api';
import { isMobile } from '@utils/formatting';

const timerLimit = 120;
const errorResponse = 'Invalid verification code. Please try again';
const code = '1234';

const OneTimePin = ({ navigation, route }:any) => {
  const {
    email,
    password,
    userType,
    // permitType,
    firstName,
    middleName,
    lastName,
    suffix,
    companyName,
    applicantName,
    dateOfBirth,
    sex,
    nationality,
    contactNumber,
    region,
    province,
    city,
    barangay,
    street,
    unit,
    zipCode,
    role,
    otpId,
    signature,
  } = route.params;
  const dispatch = useDispatch();
  const isKeyboardVisible = useKeyboard();
  const registering = useSelector(state => state?.user?.registering);
  const registerSuccess = useSelector(state => state?.user?.registerSuccess);
  const uploadingSignature = useSelector(state => state?.user?.uploadingSignature);
  const uploadSignatureSuccess = useSelector(state => state?.user?.uploadSignatureSuccess);
  const uploadSignatureError = useSelector(state => state?.user?.uploadSignatureError);
  const [timer, setTimer] = useState(timerLimit);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [newOTPID, setNewOTPID] = useState(otpId);

  const userId = useSelector(state => state?.user?.sessionTemporary?._id);

  const onSubmit = () => {
    setLoading(true);
    api(null, '')
      .post(`${newOTPID}/otp-validate?code=${otp}`)
      .then((res: any) => {
        setLoading(false);
        if (res?.data?.success) {
          let _p = {
            email,
            password,
            userType,
            // permitType,
            firstName,
            middleName,
            lastName,
            suffix,
            companyName,
            applicantName,
            dateOfBirth,
            sex,
            nationality,
            contactNumber,
            registerType: "register",
            address: {
              region,
              province,
              city,
              barangay,
              street,
              unit,
              zipCode,
            },
            role,
          };
          dispatch(register(_p));
        }
        else setError(res?.data?.message || errorResponse);
      })
      .catch((err: any) => {
        setLoading(false);
        setError(errorResponse);
      });
  };
  const onResend = useCallback(() => {
    setLoading(true);
    api(null, '')
      .post('/resend-otp-request', {otpId: newOTPID, contactNumber, email})
      .then((res: any) => {
        setLoading(false);
        if (res?.data?.success) {
          setNewOTPID(res?.data?.otpId);
          resetTimer();
        }
      })
      .catch((err: any) => {
        console.log(err)
        setLoading(false);
        setError(errorResponse);
      });
  }, []);
  const resetTimer = () => {
    setStarted(true);
    setEnded(false);
    setTimer(timerLimit);
    setError('');
    setOtp('');
  };
  const format = (time:number) => {
    var mins = ~~((time % 3600) / 60);
    var secs = ~~time % 60;
    var format = "";
    format += (mins < 10 ? "0" : "") + mins + ":" + (secs < 10 ? "0" : "");
    format += "" + secs;
    return format;
  };
  const onChangeText = (value:string) => {
    if (!!error) {
      setError('');
    }
    setOtp(value);
  };

  const onUpload = async (sign: any) => {
    let createFormData = async(file:any)=>{
      const data=new FormData();
      let f:any={
        name:file?.name ?? file.assets?.[0]?.name,
        type:file?.mimeType ?? file.assets?.[0]?.mimeType,
        uri:file?.uri?? file.assets?.[0]?.uri,
      }
      if (isMobile){
        data.append('file',f);
        data.append('userId',userId);
        return data;
      }
      Platform.select({
        web:await fetch(f?.uri).then(res=>{
          return res?.blob()
        }).then(blob=>{
          var mime=f?.uri?.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)
          var attachmentMime=mime[1]?.split("/")?.[1]
          if(mime&&mime.length){
            f=new File([blob],f?.name+(
                attachmentMime.length<5 ? "."+attachmentMime : ''));
          }
        })
      })
      data.append('file',f);
      data.append('userId',userId);
      return data;
    };
    let formData = await createFormData(sign);
    dispatch(uploadSignature(formData));
  };

  const _uploadSignature = (signature: any) => {
    const path = FileSystem.cacheDirectory + 'sign.png';
    FileSystem.writeAsStringAsync(
      path,
      signature.replace('data:image/png;base64,', ''),
      { encoding: FileSystem.EncodingType.Base64 }
    )
      .then(async () => {
        let file = await FileSystem.getInfoAsync(path);
        let split = file?.uri?.split('/');
        let name = split?.[split?.length - 1];
        file = {
          name,
          mimeType: 'image/png',
          uri: file?.uri,
        };
        onUpload(file);
      })
      .catch(console.error);
  }; 

  useEffect(() => {
    if (registerSuccess) {
      setEnded(true);
      dispatch(setRegisterSuccess(false));
      dispatch(setRegisterError(false));
      _uploadSignature(signature);
    }
  }, [registerSuccess]);

  useEffect(() => {
    if (uploadSignatureSuccess || uploadSignatureError) navigation.navigate('RegistrationSuccess');
  }, [uploadSignatureSuccess, uploadSignatureError]);

  useEffect(() => {
    resetTimer();
  }, []);

  useEffect(() => {
    let interval:any = null;
    if (started && !ended) {
      interval = setInterval(() => {
        setTimer(timer => timer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [started, ended]);

  useEffect(() => {
    if (timer === 0) {
      setStarted(false);
      setEnded(true);
    }
  }, [timer]);

  const renderDetail = (value:string) => {
    const lastFour = value.substr(value.length - 4);
    return `**** ${lastFour}`;
  };

  const _loading = registering || loading || uploadingSignature;

  return (
    <View style={styles.container}>
      <NavBar
        title={'Sign up'}
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
          <Text
            size={22}
            color={text.default}
          >
            OTP code sent!
          </Text>
          <View style={styles.description}>
            <Text
              size={16}
              color={text.default}
            >
              {`Enter the OTP code sent via SMS to your registered contact number ${renderDetail(contactNumber)} or email (${renderDetail(email)}).`}
            </Text>
          </View>
          <View style={styles?.row2}>
            <OTPField
              style={[
                styles.input,
                !!error && {
                  color: text.error
                }
              ]}
              maxLength={6}
              placeholder="••••"
              label={'OTP'}
              labelStyle={styles.labelStyle}
              required={true}
              hasValidation={true}
              outlineStyle={styles.outlineStyle}
              errorColor={text.error}
              requiredColor={text.error}
              error={error}
              value={otp}
              keyboardType={'number-pad'}
              onChangeText={onChangeText}
              editable={!ended}
            />
            {
              !ended &&
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Progress.Pie
                  style={{
                    transform: [
                      {scaleX: -1},
                    ]
                  }}
                  color={text.success}
                  borderWidth={0}
                  progress={timer/timerLimit}
                  size={RFValue(20)}
                />
                <Text
                  style={{ marginLeft: 5 }}
                  size={RFValue(18)}
                  color={text.default}
                >
                  {format(timer)}
                </Text>
              </View>
            }
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'position', android: undefined })}
        style={styles.keyboardAvoiding}
      >
        <View style={[
          styles.buttonContainer,
          styles.row,
          isKeyboardVisible && styles.shadow,
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
            disabled={_loading}
            style={[
              styles.button,
              {
                backgroundColor: ended
                  ? _loading
                    ? '#3BC759'
                    : button.success
                  : _loading
                    ? '#60A5FA'
                    : otp.length < 4
                      ? button.default
                      : button.primary
              },
            ]}
            onPress={ended ? onResend : onSubmit}
          >
            {
              _loading
                ? <Ellipsis color='#fff' size={10} />
                : <Text
                    color={ended
                      ? '#fff'
                      : _loading
                        ? '#fff'
                        : otp.length < 4
                          ? text.disabled
                          : '#fff'
                      }
                    size={14}
                    style={styles?.boldText}
                  >
                    {
                      ended
                        ? _loading
                          ? 'Resending code...'
                          : 'Resend code'
                        : _loading
                          ? 'Confirming...'
                          : 'Sign up'
                    }
                  </Text>
            }
          </Button>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

export default React.memo(OneTimePin);
