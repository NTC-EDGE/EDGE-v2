import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import {
	View,
	TouchableOpacity,
	FlatList,
	ImageBackground,
	Platform,
	TouchableWithoutFeedback,
	Image,
	Modal,
	Animated,
	Pressable,
	Alert,
} from "react-native";

import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

import FileViewer from "react-native-file-viewer";
import Webcam from "react-webcam";

import Button from "@atoms/button";
import { AnimatedModal } from "@atoms/modals";
import { Upload, Close } from "@atoms/icon";
import Text from "@atoms/text";
import { defaultColor, disabledColor, infoColor } from "@styles/color";
import { NTCPreview } from "@utils/ntc";
import styles from "./styles";
import { urlToBlob, urlToDataURL } from "@utils/formatting";
import { RootStateOrAny, useSelector } from "react-redux";
import {CropIcon, FilePlus, X} from "lucide-react-native";
import UploadProgressBar from "@atoms/upload-progress-bar";
import { AnimatePresence, MotiView } from "moti";
import FileAdd from "@atoms/icon/file-add";
import {ImageEditor} from "../../../imageEditor";
interface Props {
	onUpload?: (file: any, isCropped?: boolean) => void;
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
	isCrop?: boolean;
}

const UploadFile: FC<Props> = ({
								   photoOnly = false,
								   raw = false,
								   onUpload = () => {},
								   onRemove = () => {},
								   uploadText = "Upload a file..",
								   disabled = false,
								   defaultFile,
								   defaultFiles = [],
								   uploading = false,
								   uploaded = false,
								   image = "",
								   isCrop = false,
							   }) => {
	// Webcam (web only)
	const [webcamVisible, setWebcamVisible] = useState(false);
	const webcamRef = useRef<any>(null);
	const [webcamFacingMode, setWebcamFacingMode] = useState<"user" | "environment">("environment");

	const [modalVisible, setModalVisible] = useState(false);
	const [modalFile, setModalFile] = useState<any>({});
	const [file, setFile] = useState<any>(defaultFile);
	const [files, setFiles] = useState<any[]>(defaultFiles);
	const [visible, setVisible] = useState(false);
	const { serviceLayout } = useSelector((state: RootStateOrAny) => state.service);

	const multipleFiles = defaultFiles.length > 0;
	const stylesMemo = useMemo(() => styles, []);

	// Used for preview fallback and convenience
	const [webImageUri, setWebImageUri] = useState<string>(image);

	// ✅ expo-image-crop-editor state
	const [editorVisible, setEditorVisible] = useState(false);
	const [editorUri, setEditorUri] = useState<string | undefined>(undefined);

	const openEditor = (uri: string) => {
		setEditorUri(uri);
		setEditorVisible(true);
	};

	const _onUpload = (newFile: any, isCropped = false) => {
		const fileCopy = { ...newFile };
		delete fileCopy.type;

		if (multipleFiles) {
			const updatedFiles = [...files, fileCopy].map((f, idx) => ({ ...f, index: idx }));
			setFiles(updatedFiles);
		} else {
			setFile(fileCopy);
		}

		onUpload(fileCopy, isCropped);
	};

	const _finalizeUpload = async (uri: string, isCropped = false) => {
		let fileType = "image/jpeg";
		let finalUri = uri;

		// Blob URLs: convert to safe data URI
		if (uri.startsWith("blob:")) {
			try {
				finalUri = await urlToDataURL(uri);
				const blob = await urlToBlob(uri);
				fileType = blob.type || fileType;
			} catch (e) {
				console.warn("Failed to convert blob to data URI", e);
			}
		} else if (uri.startsWith("data:")) {
			// Data URIs: extract MIME
			try {
				const blob = await urlToBlob(uri);
				fileType = blob.type || fileType;
			} catch (e) {
				console.warn("Failed to process data URI", e);
			}
		} else if (uri.startsWith("http")) {
			// HTTP URLs: fetch and blobify
			try {
				const resp = await fetch(uri, { mode: "cors" as any });
				const blob = await resp.blob();
				fileType = blob.type || fileType;
				finalUri = URL.createObjectURL(blob);
			} catch (e) {
				console.warn("Failed to fetch remote URL", e);
				finalUri = uri;
			}
		}

		const ext = fileType.split("/")[1] || "jpeg";
		const name = `upload.${ext}`;

		_onUpload({ uri: finalUri, name, type: fileType, mimeType: fileType }, isCropped);
	};

	// ✅ Unified photo pick flow (web + native) — open editor if isCrop
	const _onUploadPhoto = async (isTakePhoto = false) => {
		// Permissions: required on native; on web it usually resolves ok
		const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (!perm.granted && Platform.OS !== "web") {
			Alert.alert("Permission needed", "Please enable photo library access.");
			return;
		}

		const opts: ImagePicker.ImagePickerOptions = {
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: false, // ❗ we use ImageEditor instead
			quality: 1,
		};

		const result = isTakePhoto
			? await ImagePicker.launchCameraAsync(opts)
			: await ImagePicker.launchImageLibraryAsync(opts);

		if (result.canceled) return;

		const uri = result.assets?.[0]?.uri;
		if (!uri) return;

		setVisible(false);
		setWebImageUri(uri);

		if (isCrop) {
			openEditor(uri);
			return;
		}

		_finalizeUpload(uri, false);
	};

	const _onPreview = (uri: string) => {
		const path = uri.replace("file://", "");
		FileViewer.open(path).catch(() => {});
	};

	// Optional: web camera file input
	const openWebCameraFileInput = () => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = "image/*";
		(input as any).capture = "environment";

		input.onchange = () => {
			const f = input.files?.[0];
			if (!f) return;

			const blobUrl = URL.createObjectURL(f);
			setWebImageUri(blobUrl);

			if (isCrop) {
				openEditor(blobUrl);
				return;
			}

			_finalizeUpload(blobUrl);
		};

		input.click();
	};

	const isImageFile = (name?: string, mimeType?: string) => {
		const mt = (mimeType || "").toLowerCase();
		if (mt.startsWith("image/")) return true;

		const ext = (name || "").split(".").pop()?.toLowerCase();
		return ["jpg", "jpeg", "png", "webp", "heic", "heif"].includes(ext ?? "");
	};

	const _onUploadFile = async () => {
		const res = await DocumentPicker.getDocumentAsync({
			type: "*/*",
			copyToCacheDirectory: false,
		});

		// new API often returns { canceled: boolean, assets: [...] }
		if ((res as any).canceled) return;

		setVisible(false);

		const uri = (res as any)?.uri ?? (res as any)?.assets?.[0]?.uri;
		const name = (res as any).name ?? (res as any)?.assets?.[0]?.name;
		const mimeType = (res as any).mimeType ?? (res as any)?.assets?.[0]?.mimeType;

		if (!uri) return;

		const pickedIsImage = isImageFile(name, mimeType);

		if (pickedIsImage) {
			setWebImageUri(uri);
			if (isCrop) {
				openEditor(uri);
				return;
			}
			_finalizeUpload(uri, false);
			return;
		}

		// Non-image => normal upload
		_onUpload(res, false);
	};

	const renderSelection = () => {
		const options: any[] = [
			{
				label: "Upload a photo",
				icon: () => <Upload size={20} style={stylesMemo.selectionIcon} />,
				onPress: () => {
					setVisible(false);
					_onUploadPhoto(false);
				},
			}
			/*,
			{
				label: "Take a photo",
				icon: () => <Upload size={20} style={stylesMemo.selectionIcon} />,
				onPress: async () => {
					setVisible(false);
					if (Platform.OS === "web") {
						setWebcamVisible(true);
						return;
					}
					setTimeout(() => _onUploadPhoto(true), 150);
				},
			},*/
		];

		if (!photoOnly) {
			options.push({
				label: "Upload a file",
				icon: () => <FilePlus size={20} style={stylesMemo.selectionIcon} />,
				onPress: async () => {
					setVisible(false);
					await _onUploadFile();
				},
			});
		}

		options.push({ label: "Cancel", onPress: () => setVisible(false) });

		return (
			<AnimatedModal
				visible={visible}
				onDismiss={() => setVisible(false)}
				// remove any default white panel background
				containerStyle={{
					backgroundColor: "transparent",
					padding: 0,
				}}
			>
				<View
					style={{
						alignSelf: "center",
						width: "92%",
						maxWidth: 460,
						backgroundColor: "#fff",
						borderRadius: 16,
						paddingVertical: 10,
						paddingHorizontal: 14,
						...(Platform.OS === "web"
							? ({ boxShadow: "0 12px 40px rgba(0,0,0,0.18)" } as any)
							: {}),
					}}
				>
					<FlatList
						data={options}
						keyExtractor={(_, idx) => idx.toString()}
						style={{ flexGrow: 0 }}          // ✅ prevents tall empty space
						contentContainerStyle={{ paddingVertical: 4 }}
						scrollEnabled={false}
						renderItem={({ item }) => (
							<TouchableOpacity onPress={item.onPress} activeOpacity={0.85}>
								<View
									style={[
										stylesMemo.selectionRow,
										{ paddingVertical: 12, paddingHorizontal: 8, borderRadius: 12 },
									]}
								>
									{item?.icon?.()}
									<Text style={stylesMemo.selectionText}>{item.label}</Text>
								</View>
							</TouchableOpacity>
						)}
						ItemSeparatorComponent={() => (
							<View style={[stylesMemo.selectionSeparator, { marginVertical: 6 }]} />
						)}
					/>
				</View>
			</AnimatedModal>
		);
	};
	const [thumbLayout, setThumbLayout] = useState<{ x: number; y: number; width: number; height: number } | null>(
		null
	);
	const [previewVisible, setPreviewVisible] = useState(false);
	const [previewImage, setPreviewImage] = useState("");

	const ImagePreview = () => {
		return (
			<Modal visible={previewVisible} transparent animationType="none" onRequestClose={() => setPreviewVisible(false)}>
				<AnimatePresence>
					{previewVisible && (
						<View style={styles.fill}>
							<Pressable style={styles.fill} onPress={() => setPreviewVisible(false)}>
								<MotiView
									from={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ type: "timing", duration: 180 }}
									style={[styles.fill, styles.backdrop]}
								/>
							</Pressable>

							<MotiView
								from={{ opacity: 0, scale: 0.96, translateY: 12 }}
								animate={{ opacity: 1, scale: 1, translateY: 0 }}
								exit={{ opacity: 0, scale: 0.96, translateY: 12 }}
								transition={{ type: "timing", duration: 200 }}
								style={styles.centerWrap}
							>
								<View style={styles.imageCard}>
									<Image source={{ uri: previewImage }} style={styles.image} resizeMode="contain" />
								</View>

								<Pressable onPress={() => setPreviewVisible(false)} style={styles.closeBtn} hitSlop={10}>
									<X size={20} color="#fff" />
								</Pressable>
							</MotiView>
						</View>
					)}
				</AnimatePresence>
			</Modal>
		);
	};

	const renderItem = (_file: any, _index: number) => {
		const isUploading = multipleFiles ? (_file?.uploading ?? uploading) : uploading;
		const isUploaded = multipleFiles ? (_file?.uploaded ?? uploaded) : uploaded;

		const name = _file?.name ?? _file?.assets?.[0]?.name;
		if (!name) return null;

		const previewType = NTCPreview(name);
		const previewUri =
			previewType === "image" ? _file?.links?.small ?? _file?.assets?.[_index ?? 0]?.uri : undefined;

		return (
			<View key={_index} style={stylesMemo.card}>
				<Pressable
					android_ripple={{ color: "rgba(0,0,0,0.06)", borderless: false }}
					onPress={() => {
						setPreviewImage(previewUri);
						// native preview via file viewer (if you want), web uses modal
						Platform.OS !== "web" ? _onPreview(_file?.uri) : previewUri ? setPreviewVisible(true) : null;
					}}
					disabled={disabled}
					style={stylesMemo.thumbWrap}
				>
					<ImageBackground
						onLayout={(e) => setThumbLayout(e.nativeEvent.layout)}
						style={stylesMemo.thumb}
						imageStyle={stylesMemo.thumbImg}
						source={previewType === "image" ? { uri: previewUri } : previewType}
					>
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
					<Text style={stylesMemo.name} numberOfLines={1}>
						{name}
					</Text>

					{!isUploading && isUploaded ? (
						<MotiView
							key="uploaded-badge"
							from={{ opacity: 0, scale: 0.85, translateY: 6 }}
							animate={{ opacity: 1, scale: 1, translateY: 0 }}
							exit={{ opacity: 0, scale: 0.95, translateY: -4 }}
							transition={{ type: "spring", damping: 18, stiffness: 240 }}
							style={[stylesMemo.badgeSuccess, styles.relative]}
						>
							<MotiView
								from={{ opacity: 0.35, scale: 1 }}
								animate={{ opacity: 0, scale: 1.45 }}
								transition={{ type: "timing", duration: 900, loop: true }}
								pointerEvents="none"
								style={styles.halo}
							/>
							<Text style={stylesMemo.badgeText}>Uploaded</Text>
						</MotiView>
					) : null}

					{isUploading && (
						<View style={{ marginTop: 8 }}>
							<UploadProgressBar
								originInParent={thumbLayout ? { x: thumbLayout.x + thumbLayout.width, y: thumbLayout.y } : { x: 20, y: -10 }}
							/>
						</View>
					)}
				</View>
			</View>
		);
	};

	// (Optional) a little pop animation for editor open/close if you need it later
	const scaleAnim = useRef(new Animated.Value(0.98)).current;
	useEffect(() => {
		if (editorVisible) {
			Animated.spring(scaleAnim, { toValue: 1, friction: 7, useNativeDriver: true }).start();
		} else {
			scaleAnim.setValue(0.98);
		}
	}, [editorVisible]);

	return (
		<View style={!raw && stylesMemo.container}>
			<View>
				<Button
					style={[styles.uploadContainer, raw && { backgroundColor: undefined }]}
					onPress={() => setVisible(true)}
					disabled={disabled}
				>
					<Upload color={disabled ? disabledColor : raw ? infoColor : defaultColor} size={15} />
					<Text style={[styles.uploadText, disabled && styles.disabledText]}>{uploadText}</Text>
				</Button>


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

			{/* ✅ expo-image-crop-editor modal (web + native) */}
			{editorVisible ? <ImageEditor
				visible={editorVisible}
				imageUri={editorUri}
				onCloseEditor={() => setEditorVisible(false)}
				fixedCropAspectRatio={1} // square
				lockAspectRatio={true}
				minimumCropDimensions={{ width: 100, height: 100 }}
				mode="full"
				onEditingComplete={(result) => {
					setEditorVisible(false);
					const uri = (result as any)?.uri;
					if (!uri) return;
					setWebImageUri(uri);
					_finalizeUpload(uri, true);
				}}
			/> : null }

			{/* (kept) document preview modal */}
			<Modal transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
				<View style={{ flex: 1, alignItems: "flex-end" }}>
					<TouchableWithoutFeedback onPressOut={() => setModalVisible(false)}>
						<View
							style={{
								width: serviceLayout?.width,
								height: "100%",
								backgroundColor: "rgba(0,0,0,0.5)",
							}}
						/>
					</TouchableWithoutFeedback>

					<View style={{ width: serviceLayout?.width }}>
						<TouchableOpacity style={{ alignSelf: "flex-end", padding: 15 }} onPress={() => setModalVisible(false)}>
							<Text style={{ color: "#fff" }}>Close</Text>
						</TouchableOpacity>
					</View>

					<View
						style={{
							width: serviceLayout?.width,
							flex: 1,
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						{modalFile.preview === "image" ? (
							<Image
								style={{ width: serviceLayout.width * 0.8, height: serviceLayout.height * 0.8 }}
								resizeMode="contain"
								source={{ uri: modalFile.uri }}
							/>
						) : (
							<object data={modalFile.uri} style={{ width: serviceLayout.width, height: serviceLayout.height }}>
								<Text>Could not load document.</Text>
							</object>
						)}
					</View>
				</View>
			</Modal>

			{/* WEB webcam modal (kept) */}
			{webcamVisible ? (
				<Modal visible={webcamVisible} transparent animationType="fade" onRequestClose={() => setWebcamVisible(false)}>
					<View style={[styles.fill, { backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center" }]}>
						<View style={{ width: 360, maxWidth: "92%", borderRadius: 16, overflow: "hidden", backgroundColor: "#111" }}>
							<View style={{ width: "100%", aspectRatio: 1 }}>
								<Webcam
									ref={webcamRef}
									audio={false}
									screenshotFormat="image/jpeg"
									videoConstraints={{ facingMode: webcamFacingMode }}
									style={{ width: "100%", height: "100%", objectFit: "cover" as any }}
								/>
							</View>

							<View style={{ flexDirection: "row", gap: 10, padding: 12, justifyContent: "space-between" }}>
								<Pressable
									onPress={() => setWebcamFacingMode((prev) => (prev === "environment" ? "user" : "environment"))}
									style={{ paddingVertical: 10, paddingHorizontal: 12, backgroundColor: "#222", borderRadius: 10 }}
								>
									<Text style={{ color: "#fff" }}>Flip</Text>
								</Pressable>

								<Pressable
									onPress={() => {
										const dataUrl = webcamRef.current?.getScreenshot?.();
										if (!dataUrl) return;

										setWebImageUri(dataUrl);

										if (isCrop) {
											openEditor(dataUrl);
										} else {
											_finalizeUpload(dataUrl);
										}

										setWebcamVisible(false);
									}}
									style={{ paddingVertical: 10, paddingHorizontal: 12, backgroundColor: "#3b82f6", borderRadius: 10 }}
								>
									<Text style={{ color: "#fff" }}>Capture</Text>
								</Pressable>

								<Pressable
									onPress={() => setWebcamVisible(false)}
									style={{ paddingVertical: 10, paddingHorizontal: 12, backgroundColor: "#222", borderRadius: 10 }}
								>
									<Text style={{ color: "#fff" }}>Close</Text>
								</Pressable>
							</View>
						</View>
					</View>
				</Modal>
			) : null}

			<ImagePreview />
		</View>
	);
};

export default React.memo(UploadFile);
