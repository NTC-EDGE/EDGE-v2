import { useCallback } from "react";
import { Alert, Platform } from "react-native";
import { useRecoilState, useRecoilValue } from "recoil";
import * as ImageManipulator from "expo-image-manipulator";
import {
  accumulatedPanState,
  cropSizeState,
  editingModeState,
  imageBoundsState,
  imageDataState,
  imageReadyState,
  processingState,
} from "../Store";

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

export const usePerformCrop = () => {
  const [accumulatedPan, setAccumulatedPan] = useRecoilState(accumulatedPanState);
  const imageBounds = useRecoilValue(imageBoundsState);
  const cropSize = useRecoilValue(cropSizeState);
  const [, setProcessing] = useRecoilState(processingState);
  const [, setImageReady] = useRecoilState(imageReadyState);
  const [imageData, setImageData] = useRecoilState(imageDataState);
  const [, setEditingMode] = useRecoilState(editingModeState);

  const onPerformCrop = useCallback(async () => {
    try {
      setProcessing(true);

      if (!imageData?.uri) {
        throw new Error("Invalid image uri.");
      }

      if (!imageBounds?.width || !imageBounds?.height) {
        throw new Error("Image bounds are not ready.");
      }

      if (!cropSize?.width || !cropSize?.height) {
        throw new Error("Crop size is invalid.");
      }

      // Use dimensions directly from the imageData Recoil state to avoid redundant re-encoding
      const naturalWidth = Math.round(imageData.width);
      const naturalHeight = Math.round(imageData.height);

      const scaleX = naturalWidth / imageBounds.width;
      const scaleY = naturalHeight / imageBounds.height;

      let originX = Math.round((accumulatedPan.x - imageBounds.x) * scaleX);
      let originY = Math.round((accumulatedPan.y - imageBounds.y) * scaleY);
      let width = Math.round(cropSize.width * scaleX);
      let height = Math.round(cropSize.height * scaleY);

      originX = clamp(originX, 0, naturalWidth - 1);
      originY = clamp(originY, 0, naturalHeight - 1);

      const maxWidth = naturalWidth - originX;
      const maxHeight = naturalHeight - originY;

      if (maxWidth <= 0 || maxHeight <= 0) {
        throw new Error(
          `Crop origin is outside image bounds: ${JSON.stringify({
            originX,
            originY,
            naturalWidth,
            naturalHeight,
          })}`
        );
      }

      width = clamp(width, 1, maxWidth);
      height = clamp(height, 1, maxHeight);

      if (width <= 0 || height <= 0) {
        throw new Error(
          `Invalid crop rectangle: ${JSON.stringify({
            originX,
            originY,
            width,
            height,
            naturalWidth,
            naturalHeight,
          })}`
        );
      }

      setImageReady(false);

      // Perform the crop operation using the calculated scale and origin
      const cropResult = await ImageManipulator.manipulateAsync(
        imageData.uri,
        [
          {
            crop: {
              originX,
              originY,
              width,
              height,
            },
          },
        ],
        {
          compress: 1,
          format: ImageManipulator.SaveFormat.PNG,
        }
      );

      // Removed redundant second manipulateAsync call on Web as it's not needed for basic cropping.
      setImageData({
        uri: cropResult.uri,
        width: cropResult.width,
        height: cropResult.height,
      });

      setAccumulatedPan({
        x: imageBounds.x,
        y: imageBounds.y,
      });

      setEditingMode("operation-select");
    } catch (error: any) {
      console.log("Crop error:", error);
      Alert.alert("Crop failed", error?.message || "The crop area is invalid.");
    } finally {
      setProcessing(false);
    }
  }, [
    accumulatedPan,
    imageBounds,
    cropSize,
    imageData,
    setAccumulatedPan,
    setEditingMode,
    setImageData,
    setImageReady,
    setProcessing,
  ]);

  return onPerformCrop;
};
