import React, { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch, RootStateOrAny } from 'react-redux';
import { Image, Platform, useWindowDimensions, View } from 'react-native';
import Text from '@atoms/text';
import { ArrowRight, Bell, Close, Exclamation, Help, Logout, Right, ToggleIcon } from '@atoms/icon';
import Alert from '@atoms/alert';
import Button from '@atoms/button';
import NavBar from '@organisms/navbar';
import { disabledColor, text } from '@styles/color';
import styles from './styles';
import { FlatList, ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { logoutUser, setBiometricsLogin, updateUser } from '@reducers/user/actions';
import useOneSignal from '@hooks/useOneSignal';
import useBiometrics, { resetCredentials } from '@hooks/useBiometrics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ProfileDrawer } from "@pages/ProfileDrawer";
import Profile from "@pages/settings/profile/index.web";
import ChangePassword from "@pages/settings/change-password";
import { AnimatePresence, MotiView } from "moti";
import Appearance from "@pages/settings/appearance";
import HelpPage from "@pages/settings/help";
import ChangeProfilePhotoModal from "@organisms/ChangeProfilePhotoModal";
import * as ImagePicker from 'expo-image-picker';
import { saveProfilePhoto } from "@utils/saveProfilePhoto";

const Settings = ({ route, navigation }: any) => {
  const dispatch = useDispatch();
  const { destroy } = useOneSignal();
  const [visible, setVisible] = useState(false);
  const [isProfile, setIsProfile] = useState(true);
  const [isSecurity, setIsSecurity] = useState(false);
  const [isAppearance, setIsAppearance] = useState(false);
  const [isHelp, setIsHelp] = useState(false);
  const [current, setCurrent] = useState("profile");


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
  const [showChangePhoto, setShowChangePhoto] = useState(false);
  const name = userType?.toLowerCase() === 'company' ? (applicant?.companyName ? applicant?.companyName : "") : `${firstName ? firstName : ""} ${lastName ? lastName : ""} ${suffix ? suffix : ""}`;
  const dp = profilePicture?.small;
  const photo = dp ? { uri: dp } : require('@assets/avatar.png');
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

  useEffect(() => {
    if (route.params?.loggedOut) navigation.replace('Login', { loggedOut: true });
  }, [route.params?.loggedOut]);

  const renderRow = ({ item, index }: any) => {
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
            <Text style={[styles.textSettings, !!item?.disabled && { color: disabledColor }, item?.value === 'logout' && { color: text.error }]}>{item?.label}</Text>
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
            {renderRow({ item: biometrics })}
          </View>
          : <></>
      }
      <View style={[styles.sectionContainer, styles?.logoutContainer]}>
        {renderRow({ item: logout })}
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
  const renderContent = () => {
    switch (current) {
      case "profile":
        return <Profile onChangePhoto={() => setShowChangePhoto(true)} />;

      case "security":
        return <ChangePassword />;

      case "appearance":
        return <Appearance />;

      case "help":
        return <HelpPage />;

      default:
        return <Profile onChangePhoto={() => setShowChangePhoto(true)} />;
    }
  };


  const { width } = useWindowDimensions();
  const isCompactWeb = Platform.OS === 'web' && width < 900;
  const save = saveProfilePhoto(dispatch);
  const handleUploadFromFile = async () => {
    if (Platform.OS === 'web') {
      // 👇 Use a hidden input for web
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e: any) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        await save(file, false);
        setShowChangePhoto(false);
      };
      input.click();
    } else {
      // 👇 Native: pick from gallery
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
      });

      if (!result.canceled) {
        await save(result, false);
        setShowChangePhoto(false);
      }
    }
  };

  const handleTakePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });

    if (!result.canceled) {
      await save(result, true); // true if you treat camera shot as "cropped"
      setShowChangePhoto(false);
    }
  };
  return (
    <>
      <NavBar
        title='Settings'
        leftIcon={<Close color='#fff' />}
        onLeft={() => navigation.goBack()}
      />

      {Platform.OS === 'web' && !isCompactWeb && (
        //  DESKTOP: sidebar + content side-by-side
        <View style={styles.webRootRow}>
          <ProfileDrawer
            current={current}
            name={name}
            email={email}
            photo={dp}
            isCompact={false}
            onClose={() => navigation.goBack()}
            onProfile={() => setCurrent('profile')}
            onSecurity={() => setCurrent('security')}
            onAppearance={() => setCurrent('appearance')}
            onHelp={() => setCurrent('help')}
            onLogout={() => setVisible(true)}
            onUploadAvatar={() => setShowChangePhoto(true)}
            onRemoveAvatar={() => console.log('remove photo')}
          />

          <ScrollView
            style={styles.rightScroll}
            contentContainerStyle={styles.rightScrollContent}
          >
            <View style={[styles.flatlistWebView, styles.webShadow]}>
              <View style={{ flex: 1, padding: 18 }}>
                <AnimatePresence initial={false}>
                  <MotiView
                    key={current}
                    from={{ opacity: 0, translateX: 10 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    exit={{ opacity: 0, translateX: -10 }}
                    transition={{ type: 'timing', duration: 200 }}
                    style={{ flex: 1 }}
                  >
                    {renderContent()}
                  </MotiView>
                </AnimatePresence>
              </View>
            </View>
          </ScrollView>
        </View>
      )}

      {Platform.OS === 'web' && isCompactWeb && (
        //  SMALL WINDOW: drawer on top, content below (stacked)
        <ScrollView style={styles.webRootColumn}>
          <ProfileDrawer
            current={current}
            name={name}
            email={email}
            photo={dp}
            isCompact={true}
            onClose={() => navigation.goBack()}
            onProfile={() => setCurrent('profile')}
            onSecurity={() => setCurrent('security')}
            onAppearance={() => setCurrent('appearance')}
            onHelp={() => setCurrent('help')}
            onLogout={() => setVisible(true)}
            onUploadAvatar={() => setShowChangePhoto(true)}
            onRemoveAvatar={() => console.log('remove photo')}
          />

          <View style={[styles.flatlistWebView, styles.webShadow]}>
            <View style={{ flex: 1, padding: 18 }}>
              <AnimatePresence initial={false}>
                <MotiView
                  key={current}
                  from={{ opacity: 0, translateX: 10 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  exit={{ opacity: 0, translateX: -10 }}
                  transition={{ type: 'timing', duration: 200 }}
                  style={{ flex: 1 }}
                >
                  {renderContent()}
                </MotiView>
              </AnimatePresence>
            </View>
          </View>
        </ScrollView>
      )}


      <ChangeProfilePhotoModal
        visible={showChangePhoto}
        onClose={() => setShowChangePhoto(false)}
        onUploadFromFile={handleUploadFromFile}
        onTakePhoto={handleTakePhoto}
      />
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
                routes: [{ name: 'EdgePortal', params: { loggedOut: true } }],
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
