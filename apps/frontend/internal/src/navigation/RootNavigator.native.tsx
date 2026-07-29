import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DashboardScreen } from "../features/dashboard/screens/DashboardScreen";
import { SettingsScreen } from "../features/settings/screens/SettingsScreen";
import { AdminSettingsScreen } from "../features/settings/screens/AdminSettingsScreen";

const MainTabs = createBottomTabNavigator({
  screens: {
    Dashboard: DashboardScreen,
    Settings: SettingsScreen,
  },
});

export const RootStack = createNativeStackNavigator({
  screens: {
    Main: {
      screen: MainTabs,
      options: { headerShown: false },
    },
    AdminSettings: {
      screen: AdminSettingsScreen,
      options: { title: "Admin Settings" },
    },
  },
});
