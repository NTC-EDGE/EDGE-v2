import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Settings from '@pages/settings';
import Profile from '@pages/settings/profile';
import ChangePassword from '@pages/settings/change-password';

type RootStackParamList = {
  SettingsPage: undefined;
  ProfilePage: undefined;
  ChangePassword: undefined;
};
const Stack = createNativeStackNavigator<RootStackParamList>();

const SettingsNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName='SettingsPage'
      screenOptions={{
        gestureEnabled: false,
        headerShown: false,
      }}
    >
      <Stack.Screen name='SettingsPage' component={Settings} />
      <Stack.Screen name='ProfilePage' component={Profile} />
      <Stack.Screen name='ChangePassword' component={ChangePassword} />
    </Stack.Navigator>
  );
};

export default React.memo(SettingsNavigator);
