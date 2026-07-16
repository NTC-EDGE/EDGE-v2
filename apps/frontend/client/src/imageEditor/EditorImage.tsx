import * as React from "react";
import { Image, StyleSheet, View, LayoutChangeEvent } from "react-native";
import { useRecoilState, useRecoilValue } from "recoil";
import {
    accumulatedPanState,
    cropSizeState,
    imageBoundsState,
    imageDataState,
    imageReadyState,
} from "./Store";

const getContainedImageRect = ({
                                   containerWidth,
                                   containerHeight,
                                   imageWidth,
                                   imageHeight,
                               }: {
    containerWidth: number;
    containerHeight: number;
    imageWidth: number;
    imageHeight: number;
}) => {
    const imageRatio = imageWidth / imageHeight;
    const containerRatio = containerWidth / containerHeight;

    let width = containerWidth;
    let height = containerHeight;
    let x = 0;
    let y = 0;

    if (imageRatio > containerRatio) {
        width = containerWidth;
        height = containerWidth / imageRatio;
        y = (containerHeight - height) / 2;
    } else {
        height = containerHeight;
        width = containerHeight * imageRatio;
        x = (containerWidth - width) / 2;
    }

    return { x, y, width, height };
};

export function EditorImage() {
    const imageData = useRecoilValue(imageDataState);
    const [, setImageBounds] = useRecoilState(imageBoundsState);
    const [, setAccumulatedPan] = useRecoilState(accumulatedPanState);
    const [, setCropSize] = useRecoilState(cropSizeState);
    const [, setImageReady] = useRecoilState(imageReadyState);

    const onContainerLayout = React.useCallback(
        (e: LayoutChangeEvent) => {
            const { width: containerWidth, height: containerHeight } = e.nativeEvent.layout;

            if (!imageData?.width || !imageData?.height) {
                return;
            }

            const rect = getContainedImageRect({
                containerWidth,
                containerHeight,
                imageWidth: imageData.width,
                imageHeight: imageData.height,
            });

            setImageBounds(rect);
            setAccumulatedPan({ x: rect.x, y: rect.y });
            setCropSize({ width: rect.width, height: rect.height });
            setImageReady(true);
        },
        [imageData, setImageBounds, setAccumulatedPan, setCropSize, setImageReady]
    );

    React.useEffect(() => {
        setImageReady(false);
    }, [imageData?.uri, setImageReady]);

    return (
        <View style={styles.container} onLayout={onContainerLayout}>
            <Image
                key={imageData.uri}
                source={{ uri: imageData.uri }}
                style={styles.image}
                resizeMode="contain"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    image: {
        width: "100%",
        height: "100%",
    },
});
