import React from "react";
import { StyleSheet, View } from "react-native";
import { UsersScreenContent } from "./UsersScreenContent";

export function UsersScreen() {
  return (
    <View style={styles.desktopShell}>
      <UsersScreenContent isDesktop={true} />
    </View>
  );
}

const styles = StyleSheet.create({
  desktopShell: {
    flex: 1,
  },
});
