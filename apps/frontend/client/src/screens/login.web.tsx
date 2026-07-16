import React,{useEffect, useState} from 'react';
import {
  Dimensions,Image,
  ImageBackground,
  Modal,
  Platform,ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,useWindowDimensions,
  View,
} from 'react-native';
import { useDispatch } from 'react-redux';
import Text from '@atoms/text';
import Button from '@atoms/button';
import Ellipsis from '@atoms/ellipsis';
import Alert from '@atoms/alert';
import LoginForm from '@organisms/forms/login';
import {button, infoColor, outline, text} from '@styles/color';
import {Bold,Regular} from '@styles/font';
import {isMobile, JSONfn, RNValue as RFValue} from "@utils/formatting";
import EdgeBlue from "@assets/svg/edgeBlue";
import Registration from "./../navigations/registration";
import {Close} from "@atoms/icon";
import {useLogin} from "@hooks/useLogin";
import ForgotPassword from "../navigations/forgot-password";
import Statusbar from "@atoms/status-bar";
import {setCreatedAt, setLoggingIn, setLoginUserError} from '@reducers/user/actions';
import { GUEST_USER, regionList } from '@utils/ntc';
import {AnimatedModal} from "@atoms/modals";
import { DropdownField, InputField } from '@molecules/form-fields';
import useApi, { changeCreatedAt } from '@config/api';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming
} from "react-native-reanimated";
import Footer from "@atoms/footer";
import styles from "@styles/login/styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SEO from "@atoms/seo";
const logo = require('@assets/ntc-edge-horizontal.png');
const background = require('@assets/background-web.png');
const fade = require('@assets/fade.png');
const track = require('@assets/guest_login/track.png');
const apply = require('@assets/guest_login/apply.png');






const Login = ({ navigation, route }:any) => {
  const dispatch = useDispatch();

  const {width, height} = useWindowDimensions();
  const {
    loggingIn,
    formValue,
    isValid,
    loginUserError,
    onChangeValue,
    onCheckValidation,
  } = useLogin(navigation, route);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withSpring(1, { damping: 2 });
    scale.value = withSpring(1, { damping: 2 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: 1,
      transform: [{ scale: scale.value }],
    };
  });


  const positionX = useSharedValue(-width * 0.22);
  useEffect(() => {
    positionX.value = withSpring(0, { damping: 12, stiffness: 100 });
  }, []);

  const animatedTranslateXStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: positionX.value }],
    };
  });

  const opacity1 = useSharedValue(0);
  const opacity2 = useSharedValue(0);
  const scale1 = useSharedValue(0.8);
  const scale2 = useSharedValue(0.8);

  useEffect(() => {
    opacity1.value = withTiming(1, { duration: 1000 });
    scale1.value = withSpring(1, { damping: 8 });

    opacity2.value = withDelay(500, withTiming(1, { duration: 1000 }));
    scale2.value = withDelay(500, withSpring(1, { damping: 8 }));
  }, []);

  const animatedStyle1 = useAnimatedStyle(() => {
    return {
      opacity: opacity1.value,
      transform: [{ scale: scale1.value }],
    };
  });

  const animatedStyle2 = useAnimatedStyle(() => {
    return {
      opacity: opacity2.value,
      transform: [{ scale: scale2.value }],
    };
  });


  const [paramRegion, setParamRegion] = useState(route?.params?.region)
  const api = useApi(null);
  const [tracking, setTracking] = useState(false);
  const [alert, setAlert] = useState({title: '', message: ''});
  const [visibleA, setVisibleA] = useState(false);
  const [registrationModal, setRegistrationModal]= useState(false);
  const [forgotPasswordModal, setForgotPasswordModal]= useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [region, setRegion] = useState({
    label: "Region X - Northern Mindanao",value: "ntc-region10"
  });

  useEffect(() => {
    var _region = route?.params?.region
    var changeRegion ={
      label: "Region X - Northern Mindanao",value: "ntc-region10"
    }
    if(_region) {
      if(_region == "13"){
        changeRegion ={
          label: "Region XIII - Caraga",value: "ntc-region13"
        }
      }if(_region == "3"){
        changeRegion ={
          label: "Region III - Central Luzon",value: "ntc-region3"
        }
      }else if(_region == "11"){
        changeRegion ={
          label: "Region XI - Davao Region",value: "ntc-region11"
        }
      }else if(_region == "10"){
        changeRegion ={
          label: "Region X - Northern Mindanao",value: "ntc-region10"
        }
      }
      else if(_region == "12"){
        changeRegion ={
          label: "Region XII - SOCCSKSARGEN",value: "ntc-region12"
        }
      }
      else if(_region == "9"){
        changeRegion ={
          label: "Region IX - Zamboanga Peninsula",value: "ntc-region9"
        }
      }
      else if(_region == "7"){
        changeRegion ={
          label: "Region VII - Central Visayas",value: "ntc-region7"
        }
      }
      dispatch(setCreatedAt(changeCreatedAt(changeRegion.value)))
      onChangeValue('CreatedAt', changeRegion)
      setRegion( changeRegion)
    }
  }, [route?.params?.region]);


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
  const showAlert = () => {
    setShowRegistrationModal(true);
  };
  const hideAlert = () => {
    setShowRegistrationModal(false);
  };
  const renderAlert = () => (
    <Alert
      visible={visibleA}
      title={alert?.title}
      message={alert?.message}
      confirmText='OK'
      onConfirm={() => {
        setVisibleA(false);
        dispatch(setLoginUserError(false));
      }}
    />
  );
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

    dispatch(setCreatedAt(formValue?.CreatedAt?.value?.value ?? "ntc-region10"));
   api.get(`/applications-v2/${referenceNumber}?region=${formValue.CreatedAt?.value?.label}`, {
      headers: {
        'Content-type': ('application/json'),
        ...(true ? {CreatedAt: formValue?.CreatedAt?.value?.value ?? "ntc-region10" } : {})
      }
    })
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
        }).finally(()=> {
      setTracking(false)

    });
  };
  const [visibleM, setVisibleM] = useState(false);
  const onApply = () => {

    onChangeValue('login', {
      ...GUEST_USER,
      createdAt: formValue?.CreatedAt?.value?.value
    })
  };
  const onTrack = () => setVisibleM(true);
  const renderModal = () => (

        <AnimatedModal
            containerStyle={{width: "80%",
              alignSelf: "center" }}
            visible={visibleM}
            onDismiss={() => setVisibleM(false)}
        >

          <View style={styles?.modalView}>
            <Text style={styles?.modalLabelText}>
              Track Application
            </Text>
            <InputField

                label='Reference No.'
                placeholder='Enter you reference no.'
                value={referenceNumber}
                error={!referenceNumber}
                onChangeText={(value: string) => setReferenceNumber(value)}
            />
            <DropdownField
              items={regionList}
              required={true}
              hasValidation={true}
              placeholder='Region'

              value={region?.label}
              onChangeValue={(value: object) => {
                if(value?.value) {
                  dispatch(setCreatedAt(changeCreatedAt(value?.value)))
                  onChangeValue('CreatedAt', { ...value, value: changeCreatedAt(value?.value) })
                  AsyncStorage.setItem('selectedRegion', JSON.stringify({ ...value, value: changeCreatedAt(value?.value) }));
                }
                setRegion( value)
              }}
            />
            <Button style={[
              styles.loginButton,
              {
                backgroundColor: tracking
                    ? button.info
                    : !!referenceNumber
                        ? button.primary
                        : button.default
              }
            ]}
                    disabled={!referenceNumber || tracking}
                    onPress={onFind}
            >
              {
                tracking ? (
                    <Ellipsis color='#fff' size={10} />
                ) : (
                    <Text style={styles.boldText} color={!!referenceNumber ? '#fff' : text.disabled} size={18}>Find</Text>
                )
              }
            </Button>
          </View>
        </AnimatedModal>

  );
  const [windowDimensions, setWindowDimensions] = useState(Dimensions.get('window'));
  useEffect(() => {
    const handleResize = ({ window }: any) => {
      setWindowDimensions(window);
    };

    const subscription = Dimensions.addEventListener('change', handleResize);

    return () => {
      subscription?.remove();
    };
  }, []);
  useEffect(() => {
    const loadSavedRegion = async () => {
      try {
        const storedRegion = await AsyncStorage.getItem('selectedRegion');
        if (storedRegion) {
          const parsedRegion = JSON.parse(storedRegion);
          dispatch(setCreatedAt(parsedRegion.value));
          onChangeValue('CreatedAt', parsedRegion);
          setRegion(parsedRegion);
        }
      } catch (e) {
        console.warn('Failed to load saved region', e);
      }
    };

    loadSavedRegion();
  }, []);
  return (
    <>
      <SEO
        title="Login - NTC EDGE Portal"
        description="Securely log in to the NTC EDGE Portal to manage your telecom applications and services."
        canonical="https://www.ntcedge.com/Login"
      />
      {width > 800 ? <ImageBackground
        resizeMode="cover"
        source={ background }
        style={ {
          ...{ width: windowDimensions.width, height: windowDimensions.height },
          flex : 1 ,
          justifyContent : "center",
        } }
        imageStyle={ { flex : 1,  } }
    >
      <ImageBackground
          resizeMode="cover"
          source={ fade }
          style={ {
            ...{ width: windowDimensions.width, height: windowDimensions.height },
            flex : 1 ,

            justifyContent : "center"
          } }
          imageStyle={ { flex : 1,  } }
      >
        <View style={{transform: [{ scale: 0.95 }], flex: 1, justifyContent: "center", alignItems: "center"}}>
          <View style={ { flexDirection: "row",  width: width * 0.68,  justifyContent : "space-between" , alignItems : "flex-start" } }>
            <View style={ { width: (width * 0.68) *  0.5,   height: height * 0.1, paddingBottom : height * 0.07 } }>
              <Animated.View style={[animatedTranslateXStyle, {paddingBottom: 40 }]}>
                <EdgeBlue width={width*0.22} height={78} ></EdgeBlue>
              </Animated.View>
              <Animated.Text style={[{color: "#606A80",  fontSize: 24, fontFamily: Regular}, animatedStyle1]}>
                Introducing Electronic Data Governance and Evaluation (EDGE) application. An online information system designed by National Telecommunications Commission (NTC).
              </Animated.Text>

              {/* Second part of the text */}
              <Animated.Text style={[{color: "#606A80",  fontSize: 24, fontFamily: Regular}, animatedStyle2]}>
                {"\n\n"}- Issues Certificates, Permits, Licenses, and Complaints/Requests
              </Animated.Text>

            </View>
            <View>
              <View>
                <Animated.View style={[styles.formContainer, animatedStyle]}>

                  <Text style={ [styles.formTitleText] }>Login</Text>

                  <LoginForm showForgotPassword={false}   onChangeValue={ onChangeValue } form={ formValue }/>

                  <View style={ styles.bottomContainer }>
                    <View style={{paddingBottom: 6}}>
                    <Button
                        style={ [
                          styles.loginButton ,
                          {

                            backgroundColor : loggingIn
                                              ? button.info
                                              : isValid
                                                ? button.primary
                                                : button.default
                          }
                        ] }
                        disabled={ loggingIn }
                        onPress={ onCheckValidation }
                    >
                      {
                        loggingIn ? (
                            <View style={ { paddingVertical : 10 } }>
                              <Ellipsis color="#fff" size={ 10 }/>
                            </View>

                        ) : (
                            <View>
                              <Text style={ styles.boldText } color={ isValid ? "#fff" : text.disabled }
                                    size={ 18 }>Login</Text>
                            </View>

                        )
                      }
                    </Button>
                    </View>
                    { !isMobile && <View style={ [{ flex: 1,  paddingBottom : 6, alignItems: "center", justifyContent : 'center' }] }>
                      <TouchableOpacity onPress={ () => {
                        setForgotPasswordModal(true)
                      } }>
                        <Text
                            style={ [{ fontSize : 18 , fontWeight: "500",  fontFamily : Regular , color : text.info }] }

                        >
                          Forgot your password?
                        </Text>
                      </TouchableOpacity>
                    </View> }
                    <View style={{flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
                      <View style={{width: "50%", paddingBottom: 6, paddingRight: 6}}>
                        <TouchableOpacity
                            style={ [
                              styles.guestloginButton ,
                              {
                                backgroundColor : button.primary
                              }
                            ] }
                            onPress={ onApply }
                        >
                          {

                            <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                              <Image
                                  style={styles?.img}
                                  source={apply}
                              />
                              <Text style={ styles.boldText } color={  "#fff" }
                                    size={ 18 }>Apply</Text>
                            </View>

                          }
                        </TouchableOpacity>
                      </View>
                      <View style={{width: "50%", paddingBottom: 6}}>
                        <TouchableOpacity
                            style={ [
                              styles.guestloginButton ,
                              {

                                backgroundColor : button.primary
                              }
                            ] }
                            onPress={ onTrack }
                        >
                          {
                            <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                              <Image
                                  style={styles?.img}
                                  source={track}
                              />
                            <View>
                              <Text style={ styles.boldText } color={  "#fff"  }
                                    size={ 18 }>Track</Text>
                            </View>
                            </View>

                          }
                        </TouchableOpacity>
                      </View>
                    </View>

                  </View>


                </Animated.View>
                <View style={{ paddingTop:  height * 0.04, flexDirection: "row", alignItems: "center", justifyContent: "center"}}>
                  <Text  style={[{fontFamily: Regular, color: "#565961",   fontSize: 18, alignSelf: 'center'} ]}  >Don’t have an account? </Text>
                  <TouchableOpacity onPress={() => {
                    setRegistrationModal(true)
                  }}>
                    <Text style={[styles.boldText, { fontSize: 18, alignSelf: 'center'} ]} color={text.info} size={14}>
                      Sign up
                    </Text>
                  </TouchableOpacity>

                </View>

              </View>

            </View>

          </View>

        </View>
      </ImageBackground>

      <Footer/>



      </ImageBackground> : <ImageBackground
          resizeMode='stretch'
          source={background}
          style={{
            height ,
            width,
          }}
          imageStyle={{flex: 1}}
      >
        <Statusbar barStyle='dark-content' />

        <ScrollView
            contentContainerStyle={{flexGrow: 1}}
            showsVerticalScrollIndicator={true}
        >
          <Image
              resizeMode='contain'
              source={logo}
              style={{
                height: width * .15,
                width: width * .60,
                marginTop: height * .10,
                marginVertical: height * .08,
                alignSelf: 'center',
              }}
          />
          <View style={[width > 767 ? styles.formContainer : {flex: 1,
            borderBottomWidth: 0,
            paddingHorizontal: 30, borderRadius: 15,
            borderWidth: 0.5,

            borderColor: outline.disabled,
            backgroundColor: '#fff',

            paddingTop: 39,
            paddingBottom: 30}]}>
            <Text style={styles.formTitleText}>Login</Text>
            <LoginForm onChangeValue={onChangeValue} form={formValue} />
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
                <TouchableOpacity onPress={() =>  setRegistrationModal(true)}>
                  <Text style={styles.boldText} color={text.info} size={14}>
                    Sign up
                  </Text>
                </TouchableOpacity>
              </View>
              {
                Platform.OS === 'android' && <View style={{height: height - Dimensions.get('window').height * .60}} />
              }
            </View>

          </View>

        </ScrollView>

      </ImageBackground> }
      <Modal transparent={true} visible={registrationModal}>

        <View style={{  flex: 1, justifyContent: "center", alignItems: "center",}}>
          <TouchableWithoutFeedback onPress={ () => {
            setRegistrationModal(false)
          }}>
            <View style={ [{
              width : "100%" ,
              height : "100%" ,
              alignItems : "center" ,
              justifyContent : "flex-end" ,
              position : "absolute" ,
              backgroundColor : "rgba(0,0,0, 0.5)"
            }] }/>
          </TouchableWithoutFeedback>
          <Alert
              overlayStyle={{backgroundColor: "rgba(0,0,0,0)"}}
              alertContainerStyle={{zIndex: 2}}
              visible={showRegistrationModal}
              title="Discard Changes"
              message="You have unsaved changes. Do you want to continue?"
              cancelText="Cancel"
              confirmText="OK"
              contentContainerStyle={{shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 7,
                },
                shadowOpacity: 0.43,
                shadowRadius: 9.51,

                elevation: 15}}
              onCancel={() => {
                hideAlert();
              }}
              onConfirm={() => {
                setRegistrationModal(false)
                hideAlert();
              }}
          />
          <View style={{padding: 20,  backgroundColor: "#fff", borderColor: "#E5E5E5", borderRadius: 10, width:  width > 768 ? width * 0.28 : width * 0.9, flex:  0.77}}>
            <TouchableOpacity onPress={() => {
              setShowRegistrationModal(true)

            }} >
              <View style={{paddingRight: 20,alignItems: "flex-end"}}><Close/></View>
            </TouchableOpacity>

            <View style={{ paddingLeft: 20,  justifyContent: "center"}}>
              <Text style={{fontWeight: "bold", fontSize: 24, color: "#03066E"}}>Sign Up</Text>
            </View>
            <Registration/>
          </View>
        </View>
      </Modal>
      <Modal transparent={true} visible={forgotPasswordModal}>
        <View style={{  flex: 1, justifyContent: "center", alignItems: "center",}}>
          <TouchableWithoutFeedback onPress={ () => {setForgotPasswordModal(false)} }>
            <View style={ [{
              width : "100%" ,
              height : "100%" ,
              alignItems : "center" ,
              justifyContent : "flex-end" ,
              position : "absolute" ,
              backgroundColor : "rgba(0,0,0, 0.5)"
            }] }/>
          </TouchableWithoutFeedback>;
          <View style={{padding: 20,  backgroundColor: "#fff", borderColor: "#E5E5E5", borderRadius: 10, width:  width > 768 ? width * 0.28 : width * 0.9, flex:  0.77}}>
            <TouchableOpacity onPress={() => setForgotPasswordModal(false)} >
              <View style={{paddingRight: 20,alignItems: "flex-end"}}><Close/></View>
            </TouchableOpacity>

            <ForgotPassword/>
          </View>
        </View>
      </Modal>
      {renderModal()}
      {renderAlert()}
    </>
  );
};

export default React.memo(Login);
