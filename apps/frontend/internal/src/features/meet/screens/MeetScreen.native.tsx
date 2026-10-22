import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MeetScreenContent } from './MeetScreenContent';

export const MeetScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <MeetScreenContent />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
