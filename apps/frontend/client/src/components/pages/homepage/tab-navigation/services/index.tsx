import React, {FC, useCallback, useMemo, useState} from 'react';
import { RootStateOrAny, useSelector } from 'react-redux';
import { FlatList, TouchableOpacity, View, Image, TextInput } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Text from '@atoms/text';
import { RadioTower } from '@atoms/icon';
import SearchIcon from '@assets/svg/search';
import ExaminationIcon from '@assets/svg/exam';
import PermitIcon from '@assets/svg/permit';
import LicenseIcon from '@assets/svg/license';
import CertificateIcon from '@assets/svg/certificate';
import ComplaintRequest from '@assets/svg/complaint-request';
import { NTCServices as NTCServicesList } from '@utils/ntc';
import { isMobile, isPad } from '@utils/formatting';
import { disabledColor } from '@styles/color';
import styles from './styles';
import FloatingNote from "@organisms/floating-note";

interface Props {
	navigation: any;
	route: any;
	params: any;
};

// Extracted ServiceItem to prevent re-creation of component type on every parent render.
// This helps React Native's JS thread by avoiding unnecessary unmount/remount of list items.
const ServiceItem = React.memo(({ item, index, navigation, stylesMemo }: any) => {
	const { key, title, logo, data } = item;
	const enabled = data?.length > 0;

	const handlePress = useCallback(() => {
		navigation.navigate('ServicesScreen', { key, services: data });
	}, [navigation, key, data]);

	return (
		<TouchableOpacity
			onPress={handlePress}
			disabled={!enabled}
		>
			<View style={[
				stylesMemo.serviceContainer,
				(
					index === 0 ||
					index === 1 ||
					index === 4 ||
					index === 3
				) && { marginRight: 10 },
				index === 5 && { marginBottom: 15 }
			]}>
				<View style={[
					stylesMemo.serviceView,
					!enabled && { backgroundColor: disabledColor }
				]}>
					{
						!(isMobile && !isPad)
							? key === 'exams'
								? <ExaminationIcon height={RFValue(70 * (isPad ? 0.80 : 1))} width={RFValue(70 * (isPad ? 0.80 : 1))} />
								: key === 'permits'
									? <PermitIcon height={RFValue(67 * (isPad ? 0.80 : 1))} width={RFValue(76 * (isPad ? 0.80 : 1))} />
									: key === 'accreditations'
										? <CertificateIcon height={RFValue(83 * (isPad ? 0.80 : 1))} width={RFValue(75 * (isPad ? 0.80 : 1))} />
										: key === 'licenses'
											? <LicenseIcon height={RFValue(80 * (isPad ? 0.80 : 1))} width={RFValue(78 * (isPad ? 0.80 : 1))} />
											: key === 'certificates'
												? <CertificateIcon height={RFValue(83 * (isPad ? 0.80 : 1))} width={RFValue(75 * (isPad ? 0.80 : 1))} />
												: key === 'complaints-requests'
													? <ComplaintRequest height={RFValue(70 * (isPad ? 0.80 : 1))} width={RFValue(70 * (isPad ? 0.80 : 1))} />
													: <></>
							: <Image
								style={stylesMemo.serviceImage}
								source={logo}
								resizeMode='stretch'
							/>
					}
				</View>
				<Text style={[stylesMemo.serviceText, ((index === 5 && isPad) && { marginTop: 8 })]}>
					{isPad ? title.replace('/', '/\n') : title}
				</Text>
			</View>
		</TouchableOpacity>
	);
});

const Services: FC<Props> = ({ navigation }) => {
	const name = useSelector((state: RootStateOrAny) => {
		return state?.user?.session?.firstName || state?.user?.session?.applicant?.companyName;
	});

	const stylesMemo = useMemo(() => styles, []);

	React.useEffect(() => {
		navigation.setOptions({
			tabBarLabel: ({ color }: any) => (
				<View style={stylesMemo.tabContainer}>
					<RadioTower style={stylesMemo.tabIcon} color={color} size={20} />
					<Text style={[stylesMemo.tabText, { color }]}>Services</Text>
				</View>
			)
		});
	}, [navigation, stylesMemo]);

	const greeting = useMemo(() => {
		const curHr = new Date().getHours();
		if (curHr < 12) return 'Good morning';
		if (curHr < 18) return 'Good afternoon';
		return 'Good evening';
	}, []);

	const [searchValue, setSearchValue] = useState('');

	// Optimized filtering using useMemo to avoid redundant state updates and filtering logic on every render.
	const filteredServices = useMemo(() => {
		if (!searchValue) return NTCServicesList;
		const query = searchValue.toLowerCase();
		return NTCServicesList.filter((item) => item.title.toLowerCase().includes(query));
	}, [searchValue]);

	const renderService = useCallback(({ item, index }: any) => (
		<ServiceItem
			item={item}
			index={index}
			navigation={navigation}
			stylesMemo={stylesMemo}
		/>
	), [navigation, stylesMemo]);

	const keyExtractor = useCallback((_: any, index: number) => `${index}`, []);

	const ListHeader = useCallback(() => (
		<View style={stylesMemo?.headerView}>
			<Text style={stylesMemo?.headerText}>{greeting}, {name}!</Text>
		</View>
	), [greeting, name, stylesMemo]);

	return (
		<>
			{
				!(isMobile && !isPad) &&
				<View style={[stylesMemo.serviceViewContainer, { backgroundColor: '#fff' }]}>
					<Text style={stylesMemo.serviceTitle}>
						Services
					</Text>
					<View style={{ paddingTop: 11, paddingBottom: 22 }}>
						<View>
							<TextInput
								style={stylesMemo.search}
								placeholder='Search'
								placeholderTextColor='#6E7191'
								value={searchValue}
								onChangeText={setSearchValue}
							/>
							<View style={stylesMemo.searchIcon}>
								<SearchIcon />
							</View>
						</View>
					</View>
				</View>
			}
			<FloatingNote />
			<FlatList
				style={{ backgroundColor: '#fff' }}
				contentContainerStyle={{ paddingHorizontal: isPad ? 24 : 0, alignItems: isPad ? 'flex-start' : 'center' }}
				scrollEnabled={true}
				numColumns={3}
				data={filteredServices}
				renderItem={renderService}
				keyExtractor={keyExtractor}
				ListHeaderComponent={ListHeader}
				// Standard FlatList performance props
				initialNumToRender={10}
				maxToRenderPerBatch={10}
				windowSize={5}
			/>
		</>
	);
};

export default React.memo(Services);
