import React, {useMemo} from 'react';
import { View, Image } from 'react-native';
import AppInactivity from '@hooks/useAppInactivity';
import Text from '@atoms/text';
import styles from './styles';
import useGuest from '@hooks/useGuest';
import LottieView from "lottie-react-native";

export default (serviceCode: any = '') => {
  const isGuest = useGuest();
  const _msg = serviceCode?.serviceCode === 'service-1'
    ? 'Please note that ALL documents uploaded SHALL be presented to the venue before taking the exam.\n\n'
    : '';
    const stylesMemo = useMemo(() => {
        return styles;
    }, [])
  const renderComponent = () => {
    return (
      <View style={stylesMemo.container}>
          <View    style={stylesMemo.image}>
              <LottieView
                  source={require('@assets/lottie/submit.json')}  // Replace with your Lottie JSON animation file
                  autoPlay
                  loop={false}
              />
          </View>
        <Text style={stylesMemo.messageOne}>
          Your application has been submitted.
        </Text>
        <Text style={stylesMemo.messageTwo}>
          {`${_msg}We will notify you once your application is validated.\n\nThank you!`}
        </Text>
      </View>
    )
  };
  if (isGuest) {
    return (
      <AppInactivity>
        {renderComponent()}
      </AppInactivity>
    )
  }
  return renderComponent();
};
