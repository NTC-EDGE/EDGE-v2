import React, { FC, useEffect, useState } from 'react';
import {RootStateOrAny, useDispatch, useSelector} from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { Platform, TouchableOpacity, View, BackHandler, Alert, Linking, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TabNavigation from './tab-navigation';
import { Menu, Bell, Dot } from '@atoms/icon';
import Statusbar from '@atoms/status-bar';
import NTCAlert from '@atoms/alert';
import Text from '@atoms/text';
import { primaryColor } from '@styles/color';
import styles from './styles';

import { isMobile } from '@utils/formatting';
import useOneSignal from '@hooks/useOneSignal';
import api from '@config/api';
import config from '@config/app';
import { logoutUser } from '@reducers/user/actions';
import { resetCredentials } from '@hooks/useBiometrics';
import AppInactivity from '@hooks/useAppInactivity';
import useGuest from '@hooks/useGuest';
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Props {
  navigation: any;
}

const HomeScreen: FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
    const user = useSelector((state: RootStateOrAny) => state?.user?.session);
  const isGuest = useGuest();
  const [showAlert, setShowAlert] = useState(false);
  const [alertData, setAlertData] = useState<any>({});
  const [versionChecked, setVersionChecked] = useState(false);
  const { initialize, destroy } = useOneSignal();

  const checkVersion = (callback = (err: any, res: any) => {}) => {
    const version = config.API_VERSION;
    const os = Platform.OS;

    api(user?.sessionToken, '').post('/check-version', { os, version })
        .then(res => callback(null, res.data))
        .catch(err => {
          if(err?.request?.status == "401"){
                onLogout()
          }
          callback(err)
        });
  };

  const onPressAlert = () => {
    if (alertData.link) {
      Linking.openURL(alertData.link);
    } else {
      if (Platform.OS === 'web') {
        window.alert( 'Something went wrong');
      }else{
        Alert.alert('Exit App', 'No exit method available.');
      }
      // No direct exit method available, handle as needed

    }
  };

  const biometricsLogin = useSelector(state => state?.user?.biometrics);
  const [enableBiometrics, setEnableBiometrics] = useState(false);

  useEffect(() => {
    setEnableBiometrics(!!biometricsLogin);
  }, [biometricsLogin]);

  const onLogout = async () => {
    if (!enableBiometrics) resetCredentials();
    try {
        if(Platform.OS == "web") {
            try {
                const keys = await AsyncStorage.getAllKeys();
                const keysToDelete = keys.filter(key => key !== 'region:v2');
                await AsyncStorage.multiRemove(keysToDelete);

            } catch (e) {
                console.error('Error clearing AsyncStorage:', e);
            }
        }
    }catch (e) {

    }
    setTimeout(() => {
      navigation.dispatch((state: any) => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login', params: { loggedOut: true } }],
        });
      });
    }, 500);
    setTimeout(() => {
      dispatch(logoutUser());
      destroy();
    }, 1000);
  };

  useEffect(() => {
    initialize();
    return () => destroy();
  }, [initialize, destroy]);

  useEffect(() => {
    let unmount = false;
    if (!versionChecked) {
      checkVersion((err: any, res: any) => {
        if (!unmount) {
          setVersionChecked(true);
          if (res) {
            setAlertData(res);
            setShowAlert(true);
          }
        }
      });
    }
    return () => { unmount = true; };
  }, [versionChecked]);

  useFocusEffect(
      React.useCallback(() => {
        const onBackPress = () => {
          Platform.OS == "web" ? window.alert('Are you sure you want to quit the application?') : Alert.alert(
              'Quit Application',
              'Are you sure you want to quit the application?',
              [
                {
                  text: 'Cancel',
                },
                {
                  text: 'OK',
                  onPress: () => BackHandler.exitApp(),
                },
              ]
          );
          return true;
        };

        BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      }, [])
  );

  const renderComponent = () => (
      <>
        <StatusBar barStyle='light-content' />
        {isGuest && (Platform.OS == "ios" || Platform.OS == "android" )
            ? <SafeAreaView style={styles?.safearea}>{renderContent()}</SafeAreaView>
            : renderContent()
        }
        <TabNavigation />
        {isGuest && (
            <TouchableOpacity  onPress={onLogout}>
              <Text style={styles?.exitGuestText}>
                I'm done!
              </Text>
            </TouchableOpacity>
        )}

      </>
  );

  const renderContent = () => (
      <>
        <NTCAlert
            visible={showAlert}
            title={alertData?.title || 'Alert'}
            message={alertData?.message}
            confirmText={alertData.button || 'OK'}
            cancelText='Cancel'
            onConfirm={onPressAlert}
            onCancel={() => setShowAlert(false)}
        />
        {!isGuest && isMobile && !Platform?.isPad && (
            <View style={styles.container}>
              <Statusbar barStyle='light-content' backgroundColor={primaryColor} />
              <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                  <Menu size={17} color='#fff' />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
                  <Bell size={20} color='#fff' />
                  {false && <Dot style={styles.dotIcon} size={5} color='red' />}
                </TouchableOpacity>
              </View>
            </View>
        )}
      </>
  );

  return isGuest ? <AppInactivity>{renderComponent()}</AppInactivity> : renderComponent();
};

export default React.memo(HomeScreen);
