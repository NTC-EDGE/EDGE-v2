import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ChatScreenContent } from './ChatScreenContent';

export const ChatScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <ChatScreenContent />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
