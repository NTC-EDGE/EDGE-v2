import React, { FC } from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import { primaryColor } from '@styles/color';
import styles from './styles';

const GeneratingApplication = ({}) => {
  return (
    <View style={styles?.mainContainer}>
      <View style={styles?.container}>
        <Text style={styles?.text}>
          Please wait while we generate your application.
        </Text>
        <View style={styles.ellipsisView}>
          <ActivityIndicator size='large' color={primaryColor} />
        </View>
      </View>
    </View>
  )
};

export default React.memo(GeneratingApplication);
