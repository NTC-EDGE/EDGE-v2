import * as React from "react";
import { View, Text, StyleSheet, Alert, Platform } from "react-native";
import { useRecoilState } from "recoil";
import { imageDataState, processingState, editingModeState } from "../Store";
import { IconButton } from "../components/IconButton";
import { useCallback } from "react";
import { REMOVE_BACKGROUND_BASE_URL } from "@services/config";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { urlToDataURL } from "@utils/formatting";

export function RemoveBg() {
    const [imageData, setImageData] = useRecoilState(imageDataState);
    const [, setEditingMode] = useRecoilState(editingModeState);
    const [processing, setProcessing] = useRecoilState(processingState);

    const onRun = useCallback(async () => {
        try {
            if (!imageData?.uri) {
                Alert.alert("Error", "No image selected");
                return;
            }

            setProcessing(true);

            // Fetch base64 from image URI for server payload.
            // urlToDataURL returns the Data URL prefix; we strip it as most APIs expect raw base64.
            const dataUrl = await urlToDataURL(imageData.uri);
            const imageBase64 = dataUrl.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");

            const response = await fetch(
                `${REMOVE_BACKGROUND_BASE_URL}/remove-background`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        imageBase64,
                        fileName: `remove-bg-${Date.now()}.png`,
                    }),
                }
            );

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || "Background removal failed");
            }

            const blob = await response.blob();
            // Refactored response handling to use async/await and urlToDataURL for cleaner flow

            if (Platform.OS === "web") {
                setImageData({
                    uri: dataUrl,
                    width: imageData.width,
                    height: imageData.height,
                });
            } else {
                const base64 = dataUrl.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");
                const fileUri = `${FileSystem.cacheDirectory}remove-bg-${Date.now()}.png`;

                await FileSystem.writeAsStringAsync(fileUri, base64, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                setImageData({
                    uri: fileUri,
                    width: imageData.width,
                    height: imageData.height,
                });
            }

            setEditingMode("operation-select");
        } catch (error: any) {
            console.log("RemoveBg error:", error);
            Alert.alert("Error", error?.message || "Background removal failed");
        } finally {
            setProcessing(false);
        }
    }, [imageData, setEditingMode, setImageData, setProcessing]);

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <IconButton
                    iconID="close"
                    text="Cancel"
                    onPress={() => setEditingMode("operation-select")}
                    disabled={processing}
                />
                <Text style={styles.prompt}>Remove background</Text>
                <IconButton
                    iconID="check"
                    text={processing ? "Running..." : "Run"}
                    onPress={onRun}
                    disabled={processing}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "flex-end" },
    row: {
        width: "100%",
        height: 80,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: "2%",
    },
    prompt: {
        color: "#fff",
        fontSize: 18,
        textAlign: "center",
    },
});
