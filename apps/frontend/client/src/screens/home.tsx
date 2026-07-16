import React, { useState, useCallback } from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';
import { RootStateOrAny, useSelector, useDispatch } from 'react-redux';
import AwesomeAlert from 'react-native-awesome-alerts';
import Button from '@atoms/button';
// import { setUser } from 'src/reducers/user/actionsr/actions';
import { button, text } from '@styles/color';
import AsyncStorage from "@react-native-async-storage/async-storage";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30
  },
  alertMessage: {
    textAlign: 'center',
    color: text.default,
  },
  contentStyle: {
    padding: 30,
  },
  actionContainerStyle: {
    justifyContent: 'space-around',
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 40,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderWidth: 1,
    borderColor: text.default,
  },
  confirmText: {
    color: 'white',
    fontSize: 14,
  },
  cancelText: {
    color: text.default,
    fontSize: 14,
  }
});

const Home = ({ navigation }:any) => {
  const dispatch = useDispatch();
  const [showAlert, setShowAlert] = useState(false);
  const user = useSelector((state: RootStateOrAny) => state.user);

  const onLogout = useCallback(() => {
    onHide();
    // dispatch(setUser({}));
    async function f() {
      await AsyncStorage.clear()
    }
   f()
    setTimeout(() => {
      navigation.replace('Login');
    }, 100);
  }, []);

  const onHide = () => setShowAlert(false)

  return (
    <SafeAreaView style={styles.container}>
      <Text onPress={() => setShowAlert(true)}>Welcome, {user.email}</Text>
      <Button
        style={{backgroundColor: button.primary, width: '100%', marginTop: 15}}
        onPress={() => navigation.navigate('Payment')}
      >
        <Text>
          Payment
        </Text>
      </Button>
      <AwesomeAlert
        show={showAlert}
        showProgress={false}
        titleStyle={styles.alertMessage}
        title='Are you sure you would\nlike to log out?'
        contentStyle={styles.contentStyle}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={true}
        showConfirmButton={true}
        cancelText='Yes'
        confirmText='No'
        confirmButtonColor='#fff'
        cancelButtonColor={button.primary}
        confirmButtonStyle={styles.cancelButton}
        confirmButtonTextStyle={styles.cancelText}
        cancelButtonStyle={styles.confirmButton}
        cancelButtonTextStyle={styles.confirmText}
        actionContainerStyle={styles.actionContainerStyle}
        onCancelPressed={onLogout}
        onConfirmPressed={onHide}
      />
    </SafeAreaView>
  );
};

export default React.memo(Home);
