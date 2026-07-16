import React, { useState, useEffect } from 'react';
import {
  ImageBackground,
  ScrollView,
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RFValue } from 'react-native-responsive-fontsize';
import DeviceInfo from 'react-native-device-info';
import Statusbar from '@atoms/status-bar';
import Text from '@atoms/text';
import Button from '@atoms/button';
import Ellipsis from '@atoms/ellipsis';
import { AnimatedModal } from '@atoms/modals';
import Alert from '@atoms/alert';
import { DropdownField, InputField } from '@molecules/form-fields';
import LoginForm from '@organisms/forms/login';
import { text, button, outline } from '@styles/color';
import { Bold } from '@styles/font';

import { setCreatedAt, setLoggingIn } from '@reducers/user/actions';
import {useLogin} from "@hooks/useLogin";
import useBiometrics from '@hooks/useBiometrics';
import useKeyboard from "@hooks/useKeyboard";
import { GUEST_USER, regionList } from '@utils/ntc';
import useApi, { changeCreatedAt } from '@config/api';
import { JSONfn } from '@utils/formatting';

const logo = require('@assets/ntc-edge-horizontal.png');
const background = require('@assets/loginbackground.png');
const formBackground = require('@assets/background.png');
const track = require('@assets/guest_login/track.png');
const apply = require('@assets/guest_login/apply.png');

const { width, height } = Dimensions.get('screen');
const navigationBarHeight = height - Dimensions.get('window').height;

const styles = StyleSheet.create({
  bgImage: {
    height,
    width,
  },
  formTitleText: {
    color: text.primary,
    fontSize: RFValue(20),
    textAlign: 'center',
    fontFamily: Bold,
    marginBottom: 30,
  },
  image: {
    height: width * .15,
    width: width * .60,
    marginTop: height * .10,
    marginVertical: height * .08,
    alignSelf: 'center',
  },
  formContainer: {
    flex: 1,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderWidth: 0.5,
    borderBottomWidth: 0,
    borderColor: outline.disabled,
    backgroundColor: '#fff',
    padding: 30,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignSelf: 'center',
  },
  loginButton: {
    borderRadius: 10,
    height: width * .15,
    justifyContent: 'center',
  },
  boldText: {
    fontFamily: Bold,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  guestView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  guestText: {
    color: '#fff',
    fontFamily: Bold,
    fontSize: RFValue(14),
    marginTop: 15
  },
  bottomView: {
    height: width / 1.5,
  },
  modalView: {
    paddingHorizontal: 20,
  },
  modalLabelText: {
    fontFamily: Bold,
    fontSize: RFValue(16),
    color: text?.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  touchableView: {
    backgroundColor: button?.primary,
    height: width / 3,
    width: width / 3,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  img: {
    height: width * .17,
    width: width * .17
  },
});

const Login = ({ navigation, route }:any) => {
  const api = useApi(null);
  const isKeyboardVisible = useKeyboard();
  const dispatch = useDispatch();
  const {
    loggingIn,
    formValue,
    isValid,
    loginUserError,
    onChangeValue,
    onCheckValidation,
  } = useLogin(navigation, route);
  const biometricsLogin = useSelector(state => state?.user?.biometrics);
      const {
        isBiometricSupported,
        credentials,
        handleBiometricAuth,
      } = useBiometrics();
  const [region, setRegion] = useState({
    label: "Region X - Northern Mindanao",value: "ntc-region10"
  });
  const [visibleM, setVisibleM] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [tracking, setTracking] = useState(false);
  const [visibleA, setVisibleA] = useState(false);
  const [alert, setAlert] = useState({title: '', message: ''});
  const onApply = () => onChangeValue('login', {
    ...GUEST_USER,
    createdAt: formValue?.CreatedAt?.value?.value
  });
  const onTrack = () => setVisibleM(true);
  const onFind = () => {
    setTracking(true);
    let reset = () => {
      setTracking(false);
      setReferenceNumber('');
      setVisibleM(false);
    };
    let notFound = (_a: any = null) => {
      _a = {
        title: _a?.status === 404 || _a?.title ? 'Application Not Found' : _a.title,
        message: _a?.status === 404 || _a?.title ? 'It seems like the application you are trying to track is non-existent.\n\nPlease double check your reference no.' : _a?.message,
      };
      reset();
      setAlert(_a);
      setTimeout(() => setVisibleA(true), 500);
    };
    api.get(`/applications-v2/${referenceNumber}?region=${formValue.CreatedAt?.value?.label}`)
      .then((res) => {
        reset();
        if (res?.data?._id) navigation.navigate('Preview', {application: res?.data});
        else notFound();
      })
      .catch(e => {
        e = JSONfn.parse(JSONfn.stringify(e));
        notFound({
          status: e?.status,
          title: e?.name,
          message: e?.message,
        });
      });
  };

  useEffect(() => {
    if (credentials) {
      onChangeValue('login', {
        email: credentials.username,
        password: credentials.password,
      });
    }
  }, [credentials]);

  useEffect(() => {
    return () => {
      if (loggingIn) dispatch(setLoggingIn(false));
    }
  });

  useEffect(() => {
    if (loginUserError) {
      setAlert({
        title: 'Authentication Failed',
        message: 'Credentials provided do not match our record.'
      });
      setTimeout(() => setVisibleA(true), 500);
    }
  }, [loginUserError]);

  const renderModal = () => (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <AnimatedModal visible={visibleM} onDismiss={() => setVisibleM(false)}>

            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                bounces={false}
            >
            <Text style={styles?.modalLabelText}>
              Track Application
            </Text>

            <InputField
                label='Reference No.'
                placeholder='Enter your reference no.'
                value={referenceNumber}
                onChangeText={(value: string) => setReferenceNumber(value)}
            />

            <DropdownField
                items={regionList}
                required={true}
                hasValidation={true}
                placeholder='Region'
                value={region?.label}
                onChangeValue={(value: object) => {
                  if (value?.value) {
                    dispatch(setCreatedAt(changeCreatedAt(value?.value)));
                  }
                  setRegion(value);
                }}
            />

            <Button style={[
              styles.loginButton,
              {
                backgroundColor: tracking
                    ? button.info
                    : !!referenceNumber
                        ? button.primary
                        : button.default,
              }
            ]}
                    disabled={!referenceNumber || tracking}
                    onPress={onFind}
            >
              {tracking ? (
                  <Ellipsis color='#fff' size={10} />
              ) : (
                  <Text style={styles.boldText} color={!!referenceNumber ? '#fff' : text.disabled} size={18}>
                    Find
                  </Text>
              )}
            </Button>

            {/* Spacer when keyboard is open */}
            {isKeyboardVisible && <View style={styles?.bottomView} />}
          </ScrollView>
      </AnimatedModal>
      </KeyboardAvoidingView>
  );
  const renderAlert = () => (
    <Alert
      visible={visibleA}
      title={alert?.title}
      message={alert?.message}
      confirmText='OK'
      onConfirm={() => setVisibleA(false)}
    />
  );

  const renderForm = () => {
    return DeviceInfo?.isTablet()
      ?
        <>
          <LoginForm
              isBiometricSupported={isBiometricSupported && !!biometricsLogin}
              onBiometrics={handleBiometricAuth}
              onChangeValue={onChangeValue}
              form={formValue}
          />
          <View style={styles?.guestView}>
          <TouchableOpacity style={styles?.touchableView} onPress={onApply}>
            {
              loggingIn
                  ? <Ellipsis color='#fff' size={10} />
                  : <>
                    <Image
                        resizeMode='contain'
                        style={styles?.img}
                        source={apply}
                    />
                    <Text style={styles?.guestText}>Apply</Text>
                  </>
            }
          </TouchableOpacity>
          <TouchableOpacity style={styles?.touchableView} onPress={onTrack}>
            <Image
                resizeMode='contain'
                style={styles?.img}
                source={track}
            />
            <Text style={styles?.guestText}>
              Track
            </Text>
          </TouchableOpacity>
        </View>
        </>

      : <>
          <Text style={styles.formTitleText}>Login</Text>
          <LoginForm
            isBiometricSupported={isBiometricSupported && !!biometricsLogin}
            onBiometrics={handleBiometricAuth}
            onChangeValue={onChangeValue}
            form={formValue}
          />
          <View style={styles.bottomContainer}>
            <Button style={[
                styles.loginButton,
                {
                  backgroundColor: loggingIn
                    ? button.info
                    : isValid
                      ? button.primary
                      : button.default
                }
              ]}
              disabled={loggingIn}
              onPress={onCheckValidation}
            >
              {
                loggingIn ? (
                  <Ellipsis color='#fff' size={10} />
                ) : (
                  <Text style={styles.boldText} color={isValid ? '#fff' : text.disabled} size={18}>Login</Text>
                )
              }
            </Button>
            <View style={styles.row}>
              <Text color={text.default} size={14}>
                {`Don't have an account? `}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Registration')}>
                <Text style={styles.boldText} color={text.info} size={14}>
                  Sign up
                </Text>
              </TouchableOpacity>
            </View>
            {
              Platform.OS === 'android' && <View style={{height: navigationBarHeight * .60}} />
            }
          </View>
        </>
  };

  return (
    <ImageBackground
      resizeMode='stretch'
      source={background}
      style={styles.bgImage}
      imageStyle={{flex: 1}}
    >
      <Statusbar barStyle='light-content' />

      <ScrollView
        contentContainerStyle={{flexGrow: 1}}
        showsVerticalScrollIndicator={true}
      >
        <Image
          resizeMode='contain'
          source={logo}
          style={styles.image}
        />

        <ImageBackground
          source={formBackground}
          style={styles.formContainer}
          imageStyle={styles.formContainer}
        >
          {renderForm()}
        </ImageBackground>

      </ScrollView>

      {renderModal()}
      {renderAlert()}

    </ImageBackground>
  );
};

export default React.memo(Login);
