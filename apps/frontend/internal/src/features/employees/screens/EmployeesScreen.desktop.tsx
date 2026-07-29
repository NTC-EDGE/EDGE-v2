import React from "react";
import { StyleSheet, View } from "react-native";
import { EmployeesScreenContent } from "./EmployeesScreenContent";

export function EmployeesScreen() {
  return (
    <View style={styles.desktopShell}>
      <EmployeesScreenContent isDesktop={true} />
    </View>
  );
}

const styles = StyleSheet.create({
  desktopShell: {
    flex: 1,
  },
});
