import { Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStateOrAny, useSelector } from 'react-redux';
import OneSignal from 'react-native-onesignal'
import Constants from 'expo-constants';

const useOneSignal = () => {
  const navigation = useNavigation();
  const { session = {} } = useSelector((state:RootStateOrAny) => state.user);

  const initialize = () => {
    OneSignal.setAppId(Constants.manifest?.extra?.oneSignalAppId);
    OneSignal.provideUserConsent(true);
    if (Platform.OS !== 'android') OneSignal.promptForPushNotificationsWithUserResponse(() => {});
    OneSignal.setExternalUserId(session._id);
    // OneSignal.setNotificationWillShowInForegroundHandler(e => e.complete());
    if (session.email) OneSignal.setEmail(session.email);
    if (session.contactNumber) OneSignal.setSMSNumber(session.contactNumber);
    if (session.role?.key) OneSignal.sendTag('role', session.role.key);

    //Method for handling notifications opened
    OneSignal.setNotificationOpenedHandler(notification => {
      const id = notification?.notification?.additionalData?.id;
      if (id) navigation.navigate('Preview', {id});
    });
  }

  const destroy = () => {
    OneSignal.removeExternalUserId();
  }

  return {
    initialize,
    destroy,
  }
}

export default useOneSignal