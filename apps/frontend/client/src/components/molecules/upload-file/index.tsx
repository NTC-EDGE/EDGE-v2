import React, {FC, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  Platform,
  TouchableWithoutFeedback,
  Image,
  Modal, Animated, Pressable,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import Slider from '@react-native-community/slider';

import Cropper from 'react-easy-crop';
import FileViewer from 'react-native-file-viewer';
import Button from '@atoms/button';
import { AnimatedModal } from '@atoms/modals';
import { Upload, Close, FileAdd } from '@atoms/icon';
import Text from '@atoms/text';
import { defaultColor, disabledColor, infoColor } from '@styles/color';
import { NTCPreview } from '@utils/ntc';
import styles from './styles';
import {getCroppedImg, isMobile, urlToBlob, urlToDataURL} from '@utils/formatting';
import { RootStateOrAny, useSelector } from 'react-redux';
import {CropIcon, X} from "lucide-react-native";
import UploadProgressBar from "@atoms/upload-progress-bar";
import {AnimatePresence, MotiView} from "moti";
import stylesCrop from "@molecules/upload-file/stylesCrop";

interface Props {
  onUpload?: (file: any) => void;
  onRemove?: (index: number) => void;
  defaultFile?: any;
  defaultFiles?: any[];
  uploading?: boolean;
  uploaded?: boolean;
  disabled?: boolean;
  uploadText?: string;
  raw?: boolean;
  photoOnly?: boolean;
  image?: any;
  isCrop?: any;
}
const UploadFile: FC<Props> = ({
                                 photoOnly = false,
                                 raw = false,
                                 onUpload = () => {},
                                 onRemove = () => {},
                                 uploadText = 'Upload a file..',
                                 disabled = false,
                                 defaultFile,
                                 defaultFiles = [],
                                 uploading = false,
                                 uploaded = false,
                                 image = "",
                                 isCrop = false
                               }) => {


  const [modalVisible, setModalVisible] = useState(false);
  const [modalFile, setModalFile] = useState<any>({});
  const [file, setFile] = useState<any>(defaultFile);
  const [files, setFiles] = useState<any[]>(defaultFiles);
  const [visible, setVisible] = useState(false);
  const { serviceLayout } = useSelector((state: RootStateOrAny) => state.service);
  const multipleFiles = defaultFiles.length > 0;
  const stylesMemo = useMemo(() => styles, []);

  const [webImageUri, setWebImageUri] = useState<string>(image);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>();
  const [rotation, setRotation] = useState<any>(0);
  const [minZoom, setMinZoom] = useState(1);
  const cropSize = { width: 280, height: 280 }; // 1:1 square

  const handleMediaLoaded = useCallback(({ naturalWidth, naturalHeight }) => {
    // Make sure image fully covers the crop area
    const mz = Math.max(cropSize.width / naturalWidth, cropSize.height / naturalHeight);
    setMinZoom(mz);
    if (zoom < mz) setZoom(mz);
  }, [zoom]);

  const onCropComplete = useCallback((_, px) => {
    setCroppedAreaPixels(px);
  }, []);

  const _onUpload = useCallback((newFile: any, isCropped = false) => {
    const fileCopy = { ...newFile };
    delete fileCopy.type;

    if (multipleFiles) {
      setFiles(prevFiles => {
        const updatedFiles = [...prevFiles, fileCopy].map((f, idx) => ({
          ...f,
          index: idx
        }));
        return updatedFiles;
      });
    } else {
      setFile(fileCopy);
    }

    onUpload(fileCopy, isCropped);
  }, [multipleFiles, onUpload]);

  const _finalizeUpload = useCallback(async (uri: string, isCropped = false) => {
    let fileType = 'image/jpeg';
    let finalUri = uri;

    // Fetch the underlying blob once to extract MIME type and for data URI conversion
    // This avoids double-fetching or double-converting for the same URI.
    // Local URIs: fetch blob once to extract type and convert to Data URI if necessary
    if (uri.startsWith('blob:') || uri.startsWith('data:')) {
      try {
        const blob = await urlToBlob(uri);
        fileType = blob.type || fileType;
        // On Native, we MUST use data URIs for reliable image display and upload.
        // Re-using the blob we already fetched to avoid a redundant second fetch inside urlToDataURL.
        finalUri = await urlToDataURL(blob);
      } catch (e) {
        console.warn('Bolt: Failed to process local URI', e);
      }
    }
    // HTTP URLs: fetch and blobify
    else if (uri.startsWith('http')) {
      try {
        const resp = await fetch(uri, { mode: 'cors' });
        const blob = await resp.blob();
        fileType = blob.type || fileType;
        finalUri = URL.createObjectURL(blob);
      } catch (e) {
        console.warn('Failed to fetch remote URL', e);
        finalUri = uri;
      }
    }

    // Generate a filename
    const ext = fileType.split('/')[1] || 'jpeg';
    const name = `upload.${ext}`;

    _onUpload({ uri: finalUri, name, type: fileType, mimeType: fileType }, isCropped);
  }, [_onUpload]);


  const _onUploadPhoto = async (isTakePhoto = false) => {
    const opts = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: Platform.OS !== 'web',
      aspect: [1, 1],
      quality: 1,
      presentationStyle: 0,
    };
    const result = isTakePhoto
        ? await ImagePicker.launchCameraAsync(opts)
        : await ImagePicker.launchImageLibraryAsync(opts);

    if (!result.cancelled) {
      if (Platform.OS === 'web') {
        setWebImageUri(result.uri);
        setShowCropper(true);
        return;
      }
      _finalizeUpload(result.uri);
    }
  };

  const _onUpload = (newFile: any, isCropped = false) => {
    const fileCopy = { ...newFile };
    delete fileCopy.type;

    if (multipleFiles) {
      const updatedFiles = [...files, fileCopy].map((f, idx) => ({
        ...f,
        index: idx
      }));
      setFiles(updatedFiles);
    } else {
      setFile(fileCopy);
    }

    onUpload(fileCopy, isCropped);
  };

  const _onUploadFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: false,
      //multiple: true
    });
    if (res.type !== 'cancel') {
      setVisible(false);
      // var convert = convertJson(res)
      // convert.forEach(c => _onUpload(c))
      _onUpload(res)
    }
  };

  const _onPreview = (uri: string) => {
    const path = uri.replace('file://', '');
    FileViewer.open(path).catch(() => {});
  };

  const renderSelection = () => {
    const options: any[] = [
      {
        label: 'Upload a photo',
        icon: () => <Upload size={20} style={stylesMemo.selectionIcon} />,
        onPress: () => _onUploadPhoto(false),
      },
      { label: 'Cancel', onPress: () => setVisible(false) },
    ];
    if (!photoOnly) {
      options.splice(1, 0, {
        label: 'Upload a file',
        icon: () => <FileAdd size={20} style={stylesMemo.selectionIcon} />,
        onPress: _onUploadFile,
      });
    }

    return (
        <AnimatedModal visible={visible} onDismiss={() => setVisible(false)}>
          <FlatList
              data={options}
              renderItem={({ item }) => (
                  <TouchableOpacity onPress={item.onPress}>
                    <View style={stylesMemo.selectionRow}>
                      {item?.icon?.()}
                      <Text style={stylesMemo.selectionText}>{item.label}</Text>
                    </View>
                  </TouchableOpacity>
              )}
              keyExtractor={(_, idx) => idx.toString()}
              ItemSeparatorComponent={() => <View style={stylesMemo.selectionSeparator} />}
          />
        </AnimatedModal>
    );
  };
  const [thumbLayout, setThumbLayout] = useState<{x:number;y:number;width:number;height:number} | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewImage, setPreviewImage] = useState("");
  const ImagePreview  = () => {
    return <Modal
        visible={previewVisible}
        transparent
        animationType="none"    // we’ll animate with Moti instead
        onRequestClose={() => setPreviewVisible(false)}
    >
      <AnimatePresence>
        {previewVisible && (
            <View style={styles.fill}>
              {/* Backdrop */}
              <Pressable style={styles.fill} onPress={() => setPreviewVisible(false)}>
                <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'timing', duration: 180 }}
                    style={[styles.fill, styles.backdrop]}
                />
              </Pressable>

              {/* Image container */}
              <MotiView
                  from={{ opacity: 0, scale: 0.96, translateY: 12 }}
                  animate={{ opacity: 1, scale: 1, translateY: 0 }}
                  exit={{ opacity: 0, scale: 0.96, translateY: 12 }}
                  transition={{ type: 'timing', duration: 200 }}
                  style={styles.centerWrap}
              >
                <View style={styles.imageCard}>
                  <Image
                      source={{ uri: previewImage }}
                      style={styles.image}
                      resizeMode="contain"
                  />
                </View>

                {/* Floating Close Button */}
                <Pressable onPress={() => setPreviewVisible(false)} style={styles.closeBtn} hitSlop={10}>
                  {/* If you don't use lucide-react-native, replace with a simple Text: */}
                  {/* <Text style={{color:'#fff', fontSize:16}}>Close</Text> */}
                  <X size={20} color="#fff" />
                </Pressable>
              </MotiView>
            </View>
        )}
      </AnimatePresence>
    </Modal>
  }

  const renderItem = (_file: any, _index: number) => {
    const isUploading = multipleFiles ? (_file?.uploading ?? uploading) : uploading;
    const isUploaded = multipleFiles ? (_file?.uploaded ?? uploaded): uploaded;


    const name = _file?.name ?? _file?.assets?.[0]?.name;

    if (!name) return null;
    const truncated = (s: string, len: number) =>
        s.length > len ? s.slice(0, len - 1) + '…' : s;
    const previewType = NTCPreview(name);


    const cardKey = _file?.id ?? _file?.name ?? String(_index);

    const previewUri =
        previewType === "image"
            ? "https://requirement.ntcedge2.workers.dev/?" + (_file?.links?.small ?? _file?.assets?.[_index ?? 0]?.uri)
            : undefined;



    return (

        <View key={_index} style={stylesMemo.card}>
          {/* Left: thumbnail */}
          <Pressable
              android_ripple={{ color: "rgba(0,0,0,0.06)", borderless: false }}
              onPress={() => {
                setPreviewIndex(_index);
                setPreviewImage(previewUri);
                (isMobile ? _onPreview(_file?.uri) : (previewUri ? setPreviewVisible(true) : null))}
              }
              disabled={disabled}
              style={stylesMemo.thumbWrap}
          >
            <ImageBackground
                onLayout={e => setThumbLayout(e.nativeEvent.layout)}
                style={stylesMemo.thumb}
                imageStyle={stylesMemo.thumbImg}
                source={
                  previewType === "image"
                      ? { uri: "https://requirement.ntcedge2.workers.dev/?" + (_file?.links?.small ?? _file?.assets?.[0]?.uri) }
                      : previewType
                }
            >
              {/* remove button */}
              <Pressable
                  onPress={() => {
                    if (multipleFiles) {
                      const newFiles = [...files];
                      newFiles.splice(_index, 1);
                      setFiles(newFiles);
                    } else {
                      setFile({});
                    }
                    onRemove(_index);
                  }}
                  disabled={disabled}
                  hitSlop={10}
                  style={stylesMemo.closeBtn}
              >
                <View style={stylesMemo.closePill}>
                  <Close size={16} color="#fff" />
                </View>
              </Pressable>
            </ImageBackground>
          </Pressable>

          <View style={stylesMemo.meta}>
            <Text
                style={stylesMemo.name}
                numberOfLines={1}
                accessibilityLabel={`File name ${name}`}
            >
              {Platform.select({ web: truncated(name, 20), native: name })}
            </Text>

            {!isUploading && isUploaded ? (
                <MotiView
                    key="uploaded-badge"
                    from={{ opacity: 0, scale: 0.85, translateY: 6 }}
                    animate={{ opacity: 1, scale: 1, translateY: 0 }}
                    exit={{ opacity: 0, scale: 0.95, translateY: -4 }}
                    transition={{ type: 'spring', damping: 18, stiffness: 240 }}
                    style={[stylesMemo.badgeSuccess, styles.relative]}
                >
                  {/* subtle pulse halo */}
                  <MotiView
                      from={{ opacity: 0.35, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.45 }}
                      transition={{ type: 'timing', duration: 900, loop: true }}
                      pointerEvents="none"
                      style={styles.halo}
                  />

                  <Text style={stylesMemo.badgeText}>Uploaded</Text>
                </MotiView>
            ) : null}

            {(isUploading) && (
                <View style={{ marginTop: 8 }}>
                  <UploadProgressBar
                      // burst from the thumbnail's top-right when finished
                      originInParent={
                        thumbLayout
                            ? { x: thumbLayout.x + thumbLayout.width, y: thumbLayout.y }
                            : { x: 20, y: -10 }
                      }
                  />
                </View>
            )}
          </View>


          {!(_file?.links?.small || _file?.assets?.[0]?.uri) && (
              <Pressable
                  style={stylesMemo.iconBtn}
                  onPress={() => {
                    if (multipleFiles) {
                      const newFiles = [...files];
                      newFiles.splice(_index, 1);
                      setFiles(newFiles);
                    } else {
                      setFile({});
                    }
                    onRemove(_index);
                  }}
                  disabled={disabled}
                  android_ripple={{ color: "rgba(0,0,0,0.06)", borderless: true }}
              >
                <Close color={disabled ? disabledColor : defaultColor} size={18} />
              </Pressable>
          )}
        </View>
    );
  };

  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (showCropper) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0.8);
    }
  }, [showCropper]);

  const onConfirm = useCallback(async () => {
    const croppedUrl = await getCroppedImg(image, croppedAreaPixels);
    setShowCropper(false);
    _finalizeUpload(croppedUrl, true);
  }, [image, croppedAreaPixels, _finalizeUpload]);

  return (
      <View style={!raw && stylesMemo.container}>
        <View >
          <Button
              style={[styles.uploadContainer, raw && { backgroundColor: undefined }]}
              onPress={() => {
                if (isMobile) setVisible(true);
                else _onUploadFile();
              }}
              disabled={disabled}
          >
            <Upload
                color={disabled ? disabledColor : raw ? infoColor : defaultColor}
                size={15}
            />
            <Text style={[styles.uploadText, disabled && styles.disabledText]}>
              {uploadText}
            </Text>
          </Button>
          {
            isCrop ? <Button
                style={[styles.uploadContainer, raw && { backgroundColor: undefined }]}
                onPress={() => {
                  if (isMobile) setVisible(true);
                  else setShowCropper(true);
                }}
                disabled={disabled}
            >
              <CropIcon
                  color={disabled ? disabledColor : raw ? infoColor : defaultColor}
                  size={15}
              />
              <Text style={[styles.uploadText, disabled && styles.disabledText]}>
                Crop
              </Text>
            </Button> : null
          }

        </View>




        {!raw && !multipleFiles && renderItem(file, -1)}
        {!raw && multipleFiles && (
            <FlatList
                horizontal={Platform.select({ web: true, native: false })}
                data={defaultFiles}
                renderItem={({ item, index }) => renderItem(item, index)}
                keyExtractor={(_, idx) => idx.toString()}

                ItemSeparatorComponent={() => <View style={stylesMemo.separator} />}
            />
        )}

        {renderSelection()}

        {Platform.OS === 'web' && image && (
            <Modal transparent animationType="fade" visible={showCropper}>
              <View style={stylesCrop.backdrop}>
                <Animated.View style={[stylesCrop.card, { transform: [{ scale: scaleAnim }] }]}>
                  <Text style={stylesCrop.header}>🖼️ Crop Your Photo</Text>

                  <View style={stylesCrop.cropperContainer}>
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={1}
                        cropSize={cropSize}
                        minZoom={minZoom}
                        maxZoom={10}
                        restrictPosition={false}
                        objectFit="cover"
                        onMediaLoaded={handleMediaLoaded}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                  </View>

                  <View style={stylesCrop.controlsRow}>
                    <Text>Zoom</Text>
                    <Slider
                        style={stylesCrop.slider}
                        minimumValue={minZoom}
                        maximumValue={10}
                        step={0.01}
                        value={zoom}
                        onValueChange={setZoom}
                    />
                  </View>

                  <View style={stylesCrop.controlsRow}>
                    <Text>Rotate</Text>
                    <Slider
                        style={stylesCrop.slider}
                        minimumValue={0}
                        maximumValue={360}
                        step={1}
                        value={rotation}
                        onValueChange={setRotation}
                    />
                  </View>

                  <View style={stylesCrop.buttonRow}>
                    <TouchableOpacity onPress={() => setShowCropper(false)} style={[stylesCrop.button, stylesCrop.btnCancel]} activeOpacity={0.8}>
                      <Text style={stylesCrop.btnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onConfirm} style={[stylesCrop.button, stylesCrop.btnConfirm]} activeOpacity={0.8}>
                      <Text style={[stylesCrop.btnText, { color: '#fff' }]}>Confirm</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              </View>
            </Modal>
        )}

        <ImagePreview/>
      </View>
  );
};

export default React.memo(UploadFile);
