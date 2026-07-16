import React, { useState, useEffect } from 'react';
import { Image, View } from 'react-native';
import { RootStateOrAny, useSelector, useDispatch } from 'react-redux';
import { createDrawerNavigator, DrawerItem, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import AwesomeAlert from 'react-native-awesome-alerts';
import { Entypo, Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import HomeScreen from '@pages/homepage';
import { primaryColor, button } from '@styles/color';
import styles from './styles';

import { logoutUser } from '@reducers/user/actions';

type DrawerScreenList = {
  Home: undefined,
  Profile: undefined,
  Account: undefined,
  Notifications: undefined,
  Help: undefined,
  About: undefined,
  Logout: undefined,
}
const Drawer = createDrawerNavigator<DrawerScreenList>();

const CustomDrawerContent = ({onLogout, ...props}:any) => {
    return (
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
        <DrawerItem
          label='Logout'
          icon={({ color, size }) => <MaterialIcons name='logout' color={color} size={size} />}
          onPress={onLogout}
        />
      </DrawerContentScrollView>
    );
}

const DrawerNavigation = ({ navigation }:any) => {
  const dispatch = useDispatch();
  const [showAlert, setShowAlert] = useState(false);
  const user = useSelector((state: RootStateOrAny) => state.user);
  const { session } = user;

  const onLogout = () => {
    onHide();
    setTimeout(() => navigation.replace('Login', {loggedOut: true}), 500);
    setTimeout(() => dispatch(logoutUser()), 1000);
  };

  const onHide = () => setShowAlert(false)
  const onShow = () => setShowAlert(true);

  // useEffect(() => {
  //   if (!session?.sessionToken) {
  //     onHide();
  //     setTimeout(() => navigation.replace('Login'), 500);
  //   }
  // }, [!session?.sessionToken]);

  return (
    <>
      <Drawer.Navigator
        initialRouteName='Home'
        screenOptions={{
            drawerStyle:{
                width:0
            },
            drawerActiveTintColor: primaryColor,
            drawerActiveBackgroundColor: 'rgba(0,0,0,0)',
            drawerPosition: 'right',
            headerShown: false,
        }}
        drawerContent={props => <CustomDrawerContent onLogout={onShow} {...props} />}
      >
        <Drawer.Screen name='Profile' options={{ title: `${session?.firstName} ${session?.lastName}`, drawerIcon: ({ color, size }) => /*<Ionicons name='ios-person-circle-outline' color={color} size={size} />*/ <Image style={{height: size, width: size}} source={require('@assets/avatar1.jpg') } /> }} component={HomeScreen} />
        <Drawer.Screen name='Home' options={{ drawerIcon: ({ color, size }) => <Feather name='home' color={color} size={size} /> }} component={HomeScreen} />
        {/* <Drawer.Screen name='Account' options={{ drawerIcon: ({ color, size }) => <Feather name='settings' color={color} size={size} /> }} component={HomeScreen} />
        <Drawer.Screen name='Notifications' options={{ drawerIcon: ({ color, size }) => <Ionicons name='ios-megaphone-outline' color={color} size={size} /> }} component={HomeScreen} />
        <Drawer.Screen name='Help' options={{ title: 'Help Center',drawerIcon: ({ color, size }) => <Entypo name='lifebuoy' color={color} size={size} /> }} component={HomeScreen} /> */}
        {/* <Drawer.Screen name='About' options={{ drawerIcon: ({ color, size }) => <Feather name='info' color={color} size={size} /> }} component={HomeScreen} /> */}
      </Drawer.Navigator>
      <AwesomeAlert
        show={showAlert}
        showProgress={false}
        titleStyle={styles.alertMessage}
        title={'Are you sure you would like to log out?'}
        contentStyle={styles.contentStyle}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={true}
        showConfirmButton={true}
        cancelText='Yes'
        confirmText='No'
        confirmButtonColor={'white'}
        cancelButtonColor={button.primary}
        confirmButtonStyle={styles.cancelButton}
        confirmButtonTextStyle={styles.cancelText}
        cancelButtonStyle={styles.confirmButton}
        cancelButtonTextStyle={styles.confirmText}
        actionContainerStyle={styles.actionContainerStyle}
        onCancelPressed={onLogout}
        onConfirmPressed={onHide}
      />
    </>
  )
}

export default React.memo(DrawerNavigation);
