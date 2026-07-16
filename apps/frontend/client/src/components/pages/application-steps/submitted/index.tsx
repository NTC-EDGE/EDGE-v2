import React, {useMemo} from 'react';
import { View, Image } from 'react-native';
import AppInactivity from '@hooks/useAppInactivity';
import Text from '@atoms/text';
import styles from './styles';
import useGuest from '@hooks/useGuest';

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
        <Image
          style={stylesMemo.image}
          source={require('@assets/plane.png')}
        />
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
