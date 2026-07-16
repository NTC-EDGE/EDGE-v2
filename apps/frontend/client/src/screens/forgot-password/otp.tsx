import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Text from '@atoms/text';
import * as Progress from 'react-native-progress';
import { OTPField } from '@molecules/form-fields';
import Button from '@atoms/button';
import { Left } from '@atoms/icon';
import NavBar from '@organisms/navbar';
import { text, button } from 'src/styles/color';
import useKeyboard from 'src/hooks/useKeyboard';
import Ellipsis from '@atoms/ellipsis';
import styles from './styles';
import api from '@config/api';
import {isMobile} from "@utils/formatting";

const timerLimit = 90;
const errorResponse = 'Invalid verification code. Please try again';
const code = '1234';

const OneTimePin = ({ navigation, route }:any) => {
  const {
    account,
    accountType,
    otpId,
  } = route.params;
  const isKeyboardVisible = useKeyboard();
  const [newOTPID, setNewOTPID] = useState(otpId);
  const [timer, setTimer] = useState(timerLimit);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const onSubmit = () => {
    setLoading(true);
    api(null, '')
      .post(`${newOTPID}/otp-validate?code=${otp}`)
      .then((res: any) => {
        setLoading(false);
        if (res?.data?.success) {
          setEnded(true);
          navigation.navigate('ForgotPasswordReset', {otpId: newOTPID});
        }
        else {
          setError(res?.message || errorResponse);
        }
      })
      .catch((err: any) => {
        setLoading(false);
        setError(errorResponse);
      });
  };

  const onResend = useCallback(() => {
    setLoading(true);
    api(null, '')
      .post('/resend-reset-password-otp', {otpId: newOTPID, email: account})
      .then((res: any) => {
        setLoading(false);
        if (res?.data?.success) {
          setNewOTPID(res?.data?.otpId);
          resetTimer();
        }
      })
      .catch((err: any) => {
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
  }

  const format = (time:number) => {   
    var mins = ~~((time % 3600) / 60);
    var secs = ~~time % 60;
    var format = "";
    format += (mins < 10 ? "0" : "") + mins + ":" + (secs < 10 ? "0" : "");
    format += "" + secs;
    return format;
  }

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

  const renderDetail = () => {
    if (accountType === 'phone') {
      const lastFour = account.substr(account.length - 4);
      return `**** ${lastFour}`;
    }
    const email = account.split('@');
    return `****@${email[1]}`;
  }

  const onChangeText = (value:string) => {
    if (!!error) {
      setError('');
    }
    setOtp(value);
  }

  return (
    <View style={styles.container}>
      {isMobile && <NavBar
        title={'Forgot Password'}
        rightIcon={<Text color='#fff'>Close</Text>}
        onRight={() => navigation.navigate('Login')}
        leftIcon={<Left color='#fff' size={17}/>}
        onLeft={() => navigation.pop()}
      />}

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
              {accountType === 'phone' ?
                `Enter the OTP code sent via SMS to your registered phone number ${renderDetail()}.` :
                `Enter the OTP code sent via EMAIL to your registered email address ${renderDetail()}.`
              }
            </Text>
          </View>
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
          >
            {
              !ended && (
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
                    size={16}
                  />
                  <Text
                    style={{ marginLeft: 5 }}
                    size={16}
                    color={text.default}
                  >
                    {format(timer)}
                  </Text>
                </View>
              )
            }
          </OTPField>
        </ScrollView>
      </KeyboardAvoidingView>

      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'position', android: undefined })}
        style={styles.keyboardAvoiding}
      >
        <View style={isKeyboardVisible && styles.shadow}>
          <Button
            disabled={loading}
            style={[
              styles.button,
              {
                backgroundColor: (ended)
                  ? loading
                    ? '#3BC759'
                    : button.success
                  : loading
                    ? '#60A5FA'
                    : otp.length < 4
                      ? button.default
                      : button.primary
              },
            ]}
            onPress={(ended) ? onResend : onSubmit}
          >
            {
              loading
                ? <Ellipsis color='#fff' size={10} />
                : <Text
                    color={(ended)
                      ? '#fff'
                      : loading
                        ? '#fff'
                        : otp.length < 4
                          ? text.disabled
                          : '#fff'
                      }
                    size={16}
                    style={styles.boldText}
                  >
                    {
                      (ended)
                        ? loading
                          ? 'Resending code...'
                          : 'Resend code'
                        : loading
                          ? 'Confirming...'
                          : 'Confirm'
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
