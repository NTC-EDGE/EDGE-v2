import * as React from "react";
import { View, StyleSheet } from "react-native";
import { useContext, useEffect, useRef, useCallback } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  editingModeState,
  imageDataState,
  processingState,
} from "./Store";
import { IconButton } from "./components/IconButton";
import { EditorContext } from "./index";
import { usePerformCrop } from "./customHooks/usePerformCrop";

function ControlBar() {
  const [editingMode, setEditingMode] = useRecoilState(editingModeState);
  const imageData = useRecoilValue(imageDataState);
  const [processing, setProcessing] = useRecoilState(processingState);
  const { mode, onCloseEditor, onEditingComplete } = useContext(EditorContext);

  const performCrop = usePerformCrop();
  const didCompleteCropOnlyRef = useRef(false);

  const shouldDisableDoneButton = processing;

  const onFinishEditing = useCallback(async () => {
    if (processing) return;

    if (editingMode === "crop") {
      await performCrop();
      return;
    }

    if (mode === "full") {
      setProcessing(false);
      onEditingComplete(imageData);
      onCloseEditor();
      return;
    }

    if (mode === "crop-only") {
      didCompleteCropOnlyRef.current = false;
      await performCrop();
    }
  }, [
    processing,
    editingMode,
    mode,
    imageData,
    performCrop,
    setProcessing,
    onEditingComplete,
    onCloseEditor,
  ]);

  const onPressBack = useCallback(() => {
    if (processing) return;

    if (mode === "full") {
      if (editingMode === "operation-select") {
        onCloseEditor();
      } else {
        setEditingMode("operation-select");
      }
      return;
    }

    if (mode === "crop-only") {
      onCloseEditor();
    }
  }, [processing, mode, editingMode, onCloseEditor, setEditingMode]);

  useEffect(() => {
    if (
        mode === "crop-only" &&
        imageData?.uri &&
        editingMode === "operation-select" &&
        !processing &&
        !didCompleteCropOnlyRef.current
    ) {
      didCompleteCropOnlyRef.current = true;
      onEditingComplete(imageData);
      onCloseEditor();
    }
  }, [
    mode,
    imageData,
    editingMode,
    processing,
    onEditingComplete,
    onCloseEditor,
  ]);

  return (
      <View style={styles.container}>
        <IconButton
            iconID="arrow-back"
            text="Back"
            onPress={onPressBack}
            disabled={processing}
        />

        <IconButton
            iconID="done"
            text={processing ? "Processing..." : "Done"}
            onPress={onFinishEditing}
            disabled={shouldDisableDoneButton}
        />
      </View>
  );
}

export { ControlBar };

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 80,
    backgroundColor: "rgba(0,0,0,0.5)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
});
