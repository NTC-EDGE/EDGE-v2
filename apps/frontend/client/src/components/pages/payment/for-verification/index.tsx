import React, { useEffect } from 'react';
import { BackHandler } from 'react-native';
import PaymentForVerification from '@templates/payment/for-verification';

const ForVerificationNavigator =  ({ route, navigation }: any) => {
  const onBack = () => {
    navigation.pop();
    return true;
  };
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBack);
    };
  }, []);
  const params = route?.params || {};
  return <PaymentForVerification  {...params} />
};


export default React.memo(ForVerificationNavigator) ;
