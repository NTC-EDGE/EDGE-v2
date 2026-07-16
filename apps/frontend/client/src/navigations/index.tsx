import * as React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import App from '@screens/app';
import AppIntro from '@screens/intro';
import Login from '@screens/login';
import Registration from './registration';
import ForgotPassword from './forgot-password';
import Settings from './settings';
import Notifications from '@pages/notifications';
import DrawerNavigation from '@pages/homepage/drawer-navigation';
import Services from '@pages/services';
import ApplicationSteps from '@pages/application-steps';
import AdmissionSlip from '@pages/homepage/tab-navigation/applications/outputs/admission-slip';
import PaymentSOA from '@pages/payment/soa';
import PaymentMethods from '@pages/payment/methods';
import PaymentMethodInstructions from '@pages/payment/methods/instructions';
import PaymentForVerification from '@pages/payment/for-verification';
import Preview from '@templates/application-steps/preview';
import EdgeLogo from '@assets/svg/edge';
import { isMobile, RNValue as RFValue } from '@utils/formatting';
import useGuest from '@hooks/useGuest';
import {useNavigation} from "@react-navigation/core";
import {StyleSheet,Platform,SafeAreaView,TouchableOpacity,View} from "react-native";
import {infoColor, primaryColor, secondaryColor} from "@styles/color";
import Payment from "./payment";
import ChooseNewPassword from "@screens/chooseNewPassword";
import Text from '@atoms/text';
import PrivacyPolicy from "@screens/privacy-policy";
import AccountDeletion from "@screens/account-deletion";
import CommunityGuidelines from "@screens/CommunityGuideline/CommunityGuidelines";
import CookiePolicy from "@screens/CookiePolicy/CookiePolicy";
import SensFeedback from "@screens/SeedFeedback/SensFeedback";
import HelpCenter from "@screens/HelpCenter/HelpCenter";
import UserAgreementScreen from "@screens/UserAgreementScreen/UserAgreementScreen";
import ProfileImage from "@atoms/image/profile";
import {getDisplayName} from "@utils/fileHelper";
import {LinearGradient} from "expo-linear-gradient";
import EdgePortalScreen from "@screens/landing";
type RootStackParamList = {
  App: undefined;
  AppIntro: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  Registration: undefined;
  Settings: undefined;
  Notifications: undefined;
  Profile: undefined;
  HomeScreen: undefined;
  ServicesScreen: undefined;
  ApplicationSteps: undefined;
  Preview: undefined;
  AdmissionSlip: undefined;
  PaymentSOA: undefined;
  PaymentMethods: undefined;
  PaymentMethodInstructions: undefined;
  PaymentForVerification: undefined;
  Payment: undefined;
  PrivacyPolicy: undefined;
  AccountDeletion: undefined;
};
const Stack = createNativeStackNavigator<RootStackParamList>();
const linking = {
  prefix: '/',
  config: {
    screens: {
      App: 'App',
      EdgePortal: '',
      AppIntro: 'Intro',
      Login: 'Login/:region?',
      ForgotPassword: 'Forgot-Password',
      Registration: 'Registration',
      Settings: 'Settings',
      Notifications: 'Notifications',
      Profile: 'Profile',
      HomeScreen: 'Home-Screen',
      ServicesScreen: 'Services-Screen',
      ApplicationSteps: 'Application-Steps',
      Preview: 'Preview',
      PrivacyPolicy: 'privacy-policy',
      AdmissionSlip: 'Admission-Slip',
      PaymentSOA: 'Payment-SOA',
      ChooseNewPassword: 'Choose-New-Password/:token?',
      AccountDeletion: 'account-deletion',
    }
  },
};
const headerGradientColors = [primaryColor, infoColor];
const CustomHeader = ({ user, isGuest }) => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={{ backgroundColor: 'transparent' }}>
            <LinearGradient
                colors={headerGradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                    paddingTop: Platform.OS === 'ios' ? 6 : 10,
                    paddingBottom: Platform.OS === 'web' ? 18 : 14,
                }}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginHorizontal: 30,
                    }}
                >
                    <EdgeLogo width={RFValue(180)} height={RFValue(40)} />

                    {!isGuest && (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Settings')}
                            activeOpacity={0.8}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text
                                    style={{
                                        color: '#fff',
                                        fontSize: RFValue(16),
                                        marginRight: 8,
                                        fontWeight: '500',
                                    }}
                                    numberOfLines={1}
                                >
                                    {getDisplayName(user)}
                                </Text>

                                <ProfileImage
                                    style={{ borderRadius: 999 }}
                                    size={32}
                                    isOnline={true}
                                    image={user?.profilePicture?.small}
                                    name={getDisplayName(user)}
                                />
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
};
const RootNavigator = () => {
  const user = useSelector(state => state?.user?.session);
  const isGuest = useGuest();
  const profilePicture = user?.profilePicture?.small;

  return (
      <NavigationContainer linking={linking}>
        <Stack.Navigator
            screenOptions={{
              gestureEnabled: false,
              headerShown: false
            }}
            initialRouteName={'App'}
        >
          <Stack.Screen name='App' component={App} />
            <Stack.Screen name='EdgePortal' component={EdgePortalScreen} />

            <Stack.Screen name='AppIntro' component={AppIntro} />
          <Stack.Screen name='Login' component={Login} />
          <Stack.Screen name='Registration' component={Registration} />
          <Stack.Screen name="UserAgreement" component={ UserAgreementScreen }/>
          <Stack.Screen name="PrivacyPolicy" component={ PrivacyPolicy }/>
          <Stack.Screen name="CommunityGuidelines" component={ CommunityGuidelines }/>
          <Stack.Screen name="CookiePolicy" component={ CookiePolicy }/>
          <Stack.Screen name="SendFeedback" component={ SensFeedback }/>
          <Stack.Screen name="HelpCenter" component={ HelpCenter }/>
          <Stack.Screen name='ChooseNewPassword' component={ ChooseNewPassword }/>
          <Stack.Screen name="AccountDeletion" component={AccountDeletion} />
          <Stack.Screen name='ForgotPassword' component={ForgotPassword} />
          <Stack.Screen name='Settings' component={Settings} />
          <Stack.Screen name='Notifications' component={Notifications} />
          <Stack.Screen
              name="HomeScreen"
              component={DrawerNavigation}
              options={{
                title: null,
                header: () => {
                  const navigation = useNavigation();

                  return (
                      <SafeAreaView style={{ backgroundColor: 'transparent' }}>
                        <LinearGradient
                            colors={headerGradientColors} // ['#000A33', primaryColor, infoColor]
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                              paddingTop: Platform.OS === 'ios' ? 6 : 10,
                              paddingBottom: Platform.OS === 'web' ? 18 : 14,
                            }}
                        >
                          <View
                              style={[
                                {
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  marginHorizontal: 30,
                                },
                                Platform?.OS === 'web' && { marginTop: 8 },
                              ]}
                          >
                            {/* 🔹 Bigger logo */}
                            <EdgeLogo
                                width={RFValue(180)}   // was 127
                                height={RFValue(40)}   // was 29
                            />

                            {!isGuest && (
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Settings')}
                                    activeOpacity={0.8}
                                >
                                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text
                                        style={{
                                          color: '#fff',
                                          fontSize: RFValue(16),
                                          marginRight: 8,
                                          fontWeight: '500',
                                        }}
                                        numberOfLines={1}
                                    >
                                      {getDisplayName(user)}
                                    </Text>

                                    <ProfileImage
                                        style={{ borderRadius: 999 }}
                                        size={32}
                                        isOnline={true}
                                        image={user?.profilePicture?.small}
                                        name={getDisplayName(user)}
                                    />
                                  </View>
                                </TouchableOpacity>
                            )}
                          </View>
                        </LinearGradient>
                      </SafeAreaView>
                  );
                },
                headerShown: !(isMobile && !Platform?.isPad),

                // These are mostly fallback; header itself draws gradient
                headerStyle: {
                  backgroundColor: 'transparent',
                  elevation: 0,
                  shadowOpacity: 0,
                },
                headerTintColor: secondaryColor,
                headerTitleStyle: {
                  color: secondaryColor,
                },
              }}
          />
          <Stack.Screen name='ServicesScreen' component={Services} />
          <Stack.Screen name='ApplicationSteps' component={ApplicationSteps} />
          <Stack.Screen name='Preview' component={Preview} />
          <Stack.Screen name='AdmissionSlip' component={AdmissionSlip} />
          <Stack.Screen name='Payment' component={Payment} />
          {/* find time to separate this */}
          <Stack.Screen name='PaymentSOA' component={PaymentSOA} />
          <Stack.Screen name='PaymentMethods' component={PaymentMethods} />
          <Stack.Screen name='PaymentMethodInstructions' component={PaymentMethodInstructions} />
          <Stack.Screen name='PaymentForVerification' component={PaymentForVerification} />

        </Stack.Navigator>
      </NavigationContainer>
  );
};

export default React.memo(RootNavigator);
