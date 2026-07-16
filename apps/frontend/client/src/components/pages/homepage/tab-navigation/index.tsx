import React, { useMemo, useState } from 'react'
import { Platform, useWindowDimensions } from 'react-native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { primaryColor } from 'src/styles/color'
import Services from './services'
import Applications from './applications'
import { isMobile, isPad, RNValue as RFValue } from '@utils/formatting'
import { useSelector } from 'react-redux'
import { GUEST_USER } from '@utils/ntc'
import { CustomSidebarMenu } from '@pages/homepage/drawer-navigation/customSidebarMenu'
import styles from '@pages/homepage/tab-navigation/services/styles'

type TapNavScreenList = {
	Services: undefined
	Appications: undefined
}
const Drawer = createDrawerNavigator<TapNavScreenList>()
const Tab = createMaterialTopTabNavigator<TapNavScreenList>()

const COLLAPSED_W = 0	        // collapsed drawer width
const EXPANDED_W = 108        // expanded drawer width (your current)
const EXPANDED_W_MOBILE = RFValue(108 * 0.7)

const TabNavigation = () => {

	const email = useSelector((state: any) => state?.user?.session?.email)
	const tabSwitch = useSelector((state: any) => state.user.tabSwitch)
	const dimensions = useWindowDimensions()

	const tabScreenOptions = useMemo(() => ({
		tabBarActiveTintColor: '#fff',
		tabBarInactiveTintColor: '#435CB7',
		swipeEnabled: true,
		tabBarIndicatorStyle: { backgroundColor: '#2563EB', height: 3 },
		tabBarIndicatorContainerStyle: { backgroundColor: primaryColor },
	}), [])

	const drawerScreenOptions = useMemo(() => {
		const baseWidth = isMobile ? EXPANDED_W_MOBILE : EXPANDED_W
		const width = tabSwitch ? COLLAPSED_W : baseWidth

		return {
			drawerStyle: { width },
			drawerType: (!isMobile || isPad || dimensions.width >= 768) ? 'permanent' : 'front',
			drawerActiveTintColor: primaryColor,
			drawerActiveBackgroundColor: 'rgba(0,0,0,0)',
			headerShown: false,
			// Optional: keep content nicely aligned if you use absolute layouts
			// sceneContainerStyle: { marginLeft: (!isMobile && (isPad || dimensions.width >= 768)) ? width : 0 },
		} as const
	}, [tabSwitch, dimensions.width])

	if (isMobile && !Platform?.isPad) {
		return (
			<Tab.Navigator
				style={Platform.select({ web: { marginTop: 20 } })}
				screenOptions={tabScreenOptions}
			>
				<Tab.Screen name='Services' component={Services} />
				{email !== GUEST_USER?.email && (
					<Tab.Screen name='Applications' component={Applications} />
				)}
			</Tab.Navigator>
		)
	}

	return (
		<Drawer.Navigator
			initialRouteName='Services'
			screenOptions={drawerScreenOptions}
			backBehavior='none'
			// Pass collapsed + onToggle to your drawer content
			drawerContent={(props) => (
				<CustomSidebarMenu
					{...props}
					collapsed={tabSwitch}
				/>
			)}
		>
			<Drawer.Screen
				name='Services'
				component={Services}
				options={{ drawerLabel: tabSwitch ? "" : 'Services', headerShown: false }}
			/>
			{email !== GUEST_USER?.email && (
				<Drawer.Screen
					name='Applications'
					component={Applications}
					options={{ drawerLabel:tabSwitch ? "" : 'My \nApplications', headerShown: false }}
				/>
			)}
		</Drawer.Navigator>
	)
}

export default React.memo(TabNavigation)
