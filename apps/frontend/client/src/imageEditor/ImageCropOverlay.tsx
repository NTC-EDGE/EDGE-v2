import * as React from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State,
} from "react-native-gesture-handler";
import { useContext } from "react";
import { EditorContext } from "./index";
import {
  cropSizeState,
  imageBoundsState,
  accumulatedPanState,
  cropAspectRatioState,
  cropLockAspectRatioState,
  imageDataState,
} from "./Store";

const horizontalSections = ["top", "middle", "bottom"] as const;
const verticalSections = ["left", "middle", "right"] as const;

type Size = { width: number; height: number };

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const ImageCropOverlay = () => {
  const [selectedFrameSection, setSelectedFrameSection] = React.useState("");

  const imageData = useRecoilValue(imageDataState);
  const cropAspectRatio = useRecoilValue(cropAspectRatioState);
  const cropLock = useRecoilValue(cropLockAspectRatioState);
  const imageBounds = useRecoilValue(imageBoundsState);

  const [cropSize, setCropSize] = useRecoilState(cropSizeState);
  const [accumulatedPan, setAccumluatedPan] = useRecoilState(accumulatedPanState);

  const { minimumCropDimensions, fixedAspectRatio: ctxRatio } = useContext(EditorContext);

  const lockAspectRatio = !!cropLock;
  const fixedAspectRatio =
      lockAspectRatio && typeof cropAspectRatio === "number" && cropAspectRatio > 0
          ? cropAspectRatio
          : ctxRatio || 1;

  const panX = React.useRef(new Animated.Value(0)).current;
  const panY = React.useRef(new Animated.Value(0)).current;
  const animW = React.useRef(new Animated.Value(cropSize.width)).current;
  const animH = React.useRef(new Animated.Value(cropSize.height)).current;

  React.useEffect(() => {
    animW.setValue(cropSize.width);
    animH.setValue(cropSize.height);
  }, [cropSize.width, cropSize.height, animW, animH]);

  const initializeCropWindow = React.useCallback(() => {
    const { x, y, width, height } = imageBounds;

    if (!width || !height) return;

    const imgAR = width / height;
    let newSize: Size;

    if (fixedAspectRatio < imgAR) {
      newSize = { height, width: height * fixedAspectRatio };
    } else {
      newSize = { width, height: width / fixedAspectRatio };
    }

    newSize.width = Math.max(newSize.width, minimumCropDimensions.width);
    newSize.height = Math.max(newSize.height, minimumCropDimensions.height);

    newSize.width = Math.min(newSize.width, width);
    newSize.height = Math.min(newSize.height, height);

    setCropSize(newSize);
    setAccumluatedPan({ x, y });
    panX.setValue(0);
    panY.setValue(0);
    animW.setValue(newSize.width);
    animH.setValue(newSize.height);
  }, [
    imageBounds,
    fixedAspectRatio,
    minimumCropDimensions.width,
    minimumCropDimensions.height,
    setCropSize,
    setAccumluatedPan,
    panX,
    panY,
    animW,
    animH,
  ]);

  React.useEffect(() => {
    initializeCropWindow();
  }, [imageData?.uri, initializeCropWindow]);

  React.useEffect(() => {
    initializeCropWindow();
  }, [fixedAspectRatio, initializeCropWindow]);

  const isMove = selectedFrameSection === "middlemiddle";
  const isLeft = selectedFrameSection.endsWith("left");
  const isRight = selectedFrameSection.endsWith("right");
  const isTop = selectedFrameSection.startsWith("top");
  const isBottom = selectedFrameSection.startsWith("bottom");

  const pickSection = (x: number, y: number) => {
    const w = cropSize.width || 1;
    const h = cropSize.height || 1;

    const v = y / h;
    const u = x / w;

    const vPart = v < 0.333 ? "top" : v < 0.667 ? "middle" : "bottom";
    const uPart = u < 0.333 ? "left" : u < 0.667 ? "middle" : "right";

    return `${vPart}${uPart}`;
  };

  const computeResize = (tx: number, ty: number) => {
    const imgL = imageBounds.x;
    const imgT = imageBounds.y;
    const imgR = imageBounds.x + imageBounds.width;
    const imgB = imageBounds.y + imageBounds.height;

    const curL = accumulatedPan.x;
    const curT = accumulatedPan.y;
    const curR = curL + cropSize.width;
    const curB = curT + cropSize.height;

    let newL = curL;
    let newT = curT;
    let newR = curR;
    let newB = curB;

    if (isLeft) newL = curL + tx;
    if (isRight) newR = curR + tx;
    if (isTop) newT = curT + ty;
    if (isBottom) newB = curB + ty;

    let newW = newR - newL;
    let newH = newB - newT;

    const minW = minimumCropDimensions.width;
    const minH = minimumCropDimensions.height;

    if (lockAspectRatio) {
      if (Math.abs(tx) >= Math.abs(ty)) {
        newH = newW / fixedAspectRatio;
        if (isTop && !isBottom) newT = newB - newH;
        else newB = newT + newH;
      } else {
        newW = newH * fixedAspectRatio;
        if (isLeft && !isRight) newL = newR - newW;
        else newR = newL + newW;
      }
    }

    if (newW < minW) {
      newW = minW;
      if (isLeft && !isRight) newL = newR - newW;
      else newR = newL + newW;

      if (lockAspectRatio) {
        newH = newW / fixedAspectRatio;
        if (isTop && !isBottom) newT = newB - newH;
        else newB = newT + newH;
      }
    }

    if (newH < minH) {
      newH = minH;
      if (isTop && !isBottom) newT = newB - newH;
      else newB = newT + newH;

      if (lockAspectRatio) {
        newW = newH * fixedAspectRatio;
        if (isLeft && !isRight) newL = newR - newW;
        else newR = newL + newW;
      }
    }

    if (isLeft && !isRight) {
      newL = clamp(newL, imgL, curR - minW);
      newR = newL + newW;
      if (newR > imgR) {
        newR = imgR;
        newL = newR - newW;
      }
    } else {
      newR = clamp(newR, curL + minW, imgR);
      newL = newR - newW;
      if (newL < imgL) {
        newL = imgL;
        newR = newL + newW;
      }
    }

    if (isTop && !isBottom) {
      newT = clamp(newT, imgT, curB - minH);
      newB = newT + newH;
      if (newB > imgB) {
        newB = imgB;
        newT = newB - newH;
      }
    } else {
      newB = clamp(newB, curT + minH, imgB);
      newT = newB - newH;
      if (newT < imgT) {
        newT = imgT;
        newB = newT + newH;
      }
    }

    newW = newR - newL;
    newH = newB - newT;

    newW = Math.min(newW, imageBounds.width);
    newH = Math.min(newH, imageBounds.height);

    return { newL, newT, newW, newH };
  };

  const onOverlayMove = ({ nativeEvent }: PanGestureHandlerGestureEvent) => {
    if (!selectedFrameSection) {
      setSelectedFrameSection(pickSection(nativeEvent.x, nativeEvent.y));
      return;
    }

    const tx = nativeEvent.translationX ?? 0;
    const ty = nativeEvent.translationY ?? 0;

    if (isMove) {
      panX.setValue(tx);
      panY.setValue(ty);
      return;
    }

    const { newL, newT, newW, newH } = computeResize(tx, ty);

    animW.setValue(newW);
    animH.setValue(newH);
    panX.setValue(newL - accumulatedPan.x);
    panY.setValue(newT - accumulatedPan.y);
  };

  const commitMove = (tx: number, ty: number) => {
    const imgL = imageBounds.x;
    const imgT = imageBounds.y;
    const imgR = imageBounds.x + imageBounds.width;
    const imgB = imageBounds.y + imageBounds.height;

    let newX = accumulatedPan.x + tx;
    let newY = accumulatedPan.y + ty;

    newX = clamp(newX, imgL, imgR - cropSize.width);
    newY = clamp(newY, imgT, imgB - cropSize.height);

    setAccumluatedPan({ x: newX, y: newY });
    panX.setValue(0);
    panY.setValue(0);
  };

  const commitResize = (tx: number, ty: number) => {
    const { newL, newT, newW, newH } = computeResize(tx, ty);

    setAccumluatedPan({ x: newL, y: newT });
    setCropSize({ width: newW, height: newH });

    animW.setValue(newW);
    animH.setValue(newH);
    panX.setValue(0);
    panY.setValue(0);
  };

  const onHandlerStateChange = ({ nativeEvent }: PanGestureHandlerGestureEvent) => {
    if (
        nativeEvent.state !== State.END &&
        nativeEvent.state !== State.CANCELLED &&
        nativeEvent.state !== State.FAILED
    ) {
      return;
    }

    const tx = nativeEvent.translationX ?? 0;
    const ty = nativeEvent.translationY ?? 0;

    if (selectedFrameSection) {
      if (selectedFrameSection === "middlemiddle") commitMove(tx, ty);
      else commitResize(tx, ty);
    }

    setSelectedFrameSection("");
    panX.setValue(0);
    panY.setValue(0);
  };

  return (
      <GestureHandlerRootView style={styles.container}>
        <PanGestureHandler
            onGestureEvent={onOverlayMove}
            onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View
              style={[
                styles.overlay,
                {
                  width: animW,
                  height: animH,
                  transform: [
                    { translateX: Animated.add(panX, accumulatedPan.x) },
                    { translateY: Animated.add(panY, accumulatedPan.y) },
                  ],
                },
              ]}
          >
            {horizontalSections.map((hsection) => (
                <View style={styles.sectionRow} key={hsection}>
                  {verticalSections.map((vsection) => {
                    const key = `${hsection}${vsection}`;

                    const isCorner =
                        key === "topleft" ||
                        key === "topright" ||
                        key === "bottomleft" ||
                        key === "bottomright";

                    const isEdge =
                        key === "topmiddle" ||
                        key === "bottommiddle" ||
                        key === "middleleft" ||
                        key === "middleright";

                    return (
                        <View style={styles.defaultSection} key={key}>
                          {isCorner ? (
                              <View
                                  style={[
                                    styles.cornerMarker,
                                    hsection === "top"
                                        ? { top: -4, borderTopWidth: 7 }
                                        : { bottom: -4, borderBottomWidth: 7 },
                                    vsection === "left"
                                        ? { left: -4, borderLeftWidth: 7 }
                                        : { right: -4, borderRightWidth: 7 },
                                  ]}
                              />
                          ) : null}

                          {isEdge ? <View style={styles.edgeHandle} /> : null}
                        </View>
                    );
                  })}
                </View>
            ))}
          </Animated.View>
        </PanGestureHandler>
      </GestureHandlerRootView>
  );
};

export { ImageCropOverlay };

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    position: "absolute",
  },
  overlay: {
    backgroundColor: "#33333355",
    borderColor: "#ffffff88",
    borderWidth: 1,
    position: "absolute",
  },
  sectionRow: {
    flexDirection: "row",
    flex: 1,
  },
  defaultSection: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: "#ffffff88",
    justifyContent: "center",
    alignItems: "center",
  },
  cornerMarker: {
    position: "absolute",
    borderColor: "#ffffff",
    height: 30,
    width: 30,
  },
  edgeHandle: {
    width: 16,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ffffffaa",
  },
});
