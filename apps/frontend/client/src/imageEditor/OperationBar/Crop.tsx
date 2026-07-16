import * as React from "react";
import { StyleSheet, View, Text } from "react-native";
import { useContext, useCallback } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { IconButton } from "../components/IconButton";
import {
  cropAspectRatioState,
  cropLockAspectRatioState,
  editingModeState,
  processingState,
  imageReadyState,
} from "../Store";
import { usePerformCrop } from "../customHooks/usePerformCrop";
import { EditorContext } from "../index";

export function Crop() {
  const { mode } = useContext(EditorContext);

  const [editingMode, setEditingMode] = useRecoilState(editingModeState);
  const [cropAspectRatio, setCropAspectRatio] = useRecoilState(cropAspectRatioState);
  const [cropLock, setCropLock] = useRecoilState(cropLockAspectRatioState);

  const processing = useRecoilValue(processingState);
  const imageReady = useRecoilValue(imageReadyState);

  const onPerformCrop = usePerformCrop();

  const onPressCrop = useCallback(() => {
    setEditingMode("crop");
  }, [setEditingMode]);

  const onPressSquare = useCallback(() => {
    setCropAspectRatio(1);
    setCropLock(true);
    setEditingMode("crop");
  }, [setCropAspectRatio, setCropLock, setEditingMode]);

  const onPressFree = useCallback(() => {
    setCropLock(false);
    setEditingMode("crop");
  }, [setCropLock, setEditingMode]);

  const onCancelCrop = useCallback(() => {
    setCropLock(false);
    setCropAspectRatio(1);
    setEditingMode("operation-select");
  }, [setCropLock, setCropAspectRatio, setEditingMode]);
  const onDone = useCallback(async () => {
    if (processing || !imageReady) return;

    await onPerformCrop();

    // IMPORTANT: reset editing mode so overlay unmounts
    setEditingMode("operation-select");
  }, [processing, imageReady, onPerformCrop, setEditingMode]);
  return (
      <View style={styles.container}>
        <View style={styles.row}>
          {mode === "full" && (
              <IconButton iconID="crop" text="Crop" onPress={onPressCrop} />
          )}

          {(editingMode === "crop" || mode === "crop-only") && (
              <>
                <IconButton
                    iconID={
                      cropLock && cropAspectRatio === 1
                          ? "radio-button-checked"
                          : "radio-button-unchecked"
                    }
                    text="1:1"
                    onPress={onPressSquare}
                />
                <IconButton
                    iconID={!cropLock ? "radio-button-checked" : "radio-button-unchecked"}
                    text="Free"
                    onPress={onPressFree}
                />
              </>
          )}
        </View>

        <View style={styles.row}>
          <IconButton iconID="close" text="Cancel" onPress={onCancelCrop} />

          <Text style={styles.prompt}>Adjust window to crop</Text>

          <IconButton
              iconID="check"
              text={processing ? "Processing..." : "Done"}
              onPress={onDone}
              disabled={processing || !imageReady}
          />
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
  prompt: {
    color: "#fff",
    fontSize: 21,
    textAlign: "center",
  },
  row: {
    width: "100%",
    height: 80,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: "2%",
  },
});
