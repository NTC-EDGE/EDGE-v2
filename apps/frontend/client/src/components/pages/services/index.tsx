import React from 'react';
import NTCServices from '@templates/services';

const Services = ({
  navigation,
  route,
}: any) => {
  return (
    <NTCServices
      navigation={navigation}
      services={route?.params?.services}
    />
  )
}

export default React.memo(Services);
