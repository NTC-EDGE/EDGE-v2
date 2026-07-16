import * as React from "react";
import { StyleSheet, View, Text, StatusBar, Platform } from "react-native";
import * as ImageManipulator from "expo-image-manipulator";
import { RecoilRoot, useRecoilState } from "recoil";

import { ControlBar } from "./ControlBar";
import { EditingWindow } from "./EditingWindow";
import { Processing } from "./Processing";
import { OperationBar } from "./OperationBar/OperationBar";
import { UniversalModal } from "./UniversalModal";

import {
  processingState,
  imageDataState,
  editingModeState,
  readyState,
  ImageDimensions,
  cropAspectRatioState,
  cropLockAspectRatioState,
} from "./Store";

const noScroll = require("no-scroll");

type EditorContextType = {
  throttleBlur: boolean;
  minimumCropDimensions: ImageDimensions;
  fixedAspectRatio: number;
  lockAspectRatio: boolean;
  mode: Mode;
  captureRef: React.MutableRefObject<any | null>;
  onCloseEditor: () => void;
  onEditingComplete: (result: any) => void;
  allowedTransformOperations?: TransformOperations[];
  allowedAdjustmentOperations?: AdjustmentOperations[];
};

export const EditorContext = React.createContext<EditorContextType>({
  throttleBlur: true,
  captureRef: { current: null },
  minimumCropDimensions: {
    width: 0,
    height: 0,
  },
  fixedAspectRatio: 1.6,
  lockAspectRatio: false,
  mode: "full",
  onCloseEditor: () => {},
  onEditingComplete: () => {},
});

export type Mode = "full" | "crop-only";

export type TransformOperations = "crop" | "rotate" | "remove-bg";
export type AdjustmentOperations = "blur" | "highlight" ;
export type EditingOperations = TransformOperations | AdjustmentOperations;

export interface ImageEditorProps {
  visible: boolean;
  onCloseEditor: () => void;
  imageUri: string | undefined;
  fixedCropAspectRatio?: number;
  minimumCropDimensions?: {
    width: number;
    height: number;
  };
  onEditingComplete: (result: any) => void;
  lockAspectRatio?: boolean;
  throttleBlur?: boolean;
  mode?: Mode;
  allowedTransformOperations?: TransformOperations[];
  allowedAdjustmentOperations?: AdjustmentOperations[];
  asView?: boolean;
}

function ImageEditorCore(props: ImageEditorProps) {
  const {
    mode = "full",
    throttleBlur = true,
    minimumCropDimensions = { width: 0, height: 0 },
    fixedCropAspectRatio: fixedAspectRatio = 1.6,
    lockAspectRatio = false,
    allowedTransformOperations,
    allowedAdjustmentOperations,

  } = props;

  const [, setImageData] = useRecoilState(imageDataState);
  const [, setReady] = useRecoilState(readyState);
  const [, setEditingMode] = useRecoilState(editingModeState);
  const [, setCropAspectRatio] = useRecoilState(cropAspectRatioState);
  const [, setCropLockAspectRatio] = useRecoilState(cropLockAspectRatioState);
  const [, setProcessing] = useRecoilState(processingState);
  React.useEffect(() => {
    setCropAspectRatio(fixedAspectRatio);
    setCropLockAspectRatio(lockAspectRatio);
  }, [fixedAspectRatio, lockAspectRatio, props.visible, setCropAspectRatio, setCropLockAspectRatio]);

  React.useEffect(() => {
    let mounted = true;

    const initialise = async () => {
      if (!props.imageUri) {
        setReady(false);
        return;
      }

      setReady(false);

      try {
        const enableEditor = () => {
          if (!mounted) return;
          setReady(true);

          if (Platform.OS === "web") {
            noScroll.on();
          }
        };

        if (Platform.OS === "web") {
          const img = document.createElement("img");

          img.onload = () => {
            if (!mounted) return;

            setImageData({
              uri: props.imageUri ?? "",
              height: img.height,
              width: img.width,
            });

            enableEditor();
          };

          img.onerror = () => {
            if (!mounted) return;
            setReady(false);
          };

          img.src = props.imageUri;
        } else {
          const { width, height } = await ImageManipulator.manipulateAsync(
              props.imageUri,
              []
          );

          if (!mounted) return;

          setImageData({
            uri: props.imageUri,
            width,
            height,
          });

          enableEditor();
        }
      } catch (error) {
        console.log("ImageEditor initialise error:", error);
        if (mounted) {
          setReady(false);
        }
      }
    };

    initialise();

    return () => {
      mounted = false;
    };
  }, [props.imageUri, setImageData, setReady]);

  const onCloseEditor = React.useCallback(() => {
    if (Platform.OS === "web") {
      noScroll.off();
    }
    props.onCloseEditor();
  }, [props.onCloseEditor]);

  React.useEffect(() => {
    if (!props.visible) {
      setReady(false);
      setProcessing(false);
    }

    if (mode === "crop-only") {
      setEditingMode("crop");
    } else {
      setEditingMode("operation-select");
    }
  }, [props.visible, mode, setReady, setEditingMode, setProcessing]);
  const captureRef = React.useRef<any | null>(null);

  const contextValue = React.useMemo(() => ({
    mode,
    minimumCropDimensions,
    lockAspectRatio,
    fixedAspectRatio,
    throttleBlur,
    allowedTransformOperations,
    allowedAdjustmentOperations,
    onCloseEditor,
    onEditingComplete: props.onEditingComplete,
    captureRef
  }), [
    mode,
    minimumCropDimensions,
    lockAspectRatio,
    fixedAspectRatio,
    throttleBlur,
    allowedTransformOperations,
    allowedAdjustmentOperations,
    onCloseEditor,
    props.onEditingComplete,
    captureRef
  ]);

  return (
      <EditorContext.Provider value={contextValue as EditorContextType}>
        <StatusBar hidden={props.visible} />

        {props.asView ? (
            <ImageEditorView {...props} />
        ) : (
            <UniversalModal
                visible={props.visible}
                presentationStyle="fullScreen"
                statusBarTranslucent
            >
              <ImageEditorView {...props} />
            </UniversalModal>
        )}
      </EditorContext.Provider>
  );
}

export function ImageEditorView(props: ImageEditorProps) {
  const { mode = "full" } = props;

  const [ready] = useRecoilState(readyState);
  const [processing] = useRecoilState(processingState);


  if (props.imageUri === undefined) {
    return (
        <View style={[styles.container, styles.containerError, { backgroundColor: "black" }]}>
          <ControlBar />
          <Text style={styles.errorImageNotFoundText}>
            Impossible de charger l'image
          </Text>
        </View>
    );
  }

  return (
      <>
        {ready ? (
            <View style={styles.container}>
              <ControlBar />
              <EditingWindow />
              {mode === "full" ? <OperationBar /> : null}
            </View>
        ) : null}

        {processing ? <Processing /> : null}
      </>
  );
}

export function ImageEditor(props: ImageEditorProps) {
  return (
      <RecoilRoot>
        <ImageEditorCore {...props} />
      </RecoilRoot>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222",
  },
  containerError: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorImageNotFoundText: {
    color: "white",
  },
});
