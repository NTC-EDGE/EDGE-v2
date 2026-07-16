import React, { FC, useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { View, FlatList, TouchableOpacity, Alert, ActivityIndicator, Linking, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import Moment from 'moment';
import Text from '@atoms/text';
import { Dot, Check, Close, Load, License, Right, Download, ArrowDown, Exclamation } from '@atoms/icon';
import Button from '@atoms/button';
import Ellipsis from '@atoms/ellipsis';
import NTCAlert from '@atoms/alert';
import DropdownCard from '@organisms/dropdown-card';
import { button, infoColor, text } from '@styles/color';
import styles from './styles';

import { fetchApplications } from '@reducers/application/actions';
import { pay } from '@reducers/payment/actions';
import { GUEST_USER } from '@utils/ntc';

interface Props {
	navigation: any
	route: any,
	params: any
};

const { StorageAccessFramework } = FileSystem;

const RenderUpdate = React.memo(({
	action = '',
	buttonText = '',
	status = '',
	onPress = () => { },
	onDownload = () => { },
	inactive = false,
	hasDownloadble = false,
	index = -1,
	stylesMemo,
	downloading,
	downloadingIndex,
	downloadingFile,
	type = 'default',
}: any) => {
	let statusColor = () => {
		switch (status) {
			case 'Approved': return '#10B981';
			case 'Declined': return '#EF4444';
			default: return '#F59E0B';
		}
	};
	if (downloading) inactive = true;
	return (
		<View style={[stylesMemo.updateContainer, type !== 'approval' && { borderTopWidth: 1, borderTopColor: '#F1F5F9' }]}>
			<View style={stylesMemo.updateStatusContainer}>
				{type === 'approval' && (
					<View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: statusColor(), marginRight: 8 }} />
				)}
				<Text style={[stylesMemo.updateStatus, { color: type === 'approval' ? statusColor() : '#94A3B8' }]}>
					{action}
				</Text>
			</View>
			<View style={stylesMemo.buttonMainContainer}>
				{type === 'document' && inactive ? (
					<Text style={{ color: '#94A3B8', fontSize: 13, fontFamily: 'Bold', marginRight: 10 }}>
						Pending
					</Text>
				) : (
					<Button
						onPress={onPress}
						style={[
							stylesMemo.updateButtonContainer,
							inactive && { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', borderWidth: 1, shadowOpacity: 0, elevation: 0 },
							!inactive && { backgroundColor: '#2563EB', paddingVertical: 8, paddingHorizontal: 16 }
						]}
						disabled={inactive}
					>
						<View style={stylesMemo.updateButtonTextContainer}>
							<Text style={[stylesMemo.updateButtonText, inactive && { color: '#94A3B8' }]}>
								{buttonText}
							</Text>
						</View>
						<Right size={15} color={inactive ? '#94A3B8' : '#FFFFFF'} />
					</Button>
				)}
				{
					!!hasDownloadble &&
					<TouchableOpacity disabled={inactive} onPress={onDownload}>
						<View style={[stylesMemo.downloadIconContainer, {
							borderWidth: 1,
							borderColor: inactive ? '#E2E8F0' : '#E2E8F0',
							padding: 4,
							borderRadius: 6,
							backgroundColor: inactive ? '#F8FAFC' : '#FFFFFF',
							marginLeft: 8,
						}]}>
							{
								downloading &&
									index === downloadingIndex &&
									(
										(buttonText === 'OR' && downloadingFile === 'OR') ||
										(buttonText !== 'OR' && downloadingFile !== 'OR')
									)
									? <ActivityIndicator size='small' color={inactive ? '#94A3B8' : '#2563EB'} />
									: <Download size={14} color={inactive ? '#94A3B8' : '#64748B'} />
							}
						</View>
					</TouchableOpacity>
				}
			</View>
		</View>
	)
});

const Item = React.memo(({
	item,
	index,
	navigation,
	onDownload,
	setShowAlert,
	setAlertData,
	stylesMemo,
	downloading,
	downloadingIndex,
	downloadingFile,
}: any) => {
	let [isCollapsed, setIsCollapsed] = useState(false);
	let { createdAt, updatedAt, service = {}, approvalHistory = {}, paymentHistory = {}, document = '', orderOfPayment = {}, officialReceipt = {}, renew } = item;
	renew = !!renew ? renew : {};
	let { forRenewal } = renew;
	let OR = officialReceipt?.pdf;
	let OP = orderOfPayment?.pdf;

	let { label, isDirectProcess } = service?.applicationType || {};
	let numLines = isCollapsed ? { numberOfLines: 1 } : {};

	let onPreview = () => {
		navigation.navigate('Preview', { application: item });
	};

	let outputLabel = (applicationType: string, serviceCode: string) => {
		applicationType = (`${applicationType} ${service?.name}`)?.toLowerCase();
		if (serviceCode === 'service-22') return 'Receipt';
		else if (applicationType?.match('accreditation')) return 'Accreditation';
		else if (applicationType?.match('admission slip') || serviceCode === 'service-1') return 'Admission Slip';
		else if (applicationType?.match('certificate')) return 'Certificate';
		else if (applicationType?.match('license')) return 'License';
		else if (applicationType?.match('permit')) return 'Permit';
		return '';
	};
	let labelVar = (
		<View>
			<View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>

				<Text style={stylesMemo.dropdownTitleTxt} {...numLines}>{label}</Text>
				{(() => {
					const isBulk = Array.isArray(item?.service?.applicants) && item.service.applicants.length > 1;
					return (
						<View style={[stylesMemo.tagBadge, isBulk ? stylesMemo.tagBadgeBulk : stylesMemo.tagBadgeSingle, { marginLeft: 10, alignSelf: 'center' }]}>
							<Text style={[stylesMemo.tagText, isBulk ? stylesMemo.tagTextBulk : stylesMemo.tagTextSingle]}>
								{isBulk ? 'Bulk' : 'Single'}
							</Text>
						</View>
					);
				})()}
			</View>
			<Text style={stylesMemo.dropdownDescriptionTxt}>Submitted {Moment(createdAt).fromNow()}</Text>
		</View>
	);
	let onView = (_d: string) => Linking.openURL(`https://docs.google.com/gview?url=${_d}&embedded=true`);

	let _document = outputLabel(label, service?.serviceCode);

	let alert = () => {
		setAlertData({
			title: `Claim ${_document}`,
			message: "Please proceed to the selected region's physical branch."
		});
		setTimeout(() => {
			setShowAlert(true);
		}, 100);
	};

	const renderUpdate = (props: any) => (
		<RenderUpdate
			{...props}
			stylesMemo={stylesMemo}
			downloading={downloading}
			downloadingIndex={downloadingIndex}
			downloadingFile={downloadingFile}
		/>
	);

	return (
		<DropdownCard
			style={stylesMemo.dropdown}
			label={labelVar}
			onToggle={(val: boolean) => setIsCollapsed(val)}
		>
			{renderUpdate({
				action: approvalHistory?.action || 'for approval',
				buttonText: 'Preview',
				status: approvalHistory?.status,
				onPress: () => setTimeout(() => onPreview()),
				type: 'approval',
			})}
			{
				!isDirectProcess &&
				paymentHistory?.status !== 'Approved' &&
				renderUpdate({
					action: 'PAYMENT',
					buttonText: 'OP',
					status: 'Approved',
					onPress: () => onView(OR),
					onDownload: () => onDownload(OR || '', index, 'OR'),
					inactive: isDirectProcess
						? approvalHistory.status !== 'Approved'
						: item?.service?.serviceCode === 'service-21'
							? paymentHistory?.status !== 'Approved'
							: (paymentHistory?.status !== 'Approved' || !OR),
					hasDownloadble: true,
					index,
					type: 'payment',
				})
			}

			{
				!isDirectProcess &&
				paymentHistory?.status !== 'Approved' &&
				renderUpdate({
					action: 'PAYMENT',
					buttonText: 'OR',
					status: 'Approved',
					onPress: () => onView(OR),
					onDownload: () => onDownload(OR || '', index, 'OR'),
					inactive: isDirectProcess
						? approvalHistory.status !== 'Approved'
						: item?.service?.serviceCode === 'service-21'
							? paymentHistory?.status !== 'Approved'
							: (paymentHistory?.status !== 'Approved' || !OR),
					hasDownloadble: true,
					index,
					type: 'payment',
				})
			}
			{
				!isDirectProcess &&
				paymentHistory?.status !== 'Approved' &&
				renderUpdate({
					action: 'PAYMENT',
					buttonText: 'Official Payment',
					status: 'Approved',
					onPress: () => onView(OP),
					onDownload: () => onDownload(OP || '', index, 'OR'),
					inactive: isDirectProcess
						? approvalHistory.status !== 'Approved'
						: item?.service?.serviceCode === 'service-21'
							? paymentHistory?.status !== 'Approved'
							: (paymentHistory?.status !== 'Approved' || !OR),
					hasDownloadble: true,
					index,
					type: 'payment',
				})
			}
			{renderUpdate({
				action: _document,
				buttonText: 'View',
				status: 'Approved',
				onPress: () => {
					if (item?.service?.serviceCode === 'service-21') alert();
					else onView(document);
				},
				onDownload: () => {
					if (item?.service?.serviceCode === 'service-21') alert();
					else onDownload(document || '', index, _document);
				},
				inactive: isDirectProcess
					? approvalHistory.status !== 'Approved'
					: item?.service?.serviceCode === 'service-21'
						? paymentHistory?.status !== 'Approved'
						: (paymentHistory?.status !== 'Approved' || !document),
				hasDownloadble: true,
				index,
				type: 'document',
			})}
			{
				forRenewal &&
				renderUpdate({
					action: 'EXPIRING SOON',
					buttonText: 'Renew',
					status: 'Expiring',
					onPress: () => setTimeout(() => navigation.navigate('ApplicationSteps', { application: item, renew: true }), 100),
					type: 'approval',
				})
			}
		</DropdownCard>
	)
});

const Applications: FC<Props> = ({ navigation }) => {
	const dispatch = useDispatch();
	const stylesMemo = useMemo(() => {
		return styles;
	}, [])
	const [filepath, setFilepath] = useState('');
	const [downloadingFile, setDownloadingFile] = useState('');
	const [downloadingIndex, setDownloadingIndex] = useState(-1);
	const [downloading, setDownloading] = useState(false);
	const email = useSelector(state => state?.user?.session?.email);
	const stateApplication = useSelector(state => state?.application);
	const { list, page = 1, total = 0, fetchingApplications, paymentSuccess, saveApplicationSuccess } = stateApplication;

	const [showAlert, setShowAlert] = useState(false);
	const [alertData, setAlertData] = useState({});

	useEffect(() => {
		if (saveApplicationSuccess && list?.[0]?.editApplication) onRefresh();
	}, [saveApplicationSuccess]);

	useEffect(() => {
		if (email !== GUEST_USER?.email) {
			navigation.setOptions({
				tabBarLabel: ({ color }: any) => (
					<View style={stylesMemo.drawerItem}>
						<License style={stylesMemo.tabIcon} color={color} size={20} />
						<Text style={[stylesMemo.tabText, { color }]}>My Applications</Text>
						{false && <Dot style={stylesMemo.dot} size={5} color='red' />}
					</View>
				)
			});
		}
	}, []);
	// useEffect(() => {
	// 	if (filepath) {
	// 		onDownload();
	// 	}
	// }, [filepath]);

	const onRefresh = useCallback(() => {
		dispatch(fetchApplications());
	}, [dispatch]);

	const __onDownload = async (_document = '', index = -1, fileStr = '') => {

		// setDownloadingIndex(index);
		// setDownloading(true);

		const downloadPath = FileSystem.documentDirectory + (Platform.OS == 'android' ? '' : '');

		const saveAndroidFile = async (fileUri, fileName = 'File') => {
			try {
				const fileString = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });

				const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
				if (!permissions.granted) {
					return;
				}

				try {
					await StorageAccessFramework.createFileAsync(permissions.directoryUri, fileName, 'application/pdf')
						.then(async (uri) => {
							await FileSystem.writeAsStringAsync(uri, fileString, { encoding: FileSystem.EncodingType.Base64 });
							alert('Report Downloaded Successfully')
						})
						.catch((e) => {
						});
				} catch (e) {
					throw new Error(e);
				}

			} catch (err) {
			}
		};
		const saveIosFile = (fileUri) => {
			// your ios code
			// i use expo share module to save ios file
		}

		const ensureDirAsync = async (dir, intermediates = true) => {
			const props = await FileSystem.getInfoAsync(dir);
			if (props.exist && props.isDirectory) {
				return props;
			}
			let _ = await FileSystem.makeDirectoryAsync(dir, { intermediates });
			return await ensureDirAsync(dir, intermediates);
		};

		const downloadFile = async () => {
			if (Platform.OS == 'android') {
				const dir = ensureDirAsync(downloadPath);
			}

			let fileName = _document.split('/')?.pop();
			const downloadResumable = FileSystem.createDownloadResumable(
				_document,
				downloadPath + fileName,
				{},
				() => { }
			);

			try {
				const { uri } = await downloadResumable.downloadAsync();
				if (Platform.OS == 'android')
					saveAndroidFile(uri, fileName)
				else
					saveIosFile(uri);
			} catch (e) {
				console.error('download error:', e);
			}
		};

		downloadFile();
	};

	const _onDownload = (_document = '', index = -1, type = '') => {
		setDownloadingFile(type);
		const filename = _document?.split('/')?.pop();
		const localFile = `${RNFS.DocumentDirectoryPath}/${filename}`;
		const options = {
			fromUrl: _document,
			toFile: localFile,
		};
		const openFile = (_filepath: string) => {
			_filepath = _filepath?.replace('file://', '');
			FileViewer.open(_filepath)
				.then(() => { })
				.catch((error) => {
					Alert.alert('Alert', `Cannot show file preview. ${error?.message}`);
				});
		}
		setDownloadingIndex(index);
		setDownloading(true);
		RNFS
			.downloadFile(options)
			.promise
			.then(() => {
				setDownloading(false);
				// Alert.alert('File Downloaded', 'File is successfully downloaded! Please check your File Manager.');
			})
			.then(() => openFile(localFile))
			.catch((error) => {
				setDownloading(false);
				Alert.alert('Alert', `Cannot download file preview. ${error?.message}`);
			});
	};

	const onDownload = useCallback((_document = '') => Linking.openURL(_document), []);

	useEffect(() => {
		dispatch(fetchApplications());
	}, []);
	useEffect(() => {
		if (paymentSuccess) onRefresh();
	}, [paymentSuccess]);

	const renderItem = useCallback(({ item, index }: any) => {
		return (
			<Item
				item={item}
				index={index}
				navigation={navigation}
				onDownload={onDownload}
				setShowAlert={setShowAlert}
				setAlertData={setAlertData}
				stylesMemo={stylesMemo}
				downloading={downloading}
				downloadingIndex={downloadingIndex}
				downloadingFile={downloadingFile}
			/>
		);
	}, [navigation, onDownload, stylesMemo, downloading, downloadingIndex, downloadingFile]);

	const renderEmpty = useCallback(() => {
		if (fetchingApplications) return null;
		return (
			<View style={stylesMemo.emptyView}>
				<Text style={stylesMemo.emptyViewText}>
					No applications yet.
				</Text>
			</View>
		);
	}, [fetchingApplications, stylesMemo.emptyView, stylesMemo.emptyViewText]);

	const renderItemSeparator = useCallback(() => <View style={stylesMemo.separator} />, [stylesMemo.separator]);

	// Optimization: Memoize list footer to prevent re-renders on the JS thread
	const renderFooter = useCallback(() => (
		<View style={stylesMemo.bottomView}>
			{
				fetchingApplications &&
				<Ellipsis color={infoColor} size={10} />
			}
		</View>
	), [fetchingApplications, stylesMemo.bottomView, infoColor]);

	// Optimization: Memoize list header to prevent re-renders on the JS thread
	const renderHeader = useCallback(() => {
		if (fetchingApplications) return <></>;
		return (
			<View style={stylesMemo.refreshView}>
				<ArrowDown color={text?.disabled} size={12} />
				<Text style={stylesMemo.refreshText}>Pull to refresh</Text>
			</View>
		);
	}, [fetchingApplications, stylesMemo.refreshView, text?.disabled]);

	// Optimization: Use unique IDs for keyExtractor to improve list reconciliation performance
	const keyExtractor = useCallback((item: any) => (item?._id || item?.id)?.toString(), []);

	const onEndReached = useCallback(() => {
		if (list?.length < total) dispatch(fetchApplications({ page: page + 1 }));
	}, [list?.length, total, page, dispatch]);

	return (
		<>
			<NTCAlert
				visible={showAlert}
				title={alertData?.title || 'Alert'}
				message={alertData?.message}
				confirmText={alertData.button || 'OK'}
				onConfirm={() => setShowAlert(false)}
			/>
			<FlatList
				showsVerticalScrollIndicator={true}
				style={styles.flatlist}
				data={list}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				ItemSeparatorComponent={renderItemSeparator}
				ListEmptyComponent={renderEmpty}
				ListFooterComponent={renderFooter}
				ListHeaderComponent={renderHeader}
				onRefresh={onRefresh}
				refreshing={!!fetchingApplications}
				onEndReached={onEndReached}
				onEndReachedThreshold={0.9}
				initialNumToRender={10}
				maxToRenderPerBatch={10}
			/>
		</>
	);

}
export default React.memo(Applications);
