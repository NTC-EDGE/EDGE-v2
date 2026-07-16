import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {SafeAreaView,View,StyleSheet,TouchableOpacity,Dimensions,BackHandler,Platform} from 'react-native';
import { Check, ArrowRight } from '@atoms/icon';
import Text from '@atoms/text';
import { Bold } from '@styles/font';
import { text, primaryColor } from '@styles/color';
import { setUser } from '@reducers/user/actions';
import {isMobile} from "@utils/formatting";

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  circle: {
    ...Platform.select({
       native:{
         height: width * .20,
         width: width * .20,
         borderRadius: width * .20,
         marginTop: width * .40,
       },
      web:{
        height: width * 0.042,
        width: width * 0.042,
        borderRadius: width * 0.042,
        marginTop: width * 0.042,
      }
    }),

    backgroundColor: primaryColor,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 30
  },
  text: {
    marginHorizontal: 60,
    marginTop: 5,
    textAlign: 'center',
  },
  boldText: {
    fontFamily: Bold,
  },
  horizontal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    marginBottom: 30,
  }
});

const RegistrationSuccess = ({ navigation, route }:any) => {
  const dispatch = useDispatch();
  const sessionTemporary = useSelector(state => state?.user?.sessionTemporary);
  const onContinue = () => {
    if (sessionTemporary?.sessionToken) {
      dispatch(setUser(sessionTemporary));
      navigation.replace('HomeScreen');
    }
  };
  const onBack = () => {
    onContinue();
    return true;
  };
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBack);
    };
  }, []);

  return (
    <View style={styles.container}>

      <View style={[styles.circle, { borderColor: text.primary }]}>
        <Check
          color='#fff'
          size={isMobile ? (width * .20) / 2 :  (width * 0.042) / 2 }
        />
      </View>
      <Text
        style={styles.boldText}
        color={text.primary}
        size={22}
      >
        Congratulations
      </Text>
      <Text
        style={styles.text}
        color={text.default}
        size={16}
      >
        Your account has been successfully created.
      </Text>
      <View style={styles.footer}>
        <TouchableOpacity onPress={onContinue}>
          <View style={styles.horizontal}>
            <Text
              style={styles.boldText}
              color={text.info}
              size={18}
            >
              Continue
            </Text>
            <ArrowRight
              style={{ marginLeft: 5 }}
              color={text.info}
              size={24}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default React.memo(RegistrationSuccess);
