import React from "react";
import { StyleSheet, View } from "react-native";
import { EmployeesScreenContent } from "./EmployeesScreenContent";

export function EmployeesScreen() {
  return (
    <View style={styles.webShell}>
      <EmployeesScreenContent isWeb={true} />
    </View>
  );
}

const styles = StyleSheet.create({
  webShell: {
    flex: 1,
  },
});
