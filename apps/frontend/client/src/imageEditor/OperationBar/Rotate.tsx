import * as React from "react";
import { StyleSheet, View, Text, Platform, Alert } from "react-native";
import { useRecoilState } from "recoil";
import { IconButton } from "../components/IconButton";
import { editingModeState, imageDataState, processingState } from "../Store";
import * as ImageManipulator from "expo-image-manipulator";
import {useCallback} from "react";

export function Rotate() {
  //
  const [processing, setProcessing] = useRecoilState(processingState);
  const [imageData, setImageData] = useRecoilState(imageDataState);
  const [, setEditingMode] = useRecoilState(editingModeState);

  const [originalImageData] = React.useState(imageData);

  const [rotation, setRotation] = React.useState(0);

  React.useEffect(() => {
    if (rotation !== 0) {
      onRotate(rotation);
    } else {
      setImageData(originalImageData);
    }
  }, [rotation]);

  const onRotate = async (angle: number) => {
    if (processing) return;
    setProcessing(true);
    try {
      // Calculate rotated dimensions to combine rotate and crop in one call
      // Swapping width and height if the rotation is 90 or 270 degrees
      const isSwapped = Math.abs(angle) % 180 !== 0;
      const rotateWidth = isSwapped ? originalImageData.height : originalImageData.width;
      const rotateHeight = isSwapped ? originalImageData.width : originalImageData.height;

      // Combine rotate and crop to avoid redundant processing and re-encoding
      // We crop 1px border to fix white line issue: https://github.com/expo/expo/issues/7325
      const { uri, width, height } = await ImageManipulator.manipulateAsync(
        originalImageData.uri,
        [
          { rotate: angle },
          {
            crop: {
              originX: 1,
              originY: 1,
              width: rotateWidth - 2,
              height: rotateHeight - 2,
            },
          },
        ],
        { compress: 1, format: ImageManipulator.SaveFormat.PNG }
      );
      setImageData({ uri, width, height });
    } catch (error) {
      console.error("Rotate error:", error);
      Alert.alert("Error", "Failed to rotate image");
    } finally {
      setProcessing(false);
    }
  };

  const onClose = React.useCallback(() => {
    if (processing) return;
    // If closing reset the image back to its original
    setImageData(originalImageData);
    setEditingMode("operation-select");
  }, [processing, originalImageData, setImageData, setEditingMode]);

  const rotate = React.useCallback((direction: "cw" | "ccw") => {
    if (processing) return;
    setRotation((prevRotation) => {
      const webDirection = Platform.OS === "web" ? 1 : -1;
      let rotateBy = prevRotation - 90 * webDirection * (direction === "cw" ? 1 : -1);
      // keep it in the -180 to 180 range
      if (rotateBy > 180) {
        rotateBy = -90;
      } else if (rotateBy < -180) {
        rotateBy = 90;
      }
      return rotateBy;
    });
  }, [processing]);
  const onDone = useCallback(async () => {
    if (processing) return;
    setEditingMode("operation-select");
  }, [setEditingMode, processing]);

  return (
    <View style={styles.container}>
      <View style={[styles.row, { paddingHorizontal: "20%" }]}>
        <IconButton
          iconID="rotate-left"
          text="Rotate -90"
          onPress={() => rotate("ccw")}
          disabled={processing}
        />
        <IconButton
          iconID="rotate-right"
          text="Rotate +90"
          onPress={() => rotate("cw")}
          disabled={processing}
        />
      </View>
      <View style={styles.row}>
        <IconButton
          iconID="close"
          text="Cancel"
          onPress={onClose}
          disabled={processing}
        />
        <Text style={styles.prompt}>Rotate</Text>
        <IconButton
          iconID="check"
          text="Done"
          onPress={onDone}
          disabled={processing}
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
