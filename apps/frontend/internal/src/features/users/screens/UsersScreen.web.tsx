import React from "react";
import { StyleSheet, View } from "react-native";
import { UsersScreenContent } from "./UsersScreenContent";

export function UsersScreen() {
  return (
    <View style={styles.webShell}>
      <UsersScreenContent isWeb={true} />
    </View>
  );
}

const styles = StyleSheet.create({
  webShell: {
    flex: 1,
  },
});
