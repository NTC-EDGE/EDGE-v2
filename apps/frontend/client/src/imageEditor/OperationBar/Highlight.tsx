import * as React from "react";
import { useCallback, useContext } from "react";
import { Alert, View, Text, StyleSheet } from "react-native";
import { useRecoilState } from "recoil";
import {
    editingModeState,
    highlightStrokesState,
    highlightBrushState,
    imageDataState,
} from "../Store";
import { IconButton } from "../components/IconButton";
import {EditorContext} from "../index";

export function Highlight() {
    const [, setEditingMode] = useRecoilState(editingModeState);
    const [strokes, setStrokes] = useRecoilState(highlightStrokesState);
    const [brush, setBrush] = useRecoilState(highlightBrushState);
    const [imageData, setImageData] = useRecoilState(imageDataState);
    const { captureRef } = useContext(EditorContext);

    const undo = () => setStrokes((p) => p.slice(0, -1));
    const clear = () => setStrokes([]);

    const onCancel = useCallback(() => {
        setStrokes([]);
        setEditingMode("operation-select");
    }, [setStrokes, setEditingMode]);

    const onDone = useCallback(async () => {
        try {
            if (!captureRef?.current) {
                throw new Error("Capture ref is missing");
            }

            const uri = await captureRef.current.capture();

            setTimeout(() => {
                setImageData({
                    uri,
                    width: imageData.width,
                    height: imageData.height,
                });
                setStrokes([]);
                setEditingMode("operation-select");
            }, 0);
        } catch (e) {
            console.log("Highlight save error:", e);
            Alert.alert("Error", "Failed to save highlight");
        }
    }, [captureRef, imageData, setImageData, setStrokes, setEditingMode]);

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <IconButton iconID="close" text="Cancel" onPress={onCancel} />
                <Text style={styles.prompt}>Highlight</Text>
                <IconButton iconID="check" text="Done" onPress={onDone} />
            </View>

            <View style={styles.row}>
                <IconButton iconID="undo" text="Undo" onPress={undo} disabled={!strokes.length} />
                <IconButton iconID="delete" text="Clear" onPress={clear} disabled={!strokes.length} />
                <IconButton
                    iconID="remove"
                    text="Thin"
                    onPress={() => setBrush((b) => ({ ...b, width: Math.max(6, b.width - 4) }))}
                />
                <IconButton
                    iconID="add"
                    text="Thick"
                    onPress={() => setBrush((b) => ({ ...b, width: Math.min(40, b.width + 4) }))}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "space-between" },
    row: {
        width: "100%",
        height: 80,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: "2%",
    },
    prompt: { color: "#fff", fontSize: 21, textAlign: "center" },
});
