import React from "react";
import { StyleSheet, SafeAreaView } from "react-native";
import { COLORS } from "@edge/ui";
import { UsersScreenContent } from "./UsersScreenContent";

export function UsersScreen() {
  return (
    <SafeAreaView style={styles.nativeSafeArea}>
      <UsersScreenContent isMobileNative={true} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  nativeSafeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
});
