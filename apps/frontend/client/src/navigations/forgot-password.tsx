import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ForgotPasswordInitial from '@screens/forgot-password';
import ForgotPasswordOTP from '@screens/forgot-password/otp';
import ForgotPasswordReset from '@screens/forgot-password/reset-password';
import ForgotPasswordSuccess from '@screens/forgot-password/success';

type RootStackParamList = {
  ForgotPasswordInitial: undefined;
  ForgotPasswordOTP: undefined;
  ForgotPasswordReset: undefined;
  ForgotPasswordSuccess: undefined;
};
const Stack = createNativeStackNavigator<RootStackParamList>();

const RegistrationNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        gestureEnabled: false,
        headerShown: false
      }}
      initialRouteName="ForgotPasswordInitial"
    >
      <Stack.Screen name="ForgotPasswordInitial" component={ForgotPasswordInitial} />
      <Stack.Screen name="ForgotPasswordOTP" component={ForgotPasswordOTP} />
      <Stack.Screen name="ForgotPasswordReset" component={ForgotPasswordReset} />
      <Stack.Screen name="ForgotPasswordSuccess" component={ForgotPasswordSuccess} />
    </Stack.Navigator>
  );
};

export default React.memo(RegistrationNavigator);
