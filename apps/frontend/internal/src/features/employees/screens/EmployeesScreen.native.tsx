import React from "react";
import { StyleSheet, SafeAreaView } from "react-native";
import { COLORS } from "@edge/ui";
import { EmployeesScreenContent } from "./EmployeesScreenContent";

export function EmployeesScreen() {
  return (
    <SafeAreaView style={styles.nativeSafeArea}>
      <EmployeesScreenContent isMobileNative={true} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  nativeSafeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
});
