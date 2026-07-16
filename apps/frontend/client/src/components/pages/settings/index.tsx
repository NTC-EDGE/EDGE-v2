import React, { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch, RootStateOrAny } from 'react-redux';
import {Image, Platform, View} from 'react-native';
import Text from '@atoms/text';
import { ArrowRight, Bell, Close, Exclamation, Help, Logout, Right, ToggleIcon } from '@atoms/icon';
import Alert from '@atoms/alert';
import Button from '@atoms/button';
import NavBar from '@organisms/navbar';
import { disabledColor, text } from '@styles/color';
import styles from './styles';
import { FlatList, ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { logoutUser, setBiometricsLogin } from '@reducers/user/actions';
import useOneSignal from '@hooks/useOneSignal';
import useBiometrics, { resetCredentials } from '@hooks/useBiometrics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";

const Settings = ({ route, navigation }: any) => {
  const dispatch = useDispatch();
  const { destroy } = useOneSignal();
  const [visible, setVisible] = useState(false);
  const [enableBiometrics, setEnableBiometrics] = useState(false);
  const [settingVisible, setSettingVisible] = useState(false);
  const user = useSelector(state => state?.user.session);
  const userType = useSelector(state => state?.user.session?.userType);
  const email = useSelector(state => state?.user.session?.email);
  const firstName = useSelector(state => state?.user.session?.firstName);
  const lastName = useSelector(state => state?.user.session?.lastName);
  const suffix = useSelector(state => state?.user.session?.suffix);
  const profilePicture = useSelector(state => state?.user.session?.profilePicture);
  const applicant = useSelector(state => state?.user.session?.applicant);
  const biometricsLogin = useSelector(state => state?.user?.biometrics);

  const name =  userType?.toLowerCase() === 'company'  ?  (applicant?.companyName ? applicant?.companyName : "") : `${firstName ? firstName : "" } ${lastName ? lastName : ""} ${suffix ? suffix : ""}`;
  const dp = profilePicture?.small;
  const photo = dp ? {uri: dp} : require('@assets/avatar.png');
  const { isBiometricSupported } = useBiometrics();

  const settings = [
    // {
    //   label: 'Notifications',
    //   value: 'notifications',
    //   icon: <Bell size={21} />,
    //   onPress: () => setSettingVisible(true),
    // },
    {
      label: 'Help Center',
      value: 'help-center',
      icon: <Help size={21} />,
      onPress: () => setSettingVisible(true),
    },
    {
      label: 'About',
      value: 'about',
      icon: <Exclamation size={21} type='circle' />,
      onPress: () => setSettingVisible(true),
    },
  ];
  const biometrics = useMemo(() => ({
    label: 'Login with biometrics',
    value: 'biometrics',
    disabled: !isBiometricSupported,
    icon: <MaterialCommunityIcons
      name='fingerprint'
      size={22}
      color={!isBiometricSupported ? disabledColor : 'black'}
    />,
    rightIcon: <ToggleIcon
      style={[
        enableBiometrics ? styles.toggleActive : styles.toggleDefault,
        !isBiometricSupported && { color: disabledColor }
      ]}
      size={28}
    />,
    onPress: () => onRequestBiometrics(),
  }), [isBiometricSupported, enableBiometrics]);

  const logout = {
    label: 'Log out',
    value: 'logout',
    icon: <Logout size={21} color={text.error} />,
    onPress: () => setVisible(true),
  };

  const onRequestBiometrics = () => {
    if (enableBiometrics) dispatch(setBiometricsLogin(null));
    else dispatch(setBiometricsLogin(user._id));
  };

  useEffect(() => {
    if (biometricsLogin) setEnableBiometrics(true);
    else setEnableBiometrics(false);
  }, [biometricsLogin]);

  useEffect(()=>{
    if (route.params?.loggedOut) navigation.replace('Login', {loggedOut: true});
  }, [route.params?.loggedOut]);

  const renderRow = ({item, index}: any) => {
    return (
      <TouchableOpacity disabled={item.disabled} onPress={item?.onPress}>
        <View style={[
          styles?.row,
          styles?.rowContainer,
          index === 0 && styles?.top,
          index + 1 === settings?.length && styles?.bottom,
        ]}>
          <View style={styles?.row}>
            {item?.icon}
            <Text style={[styles.textSettings, !!item?.disabled && {color: disabledColor}, item?.value === 'logout' && {color: text.error}]}>{item?.label}</Text>
          </View>
          {
            (item?.value !== 'logout' && !item?.rightIcon) &&
            <Right size={20} />
          }
          {item?.rightIcon}
        </View>
      </TouchableOpacity>
    )
  };

  const separator = <View style={styles.separator} />;
  const header = (
    <View style={[
      styles.sectionContainer,
      styles.profileContainer,
      Platform.OS === 'web' && styles?.webHeaderView,
    ]}>
      <Image
        style={styles.image}
        source={photo}
      />
      <Text style={styles.nameText}>{name}</Text>
      <Text style={styles.emailText}>{email}</Text>
      <Button style={styles.button} onPress={() => {
        setTimeout(() => {
          navigation.navigate('ProfilePage');
        });
      }}>
        <Text style={styles.leftTextButton} >Edit Profile</Text>
        {
          Platform.OS !== 'web' && <ArrowRight size={20} color='#fff' />
        }
      </Button>
    </View>
  );
  const footer = (
    <>
      {
        Platform.OS != 'web'
          ? <View style={[styles.sectionContainer, styles?.logoutContainer, { paddingBottom: 10 }]}>
              {renderRow({item: biometrics})}
            </View>
          : <></>
      }
      <View style={[styles.sectionContainer, styles?.logoutContainer]}>
        {renderRow({item: logout})}
      </View>
    </>
  );
  const flatlist = (
    <FlatList
      showsVerticalScrollIndicator={true}
      data={settings}
      renderItem={renderRow}
      keyExtractor={(item, index) => `${index}`}
      ItemSeparatorComponent={() => separator}
      ListHeaderComponent={() => Platform.OS !== 'web' ? header : null}
      ListFooterComponent={() => footer}
    />
  )

  return (
    <>
      <NavBar
        title='Settings'
        leftIcon={<Close color='#fff' />}
        onLeft={() => navigation.goBack()}
      />

      {
        Platform.OS === 'web' &&
        <View style={styles?.webView}>
          {header}
          <View style={[styles?.flatlistWebView, styles?.webShadow]}>
            {flatlist}
          </View>
        </View>
      }

      {
        Platform.OS !== 'web' &&
        flatlist
      }

      <Alert
        visible={visible}
        title='Log out'
        message='Are you sure you want to log out?'
        confirmText='OK'
        cancelText='Cancel'
        onConfirm={() => {
          setVisible(false);
          if (!enableBiometrics) resetCredentials();
          setTimeout(() => {
            navigation.dispatch((state: RootStateOrAny) => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login', params: {loggedOut: true} }],
              });
            });
          }, 500);
          setTimeout(() => {
            async function f() {
              await AsyncStorage.clear()
            }
            f()
            dispatch(logoutUser());
            destroy();
          }, 1000);
        }}
        onCancel={() => setVisible(false)}
      />
      <Alert
        visible={settingVisible}
        title='Coming soon'
        message='It seems like you are interested on this section. This module will be available soon!'
        confirmText='OK'
        onConfirm={() => setSettingVisible(false)}
      />
    </>
  )
};

export default React.memo(Settings);
